import requests
import zipfile
import io
import csv
from datetime import datetime
import time

class COTProvider:
    """
    Fetches and parses Commitment of Traders (COT) reports from the CFTC to
    calculate the Crowdedness Indicator (C_t_crowd) as defined in the roadmap.

    This indicator uses net speculative positioning as a proxy for how
    crowded a trade is.
    """

    def __init__(self):
        """
        Initializes the provider with the CFTC data URL and a mapping of
        common asset names to their official COT report names.
        """
        current_year = datetime.now().year
        # URL for the "Futures Only" report, short format, for the current year.
        self.cftc_url = f"https://www.cftc.gov/files/dea/history/fut_fin_txt_{current_year}.zip"
        # Add a simple cache to avoid hitting the API too frequently
        self._cache = {}
        self._cache_ttl = 86400  # 24 hours, as the report is weekly
        
        # This mapping is crucial to find the correct contract in the report.
        # It maps a general asset_id to the 'Market_and_Exchange_Names' field in the COT file.
        self.contract_mapping = {
            'sp500': 'S&P 500 STOCK INDEX - CHICAGO MERCANTILE EXCHANGE',
            'nasdaq': 'NASDAQ-100 STOCK INDEX (MINI) - CHICAGO MERCANTILE EXCHANGE',
            'gold': 'GOLD - COMMODITY EXCHANGE INC.',
            'treasury': '10-YEAR U.S. TREASURY NOTES - CHICAGO BOARD OF TRADE',
            'ethereum': 'ETHEREUM - CHICAGO MERCANTILE EXCHANGE',
            'bitcoin': 'BITCOIN - CHICAGO MERCANTILE EXCHANGE',
        }

    def get_net_speculative_positioning(self, asset_id: str) -> float:
        """
        Downloads the latest COT report, finds the relevant contract, and
        calculates the net speculative position.

        Net Position = Non-Commercial (Long) - Non-Commercial (Short)

        Args:
            asset_id: The common name for the asset (e.g., 'sp500', 'gold').

        Returns:
            A float representing the net speculative position.
            Returns 0.0 if the asset is not found or data cannot be fetched.
        """
        if asset_id not in self.contract_mapping:
            # This asset doesn't have a corresponding futures contract we're tracking.
            return 0.0 # No data is the correct state here.

        # Check cache first
        current_time = time.time()
        if asset_id in self._cache:
            cached_data, timestamp = self._cache[asset_id]
            if current_time - timestamp < self._cache_ttl:
                return cached_data

        try:
            # 1. Fetch the zip file
            response = requests.get(self.cftc_url)
            response.raise_for_status()

            # 2. Unzip the file in memory
            with zipfile.ZipFile(io.BytesIO(response.content)) as z:
                # Find the actual filename inside the zip (e.g., 'FinFut.txt')
                report_filename = z.namelist()[0]
                with z.open(report_filename) as f:
                    # 3. Read and decode the CSV content
                    # We use DictReader for easy access by column name.
                    content = f.read().decode('utf-8')
                    reader = csv.DictReader(io.StringIO(content))
                    
                    target_contract_name = self.contract_mapping[asset_id]

                    # 4 & 5. Iterate through rows to find the matching contract
                    for row in reader:
                        market_name = row.get('Market_and_Exchange_Names', '').strip()
                        if market_name == target_contract_name:
                            # 6. Extract long and short positions
                            long_pos = float(row.get('NonComm_Positions_Long_All', 0.0))
                            short_pos = float(row.get('NonComm_Positions_Short_All', 0.0))
                            
                            # 7. Calculate and return net position
                            c_t_crowd = long_pos - short_pos
                            # Store result in cache
                            self._cache[asset_id] = (c_t_crowd, current_time)
                            return c_t_crowd
            
            return 0.0 # 8. Return 0.0 if the contract was not found in the report

        except requests.exceptions.RequestException as e:
            print(f"Error fetching COT data from CFTC: {e}")
            # On failure, return the last known good value, or 0.0 if never fetched.
            return self._cache[asset_id][0] if asset_id in self._cache else 0.0
        except Exception as e:
            print(f"An error occurred during COT report parsing: {e}")
            # On failure, return the last known good value, or 0.0 if never fetched.
            return self._cache[asset_id][0] if asset_id in self._cache else 0.0