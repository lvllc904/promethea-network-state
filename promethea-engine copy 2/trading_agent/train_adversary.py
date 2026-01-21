import polars as pl
from trading_agent.adversarial_agent import AdversarialAgent
from trading_agent.adversarial_environment import AdversarialEnv
from trading_agent.Services.data_providers import AlpacaProvider
from promethea.providers.yfinance_provider import YFinanceProvider
import asyncio

def train_adversary():
    # 1. Fetch Historical Data (we need a static dataset for the environment)
    # For this script, we'll use a small slice or mock data if API fails, 
    # but ideally we fetch real data.
    print("--- Fetching historical data for training environment... ---")
    alpaca_provider = AlpacaProvider()
    yf_provider = YFinanceProvider()
    df = None

    # Try Alpaca first
    try:
        print("Attempting to fetch from Alpaca...")
        df = asyncio.run(alpaca_provider.fetch_data("SPY", days=365, interval='daily'))
    except Exception as e:
        print(f"Alpaca fetch failed: {e}")

    # Fallback to YFinance if Alpaca failed or returned empty
    if df is None or df.height < 100:
        print("--- Alpaca data insufficient. Falling back to YFinance... ---")
        try:
            # YFinanceProvider is now async
            df = asyncio.run(yf_provider.fetch_data("SPY", days=365))
        except Exception as e:
            print(f"YFinance fetch failed: {e}")
            return

    if df.height < 100:
        print("Not enough data to train.")
        return

    # 2. Configure Main Agent (Victim)
    main_agent_config = {
        "symbol": "SPY",
        "strategy": "generative", # Assumes this strategy exists in the agent
        "risk_tolerance": 0.5,
        "state_dim": 40,
        "embed_dim": 128,
        "num_heads": 8,
        "ff_dim": 128,
        "weights_path": "trading_agent/models/promethea_world_model_v1.pth"
    }

    # 3. Initialize Environment
    env = AdversarialEnv(historical_data=df, main_agent_config=main_agent_config)

    # 4. Initialize Adversarial Agent
    adversary = AdversarialAgent()

    # 5. Train
    adversary.train(env, total_timesteps=5000, save_path="trading_agent/models/adversarial_model_v1")

if __name__ == "__main__":
    train_adversary()
