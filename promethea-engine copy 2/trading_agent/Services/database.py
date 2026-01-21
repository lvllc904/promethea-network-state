from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Enum as SQLAlchemyEnum
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.sql import func
import enum

# --- DATABASE CONFIGURATION ---
# --- DATABASE CONFIGURATION ---
# Switch to SQLite for easier local deployment without external dependencies
DATABASE_URL = "sqlite:///./promethea.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- ENUM DEFINITIONS ---
# Using enums makes the data in our database more robust and readable.
class AssetClass(enum.Enum):
    CRYPTO = "crypto"
    US_EQUITY = "us_equity"

class TradeType(enum.Enum):
    BUY = "BUY"
    SELL = "SELL"

# --- EXISTING TABLE DEFINITIONS ---
# These are the tables you had previously for tracking agent performance.
# We will keep them as they are essential for the Analysis Service.

class TradeDB(Base):
    __tablename__ = "trades"
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, index=True)
    trade_type = Column(SQLAlchemyEnum(TradeType))
    quantity = Column(Float)
    price = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String, nullable=True)

class PortfolioHistoryDB(Base):
    __tablename__ = "portfolio_history"
    id = Column(Integer, primary_key=True, index=True)
    value = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

# --- NEW TABLE DEFINITIONS (Phase 1, Step 1) ---
# These two new tables form the core of our new data-first architecture.

class TradableAsset(Base):
    """
    This table is our master "phonebook" of all assets.
    It's populated once by the ApiHandshakeService and then loaded from here
    on subsequent runs to make startup incredibly fast.
    """
    __tablename__ = "tradable_assets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    symbol = Column(String, unique=True, index=True)
    asset_class = Column(SQLAlchemyEnum(AssetClass))
    last_updated = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class EconomicIndicator(Base):
    """
    This table is our intelligent cache for slow-moving macroeconomic data.
    Our FREDProvider will read from this table first, and only make an API call
    if the data is missing or has become "stale."
    """
    __tablename__ = "economic_indicators"
    id = Column(Integer, primary_key=True, index=True)
    indicator_name = Column(String, unique=True, index=True)
    value = Column(Float)
    update_interval_hours = Column(Integer, default=24) # e.g., 24 for daily, 720 for monthly
    last_updated = Column(DateTime(timezone=True), server_default=func.now())

class PatternDB(Base):
    """
    This table stores the "memories" of the agent. When the AnalysisService
    identifies a surprising or significant event, a record is created here,
    capturing the market state and the outcome.
    """
    __tablename__ = "patterns"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    outcome = Column(String, index=True)
    confidence = Column(Float)
    # In a more advanced version, this could be a JSONB column storing the full state vector

def get_db():
    """Dependency function to get a new database session for each request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
