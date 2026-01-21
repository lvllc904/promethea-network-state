import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Date
from sqlalchemy.orm import declarative_base

# Define the base class for declarative models
Base = declarative_base()

def create_db_engine():
    """
    Creates a SQLAlchemy engine for the PostgreSQL database using synchronized credentials.
    """
    # CRITICAL FIX: Hardcode the known correct credentials from the running Docker container
    # to bypass any stale .env files or environment variables. This is the "Nuclear Option".
    db_user = "promethea_user"
    db_password = "promethea_password"
    db_name = "promethea_db"
    db_host = "localhost" # Must use 'localhost' for local connectivity
    db_url = f"postgresql://{db_user}:{db_password}@{db_host}:5432/{db_name}"
    return create_engine(db_url)

class Discourse(Base):
    """
    SQLAlchemy model to store daily counts of strategy-related keywords
    found in financial discourse.
    """
    __tablename__ = 'discourse'

    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False, index=True)
    strategy = Column(String, nullable=False, index=True)
    count = Column(Integer, nullable=False)