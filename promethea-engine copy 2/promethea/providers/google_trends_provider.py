import pandas as pd
from pytrends.request import TrendReq
import time as time_module
from typing import Tuple, Optional


class GoogleTrendsProvider:
    """
    Fetches interest-over-time data from Google Trends and calculates the
    search trend velocity (g_dot_t) as defined in the roadmap.

    This provider is designed to be used within the agent's data gathering
    process to capture the acceleration of public interest in an asset.
    """

    def __init__(self):
        """
        Initializes the provider by establishing a connection to Google Trends.
        """
        # hl='en-US' for English, tz=360 for US Central Time (in minutes)
        self.pytrends = TrendReq(hl='en-US', tz=360)
        # --- Smart Cache ---
        # Stores: {asset: (acceleration, trend_dataframe, last_check_timestamp)}
        self._cache: dict[str, Tuple[float, Optional[pd.DataFrame], float]] = {}
        self._update_interval = 900  # 15 minutes
        self._rolling_window_days = 30  # Maintain a 30-day rolling window
        self._backoff_multiplier = 1 # For exponential backoff on failure

    def get_search_trend_acceleration(self, asset_symbol: str, timeframe: str = 'today 1-m') -> float:
        """
        Fetches Google Trends data for a given asset and calculates the
        acceleration of the search interest.

        The acceleration is the second derivative of the trend data, which
        indicates how fast the trend's velocity is changing.

        Args:
            asset_symbol: The keyword to search for (e.g., 'Bitcoin', 'AAPL').
            timeframe: The time range for the trend data. Defaults to 'today 1-m'
                       (last month). See pytrends docs for more options.

        Returns:
            A float representing the acceleration of the search trend.
            Returns 0.0 if data is insufficient to calculate.
        """
        # --- Smart Update Logic ---
        self._update_cache_if_stale(asset_symbol, timeframe) # This now uses time_module

        # Return the latest calculated acceleration from the cache
        if asset_symbol in self._cache:
            return self._cache[asset_symbol][0]
        
        return 0.0

    def _calculate_acceleration_from_df(self, df: pd.DataFrame, asset_symbol: str) -> float:
        """Calculates acceleration from a given DataFrame."""
        if df is None or df.empty or len(df) < 3:
            return 0.0
        try:
            # Extract the series for the asset. The column name is the asset symbol.
            trend_series = df[asset_symbol]
            
            # 1. Smooth the data with a 3-period rolling mean to reduce noise.
            # This helps in getting a more stable derivative.
            smoothed_series = trend_series.rolling(window=3, min_periods=1).mean()
            
            # 2. Calculate the first derivative (velocity)
            velocity = smoothed_series.diff()
            
            # 3. Calculate the second derivative (acceleration)
            acceleration = velocity.diff()
            
            # 4. Get the most recent acceleration value.
            # After two .diff() calls, the first two values will be NaN.
            # We drop them to get the latest valid number.
            latest_acceleration = acceleration.dropna().iloc[-1] if not acceleration.dropna().empty else 0.0
            
            # The vector g_dot_t as per the roadmap
            g_dot_t = float(latest_acceleration)
            
            return g_dot_t
        except Exception as e:
            print(f"--- Error during acceleration calculation: {e} ---")
            return 0.0

    def _update_cache_if_stale(self, asset_symbol: str, timeframe: str):
        """Handles the logic for updating the cache for a given asset."""
        current_time = time_module.time()
        
        # Check if cache exists and is fresh
        if asset_symbol in self._cache:
            _, _, last_check = self._cache[asset_symbol]
            if current_time - last_check < self._update_interval:
                return  # Cache is fresh, do nothing

        print(f"--- Google Trends Sensor: Updating cache for {asset_symbol}... ---")

        try:
            # If cache is empty, perform a full fetch
            if asset_symbol not in self._cache:
                print("--- (Initial full fetch) ---")
                self.pytrends.build_payload([asset_symbol], cat=0, timeframe=timeframe, geo='', gprop='')
                full_df = self.pytrends.interest_over_time()
                
                if not full_df.empty:
                    acceleration = self._calculate_acceleration_from_df(full_df, asset_symbol)
                    self._cache[asset_symbol] = (acceleration, full_df, current_time)
                return

            # --- Surgical Update Logic ---
            # 1. Get existing data from cache
            cached_accel, cached_df, _ = self._cache[asset_symbol]

            # 2. Lightweight Poll: Fetch only the last few days of data
            self.pytrends.build_payload([asset_symbol], cat=0, timeframe='now 7-d', geo='', gprop='')
            lightweight_df = self.pytrends.interest_over_time()

            if not lightweight_df.empty:
                # 3. Merge and Deduplicate
                combined_df = pd.concat([cached_df, lightweight_df])
                # Drop duplicates, keeping the newest entry for each timestamp
                combined_df = combined_df[~combined_df.index.duplicated(keep='last')]
                combined_df.sort_index(inplace=True)

                # 4. Trim to maintain the rolling window
                cutoff_date = combined_df.index.max() - pd.Timedelta(days=self._rolling_window_days)
                updated_df = combined_df[combined_df.index >= cutoff_date]

                # 5. Recalculate and update cache
                new_acceleration = self._calculate_acceleration_from_df(updated_df, asset_symbol)
                self._cache[asset_symbol] = (new_acceleration, updated_df, current_time)
                print("--- (Surgical update complete) ---")
            else:
                # If lightweight poll fails, just update the timestamp to avoid retrying immediately
                self._cache[asset_symbol] = (cached_accel, cached_df, current_time)

        except Exception as e:
            print(f"--- Google Trends Sensor: Update failed: {e}. Applying exponential backoff. ---")
            # On failure, increase the backoff period before the next check
            self._update_interval *= 2 
            self._backoff_multiplier += 1
            print(f"--- New Google Trends check interval: {self._update_interval} seconds ---")
            # Still update the timestamp to enforce the new, longer interval
            if asset_symbol in self._cache:
                accel, df, _ = self._cache[asset_symbol]
                self._cache[asset_symbol] = (accel, df, current_time)