# /Users/officeone/promethea-engine/trading_agent/backfill.py

import pandas as pd
from sqlalchemy.orm import Session
# We import the tools to connect to our database and the tables themselves
from Services.database import SessionLocal, Asset, MarketData
# We import the EquityAdapter we just built
from Services.adapters import EquityAdapter

def get_or_create_asset(db_session: Session, symbol: str, asset_class: str, adapter_name: str) -> Asset:
    """
    This is a helper function to keep our database clean.
    It checks if a stock symbol already exists in our 'assets' table.
    If not, it creates it. This prevents duplicate entries.
    It returns the Asset database object.
    """
    asset = db_session.query(Asset).filter(Asset.asset_symbol == symbol).first()
    if not asset:
        print(f"Asset '{symbol}' not found in DB. Creating new entry.")
        asset = Asset(
            asset_symbol=symbol,
            asset_class=asset_class,
            asset_adapter=adapter_name
        )
        db_session.add(asset)
        db_session.commit()
        db_session.refresh(asset)
    return asset

def run_backfill():
    """
    Main function to run the historical data backfill process.
    """
    print("--- Starting Historical Data Backfill ---")

    db = SessionLocal()
    adapter = EquityAdapter()

    # --- Define the universe of assets we want to backfill ---
    # We can add any stock ticker supported by Yahoo Finance here.
    asset_universe = {
        'SPY': 'EQUITY',
        'QQQ': 'EQUITY',
        'TSLA': 'EQUITY',
        'AAPL': 'EQUITY',
        'GOOG': 'EQUITY'
    }

    start_date = "2005-01-01"
    # Use a recent date to ensure we have the most current data.
    end_date = pd.to_datetime("today").strftime('%Y-%m-%d')

    for symbol, asset_class in asset_universe.items():
        print(f"\n--- Processing asset: {symbol} ---")

        # 1. Get or create the asset entry in our 'assets' table.
        asset_obj = get_or_create_asset(db, symbol, asset_class, "EquityAdapter")

        # 2. Use the adapter to fetch and process 20 years of data.
        # This calls the code from our adapters.py file.
        data_df = adapter.fetch_and_process_data(
            ticker=symbol,
            start_date=start_date,
            end_date=end_date
        )

        if data_df.empty:
            print(f"No data returned for {symbol}. Skipping database insertion.")
            continue

        # 3. Prepare data for bulk insertion into our 'market_data' table.
        # We add the 'asset_id' to every row so the database knows which stock it belongs to.
        data_df['asset_id'] = asset_obj.id

        # Convert the entire DataFrame into a list of dictionaries.
        # This is the format SQLAlchemy uses for efficient insertions.
        records_to_insert = data_df.to_dict(orient='records')

        print(f"Inserting {len(records_to_insert)} records for {symbol} into the database...")

        # 4. Insert the data into the 'market_data' table.
        # We use 'merge' instead of 'add'. This is a smart way to insert data
        # that also prevents creating duplicate rows if we ever run this script again.
        db.bulk_insert_mappings(MarketData, records_to_insert)

        # 5. Commit the transaction to save the data for this asset to the database.
        db.commit()
        print(f"Successfully saved data for {symbol}.")

    db.close()
    print("\n--- Historical Data Backfill Complete ---")


if __name__ == "__main__":
    run_backfill()