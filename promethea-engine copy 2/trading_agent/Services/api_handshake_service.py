import asyncio
import pandas as pd
import logging
import polars as pl
from alpaca.data.historical import CryptoHistoricalDataClient, StockHistoricalDataClient
from alpaca.data.requests import CryptoBarsRequest, StockBarsRequest, CryptoLatestQuoteRequest, StockLatestQuoteRequest
from alpaca.data.timeframe import TimeFrame
from alpaca.trading.client import TradingClient
from alpaca.trading.enums import AssetClass, AssetStatus
from alpaca.trading.requests import GetAssetsRequest


class ApiHandshakeService:
    """
    Handles the "rules of engagement" for external APIs.
    It dynamically learns API rules, such as asset classes and valid ticker symbols,
    to ensure all requests are compliant and successful.
    """
    def __init__(self, stock_client: StockHistoricalDataClient, crypto_client: CryptoHistoricalDataClient, trading_client: TradingClient):
        self.stock_client = stock_client
        self.crypto_client = crypto_client
        self.trading_client = trading_client
        self.alpaca_rules = {"max_bars_per_request": 1000}
        
        self.asset_info_map = {}
        self._is_initialized = False
        print("API Handshake Service created. Awaiting initialization.")

    async def initialize(self):
        """
        Performs the "handshake" by querying the API to learn the "rules of engagement".
        """
        if self._is_initialized:
            return
            
        print("--- Performing API Handshake with Alpaca ---")
        try:
            search_params_equity = GetAssetsRequest(status=AssetStatus.ACTIVE, asset_class=AssetClass.US_EQUITY)
            us_equity_assets = self.trading_client.get_all_assets(search_params_equity)
            
            search_params_crypto = GetAssetsRequest(status=AssetStatus.ACTIVE, asset_class=AssetClass.CRYPTO)
            crypto_assets = self.trading_client.get_all_assets(search_params_crypto)
            
            all_assets = us_equity_assets + crypto_assets
            
            for asset in all_assets:
                # Use a cleaner key for lookup
                clean_name = asset.name.split('/')[0].strip().lower().replace(" ", "")
                if not clean_name:
                    clean_name = asset.symbol.lower()

                self.asset_info_map[clean_name] = {
                    "symbol": asset.symbol,
                    "class": asset.asset_class,
                    "name": asset.name
                }
            
            self._is_initialized = True
            print(f"✅ Handshake complete. Discovered {len(self.asset_info_map)} tradable assets.")
        except Exception as e:
            print(f"--- FATAL: API Handshake failed. Could not retrieve asset list. Error: {e} ---")
            self._is_initialized = False


    async def get_historical_bars(self, asset_id: str, days: int) -> pl.DataFrame:
        """
        Fetches historical data bars, handling pagination and API symbol formatting.
        """
        if not self._is_initialized:
            await self.initialize()

        print(f"Handshake Service: Received request for {days} days of {asset_id}.")
        
        asset_key = asset_id.lower().replace(" ", "")
        asset_info = self.asset_info_map.get(asset_key)
        
        if not asset_info:
            # Fallback to search by symbol if name lookup fails
            asset_info = next((info for info in self.asset_info_map.values() if info['symbol'].lower() == asset_key), None)
            if not asset_info:
                print(f"--- Available asset names discovered (sample): {list(self.asset_info_map.keys())[:10]} ---")
                raise ValueError(f"Asset ID '{asset_id}' not supported by Alpaca (name/symbol not found in handshake).")

        symbol = asset_info["symbol"]
        asset_class = asset_info["class"]
        
        limit = self.alpaca_rules['max_bars_per_request']
        all_bars = []
        end_date = pd.Timestamp.now(tz='UTC')
        
        while days > 0:
            chunk_days = min(days, limit)
            start_date = end_date - pd.Timedelta(days=chunk_days)
            
            # For historical bars, the API requires the original symbol (e.g., "BTC/USDT")
            api_symbol = symbol 
            
            print(f"  - Fetching a {chunk_days}-day chunk for {symbol} (using API symbol: {api_symbol})...")

            try:
                if asset_class == AssetClass.CRYPTO:
                    request_params = CryptoBarsRequest(
                        symbol_or_symbols=[api_symbol],
                        timeframe=TimeFrame.Day,
                        start=start_date.isoformat(), 
                        end=end_date.isoformat()
                    )
                    bars = self.crypto_client.get_crypto_bars(request_params)
                else: # Assumes AssetClass.US_EQUITY
                    request_params = StockBarsRequest(
                        symbol_or_symbols=[api_symbol],
                        timeframe=TimeFrame.Day,
                        start=start_date.isoformat(), 
                        end=end_date.isoformat()
                    )
                    bars = self.stock_client.get_stock_bars(request_params)

                if bars and not bars.df.empty:
                    # Alpaca returns a multi-index DataFrame; reset it to get 'symbol' and 'timestamp' as columns
                    chunk_df = bars.df.reset_index()
                    chunk_pl = pl.from_pandas(chunk_df)
                    all_bars.append(chunk_pl)
            
            except Exception as e:
                logging.warning(f"Could not fetch bar data for {symbol}. Error: {e}")
                break

            end_date = start_date - pd.Timedelta(microseconds=1)
            days -= chunk_days
            await asyncio.sleep(0.5)

        if not all_bars:
            return pl.DataFrame()
            
        full_df_pl = pl.concat(all_bars)
        return full_df_pl.unique(subset=['timestamp'], keep='first').sort('timestamp')


    async def get_latest_quote(self, asset_id: str):
        """
        Fetches the latest bid/ask quote for a given asset.
        """
        if not self._is_initialized:
            await self.initialize()

        asset_key = asset_id.lower().replace(" ", "")
        asset_info = self.asset_info_map.get(asset_key)
        if not asset_info:
            asset_info = next((info for info in self.asset_info_map.values() if info['symbol'].lower() == asset_key), None)
        if not asset_info:
            raise ValueError(f"Asset '{asset_id}' not found in Alpaca asset map for quote.")

        symbol = asset_info["symbol"]
        asset_class = asset_info["class"]

        try:
            # The API requires the original symbol WITH the slash for all crypto calls
            api_symbol = symbol

            if asset_class == AssetClass.CRYPTO:
                request_params = CryptoLatestQuoteRequest(symbol_or_symbols=[api_symbol])
                latest_quote = self.crypto_client.get_crypto_latest_quote(request_params)
                # The returned dictionary uses the original symbol with the slash as the key
                return latest_quote.get(symbol)

            else: # Assumes AssetClass.US_EQUITY
                request_params = StockLatestQuoteRequest(symbol_or_symbols=[api_symbol])
                latest_quote = self.stock_client.get_stock_latest_quote(request_params)
                return latest_quote.get(symbol)
        except Exception as e:
            logging.error(f"Failed to get latest quote for {symbol}: {e}")
            return None