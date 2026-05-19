'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type PillarCategory = 'ATLAS' | 'ECONOMICS' | 'GOVERNANCE' | 'NARRATIVE' | 'PASSPORT' | 'DIPLOMATIC' | 'PULSE' | 'ASGI';

export interface HUDState {
    activePillar: PillarCategory;
    activeTab: string | null;
    isMacroView: boolean; // true = Promethea/Global baseline, false = Citizen/Personal focus
    selectedNodeId: string | null; // e.g. for Map interaction
    activeFocusPanel: string | null; // e.g. 'EXCHANGE' | 'SQL_EXPLORER' | 'CLI_GUIDE' | 'SWEAT_CLAIM' | 'FINANCIALS' | 'WALLET' | 'OMNI_SCANNER' | 'ASSET_CANVAS'
    omniScannerTarget: string | null; // The address, tx hash, or contract to scan
    activeAssetTarget: string | null; // The ticker or asset ID (e.g. 'TSLA', 'SOL') to focus on the canvas
}

interface HUDContextType extends HUDState {
    setHUDState: (state: Partial<HUDState>) => void;
    toggleView: () => void;
    activatePillar: (pillar: PillarCategory, defaultTab?: string) => void;
    activateFocusPanel: (panel: string | null) => void;
    triggerOmniScanner: (target: string) => void;
    activateAssetCanvas: (target: string) => void;
}

const defaultState: HUDState = {
    activePillar: 'ATLAS',
    activeTab: null,
    isMacroView: true,
    selectedNodeId: null,
    activeFocusPanel: null,
    omniScannerTarget: null,
    activeAssetTarget: null,
};

const HUDContext = createContext<HUDContextType | undefined>(undefined);

export const HUDProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<HUDState>(defaultState);

    const setHUDState = (newState: Partial<HUDState>) => {
        setState((prev) => ({ ...prev, ...newState }));
    };

    const toggleView = () => {
        setState((prev) => ({ ...prev, isMacroView: !prev.isMacroView }));
    };

    const activatePillar = (pillar: PillarCategory, defaultTab: string | null = null) => {
        setState((prev) => ({ ...prev, activePillar: pillar, activeTab: defaultTab, activeFocusPanel: null }));
    };

    const activateFocusPanel = (panel: string | null) => {
        setState((prev) => ({ ...prev, activeFocusPanel: panel }));
    };

    const triggerOmniScanner = (target: string) => {
        setState((prev) => ({ ...prev, activeFocusPanel: 'OMNI_SCANNER', omniScannerTarget: target }));
    };

    const activateAssetCanvas = (target: string) => {
        setState((prev) => ({ ...prev, activeFocusPanel: 'ASSET_CANVAS', activeAssetTarget: target }));
    };

    return (
        <HUDContext.Provider value={{ ...state, setHUDState, toggleView, activatePillar, activateFocusPanel, triggerOmniScanner, activateAssetCanvas }}>
            {children}
        </HUDContext.Provider>
    );
};

export const useHUD = () => {
    const context = useContext(HUDContext);
    if (context === undefined) {
        throw new Error('useHUD must be used within a HUDProvider');
    }
    return context;
};
