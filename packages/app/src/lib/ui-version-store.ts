'use client';

import { create } from 'zustand';

export type UiVersion = 'NEXTGEN' | 'CLASSIC';

interface UiVersionState {
  uiVersion: UiVersion;
  setUiVersion: (version: UiVersion) => void;
  toggleUiVersion: () => void;
}

const STORAGE_KEY = 'promethea_ui_version';

const getInitialVersion = (): UiVersion => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'CLASSIC' || saved === 'NEXTGEN') {
      return saved;
    }
  }
  return 'NEXTGEN'; // Default to New UI/UX
};

export const useUiVersionStore = create<UiVersionState>((set) => ({
  uiVersion: getInitialVersion(),
  setUiVersion: (version) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, version);
    }
    set({ uiVersion: version });
  },
  toggleUiVersion: () => {
    set((state) => {
      const nextVersion: UiVersion = state.uiVersion === 'NEXTGEN' ? 'CLASSIC' : 'NEXTGEN';
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, nextVersion);
      }
      return { uiVersion: nextVersion };
    });
  },
}));
