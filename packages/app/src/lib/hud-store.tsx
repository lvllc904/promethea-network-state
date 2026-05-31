'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PillarCategory = 'ATLAS' | 'ECONOMICS' | 'GOVERNANCE' | 'NARRATIVE' | 'PASSPORT' | 'DIPLOMATIC' | 'PULSE' | 'ASGI' | 'SETTINGS';

export interface Watchlist {
    name: string;
    tickers: string[];
}

export interface ChatMessage {
    id: string;
    sender: string;
    role: 'user' | 'promethea' | 'antigravity' | 'peer';
    content: string;
    timestamp: string;
    signature?: string; // Cryptographic DID signature proof
}

export interface ChatThread {
    id: string;
    name: string;
    type: 'agent' | 'p2p' | 'group';
    peers: string[]; // List of names/DIDs in the channel
    messages: ChatMessage[];
    avatar?: string;
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

export interface HUDState {
    activePillar: PillarCategory;
    activeTab: string | null;
    isMacroView: boolean; // true = Promethea/Global baseline, false = Citizen/Personal focus
    selectedNodeId: string | null; // e.g. for Map interaction
    activeFocusPanel: string | null; // e.g. 'EXCHANGE' | 'SQL_EXPLORER' | 'CLI_GUIDE' | 'SWEAT_CLAIM' | 'FINANCIALS' | 'WALLET' | 'OMNI_SCANNER' | 'ASSET_CANVAS' | 'CONFERENCE'
    omniScannerTarget: string | null; // The address, tx hash, or contract to scan
    activeAssetTarget: string | null; // The ticker or asset ID (e.g. 'TSLA', 'SOL') to focus on the canvas
    
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

    // Economics State
    globalVix: number;
}

interface HUDContextType extends HUDState {
    setHUDState: (state: Partial<HUDState>) => void;
    toggleView: () => void;
    toggleAnimations: () => void;
    activatePillar: (pillar: PillarCategory, defaultTab?: string) => void;
    activateFocusPanel: (panel: string | null) => void;
    triggerOmniScanner: (target: string) => void;
    activateAssetCanvas: (target: string) => void;
    
    // Watchlist Actions
    createWatchlist: (name: string) => void;
    deleteWatchlist: (name: string) => void;
    addTickerToWatchlist: (watchlistName: string, ticker: string) => void;
    removeTickerFromWatchlist: (watchlistName: string, ticker: string) => void;
    setActiveWatchlist: (name: string) => void;

    // Chat Actions
    sendMessageInThread: (threadId: string, content: string, senderRole?: 'user' | 'promethea' | 'antigravity' | 'peer') => void;
    createPeerThread: (peerName: string, peerDid: string) => void;
    createGroupThread: (groupName: string, selectedPeersAndAgents: string[]) => void;
    setActiveThread: (threadId: string) => void;
    startVideoConference: (threadId: string) => void;
    endVideoConference: () => void;

    // OS Window Actions
    openOSWindow: (id: string, type: string, title: string) => void;
    closeOSWindow: (id: string) => void;
    updateOSWindow: (id: string, updates: Partial<OSWindowData>) => void;
    focusOSWindow: (id: string) => void;
    popOutOSWindow: (id: string) => void;
    syncHUDState: (state: Partial<HUDState>) => void;
    setGlobalVix: (val: number) => void;
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
    omniScannerTarget: null,
    activeAssetTarget: null,
    watchlists: defaultWatchlists,
    activeWatchlistName: 'Default Watchlist',
    pendingCoPilotPrompt: null,
    chatThreads: defaultThreads,
    activeThreadId: 'general-council',
    activeMeetUrl: null,
    userDid: 'did:sovereign:citizen:0x9f1d2b8a3e1c0d4f',
    osWindows: [],
    reduceAnimations: false,
    globalVix: 15.0,
};

const HUDContext = createContext<HUDContextType | undefined>(undefined);

export const HUDProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<HUDState>(defaultState);

    // Hydrate state from localStorage on mount (SSR safe)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedWatchlists = localStorage.getItem('promethea-watchlists');
            const savedActive = localStorage.getItem('promethea-active-watchlist');
            const savedThreads = localStorage.getItem('promethea-chat-threads');
            const savedActiveThread = localStorage.getItem('promethea-active-thread-id');
            const savedOSWindows = localStorage.getItem('promethea-os-windows');
            
            setState(prev => ({
                ...prev,
                watchlists: savedWatchlists ? JSON.parse(savedWatchlists) : defaultWatchlists,
                activeWatchlistName: savedActive || 'Default Watchlist',
                chatThreads: savedThreads ? JSON.parse(savedThreads) : defaultThreads,
                activeThreadId: savedActiveThread || 'general-council',
                osWindows: savedOSWindows ? JSON.parse(savedOSWindows) : [],
                reduceAnimations: localStorage.getItem('promethea-reduce-animations') === 'true'
            }));
        }
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

    const toggleAnimations = () => {
        setState((prev) => {
            const newVal = !prev.reduceAnimations;
            if (typeof window !== 'undefined') {
                localStorage.setItem('promethea-reduce-animations', String(newVal));
            }
            return { ...prev, reduceAnimations: newVal };
        });
    };

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
        if (!panel) return;
        
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
            case '16BIT': 
                setState((prev) => ({ ...prev, activeFocusPanel: '16BIT' }));
                return; // 16bit is full screen, keep old logic
            case 'CHESS':
                setState((prev) => ({ ...prev, activeFocusPanel: 'CHESS' }));
                return; // chess is full screen, keep old logic
            case 'PHOSPHOR':
                setState((prev) => ({ ...prev, activeFocusPanel: 'PHOSPHOR' }));
                return; // Phosphor is full screen, keep old logic
        }

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

    const sendMessageInThread = (threadId: string, content: string, senderRole: 'user' | 'promethea' | 'antigravity' | 'peer' = 'user') => {
        const cleanContent = content.trim();
        if (!cleanContent) return;

        setState((prev) => {
            const timestamp = new Date().toISOString();
            
            // Mock dynamic signature hash for citizen messages
            let signature = undefined;
            if (senderRole === 'user') {
                const messageHash = Array.from(cleanContent).reduce((acc, char) => acc + char.charCodeAt(0), 0);
                signature = `sig:0x${((messageHash * 31) & 0xffffffff).toString(16).padEnd(8, '0')}`;
            }

            const newMessage: ChatMessage = {
                id: `${threadId}-${Date.now()}`,
                sender: senderRole === 'user' ? 'user' : (senderRole === 'promethea' ? 'promethea' : (senderRole === 'antigravity' ? 'antigravity' : 'peer')),
                role: senderRole,
                content: cleanContent,
                timestamp,
                signature
            };

            const updatedThreads = prev.chatThreads.map((t) => {
                if (t.id === threadId) {
                    return { ...t, messages: [...t.messages, newMessage] };
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
            return { ...prev, osWindows: updated };
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

    return (
        <HUDContext.Provider value={{ 
            ...state, 
            setHUDState, 
            toggleView, 
            toggleAnimations,
            activatePillar, 
            activateFocusPanel, 
            triggerOmniScanner, 
            activateAssetCanvas,
            createWatchlist,
            deleteWatchlist,
            addTickerToWatchlist,
            removeTickerFromWatchlist,
            setActiveWatchlist,
            sendMessageInThread,
            createPeerThread,
            createGroupThread,
            setActiveThread,
            startVideoConference,
            endVideoConference,
            openOSWindow,
            closeOSWindow,
            updateOSWindow,
            focusOSWindow,
            popOutOSWindow,
            syncHUDState,
            setGlobalVix
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
