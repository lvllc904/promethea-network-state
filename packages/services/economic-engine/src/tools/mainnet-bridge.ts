import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';

/**
 * Mainnet Bridge Substrate
 * 
 * Provides atomic, decentralized access to live blockchain mainnets. 
 * Managed by the Promethean stack independently for treasury health 
 * and on-chain settlements.
 */
export class MainnetBridge {
    private static solanaConn: Connection;
    private static baseConn: ethers.JsonRpcProvider;

    constructor() {
        if (!MainnetBridge.solanaConn) {
            MainnetBridge.solanaConn = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
        }
        if (!MainnetBridge.baseConn) {
            MainnetBridge.baseConn = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org');
        }
    }

    /**
     * Solana Mainnet (Layer 1) 
     * Primary engine for high-frequency trading and MEV execution.
     */
    async querySolanaTreasury(pubkey: string): Promise<number> {
        try {
            const balance = await MainnetBridge.solanaConn.getBalance(new PublicKey(pubkey));
            return balance / 1e9;
        } catch (error) {
            console.error('[MainnetBridge] Solana Connection Error:', error);
            return 0;
        }
    }

    /**
     * Base Mainnet (Layer 2)
     * Primary hub for Gnosis Safe / Treasury and low-fee EVM settlements.
     */
    async queryBaseTreasury(address: string): Promise<string> {
        try {
            const balance = await MainnetBridge.baseConn.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('[MainnetBridge] Base Connection Error:', error);
            return '0';
        }
    }
}
