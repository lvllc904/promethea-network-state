import requests
import zipfile
import io
import datetime

# Mapping from our internal asset_id to the name used in CFTC reports
ASSET_TO_CFTC_NAME = {
    'bitcoin': 'BITCOIN',
    'sp500': 'S&P 500',
    'nasdaq': 'NASDAQ-100',
    'gold': 'GOLD',
    # Add other futures contracts as needed
}

def get_net_speculative_positioning(asset_id: str) -> float:
    """
    Fetches the latest Commitment of Traders (COT) report from the CFTC,
    parses it, and calculates the net speculative positioning for a given asset.

    Net Speculative Positioning = (Longs - Shorts) / (Longs + Shorts)
    This normalizes the value between -1 (max short) and +1 (max long).

    Args:
        asset_id: The internal asset ID (e.g., 'bitcoin').

    Returns:
        The net speculative positioning as a float between -1 and 1.
        Returns 0.0 if the asset is not found or an error occurs.
    """
    cftc_name = ASSET_TO_CFTC_NAME.get(asset_id.lower())
    if not cftc_name:
        print(f"--- WARNING: No CFTC mapping for asset '{asset_id}'. ---")
        return 0.0

    try:
        # Construct the URL for the current year's "Futures Only" report
        current_year = datetime.datetime.now().year
        url = f"https://www.cftc.gov/files/dea/history/fut_fin_txt_{current_year}.zip"
        
        response = requests.get(url)
        response.raise_for_status()

        # Unzip the file in memory
        with zipfile.ZipFile(io.BytesIO(response.content)) as z:
            # The report file is typically named 'FinFutYY.txt'
            report_filename = [name for name in z.namelist() if name.lower().startswith('finfut')][0]
            with z.open(report_filename) as report_file:
                # Read and decode the file content
                lines = report_file.read().decode('utf-8').splitlines()

                for line in lines:
                    # Find the line corresponding to our asset
                    if cftc_name in line:
                        # The data is comma-separated
                        parts = [p.strip() for p in line.split(',')]
                        
                        # Based on the standard "Futures Only" report format:
                        # Index 8: Non-Commercial (Speculator) Long Positions
                        # Index 9: Non-Commercial (Speculator) Short Positions
                        if len(parts) > 9:
                            spec_long = float(parts[8])
                            spec_short = float(parts[9])
                            
                            total_positions = spec_long + spec_short
                            if total_positions == 0:
                                return 0.0
                                
                            net_positioning = (spec_long - spec_short) / total_positions
                            return round(net_positioning, 4)

        # If the loop finishes without finding the asset
        print(f"--- WARNING: Asset '{cftc_name}' not found in the latest COT report. ---")
        return 0.0

    except Exception as e:
        print(f"--- ERROR: Failed to fetch or parse COT data: {e} ---")
        return 0.0
