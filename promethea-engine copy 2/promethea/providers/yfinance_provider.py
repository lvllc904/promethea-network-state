import yfinance as yf
import polars as pl
import datetime

class YFinanceProvider:
    """
    A data provider that fetches historical market data from Yahoo Finance.
    This is used as a secondary provider for assets not available on the primary
    market data provider (e.g., Alpaca) or for fetching general market indices.
    """

    async def fetch_data(self, ticker: str, days: int = 90, interval: str = 'daily', retry: int = 3) -> pl.DataFrame:
        """
        Fetches historical data for a given ticker symbol.

        Args:
            ticker: The ticker symbol to fetch (e.g., 'SPY', '^VIX').
            days: The number of past days of data to retrieve.

        Returns:
            A Polars DataFrame with 'timestamp' and 'price' columns, or an
            empty DataFrame if the fetch fails.
        """
        print(f"--- YFinance Sensor: Updating cache for {ticker}... ---")
        print("--- (Initial full fetch) ---")
        try:
            end_date = datetime.date.today()
            start_date = end_date - datetime.timedelta(days=days)
            
            # Use group_by='ticker' to ensure consistent column structure when downloading
            data = yf.download(ticker, start=start_date, end=end_date, progress=False, group_by='ticker')

            if data.empty:
                return pl.DataFrame()

            df_pd = data.reset_index()
            
            # CRITICAL FIX: Flatten multi-level columns into simple strings before processing.
            # e.g., ('Date', '') becomes 'Date' and ('Adj Close', 'SPY') becomes 'Adj Close_SPY'
            df_pd.columns = ['_'.join(map(str, col)).strip('_') if isinstance(col, tuple) else col for col in df_pd.columns]

            # Now that columns are simple strings, find the date and price columns robustly.
            date_col = next((col for col in df_pd.columns if 'date' in col.lower()), df_pd.columns[0])
            price_col = next((col for col in df_pd.columns if 'adj close' in col.lower() or 'close' in col.lower()), 'Close')
            
            df_pl = pl.from_pandas(df_pd)
            df_pl = df_pl.rename({date_col: "timestamp", price_col: "price"})
            return df_pl.select(["timestamp", "price"])

        except Exception as e:
            print(f"--- YFinanceProvider failed for {ticker}: {e} ---")
            return pl.DataFrame()

    async def fetch_liquidity_data(self, asset_id: str) -> dict:
        """
        Fetches liquidity data. YFinance doesn't provide easy real-time bid/ask 
        without premium or complex parsing, so we return a default spread.
        """
        return {"bid_ask_spread": 0.001}
