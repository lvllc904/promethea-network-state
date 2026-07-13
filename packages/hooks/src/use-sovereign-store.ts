import { create } from 'zustand';

interface SovereignStoreState {
  isUnlocked: boolean;
  walletAddress: string | null;
  unlock: (address: string) => void;
  lock: () => void;
}

export const useSovereignStore = create<SovereignStoreState>((set) => ({
  isUnlocked: false,
  walletAddress: null,
  unlock: (address: string) => {
    console.log(`[SovereignStore] Hydrating cockpit for ${address}`);
    set({ isUnlocked: true, walletAddress: address });
  },
  lock: () => {
    console.log(`[SovereignStore] Purging local cockpit state`);
    set({ isUnlocked: false, walletAddress: null });
  },
}));
