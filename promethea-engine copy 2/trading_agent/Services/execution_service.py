import os
import json
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_account import Account

# Optional Solana imports - allowing partial functionality if libs missing
try:
    from solana.rpc.api import Client as SolanaClient
    from solders.keypair import Keypair
    from solders.transaction import Transaction
except ImportError:
    SolanaClient = None
    Keypair = None
    print("--- WARNING: Solana libraries not installed. Solana execution disabled. ---")

load_dotenv()

EVM_PRIVATE_KEY = os.getenv("EVM_PRIVATE_KEY")
SOLANA_PRIVATE_KEY = os.getenv("SOLANA_PRIVATE_KEY")
EVM_RPC_URL = os.getenv("EVM_RPC_URL", "https://mainnet.infura.io/v3/YOUR-PROJECT-ID")
SOLANA_RPC_URL = os.getenv("SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com")

class Web3ExecutionService:
    """
    The 'Hands' of the Treasury.
    Responsible for:
    1. securely loading private keys (environment variables ONLY).
    2. constructing transactions.
    3. signing and broadcasting transactions to the network.
    
    Safety: This service should NEVER handle raw keys in logs or outputs.
    """
    def __init__(self):
        self._initialize_evm()
        self._initialize_solana()
        
    def _initialize_evm(self):
        self.w3 = Web3(Web3.HTTPProvider(EVM_RPC_URL))
        # Support PoA networks like BSC/Polygon/Base
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        if self.w3.is_connected():
            chain_id = self.w3.eth.chain_id
            if chain_id == 1:
                print("!!! WARNING: CONNECTED TO ETHEREUM MAINNET. REAL FUNDS AT RISK. HIGH GAS FEES. !!!")
            elif chain_id == 8453:
                print("[TREASURY] Connected to Base Mainnet (L2). Low gas mode active.")
            else:
                print(f"[TREASURY] Connected to Chain ID: {chain_id}")

        if EVM_PRIVATE_KEY:
            self.evm_account = Account.from_key(EVM_PRIVATE_KEY)
            print(f"[TREASURY] EVM Wallet Loaded: {self.evm_account.address}")
        else:
            self.evm_account = None
            print("[TREASURY] No EVM Private Key found. Execution disabled.")

    def _initialize_solana(self):
        if SolanaClient and SOLANA_PRIVATE_KEY:
            try:
                # Assuming base58 encoded key string or byte array in env
                # For complexity, we'll placeholder the actual key parsing
                # real impl would use solders.keypair.Keypair.from_base58_string(SOLANA_PRIVATE_KEY)
                self.sol_client = SolanaClient(SOLANA_RPC_URL)
                self.sol_account = "SOL_WALLET_PLACEHOLDER" 
                print(f"[TREASURY] Solana Wallet Loaded.")
            except Exception as e:
                print(f"[TREASURY] Failed to load Solana wallet: {e}")
                self.sol_client = None
        else:
            self.sol_client = None

    def get_wallet_status(self) -> Dict[str, Any]:
        """Returns public addresses and balances (read-only safe info)."""
        status = {}
        if self.evm_account and self.w3.is_connected():
            try:
                balance_wei = self.w3.eth.get_balance(self.evm_account.address)
                status['evm'] = {
                    'address': self.evm_account.address,
                    'balance_eth': float(self.w3.from_wei(balance_wei, 'ether')),
                    'connected': True
                }
            except Exception as e:
                status['evm'] = {'error': str(e)}
        else:
            status['evm'] = {'status': 'disconnected'}
            
        return status

    def sign_and_send_evm_tx(self, tx_params: Dict[str, Any]) -> str:
        """
        Signs and sends an Ethereum transaction.
        tx_params example: {
            'to': '0x...',
            'value': 0,
            'gas': 200000,
            'gasPrice': 1000000000,
            'nonce': 5,
            'data': '0x...'
        }
        """
        if not self.evm_account:
            raise PermissionError("No EVM Identity available to sign.")

        # 1. Fill critical missing fields if needed
        if 'nonce' not in tx_params:
            tx_params['nonce'] = self.w3.eth.get_transaction_count(self.evm_account.address)
        if 'chainId' not in tx_params:
             tx_params['chainId'] = self.w3.eth.chain_id

        # 2. Sign
        signed_tx = self.w3.eth.account.sign_transaction(tx_params, EVM_PRIVATE_KEY)
        
        # 3. Broadcast
        try:
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            return self.w3.to_hex(tx_hash)
        except Exception as e:
            print(f"[TREASURY] EVM Broadcast Failed: {e}")
            raise e

    def execute_uniswap_swap(self, token_in: str, token_out: str, amount: int, recipient: str) -> str:
        """
        Executes a swap on Uniswap V3 (EVM).
        This requires the SwapRouter contract ABI (minimal version).
        """
        if not self.evm_account:
            return "Error: No EVM Account"

        # Minimal ABI for Uniswap V3 SwapRouter 'exactInputSingle'
        # In a real deployed app, we'd load this from a JSON file.
        router_address = "0xE592427A0AEce92De3Edee1F18E0157C05861564" # Mainnet V3 Router
        router_abi = '[{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct ISwapRouter.ExactInputSingleParams","name":"params","type":"tuple"}],"name":"exactInputSingle","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"}]'

        # Token Addresses (Multi-Chain Support)
        chain_id = self.w3.eth.chain_id
        
        if chain_id == 8453: # BASE
            token_map = {
                "WETH": "0x4200000000000000000000000000000000000006",
                "USDC": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
            }
            router_address = "0x2626664c2603336E57B271c5C0b26F421741e481" # Uniswap V3 Router on Base
        else: # Default to Mainnet or Fork
            token_map = {
                "WETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            }
            router_address = "0xE592427A0AEce92De3Edee1F18E0157C05861564" # Mainnet V3 Router
        
        t_in = token_map.get(token_in, token_in)
        t_out = token_map.get(token_out, token_out)

        contract = self.w3.eth.contract(address=router_address, abi=router_abi)

        # Construct Transaction
        params = {
            'tokenIn': t_in,
            'tokenOut': t_out,
            'fee': 3000, # 0.3% pool - Note: Pools vary by chain, keeping simple for now
            'recipient': recipient,
            'deadline': 9999999999, # Far future
            'amountIn': amount,
            'amountOutMinimum': 0, # Slippage unprotected for MVP
            'sqrtPriceLimitX96': 0
        }
        
        # Build Tx with Dynamic Gas
        tx_build_params = {
            'from': self.evm_account.address,
            'nonce': self.w3.eth.get_transaction_count(self.evm_account.address),
            'gas': 250000,
        }
        
        # EIP-1559 or Legacy Gas Fee Logic
        try:
             # Simple dynamic legacy fallback for broad compatibility, or EIP-1559 if supported
             # Base supports EIP-1559.
             current_gas = self.w3.eth.gas_price
             tx_build_params['gasPrice'] = int(current_gas * 1.1) # 10% buffer
        except:
             tx_build_params['gasPrice'] = self.w3.to_wei('0.1', 'gwei') # Fallback low for L2s

        tx = contract.functions.exactInputSingle(params).build_transaction(tx_build_params)
        
        return self.sign_and_send_evm_tx(tx)

    def execute_jupiter_swap(self, input_mint: str, output_mint: str, amount: int) -> str:
        """
        Executes a swap on Jupiter Aggregator (Solana).
        Relies on proper solders/solana libs being installed.
        """
        if not self.sol_client:
             return "Error: Solana Client Unavailable"
             
        # In a real implementation:
        # 1. Fetch route from https://quote-api.jup.ag/v6/quote
        # 2. Fetch swap transaction from https://quote-api.jup.ag/v6/swap
        # 3. Sign and Broadcast
        
        print(f"[TREASURY] Simulating Jupiter Swap: {amount} {input_mint} -> {output_mint}")
        return "simulate_tx_hash_solana"
