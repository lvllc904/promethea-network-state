import asyncio
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from tqdm import tqdm
import sys
from pathlib import Path

# Add the project root to the Python path to allow for absolute imports
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

from trading_agent.Services.data_service import DataService
from promethea.providers.yfinance_provider import YFinanceProvider
from trading_agent.Services.agent import GenerativeWorldModel
from trading_agent.config import get_settings

# --- DEBUGGING FLAG ---
DEBUG_RUN = False # Set to False for a full training run

async def generate_training_data(asset_id: str, num_days: int) -> list:
    """
    Generates state-action-next_state tuples for training the world model.
    """
    print(f"--- Generating training data for {asset_id} over {num_days} days ---")
    # Use YFinanceProvider to avoid Alpaca limits
    yf_provider = YFinanceProvider()
    data_service = DataService(asset_id=asset_id, market_provider=yf_provider)
    
    try:
        # Fetch all necessary historical data ONCE at the beginning.
        print("Performing initial bulk data fetch...")
        data_cache = await data_service._fetch_all_data(days=num_days)
        primary_data = data_cache.get('primary')
        
        if primary_data is None or primary_data.is_empty():
            raise ValueError("Could not fetch primary data for training.")

        # --- Full State Vector Generation for Training ---
        state_vectors = []
        errors = set()
        
        loop_range = range(1, 10) if DEBUG_RUN else range(1, len(primary_data))
        
        print("Generating full historical state vectors...")
        for i in tqdm(loop_range, desc="Generating state vectors"):
            result = await data_service.get_unified_state_vector(data_cache=data_cache, historical_slice=i)
            
            if isinstance(result, Exception):
                errors.add(str(result))
            elif result is not None:
                state_vec, soft_failures = result
                state_vectors.append(state_vec)
                for failure_msg in soft_failures:
                    errors.add(failure_msg)

        if errors:
            print("\n---  Encountered errors during data generation: ---")
            for error in errors:
                print(f"  - {error}")
            print("----------------------------------------------------")

        # Create (S_t, A_t, S_t+1) tuples
        experiences = []
        num_actions = 3 # buy, sell, hold
        for i in range(len(state_vectors) - 1):
            s_t = state_vectors[i]
            s_t_plus_1 = state_vectors[i+1]
            action = np.random.randint(num_actions)
            experiences.append((s_t, action, s_t_plus_1))
            
        print(f"✅ Generated {len(experiences)} training samples.")
        return experiences

    finally:
        # This block ensures sessions are closed no matter what happens
        print("\n--- Cleaning up data service sessions... ---")
        if hasattr(data_service, 'close_sessions'):
            await data_service.close_sessions()


async def main():
    """
    Main function to orchestrate the training of the PyTorch GenerativeWorldModel.
    """
    print("--- Starting PyTorch World Model Training ---")
    settings = get_settings()
    config = settings.agent_config

    # ADD THIS LINE FOR DEBUGGING
    print(f"--- ⚠️  DEBUG: Loaded state_dim from config is: {config['state_dim']} ---")

    # --- 1. Data Preparation ---
    training_data = await generate_training_data(asset_id="BTC-USD", num_days=365)
    if not training_data:
        print("--- ERROR: No training data generated. Aborting. ---")
        return

    # --- 2. Model and Optimizer Initialization ---
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    world_model = GenerativeWorldModel(
        state_dim=config['state_dim'],
        action_dim=3, # buy, sell, hold
        embed_dim=config['embed_dim'],
        num_heads=config['num_heads'],
        ff_dim=config['ff_dim']
    ).to(device)
    
    optimizer = optim.Adam(world_model.parameters(), lr=1e-4)
    loss_function = nn.MSELoss()

    # --- 3. Training Loop ---
    num_epochs = 10
    batch_size = 32
    
    for epoch in range(num_epochs):
        print(f"\n--- Epoch {epoch + 1}/{num_epochs} ---")
        np.random.shuffle(training_data)
        total_loss = 0
        
        for i in tqdm(range(0, len(training_data), batch_size), desc=f"Epoch {epoch+1}"):
            batch = training_data[i:i+batch_size]
            if not batch: continue

            states, actions, next_states = zip(*batch)
            
            s_t = torch.from_numpy(np.array(states)).float().to(device)
            a_t = nn.functional.one_hot(torch.from_numpy(np.array(actions)), num_classes=3).float().to(device)
            s_t_plus_1_actual = torch.from_numpy(np.array(next_states)).float().to(device)

            optimizer.zero_grad()
            
            predicted_params = world_model(s_t, a_t)
            predicted_mean, _ = torch.chunk(predicted_params, 2, dim=-1)
            
            loss = loss_function(predicted_mean, s_t_plus_1_actual)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            
        print(f"Epoch {epoch+1} Average Loss: {total_loss / (len(training_data) / batch_size):.4f}")

    # --- 4. Save Trained Model ---
    # Resolve the path relative to the project root to ensure it works from anywhere
    relative_path = config['weights_path'].replace('.h5', '.pth')
    model_path = PROJECT_ROOT / relative_path
    
    # Ensure the directory exists
    model_path.parent.mkdir(parents=True, exist_ok=True)
    
    torch.save(world_model.state_dict(), model_path)
    print(f"\n--- Training Complete. PyTorch model saved to {model_path} ---")

if __name__ == "__main__":
    asyncio.run(main())