import asyncio
from trading_agent.Services.data_service import DataService
from trading_agent.Services.data_providers import AlpacaProvider

async def test_data_service():
    print("--- Testing DataService Provider Integration ---")
    
    # Mock AlpacaProvider to avoid needing real API keys for this test if possible,
    # or just rely on the fact that we might fail on Alpaca but succeed on others.
    # For now, let's assume the environment has keys or we'll catch the error.
    
    try:
        service = DataService(asset_id="SPY")
        print("DataService initialized.")
        
        # Test individual providers
        print("\nTesting Google Trends...")
        trends = service._fetch_trends()
        print(f"Trends: {trends}")
        
        print("\nTesting Put/Call Ratio...")
        pc_ratio = service._fetch_put_call_ratio()
        print(f"Put/Call Ratio: {pc_ratio}")
        
        print("\nTesting Discourse...")
        discourse = service._fetch_discourse()
        print(f"Discourse Vector: {discourse}")
        
        print("\nTesting COT...")
        cot = service._fetch_cot()
        print(f"COT Data: {cot}")
        
        print("\n--- DataService Test Complete ---")
        
    except Exception as e:
        print(f"DataService Test Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_data_service())
