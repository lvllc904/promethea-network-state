import os
import aiohttp
import asyncio
from typing import Dict, Any, List, Optional
import polars as pl
from dotenv import load_dotenv
from promethea.trading_agent.Services.data_providers import DataProvider

load_dotenv()

ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")
SOLSCAN_API_KEY = os.getenv("SOLSCAN_API_KEY")

class Web3Provider(DataProvider):
    """
    A unified provider for fetching direct on-chain data from Etherscan (Ethereum)
    and Solscan (Solana). It normalizes the data into Polars DataFrames for
    processing by the Promethea Engine.
    """
    def __init__(self):
        if not ETHERSCAN_API_KEY:
            print("--- WARNING: ETHERSCAN_API_KEY not found. Ethereum data will be limited. ---")
        if not SOLSCAN_API_KEY:
             print("--- WARNING: SOLSCAN_API_KEY not found. Solana data will be limited. ---")

        self.session_eth = None
        self.session_sol = None

    async def _get_session_eth(self):
        if self.session_eth is None:
            self.session_eth = aiohttp.ClientSession()
        return self.session_eth

    async def _get_session_sol(self):
        if self.session_sol is None:
            self.session_sol = aiohttp.ClientSession(headers={"token": SOLSCAN_API_KEY} if SOLSCAN_API_KEY else {})
        return self.session_sol

    async def close(self):
        if self.session_eth: await self.session_eth.close()
        if self.session_sol: await self.session_sol.close()

    async def fetch_data(self, chain: str, contract_address: str, days: int = 30) -> pl.DataFrame:
        """
        Fetches historical transaction/price data for a token contract.
        """
        if chain.lower() == "ethereum":
            return await self._fetch_etherscan(contract_address, days)
        elif chain.lower() == "solana":
            return await self._fetch_solscan(contract_address, days)
        else:
            print(f"--- ERROR: Unsupported chain {chain} ---")
            return pl.DataFrame()

    async def _fetch_etherscan(self, contract_address: str, days: int) -> pl.DataFrame:
        """
        Fetches ERC20 token transfer events as a proxy for activity, or potentially
        prices if calling an oracle contract. For simplicity in V1, we track
        transactions (Activity Volatility).
        """
        if not ETHERSCAN_API_KEY: return pl.DataFrame()
        
        # Etherscan 'tokentx' endpoint
        url = "https://api.etherscan.io/api"
        params = {
            "module": "account",
            "action": "tokentx",
            "contractaddress": contract_address,
            "page": 1,
            "offset": 1000, # Limit to last 1000 txs for speed in MVP
            "sort": "desc",
            "apikey": ETHERSCAN_API_KEY
        }
        
        try:
            session = await self._get_session_eth()
            async with session.get(url, params=params) as response:
                data = await response.json()
                
            if data['status'] != "1":
                print(f"--- WARNING: Etherscan Error: {data['message']} ---")
                return pl.DataFrame()
            
            # Process result into DataFrame
            txs = data['result']
            df = pl.DataFrame(txs)
            
            # Select relevant columns
            if df.is_empty(): return df
            
            return df.select([
                pl.col("timeStamp").cast(pl.Int64).alias("timestamp"),
                pl.col("value").cast(pl.Float64).alias("volume"),
                pl.col("hash").alias("tx_hash"),
                pl.col("from").alias("sender"),
                pl.col("to").alias("receiver")
            ]).with_columns(
                (pl.col("timestamp") * 1000).cast(pl.Datetime).alias("datetime")
            )

        except Exception as e:
            print(f"--- ERROR: Etherscan fetch failed: {e} ---")
            return pl.DataFrame()

    async def _fetch_solscan(self, token_address: str, days: int) -> pl.DataFrame:
        """
        Fetches Solana SPL token activity.
        """
        if not SOLSCAN_API_KEY: return pl.DataFrame()
        
        # Solscan API v2 (public)
        url = f"https://public-api.solscan.io/token/transfers?tokenAddress={token_address}&limit=50"
        
        try:
            session = await self._get_session_sol()
            async with session.get(url) as response:
                data = await response.json()
            
            # Process
            if 'data' not in data:
                 return pl.DataFrame()
                 
            df = pl.DataFrame(data['data'])
            if df.is_empty(): return df

            # Normalization
            return df.select([
                pl.col("blockTime").cast(pl.Int64).alias("timestamp"),
                pl.col("amount").cast(pl.Float64).alias("volume"),
                pl.col("signature").alias("tx_hash")
            ]).with_columns(
                (pl.col("timestamp") * 1000).cast(pl.Datetime).alias("datetime")
            )

        except Exception as e:
             print(f"--- ERROR: Solscan fetch failed: {e} ---")
             return pl.DataFrame()
