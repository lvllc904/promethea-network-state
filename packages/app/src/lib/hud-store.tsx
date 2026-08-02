'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PillarCategory = 'ATLAS' | 'ECONOMICS' | 'GOVERNANCE' | 'NARRATIVE' | 'PASSPORT' | 'DIPLOMATIC' | 'PULSE' | 'ASGI' | 'SETTINGS' | 'CHAT';

export interface Watchlist {
    name: string;
    tickers: string[];
}

export interface ExecutionSnapshot {
    tokenPrefix?: string;
    activeFilePointers?: string[];
    queuedToolCalls?: Array<{
        toolName: string;
        arguments: Record<string, any>;
    }>;
    contextRef?: Record<string, any>;
}

export interface ChatMessage {
    id: string;
    sender: string;
    role: 'user' | 'promethea' | 'antigravity' | 'peer';
    content: string;
    timestamp: string;
    signature?: string; // Cryptographic DID signature proof
    parentId?: string | null;
    status?: 'completed' | 'generating' | 'interrupted' | 'paused';
    childrenIds?: string[];
    executionSnapshot?: ExecutionSnapshot;
}


export interface ChatThread {
    id: string;
    name: string;
    type: 'agent' | 'p2p' | 'group';
    peers: string[]; // List of names/DIDs in the channel
    messages: ChatMessage[];
    avatar?: string;
    activeHeadMessageId?: string;
}

export function getActivePath(thread: ChatThread): ChatMessage[] {
    if (!thread || !thread.messages || thread.messages.length === 0) return [];
    
    const messages = thread.messages;
    const msgMap = new Map<string, ChatMessage>();
    messages.forEach(m => msgMap.set(m.id, m));

    let headId = thread.activeHeadMessageId;
    if (!headId || !msgMap.has(headId)) {
        headId = messages[messages.length - 1].id;
    }

    const path: ChatMessage[] = [];
    let currentId: string | null | undefined = headId;
    const visited = new Set<string>();

    while (currentId && msgMap.has(currentId) && !visited.has(currentId)) {
        visited.add(currentId);
        const msg = msgMap.get(currentId)!;
        path.push(msg);
        currentId = msg.parentId;
    }

    if (path.length > 0) {
        return path.reverse();
    }

    return messages;
}

export function ensureDSGStructure(threads: ChatThread[]): ChatThread[] {
    return threads.map(thread => {
        if (!thread.messages || thread.messages.length === 0) {
            return {
                ...thread,
                activeHeadMessageId: undefined
            };
        }

        const messagesCopy = thread.messages.map(m => ({
            ...m,
            parentId: m.parentId !== undefined ? m.parentId : null,
            status: m.status !== undefined ? m.status : 'completed',
            childrenIds: m.childrenIds ? [...m.childrenIds] : []
        }));

        const allParentsAreNull = thread.messages.every(m => m.parentId === undefined || m.parentId === null);
        if (allParentsAreNull) {
            for (let j = 0; j < messagesCopy.length; j++) {
                messagesCopy[j].parentId = j === 0 ? null : messagesCopy[j - 1].id;
            }
        }

        messagesCopy.forEach(m => {
            m.childrenIds = [];
        });

        messagesCopy.forEach(m => {
            const pId = m.parentId;
            if (pId) {
                const parentMsg = messagesCopy.find(p => p.id === pId);
                if (parentMsg) {
                    if (!parentMsg.childrenIds) {
                        parentMsg.childrenIds = [];
                    }
                    if (!parentMsg.childrenIds.includes(m.id)) {
                        parentMsg.childrenIds.push(m.id);
                    }
                }
            }
        });

        let activeHeadId = thread.activeHeadMessageId;
        if (!activeHeadId || !messagesCopy.some(m => m.id === activeHeadId)) {
            activeHeadId = messagesCopy[messagesCopy.length - 1].id;
        }

        return {
            ...thread,
            messages: messagesCopy,
            activeHeadMessageId: activeHeadId
        };
    });
}


export interface OSWindowData {
    id: string;
    type: string;
    title: string;
    x: number;
    y: number;
    width: number | string;
    height: number | string;
    zIndex: number;
    isMinimized: boolean;
    isMaximized: boolean;
    isPoppedOut: boolean;
}

export interface POIDetails {
    placeId?: string;
    name: string;
    formattedAddress?: string;
    website?: string;
    rating?: number;
    photos?: string[];
    coordinates: { lat: number; lng: number; alt?: number };
    referenceFrame: 'EARTH' | 'LUNA' | 'MARS';
    ownership?: {
        ownerDid: string;
        ownerName: string;
        stakedSovereignUnits: number;
    };
    publicPlans?: string;
    metrics: {
        solar: number; // percentage / kWh potential
        wind: number;  // percentage / m/s potential
        water: number; // percentage / L/s potential
        zoning: number; // percentage completed
    };
}

export type AssetOwnership = 'WHOLE' | 'FRACTIONAL';
export type PricingMode = 'FIXED' | 'ORDER_BOOK';

export interface Asset {
    id: string;
    type: 'REAL_ESTATE' | 'COMPUTE_NODE' | 'IP' | 'OTHER';
    name: string;
    description: string;
    ownership: AssetOwnership;
    pricingMode: PricingMode;
    valuationUSDC: number;
    sharesTotal?: number; // for FRACTIONAL
    sharesAvailable?: number;
    isUCC1Filed: boolean;
    ownerDid: string;
}

export interface EscrowOffer {
    id: string;
    assetId: string;
    buyerDid: string;
    amountUSDC: number;
    status: 'PENDING' | 'LOCKED' | 'SETTLED' | 'CANCELLED';
    timestamp: string;
}

export interface TreasuryState {
    balanceUSDC: number;
    balanceUVT: number;
    lockedUSDC: number;
}

export const defaultPOI: POIDetails = {
    name: "Whiskey River Retreat",
    formattedAddress: "1200 Whiskey River Rd, Texas, USA",
    website: "https://whiskeyriver.lvhllc.org",
    rating: 4.8,
    photos: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80"],
    coordinates: { lat: 30.2672, lng: -97.7431, alt: 145 },
    referenceFrame: 'EARTH',
    ownership: {
        ownerDid: "did:sovereign:citizen:0x9f1d2b8a3e1c0d4f",
        ownerName: "Citizen Founder",
        stakedSovereignUnits: 15000
    },
    publicPlans: "Phase 1: Build off-grid solar arrays and water filtration systems. Phase 2: Deploy localized server nodes and LoRa gateway antennas to activate physical substrate mesh.",
    metrics: {
        solar: 85,
        wind: 45,
        water: 92,
        zoning: 75
    }
};

export interface HUDState {
    activePillar: PillarCategory;
    activeTab: string | null;
    isMacroView: boolean; // true = Promethea/Global baseline, false = Citizen/Personal focus
    selectedNodeId: string | null; // e.g. for Map interaction
    activeFocusPanel: string | null; // e.g. 'EXCHANGE' | 'SQL_EXPLORER' | 'CLI_GUIDE' | 'SWEAT_CLAIM' | 'FINANCIALS' | 'WALLET' | 'OMNI_SCANNER' | 'ASSET_CANVAS' | 'CONFERENCE'
    cockpitHoldingsTab: 'PORTFOLIO' | 'SWEAT' | 'FINANCIALS' | null; // Pre-select right panel tab
    cockpitOpsTab: 'AGENTS' | 'TELEMETRY' | 'LOGS' | null; // Pre-select left panel tab
    cockpitDrilldownAssetId: string | null; // Asset ID to expand in PORTFOLIO drill-down
    competencyLevel: 'NOVICE' | 'OPERATOR' | 'ARCHITECT'; // Adaptive UI competency mode
    omniScannerTarget: string | null; // The address, tx hash, or contract to scan
    activeAssetTarget: string | null; // The ticker or asset ID (e.g. 'TSLA', 'SOL') to focus on the canvas
    activePOI: POIDetails;
    
    // Watchlist States
    watchlists: Watchlist[];
    activeWatchlistName: string;
    pendingCoPilotPrompt: string | null; // Buffer to trigger auto-evaluation queries in co-pilot chat

    // Chat States
    chatThreads: ChatThread[];
    activeThreadId: string;
    activeMeetUrl: string | null;
    userDid: string;

    // OS Windows
    osWindows: OSWindowData[];

    // Accessibility & UX
    reduceAnimations: boolean;
    isPhosphorMode: boolean;

    // Economics State
    globalVix: number;

    // Interstellar Map Mode
    mapMode: 'INTERSTELLAR' | 'SURFACE';
    celestialMesh: boolean;
    activeHazards: Array<{
        id: string;
        type: string;
        title: string;
        severity: string;
        distanceKm: number;
        bearingDegrees: number;
        recordedAt: string;
        remediationAction?: string;
        citadelName: string;
    }>;
    is3DTilesEnabled: boolean;
    isGhostArchitectureEnabled: boolean;
    isLiquidityArcsEnabled: boolean;
    isHeatmapEnabled: boolean;
    isOsirisTelemetryEnabled: boolean;
    isMapInteractive?: boolean;

    // Celestial Selection State (elevated from InterstellarMap local state)
    selectedCelestialId: string | null;
    selectedDeepFieldBody: any | null;
    interstellarTransitioning: string | null; // planet ID undergoing atmospheric entry, or null

    // Deal Flow / Assets
    assets: Asset[];
    escrows: EscrowOffer[];
    treasury: TreasuryState;
}

interface HUDContextType extends HUDState {
    setHUDState: (state: Partial<HUDState>) => void;
    toggleView: () => void;
    toggleAnimations: () => void;
    togglePhosphorMode: () => void;
    activatePillar: (pillar: PillarCategory, defaultTab?: string) => void;
    activateFocusPanel: (panel: string | null) => void;
    triggerOmniScanner: (target: string) => void;
    activateAssetCanvas: (target: string) => void;
    setActivePOI: (poi: POIDetails) => void;
    
    // Watchlist Actions
    createWatchlist: (name: string) => void;
    deleteWatchlist: (name: string) => void;
    addTickerToWatchlist: (watchlistName: string, ticker: string) => void;
    removeTickerFromWatchlist: (watchlistName: string, ticker: string) => void;
    setActiveWatchlist: (name: string) => void;

    // Chat Actions
    sendMessageInThread: (threadId: string, content: string, senderRole?: 'user' | 'promethea' | 'antigravity' | 'peer', parentId?: string | null) => string;
    createPeerThread: (peerName: string, peerDid: string) => void;
    createGroupThread: (groupName: string, selectedPeersAndAgents: string[]) => void;
    setActiveThread: (threadId: string) => void;
    resetChatThreads: () => void;
    startVideoConference: (threadId: string) => void;
    endVideoConference: () => void;
    pivotChatStream: (threadId: string, modifier: string, interruptedContent?: string) => void;
    anchorChatThread: (threadId: string, targetNodeId: string) => void;
    pauseNode: (threadId: string, nodeId: string, snapshot: ExecutionSnapshot) => void;
    resumeNode: (threadId: string, nodeId: string) => void;

    // OS Window Actions
    openOSWindow: (id: string, type: string, title: string) => void;
    closeOSWindow: (id: string) => void;
    updateOSWindow: (id: string, updates: Partial<OSWindowData>) => void;
    focusOSWindow: (id: string) => void;
    popOutOSWindow: (id: string) => void;
    syncHUDState: (state: Partial<HUDState>) => void;
    setGlobalVix: (val: number) => void;

    // Deal Flow Actions
    listAsset: (asset: Asset) => void;
    createEscrow: (buyerDid: string, assetId: string, amount: number) => void;
    placeLimitOrder: (assetId: string, price: number, side: 'BUY'|'SELL') => void;
    executeAtomicSwap: (escrowId: string) => void;
}

const defaultWatchlists: Watchlist[] = [
    { name: 'Default Watchlist', tickers: ['TSLA', 'AAPL', 'NVDA', 'MSFT', 'SOL', 'ETH'] },
    { name: 'High Yield Pools', tickers: ['SOL', 'ETH', 'USDC'] },
    { name: 'Macro Core', tickers: ['AAPL', 'MSFT', 'BTC'] }
];

const defaultThreads: ChatThread[] = [
    {
        id: 'general-council',
        name: 'General Council',
        type: 'group',
        peers: ['user', 'promethea', 'antigravity'],
        avatar: '🏛️',
        messages: [
            {
                id: 'gen-1',
                sender: 'System',
                role: 'peer',
                content: 'Sovereign ASGI Council chamber online. Human peers and cognitive agents synchronized.',
                timestamp: new Date().toISOString()
            }
        ]
    },
    {
        id: 'promethea-asgi',
        name: 'Promethea ASGI',
        type: 'agent',
        peers: ['user', 'promethea'],
        avatar: '⚡',
        messages: [
            {
                id: 'prom-1',
                sender: 'promethea',
                role: 'promethea',
                content: 'SYSTEM ONLINE. Resident ASGI Promethea Clojure LISP core active. How shall we underwrite citizen prosperity today?',
                timestamp: new Date().toISOString()
            }
        ]
    },
    {
        id: 'antigravity-pair',
        name: 'Antigravity Pair',
        type: 'agent',
        peers: ['user', 'antigravity'],
        avatar: '🪐',
        messages: [
            {
                id: 'anti-1',
                sender: 'antigravity',
                role: 'antigravity',
                content: "Agnostic Pair Programmer Antigravity compiled. Ready to stage codebase edits, compile sandbox targets, and hot-load production updates.",
                timestamp: new Date().toISOString()
            }
        ]
    },
    {
        id: 'peer-joshua',
        name: 'Citizen Joshua',
        type: 'p2p',
        peers: ['user', 'did:sovereign:peer:0x8f2a'],
        avatar: '💎',
        messages: [
            {
                id: 'josh-1',
                sender: 'Joshua',
                role: 'peer',
                content: 'Handshake completed. Decentralized channel established with Citizen Joshua. Secured by did:sovereign:peer:0x8f2a...',
                timestamp: new Date().toISOString(),
                signature: 'sig:0x7d2f9b8a3e1c0d4f'
            }
        ]
    }
];

const defaultState: HUDState = {
    activePillar: 'ATLAS',
    activeTab: null,
    isMacroView: true,
    selectedNodeId: null,
    activeFocusPanel: null,
    cockpitHoldingsTab: null,
    cockpitOpsTab: null,
    cockpitDrilldownAssetId: null,
    competencyLevel: 'NOVICE',
    omniScannerTarget: null,
    activeAssetTarget: null,
    activePOI: defaultPOI,
    watchlists: defaultWatchlists,
    activeWatchlistName: 'Default Watchlist',
    pendingCoPilotPrompt: null,
    chatThreads: defaultThreads,
    activeThreadId: 'general-council',
    activeMeetUrl: null,
    userDid: 'did:sovereign:citizen:0x9f1d2b8a3e1c0d4f',
    osWindows: [],
    reduceAnimations: false,
    isPhosphorMode: false,
    globalVix: 15.0,
    mapMode: 'SURFACE',
    celestialMesh: false,
    activeHazards: [],
    is3DTilesEnabled: false,
    isGhostArchitectureEnabled: true,
    isLiquidityArcsEnabled: true,
    isHeatmapEnabled: true,
    isOsirisTelemetryEnabled: true,
    isMapInteractive: false,
    selectedCelestialId: null,
    selectedDeepFieldBody: null,
    interstellarTransitioning: null,
    assets: [
        {
            id: 'asset-0x1',
            type: 'COMPUTE_NODE',
            name: 'Wyoming Cluster Alpha',
            description: 'High-density compute node in Wyoming Citadel.',
            ownership: 'WHOLE',
            pricingMode: 'FIXED',
            valuationUSDC: 24500,
            isUCC1Filed: true,
            ownerDid: 'did:sovereign:citizen:0x9f1d2b8a3e1c0d4f'
        },
        {
            id: 'asset-0x2',
            type: 'REAL_ESTATE',
            name: 'Whiskey River Retreat (Syndicate)',
            description: '100-acre off-grid sustainable retreat.',
            ownership: 'FRACTIONAL',
            pricingMode: 'ORDER_BOOK',
            valuationUSDC: 1450000,
            sharesTotal: 10000,
            sharesAvailable: 2500,
            isUCC1Filed: true,
            ownerDid: 'did:sovereign:org:whiskey-river'
        }
    ],
    escrows: [],
    treasury: {
        balanceUSDC: 142394.00,
        balanceUVT: 250000,
        lockedUSDC: 0
    }
};

const HUDContext = createContext<HUDContextType | undefined>(undefined);

export const HUDProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<HUDState>(defaultState);

    const isOsirisTelemetryEnabled = state.isOsirisTelemetryEnabled;
    const isOsirisTelemetryEnabledRef = React.useRef(isOsirisTelemetryEnabled);
    useEffect(() => {
        isOsirisTelemetryEnabledRef.current = isOsirisTelemetryEnabled;
    }, [isOsirisTelemetryEnabled]);

    // Hydrate state from localStorage on mount (SSR safe)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedWatchlists = localStorage.getItem('promethea-watchlists');
            const savedActive = localStorage.getItem('promethea-active-watchlist');
            
            const savedThreads = localStorage.getItem('promethea-chat-threads');
            const savedActiveThread = localStorage.getItem('promethea-active-thread-id');
            let parsedThreads = ensureDSGStructure(defaultThreads);
            let activeThreadIdToSet = savedActiveThread || 'general-council';

            if (savedThreads) {
                try {
                    const parsed = JSON.parse(savedThreads);
                    const serialized = JSON.stringify(parsed);
                    const hasDunningError = serialized.includes('118835907818') || serialized.includes('dunning');
                    if (hasDunningError) {
                        console.warn('[HUD State] Stale dunning errors detected in cached chat threads. Programmatically purging and resetting chat threads to default...');
                        localStorage.removeItem('promethea-chat-threads');
                        localStorage.removeItem('promethea-active-thread-id');
                        activeThreadIdToSet = 'general-council';
                    } else {
                        parsedThreads = ensureDSGStructure(parsed);
                    }
                } catch (e) {
                    console.warn('[HUD State] Failed to parse saved chat threads:', e);
                }
            }

            const savedOSWindows = localStorage.getItem('promethea-os-windows');
            const savedPOI = localStorage.getItem('promethea-active-poi');
            let parsedPOI = defaultPOI;
            if (savedPOI && savedPOI !== 'null' && savedPOI !== 'undefined') {
                try {
                    const parsed = JSON.parse(savedPOI);
                    if (parsed && typeof parsed === 'object') {
                        const coords = parsed.coordinates || {};
                        const metrics = parsed.metrics || {};
                        parsedPOI = {
                            ...defaultPOI,
                            ...parsed,
                            coordinates: {
                                lat: Number(coords.lat ?? defaultPOI.coordinates.lat),
                                lng: Number(coords.lng ?? defaultPOI.coordinates.lng),
                                alt: coords.alt !== undefined ? Number(coords.alt) : defaultPOI.coordinates.alt,
                            },
                            metrics: {
                                solar: Number(metrics.solar ?? defaultPOI.metrics.solar),
                                wind: Number(metrics.wind ?? defaultPOI.metrics.wind),
                                water: Number(metrics.water ?? defaultPOI.metrics.water),
                                zoning: Number(metrics.zoning ?? defaultPOI.metrics.zoning),
                            },
                            photos: Array.isArray(parsed.photos) ? parsed.photos : defaultPOI.photos || [],
                            ownership: parsed.ownership ? {
                                ownerDid: parsed.ownership.ownerDid || defaultPOI.ownership?.ownerDid || '',
                                ownerName: parsed.ownership.ownerName || defaultPOI.ownership?.ownerName || '',
                                stakedSovereignUnits: Number(parsed.ownership.stakedSovereignUnits ?? defaultPOI.ownership?.stakedSovereignUnits ?? 0)
                            } : defaultPOI.ownership,
                            referenceFrame: parsed.referenceFrame || defaultPOI.referenceFrame,
                            name: parsed.name || defaultPOI.name
                        };
                    }
                } catch (e) {
                    console.warn('[HUD State] Failed to parse saved POI:', e);
                }
            }
            
            const savedMapMode = localStorage.getItem('promethea-map-mode') as 'INTERSTELLAR' | 'SURFACE' | null;
            setState(prev => ({
                ...prev,
                watchlists: savedWatchlists ? JSON.parse(savedWatchlists) : defaultWatchlists,
                activeWatchlistName: savedActive || 'Default Watchlist',
                chatThreads: parsedThreads,
                activeThreadId: activeThreadIdToSet,
                osWindows: savedOSWindows ? JSON.parse(savedOSWindows) : [],
                reduceAnimations: localStorage.getItem('promethea-reduce-animations') === 'true',
                isPhosphorMode: localStorage.getItem('promethea-isPhosphorMode') === 'true',
                activePOI: parsedPOI,
                mapMode: savedMapMode || 'SURFACE',
                celestialMesh: localStorage.getItem('promethea-celestial-mesh') === 'true',
                is3DTilesEnabled: localStorage.getItem('promethea-is3DTilesEnabled') === 'true',
                isGhostArchitectureEnabled: localStorage.getItem('promethea-isGhostArchitectureEnabled') !== 'false',
                isLiquidityArcsEnabled: localStorage.getItem('promethea-isLiquidityArcsEnabled') !== 'false',
                isHeatmapEnabled: localStorage.getItem('promethea-isHeatmapEnabled') !== 'false',
                isOsirisTelemetryEnabled: localStorage.getItem('promethea-isOsirisTelemetryEnabled') !== 'false',
            }));
        }
    }, []);

    // Periodic Osiris Risk Assessment Loop
    useEffect(() => {
        let active = true;
        let timer: any = null;

        const checkHazards = async () => {
            if (!isOsirisTelemetryEnabledRef.current) return;

            const citadels = [
                { name: "Neo-Tokyo Citadel", lat: 35.6762, lng: 139.6503 },
                { name: "Wyoming Citadel", lat: 42.8252, lng: -108.7513 },
                { name: "Jacksonville Core", lat: 30.3322, lng: -81.6557 }
            ];

            const allHazards: any[] = [];

            try {
                await Promise.all(citadels.map(async (citadel) => {
                    const res = await fetch('/api/telemetry/verify-hazard', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nodeCoordinates: { lat: citadel.lat, lng: citadel.lng },
                            searchRadiusKm: 50.0,
                            hazardTypes: ['wildfire', 'earthquakes', 'global_incidents']
                        })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.hazardFound && Array.isArray(data.hazards)) {
                            data.hazards.forEach((h: any) => {
                                allHazards.push({
                                    ...h,
                                    citadelName: citadel.name
                                });
                            });
                        }
                    }
                }));

                if (active) {
                    setState(prev => {
                        const currentHazardsStr = JSON.stringify(prev.activeHazards || []);
                        const newHazardsStr = JSON.stringify(allHazards);
                        if (currentHazardsStr === newHazardsStr) {
                            return prev;
                        }
                        return {
                            ...prev,
                            activeHazards: allHazards
                        };
                    });
                }
            } catch (err) {
                console.warn('[HUD Store] Failed to query verify-hazard:', err);
            }
        };

        checkHazards();
        timer = setInterval(checkHazards, 12000); // Check every 12 seconds

        return () => {
            active = false;
            clearInterval(timer);
        };
    }, []);

    const setHUDState = (newState: Partial<HUDState>) => {
        setState((prev) => {
            const updated = { ...prev, ...newState };
            // Auto persist watchlists if updated
            if (typeof window !== 'undefined') {
                if (newState.watchlists) {
                    localStorage.setItem('promethea-watchlists', JSON.stringify(newState.watchlists));
                }
                if (newState.activeWatchlistName) {
                    localStorage.setItem('promethea-active-watchlist', newState.activeWatchlistName);
                }
                if (newState.osWindows) {
                    localStorage.setItem('promethea-os-windows', JSON.stringify(newState.osWindows));
                }
                if (newState.activePOI) {
                    localStorage.setItem('promethea-active-poi', JSON.stringify(newState.activePOI));
                }
                if (newState.mapMode) {
                    localStorage.setItem('promethea-map-mode', newState.mapMode);
                }
                if (newState.celestialMesh !== undefined) {
                    localStorage.setItem('promethea-celestial-mesh', String(newState.celestialMesh));
                }
                if (newState.is3DTilesEnabled !== undefined) {
                    localStorage.setItem('promethea-is3DTilesEnabled', String(newState.is3DTilesEnabled));
                }
                if (newState.isGhostArchitectureEnabled !== undefined) {
                    localStorage.setItem('promethea-isGhostArchitectureEnabled', String(newState.isGhostArchitectureEnabled));
                }
                if (newState.isLiquidityArcsEnabled !== undefined) {
                    localStorage.setItem('promethea-isLiquidityArcsEnabled', String(newState.isLiquidityArcsEnabled));
                }
                if (newState.isHeatmapEnabled !== undefined) {
                    localStorage.setItem('promethea-isHeatmapEnabled', String(newState.isHeatmapEnabled));
                }
                if (newState.isOsirisTelemetryEnabled !== undefined) {
                    localStorage.setItem('promethea-isOsirisTelemetryEnabled', String(newState.isOsirisTelemetryEnabled));
                }
                if (newState.reduceAnimations !== undefined) {
                    localStorage.setItem('promethea-reduce-animations', String(newState.reduceAnimations));
                }
                if (newState.isPhosphorMode !== undefined) {
                    localStorage.setItem('promethea-isPhosphorMode', String(newState.isPhosphorMode));
                }
            }
            return updated;
        });
    };

    const syncHUDState = (newState: Partial<HUDState>) => {
        setState((prev) => ({ ...prev, ...newState }));
    };

    const toggleView = () => {
        setState((prev) => ({ ...prev, isMacroView: !prev.isMacroView }));
    };

    const toggleAnimations = () => setState(prev => ({ ...prev, reduceAnimations: !prev.reduceAnimations }));

    const togglePhosphorMode = () => setState(prev => ({ ...prev, isPhosphorMode: !prev.isPhosphorMode }));

    const activatePillar = (pillar: PillarCategory | null, defaultTab: string | null = null) => {
        setState((prev) => {
            // Toggle off if clicking the same pillar
            if (prev.activePillar === pillar) {
                return { ...prev, activePillar: null as any, activeFocusPanel: null, activeTab: null };
            }
            // Otherwise, open left and right trays in tandem
            return { 
                ...prev, 
                activePillar: pillar as any, 
                activeFocusPanel: pillar, // Map the pillar directly to the focus panel
                activeTab: defaultTab 
            };
        });
    };

    const activateFocusPanel = (panel: string | null) => {
        if (panel === null) {
            setState((prev) => ({ ...prev, activeFocusPanel: prev.activePillar || null }));
            return;
        }
        
        let title = 'FOCUS PANEL';
        switch (panel) {
            case 'EXCHANGE': title = 'ASGI // RWA EXCHANGE'; break;
            case 'SQL_EXPLORER': title = 'SUBSTRATE // SQL STATE EXPLORER'; break;
            case 'CLI_GUIDE': title = 'DEVELOPERS // CLI HOOK'; break;
            case 'SWEAT_CLAIM': title = 'PASSPORT // SWEAT-EQUITY CLAIMS'; break;
            case 'FINANCIALS': title = 'TREASURY // FINANCIAL AUDIT STATEMENT'; break;
            case 'PROMETHEA_ASGI': title = 'PROMETHEA ASGI // COGNITIVE MONITORS'; break;
            case 'WALLET': title = 'IDENTITY // SOVEREIGN WALLET'; break;
            case 'OMNI_SCANNER': title = 'PROMETHEA // OMNI-SCANNER'; break;
            case 'ASSET_CANVAS': title = 'ASGI // DYNAMIC ASSET CANVAS'; break;
            case 'CONFERENCE': title = 'ASGI // LIVE CONFERENCE'; break;
            case 'BIOLOGICAL_POW': title = 'ORACLE // BIOLOGICAL PROOF OF WORK'; break;
            case 'MINER_NODE': title = 'INFRASTRUCTURE // PROMETHEAN MINER NODE'; break;
            case 'MARKETPLACE': title = 'ECOSYSTEM // PROMETHEAN MARKETPLACE'; break;
            case 'WORKSPACES': title = 'DECENTRALIZED WORKSPACE // PEER STREAM'; break;
            case 'CHESS':
                setState((prev) => ({ ...prev, activeFocusPanel: 'CHESS' }));
                return; // chess is full screen, keep old logic
        }

        setState((prev) => ({ ...prev, activeFocusPanel: panel }));
        openOSWindow(`focus-${panel.toLowerCase()}`, panel, title);
    };

    const triggerOmniScanner = (target: string) => {
        setState((prev) => ({ ...prev, activeFocusPanel: 'OMNI_SCANNER', omniScannerTarget: target }));
    };

    const activateAssetCanvas = (target: string) => {
        setState((prev) => ({ ...prev, activeFocusPanel: 'ASSET_CANVAS', activeAssetTarget: target }));
    };

    // Watchlist Actions
    const createWatchlist = (name: string) => {
        const cleanName = name.trim();
        if (!cleanName) return;
        
        setState((prev) => {
            if (prev.watchlists.some(w => w.name.toLowerCase() === cleanName.toLowerCase())) return prev;
            const updatedLists = [...prev.watchlists, { name: cleanName, tickers: [] }];
            
            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-watchlists', JSON.stringify(updatedLists));
                localStorage.setItem('promethea-active-watchlist', cleanName);
            }
            return {
                ...prev,
                watchlists: updatedLists,
                activeWatchlistName: cleanName
            };
        });
    };

    const deleteWatchlist = (name: string) => {
        if (name === 'Default Watchlist') return; // protect baseline
        
        setState((prev) => {
            const updatedLists = prev.watchlists.filter(w => w.name !== name);
            const fallbackActive = prev.activeWatchlistName === name ? 'Default Watchlist' : prev.activeWatchlistName;
            
            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-watchlists', JSON.stringify(updatedLists));
                localStorage.setItem('promethea-active-watchlist', fallbackActive);
            }
            return {
                ...prev,
                watchlists: updatedLists,
                activeWatchlistName: fallbackActive
            };
        });
    };

    const addTickerToWatchlist = (watchlistName: string, ticker: string) => {
        const cleanTicker = ticker.trim().toUpperCase();
        if (!cleanTicker) return;
        
        setState((prev) => {
            const updatedLists = prev.watchlists.map(w => {
                if (w.name === watchlistName) {
                    if (w.tickers.includes(cleanTicker)) return w;
                    return { ...w, tickers: [...w.tickers, cleanTicker] };
                }
                return w;
            });
            
            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-watchlists', JSON.stringify(updatedLists));
            }
            return {
                ...prev,
                watchlists: updatedLists
            };
        });
    };

    const removeTickerFromWatchlist = (watchlistName: string, ticker: string) => {
        setState((prev) => {
            const updatedLists = prev.watchlists.map(w => {
                if (w.name === watchlistName) {
                    return { ...w, tickers: w.tickers.filter(t => t !== ticker) };
                }
                return w;
            });
            
            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-watchlists', JSON.stringify(updatedLists));
            }
            return {
                ...prev,
                watchlists: updatedLists
            };
        });
    };

    const setActiveWatchlist = (name: string) => {
        setState((prev) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-active-watchlist', name);
            }
            return {
                ...prev,
                activeWatchlistName: name
            };
        });
    };

    const sendMessageInThread = (
        threadId: string, 
        content: string, 
        senderRole: 'user' | 'promethea' | 'antigravity' | 'peer' = 'user',
        parentId?: string | null
    ): string => {
        const cleanContent = content.trim();
        const newMessageId = `${threadId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        if (!cleanContent) return '';

        setState((prev) => {
            const timestamp = new Date().toISOString();
            
            // Mock dynamic signature hash for citizen messages
            let signature = undefined;
            if (senderRole === 'user') {
                const messageHash = Array.from(cleanContent).reduce((acc, char) => acc + char.charCodeAt(0), 0);
                signature = `sig:0x${((messageHash * 31) & 0xffffffff).toString(16).padEnd(8, '0')}`;
            }

            const updatedThreads = prev.chatThreads.map((t) => {
                if (t.id === threadId) {
                    let resolvedParentId: string | null = null;
                    if (parentId !== undefined) {
                        resolvedParentId = parentId;
                    } else if (t.activeHeadMessageId) {
                        resolvedParentId = t.activeHeadMessageId;
                    } else if (t.messages.length > 0) {
                        resolvedParentId = t.messages[t.messages.length - 1].id;
                    }

                    const newMessage: ChatMessage = {
                        id: newMessageId,
                        sender: senderRole === 'user' ? 'user' : (senderRole === 'promethea' ? 'promethea' : (senderRole === 'antigravity' ? 'antigravity' : 'peer')),
                        role: senderRole,
                        content: cleanContent,
                        timestamp,
                        signature,
                        parentId: resolvedParentId,
                        status: 'completed',
                        childrenIds: []
                    };

                    const updatedMessages = t.messages.map(m => {
                        if (m.id === resolvedParentId) {
                            return {
                                ...m,
                                childrenIds: [...(m.childrenIds || []), newMessageId]
                            };
                        }
                        return m;
                    });

                    return { 
                        ...t, 
                        messages: [...updatedMessages, newMessage],
                        activeHeadMessageId: newMessageId
                    };
                }
                return t;
            });

            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-chat-threads', JSON.stringify(updatedThreads));
            }
            return {
                ...prev,
                chatThreads: updatedThreads
            };
        });

        return newMessageId;
    };

    const pivotChatStream = (threadId: string, modifier: string, interruptedContent?: string) => {
        const cleanModifier = modifier.trim();
        if (!cleanModifier) return;

        setState((prev) => {
            const updatedThreads = prev.chatThreads.map((t) => {
                if (t.id === threadId) {
                    let headId = t.activeHeadMessageId;
                    const messages = t.messages.map(m => ({ ...m }));
                    const activeMsg = messages.find(m => m.id === headId);

                    if (activeMsg) {
                        activeMsg.status = 'interrupted';
                        if (interruptedContent !== undefined) {
                            activeMsg.content = interruptedContent;
                        }
                    }

                    const pivotUserId = `${threadId}-pivot-usr-${Date.now()}`;
                    const pivotUserMsg: ChatMessage = {
                        id: pivotUserId,
                        sender: 'user',
                        role: 'user',
                        content: `⚡ PIVOT MODIFIER: ${cleanModifier}`,
                        timestamp: new Date().toISOString(),
                        parentId: headId || null,
                        status: 'completed',
                        childrenIds: []
                    };

                    if (activeMsg) {
                        activeMsg.childrenIds = [...(activeMsg.childrenIds || []), pivotUserId];
                    }

                    messages.push(pivotUserMsg);

                    return {
                        ...t,
                        messages,
                        activeHeadMessageId: pivotUserId
                    };
                }
                return t;
            });

            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-chat-threads', JSON.stringify(updatedThreads));
            }
            return {
                ...prev,
                chatThreads: updatedThreads
            };
        });
    };

    const anchorChatThread = (threadId: string, targetNodeId: string) => {
        setState((prev) => {
            const updatedThreads = prev.chatThreads.map((t) => {
                if (t.id === threadId) {
                    const exists = t.messages.some(m => m.id === targetNodeId);
                    if (exists) {
                        return {
                            ...t,
                            activeHeadMessageId: targetNodeId
                        };
                    }
                }
                return t;
            });

            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-chat-threads', JSON.stringify(updatedThreads));
            }
            return {
                ...prev,
                chatThreads: updatedThreads
            };
        });
    };

    const pauseNode = (threadId: string, nodeId: string, snapshot: ExecutionSnapshot) => {
        setState((prev) => {
            const updatedThreads = prev.chatThreads.map((t) => {
                if (t.id === threadId) {
                    const messages = t.messages.map((m) => {
                        if (m.id === nodeId) {
                            return {
                                ...m,
                                status: 'paused' as const,
                                executionSnapshot: snapshot
                            };
                        }
                        return m;
                    });
                    return {
                        ...t,
                        messages
                    };
                }
                return t;
            });

            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-chat-threads', JSON.stringify(updatedThreads));
            }
            return {
                ...prev,
                chatThreads: updatedThreads
            };
        });
    };

    const resumeNode = (threadId: string, nodeId: string) => {
        setState((prev) => {
            const updatedThreads = prev.chatThreads.map((t) => {
                if (t.id === threadId) {
                    const messages = t.messages.map((m) => {
                        if (m.id === nodeId) {
                            return {
                                ...m,
                                status: 'completed' as const
                            };
                        }
                        return m;
                    });
                    return {
                        ...t,
                        messages
                    };
                }
                return t;
            });

            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-chat-threads', JSON.stringify(updatedThreads));
            }
            return {
                ...prev,
                chatThreads: updatedThreads
            };
        });
    };

    const createPeerThread = (peerName: string, peerDid: string) => {
        const cleanName = peerName.trim();
        const cleanDid = peerDid.trim();
        if (!cleanName || !cleanDid) return;

        setState((prev) => {
            const threadId = `peer-${cleanDid.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            if (prev.chatThreads.some((t) => t.id === threadId)) return prev;

            const newThread: ChatThread = {
                id: threadId,
                name: cleanName,
                type: 'p2p',
                peers: ['user', cleanDid],
                avatar: '👤',
                messages: [
                    {
                        id: `handshake-${Date.now()}`,
                        sender: cleanName,
                        role: 'peer',
                        content: `Handshake completed. Decentralized channel established with Citizen ${cleanName}. Secured by ${cleanDid}.`,
                        timestamp: new Date().toISOString(),
                        signature: `sig:0x${Math.floor(Math.random() * 0xffffffff).toString(16).padEnd(8, '0')}`
                    }
                ]
            };

            const updatedThreads = [...prev.chatThreads, newThread];
            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-chat-threads', JSON.stringify(updatedThreads));
                localStorage.setItem('promethea-active-thread-id', threadId);
            }
            return {
                ...prev,
                chatThreads: updatedThreads,
                activeThreadId: threadId
            };
        });
    };

    const createGroupThread = (groupName: string, selectedPeersAndAgents: string[]) => {
        const cleanName = groupName.trim();
        if (!cleanName) return;

        setState((prev) => {
            const threadId = `group-${Date.now()}`;
            
            const newThread: ChatThread = {
                id: threadId,
                name: cleanName,
                type: 'group',
                peers: ['user', ...selectedPeersAndAgents],
                avatar: '👥',
                messages: [
                    {
                        id: `init-${Date.now()}`,
                        sender: 'System',
                        role: 'peer',
                        content: `Hybrid Group Chat "${cleanName}" created. Participants: ${['user', ...selectedPeersAndAgents].join(', ')}.`,
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            const updatedThreads = [...prev.chatThreads, newThread];
            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-chat-threads', JSON.stringify(updatedThreads));
                localStorage.setItem('promethea-active-thread-id', threadId);
            }
            return {
                ...prev,
                chatThreads: updatedThreads,
                activeThreadId: threadId
            };
        });
    };

    const setActiveThread = (threadId: string) => {
        setState((prev) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-active-thread-id', threadId);
            }
            return {
                ...prev,
                activeThreadId: threadId
            };
        });
    };

    const resetChatThreads = () => {
        setState((prev) => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('promethea-chat-threads');
                localStorage.removeItem('promethea-active-thread-id');
            }
            return {
                ...prev,
                chatThreads: defaultThreads,
                activeThreadId: 'general-council'
            };
        });
    };

    const startVideoConference = (threadId: string) => {
        setState((prev) => {
            const randomCode = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
            const meetUrl = `https://meet.google.com/${randomCode}`;
            return {
                ...prev,
                activeMeetUrl: meetUrl,
                activeFocusPanel: 'CONFERENCE'
            };
        });
    };

    const endVideoConference = () => {
        setState((prev) => ({
            ...prev,
            activeMeetUrl: null,
            activeFocusPanel: null
        }));
    };

    // --- OS Window Actions ---
    const openOSWindow = (id: string, type: string, title: string) => {
        setState((prev) => {
            const existing = prev.osWindows.find(w => w.id === id);
            let updatedOSWindows;
            
            if (existing) {
                // Just focus and un-minimize
                const highestZ = Math.max(0, ...prev.osWindows.map(w => w.zIndex));
                updatedOSWindows = prev.osWindows.map(w => 
                    w.id === id ? { ...w, zIndex: highestZ + 1, isMinimized: false, isPoppedOut: false } : w
                );
            } else {
                // Create new
                const highestZ = Math.max(0, ...prev.osWindows.map(w => w.zIndex));
                const newWindow: OSWindowData = {
                    id, type, title,
                    x: 100 + (prev.osWindows.length * 40),
                    y: 100 + (prev.osWindows.length * 40),
                    width: 500, height: 600,
                    zIndex: highestZ + 1,
                    isMinimized: false,
                    isMaximized: false,
                    isPoppedOut: false
                };
                updatedOSWindows = [...prev.osWindows, newWindow];
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-os-windows', JSON.stringify(updatedOSWindows));
            }
            return { ...prev, osWindows: updatedOSWindows };
        });
    };

    const closeOSWindow = (id: string) => {
        setState((prev) => {
            const updated = prev.osWindows.filter(w => w.id !== id);
            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-os-windows', JSON.stringify(updated));
            }
            const isClosingActiveFocus = prev.activeFocusPanel && `focus-${prev.activeFocusPanel.toLowerCase()}` === id.toLowerCase();
            return { 
                ...prev, 
                osWindows: updated,
                activeFocusPanel: isClosingActiveFocus ? prev.activePillar : prev.activeFocusPanel
            };
        });
    };

    const updateOSWindow = (id: string, updates: Partial<OSWindowData>) => {
        setState((prev) => {
            const updated = prev.osWindows.map(w => w.id === id ? { ...w, ...updates } : w);
            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-os-windows', JSON.stringify(updated));
            }
            return { ...prev, osWindows: updated };
        });
    };

    const focusOSWindow = (id: string) => {
        setState((prev) => {
            const target = prev.osWindows.find(w => w.id === id);
            if (!target) return prev;
            
            const highestZ = Math.max(0, ...prev.osWindows.map(w => w.zIndex));
            if (target.zIndex === highestZ) return prev; // Already focused
            
            const updated = prev.osWindows.map(w => w.id === id ? { ...w, zIndex: highestZ + 1 } : w);
            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-os-windows', JSON.stringify(updated));
            }
            return { ...prev, osWindows: updated };
        });
    };

    const popOutOSWindow = (id: string) => {
        setState((prev) => {
            const target = prev.osWindows.find(w => w.id === id);
            if (!target) return prev;

            // Mark as popped out in state
            const updated = prev.osWindows.map(w => w.id === id ? { ...w, isPoppedOut: true } : w);
            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-os-windows', JSON.stringify(updated));
                // Open new browser window
                window.open(`/dashboard/popout/${target.type}`, `popout-${target.id}`, `width=${target.width},height=${target.height},left=${window.screenX + target.x},top=${window.screenY + target.y}`);
            }
            
            return { ...prev, osWindows: updated };
        });
    };

    const setGlobalVix = (val: number) => {
        setState(prev => ({ ...prev, globalVix: val }));
    };

    const setActivePOI = (poi: POIDetails) => {
        setHUDState({ activePOI: poi });
    };

    const listAsset = (asset: Asset) => {
        setState((prev) => ({
            ...prev,
            assets: [...prev.assets, asset]
        }));
    };

    const createEscrow = (buyerDid: string, assetId: string, amount: number) => {
        setState((prev) => {
            const escrowId = `escrow-${Date.now()}`;
            const newEscrow: EscrowOffer = {
                id: escrowId,
                assetId,
                buyerDid,
                amountUSDC: amount,
                status: 'PENDING',
                timestamp: new Date().toISOString()
            };
            return {
                ...prev,
                escrows: [...prev.escrows, newEscrow]
            };
        });
    };

    const placeLimitOrder = (assetId: string, price: number, side: 'BUY'|'SELL') => {
        // Future logic for expanding the order book limit orders
        console.log(`Placed ${side} order for ${assetId} at $${price}`);
    };

    const executeAtomicSwap = (escrowId: string) => {
        setState((prev) => {
            const escrowIndex = prev.escrows.findIndex(e => e.id === escrowId);
            if (escrowIndex === -1) return prev;

            const escrow = prev.escrows[escrowIndex];
            const assetIndex = prev.assets.findIndex(a => a.id === escrow.assetId);
            if (assetIndex === -1) return prev;

            const asset = prev.assets[assetIndex];

            // Verify Treasury has sufficient UVT/USDC if the user is buying
            // (Assuming user is 'did:sovereign:citizen:0x9f1d2b8a3e1c0d4f')
            const isUserBuying = escrow.buyerDid === prev.userDid;
            if (isUserBuying && prev.treasury.balanceUSDC < escrow.amountUSDC) {
                console.warn('[Exchange] Insufficient funds for atomic swap.');
                return prev; // Swap fails
            }

            const updatedTreasury = { ...prev.treasury };
            const updatedAsset = { ...asset };

            // Fractional vs Whole processing
            if (asset.ownership === 'FRACTIONAL' && asset.sharesAvailable) {
                // Determine shares bought based on amount
                // Here we assume 1 share = valuation / total shares (simplified for OTC)
                const sharePrice = asset.valuationUSDC / (asset.sharesTotal || 1);
                const sharesBought = Math.floor(escrow.amountUSDC / sharePrice);

                updatedAsset.sharesAvailable -= sharesBought;
                if (isUserBuying) {
                    updatedTreasury.balanceUSDC -= escrow.amountUSDC;
                } else {
                    updatedTreasury.balanceUSDC += escrow.amountUSDC;
                }
            } else {
                // WHOLE Asset transfer
                updatedAsset.ownerDid = escrow.buyerDid;
                if (isUserBuying) {
                    updatedTreasury.balanceUSDC -= escrow.amountUSDC;
                } else {
                    updatedTreasury.balanceUSDC += escrow.amountUSDC;
                }
            }

            const updatedAssets = [...prev.assets];
            updatedAssets[assetIndex] = updatedAsset;

            const updatedEscrows = [...prev.escrows];
            updatedEscrows[escrowIndex] = { ...escrow, status: 'SETTLED' };

            return {
                ...prev,
                assets: updatedAssets,
                escrows: updatedEscrows,
                treasury: updatedTreasury
            };
        });
    };

    return (
        <HUDContext.Provider value={{ 
            ...state, 
            setHUDState, 
            toggleView, 
            toggleAnimations,
            togglePhosphorMode,
            activatePillar, 
            activateFocusPanel, 
            triggerOmniScanner, 
            activateAssetCanvas,
            setActivePOI,
            createWatchlist,
            deleteWatchlist,
            addTickerToWatchlist,
            removeTickerFromWatchlist,
            setActiveWatchlist,
            sendMessageInThread,
            createPeerThread,
            createGroupThread,
            setActiveThread,
            resetChatThreads,
            startVideoConference,
            endVideoConference,
            pivotChatStream,
            anchorChatThread,
            pauseNode,
            resumeNode,
            openOSWindow,
            closeOSWindow,
            updateOSWindow,
            focusOSWindow,
            popOutOSWindow,
            syncHUDState,
            setGlobalVix,
            listAsset,
            createEscrow,
            placeLimitOrder,
            executeAtomicSwap
        }}>
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
