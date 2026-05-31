import { useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface SolanaCitizenData {
  walletAddress: string | null;
  solBalance: number | null;
  isLoading: boolean;
  refreshBalance: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
}

export function useSolanaCitizen(): SolanaCitizenData {
  const { primaryWallet } = useDynamicContext();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // We default to devnet for the MVP. You can change this to mainnet-beta via env vars.
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

  const refreshBalance = useCallback(async () => {
    if (!primaryWallet || primaryWallet.chain !== 'SOL') {
      setSolBalance(null);
      return;
    }

    try {
      setIsLoading(true);
      const connection = new Connection(rpcUrl, 'confirmed');
      const publicKey = new PublicKey(primaryWallet.address);
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Failed to fetch Solana balance:", error);
      setSolBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, rpcUrl]);

  useEffect(() => {
    refreshBalance();
    
    // Optional: Setup a polling interval for live balances
    const interval = setInterval(refreshBalance, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [refreshBalance]);

  const signMessage = async (message: string): Promise<string | null> => {
    if (!primaryWallet || primaryWallet.chain !== 'SOL') {
      console.error("No Solana wallet connected for signing");
      return null;
    }

    try {
        const walletConnector = primaryWallet.connector as any;
        if (typeof walletConnector.signMessage !== 'function') {
           console.error("Wallet connector does not support signMessage");
           return null;
        }
        // The dynamic solana connector supports signMessage
        const signature = await walletConnector.signMessage(message);
        return signature as string;
    } catch (error) {
        console.error("Failed to sign message:", error);
        return null;
    }
  };

  return {
    walletAddress: primaryWallet?.address || null,
    solBalance,
    isLoading,
    refreshBalance,
    signMessage,
  };
}
