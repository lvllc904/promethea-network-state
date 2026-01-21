import asyncio
import numpy as np
import torch
from tqdm import tqdm

from Services.agent import RLAgent
from Services.data_service import DataService
from Services.trading_env import TradingEnv, prepare_dataframe_for_env
from Services.pattern_recognition_service import PatternRecognitionService
from Services.database import SessionLocal

async def main():
    """
    Main function to orchestrate the training of the RL agent.
    """
    print("--- Starting RL Agent Training ---")

    # --- 1. Data Preparation ---
    # In a real-world scenario, you would load a large historical dataset.
    # We now use the DataService to fetch and prepare a full historical dataset for backtesting.
    print("Fetching and preparing market data for the environment...")
    data_service = DataService()
    # Fetch 1 year of data for backtesting.
    df = await data_service.get_historical_data_for_backtesting(asset_id="bitcoin", days=365)
    print("Market data prepared.")

    # --- 2. Environment and Agent Initialization ---
    env = TradingEnv(df)
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.n
    agent = RLAgent(state_dim, action_dim)
    
    # Correctly instantiate the database and services
    db = SessionLocal()
    pattern_service = PatternRecognitionService(db_session=db)

    batch_size = 32
    num_episodes = 50  # For demonstration; a real training run needs thousands.

    print(f"State dimension: {state_dim}")
    print(f"Action dimension: {action_dim}")
    print(f"Starting training for {num_episodes} episodes...")

    # --- 3. Training Loop ---
    for e in range(num_episodes):
        state, _ = env.reset()
        state = np.reshape(state, [1, state_dim])
        done = False
        time_steps = 0

        while not done:
            # --- Centralized Hybrid Action Selection ---
            # Get the market state as a dictionary for the pattern service
            market_state_dict = env.get_current_market_state_as_dict()
            # Use the agent's centralized method for selecting an action
            action = agent.select_hybrid_action(
                state, pattern_service, market_state_dict
            )

            # Environment executes the action
            next_state, reward, terminated, truncated, info = env.step(action)
            done = terminated or truncated
            
            next_state = np.reshape(next_state, [1, state_dim])

            # Agent stores the experience
            agent.remember(state, action, reward, next_state, done)

            state = next_state
            time_steps += 1

            # Agent learns from a batch of experiences
            if len(agent.memory) > batch_size:
                agent.replay(batch_size)

        portfolio_value = info.get('portfolio_value', 0)
        print(
            f"Episode: {e+1}/{num_episodes}, "
            f"Steps: {time_steps}, "
            f"Final Portfolio Value: ${portfolio_value:,.2f}, "
            f"Epsilon: {agent.epsilon:.2f}"
        )

    # --- 4. Save Trained Model ---
    model_path = "agent_model.pth"
    torch.save(agent.model.state_dict(), model_path)
    
    # Clean up the database session
    db.close()
    print(f"--- Training Complete. Model saved to {model_path} ---")

if __name__ == "__main__":
    asyncio.run(main())