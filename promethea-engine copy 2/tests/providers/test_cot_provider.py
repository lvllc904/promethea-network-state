import pytest
from pathlib import Path
import sys
import polars as pl  # Add this import

# Add the project root to the Python path to allow for absolute imports
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(PROJECT_ROOT))

from promethea.providers.cot_provider import COTProvider

def test_unified_cot_provider():
    """
    Integration test for the unified COTProvider.
    This test makes live calls to the CFTC website, combines the reports,
    and then tests querying for a contract.
    """
    print("\n--- Starting Unified COT Provider Test ---")
    provider = COTProvider()

    # --- Test 1: Query for a Financial Contract (S&P 500) ---
    print("\n--- Querying for Financial Contract (S&P 500 E-mini)... ---")
    sp500_code = '13874A'
    sp500_pos = provider.get_net_speculative_positioning(contract_code=sp500_code)

    if sp500_pos is not None:
        print(f"Fetched S&P 500 Positioning: {sp500_pos:.4f}")
        assert isinstance(sp500_pos, float)
    else:
        pytest.fail(f"Could not fetch positioning for {sp500_code}")

def test_get_net_speculative_positioning():
    """
    Integration test for the COTProvider.
    This test makes a live call to the CFTC website to download and parse the report.
    It verifies that the provider can fetch and process the data successfully.
    """
    print("\n--- Starting Live COT Provider Test ---")
    provider = COTProvider()
    contract_code = '13874A'  # S&P 500 E-mini
    net_positioning = provider.get_net_speculative_positioning(contract_code)
    # Print human-readable market name for review
    market_row = provider._unified_data.filter(pl.col("Contract_Code") == contract_code)
    if not market_row.is_empty():
        market_names = market_row.select(pl.col("Market_Name")).to_series().to_list()
        print(f"Contract code {contract_code} corresponds to market: {market_names}")
    print(f"--- Results ---")
    if net_positioning is None:
        print("No net speculative positioning found for contract code.")
        assert False, "Provider did not return a value for net speculative positioning."
    else:
        print(f"Fetched Net Speculative Positioning: {net_positioning:.4f}")
        assert isinstance(net_positioning, float), "Provider should return a float"
        assert -1.0 <= net_positioning <= 1.0, "Result should be a normalized value between -1.0 and 1.0"
        # A loose check to ensure it's not just returning the default 0.0 on a silent failure.
        # This might fail if the market is perfectly neutral, but that's very unlikely.
        assert net_positioning != 0.0, "Result was exactly 0.0, which might indicate a parsing failure."
    print("--- Live COT Provider Test Complete ---")

def test_get_crowdedness_vector():
    """
    Test the get_crowdedness_vector method for a basket of contract codes.
    Ensures the method returns a list of floats/None and handles missing codes gracefully.
    """
    print("\n--- Testing get_crowdedness_vector ---")
    provider = COTProvider()
    # Use a mix of known and likely-unknown contract codes
    contract_codes = ['13874A', '001602', 'FAKECODE']
    vector = provider.get_crowdedness_vector(contract_codes)
    print(f"Input contract codes: {contract_codes}")
    print(f"Output crowdedness vector: {vector}")
    assert isinstance(vector, list), "Output should be a list"
    assert len(vector) == len(contract_codes), "Output vector length should match input codes"
    # Check that known codes return floats or None, and unknown codes return None
    for code, value in zip(contract_codes, vector):
        if code == 'FAKECODE':
            assert value is None, "Unknown contract code should return None"
        else:
            assert value is None or isinstance(value, float), "Known codes should return float or None if missing"
    print("--- get_crowdedness_vector test complete ---")