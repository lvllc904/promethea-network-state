from pydantic_settings import BaseSettings
from typing import Dict, Any
from functools import lru_cache
from pathlib import Path

class Settings(BaseSettings):
    """
    Defines the application's configuration settings, loaded from environment
    variables or a .env file.
    """
    # --- Engine Settings ---
    # --- Engine Settings ---
    cycle_interval: int = 60  # Time in seconds between agent cycles
    error_retry_delay: int = 300 # Time to wait after an error before retrying
    trade_amount_usd: float = 100.0 # Notional value for each trade
    trading_mode: str = "live" # "paper" or "live"

    # --- API Keys ---
    fred_api_key: str
    apca_api_key_id: str
    apca_api_secret_key: str
    google_api_key: str
    reddit_client_id: str
    reddit_client_secret: str
    reddit_user_agent: str

    # --- MCP Client ---
    mcp_server_base_url: str = "http://localhost:4003/api"
    did: str = "did:prmth:promethean-engine-alpha"
    signing_key: str = "dev-key-123"
    # --- Agent Configuration ---
    # This dictionary MUST match the model architecture and training parameters.
    agent_config: Dict[str, Any] = {
        "asset_id": "bitcoin", # The primary asset the agent will focus on.
        "state_dim": 40, # This is the true feature count from the DataService.
        "embed_dim": 128,
        "num_heads": 8,
        "ff_dim": 128,
        # Use absolute path for weights to ensure they are found
        "weights_path": str(Path(__file__).resolve().parent / "models" / "promethea_world_model_v1.pth"),
        "mcts_simulations": 50,
        "mcts_exploration_factor": 1.41,
        # This manifest MUST match the order of features from DataService._get_feature_manifest
        # This has been updated to match the 12 indicators from _get_core_technical_vector
        "feature_manifest": [
            'price', 'price_change_1', 'volatility_20', 'RSI_14', 
            'MACD_12_26_9', 'MACDh_12_26_9', 'MACDs_12_26_9', 
            'SMA_7', 'SMA_20', 'BBL_20_2.0', 'BBM_20_2.0', 'BBU_20_2.0'
        ]
    }

    class Config:
        # This tells Pydantic to look for a .env file in the project root.
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = 'ignore' # Ignore extra fields found in the .env file

@lru_cache()
def get_settings() -> Settings:
    """Returns a cached instance of the Settings object."""
    return Settings()