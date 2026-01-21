import asyncio
import numpy as np
import os
import joblib
import polars as pl
from functools import partial
from polars.exceptions import ColumnNotFoundError
from pathlib import Path

from .data_providers import AlpacaProvider
from promethea.providers.fred_provider import FREDProvider
from promethea.providers.cot_provider import COTProvider
from promethea.providers.google_trends_provider import GoogleTrendsProvider
from promethea.providers.discourse_provider import DiscourseProvider
from promethea.providers.options_data_provider import OptionsDataProvider
from promethea.models import create_db_engine # Import the centralized engine creator
from promethea.providers.yfinance_provider import YFinanceProvider
from promethea.providers.rss_news_provider import RSSNewsProvider
from sklearn.preprocessing import StandardScaler
from dotenv import load_dotenv


# --- CONFIGURATION ---
# Use absolute path relative to this file to ensure it works regardless of CWD
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent # trading_agent/Services -> trading_agent -> root
MODEL_CONFIG_DIR = PROJECT_ROOT / "trading_agent" / "models"
SCALER_FILE_PATH = MODEL_CONFIG_DIR / "unified_state_scaler.gz"

class DataService:
    """
    Orchestrates the fetching and processing of all data required to build the
    Unified State Vector, as defined in the Promethea research blueprint v2.0.
    """
    def __init__(self, asset_id: str, market_provider: AlpacaProvider | None = None):
        # Load credentials once at the service level
        self.asset_id = asset_id
        self.market_provider: AlpacaProvider = market_provider if market_provider else AlpacaProvider()
        
        # Explicitly create the database engine first to ensure clean initialization.
        db_engine = create_db_engine()
        self.macro_provider: FREDProvider = FREDProvider(engine=db_engine)
        self.news_provider: RSSNewsProvider = RSSNewsProvider(rss_urls=[
            "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",  # Wall Street Journal
            "http://feeds.marketwatch.com/marketwatch/topstories/", # MarketWatch
            "https://www.cnbc.com/id/100003114/device/rss/rss.html", # CNBC
            "https://www.investing.com/rss/news.rss", # Investing.com
            "http://feeds.reuters.com/reuters/businessNews",
        ])
        
        # Initialize local providers directly
        self.cot_provider = COTProvider()
        self.trends_provider = GoogleTrendsProvider()
        self.discourse_provider = DiscourseProvider(subreddits=['wallstreetbets', 'investing', 'stocks'])
        self.options_provider = OptionsDataProvider()
        self.yfinance_provider: YFinanceProvider = YFinanceProvider() # Secondary provider
        self.scaler = self._load_scaler()
        self._last_unnormalized_vector = None
        self.peer_assets = {
            'ethereum': 'ETH-USD',
            # 'sp500_proxy': 'SPY' # Temporarily remove due to API plan limitations
        }
        self.chaos_assets = {
            'sp500': 'SPY',      # US Large Cap Equities
            'nasdaq': 'QQQ',     # US Tech Equities
            'treasury': 'TLT',   # Long-Term US Bonds
            'gold': 'GLD',       # Commodities (Safe Haven)
            'emerging': 'EEM',   # Emerging Markets
            'volatility': '^VIX' # Volatility Index
        }
        self.discourse_keywords = [
            'HODL',
            'diamond hands',
            'gamma squeeze',
            'short squeeze',
            'to the moon'
        ]
        # Update the provider with the keywords if needed, though it has defaults
        self.discourse_provider.strategy_keywords = self.discourse_keywords
        print(f"DataService initialized for asset: {self.asset_id}")

    def _load_scaler(self) -> StandardScaler:
        if not SCALER_FILE_PATH.exists():
            print(f"--- WARNING: Scaler file not found at {SCALER_FILE_PATH}. Using a new, unfitted scaler. ---")
            print("--- Please run the `scripts/create_scaler.py` utility. ---")
            return StandardScaler()
        print(f"--- Scaler loaded successfully from {SCALER_FILE_PATH} ---")
        return joblib.load(SCALER_FILE_PATH)

    async def get_unified_state_vector(self, data_cache: dict | None = None, historical_slice: int | None = None, normalize: bool = True, portfolio_state: dict | None = None) -> tuple[np.ndarray, list[str]] | Exception:
        """
        Constructs and optionally normalizes the state vector.
        Returns a raw (unnormalized) vector if normalize=False.
        """
        try:
            # For training, use the pre-fetched cache. For live, fetch new data.
            if data_cache is None:
                data_cache = await self._fetch_all_data()

            primary_data = data_cache.get("primary")
            if primary_data is None or primary_data.is_empty():
                raise ValueError("Primary asset data could not be fetched.")

            primary_data_slice = primary_data.slice(0, historical_slice) if historical_slice is not None else primary_data

            # --- Vector Construction ---
            all_vectors = [
                self._get_core_technical_vector(primary_data_slice, portfolio_state),
                self._get_economic_vector(data_cache.get("macro")),
                self._get_psychology_vector(data_cache.get("news"), data_cache.get("trends"), data_cache.get("options")),
                self._get_entanglement_vector(primary_data_slice, data_cache),
                self._get_chaos_vector(data_cache),
                self._get_reflexivity_vector(primary_data_slice, data_cache.get("discourse"), data_cache.get("cot")),
                self._get_portfolio_vector(portfolio_state),
                await self._get_liquidity_vector(primary_data_slice),
            ]
            
            valid_vectors = [v for v in all_vectors if v is not None and v.ndim == 1]
            if not valid_vectors:
                raise ValueError("No valid data vectors could be generated.")
                
            unified_vector = np.concatenate(valid_vectors)

            # CRITICAL NAN/INF PREVENTION FIX & TYPE ENFORCEMENT
            unified_vector = np.nan_to_num(
                unified_vector, nan=0.0, posinf=1e5, neginf=-1e5
            ).astype(np.float32)

            self._last_unnormalized_vector = unified_vector

            if not normalize:
                return unified_vector, [] # Return raw vector for scaler creation

            # --- Normalization Step (only if normalize is True) ---
            if not hasattr(self.scaler, 'mean_'):
                raise ValueError("Scaler is not fitted. Please run `scripts/create_scaler.py`.")
            
            if unified_vector.shape[0] != self.scaler.n_features_in_:
                raise ValueError(f"Feature count mismatch! Expected {self.scaler.n_features_in_}, but generated {unified_vector.shape[0]}.")

            normalized_vector = self.scaler.transform(unified_vector.reshape(1, -1))
            
            return normalized_vector.flatten(), []

        except Exception as e:
            raise e

    async def _fetch_all_data(self, days: int = 90) -> dict:
        """Fetches all data sources concurrently."""
        tasks = {
            'primary': self.market_provider.fetch_data(self.asset_id, days=days, interval='daily'),
            'macro': asyncio.get_running_loop().run_in_executor(None, self.macro_provider.fetch_data),
            'news': asyncio.get_running_loop().run_in_executor(None, self.news_provider.get_sentiment_distribution, self.asset_id),
            'options': asyncio.get_running_loop().run_in_executor(None, self._fetch_put_call_ratio),
            'trends': asyncio.get_running_loop().run_in_executor(None, self._fetch_trends),
            'discourse': asyncio.get_running_loop().run_in_executor(None, self._fetch_discourse),
            'cot': asyncio.get_running_loop().run_in_executor(None, self._fetch_cot),
            **{name: self.market_provider.fetch_data(ticker, days=days, interval='daily') for name, ticker in self.peer_assets.items()},
            # Use the YFinanceProvider for the chaos assets to bypass Alpaca limitations
            # CORRECTED: Use functools.partial to correctly pass arguments to the executor.
            **{name: self.yfinance_provider.fetch_data(ticker, days=days) for name, ticker in self.chaos_assets.items()}
        }
        results = await asyncio.gather(*tasks.values(), return_exceptions=True)
        
        data_cache = dict(zip(tasks.keys(), results))
        for key, value in data_cache.items():
            if isinstance(value, Exception):
                print(f"--- WARNING: Could not fetch data for '{key}'. Error: {value} ---")
                # For dataframes, use an empty one. For others, use None.
                if key in self.peer_assets or key in self.chaos_assets or key == 'primary' or key == 'macro':
                    data_cache[key] = pl.DataFrame()
                else:
                    data_cache[key] = None
        return data_cache

    async def close_sessions(self):
        """Closes any open network sessions handled by providers."""
        if hasattr(self.news_provider, 'close'):
            await self.news_provider.close()

    def _fetch_trends(self) -> float:
        """
        Fetches search trend acceleration using the local GoogleTrendsProvider.
        """
        try:
            return self.trends_provider.get_search_trend_acceleration(self.asset_id)
        except Exception as e:
            print(f"--- WARNING: Google Trends fetch failed: {e} ---")
            return 0.0

    def _fetch_put_call_ratio(self) -> float:
        """
        Fetches the CBOE Total Put/Call ratio using the local OptionsDataProvider.
        """
        try:
            return self.options_provider.get_put_call_ratio()
        except Exception as e:
            print(f"--- WARNING: Put/Call Ratio fetch failed: {e} ---")
            return 1.0 # Return a neutral 1.0 on failure

    def _fetch_discourse(self) -> list[float] | None:
        """
        Fetches the strategy discourse vector using the local DiscourseProvider.
        """
        try:
            return self.discourse_provider.get_strategy_discourse_vector()
        except Exception as e:
            print(f"--- WARNING: Discourse Vector fetch failed: {e} ---")
            # Return a list of zeros matching the expected keyword count on failure
            return [0.0] * len(self.discourse_keywords)

    def _fetch_cot(self) -> float:
        """
        Fetches net speculative positioning using the local COTProvider.
        """
        try:
            return self.cot_provider.get_net_speculative_positioning(self.asset_id)
        except Exception as e:
            print(f"--- WARNING: COT data fetch failed: {e} ---")
            return 0.0 # Return a neutral 0.0 on failure

    def _get_core_technical_vector(self, df_pl: pl.DataFrame, portfolio_state: dict | None = None) -> np.ndarray:
        """
        Calculates technical indicators and includes agent's stateful portfolio information.
        MODIFICATION: Now calculates a full suite of 12 technical indicators.
        """

        if df_pl.height < 50: 
            # Even if not enough data for technicals, we MUST return the portfolio state
            # to maintain consistent vector size (12 technicals + 2 portfolio = 14).
            tech_zeros = np.zeros(12, dtype=np.float32)
            if portfolio_state is None:
                portfolio_state = {'cash': 0.0, 'asset_quantity': 0.0}
            portfolio_vector = np.array([
                portfolio_state.get('cash', 0.0),
                portfolio_state.get('asset_quantity', 0.0)
            ], dtype=np.float32)
            return np.concatenate([tech_zeros, portfolio_vector])

        # Calculate indicators directly using Polars for performance and to remove pandas-ta dependency.
        df_with_indicators = df_pl.with_columns([
            # Calculate price delta for RSI
            pl.col("price").diff().alias("delta"),
        ]).with_columns([
            # MACD
            pl.col("price").ewm_mean(span=12, adjust=False).alias("ema_12"),
            pl.col("price").ewm_mean(span=26, adjust=False).alias("ema_26"),
            # SMA
            pl.col("price").rolling_mean(window_size=7).alias("SMA_7"),
            pl.col("price").rolling_mean(window_size=20).alias("SMA_20"),
            # Volatility and Price Change
            pl.col("price").pct_change().rolling_std(window_size=20).alias("volatility_20"),
            pl.col("price").pct_change().alias("price_change_1"),
        ]).with_columns([
            # Calculate RSI using the delta
            self._calculate_rsi_polars(pl.col("delta")).alias("RSI_14"),
            (pl.col("ema_12") - pl.col("ema_26")).alias("MACD_12_26_9"),
        ]).with_columns(
            pl.col("MACD_12_26_9").ewm_mean(span=9, adjust=False).alias("MACDs_12_26_9")
        ).with_columns(
            (pl.col("MACD_12_26_9") - pl.col("MACDs_12_26_9")).alias("MACDh_12_26_9")
        )

        # Calculate Bollinger Bands using the helper and add them to the DataFrame
        bbl, bbm, bbu = self._get_bollinger_bands(df_with_indicators['price'])
        df_with_indicators = df_with_indicators.with_columns(
            bbl.alias('BBL_20_2.0'), bbm.alias('BBM_20_2.0'), bbu.alias('BBU_20_2.0')
        )

        # Select the last valid value for 11 indicators plus price itself (12 total features)
        indicators = [
            'price', 'price_change_1', 'volatility_20', 'RSI_14', 'MACD_12_26_9', 'MACDh_12_26_9',
            'MACDs_12_26_9', 'SMA_7', 'SMA_20', 'BBL_20_2.0', 'BBM_20_2.0', 'BBU_20_2.0'
        ]
        vector = df_with_indicators.select(indicators).tail(1).to_numpy().flatten()

        # CRITICAL: Clean NaNs and enforce final size and type
        vector = np.nan_to_num(vector, nan=0.0)

        if len(vector) != 12:
            vector = np.pad(vector, (0, 12 - len(vector)), 'constant')[:12]

        # --- PORTFOLIO STATE INTEGRATION (Phase 6.1) ---
        # Add cash and asset quantity to the vector.
        if portfolio_state is None:
            portfolio_state = {'cash': 0.0, 'asset_quantity': 0.0}
        
        portfolio_vector = np.array([
            portfolio_state.get('cash', 0.0),
            portfolio_state.get('asset_quantity', 0.0)
        ], dtype=np.float32)

        final_vector = np.concatenate([vector, portfolio_vector])

        return final_vector.astype(np.float32)

    def _get_bollinger_bands(self, series: pl.Series, window_size: int = 20, num_std: int = 2) -> tuple[pl.Series, pl.Series, pl.Series]:
        """Helper to calculate Bollinger Bands using Polars."""
        rolling_mean = series.rolling_mean(window_size)
        rolling_std = series.rolling_std(window_size)
        upper_band = rolling_mean + (rolling_std * num_std)
        lower_band = rolling_mean - (rolling_std * num_std)
        return lower_band, rolling_mean, upper_band

    def _calculate_rsi_polars(self, series: pl.Series, window: int = 14) -> pl.Series:
        """Helper to calculate RSI using Polars."""
        gain = pl.when(series > 0).then(series).otherwise(0).ewm_mean(span=window, adjust=False)
        loss = pl.when(series < 0).then(-series).otherwise(0).ewm_mean(span=window, adjust=False)
        rs = gain / loss
        return 100 - (100 / (1 + rs))

    async def _get_liquidity_vector(self, _: pl.DataFrame) -> np.ndarray:
        """Fetches and processes liquidity data."""
        liquidity_data = await self.market_provider.fetch_liquidity_data(self.asset_id)
        # Placeholder for more liquidity metrics like order book depth, volume profile, etc.
        return np.array([liquidity_data.get("bid_ask_spread", 0.001), 0.0], dtype=np.float32)

    def _get_economic_vector(self, macro_data: pl.DataFrame | None) -> np.ndarray:
        """Extracts key metrics from macroeconomic data.""" 
        if macro_data is None or macro_data.is_empty(): return np.zeros(5)
        try:
            core_metrics = ['FED_FUNDS_RATE', 'CPI', 'GDP', 'UNEMPLOYMENT', 'VIX']
            vector = [macro_data.item(0, metric) if metric in macro_data.columns else 0 for metric in core_metrics]
            return np.array(vector, dtype=np.float32)
        except (ColumnNotFoundError, IndexError):
            # Handle cases where the DataFrame is malformed or empty after a failed fetch
            return np.zeros(5, dtype=np.float32)

    def _get_psychology_vector(self, news_sentiment_vector: list[float] | None, trends_data: pl.DataFrame | None, options_data: float | None) -> np.ndarray:
        """Processes sentiment, search trend, and options data."""
        # Sentiment Distribution (delta_t)
        # The provider already returns a normalized distribution.
        delta_t = np.array(news_sentiment_vector) if news_sentiment_vector else np.array([0.0, 0.0, 0.0])

        # Search Trend Velocity (g_dot_t)
        # The provider now returns the calculated acceleration directly as a float.
        g_dot_t = trends_data if isinstance(trends_data, float) else 0.0

        # Put/Call Ratio (rho_t)
        rho_t = options_data if options_data is not None else 1.0 # Default to a neutral 1.0
        
        # The final vector is composed of the three calculated metrics.
        return np.array([*delta_t, g_dot_t, rho_t], dtype=np.float32)

    def _get_entanglement_vector(self, primary_pl: pl.DataFrame, data_cache: dict) -> np.ndarray:
        """Calculates correlations with peer assets."""
        correlations = []
        if primary_pl.height < 30: return np.zeros(len(self.peer_assets), dtype=np.float32)
        primary_returns = primary_pl.with_columns(pl.col("price").log().diff().alias("log_returns_primary"))

        for name in self.peer_assets.keys():
            peer_pl = data_cache.get(name)
            if peer_pl is None or peer_pl.height < 30:
                correlations.append(0.0)
                continue
            
            peer_returns = peer_pl.with_columns(pl.col("price").log().diff().alias("log_returns_peer"))
            combined = primary_returns.join(peer_returns, on='timestamp', how='inner')
            
            if combined.height < 30:
                correlations.append(0.0)
                continue
            
            corr = combined.select(pl.rolling_corr('log_returns_primary', 'log_returns_peer', window_size=30)).to_series().last()
            correlations.append(corr if corr is not None else 0.0)
        
        return np.array(correlations, dtype=np.float32)

    def _get_chaos_vector(self, data_cache: dict) -> np.ndarray:
        """
        Calculates the Correlation Instability metric (Frobenius norm of the
        change in the correlation matrix) for a basket of key market assets.
        """
        window_size = 30
        
        # 1. Collect log returns for all chaos assets
        all_returns = []
        for name, ticker in self.chaos_assets.items():
            df = data_cache.get(name)
            if df is not None and not df.is_empty() and df.height > window_size:
                returns = df.select(
                    pl.col('timestamp'),
                    pl.col('price').log().diff().alias(f'returns_{name}')
                )
                all_returns.append(returns)

        if len(all_returns) < 2:
            return np.ones(1, dtype=np.float32) # Not enough data, default to 1.0 instability

        # 2. Join all returns into a single DataFrame
        combined_df = all_returns[0]
        for i in range(1, len(all_returns)):
            combined_df = combined_df.join(all_returns[i], on='timestamp', how='inner')

        if combined_df.height < window_size + 2:
            return np.ones(1, dtype=np.float32) # Not enough data, default to 1.0 instability

        # 3. Calculate correlation matrices for two overlapping periods
        cols_to_corr = [col for col in combined_df.columns if col != 'timestamp']
        
        # Matrix for the most recent period
        corr_matrix_t1 = combined_df.tail(window_size)[cols_to_corr].corr()
        # Matrix for the period one step before
        corr_matrix_t0 = combined_df.slice(combined_df.height - window_size - 1, window_size)[cols_to_corr].corr()

        # 4. Calculate the Frobenius norm of the difference
        diff_matrix = corr_matrix_t1.to_numpy() - corr_matrix_t0.to_numpy()
        correlation_instability = np.linalg.norm(diff_matrix, 'fro')

        return np.array([correlation_instability], dtype=np.float32)

    def _get_model_correlation(self, primary_pl: pl.DataFrame) -> float:
        """
        Calculates the correlation between the agent's signals and a benchmark
        "vanilla" model's signals (rho_M(t)). This measures signal uniqueness.
        """
        correlation_window = 30
        if primary_pl.height < correlation_window + 1:
            return 0.0

        # 1. Define Benchmark "Vanilla" Model (e.g., 10/30 SMA Crossover)
        df_benchmark = primary_pl.with_columns(
            pl.col("price").rolling_mean(window_size=10).alias("sma_short_vanilla"),
            pl.col("price").rolling_mean(window_size=30).alias("sma_long_vanilla")
        ).with_columns(
            pl.when(pl.col("sma_short_vanilla") > pl.col("sma_long_vanilla")).then(1)
            .otherwise(-1).alias("benchmark_signal")
        )

        # 2. Define a Proxy for the Agent's Model using a core technical indicator (RSI).
        # A signal is generated based on whether the RSI is in an overbought (>70) or oversold (<30) state.
        # This is a more representative proxy for our agent's complex logic than a simple SMA crossover.
        df_agent = primary_pl.with_columns(
            self._calculate_rsi_polars(pl.col("price").diff(), window=14).alias("rsi_agent")
        ).with_columns(
            pl.when(pl.col("rsi_agent") < 30).then(1)  # Buy signal
            .when(pl.col("rsi_agent") > 70).then(-1) # Sell signal
            .otherwise(0).alias("agent_signal")      # Hold
        )

        # 3. Combine signals and calculate rolling correlation
        combined_signals = df_benchmark.join(df_agent.select(["timestamp", "agent_signal"]), on="timestamp", how="inner")
        
        if combined_signals.height < correlation_window:
            return 0.0

        rho_M_t = combined_signals.select(
            pl.rolling_corr("benchmark_signal", "agent_signal", window_size=correlation_window)
        ).to_series().last()

        return rho_M_t if rho_M_t is not None else 0.0

    def _get_reflexivity_vector(self, primary_pl: pl.DataFrame, discourse_vector: list[float] | None, cot_data: float | None) -> np.ndarray:
        """
        Processes discourse and crowdedness data to form the Reflexivity Vector.
        """
        # Strategy Discourse Metric (D_t)
        # Default to a small non-zero value to avoid N/A and represent low discussion
        if discourse_vector is None or not isinstance(discourse_vector, list) or sum(discourse_vector) == 0:
            d_t_vector = np.full(len(self.discourse_keywords), 0.01, dtype=np.float32)
        else:
            d_t_vector = np.array(discourse_vector)

        # Crowdedness Indicator (C_t_crowd) from COT provider
        crowdedness_indicator = cot_data if cot_data is not None else 0.0
        
        # Model Correlation (rho_M(t))
        model_correlation = self._get_model_correlation(primary_pl)
        
        reflexivity_vector = np.concatenate([d_t_vector, [crowdedness_indicator, model_correlation]])

        return reflexivity_vector.astype(np.float32)

    def _get_portfolio_vector(self, portfolio_state: dict | None) -> np.ndarray:
        """
        Implements the core requirements of Phase 6.1 (Stateful Agent).
        Generates a vector representing current holdings, risk, and performance.
        """
        if portfolio_state is None:
            return np.zeros(5, dtype=np.float32)

        # --- Core Holdings ---
        cash = portfolio_state.get('cash', 0.0)
        asset_quantity = portfolio_state.get('asset_quantity', 0.0)
        current_price = portfolio_state.get('current_price', 0.0)
        total_value = cash + (asset_quantity * current_price)

        # --- PnL ---
        # Unrealized PnL = Current Value of Assets - Cost Basis
        cost_basis = portfolio_state.get('cost_basis', 0.0)
        unrealized_pnl = (asset_quantity * current_price) - cost_basis if asset_quantity > 0 else 0.0

        # --- Risk & Performance Metrics ---
        historical_values = portfolio_state.get('historical_values', [])
        volatility = 0.0
        sharpe_ratio = 0.0

        if len(historical_values) > 1:
            returns = np.diff(historical_values) / historical_values[:-1]
            
            # Volatility (annualized standard deviation of returns)
            # Assuming daily data, so we multiply by sqrt(252)
            volatility = np.std(returns) * np.sqrt(252)

            # Sharpe Ratio (annualized)
            # Assuming a risk-free rate of 0 for simplicity.
            mean_return = np.mean(returns)
            std_return = np.std(returns)
            if std_return > 0:
                sharpe_ratio = (mean_return / std_return) * np.sqrt(252)

        # The final vector. Note: The size has been reduced from 20 to 5 for clarity
        # and to only include meaningful, non-random features.
        portfolio_vector = np.array([
            total_value,
            unrealized_pnl,
            volatility,
            sharpe_ratio,
            asset_quantity, # Explicitly include asset quantity as a key state
        ], dtype=np.float32)

        return portfolio_vector
