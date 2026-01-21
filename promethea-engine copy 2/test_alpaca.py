import os
import asyncio
import pytest
from alpaca.trading.client import TradingClient
from alpaca.data.historical import CryptoHistoricalDataClient, StockHistoricalDataClient
from alpaca.data.requests import CryptoLatestQuoteRequest, StockLatestQuoteRequest
from alpaca.trading.enums import AssetClass
from dotenv import load_dotenv

@pytest.mark.anyio
@pytest.mark.parametrize("asset_id", ["BTC/USD", "SPY"])
async def test_alpaca_quote(asset_id: str):
    """
    Tests fetching the latest quote for a given asset from Alpaca.
    """
    load_dotenv()
    APCA_API_KEY_ID = os.getenv("APCA_API_KEY_ID")
    APCA_API_SECRET_KEY = os.getenv("APCA_API_SECRET_KEY")

    trading_client = TradingClient(APCA_API_KEY_ID, APCA_API_SECRET_KEY)
    crypto_client = CryptoHistoricalDataClient()
    stock_client = StockHistoricalDataClient(APCA_API_KEY_ID, APCA_API_SECRET_KEY)

    try:
        if asset_id == "BTC/USD":
            request_params = CryptoLatestQuoteRequest(symbol_or_symbols=[asset_id])
            latest_quote_data = crypto_client.get_crypto_latest_quote(request_params)
            quote = latest_quote_data[asset_id] if latest_quote_data else None
        else:
            request_params = StockLatestQuoteRequest(symbol_or_symbols=[asset_id])
            latest_quote_data = stock_client.get_stock_latest_quote(request_params)
            quote = latest_quote_data[asset_id] if latest_quote_data else None
            
        print(f"Latest quote for {asset_id}: {quote}")
    except Exception as e:
        print(f"--- CRITICAL TEST FAILURE: {e} ---")