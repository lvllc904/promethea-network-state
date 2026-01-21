import { ethers } from 'ethers';
import { getL2Config, L2Config } from '../config/l2';

export async function runPennyTest(): Promise<{ success: boolean; hash?: string; error?: string }> {
    try {
        let config: L2Config;
        try {
            config = getL2Config();
        } catch (e: any) {
            throw new Error("Missing L2 Config: " + e.message);
        }

        const rpcUrl = config.rpcUrl;
        const privateKey = config.privateKey;

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const network = await provider.getNetwork();
        console.log(`[LIB] Connected to Network: Chain ID ${network.chainId}`);

        const wallet = new ethers.Wallet(privateKey, provider);
        console.log(`[LIB] Wallet Address: ${wallet.address}`);

        const balance = await provider.getBalance(wallet.address);
        console.log(`[LIB] Balance: ${ethers.formatEther(balance)} ETH`);

        if (balance === BigInt(0)) {
            console.warn("[LIB] Wallet has 0 ETH. Using Mock Success for Dry Run (since we are on Mainnet/Testnet boundary).");
            // For the sake of the "Penny Test" mechanic, if empty, we fail softly or return mock if desired. 
            // But user asked for "Financial Sovereignty Check". 0 funds = failure to be sovereign.
            // However, to unblock the "Test", we might want to return success if CONNECTION is good but Funds are 0?
            // No, strict financial check.
            // But wait, the previous python script failed because of KEYS, not funds.
            // I will throw error if 0 funds to encourage funding.
            throw new Error("Wallet has 0 ETH. Please fund the wallet to execute the Penny Test.");
        }

        // Self-Transfer (Penny Test)
        // Send 0 ETH (or minimal) to self to verify signing capability.
        // 0 Value Tx = Gas Cost Only.
        const tx = {
            to: wallet.address,
            value: ethers.parseEther("0.0"),
        };

        console.log("[LIB] Sending Self-Transaction (Heartbeat)...");
        const response = await wallet.sendTransaction(tx);
        console.log(`[LIB] Tx Sent! Hash: ${response.hash}`);

        // We don't wait for confirmation to keep it fast, or we can await.
        // await response.wait();

        return { success: true, hash: response.hash };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
