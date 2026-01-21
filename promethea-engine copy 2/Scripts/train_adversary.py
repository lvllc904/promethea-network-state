import polars as pl
import numpy as np
from datetime import datetime, timedelta

from stable_baselines3 import PPO
from stable_baselines3.common.env_checker import check_env

# Add project root to path to allow for absolute imports
import sys
from pathlib import Path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

from trading_agent.adversarial_environment import AdversarialEnv

def create_dummy_data(num_days: int = 200) -> pl.DataFrame:
    """Creates a dummy DataFrame with price and timestamp for testing the environment."""
    base_price = 100
    dates = [datetime.now() - timedelta(days=i) for i in range(num_days)][::-1]
    prices = base_price + np.cumsum(np.random.randn(num_days) * 2)
    
    return pl.DataFrame({
        "timestamp": dates,
        "price": prices
    })

def main():
    """
    Main function to train the AdversarialAgent.
    """
    print("--- Starting Adversarial Agent Training ---")

    # 1. Load or create historical data for the environment
    # In a real scenario, you would load this from your data source.
    historical_data = create_dummy_data(num_days=500)
    
    # 3. Initialize the custom Gymnasium environment
    env = AdversarialEnv(
        historical_data=historical_data,
        # The main agent config is now created dynamically based on the env
    )

    # 2. Define the configuration for the main agent using the dynamic observation size
    env.main_agent_config['state_dim'] = env.observation_size
    env.main_agent_config['mcts_simulations'] = 50 # Use fewer simulations for faster backtesting

    # Re-initialize the main agent inside the environment with the full config
    env.main_agent.reinitialize_with_config(env.main_agent_config)

    # 4. (Optional but Recommended) Check if the environment is compliant
    check_env(env)
    print("--- Environment check passed! ---")

    # 5. Initialize the PPO model from stable-baselines3
    model = PPO("MlpPolicy", env, verbose=1, tensorboard_log="./adversary_tensorboard/")

    # 6. Train the model
    model.learn(total_timesteps=20000)

    # 7. Save the trained model
    model.save("adversarial_ppo_model")
    print("--- Adversarial model trained and saved as 'adversarial_ppo_model.zip' ---")

    # 8. Clean up the environment
    env.close()

if __name__ == "__main__":
    main()