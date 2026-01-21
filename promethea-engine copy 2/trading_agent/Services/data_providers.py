import os
import time
import polars as pl
import asyncio
import aiohttp
import feedparser
from abc import ABC, abstractmethod
from pytrends.request import TrendReq
from fredapi import Fred
from alpaca.data.historical import CryptoHistoricalDataClient, StockHistoricalDataClient
from alpaca.data.requests import CryptoLatestQuoteRequest, StockLatestQuoteRequest
from alpaca.trading.client import TradingClient
from alpaca.trading.enums import AssetClass
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import Dict, Any

# Import our new database components and the specialist handshake service
from .database import SessionLocal, TradableAsset, EconomicIndicator
from .api_handshake_service import ApiHandshakeService

# --- KEY MANAGEMENT ---
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DOTENV_PATH = PROJECT_ROOT / ".env"
if DOTENV_PATH.exists():
    load_dotenv(dotenv_path=DOTENV_PATH)

FRED_API_KEY = os.getenv("FRED_API_KEY")
APCA_API_KEY_ID = os.getenv("APCA_API_KEY_ID")
APCA_API_SECRET_KEY = os.getenv("APCA_API_SECRET_KEY")


class DataProvider(ABC):
    """
    An abstract base class that defines the standard interface for all data providers.
    This ensures that any provider we create (for Alpaca, FRED, etc.) can be used
    interchangeably by the DataService, promoting a modular and scalable architecture.
    """
    @abstractmethod
    async def fetch_data(self, *args, **kwargs):
        """
        The generic method that each provider must implement to fetch its specific data.
        The flexible signature allows for different types of arguments (e.g., asset_id, days)
        depending on the provider's needs.
        """
        pass

class AlpacaProvider(DataProvider):
    """
    The primary provider for all market data, covering both stocks and cryptocurrencies.
    This class has been upgraded to be "cache-aware." It intelligently loads its master
    list of tradable assets (the "phonebook") from our local database first, only
    performing the expensive API handshake process when the cache is empty or stale.
    This dramatically improves startup time and resilience.
    """
    def __init__(self, paper_trading: bool = True):
        if not APCA_API_KEY_ID or not APCA_API_SECRET_KEY:
            raise ValueError("Alpaca API keys not found in .env file.")
        
        # Instantiate the low-level clients needed to communicate with the Alpaca API.
        crypto_client = CryptoHistoricalDataClient()
        stock_client = StockHistoricalDataClient(APCA_API_KEY_ID, APCA_API_SECRET_KEY)
        self.trading_client = TradingClient(APCA_API_KEY_ID, APCA_API_SECRET_KEY, paper=paper_trading)

        # The provider now "employs" our specialist service, giving it the tools it needs.
        self.handshake_service = ApiHandshakeService(stock_client, crypto_client, self.trading_client)

        # --- Smart Cache for Rolling Data ---
        self._cache: dict[str, tuple[pl.DataFrame, float]] = {}
        self._update_interval = 3600  # 1 hour

    async def fetch_data(self, asset_id: str, days: int, interval: str, retry: int = 3) -> pl.DataFrame:
        """
        Fetches historical price and volume data for a given asset. It delegates
        the API calls to the handshake_service but manages a rolling cache to
        minimize redundant data fetching.
        MODIFICATION: Returns a Polars DataFrame.
        """
        current_time = time.time()

        # Check if cache is fresh
        if asset_id in self._cache:
            cached_df, last_check = self._cache[asset_id]
            if current_time - last_check < self._update_interval:
                return cached_df

        # Determine the number of days to fetch
        days_to_fetch = days
        if asset_id in self._cache:
            # Surgical Update: Calculate days needed since last data point
            cached_df, _ = self._cache[asset_id]
            last_cached_date = cached_df['timestamp'].max().date()
            days_to_fetch = (datetime.now().date() - last_cached_date).days + 1 # +1 to be safe
            print(f"--- Alpaca Sensor: Updating cache for {asset_id} with {days_to_fetch} day(s) of new data. ---")
        else:
            print(f"--- Alpaca Sensor: Performing initial full fetch for {asset_id}. ---")

        # Fetch new data (either full or surgical)
        new_data_pl = await self.handshake_service.get_historical_bars(asset_id, days_to_fetch)

        # Merge with cache if it exists
        if asset_id in self._cache and not new_data_pl.is_empty():
            cached_df, _ = self._cache[asset_id]
            combined_df = pl.concat([cached_df, new_data_pl]).unique(subset=['timestamp'], keep='last').sort('timestamp')
            # Trim to maintain the rolling window
            df_pl = combined_df.tail(days)
        else:
            df_pl = new_data_pl

        # Check if the DataFrame is empty BEFORE trying to select columns
        if df_pl.is_empty():
            print(f"--- WARNING: No historical data returned for {asset_id}. Returning empty DataFrame. ---")
            return pl.DataFrame()

        # Update the cache
        self._cache[asset_id] = (df_pl, current_time)

        # Standardize column names and select the ones we need.
        # Polars' `select` and `rename` are highly optimized.
        try:
            print(f"DEBUG: df_pl type: {type(df_pl)}")
            print(f"DEBUG: df_pl columns: {df_pl.columns}")
            return df_pl.select(pl.col("timestamp"), pl.col("close").alias("price"), pl.col("volume"))
        except Exception as e:
            if retry > 0:
                print(f"Error selecting columns, retrying {retry} more times. Error: {e}")
                await asyncio.sleep(1)  # Wait before retrying
                return await self.fetch_data(asset_id, days, interval, retry - 1)
            else:
                # If all retries fail, return an empty DataFrame to prevent crashes
                print(f"--- ERROR: Column selection failed for {asset_id} after multiple retries. ---")
                return pl.DataFrame()

    async def fetch_liquidity_data(self, asset_id: str) -> dict:
        """
        Fetches real-time liquidity data, such as the bid-ask spread. This method
        relies on the asset map discovered by the handshake service to use the correct
        API endpoints and symbol formats for different asset classes (stocks vs. crypto).
        """
        # Delegate the entire logic to the authoritative method in the handshake service.
        # This centralizes the logic and resolves the client/method mismatch permanently.
        try:
            quote = await self.handshake_service.get_latest_quote(asset_id)
        except Exception as e:
            print(f"--- WARNING: Could not fetch latest quote for {asset_id}. Error: {e!r} ---")
            return {"bid_ask_spread": 0.001} # Return a default on failure
            
        if not quote: return {"bid_ask_spread": 0.001}
        
        best_bid, best_ask = quote.bid_price, quote.ask_price
        # Calculate the spread as a percentage, a more useful normalized metric.
        if best_ask > 0 and best_bid > 0:
            spread_percentage = (best_ask - best_bid) / best_ask
        else:
            spread_percentage = 0.001 # A reasonable default for low-liquidity moments
        return {"bid_ask_spread": spread_percentage}


class FREDProvider(DataProvider):
    """
    Data provider for FRED. It now uses an intelligent, persistent cache,
    reading from the database first and only calling the API for "stale" data.
    This makes the service dramatically faster and more resilient, and avoids
    hitting the API's rate limits.
    """
    def __init__(self):
        if not FRED_API_KEY:
            raise ValueError("FRED_API_KEY not found. Ensure it's set in your .env file.")
        self.fred = Fred(api_key=FRED_API_KEY)
        # This defines the "shopping list" of economic indicators we care about.
        self.series_ids = {
            'FED_FUNDS_RATE': 'FEDFUNDS', 'CPI': 'CPIAUCSL', 'GDP': 'GDP',
            'UNEMPLOYMENT': 'UNRATE', 'VIX': 'VIXCLS'
        }

    async def fetch_data(self) -> pl.DataFrame:
        """
        Fetches the latest macro data, prioritizing our local database cache. For each
        indicator, it checks if the locally stored value is "stale" based on its
        known update interval. If and only if the data is stale, it makes a targeted
        API call to update that single indicator.
        MODIFICATION: Returns a single-row Polars DataFrame.
        """
        db: Session = SessionLocal()
        latest_values = {}
        try:
            print("--- Fetching Economic Indicators (from DB cache first) ---")
            for indicator_name, series_id in self.series_ids.items():
                indicator = db.query(EconomicIndicator).filter_by(indicator_name=indicator_name).first()

                # The core of the intelligent caching logic.
                is_stale = not indicator or (datetime.now(timezone.utc) - indicator.last_updated) > timedelta(hours=indicator.update_interval_hours)
                
                if is_stale:
                    print(f"  - Cache MISS for '{indicator_name}'. Data is stale or missing. Fetching from API...")
                    loop = asyncio.get_running_loop()
                    try:
                        series_data = await loop.run_in_executor(None, lambda: self.fred.get_series(series_id))
                        new_value = series_data.iloc[-1].item()
                        
                        if indicator:
                            indicator.value = new_value
                            indicator.last_updated = datetime.now(timezone.utc)
                        else:
                            indicator = EconomicIndicator(indicator_name=indicator_name, value=new_value)
                            db.add(indicator)
                        db.commit()
                        latest_values[indicator_name] = new_value
                    except Exception as api_error:
                        print(f"  - FAILED to fetch fresh data for '{indicator_name}'. Error: {api_error}. Using last known value if available.")
                        if indicator:
                            latest_values[indicator_name] = indicator.value # Fallback to stale data
                        else:
                            latest_values[indicator_name] = 0 # Fallback to zero if never fetched
                else:
                    print(f"  - Cache HIT for '{indicator_name}'. Loading fresh data from database.")
                    latest_values[indicator_name] = indicator.value
            print("✅ Economic data successfully loaded.")
            # Convert the dictionary of latest values into a single-row Polars DataFrame.
            return pl.DataFrame([latest_values])
        finally:
            db.close()