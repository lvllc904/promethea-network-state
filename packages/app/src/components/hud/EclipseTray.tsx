'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHUD, POIDetails, defaultPOI } from '@/lib/hud-store';
import { X, Minus, Loader2, BrainCircuit, Globe, Coins, Shield, Star, ExternalLink, Compass, Eye, AlertCircle, Radio, Wifi, Network, Sliders, Zap, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { askPrometheaAction } from '@/app/actions';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useSovereignStore, useSolanaCitizen } from '@promethea/hooks';
import { useMesh } from '@/components/providers/mesh-provider';

import { Rnd } from 'react-rnd';

import { ContextChat } from './ContextChat';
import { DTNManager, BundlePacket, PROPAGATION_DELAYS } from '@/lib/dtn-manager';

class TrayErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("TrayErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-black/40">
                    <AlertCircle className="w-8 h-8 text-rose-500 animate-pulse mb-3" />
                    <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                        System Interface Offline
                    </h3>
                    <p className="text-[9px] font-mono text-zinc-400 max-w-[280px] mt-1.5 uppercase leading-relaxed">
                        An unhandled UI exception occurred within this drawer component context.
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-4 px-3 py-1 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-500/30 text-rose-400 text-[8px] font-mono rounded uppercase tracking-wider transition-all cursor-pointer"
                    >
                        Re-Initialize Frame
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const BotCardsConfig: React.FC = () => {
    const [installed, setInstalled] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem('promethea-installed-cards');
        if (stored) {
            try {
                setInstalled(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        } else {
            localStorage.setItem('promethea-installed-cards', JSON.stringify([]));
        }

        const handleUpdate = () => {
            const current = localStorage.getItem('promethea-installed-cards');
            if (current) {
                try {
                    setInstalled(JSON.parse(current));
                } catch (e) {}
            }
        };

        window.addEventListener('promethea-installed-cards-updated', handleUpdate);
        return () => window.removeEventListener('promethea-installed-cards-updated', handleUpdate);
    }, []);

    const toggleModule = (name: string) => {
        let updated: string[];
        if (installed.includes(name)) {
            updated = installed.filter(item => item !== name);
        } else {
            updated = [...installed, name];
        }
        setInstalled(updated);
        localStorage.setItem('promethea-installed-cards', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('promethea-installed-cards-updated', { detail: updated }));
    };

    const modules = [
        {
            name: "Land Claim",
            desc: "Automated sovereign coordinate mapping, staking, and title deed registration",
            icon: Globe,
        },
        {
            name: "Sweat Equity",
            desc: "Decentralized task distribution, progress auditing, and tokenized payout routing",
            icon: Network,
        }
    ];

    return (
        <div className="border-t border-amber-500/20 pt-3 mt-1 flex flex-col gap-2 shrink-0">
            <h5 className="text-[8px] font-mono text-amber-400 font-bold tracking-widest uppercase flex items-center gap-1">
                <BrainCircuit className="w-3.5 h-3.5" /> MODULAR BOT INSTALLATIONS
            </h5>
            <div className="grid grid-cols-2 gap-2">
                {modules.map((mod) => {
                    const isInstalled = installed.includes(mod.name);
                    const Icon = mod.icon;

                    return (
                        <div key={mod.name} className="relative overflow-hidden rounded-lg border border-amber-500/20 bg-zinc-950/40 p-2 flex flex-col justify-between h-[95px]">
                            {/* Deactivated overlay if uninstalled */}
                            {!isInstalled && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                    <div className="bg-rose-500/90 text-black font-mono font-black text-[9px] tracking-widest px-3 py-0.5 select-none -rotate-12 border border-rose-300">
                                        DEACTIVATED
                                    </div>
                                </div>
                            )}

                            {/* Card Content with potential filters */}
                            <div 
                                className="flex flex-col gap-1 transition-all duration-300"
                                style={!isInstalled ? { filter: 'grayscale(1) brightness(0.5) opacity(0.4)' } : undefined}
                            >
                                <div className="flex items-center gap-1">
                                    <Icon className="w-3 h-3 text-amber-400" />
                                    <span className="text-[9px] font-mono font-black text-white uppercase tracking-wider truncate">
                                        {mod.name}
                                    </span>
                                </div>
                                <p className="text-[7px] font-mono text-zinc-400 uppercase tracking-wide leading-tight line-clamp-2">
                                    {mod.desc}
                                </p>
                            </div>

                            {/* CTA Button */}
                            <button
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => toggleModule(mod.name)}
                                className={`mt-2 w-full py-1 rounded text-[8px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                                    isInstalled 
                                        ? 'bg-amber-950/20 hover:bg-amber-950/60 border border-amber-500/40 text-amber-500' 
                                        : 'bg-amber-950/20 hover:bg-amber-950/60 border border-amber-500/40 text-amber-400'
                                }`}
                            >
                                {isInstalled ? 'UNINSTALL' : 'INSTALL'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const EclipseTray: React.FC = () => {
    const { activePillar, activeFocusPanel, activatePillar, activateFocusPanel, setHUDState, activePOI, setActivePOI, mapMode, reduceAnimations, toggleAnimations } = useHUD();
    const [isMounted, setIsMounted] = useState(false);
    const [dtnQueue, setDtnQueue] = useState<BundlePacket[]>([]);
    
    // Settings drawer states & hooks
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);
    const { isUnlocked } = useSovereignStore();
    const { walletAddress } = useSolanaCitizen();
    const router = useRouter();

    // Close settings drawer on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // The tray remains "open" (expanded) when there's an active focus panel or an active pillar other than ATLAS.
    const isExpanded = !!activeFocusPanel || !!activePillar;

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [storedWidth, setStoredWidth] = useState(440);
    const [preCollapseX, setPreCollapseX] = useState(120);
    const [isDraggingOrResizing, setIsDraggingOrResizing] = useState(false);

    const [size, setSize] = useState({ width: 0, height: 800 });
    const [position, setPosition] = useState({ x: 16, y: 48 });

    useEffect(() => {
        setIsMounted(true);
        
        const localCollapsed = localStorage.getItem('promethea-left-tray-collapsed') === 'true';
        const localWidth = Number(localStorage.getItem('promethea-left-tray-width') || '440');
        const localX = Number(localStorage.getItem('promethea-left-tray-x') || '120');
        const localY = Number(localStorage.getItem('promethea-left-tray-y') || '48');
        const localPreCollapseX = Number(localStorage.getItem('promethea-left-precollapse-x') || '120');

        setIsCollapsed(localCollapsed);
        setStoredWidth(localWidth);
        setPreCollapseX(localPreCollapseX);

        const currentWidth = isExpanded ? (localCollapsed ? 0 : localWidth) : 0;
        const currentX = isExpanded ? (localCollapsed ? 104 : localX) : 16;

        setSize({ width: currentWidth, height: window.innerHeight - 88 });
        setPosition({ x: currentX, y: localY });

        const handleResize = () => setSize(s => ({ ...s, height: window.innerHeight - 88 }));
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        const localCollapsed = localStorage.getItem('promethea-left-tray-collapsed') === 'true';
        const localWidth = Number(localStorage.getItem('promethea-left-tray-width') || '440');
        const localX = Number(localStorage.getItem('promethea-left-tray-x') || '120');

        const currentWidth = isExpanded ? (localCollapsed ? 0 : localWidth) : 0;
        const currentX = isExpanded ? (localCollapsed ? 104 : localX) : 16;

        setSize(s => ({ ...s, width: currentWidth }));
        setPosition(p => ({ ...p, x: currentX }));
    }, [isExpanded, isMounted]);

    const handleToggleCollapse = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (isCollapsed) {
            setIsCollapsed(false);
            localStorage.setItem('promethea-left-tray-collapsed', 'false');
            
            setSize(s => ({ ...s, width: storedWidth }));
            setPosition(p => ({ ...p, x: preCollapseX }));
            localStorage.setItem('promethea-left-tray-x', String(preCollapseX));
        } else {
            setStoredWidth(size.width);
            setPreCollapseX(position.x);
            localStorage.setItem('promethea-left-tray-width', String(size.width));
            localStorage.setItem('promethea-left-precollapse-x', String(position.x));

            setIsCollapsed(true);
            localStorage.setItem('promethea-left-tray-collapsed', 'true');

            setSize(s => ({ ...s, width: 0 }));
            setPosition(p => ({ ...p, x: 104 }));
        }
    };

    // DTN Manager Subscription and Delivery Listener
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const dtn = DTNManager.getInstance();
        const unsubscribe = dtn.addListener((queue) => {
            setDtnQueue(queue);
        });

        const handleDelivery = (e: Event) => {
            const bundle = (e as CustomEvent).detail as BundlePacket;
            if (bundle.destinationUri.startsWith('telemetry/')) {
                console.log('[EclipseTray] Interstellar Telemetry Bundle delivered!', bundle.payload);
                setActivePOI(bundle.payload);
            }
        };

        window.addEventListener('dtn-bundle-delivered', handleDelivery);
        return () => {
            unsubscribe();
            window.removeEventListener('dtn-bundle-delivered', handleDelivery);
        };
    }, [isMounted]);

    let pillarColorClass = 'rim-highlight';
    switch(activePillar) {
        case 'ATLAS': pillarColorClass = 'rim-highlight-governance'; break; // Cyan highlight for Atlas
        case 'ECONOMICS': pillarColorClass = 'rim-highlight-economics'; break;
        case 'GOVERNANCE': pillarColorClass = 'rim-highlight-governance'; break;
        case 'ASGI': pillarColorClass = 'rim-highlight-governance'; break;
        case 'NARRATIVE': pillarColorClass = 'rim-highlight-narrative'; break;
        case 'DIPLOMATIC': pillarColorClass = 'rim-highlight-diplomatic'; break;
        case 'PULSE': pillarColorClass = 'rim-highlight-diplomatic'; break;
        case 'SETTINGS': pillarColorClass = 'rim-highlight'; break;
        case 'CHAT': pillarColorClass = 'rim-highlight-governance'; break;
    }

    const handlePlanetSwap = (frame: 'EARTH' | 'LUNA' | 'MARS') => {
        if (frame === 'EARTH') {
            setActivePOI(defaultPOI);
            return;
        }

        const targetPOI: POIDetails = frame === 'LUNA' ? {
            name: "Clavius Crater Hub",
            formattedAddress: "Clavius Crater, Selenographic Coord Frame, Luna",
            website: "https://clavius.luna.lvhllc.org",
            rating: 4.9,
            photos: ["https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=600&q=80"],
            coordinates: { lat: -58.4, lng: -14.4, alt: -1200 },
            referenceFrame: 'LUNA',
            ownership: {
                ownerDid: "did:sovereign:luna:0x7c4e2b8a3e1c0d3a",
                ownerName: "Luna Transport Logistics",
                stakedSovereignUnits: 32000
            },
            publicPlans: "Phase 1: Excavate sub-surface lava tubes for atmospheric sealing. Phase 2: Deploy solar collectors on crater rim (Peak of Eternal Light) and establish water ice mining infrastructure.",
            metrics: { solar: 95, wind: 0, water: 30, zoning: 40 }
        } : {
            name: "Arsia Mons Outpost",
            formattedAddress: "Arsia Mons Caldera, Areocentric Coord Frame, Mars",
            website: "https://arsia-mons.mars.lvhllc.org",
            rating: 4.7,
            photos: ["https://images.unsplash.com/photo-1612892483236-42d68a57623d?auto=format&fit=crop&w=600&q=80"],
            coordinates: { lat: -8.4, lng: -120.0, alt: 16000 },
            referenceFrame: 'MARS',
            ownership: {
                ownerDid: "did:sovereign:mars:0x3a8e2b8f1c0d4f5e",
                ownerName: "Areocentre Mining Corp",
                stakedSovereignUnits: 45000
            },
            publicPlans: "Phase 1: Erect localized aerostat weather beacons and low-pressure CO2 extraction dome. Phase 2: Expand geothermal water reservoirs and calibrate deep-space high-bandwidth telemetry array.",
            metrics: { solar: 40, wind: 65, water: 15, zoning: 55 }
        };

        // Instantly switch coordinates focus to center map, but set state to syncing text
        setActivePOI({
            name: `ESTABLISHING INTERSTELLAR TELEMETRY...`,
            formattedAddress: `Simulating RFC 5050 Bundle link with ${frame}`,
            website: `https://${frame.toLowerCase()}.lvhllc.org`,
            coordinates: targetPOI.coordinates,
            referenceFrame: frame,
            metrics: { solar: 0, wind: 0, water: 0, zoning: 0 },
            publicPlans: `Interplanetary telemetry packet transmitting from EARTH to ${frame}... Expect propagation delays of ~${frame === 'LUNA' ? '1.3s' : '12.0s'} before full metabolic sync.`
        });

        // Enqueue high-latency telemetry packet
        DTNManager.getInstance().enqueueBundle('EARTH', frame, `telemetry/${frame.toLowerCase()}`, targetPOI);
    };

    if (!isMounted) return null;

    return (
        <>
        <Rnd
            size={size}
            position={position}
            disableDragging={isCollapsed || !isExpanded}
            onDragStart={() => setIsDraggingOrResizing(true)}
            onDrag={(e, d) => setPosition({ x: d.x, y: d.y })}
            onDragStop={(e, d) => {
                setIsDraggingOrResizing(false);
                setPosition({ x: d.x, y: d.y });
                if (!isCollapsed && isExpanded) {
                    localStorage.setItem('promethea-left-tray-x', String(d.x));
                    localStorage.setItem('promethea-left-tray-y', String(d.y));
                }
            }}
            onResizeStart={() => setIsDraggingOrResizing(true)}
            onResize={(e, direction, ref, delta, pos) => {
                setSize({ width: parseInt(ref.style.width), height: parseInt(ref.style.height) });
                setPosition(pos);
            }}
            onResizeStop={(e, direction, ref, delta, pos) => {
                setIsDraggingOrResizing(false);
                const w = parseInt(ref.style.width);
                setSize({ width: w, height: parseInt(ref.style.height) });
                setPosition(pos);
                if (!isCollapsed && isExpanded) {
                    localStorage.setItem('promethea-left-tray-width', String(w));
                    localStorage.setItem('promethea-left-tray-x', String(pos.x));
                    localStorage.setItem('promethea-left-tray-y', String(pos.y));
                }
            }}
            minWidth={isExpanded && !isCollapsed ? 360 : 0}
            minHeight={400}
            bounds="window"
            dragHandleClassName="drag-handle-ribbon"
            enableResizing={{
                top: false, 
                right: isExpanded && !isCollapsed, 
                bottom: false, 
                left: false,
                topRight: false, 
                bottomRight: false, 
                bottomLeft: false, 
                topLeft: false
            }}
            className={`z-[51] ${isDraggingOrResizing ? '' : 'transition-all duration-300 ease-in-out'} overflow-visible border-none bg-transparent shadow-none pointer-events-none`}
            style={{ position: 'fixed', zIndex: 51, pointerEvents: 'none' }}
        >
            <div className="relative w-full h-full overflow-visible pointer-events-none">
                {/* Visual Card Wrapper */}
                <div 
                    className={`w-full h-full flex flex-col overflow-hidden pointer-events-auto rounded-xl border transition-all duration-300 ease-in-out ${
                        isExpanded && !isCollapsed
                            ? `glass-panel ${pillarColorClass} opacity-100` 
                            : 'opacity-0 scale-95 pointer-events-none border-transparent bg-transparent shadow-none'
                    }`}
                    style={{
                        width: isExpanded && !isCollapsed ? '100%' : '0px',
                    }}
                >
                    <div className="flex flex-row w-full h-full overflow-hidden pointer-events-none">
                        {/* The expanding pillar content */}
                        <div className={`flex-1 flex flex-col h-full min-w-0 transition-opacity duration-300 ${isExpanded && !isCollapsed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                            {isExpanded && (
                            <TrayErrorBoundary>
                                <>
                                    {/* Interactive Dual-Tray Spatial Splitting */}
                                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                                        {activePillar === 'ATLAS' && (
                                            (activePOI && activePOI.coordinates) ? (
                                                <div className="h-[42%] flex flex-col border-b border-amber-500/30 bg-black/60 relative overflow-y-auto scrollbar-thin select-none shrink-0 p-4 gap-3">
                                                    {/* Active Celestial Substrate Header */}
                                                    <div className="flex items-center justify-between bg-zinc-950/40 border border-zinc-900/60 rounded-lg p-2 shrink-0">
                                                        <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest">ACTIVE CELESTIAL SUBSTRATE:</span>
                                                        <span className="text-[9px] font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                                activePOI?.referenceFrame === 'EARTH' ? 'bg-amber-400 shadow-[0_0_6px_#22d3ee]' :
                                                                activePOI?.referenceFrame === 'LUNA' ? 'bg-zinc-300 shadow-[0_0_6px_#d4d4d8]' :
                                                                'bg-orange-500 shadow-[0_0_6px_#f97316]'
                                                            }`} />
                                                            {activePOI?.referenceFrame || 'EARTH'}
                                                        </span>
                                                    </div>

                                                    {/* DTN Queue sub-panel */}
                                                    {activePOI?.referenceFrame !== 'EARTH' && (
                                                        <div className="bg-zinc-950/75 border border-zinc-800 rounded-lg p-2.5 flex flex-col gap-1.5 shrink-0">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                                                    <Radio className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
                                                                    DELAY-TOLERANT NETWORK SIGNAL (RFC 5050)
                                                                </span>
                                                                <span className={`text-[7px] font-mono px-1 py-0.2 rounded font-black ${dtnQueue.filter(b => b.status !== 'DELIVERED').length > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                                                    {dtnQueue.filter(b => b.status !== 'DELIVERED').length > 0 ? `TRANSMITTING ${dtnQueue.filter(b => b.status !== 'DELIVERED').length} BUNDLES` : 'LINK SYNCHRONIZED'}
                                                                </span>
                                                            </div>

                                                            {dtnQueue.filter(b => b.status !== 'DELIVERED').length > 0 ? (
                                                                <div className="flex flex-col gap-1.5 mt-1">
                                                                    {dtnQueue.filter(b => b.status !== 'DELIVERED').map((bundle) => {
                                                                        const totalDelay = DTNManager.getInstance().calculateDelay(bundle.sourceNode, bundle.targetNode);
                                                                        const elapsed = Date.now() - bundle.creationTimestamp;
                                                                        const remainingSec = Math.max(0, (totalDelay - elapsed) / 1000);
                                                                        const pct = Math.floor(bundle.transitProgress * 100);

                                                                        return (
                                                                            <div key={bundle.id} className="bg-black/40 border border-zinc-800/60 rounded p-1.5 flex flex-col gap-1">
                                                                                <div className="flex items-center justify-between text-[7px] font-mono">
                                                                                    <span className="text-amber-400 font-bold tracking-tight">{bundle.id.toUpperCase()}</span>
                                                                                    <span className="text-zinc-500">{bundle.sourceNode} → {bundle.targetNode}</span>
                                                                                </div>
                                                                                <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden relative">
                                                                                    <div 
                                                                                        className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full transition-all duration-100" 
                                                                                        style={{ width: `${pct}%` }} 
                                                                                    />
                                                                                </div>
                                                                                <div className="flex items-center justify-between text-[7px] font-mono">
                                                                                    <span className="text-zinc-400 uppercase truncate max-w-[150px]">uri: {bundle.destinationUri}</span>
                                                                                    <span className="text-indigo-400 font-bold">{remainingSec.toFixed(1)}s rem ({pct}%)</span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-[8px] font-mono text-amber-400/80 mt-1">
                                                                    <Wifi className="w-3.5 h-3.5" />
                                                                    <span>ALL METABOLIC BUNDLES DELIVERED // DUPLEX LINK NOMINAL</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* POI details view */}
                                                    <div className="flex gap-3">
                                                        {activePOI?.photos && activePOI.photos.length > 0 && (
                                                            <div className="w-24 h-20 rounded-lg border border-amber-500/20 overflow-hidden relative shrink-0">
                                                                <img 
                                                                    src={activePOI?.photos?.[0]} 
                                                                    alt={activePOI?.name}
                                                                    className="w-full h-full object-cover brightness-90 contrast-105"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                            <div>
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <h3 className="text-xs font-black uppercase tracking-wider text-white truncate">{activePOI?.name}</h3>
                                                                    <span className={`text-[7px] font-mono font-black px-1.5 py-0.5 rounded tracking-widest shrink-0 ${activePOI?.referenceFrame === 'EARTH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : activePOI?.referenceFrame === 'LUNA' ? 'bg-zinc-500/10 text-zinc-300 border border-zinc-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                                                        {activePOI?.referenceFrame}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[9px] text-zinc-400/80 uppercase tracking-wide truncate mt-0.5">{activePOI?.formattedAddress || 'No localized address metadata available'}</p>
                                                            </div>

                                                            <div className="flex items-center gap-3 text-[9px] mt-1.5">
                                                                {activePOI?.rating && (
                                                                    <div className="flex items-center gap-1 text-amber-400 font-mono">
                                                                        <Star size={10} className="fill-amber-400" />
                                                                        <span>{activePOI?.rating?.toFixed(1)}</span>
                                                                    </div>
                                                                )}
                                                                {activePOI?.website && (
                                                                    <a 
                                                                        href={activePOI?.website} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        onMouseDown={(e) => e.stopPropagation()}
                                                                        className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-all font-mono"
                                                                    >
                                                                        <ExternalLink size={10} />
                                                                        <span className="underline tracking-wide truncate max-w-[120px]">website</span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Monospace coordinates telemetry block */}
                                                    <div className="bg-zinc-950/90 border border-zinc-900/60 rounded-lg p-2 flex justify-between items-center shrink-0">
                                                        <div className="flex items-center gap-2">
                                                            <Compass className="w-4 h-4 text-amber-400 animate-spin-slow shrink-0" />
                                                            <div>
                                                                <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest block leading-none">Telemetry</span>
                                                                <span className="text-[9px] font-mono text-amber-400 font-bold block leading-relaxed">
                                                                    LAT: {activePOI?.coordinates?.lat?.toFixed(6) ?? '0.000000'}° | LNG: {activePOI?.coordinates?.lng?.toFixed(6) ?? '0.000000'}°
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {activePOI?.coordinates?.alt !== undefined && (
                                                            <div className="text-right">
                                                                <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest block leading-none">ALTITUDE</span>
                                                                <span className="text-[9px] font-mono text-amber-400 font-bold block leading-relaxed">
                                                                    {activePOI?.coordinates?.alt >= 0 ? '+' : ''}{activePOI?.coordinates?.alt}m
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Deeds & Ownership Panel */}
                                                    {activePOI?.ownership ? (
                                                        <div className="bg-amber-950/10 border border-amber-500/20 rounded-lg p-2 flex flex-col gap-1 shrink-0">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[8px] font-mono text-amber-400/80 font-black uppercase tracking-widest flex items-center gap-1">
                                                                    <Shield size={10} /> ACTIVE SOVEREIGN DEED CERTIFIED
                                                                </span>
                                                                <span className="text-[8px] font-mono font-bold text-white flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                                                    <Coins size={9} className="text-amber-400" />
                                                                    {activePOI?.ownership?.stakedSovereignUnits?.toLocaleString() ?? '0'} UNITS
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-[9px] font-mono mt-0.5">
                                                                <span className="text-zinc-300">HOLDER: {activePOI?.ownership?.ownerName}</span>
                                                                <span className="text-zinc-500 text-[8px] font-mono tracking-tighter truncate max-w-[150px]" title={activePOI?.ownership?.ownerDid}>
                                                                    {activePOI?.ownership?.ownerDid}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-zinc-950/40 border border-dashed border-zinc-800 rounded-lg p-2.5 flex items-center justify-between shrink-0 text-[9px] font-mono">
                                                            <span className="text-zinc-500 uppercase tracking-widest">UNCLAIMED PUBLIC TERRITORY</span>
                                                            <button 
                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                className="px-2 py-0.5 bg-amber-950/20 hover:bg-amber-950/60 border border-amber-800/40 text-amber-400 rounded text-[8px] uppercase tracking-wider transition-all cursor-pointer"
                                                            >
                                                                Stake Sovereign Claims
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Public Developmental Plans */}
                                                    {activePOI?.publicPlans && (
                                                        <div className="bg-amber-950/10 border border-amber-500/20 rounded-lg p-2.5 flex flex-col gap-1 shrink-0">
                                                            <span className="text-[8px] font-mono text-amber-400/80 font-black uppercase tracking-widest flex items-center gap-1">
                                                                <Eye size={10} /> PUBLIC DEVELOPMENT ROADMAP & PROPOSALS
                                                            </span>
                                                            <p className="text-[9px] font-mono text-zinc-300/90 leading-relaxed uppercase select-text">
                                                                {activePOI?.publicPlans}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Bot Cards */}
                                                    <BotCardsConfig />
                                                </div>
                                            ) : (
                                                <div className="h-[42%] flex flex-col border-b border-amber-500/30 bg-black/60 relative overflow-y-auto scrollbar-thin select-none shrink-0 p-4 gap-3 justify-between">
                                                    {/* Active Celestial Substrate Header */}
                                                    <div className="flex items-center justify-between bg-zinc-950/40 border border-zinc-900/60 rounded-lg p-2 shrink-0">
                                                        <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest">ACTIVE CELESTIAL SUBSTRATE:</span>
                                                        <span className="text-[9px] font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                                activePOI?.referenceFrame === 'EARTH' ? 'bg-amber-400 shadow-[0_0_6px_#22d3ee]' :
                                                                activePOI?.referenceFrame === 'LUNA' ? 'bg-zinc-300 shadow-[0_0_6px_#d4d4d8]' :
                                                                'bg-orange-500 shadow-[0_0_6px_#f97316]'
                                                            }`} />
                                                            {activePOI?.referenceFrame || 'EARTH'}
                                                        </span>
                                                    </div>

                                                    {/* Onboarding Main Content */}
                                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-3 relative rounded-lg border border-amber-500/10 bg-gradient-to-b from-cyan-950/10 to-transparent overflow-hidden shrink-0 mb-2">
                                                        {/* Glowing Background Glows */}
                                                        <div className="absolute -inset-10 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
                                                        
                                                        {/* Rotating and Pulsing Icons */}
                                                        <div className="relative flex items-center justify-center mb-3">
                                                            <Compass className="w-12 h-12 text-amber-500/20 absolute animate-spin-slow" />
                                                            <div className="w-9 h-9 rounded-full bg-amber-950/40 border border-amber-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(245, 158, 11,0.15)] animate-pulse">
                                                                <Globe className="w-5 h-5 text-amber-400" />
                                                            </div>
                                                        </div>

                                                        {/* Onboarding Text Block */}
                                                        <div className="relative z-10 max-w-[280px]">
                                                            <h4 className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-widest mb-1.5 leading-snug">
                                                                🌐 SYSTEM READY // NO LANDMARK ACTIVATED
                                                            </h4>
                                                            <p className="text-[8px] font-mono text-zinc-400 uppercase tracking-wide leading-relaxed">
                                                                Click any hex grid node or coordinate marker on the global map, or swap celestial frames above to stream localized telemetry.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Bot Cards */}
                                                    <BotCardsConfig />
                                                </div>
                                            )
                                        )}

                                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                                            <TrayErrorBoundary>
                                                <ContextChat activePillar={activePillar || 'SYSTEM'} />
                                            </TrayErrorBoundary>
                                        </div>
                                    </div>
                                </>
                            </TrayErrorBoundary>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tactile Grab-and-Toggle Slide Handle Tab */}
                {isExpanded && (
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={handleToggleCollapse}
                        className="absolute left-full top-1/2 -translate-y-1/2 z-[52] w-6 h-20 bg-zinc-950/95 hover:bg-zinc-900 border border-amber-500/30 hover:border-amber-400/70 text-amber-500 rounded-r-lg flex flex-col items-center justify-center cursor-pointer pointer-events-auto transition-all shadow-[4px_0_15px_rgba(0,0,0,0.5)] gap-1 group"
                        title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
                    >
                        {isCollapsed ? <ChevronRight size={14} className="group-hover:scale-110 transition-transform" /> : <ChevronLeft size={14} className="group-hover:scale-110 transition-transform" />}
                        {/* Tactile Grab Texture */}
                        <div className="flex flex-col gap-0.5 justify-center items-center opacity-40 group-hover:opacity-75 transition-opacity">
                            <div className="w-1.5 h-0.5 bg-amber-500 rounded-full"></div>
                            <div className="w-1.5 h-0.5 bg-amber-500 rounded-full"></div>
                            <div className="w-1.5 h-0.5 bg-amber-500 rounded-full"></div>
                        </div>
                    </button>
                )}
            </div>
        </Rnd>

    {isSettingsOpen && (
        <div 
            ref={settingsRef}
            className="fixed z-[52] w-64 bg-black/95 backdrop-blur-md border border-emerald-500/30 rounded shadow-[0_0_30px_rgba(16,185,129,0.2)] p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-auto"
            style={{ 
                left: `${position.x + 72}px`, 
                bottom: `${window.innerHeight - (position.y + size.height) + 12}px` 
            }}
        >
            <div className="flex flex-col gap-1 border-b border-white/5 pb-2 select-none">
                <span className="text-[8px] font-black text-emerald-500/70 tracking-widest uppercase">System Core Status</span>
                {walletAddress ? (
                    <span className="text-[9px] text-zinc-400 font-mono truncate">{walletAddress}</span>
                ) : (
                    <span className="text-[9px] text-zinc-500">Unregistered Guest</span>
                )}
            </div>

            {/* Hydrate Cockpit */}
            <div className="flex flex-col gap-1.5 select-none">
                <span className="text-[8px] font-bold text-zinc-500 tracking-wider uppercase">Authentication</span>
                {!isUnlocked ? (
                    <button 
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => {
                            window.location.href = 'http://localhost:3001';
                        }}
                        className="w-full px-3 py-2 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-[0.15em] rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <Shield className="w-3 h-3" />
                        <span>Hydrate Cockpit</span>
                    </button>
                ) : (
                    <div className="w-full px-3 py-2 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-[0.15em] rounded flex items-center justify-center gap-1.5">
                        <Shield className="w-3 h-3" />
                        <span>Sovereign Link Active</span>
                    </div>
                )}
            </div>

            {/* Command Helper */}
            <div className="flex flex-col gap-1.5 select-none">
                <span className="text-[8px] font-bold text-zinc-500 tracking-wider uppercase">Quick Search</span>
                <div className="px-3 py-2 bg-zinc-950/40 border border-white/5 rounded text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 flex items-center justify-between opacity-80">
                    <span>Command Menu</span>
                    <span className="font-mono bg-white/10 px-1 py-0.5 rounded text-[8px]">⌘ K</span>
                </div>
            </div>

            {/* Toggle Animations */}
            <div className="flex flex-col gap-1.5 select-none">
                <span className="text-[8px] font-bold text-zinc-500 tracking-wider uppercase">Aesthetics</span>
                <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={toggleAnimations}
                    className={`w-full px-3 py-2 border rounded text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        reduceAnimations 
                            ? 'bg-zinc-900/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800' 
                            : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-400/50'
                    }`}
                >
                    <Zap className="w-3 h-3" />
                    <span>Animations: {reduceAnimations ? 'OFF' : 'ON'}</span>
                </button>
            </div>

            {/* Exit Button */}
            <div className="border-t border-white/5 pt-3 select-none">
                <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => {
                        setIsSettingsOpen(false);
                        window.dispatchEvent(new CustomEvent('hud-exit'));
                    }}
                    className="w-full px-3 py-2 bg-red-950/20 hover:bg-red-500/20 border border-red-500/20 hover:border-red-400/50 rounded text-red-400 transition-all flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                >
                    <LogOut className="w-3 h-3" />
                    <span>Exit HUD</span>
                </button>
            </div>
        </div>
    )}
    </>
    );
};

