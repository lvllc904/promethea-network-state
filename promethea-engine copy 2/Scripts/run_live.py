import asyncio
import logging
import sys
import os
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

from trading_agent.engine import TradingEngine
from trading_agent.engine import TradingEngine
from trading_agent.Services.database import SessionLocal, Base, engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

async def main():
    logging.info("--- Starting Promethea Trading Engine (Live/Paper Mode) ---")
    
    # Ensure database tables exist
    logging.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    logging.info("Database schema initialized.")
    
    try:
        db_session = SessionLocal()
        trading_engine = TradingEngine(db_session=db_session)
        await trading_engine.start()
    except KeyboardInterrupt:
        logging.info("--- Engine stopped by user ---")
    except Exception as e:
        logging.error(f"--- Fatal Error: {e} ---", exc_info=True)
    finally:
        logging.info("--- Exiting ---")

if __name__ == "__main__":
    asyncio.run(main())
