import pytest
import os
from pathlib import Path
import sys
 
# Add the project root to the Python path to allow for absolute imports
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(PROJECT_ROOT))

from promethea.utils import load_project_env

# Load environment variables for the test
load_project_env()

from promethea.providers.discourse_provider import DiscourseProvider

# NOTE: This is an integration test and requires a .env file with Reddit API credentials.
# It will be skipped if credentials are not found.
def test_discourse_provider_fetch_and_parse():
    """
    Integration test for the DiscourseProvider.
    This test makes live calls to the Reddit API to confirm that the
    scraping and counting mechanism is working correctly.
    """
    print("\n--- Starting Discourse Provider Test ---")
    provider = DiscourseProvider()
    
    # The scan_narratives method should return a dictionary of counts.
    discourse_counts = provider.scan_narratives()

    print(f"Fetched Discourse Counts: {discourse_counts}")
    
    # Assert that the output is a dictionary with the expected strategy keys.
    assert isinstance(discourse_counts, dict)
    expected_keys = ['hodl', 'squeeze', 'value', 'bubble']
    assert all(key in discourse_counts for key in expected_keys)
    
    # Assert that the values are integers (counts).
    assert all(isinstance(v, int) for v in discourse_counts.values())
    print("--- Discourse Provider Test Complete ---")