import asyncio
import logging
from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# MODIFICATION: Import database components and the TradingEngine
from .Services.database import get_db, PortfolioHistoryDB, TradeDB, PatternDB
from .Services.websocket_manager import manager
from .Services.log_broadcaster import WebSocketLogHandler
from .engine import TradingEngine
from .Services.database import SessionLocal

# This is the main application instance
app = FastAPI()

# --- Engine Singleton ---
# In a simple, single-worker setup, a global variable can manage the engine instance.
# For multi-worker production apps, this state should be in a shared store like Redis.
class EngineManager:
    def __init__(self):
        self.engine: TradingEngine | None = None
        self.task: asyncio.Task | None = None

engine_manager = EngineManager()

@app.on_event("startup")
def startup_event():
    """Initializes the TradingEngine and Pub/Sub subscriber on application startup."""
    # Configure logging
    log_handler = WebSocketLogHandler()
    logging.basicConfig(level=logging.INFO, handlers=[log_handler, logging.StreamHandler()])

    # Initialize the engine
    db_session = SessionLocal()
    engine_manager.engine = TradingEngine(db_session=db_session)
    print("FastAPI App started. Engine instance created.")

    # Start the Pub/Sub subscriber in a background thread
    # Start the Pub/Sub subscriber in a background thread
    # from .Services.inbound_event_service import subscribe_to_inbound_events
    # import threading
    #
    # subscriber_thread = threading.Thread(target=subscribe_to_inbound_events, daemon=True)
    # subscriber_thread.start()
    # logging.info("Pub/Sub subscriber started in a background thread.")
    logging.info("Pub/Sub subscriber disabled for local run.")

# --- Root Endpoint for Health Checks ---
@app.get("/")
async def read_root():
    return {"message": "Trading Agent API is running"}

# --- Portfolio Summary Endpoint ---

# 1. Define a Pydantic model for the response data structure.
#    This ensures your API returns consistent and validated data.
class PortfolioSummary(BaseModel):
    total_value: float
    pnl_24h: float
    pnl_percent_24h: float

# 2. Create the API endpoint using the @app.get decorator.
#    Make sure the path "/api/portfolio/summary" is exactly correct.
@app.get("/api/portfolio/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(db: Session = Depends(get_db)):
    """
    Provides a summary of the portfolio's performance over the last 24 hours
    by querying the live portfolio_history table.
    """
    try:
        # Get the most recent portfolio value
        latest_point = db.query(PortfolioHistoryDB).order_by(PortfolioHistoryDB.timestamp.desc()).first()
        if not latest_point:
            return PortfolioSummary(total_value=100000, pnl_24h=0, pnl_percent_24h=0)

        # Get the portfolio value from ~24 hours ago
        time_24_hours_ago = datetime.utcnow() - timedelta(hours=24)
        point_24h_ago = db.query(PortfolioHistoryDB)\
            .filter(PortfolioHistoryDB.timestamp <= time_24_hours_ago)\
            .order_by(PortfolioHistoryDB.timestamp.desc())\
            .first()

        start_value = point_24h_ago.value if point_24h_ago else latest_point.value

        pnl_24h = latest_point.value - start_value
        pnl_percent_24h = (pnl_24h / start_value) * 100 if start_value != 0 else 0

        return PortfolioSummary(
            total_value=latest_point.value,
            pnl_24h=pnl_24h,
            pnl_percent_24h=pnl_percent_24h
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

# --- Portfolio History Endpoint ---

class PortfolioHistoryPoint(BaseModel):
    timestamp: datetime
    value: float
    
    class Config:
        from_attributes = True

@app.get("/api/portfolio/history", response_model=List[PortfolioHistoryPoint])
async def get_portfolio_history(days: int = 30, db: Session = Depends(get_db)):
    """
    Provides historical data points for the main portfolio chart.
    Fetches live data from the portfolio_history table.
    """
    try:
        time_limit = datetime.utcnow() - timedelta(days=days)
        history_points = db.query(PortfolioHistoryDB)\
            .filter(PortfolioHistoryDB.timestamp >= time_limit)\
            .order_by(PortfolioHistoryDB.timestamp.asc())\
            .all()
        return history_points
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

# --- Agent Memory Endpoint ---

class PatternRecord(BaseModel):
    id: int
    timestamp: datetime
    outcome: str
    confidence: float
    
    class Config:
        from_attributes = True

@app.get("/api/agent/memory", response_model=List[PatternRecord])
async def get_agent_memory(limit: int = 50, db: Session = Depends(get_db)):
    """
    Provides a list of the agent's saved memory patterns.
    Fetches live data from the patterns table.
    """
    try:
        patterns = db.query(PatternDB).order_by(PatternDB.timestamp.desc()).limit(limit).all()
        return patterns
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

# --- Engine Control Endpoints ---

@app.post("/api/engine/start", status_code=200)
async def start_engine():
    """Starts the trading engine's main operational loop."""
    if engine_manager.engine and not engine_manager.engine.is_running:
        engine_manager.task = asyncio.create_task(engine_manager.engine.start())
        return {"message": "Trading engine started."}
    return {"message": "Engine is already running."}

@app.post("/api/engine/stop", status_code=200)
async def stop_engine():
    """Stops the trading engine's main operational loop gracefully."""
    if engine_manager.engine and engine_manager.engine.is_running:
        engine_manager.engine.stop()
        if engine_manager.task:
            await engine_manager.task # Wait for the loop to finish the current cycle
        return {"message": "Trading engine stopping."}
    return {"message": "Engine is not running."}

@app.get("/api/engine/status")
async def get_engine_status():
    """Gets the current running status of the trading engine."""
    if engine_manager.engine:
        return {"is_running": engine_manager.engine.is_running}
    return {"is_running": False}

# --- WebSocket Endpoint for Live Logs ---

@app.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    """Handles the WebSocket connection for the live log stream."""
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Keep the connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logging.info("A client disconnected from the log stream.")