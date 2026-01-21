import os
import pandas as pd
import polars as pl
from sqlalchemy import text
from fredapi import Fred
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class FREDProvider:
    """
    Handles fetching economic data from FRED (Federal Reserve Economic Data)
    and caching it in a PostgreSQL database.
    """
    def __init__(self, engine):
        """
        Initializes the FREDProvider with a database engine.

        Args:
            engine: A SQLAlchemy engine instance for database connectivity.
        """
        self.fred = Fred(api_key=os.getenv('FRED_API_KEY'))
        self.engine = engine
        self.series_ids = {
            'FED_FUNDS_RATE': 'FEDFUNDS',
            'CPI': 'CPIAUCSL',
            'GDP': 'GDP',
            'UNEMPLOYMENT': 'UNRATE',
            'VIX': 'VIXCLS'
        }
        self.table_name = "fred_economic_data"

    def _fetch_from_db(self):
        """Tries to fetch recent data from the database cache."""
        try:
            with self.engine.connect() as connection:
                # Check for data from the last day
                query = text(f"""
                    SELECT * FROM {self.table_name}
                    WHERE timestamp >= NOW() - INTERVAL '1 day'
                    ORDER BY timestamp DESC
                    LIMIT 1;
                """)
                df = pd.read_sql(query, connection)
                if not df.empty:
                    print("--- FRED data found in DB cache. ---")
                    return pl.from_pandas(df)
        except Exception as e:
            # This is expected if the table doesn't exist yet
            print(f"--- DB cache read for FRED failed or table doesn't exist: {e} ---")
        return None

    def _fetch_from_api(self):
        """Fetches the latest data point for each series from the FRED API."""
        print("--- Fetching fresh FRED data from API... ---")
        data = {}
        for name, series_id in self.series_ids.items():
            try:
                series_data = self.fred.get_series_latest_release(series_id)
                if not series_data.empty:
                    data[name] = [series_data.iloc[-1]]
            except Exception as e:
                print(f"--- WARNING: Could not fetch FRED series '{name}' ({series_id}). Error: {e} ---")
                data[name] = [0.0] # Use a default value on failure
        return pd.DataFrame(data)

    def _write_to_db(self, df: pd.DataFrame):
        """Writes a new data row to the database cache."""
        try:
            with self.engine.connect() as connection:
                df.to_sql(self.table_name, connection, if_exists='append', index=False)
                print("--- FRED data written to DB cache. ---")
        except Exception as e:
            print(f"--- DB cache write for FRED failed: {e} ---")

    def fetch_data(self) -> pl.DataFrame | None:
        """
        Main method to fetch FRED data. Tries the DB cache first, then falls
        back to the API and updates the cache.
        """
        # 1. Try fetching from the database
        cached_data = self._fetch_from_db()
        if cached_data is not None:
            return cached_data

        # 2. If cache is empty or stale, fetch from API
        api_df = self._fetch_from_api()
        if api_df.empty:
            return None

        # 3. Add a timestamp and write to the database
        api_df['timestamp'] = pd.to_datetime('now', utc=True)
        self._write_to_db(api_df)

        # 4. Return as a Polars DataFrame
        return pl.from_pandas(api_df)