import requests
from bs4 import BeautifulSoup
import time


class OptionsDataProvider:
    """
    Fetches the daily Equity Put/Call ratio from an external source.

    As per the roadmap, this provider is responsible for fetching rho_t,
    a key component of the Psychology Vector. The CBOE website is used
    as the data source.
    """

    def __init__(self):
        """
        Initializes the provider, setting the target URL for the data.
        """
        # This CBOE page provides daily market statistics including P/C ratios.
        # We will target the "Total Put/Call Ratio" for a broad market sentiment view.
        self.cboe_url = "https://www.cboe.com/data/market_statistics/"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        # Add a simple cache to avoid hitting the API too frequently
        self._cache = None
        self._cache_ttl = 14400  # 4 hours

    def get_put_call_ratio(self) -> float:
        """
        Scrapes the CBOE website to get the latest daily Total Put/Call Ratio.

        Returns:
            A float representing the Total Put/Call ratio.
            Returns 0.0 if the data cannot be fetched or parsed.
        """
        # Check cache first
        current_time = time.time()
        if self._cache:
            cached_data, timestamp = self._cache
            if current_time - timestamp < self._cache_ttl:
                return cached_data

        try:
            response = requests.get(self.cboe_url, headers=self.headers)
            response.raise_for_status()  # Raise an exception for bad status codes

            # 1. Initialize BeautifulSoup
            soup = BeautifulSoup(response.text, 'html.parser')

            # 2. Find the table cell containing the label "Total Put/Call Ratio"
            # We use a lambda to search for the text, making it more robust.
            label_cell = soup.find('td', string=lambda text: text and 'Total Put/Call Ratio' in text.strip())

            # Default to the last cached value if we can't find the new one, otherwise 1.0
            rho_t = (self._cache[0] if self._cache else 1.0)
            if label_cell:
                # 3. The value is in the next table cell ('td') sibling
                value_cell = label_cell.find_next_sibling('td')
                if value_cell:
                    # 4. Extract text, strip whitespace, and convert to float
                    ratio_text = value_cell.get_text(strip=True)
                    rho_t = float(ratio_text)

            # Store result in cache
            self._cache = (rho_t, current_time)

            # The vector rho_t as per the roadmap
            return rho_t

        except requests.exceptions.RequestException as e:
            print(f"Error fetching data from CBOE: {e}")
            # On failure, return the last known good value, or a neutral 1.0
            return self._cache[0] if self._cache else 1.0
        except Exception as e:
            print(f"An error occurred during parsing: {e}")
            # On failure, return the last known good value, or a neutral 1.0
            return self._cache[0] if self._cache else 1.0