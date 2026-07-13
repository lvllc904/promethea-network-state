import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useSovereignStore } from './use-sovereign-store';

export interface SolanaCitizenData {
  walletAddress: string | null;
  solBalance: number | null;
  isLoading: boolean;
  refreshBalance: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
}

export function useSolanaCitizen(): SolanaCitizenData {
  const { isUnlocked, walletAddress, lock } = useSovereignStore();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // We default to devnet for the MVP. You can change this to mainnet-beta via env vars.
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

  const refreshBalance = useCallback(async () => {
    if (!isUnlocked || !walletAddress) {
      setSolBalance(null);
      return;
    }

    try {
      setIsLoading(true);
      const connection = new Connection(rpcUrl, 'confirmed');
      const publicKey = new PublicKey(walletAddress);
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Failed to fetch Solana balance:", error);
      setSolBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, rpcUrl, isUnlocked]);

  useEffect(() => {
    refreshBalance();
    
    // Optional: Setup a polling interval for live balances
    const interval = setInterval(refreshBalance, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [refreshBalance]);

  const signMessage = async (message: string): Promise<string | null> => {
    console.error("Signing logic has been moved to the Authentication Gateway (Body 2)");
    return null;
  };

  return {
    walletAddress,
    solBalance,
    isLoading,
    refreshBalance,
    signMessage,
  };
}
