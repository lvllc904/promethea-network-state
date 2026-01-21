import asyncio
import polars as pl
import logging
from sqlalchemy.orm import Session
from typing import List

from .database import TradableAsset, AssetClass
from .data_providers import AlpacaProvider

class ScannerService:
    """
    The agent's "attention mechanism." This service scans the universe of tradable
    assets and identifies a small, focused list of "interesting" assets for the
    agent to observe, based on dynamic criteria like volatility.
    """
    def __init__(self, db_session: Session, market_provider: AlpacaProvider):
        self.db = db_session
        self.market_provider = market_provider
        logging.info("ScannerService initialized.")

    async def find_most_volatile_asset(self, top_n: int = 50, lookback_days: int = 7) -> str | None:
        """
        Finds the most volatile asset from a sample of the tradable universe.

        Args:
            top_n (int): The number of assets to sample for the volatility scan.
                         Scanning all 12,000+ is too slow for a real-time cycle.
            lookback_days (int): The period over which to calculate volatility.

        Returns:
            The symbol of the most volatile asset, or a default if none are found.
        """
        logging.info(f"--- Running Volatility Scan on top {top_n} assets ---")
        try:
            # 1. Get a sample of assets from our master database table.
            # We'll focus on crypto for now as it's generally more volatile.
            assets_to_scan: List[TradableAsset] = (
                self.db.query(TradableAsset)
                .filter(TradableAsset.asset_class == AssetClass.CRYPTO)
                .limit(top_n)
                .all()
            )

            if not assets_to_scan:
                logging.warning("No assets found in the database to scan. Falling back to default.")
                return "bitcoin" # Fallback default

            # 2. Fetch historical data for all sampled assets concurrently.
            tasks = [
                self.market_provider.fetch_data(asset.symbol, days=lookback_days, interval='daily')
                for asset in assets_to_scan
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # 3. Calculate volatility for each asset.
            volatility_scores = {}
            for i, asset in enumerate(assets_to_scan):
                df = results[i]
                if isinstance(df, pl.DataFrame) and not df.is_empty() and 'price' in df.columns:
                    # Calculate log returns and then the standard deviation (volatility)
                    volatility = df.get_column('price').log().diff().std() * (365**0.5)  # Annualized
                    if volatility is not None:
                        volatility_scores[asset.symbol] = volatility

            if not volatility_scores:
                logging.warning("Could not calculate volatility for any scanned assets. Falling back to default.")
                return "bitcoin" # Fallback default

            # 4. Identify and return the asset with the highest volatility.
            most_volatile_asset = max(volatility_scores, key=volatility_scores.get)
            logging.info(f"✅ Scan complete. Most volatile asset: {most_volatile_asset} (Score: {volatility_scores[most_volatile_asset]:.2f})")
            return most_volatile_asset

        except Exception as e:
            logging.error(f"--- ERROR during asset scan: {e}. Falling back to default asset. ---")
            return "bitcoin" # Fallback default