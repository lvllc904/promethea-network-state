import asyncio
import sys
from pathlib import Path
from sqlalchemy.orm import Session
from datetime import datetime

# Add the project root to the Python path to allow for absolute imports
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

# Import our services and database components
from trading_agent.Services.data_providers import AlpacaProvider, FREDProvider
from trading_agent.Services.database import SessionLocal, TradableAsset, EconomicIndicator, AssetClass

async def populate_tradable_assets(db: Session, alpaca_provider: AlpacaProvider):
    """
    Performs the API handshake and populates the tradable_assets table,
    now with robust data cleaning.
    """
    print("--- Populating Tradable Assets Table ---")
    try:
        if not alpaca_provider.handshake_service._is_initialized:
            await alpaca_provider.handshake_service.initialize()
        
        asset_map = alpaca_provider.handshake_service.asset_info_map
        if not asset_map:
            print("--- ERROR: Handshake completed but no assets were discovered. Aborting. ---")
            return

        print(f"Discovered {len(asset_map)} assets. Synchronizing with database...")
        
        assets_in_db = {a[0] for a in db.query(TradableAsset.symbol).all()}
        new_assets_count = 0
        skipped_assets_count = 0

        for asset_key, asset_info in asset_map.items():
            # MODIFICATION: This is the critical data validation fix.
            # If the asset has no name or no symbol, we skip it.
            if not asset_info.get('name') or not asset_info.get('symbol'):
                skipped_assets_count += 1
                continue

            if asset_info['symbol'] not in assets_in_db:
                asset_class_enum = AssetClass.CRYPTO if str(asset_info['class']) == 'AssetClass.CRYPTO' else AssetClass.US_EQUITY

                new_asset = TradableAsset(
                    name=asset_info['name'],
                    symbol=asset_info['symbol'],
                    asset_class=asset_class_enum
                )
                db.add(new_asset)
                new_assets_count += 1
        
        if new_assets_count > 0:
            db.commit()
            print(f"✅ Successfully added {new_assets_count} new assets to the database.")
        else:
            print("Database is already up-to-date with all discovered assets.")
            
        if skipped_assets_count > 0:
            print(f"--- INFO: Skipped {skipped_assets_count} assets due to missing name or symbol data from the API. ---")

    except Exception as e:
        db.rollback()
        print(f"--- FATAL ERROR during asset population: {e} ---")

async def populate_economic_indicators(db: Session, fred_provider: FREDProvider):
    """
    Fetches the latest data from FRED and populates the economic_indicators table.
    """
    print("\n--- Populating Economic Indicators Table ---")
    try:
        economic_data = await fred_provider.fetch_data()
        if economic_data is None or economic_data.empty:
            print("--- ERROR: Could not fetch economic data from FRED. Aborting. ---")
            return
            
        for indicator_name, value in economic_data.items():
            indicator_in_db = db.query(EconomicIndicator).filter_by(indicator_name=indicator_name).first()
            
            if indicator_in_db:
                indicator_in_db.value = value
                indicator_in_db.last_updated = datetime.utcnow()
            else:
                new_indicator = EconomicIndicator(
                    indicator_name=indicator_name,
                    value=value
                )
                db.add(new_indicator)
        
        db.commit()
        print(f"✅ Successfully populated/updated {len(economic_data)} economic indicators.")

    except Exception as e:
        db.rollback()
        print(f"--- FATAL ERROR during economic indicator population: {e} ---")


async def main():
    """
    Main function to orchestrate the database population.
    """
    print("--- Starting Master Data Population Utility ---")
    db: Session = SessionLocal()
    
    alpaca_provider = AlpacaProvider()
    fred_provider = FREDProvider()

    try:
        await populate_tradable_assets(db, alpaca_provider)
        await populate_economic_indicators(db, fred_provider)
    finally:
        db.close()
        print("\n--- Population script finished. ---")


if __name__ == "__main__":
    asyncio.run(main())