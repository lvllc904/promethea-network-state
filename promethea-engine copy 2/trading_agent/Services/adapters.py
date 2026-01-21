# /Users/officeone/promethea-engine/trading_agent/Services/adapters.py

import yfinance as yf
import pandas as pd

class EquityAdapter:
    """
    An adapter specifically for fetching and processing equity data from Yahoo Finance.
    Its job is to return a clean, standardized DataFrame that can be saved
    directly into our 'market_data' database table.
    """

    def fetch_and_process_data(self, ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
        """
        Fetches historical data for a given stock ticker and calculates technical indicators.
        """
        print(f"Fetching data for {ticker} from {start_date} to {end_date}...")
        try:
            # 1. Fetch raw OHLCV data from Yahoo Finance.
            # We set group_by='ticker' to get a consistent format, even for a single ticker.
            df = yf.download(ticker, start=start_date, end=end_date, progress=False, group_by='ticker')
            if df.empty:
                print(f"Warning: No data found for {ticker}.")
                return pd.DataFrame()

            # 2. --- THE FINAL, PERFECTED DATA JANITOR STEP ---
            # When downloading a single ticker with group_by='ticker', yfinance creates a
            # MultiIndex like ('SPY', 'Open'). We need the second part of the tuple.
            # This handles all cases gracefully.
            if isinstance(df.columns, pd.MultiIndex):
                # If it's a MultiIndex, take the second level and make it lowercase.
                df.columns = [col[1].lower() for col in df.columns]
            else:
                # If it's a regular Index, just make it lowercase.
                df.columns = [col.lower() for col in df.columns]


            print(f"Successfully fetched and processed {len(df)} rows for {ticker}.")

            # 4. Standardize and Format the DataFrame for our database.
            
            # The column is 'adj close' with a space, so we rename it.
            if 'adj close' in df.columns:
                df.rename(columns={'adj close': 'adj_close'}, inplace=True)
            
            # Build the list of columns to keep dynamically.
            base_cols = ['open', 'high', 'low', 'close', 'volume']
            if 'adj_close' in df.columns:
                base_cols.append('adj_close')
            df_processed = df[base_cols]

            # Use 'melt' to transform the DataFrame from wide to long format.
            df_long = df_processed.reset_index().melt(
                id_vars=['Date'],
                var_name='metric_name',
                value_name='metric_value'
            )

            df_long.rename(columns={'Date': 'timestamp'}, inplace=True)
            df_long['source'] = 'yfinance'
            
            return df_long

        except Exception as e:
            print(f"An error occurred while fetching data for {ticker}: {e}")
            return pd.DataFrame()
