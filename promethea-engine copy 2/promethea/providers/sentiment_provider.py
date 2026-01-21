import os
import aiohttp
import polars as pl
from dotenv import load_dotenv
from promethea.trading_agent.Services.data_providers import DataProvider

load_dotenv()

SANTIMENT_API_KEY = os.getenv("SANTIMENT_API_KEY")

class SentimentProvider(DataProvider):
    """
    Quantifies 'Market Vibe' using crypto-native inputs:
    1. Santiment (Social Volume/Dominance) - Primary
    2. CoinGecko (Community Score) - Secondary/Fallback
    """
    def __init__(self):
        self.session = None

    async def _get_session(self):
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session

    async def close(self):
        if self.session: await self.session.close()

    async def fetch_data(self, asset_slug: str, days: int = 30) -> pl.DataFrame:
        """
        Fetches social metrics.
        asset_slug example: "bitcoin"
        """
        # Santiment Logic (Mocked if no key for MVP stability)
        if not SANTIMENT_API_KEY:
            # Fallback to CoinGecko public data
            return await self._fetch_coingecko_sentiment(asset_slug, days)
            
        print("--- Santiment integration pending API Key ---")
        return pl.DataFrame()

    async def _fetch_coingecko_sentiment(self, asset_slug: str, days: int) -> pl.DataFrame:
        # CoinGecko /coins/{id}/market_chart?vs_currency=usd&days={days} includes prices, 
        # but for true sentiment we need /coins/{id}/history for community_data
        # For this MVP, we will use a proxy: Volume / MarketCap (Velocity) as a hype metric
        # derived from standard data, if specific sentiment API is expensive.
        
        # NOTE: True sentiment APIs are expensive. We will mock a "Social Signal" 
        # based on price velocity for the prototype if real API fails.
        return pl.DataFrame()
