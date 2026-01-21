import gymnasium as gym
from gymnasium import spaces
import numpy as np
import pandas as pd

class TradingEnv(gym.Env):
    """
    A custom trading environment for backtesting a Reinforcement Learning agent.

    This environment simulates market interactions, including portfolio management,
    transaction costs, and profit-driven rewards.
    """
    metadata = {'render_modes': ['human']}

    def __init__(self, df: pd.DataFrame, initial_balance: float = 10000, transaction_fee_percent: float = 0.001):
        super(TradingEnv, self).__init__()

        self.df = df
        self.initial_balance = initial_balance
        self.transaction_fee_percent = transaction_fee_percent

        # Define action space: 0=Hold, 1=Buy, 2=Sell
        # For simplicity, we'll trade a fixed amount (e.g., 10% of balance on Buy)
        self.action_space = spaces.Discrete(3)

        # Define observation space: This should match the state vector from DataService
        # It includes price, volume, indicators, and our portfolio state (balance, holdings)
        # The shape is the number of features from the dataframe + 2 for portfolio state.
        self.observation_space = spaces.Box(
            low=-np.inf, high=np.inf, shape=(len(df.columns) + 2,), dtype=np.float64
        )

        # The `render_mode` argument must be specified during initialization
        self.render_mode = 'human'

    def _get_obs(self):
        """Constructs the observation from the current market and portfolio state."""
        market_features = self.df.iloc[self.current_step].values
        portfolio_state = np.array([self.balance, self.asset_holdings])
        return np.concatenate([market_features, portfolio_state])

    def get_current_market_state_as_dict(self) -> dict:
        """
        Returns the current market state as a dictionary.
        This is needed for the PatternRecognitionService.
        """
        return self.df.iloc[self.current_step].to_dict()

    def _get_portfolio_value(self):
        """Calculates the total value of the portfolio."""
        current_price = self.df.loc[self.df.index[self.current_step], 'price']
        return self.balance + (self.asset_holdings * current_price)

    def reset(self, seed=None, options=None):
        """Resets the environment to its initial state."""
        super().reset(seed=seed)

        self.balance = self.initial_balance
        self.asset_holdings = 0.0
        self.current_step = 0
        self.portfolio_value_history = [self.initial_balance]

        observation = self._get_obs()
        info = {'portfolio_value': self.initial_balance}

        return observation, info

    def step(self, action):
        """Executes one time step within the environment."""
        self.current_step += 1

        # Execute the action
        self._take_action(action)

        # Calculate reward
        current_portfolio_value = self._get_portfolio_value()
        prev_portfolio_value = self.portfolio_value_history[-1]
        reward = current_portfolio_value - prev_portfolio_value
        self.portfolio_value_history.append(current_portfolio_value)

        # Check for termination
        terminated = self.current_step >= len(self.df) - 1
        truncated = False # Not used in this simple env

        # Get next observation
        observation = self._get_obs()
        info = {'portfolio_value': current_portfolio_value}

        return observation, reward, terminated, truncated, info

    def _take_action(self, action):
        """Applies the chosen action (Buy, Sell, Hold) to the portfolio."""
        current_price = self.df.loc[self.df.index[self.current_step], 'price']

        if action == 1:  # Buy
            # Buy a fixed fraction of our current balance
            trade_amount_usd = self.balance * 0.10
            if trade_amount_usd > 1: # Minimum trade
                fee = trade_amount_usd * self.transaction_fee_percent
                self.balance -= (trade_amount_usd + fee)
                self.asset_holdings += trade_amount_usd / current_price

        elif action == 2:  # Sell
            # Sell a fixed fraction of our current holdings
            asset_trade_amount = self.asset_holdings * 0.10
            if asset_trade_amount > 0:
                trade_amount_usd = asset_trade_amount * current_price
                fee = trade_amount_usd * self.transaction_fee_percent
                self.balance += (trade_amount_usd - fee)
                self.asset_holdings -= asset_trade_amount

        # Action 0 (Hold) does nothing.

    def render(self):
        """Renders the environment (optional)."""
        if self.render_mode == 'human':
            portfolio_value = self._get_portfolio_value()
            print(
                f"Step: {self.current_step}, "
                f"Portfolio Value: {portfolio_value:,.2f}, "
                f"Balance: {self.balance:,.2f}, "
                f"Holdings: {self.asset_holdings:.6f}"
            )

    def close(self):
        pass

def prepare_dataframe_for_env(state_vector_data: dict) -> pd.DataFrame:
    """
    A helper function to convert the dictionary from DataService into a
    Pandas DataFrame suitable for the TradingEnv.
    
    This is a placeholder. A real implementation would process a list of
    state vectors over time.
    """
    # In a real scenario, you would load a CSV or build a DataFrame
    # from many historical state_vector calls.
    # For now, we create a dummy DataFrame with a few rows.
    data = {k: [v] * 100 for k, v in state_vector_data.items()}
    df = pd.DataFrame(data)
    # Add some variance to the price for a more interesting backtest
    df['price'] = df['price'] * (1 + np.random.randn(100) * 0.01).cumsum()
    return df