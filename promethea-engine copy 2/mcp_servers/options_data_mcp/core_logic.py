from curl_cffi.requests import Session
from bs4 import BeautifulSoup
import re

def get_put_call_ratio() -> float:
    """
    Fetches the CBOE Total Put/Call Ratio from barchart.com.

    This ratio is a widely used sentiment indicator. A ratio above 1.0 is
    typically considered bearish, while a ratio below 1.0 is considered bullish.

    Returns:
        The CBOE Total Put/Call ratio as a float. Returns 1.0 (neutral)
        if scraping fails.
    """
    url = "https://www.barchart.com/options/put-call-ratios"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        session = Session(impersonate="chrome110")
        response = session.get(url, headers=headers)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Find the specific row for "CBOE Total Put/Call Ratio"
        # We look for the 'a' tag with the text and then navigate to its parent row
        target_link = soup.find('a', string=re.compile(r"CBOE Total Put/Call Ratio"))
        if not target_link:
            print("--- WARNING: Could not find 'CBOE Total Put/Call Ratio' link on page. ---")
            return 1.0

        # The structure is roughly <tr> <td><a>...</a></td> <td>...</td> <td>RATIO</td> ... </tr>
        # We go up to the parent <tr> and then find all <td>s within it.
        table_row = target_link.find_parent('tr')
        if not table_row:
            print("--- WARNING: Could not find parent table row for ratio. ---")
            return 1.0

        columns = table_row.find_all('td')
        # The ratio is typically in the 3rd column (index 2)
        if len(columns) > 2:
            ratio_text = columns[2].get_text(strip=True)
            return float(ratio_text)
        else:
            print(f"--- WARNING: Found the row, but not enough columns. Columns found: {len(columns)} ---")
            return 1.0

    except Exception as e:
        print(f"--- ERROR: Failed to fetch or parse Put/Call ratio: {e} ---")
        return 1.0 # Return a neutral 1.0 on failure
