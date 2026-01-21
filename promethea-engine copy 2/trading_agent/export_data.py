# /Users/officeone/promethea-engine/trading_agent/export_data.py

import pandas as pd
from Services.database import engine # We can use the engine directly for a simple read

def export_market_data_to_parquet():
    """
    Connects to the database, reads the entire market_data table,
    and saves it to a compressed Parquet file.
    """
    print("--- Starting Data Export ---")

    # This is the SQL query to select all data.
    query = "SELECT * FROM market_data;"

    print("Connecting to the database and reading data... (This may take a moment)")

    try:
        # Use pandas' powerful read_sql function to execute the query
        # and load the entire table into a DataFrame at once.
        df = pd.read_sql(query, engine)

        if df.empty:
            print("No data found in market_data table. Exiting.")
            return

        output_filename = "promethea_historical_data.parquet"
        print(f"Successfully read {len(df)} rows from the database.")
        print(f"Saving data to '{output_filename}'...")

        # Save the DataFrame to a Parquet file.
        # 'compression="gzip"' makes the file smaller.
        df.to_parquet(output_filename, compression="gzip", index=False)

        print(f"--- Data Export Complete! File saved as '{output_filename}' ---")

    except Exception as e:
        print(f"An error occurred during data export: {e}")

if __name__ == "__main__":
    export_market_data_to_parquet()