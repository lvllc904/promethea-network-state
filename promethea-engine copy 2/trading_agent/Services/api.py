# Suggested content for /Users/officeone/trading_system/trading_agent/Services/api.py

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict

from sqlalchemy.orm import Session, joinedload
from .database import SessionLocal, engine, Base, get_db, Asset, AgentConfiguration, Trade
from datetime import datetime

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Promethea Cockpit API",
    description="API for monitoring and controlling the Promethea Generative Agent framework.",
    version="2.0.0-alpha",
)

# --- Global Engine Status ---
# This flag provides a master control to pause all trading activity.
# NOTE: This global variable will not be shared across multiple worker processes.
# For a production, multi-worker deployment, this state should be managed
# in a shared store like Redis or the database.
_is_engine_active = True

# --- Pydantic Models for API Responses ---

class AssetResponse(BaseModel):
    id: int
    asset_symbol: str
    asset_class: str
    is_tradable: bool

    class Config:
        orm_mode = True

class AgentConfigResponse(BaseModel):
    id: int
    asset_id: int
    version: int
    is_active: bool
    mcts_simulations: int
    world_model_weights_path: str

    class Config:
        orm_mode = True

class TradeResponse(BaseModel):
    id: int
    timestamp: datetime
    asset_symbol: str
    trade_type: str
    quantity: float
    price: float
    
    class Config:
        orm_mode = True

# --- API Endpoints ---

@app.get("/api/v2/health")
def health_check():
    """A simple health check endpoint."""
    return {"status": "ok", "engine_active": _is_engine_active}

@app.post("/api/v2/engine/pause", status_code=200)
def pause_engine():
    """Pauses the entire Promethea trading engine globally."""
    global _is_engine_active
    _is_engine_active = False
    return {"message": "Promethea engine has been paused. No new trades will be executed."}

@app.post("/api/v2/engine/resume", status_code=200)
def resume_engine():
    """Resumes the Promethea trading engine globally."""
    global _is_engine_active
    _is_engine_active = True
    return {"message": "Promethea engine is now active."}

@app.get("/api/v2/assets", response_model=List[AssetResponse])
def get_all_assets(db: Session = Depends(get_db)):
    """Returns a list of all assets the system is aware of."""
    assets = db.query(Asset).all()
    return assets

@app.get("/api/v2/assets/{asset_id}/configurations", response_model=List[AgentConfigResponse])
def get_agent_configurations_for_asset(asset_id: int, db: Session = Depends(get_db)):
    """Returns all agent configurations for a specific asset."""
    configs = db.query(AgentConfiguration).filter(AgentConfiguration.asset_id == asset_id).all()
    if not configs:
        raise HTTPException(status_code=404, detail=f"No configurations found for asset ID {asset_id}")
    return configs

@app.post("/api/v2/configurations/{config_id}/activate", response_model=AgentConfigResponse)
def activate_agent_configuration(config_id: int, db: Session = Depends(get_db)):
    """
    Activates a specific agent configuration for an asset, deactivating all others for that asset.
    """
    target_config = db.query(AgentConfiguration).filter(AgentConfiguration.id == config_id).first()
    if not target_config:
        raise HTTPException(status_code=404, detail="Configuration not found")

    # Deactivate all other configs for this asset
    db.query(AgentConfiguration).filter(
        AgentConfiguration.asset_id == target_config.asset_id,
        AgentConfiguration.id != config_id
    ).update({"is_active": False})
    
    # Activate the target config
    target_config.is_active = True
    try:
        db.commit()
        db.refresh(target_config)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error occurred: {e}")

    return target_config

@app.get("/api/v2/trades/recent", response_model=List[TradeResponse])
def get_recent_trades(limit: int = 100, db: Session = Depends(get_db)):
    """
    Returns a list of the most recent trades executed by the system.
    """
    # Use joinedload to efficiently fetch the related Asset in the same query
    # This avoids the "N+1" query problem.
    trades = (
        db.query(Trade)
        .options(joinedload(Trade.asset))
        .order_by(Trade.timestamp.desc())
        .limit(limit)
        .all()
    )
    
    # Use a list comprehension for a more concise and Pythonic construction.
    return [
        TradeResponse(
            id=trade.id,
            timestamp=trade.timestamp,
            asset_symbol=trade.asset.asset_symbol,
            trade_type=trade.trade_type,
            quantity=float(trade.quantity),
            price=float(trade.price)
        ) for trade in trades
    ]