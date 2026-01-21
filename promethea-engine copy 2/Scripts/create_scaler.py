import asyncio
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler
from tqdm import tqdm
import sys
from pathlib import Path

# Add the project root to the Python path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

from trading_agent.Services.data_service import DataService
from promethea.providers.yfinance_provider import YFinanceProvider

# --- CONFIGURATION ---
NUM_DAYS_FOR_SCALER = 365
ASSET_ID = "BTC-USD"
SCALER_OUTPUT_PATH = PROJECT_ROOT / "trading_agent/models/unified_state_scaler.gz"

async def create_scaler():
    """
    Fetches a large amount of historical data, generates unnormalized state vectors,
    and fits a StandardScaler to the data.
    """
    print(f"--- Creating and fitting scaler for asset '{ASSET_ID}' ---")
    print(f"Fetching {NUM_DAYS_FOR_SCALER} days of historical data...")

    # Use YFinanceProvider to avoid Alpaca limits
    yf_provider = YFinanceProvider()
    data_service = DataService(asset_id=ASSET_ID, market_provider=yf_provider)
    
    data_cache = await data_service._fetch_all_data(days=NUM_DAYS_FOR_SCALER)
    primary_data = data_cache.get('primary')

    if primary_data is None or primary_data.is_empty():
        print("\n--- ERROR: Could not fetch primary data. Aborting scaler creation. ---")
        return

    all_state_vectors = []
    print("\nGenerating historical state vectors to fit the scaler...")
    for i in tqdm(range(1, len(primary_data)), desc="Generating vectors"):
        # Call the function with normalize=False to get the raw data
        # Inject a mock portfolio state so the vector has the correct shape (40 features)
        result = await data_service.get_unified_state_vector(
            data_cache=data_cache, 
            historical_slice=i, 
            normalize=False,
            portfolio_state={'cash': 10000.0, 'asset_quantity': 0.0} 
        )
        
        if result is not None and not isinstance(result, Exception):
            state_vec, _ = result
            # DEBUG: Print shape if it changes or for the first few
            if i < 3:
                print(f"Vector {i} shape: {state_vec.shape}")
            
            if len(all_state_vectors) > 0 and state_vec.shape != all_state_vectors[0].shape:
                print(f"--- SHAPE MISMATCH AT INDEX {i} ---")
                print(f"Expected: {all_state_vectors[0].shape}, Got: {state_vec.shape}")
            
            all_state_vectors.append(state_vec)

    if not all_state_vectors:
        print("\n--- ERROR: No state vectors were generated. Aborting scaler creation. ---")
        return

    print(f"\nFitting scaler on {len(all_state_vectors)} state vectors...")
    scaler = StandardScaler()
    scaler.fit(all_state_vectors)

    SCALER_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(scaler, SCALER_OUTPUT_PATH)
    
    print(f"\n✅ Scaler created successfully and saved to: {SCALER_OUTPUT_PATH}")

if __name__ == "__main__":
    asyncio.run(create_scaler())