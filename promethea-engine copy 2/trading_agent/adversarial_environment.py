import asyncio
import gymnasium as gym
import numpy as np
import polars as pl

from gymnasium import spaces
from trading_agent.Services.agent import GenerativeAgent as TradingAgent # Corrected import path
from trading_agent.Services.data_service import DataService

class AdversarialEnv(gym.Env):
    """
    A custom Gymnasium environment for the adversarial backtest.

    In this environment, an 'AdversarialAgent' learns to take actions that
    negatively impact the performance of a primary 'TradingAgent'.

    - Observation Space: The Unified State Vector from the DataService.
    - Action Space: A continuous value representing a price shock.
    - Reward: The negative of the TradingAgent's portfolio value change.
    """
    metadata = {"render_modes": ["human"]}

    def __init__(self, historical_data: pl.DataFrame, main_agent_config: dict, initial_cash: float = 100000.0):
        super().__init__()

        self.initial_cash = initial_cash
        self.historical_data = historical_data
        self.data_service = DataService(asset_id="SPY") # Asset ID must be a valid ticker
        self.main_agent = TradingAgent(config=main_agent_config)

        self.start_step = 90  # Start after enough data for indicators
        self.current_step = self.start_step
        self.max_steps = len(historical_data) - 1

        # --- Define Action and Observation Spaces ---
        # Action: A single continuous value from -1 to 1 representing price shock
        # -1: Max negative shock, +1: Max positive shock
        self.action_space = spaces.Box(low=-1, high=1, shape=(1,), dtype=np.float32)

        # Observation: The Unified State Vector. We dynamically determine its size
        # by doing a dry run of the observation function. This makes the environment
        # robust to changes in the DataService vector configuration.
        dummy_obs = self._get_observation(portfolio_state={"cash": self.initial_cash, "asset_quantity": 0.0})
        self.observation_size = dummy_obs.shape[0]
        self.observation_space = spaces.Box(low=-np.inf, high=np.inf, shape=(self.observation_size,), dtype=np.float32)

        print("--- AdversarialEnv initialized ---")

    def _get_observation(self, portfolio_state: dict, adversarial_shock: float = 0.0) -> np.ndarray:
        """
        Gets the Unified State Vector for the current step.
        Applies the adversarial shock to the price data before generating the vector.
        """
        historical_slice = self.historical_data.slice(0, self.current_step + 1)

        # Apply adversarial shock to the most recent price
        if adversarial_shock != 0.0:
            last_price = historical_slice[-1, "price"]
            shock_amount = last_price * adversarial_shock * 0.05 # Shock is up to 5% of price
            historical_slice[-1, "price"] = last_price + shock_amount

        # Create a data cache for the DataService
        data_cache = {
            "primary": historical_slice,
            # In a full implementation, other data sources would also be sliced and included
        }

        # Run async function in a new event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        state_vector, _ = loop.run_until_complete(
            self.data_service.get_unified_state_vector(
                data_cache=data_cache,
                portfolio_state=portfolio_state
            )
        )
        loop.close()
        
        return state_vector

    def reset(self, seed=None, options=None):
        """Resets the environment to its initial state."""
        super().reset(seed=seed)

        self.current_step = self.start_step
        
        # Reset main agent's portfolio
        self.main_agent_portfolio = {
            "cash": self.initial_cash,
            "asset_quantity": 0.0,
            "total_value": self.initial_cash
        }

        observation = self._get_observation(self.main_agent_portfolio)
        info = {"step": self.current_step}

        return observation, info

    def step(self, action: np.ndarray):
        """
        Executes one time step within the environment.
        """
        adversarial_shock = action[0]
        
        # 1. Main Agent observes the (potentially manipulated) state and acts
        current_observation = self._get_observation(self.main_agent_portfolio, adversarial_shock)
        main_agent_action = self.main_agent.choose_action(current_observation) # Corrected method call

        # 2. Execute main agent's trade
        previous_portfolio_value = self.main_agent_portfolio["total_value"]
        current_price = self.historical_data[self.current_step, "price"]
        self._execute_trade(main_agent_action, current_price)

        # 3. Advance time
        self.current_step += 1

        # 4. Update portfolio value with the new price
        new_price = self.historical_data[self.current_step, "price"]
        self.main_agent_portfolio["total_value"] = self.main_agent_portfolio["cash"] + self.main_agent_portfolio["asset_quantity"] * new_price

        # 5. Calculate reward for the adversary
        portfolio_change = self.main_agent_portfolio["total_value"] - previous_portfolio_value
        reward = -portfolio_change  # Adversary is rewarded when the main agent loses money

        # 6. Check for termination
        terminated = self.current_step >= self.max_steps
        truncated = False # Not using time limits other than the end of data

        # 7. Get the next observation for the adversary
        next_observation = self._get_observation(self.main_agent_portfolio)

        info = {
            "step": self.current_step,
            "main_agent_pnl": portfolio_change,
            "adversary_reward": reward
        }

        return next_observation, reward, terminated, truncated, info

    def _execute_trade(self, action: str, price: float):
        """A simplified trade execution logic."""
        trade_amount_cash = 10000 # Fixed trade size for simplicity

        if action == 'buy' and self.main_agent_portfolio["cash"] >= trade_amount_cash:
            quantity_to_buy = trade_amount_cash / price
            self.main_agent_portfolio["asset_quantity"] += quantity_to_buy
            self.main_agent_portfolio["cash"] -= trade_amount_cash
        elif action == 'sell' and self.main_agent_portfolio["asset_quantity"] > 0:
            # For simplicity, sell a fixed portion of holdings
            quantity_to_sell = self.main_agent_portfolio["asset_quantity"] * 0.5 
            self.main_agent_portfolio["asset_quantity"] -= quantity_to_sell
            self.main_agent_portfolio["cash"] += quantity_to_sell * price

    def render(self, mode='human'):
        """Renders the environment (e.g., prints state)."""
        if mode == 'human':
            print(f"Step: {self.current_step}")
            print(f"Main Agent Portfolio Value: {self.main_agent_portfolio['total_value']:.2f}")

    def close(self):
        """Closes any open resources."""
        asyncio.run(self.data_service.close_sessions())
        print("--- AdversarialEnv closed. ---")