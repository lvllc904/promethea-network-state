import os
import aiohttp
import asyncio
import polars as pl
from dotenv import load_dotenv
from promethea.trading_agent.Services.data_providers import DataProvider

load_dotenv()

COINBASE_API_KEY = os.getenv("COINBASE_API_KEY")
BINANCE_API_KEY = os.getenv("BINANCE_API_KEY")

class CEXProvider(DataProvider):
    """
    Aggregates market data from major Centralized Exchanges (Coinbase, Binance).
    Prioritizes Coinbase for regulated US liquidity, Binance for global depth.
    """
    def __init__(self):
        self.session = None

    async def _get_session(self):
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session

    async def close(self):
        if self.session: await self.session.close()

    async def fetch_data(self, product_id: str, days: int = 30) -> pl.DataFrame:
        """
        Fetches OHLCV data.
        product_id example: "BTC-USD"
        """
        # Default to Coinbase for now as primary CEX source
        return await self._fetch_coinbase(product_id, days)

    async def _fetch_coinbase(self, product_id: str, days: int) -> pl.DataFrame:
        url = f"https://api.exchange.coinbase.com/products/{product_id}/candles"
        # Coinbase granularity: 86400 = 1 day
        params = {"granularity": 86400}
        
        try:
            session = await self._get_session()
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    print(f"--- WARNING: Coinbase fetch failed: {response.status} ---")
                    return pl.DataFrame()
                    
                data = await response.json()
                
            # Coinbase returns: [time, low, high, open, close, volume]
            if not data: return pl.DataFrame()
            
            df = pl.DataFrame(data, schema=["timestamp", "low", "high", "open", "close", "volume"], orient="row")
            
            # Normalize to standard schema
            return df.select([
                pl.col("timestamp").alias("timestamp"),
                pl.col("open"),
                pl.col("high"),
                pl.col("low"),
                pl.col("close").alias("price"), 
                pl.col("volume")
            ]).with_columns(
                (pl.col("timestamp")).cast(pl.Datetime).alias("datetime")
            ).sort("timestamp")

        except Exception as e:
            print(f"--- ERROR: Coinbase fetch failed: {e} ---")
            return pl.DataFrame()
