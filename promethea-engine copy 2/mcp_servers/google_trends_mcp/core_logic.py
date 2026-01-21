import pandas as pd
import numpy as np
from pytrends.request import TrendReq

def get_interest_acceleration(keyword: str) -> float:
    """
    Fetches interest-over-time data from Google Trends for a given keyword
    and calculates the acceleration of the trend.

    Acceleration is calculated as the second derivative of the interest score.

    Args:
        keyword: The search term to analyze.

    Returns:
        The acceleration value of the trend interest. Returns 0.0 if
        data is insufficient.
    """
    try:
        pytrends = TrendReq(hl='en-US', tz=360)
        pytrends.build_payload([keyword], cat=0, timeframe='today 1-m', geo='', gprop='')
        
        # Fetch interest over time as a DataFrame
        df = pytrends.interest_over_time()

        if df.empty or len(df) < 3 or keyword not in df.columns:
            return 0.0

        # Calculate velocity (1st derivative)
        velocity = np.gradient(df[keyword].values)
        # Calculate acceleration (2nd derivative)
        acceleration = np.gradient(velocity)

        # Return the most recent acceleration value
        return float(acceleration[-1])
    except Exception as e:
        print(f"Error in get_interest_acceleration for '{keyword}': {e}")
        return 0.0