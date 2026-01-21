import os
import sys
from web3 import Web3
from dotenv import load_dotenv

# Load .env from root
# Assuming we are in packages/sbi-core/scripts, root is three levels up
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(dotenv_path)

rpc_url = os.getenv("BASE_L2_RPC_URL")
private_key = os.getenv("BASE_TEST_WALLET_PRIVATE_KEY")

print(f"DEBUG: RPC URL: {rpc_url}")
# Mask env key for safety in logs
masked_key = private_key[:6] + "..." + private_key[-4:] if private_key and len(private_key) > 10 else "N/A"
print(f"DEBUG: Private Key: {masked_key}")

if not rpc_url:
    print("Error: BASE_L2_RPC_URL not found in .env")
    sys.exit(1)

try:
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if w3.is_connected():
        print(f"SUCCESS: Connected to Base L2!")
        print(f"Chain ID: {w3.eth.chain_id}")
        print(f"Block Number: {w3.eth.block_number}")
        
        if private_key:
            account = w3.eth.account.from_key(private_key)
            print(f"Wallet Address: {account.address}")
            balance_wei = w3.eth.get_balance(account.address)
            balance_eth = w3.from_wei(balance_wei, 'ether')
            print(f"Balance: {balance_eth} ETH")
            
            if balance_eth > 0:
                print("STATUS: FUNDED - Ready for Penny Test")
            else:
                print("STATUS: NO FUNDS - Needs funding for Penny Test")
        else:
            print("WARNING: BASE_TEST_WALLET_PRIVATE_KEY not found.")
    else:
        print("FAILED: Could not connect to RPC.")
except Exception as e:
    print(f"ERROR: {e}")
