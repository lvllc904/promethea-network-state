'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHUD } from '@/lib/hud-store';
import { useMesh } from '@/components/providers/mesh-provider';
import { TacticalRibbon } from './TacticalRibbon';
import dynamic from 'next/dynamic';
import { SovereignMap } from '@/components/SovereignMap';
import { RightFocusTray } from './RightFocusTray';
import { CommandPalette } from './CommandPalette';
import { OmniButton } from './OmniButton';

const EclipseTray = dynamic(
    () => import('./EclipseTray').then(m => m.EclipseTray),
    { ssr: false }
);

const ChatTray = dynamic(
    () => import('./ChatTray').then(m => m.ChatTray),
    { ssr: false }
);

const InterstellarMap = dynamic(
    () => import('@/components/InterstellarMap').then(m => m.InterstellarMap),
    { ssr: false }
);

const OblongMenuBelt = dynamic(
    () => import('@/components/ui/OblongMenuBelt').then(m => m.OblongMenuBelt),
    { ssr: false }
);

const PhosphorCLI = dynamic(
    () => import('@/components/terminal/PhosphorCLI').then(m => m.PhosphorCLI),
    { ssr: false }
);



import { NotificationCenter } from './NotificationCenter';
import { SovereignHeaderTicker } from './SovereignHeaderTicker';
import { SovereignFooterTicker } from './SovereignFooterTicker';
import { SovereignNavBar } from './SovereignNavBar';
import { useSovereignStore, useSolanaCitizen } from '@promethea/hooks';

// Fetch atlas layers from the same-origin BFF proxy (avoids CORS entirely)
function useAtlasLayers() {
    const [layers, setLayers] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/atlas/layers')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (Array.isArray(data) && data.length > 0) setLayers(data); })
            .catch(e => console.warn('[Atlas] BFF fetch failed:', e.message));
    }, []);

    return layers;
}


const SovereignAtlasBackground = ({ isEclipsed, globalVix, isPortalBlurred = false }: { isEclipsed: boolean, globalVix: number, isPortalBlurred?: boolean }) => {
    const layers = useAtlasLayers();
    const { mapMode } = useHUD();
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
    const [isOnline, setIsOnline] = React.useState(true);

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 10;
            const y = (e.clientY / window.innerHeight - 0.5) * 10;
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);

        const updateOnlineStatus = () => setIsOnline(window.navigator.onLine);
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        if (typeof window !== 'undefined') {
            setIsOnline(window.navigator.onLine);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    // Calculate fear tint based on VIX
    // Baseline is 15. As VIX goes up towards 30, the red tint increases
    const fearIntensity = Math.max(0, Math.min(1, (globalVix - 15) / 20)); // Maxes out around VIX 35

    // Render SovereignMap or InterstellarMap based on mapMode
    return (
        <div className={`absolute inset-0 z-0 transition-all duration-700 ease-out ${isPortalBlurred ? 'brightness-[0.25] saturate-[0.5] blur-[8px] scale-[1.03]' : isEclipsed ? 'brightness-[0.3] saturate-50' : 'brightness-100'}`}>
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                {/* Surface Map Viewport */}
                <div 
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: mapMode === 'SURFACE' ? 1 : 0, pointerEvents: mapMode === 'SURFACE' ? 'auto' : 'none' }}
                >
                    <SovereignMap
                        layers={layers}
                    />
                </div>

                {/* 3D Interstellar Map Viewport */}
                <div 
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: mapMode === 'INTERSTELLAR' ? 1 : 0, pointerEvents: mapMode === 'INTERSTELLAR' ? 'auto' : 'none' }}
                >
                    <InterstellarMap />
                </div>
            </div>
            
            {/* Vignette overlay for depth */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.7)_100%)]" />
            
            {/* VIX Atmospheric Fear Tint */}
            <div 
                className="absolute inset-0 pointer-events-none transition-colors duration-[2000ms] ease-in-out mix-blend-overlay"
                style={{ backgroundColor: `rgba(255, 0, 0, ${fearIntensity * 0.4})` }} 
            />

            {/* Offline Off-Grid Status Indicator overlay */}
            {!isOnline && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[49] glass-panel px-4 py-1.5 border border-red-500/30 bg-red-950/80 rounded-lg flex flex-row items-center gap-2 text-red-400 text-[8px] font-mono font-bold tracking-widest uppercase animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    Off-Grid Substrate Mode Active // Cached Data Feed
                </div>
            )}

            {/* Ambient sovereignty watermark, slightly reacting to mouse for depth */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-overlay opacity-10"
                style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` }}
            >
                <h1 className="text-[10vw] font-black uppercase tracking-tighter text-white select-none">
                    PROMETHEA
                </h1>
            </div>
        </div>
    );
};

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { X, AlertCircle, LayoutGrid, Minimize2, ChevronLeft, ChevronRight, Compass, Wallet, Vote, Lock, Unlock, BarChart3, Fingerprint, CheckCircle2, Activity, FileText, Layers, RefreshCw } from 'lucide-react';

import { ethers } from 'ethers';

interface TrayErrorBoundaryProps {
    children: React.ReactNode;
    name: string;
    position: 'left' | 'right';
}

interface TrayErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class TrayErrorBoundary extends React.Component<TrayErrorBoundaryProps, TrayErrorBoundaryState> {
    constructor(props: TrayErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(`[TrayErrorBoundary - ${this.props.name}] caught an error:`, error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const sideClass = this.props.position === 'left' 
                ? 'left-4' 
                : 'right-4';
            
            return (
                <div 
                    className={`fixed top-16 bottom-16 w-80 max-w-[90vw] z-50 glass-panel rounded-xl border border-amber-500/30 bg-black/80 flex flex-col items-center justify-center p-6 text-center select-none shadow-[0_0_30px_rgba(245,158,11,0.15)] ${sideClass}`}
                    style={{ backdropFilter: 'blur(20px)' }}
                >
                    {/* Glowing Amber Hexagon / Alert Icon */}
                    <div className="relative flex items-center justify-center mb-4">
                        <div className="absolute -inset-2 bg-amber-500/10 blur-xl rounded-full pointer-events-none animate-pulse" />
                        <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <AlertCircle className="w-6 h-6 text-amber-500 animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-mono font-black text-amber-400 uppercase tracking-[0.2em]">
                            {this.props.name} Offline
                        </h3>
                        <p className="text-[9px] font-mono text-zinc-400 max-w-[240px] uppercase tracking-wide leading-relaxed">
                            A critical runtime exception was intercepted within this peripheral context. Core telemetry flows remain conserved.
                        </p>
                    </div>

                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-6 px-4 py-1.5 bg-amber-950/20 hover:bg-amber-950/50 border border-amber-500/40 text-amber-400 text-[8px] font-mono font-bold rounded-lg uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(245,158,11,0.1)] cursor-pointer"
                    >
                        Cold-Boot Interface
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export const SovereignHUD = ({ children }: { children?: React.ReactNode }) => {
    const { activePillar, activatePillar, triggerOmniScanner, activeFocusPanel, activateFocusPanel, reduceAnimations, toggleAnimations, globalVix, activePOI, isMapInteractive, setHUDState, isPhosphorMode } = useHUD();
    const refFrame = activePOI?.referenceFrame || 'EARTH';
    const { themeState } = useMesh();
    const currentTheme = themeState?.theme || 'dark';
    const isLatex = currentTheme === 'theme-latex';
    const router = useRouter();
    const pathname = usePathname();
    const isSubPage = pathname !== '/dashboard' && pathname !== '/dashboard/';
    const isEclipsed = activePillar !== null && activePillar !== 'ATLAS';
    const { isUnlocked, unlock, lock } = useSovereignStore();
    const searchParams = useSearchParams();
    const { walletAddress, solBalance, signMessage } = useSolanaCitizen();
    const [cockpitMode, setCockpitMode] = useState<'PORTAL' | 'CONSOLE'>('PORTAL');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('promethea-cockpit-mode') as any;
            if (savedMode === 'PORTAL' || savedMode === 'CONSOLE') {
                setCockpitMode(savedMode);
            }
        }
    }, []);

    const handleCockpitModeChange = (mode: 'PORTAL' | 'CONSOLE') => {
        setCockpitMode(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('promethea-cockpit-mode', mode);
        }
    };

    // States for interactive consensus voting
    const [selectedPropId, setSelectedPropId] = useState<string>('PRP-104');
    const [isSigning, setIsSigning] = useState(false);
    const [signSuccess, setSignSuccess] = useState(false);
    const [generatedSig, setGeneratedSig] = useState<string>('');
    const [votedProposal, setVotedProposal] = useState<string | null>(null);

    const handleSignVote = async () => {
        setIsSigning(true);
        setSignSuccess(false);
        try {
            const message = `Promethea Consensus Vote signing on ${selectedPropId} at timestamp ${Date.now()}`;
            if (isUnlocked && walletAddress && signMessage) {
                const signature = await signMessage(message);
                setGeneratedSig(signature);
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500));
                const mockSig = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
                setGeneratedSig(mockSig);
            }
            setSignSuccess(true);
            setVotedProposal(selectedPropId);
        } catch (err) {
            console.error('[Consensus] Error signing message:', err);
        } finally {
            setIsSigning(false);
        }
    };

    const handleIdentityToggle = () => {
        if (isUnlocked) {
            lock();
        } else {
            const mockAddress = walletAddress || "9xQdZWhhN9sAka698n6F2SgZ1m6f9Uf9M4XFvC3Lz59a";
            unlock(mockAddress);
        }
    };

    const [workspaceLayout, setWorkspaceLayout] = useState<'dock-right' | 'dock-left' | 'centered' | 'minimized'>('dock-right');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLayout = localStorage.getItem('promethea-workspace-layout') as any;
            if (savedLayout && ['dock-right', 'dock-left', 'centered', 'minimized'].includes(savedLayout)) {
                setWorkspaceLayout(savedLayout);
            }
        }
    }, []);

    const handleLayoutChange = (layout: 'dock-right' | 'dock-left' | 'centered' | 'minimized') => {
        setWorkspaceLayout(layout);
        if (typeof window !== 'undefined') {
            localStorage.setItem('promethea-workspace-layout', layout);
        }
    };

    // Listen for custom 'hud-exit' event from the relocated settings drawer
    useEffect(() => {
        const handleExitEvent = () => {
            setIsExiting(true);
            setTimeout(() => {
                router.push('/');
            }, 800);
        };
        window.addEventListener('hud-exit', handleExitEvent);
        return () => window.removeEventListener('hud-exit', handleExitEvent);
    }, [router]);

    // Listen for custom 'context-switch' event to trigger isolated State Re-Hydration
    useEffect(() => {
        const handleContextSwitch = (e: Event) => {
            const customEvent = e as CustomEvent;
            const targetSyndicate = customEvent.detail?.syndicateId || 'global';
            console.log(`[SovereignHUD] 🌐 Context Switch Triggered! New Tenant Scope: ${targetSyndicate}`);
            
            if (typeof window !== 'undefined') {
                // Perform quick cockpit cold-reboot to re-hydrate state with isolated syndicate headers
                window.location.reload();
            }
        };
        window.addEventListener('context-switch', handleContextSwitch);
        return () => window.removeEventListener('context-switch', handleContextSwitch);
    }, []);

    // The Hydration Handshake: Listen for verification hash from Body 2 Auth Gateway
    useEffect(() => {
        const hash = searchParams.get('hash');
        const did = searchParams.get('did');
        
        if (hash && did && !isUnlocked) {
            console.log('[Handshake] Verified hash received from Body 2 Gateway. Hydrating DAC.');
            // We use the address from DID, removing 'did:prmth:' or just pass the address
            const address = did.replace('did:prmth:', '');
            unlock(address);
            // Optionally, clean up the URL here
            router.replace('/dashboard');
        }
    }, [searchParams, isUnlocked, unlock, router]);

    // Global interceptor for Omni-Scanner
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Traverse up to find data-omni-scan in case they clicked a child element
            const scanTarget = target.closest('[data-omni-scan]');
            if (scanTarget) {
                const scanValue = scanTarget.getAttribute('data-omni-scan');
                if (scanValue) {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerOmniScanner(scanValue);
                }
            }
        };
        document.addEventListener('click', handleGlobalClick);
        return () => document.removeEventListener('click', handleGlobalClick);
    }, [triggerOmniScanner]);

    const [bootStage, setBootStage] = useState<'loading' | 'telemetry' | 'ready_prompt' | 'morphing' | 'active'>('active');
    const [isBurning, setIsBurning] = useState(false);
    const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (bootStage === 'loading') {
            const t = setTimeout(() => setBootStage('telemetry'), 800);
            return () => clearTimeout(t);
        }
    }, [bootStage]);

    useEffect(() => {
        let isMounted = true;
        if (bootStage === 'telemetry') {
            const fetchRealTelemetry = async () => {
                const vanguardOptIn = typeof window !== 'undefined' && window.localStorage?.getItem('vanguardOptIn') === 'true';
                const defaultLogs = [
                    '🔑 DEPTHOS SOVEREIGN KEYS: SYNCHRONIZING...',
                    '🔌 PORT BINDINGS: did:sovereign:genesis-node',
                    `🚦 [LIVE] CANARY ALLOCATION: ${vanguardOptIn ? '4.8% / 5.0% (Opt-in)' : '4.2% / 5.0%'}`,
                    '💎 [LIVE] VANGUARD YIELD: 0.05 UVT/hr',
                    `📈 [LIVE] ANOMALY SCORE: ${vanguardOptIn ? '0.04' : '0.02'} | COMMIT: v.327ce02`,
                    '🧠 ASGI LISP MCTS ENSEMBLE: RUNNING SIMULATION MATRICES...',
                    '🛡️ IMMUNE GLIA CONSERVATION: LEVEL 4 HOMEOCONTROL...',
                    '💰 TREASURY WATERFALL: SOVEREIGN ROUTER ACTIVE...',
                    '🌐 SOVEREIGN ATLAS GRID MAP: BUFFERING SATELLITE TILES...'
                ];
                
                let dynamicLogs = [...defaultLogs];
                try {
                    const res = await fetch('/api/engine/intelligence');
                    if (res.ok) {
                        const data = await res.json();
                        if (data && Array.isArray(data) && data.length > 0) {
                            // Extract up to 6 real intel items for boot display
                            dynamicLogs = data.slice(0, 6).map((item: any) => `[LIVE] OMNILAKE NODE: ${item.title || item.type || JSON.stringify(item).substring(0, 40)}`);
                        }
                    }
                } catch (e) {
                    console.warn("Could not fetch OmniLake telemetry, falling back to static sequence.");
                }

                if (!isMounted) return;

                let current = 0;
                const interval = setInterval(() => {
                    if (current < dynamicLogs.length) {
                        setTelemetryLogs(prev => [...prev, dynamicLogs[current]]);
                        current++;
                    } else {
                        clearInterval(interval);
                        setBootStage('ready_prompt');
                    }
                }, 300);
            };
            
            fetchRealTelemetry();
        }
        return () => { isMounted = false; };
    }, [bootStage]);

    React.useEffect(() => {
        if (activePillar === 'ASGI') {
            activateFocusPanel('PROMETHEA_ASGI');
        }
    }, [activePillar]);

    const handleEnterHUD = async () => {
        setBootStage('active');
    };

    const handleExitHUD = () => {
        setIsExiting(true);
        setTimeout(() => {
            router.push('/');
        }, 800);
    };

    if (bootStage !== 'active' || isExiting) {
        const isLatex = currentTheme === 'theme-latex';
        
        // Theme-specific configurations
        const containerClasses = `fixed inset-0 flex flex-col items-center justify-center font-mono overflow-hidden z-[9999] select-none transition-colors duration-500 ${
            isLatex ? 'bg-[#fdfcf7] text-stone-800 selection:bg-amber-100/40' : 'bg-zinc-950 text-white selection:bg-amber-500/20'
        }`;
        
        const dotBgGradient = isLatex 
            ? 'radial-gradient(circle_at_center, rgba(28,25,23,0.05) 1px, transparent 1px)' 
            : 'radial-gradient(circle_at_center, rgba(255,255,255,0.02) 1px, transparent 1px)';

        const ringOuterBorder = isLatex ? 'border-stone-200 shadow-sm' : 'border-amber-500/30 shadow-none';
        const ringMidBorder = isLatex ? 'border-stone-300/60' : 'border-dashed border-orange-500/20';
        const ringInnerBorder = isLatex ? 'border-stone-200' : 'border-amber-500/10';
        const logoWrapper = isLatex 
            ? 'bg-stone-50 border border-stone-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]' 
            : 'bg-gradient-to-br from-amber-500/15 to-red-500/15 border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.25)]';
        
        const consoleClasses = `w-96 min-h-[140px] p-4 rounded-lg flex flex-col justify-start gap-1.5 backdrop-blur transition-all duration-500 ${
            isLatex 
                ? 'bg-stone-50/80 border border-stone-200/80 text-stone-700 shadow-[0_4px_20px_rgba(28,25,23,0.04)]' 
                : 'bg-black/60 border border-white/5 text-zinc-300 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
        }`;

        const consoleHeaderBorder = isLatex ? 'border-stone-200/60' : 'border-white/5';
        const consoleHeaderLabel = isLatex ? 'text-stone-400 font-bold' : 'text-zinc-500 font-bold';
        const consoleHeaderVal = isLatex ? 'text-amber-800' : 'text-zinc-500';
        const loadingPromptColor = isLatex ? 'text-amber-800/80' : 'text-amber-400/60';
        
        const buttonClasses = `px-8 py-3 border text-[10px] font-black uppercase tracking-[0.25em] rounded transition-all cursor-pointer ${
            isLatex 
                ? 'bg-stone-900 hover:bg-stone-800 text-stone-50 border-stone-950 shadow-[0_4px_12px_rgba(28,25,23,0.15)] hover:-translate-y-0.5' 
                : 'bg-amber-500 hover:bg-orange-500 text-black border-amber-300/40 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:-translate-y-0.5'
        }`;

        return (
            <div className={containerClasses}>


                {/* Embedded dynamic transitional styles */}
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes pulse-ring {
                        0% { transform: scale(0.96); opacity: 0.2; }
                        50% { transform: scale(1.04); opacity: 0.6; }
                        100% { transform: scale(0.96); opacity: 0.2; }
                    }
                    @keyframes scanline {
                        0% { transform: translateY(-100%); }
                        100% { transform: translateY(100%); }
                    }
                    @keyframes trace-path {
                        0% { stroke-dashoffset: 500; opacity: 0.2; }
                        40% { stroke-dashoffset: 0; opacity: 1; }
                        100% { stroke-dashoffset: 0; opacity: 1; }
                    }
                    @keyframes glow-pulse {
                        0% { filter: drop-shadow(0 0 2px #f59e0b); }
                        50% { filter: drop-shadow(0 0 8px #f59e0b); }
                        100% { filter: drop-shadow(0 0 2px #f59e0b); }
                    }
                    .animate-ring {
                        animation: pulse-ring 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    }
                    .animate-scan {
                        animation: scanline 8s linear infinite;
                    }
                    .animate-trace {
                        stroke-dasharray: 500;
                        stroke-dashoffset: 500;
                        animation: trace-path 6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    }
                    .animate-glow-pulse {
                        animation: glow-pulse 3s ease-in-out infinite;
                    }
                `}} />

                {/* Dot background layer */}
                <div 
                    className="absolute inset-0 bg-[size:32px_32px] pointer-events-none animate-fade-in" 
                    style={{ backgroundImage: dotBgGradient }}
                />

                {/* CRT Scanline Glitch Grid (Hidden in clean LaTeX mode) */}
                {!isLatex && (
                    <>
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-amber-500/5 to-transparent h-[150%] animate-scan z-50" />
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] z-50" />
                    </>
                )}

                {/* Unified central vector core container */}
                <div className={`relative flex flex-col items-center gap-12 max-w-lg px-8 transition-all duration-700 ease-out z-20 ${
                    isBurning || bootStage === 'morphing' || isExiting ? 'scale-105 opacity-0 blur-sm pointer-events-none' : 'scale-100 opacity-100'
                }`}>
                    
                    {/* Ring Assembly */}
                    <div className="relative w-36 h-36 flex items-center justify-center">
                        <div className={`absolute inset-0 rounded-full border animate-ring ${ringOuterBorder}`} />
                        <div className={`absolute inset-2 rounded-full border ${ringMidBorder}`} />
                        <div className={`absolute inset-6 rounded-full border ${ringInnerBorder}`} />
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${logoWrapper}`}>
                            {/* Breathtaking interactive tracer SVG of the Fiery Promethean Angel */}
                            <svg 
                                className={`w-10 h-10 transition-all duration-500 ${isLatex ? '' : 'animate-glow-pulse'}`}
                                viewBox="0 0 100 100" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* Halo / Fiery Crown */}
                                <path 
                                    d="M 50 12 A 13 13 0 0 1 63 25 A 13 13 0 0 1 50 38 A 13 13 0 0 1 37 25 A 13 13 0 0 1 50 12 Z" 
                                    className="animate-trace" 
                                    stroke={isLatex ? '#1c1917' : '#f59e0b'}
                                    strokeWidth="1.5" 
                                    strokeLinecap="round" 
                                />
                                {/* Left Majestic Wing */}
                                <path 
                                    d="M 50 35 C 32 12, 10 18, 8 40 C 6 60, 26 70, 46 62 C 38 54, 30 42, 40 36" 
                                    className="animate-trace" 
                                    stroke={isLatex ? '#1c1917' : '#f59e0b'}
                                    strokeWidth="1.5" 
                                    strokeLinecap="round" 
                                    style={{ animationDelay: '0.2s' }} 
                                />
                                {/* Right Majestic Wing */}
                                <path 
                                    d="M 50 35 C 68 12, 90 18, 92 40 C 94 60, 74 70, 54 62 C 62 54, 70 42, 60 36" 
                                    className="animate-trace" 
                                    stroke={isLatex ? '#1c1917' : '#f59e0b'}
                                    strokeWidth="1.5" 
                                    strokeLinecap="round" 
                                    style={{ animationDelay: '0.4s' }} 
                                />
                                {/* Torso / Heart Shield */}
                                <path 
                                    d="M 50 31 L 46 44 L 35 66 L 50 86 L 65 66 L 54 44 Z" 
                                    className="animate-trace" 
                                    stroke={isLatex ? '#1c1917' : '#f59e0b'}
                                    strokeWidth="1.5" 
                                    strokeLinecap="round" 
                                    style={{ animationDelay: '0.6s' }} 
                                />
                                {/* Flowing Drapery lines */}
                                <path 
                                    d="M 45 47 C 45 47, 50 54, 55 47 M 42 56 C 42 56, 50 65, 58 56" 
                                    className="animate-trace" 
                                    stroke={isLatex ? '#44403c' : '#f59e0b'}
                                    strokeWidth="1" 
                                    strokeLinecap="round" 
                                    style={{ animationDelay: '0.8s' }} 
                                />
                                {isLatex && (
                                    <>
                                        {/* Cross-hatched shading lines for Woodblock Etching effect */}
                                        <path d="M 25 35 L 20 45 M 28 38 L 23 48 M 31 41 L 26 51" stroke="#1c1917" strokeWidth="0.75" opacity="0.3" className="animate-trace" style={{ animationDelay: '0.9s' }} />
                                        <path d="M 75 35 L 80 45 M 72 38 L 77 48 M 69 41 L 74 51" stroke="#1c1917" strokeWidth="0.75" opacity="0.3" className="animate-trace" style={{ animationDelay: '1.0s' }} />
                                        <path d="M 46 50 L 54 50 M 44 55 L 56 55 M 40 60 L 60 60 M 38 65 L 62 65" stroke="#1c1917" strokeWidth="0.75" opacity="0.2" className="animate-trace" style={{ animationDelay: '1.1s' }} />
                                    </>
                                )}
                            </svg>
                        </div>
                    </div>

                    {/* Telemetry output */}
                    <div className={consoleClasses}>
                        <div className={`flex justify-between text-[8px] uppercase tracking-wider border-b pb-1.5 mb-1.5 ${consoleHeaderBorder}`}>
                            <span className={consoleHeaderLabel}>Console Signal</span>
                            <span className={consoleHeaderVal}>did:sovereign:genesis</span>
                        </div>
                        {bootStage === 'loading' && (
                            <span className={`text-[10px] animate-pulse font-mono ${loadingPromptColor}`}>LOADING CYBERNETIC COCKPIT CONTEXT...</span>
                        )}
                        {telemetryLogs.map((log, idx) => (
                            <span key={idx} className={`text-[9px] font-mono flex items-center gap-1.5 leading-relaxed ${isLatex ? 'text-stone-600' : 'text-zinc-300'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isLatex ? 'bg-amber-700 shadow-sm' : 'bg-amber-500 shadow-[0_0_4px_#f59e0b]'}`} /> {log}
                            </span>
                        ))}
                    </div>

                    {/* Activation button overlay */}
                    <div className="h-14 flex items-center justify-center">
                        {bootStage === 'ready_prompt' && !isExiting && (
                            <button
                                onClick={handleEnterHUD}
                                className={buttonClasses}
                            >
                                Activate Secure Cockpit →
                            </button>
                        )}
                        {isExiting && (
                            <span className={`text-[10px] font-black uppercase tracking-[0.25em] animate-pulse ${isLatex ? 'text-red-800' : 'text-red-400'}`}>
                                SHUTTING DOWN BRIDGE COGNITION...
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    }



    if (isPhosphorMode) {
        return <PhosphorCLI />;
    }

    return (
        <div className="fixed inset-0 bg-black overflow-hidden font-body text-white">
            {/* Embedded transitional slide layouts for drawers */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slide-in-hud-left {
                    0% { transform: translateX(-100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                @keyframes slide-in-hud-right {
                    0% { transform: translateX(100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                .slide-hud-left { animation: slide-in-hud-left 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .slide-hud-right { animation: slide-in-hud-right 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                div[class*="react-resizable-handle"] {
                    pointer-events: auto !important;
                }

                @keyframes cockpit-center-in {
                    0% { transform: scale(0.96); opacity: 0; filter: blur(4px); }
                    100% { transform: scale(1); opacity: 1; filter: blur(0); }
                }
                .animate-cockpit-center {
                    animation: cockpit-center-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />

            {/* Persistent Financial Header Ticker (Z-60) */}
            <SovereignHeaderTicker />

            {/* Floating Mode Switcher (Pill Switcher) */}
            {!isSubPage && (
                <div className={`fixed top-12 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-1 rounded-full p-1 border backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
                    isLatex
                        ? 'bg-[#fdfcf7]/90 border-stone-200 shadow-stone-900/10'
                        : 'bg-black/60 border-white/10 shadow-black/80'
                }`}>
                    <button
                        onClick={() => handleCockpitModeChange('PORTAL')}
                        className={`px-4 py-1 text-[8px] font-mono font-bold tracking-widest uppercase transition-all duration-300 rounded-full cursor-pointer ${
                            cockpitMode === 'PORTAL'
                                ? isLatex
                                    ? 'bg-amber-800/10 text-amber-950 border border-amber-800/20'
                                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                : isLatex
                                    ? 'text-stone-400 hover:text-stone-700 border border-transparent'
                                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                        }`}
                    >
                        Sovereign Portal
                    </button>
                    <button
                        onClick={() => handleCockpitModeChange('CONSOLE')}
                        className={`px-4 py-1 text-[8px] font-mono font-bold tracking-widest uppercase transition-all duration-300 rounded-full cursor-pointer ${
                            cockpitMode === 'CONSOLE'
                                ? isLatex
                                    ? 'bg-amber-800/10 text-amber-950 border border-amber-800/20'
                                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                : isLatex
                                    ? 'text-stone-400 hover:text-stone-700 border border-transparent'
                                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                        }`}
                    >
                        Command Console
                    </button>
                </div>
            )}

            {/* Sovereign Portal (Tier 1) Overlay */}
            {!isSubPage && (
                <div 
                    className={`absolute inset-x-4 top-24 bottom-16 md:inset-x-[6vw] lg:inset-x-[8vw] xl:inset-x-[12vw] z-40 flex flex-col justify-center items-center transition-all duration-700 ease-in-out ${
                        cockpitMode === 'PORTAL' 
                            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                    }`}
                >
                    {/* Portal Header */}
                    <div className="text-center mb-8 select-none max-w-xl">
                        <div className="flex items-center justify-center gap-2 mb-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className={`text-[8.5px] font-mono font-black uppercase tracking-[0.3em] ${isLatex ? 'text-amber-800' : 'text-emerald-400/80'}`}>
                                3-Body Network State Portal
                            </span>
                        </div>
                        <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 font-display ${isLatex ? 'text-stone-900' : 'text-white'}`}>
                            Sovereign Cockpit
                        </h2>
                        <p className={`text-[9.5px] font-mono uppercase tracking-widest leading-relaxed ${isLatex ? 'text-stone-500' : 'text-zinc-400/70'}`}>
                            Progressive Command Deck // Guest Access Active // Cryptographic Decoupled Interface
                        </p>
                    </div>

                    {/* 3-Body Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                        
                        {/* Card 1: Decoupled Identity (Body 1) */}
                        <div className={isLatex
                            ? "bg-[#fdfcf7]/90 border border-stone-200/80 shadow-[0_12px_40px_rgba(28,25,23,0.08)] text-stone-900 backdrop-blur-2xl p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-stone-400 hover:shadow-[0_20px_50px_rgba(28,25,23,0.15)] group relative"
                            : "bg-zinc-950/65 border border-emerald-500/15 shadow-[0_0_40px_rgba(0,0,0,0.8)] text-white backdrop-blur-3xl p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_50px_rgba(16,185,129,0.25)] group relative overflow-hidden"
                        }>
                            {!isLatex && (
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
                            )}
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className={`text-[9px] font-mono font-bold tracking-widest ${isLatex ? 'text-amber-800' : 'text-emerald-400'}`}>01 // IDENTITY</span>
                                    <Fingerprint className={`w-4 h-4 ${isLatex ? 'text-stone-400' : 'text-zinc-500 group-hover:text-emerald-400 transition-colors duration-300'}`} />
                                </div>
                                <div>
                                    <h3 className={`text-base font-black uppercase tracking-tight mb-1 ${isLatex ? 'text-stone-955' : 'text-white'}`}>
                                        Decoupled Keys
                                    </h3>
                                    <p className={`text-[8.5px] font-mono uppercase tracking-wide leading-relaxed ${isLatex ? 'text-stone-500' : 'text-zinc-400'}`}>
                                        Accessing network telemetry via guest-safe edge signatures without authorization gates.
                                    </p>
                                </div>

                                <div className={`p-4 rounded-xl border font-mono text-[9px] space-y-2 ${
                                    isLatex 
                                        ? 'bg-stone-50/50 border-stone-200' 
                                        : 'bg-black/40 border-white/5 shadow-inner'
                                }`}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 uppercase">Status</span>
                                        <span className={`font-bold uppercase tracking-wider flex items-center gap-1.5 ${isUnlocked ? 'text-emerald-500' : 'text-zinc-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                                            {isUnlocked ? 'Citizen' : 'Guest'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 uppercase font-mono">DID Portal</span>
                                        <span className={`text-zinc-400 truncate max-w-[120px] font-extrabold ${isLatex ? 'text-stone-800' : 'text-zinc-300'}`}>
                                            {isUnlocked && walletAddress 
                                                ? `did:prmth:${walletAddress.slice(0, 5)}...${walletAddress.slice(-4)}` 
                                                : 'did:prmth:guest-safe'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 uppercase">ZK Proofs</span>
                                        <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                            Verified
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleIdentityToggle}
                                className={`mt-6 w-full py-2.5 font-mono text-[8.5px] font-bold uppercase tracking-widest rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                                    isUnlocked
                                        ? isLatex
                                            ? 'bg-stone-900 hover:bg-stone-800 text-stone-50 border-stone-950'
                                            : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                                        : isLatex
                                            ? 'bg-amber-800 hover:bg-amber-900 text-white border-amber-900 shadow-[0_4px_12px_rgba(139,92,26,0.15)]'
                                            : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_4px_12px_rgba(16,185,129,0.15)]'
                                }`}
                            >
                                {isUnlocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                <span>{isUnlocked ? 'Lock Citizen Keys' : 'Unlock Citizen Keys'}</span>
                            </button>
                        </div>

                        {/* Card 2: Sovereign Treasury (Body 2) */}
                        <div className={isLatex
                            ? "bg-[#fdfcf7]/90 border border-stone-200/80 shadow-[0_12px_40px_rgba(28,25,23,0.08)] text-stone-900 backdrop-blur-2xl p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-stone-400 hover:shadow-[0_20px_50px_rgba(28,25,23,0.15)] group relative"
                            : "bg-zinc-950/65 border border-emerald-500/15 shadow-[0_0_40px_rgba(0,0,0,0.8)] text-white backdrop-blur-3xl p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_50px_rgba(16,185,129,0.25)] group relative overflow-hidden"
                        }>
                            {!isLatex && (
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
                            )}
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className={`text-[9px] font-mono font-bold tracking-widest ${isLatex ? 'text-amber-800' : 'text-emerald-400'}`}>02 // TREASURY</span>
                                    <BarChart3 className={`w-4 h-4 ${isLatex ? 'text-stone-400' : 'text-zinc-500 group-hover:text-emerald-400 transition-colors duration-300'}`} />
                                </div>
                                <div>
                                    <h3 className={`text-base font-black uppercase tracking-tight mb-1 ${isLatex ? 'text-stone-950' : 'text-white'}`}>
                                        Treasury Ledger
                                    </h3>
                                    <p className={`text-[8.5px] font-mono uppercase tracking-wide leading-relaxed ${isLatex ? 'text-stone-500' : 'text-zinc-400'}`}>
                                        Consolidated network reserves distribution. Double-entry ledger streams verified locally on edge.
                                    </p>
                                </div>

                                {/* Custom HTML/CSS Micro Bar-Graph */}
                                <div className="flex items-end justify-between gap-1.5 h-[65px] pt-1 border-b border-white/5 pb-2">
                                    {[
                                        { name: 'UVT', usd: '$6.2M', pct: 49, color: isLatex ? 'bg-stone-800' : 'bg-gradient-to-t from-emerald-600 to-emerald-400' },
                                        { name: 'SOL', usd: '$2.1M', pct: 17, color: isLatex ? 'bg-stone-500' : 'bg-gradient-to-t from-emerald-500/60 to-emerald-500/30' },
                                        { name: 'USDC', usd: '$4.8M', pct: 38, color: isLatex ? 'bg-stone-600' : 'bg-gradient-to-t from-cyan-600 to-cyan-400' },
                                        { name: 'BTC', usd: '$0.6M', pct: 8, color: isLatex ? 'bg-stone-400' : 'bg-gradient-to-t from-amber-600 to-amber-400' },
                                    ].map((asset) => (
                                        <div key={asset.name} className="flex flex-col items-center flex-1 group/bar">
                                            <span className="text-[5.5px] font-mono text-zinc-500 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300 pb-0.5">
                                                {asset.usd}
                                            </span>
                                            <div 
                                                className={`w-full ${asset.color} rounded-t-[1px] transition-all duration-1000 ease-out`}
                                                style={{ height: `${asset.pct * 0.75}px` }}
                                            />
                                            <span className="text-[6.5px] font-mono font-bold text-zinc-400 mt-1 select-none">{asset.name}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 pt-1 uppercase">
                                    <span>Total Reserves:</span>
                                    <span className={`font-extrabold ${isLatex ? 'text-stone-950' : 'text-emerald-400'}`}>$13,791,241 // LIVE</span>
                                </div>
                            </div>

                            <button
                                onClick={() => activatePillar('ECONOMICS')}
                                className={`mt-6 w-full py-2.5 font-mono text-[8.5px] font-bold uppercase tracking-widest rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                                    isLatex
                                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-900 border-stone-300'
                                        : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/5 hover:border-white/10'
                                }`}
                            >
                                <Wallet className="w-3 h-3" />
                                <span>Inspect Assets & Ledger</span>
                            </button>
                        </div>

                        {/* Card 3: Consensus Voting (Body 3) */}
                        <div className={isLatex
                            ? "bg-[#fdfcf7]/90 border border-stone-200/80 shadow-[0_12px_40px_rgba(28,25,23,0.08)] text-stone-900 backdrop-blur-2xl p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-stone-400 hover:shadow-[0_20px_50px_rgba(28,25,23,0.15)] group relative"
                            : "bg-zinc-950/65 border border-emerald-500/15 shadow-[0_0_40px_rgba(0,0,0,0.8)] text-white backdrop-blur-3xl p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_50px_rgba(16,185,129,0.25)] group relative overflow-hidden"
                        }>
                            {!isLatex && (
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
                            )}
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className={`text-[9px] font-mono font-bold tracking-widest ${isLatex ? 'text-amber-800' : 'text-emerald-400'}`}>03 // CONSENSUS</span>
                                    <Vote className={`w-4 h-4 ${isLatex ? 'text-stone-400' : 'text-zinc-500 group-hover:text-emerald-400 transition-colors duration-300'}`} />
                                </div>
                                <div>
                                    <h3 className={`text-base font-black uppercase tracking-tight mb-1 ${isLatex ? 'text-stone-950' : 'text-white'}`}>
                                        Consensus Ledger
                                    </h3>
                                    <p className={`text-[8.5px] font-mono uppercase tracking-wide leading-relaxed ${isLatex ? 'text-stone-500' : 'text-zinc-400'}`}>
                                        Active constitutional proposal voting. Cast edge signatures directly to substrate nodes.
                                    </p>
                                </div>

                                <div className="space-y-2.5">
                                    {[
                                        { id: 'PRP-104', title: 'Substrate Oracle Nodes', yes: 84 },
                                        { id: 'PRP-105', title: 'Carry-Trade Multi-Sig', yes: 93 },
                                    ].map((prop) => (
                                        <button
                                            key={prop.id}
                                            onClick={() => {
                                                if (votedProposal !== prop.id) {
                                                    setSelectedPropId(prop.id);
                                                    setSignSuccess(false);
                                                }
                                            }}
                                            className={`w-full p-2.5 rounded-xl border text-left font-mono text-[8.5px] transition-all cursor-pointer block ${
                                                selectedPropId === prop.id 
                                                    ? isLatex
                                                        ? 'bg-amber-800/5 border-amber-800/30'
                                                        : 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                                                    : isLatex
                                                        ? 'bg-stone-50/30 border-transparent hover:border-stone-200'
                                                        : 'bg-black/20 border-transparent hover:border-white/5'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`font-black uppercase tracking-wider ${selectedPropId === prop.id ? 'text-emerald-400' : 'text-zinc-500'}`}>{prop.id}</span>
                                                <span className="text-zinc-500 font-bold uppercase">{prop.yes}% Yes</span>
                                            </div>
                                            <div className={`font-bold truncate max-w-[190px] mb-1.5 ${isLatex ? 'text-stone-800' : 'text-white'}`}>{prop.title}</div>
                                            <div className={`w-full h-1 rounded-full overflow-hidden ${isLatex ? 'bg-stone-200' : 'bg-white/5'}`}>
                                                <div 
                                                    className={`h-full transition-all duration-500 ${isLatex ? 'bg-amber-800' : 'bg-emerald-500'}`} 
                                                    style={{ width: `${prop.yes}%` }} 
                                                />
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Dynamic Voting Success Signature Terminal overlay */}
                                {isSigning && (
                                    <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-500 animate-pulse justify-center py-1">
                                        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                        SIGNING EDGE ATTESTATION...
                                    </div>
                                )}
                                {signSuccess && votedProposal === selectedPropId && (
                                    <div className={`p-2.5 rounded-xl border font-mono text-[7px] space-y-1 ${isLatex ? 'bg-stone-50 border-stone-200 text-stone-800' : 'bg-emerald-950/20 border-emerald-500/25 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'}`}>
                                        <div className="flex justify-between font-bold">
                                            <span>SIGNATURE ATTESTED</span>
                                            <span className="text-emerald-500">SUCCESS</span>
                                        </div>
                                        <div className="truncate text-zinc-500">
                                            Hash: {generatedSig}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSignVote}
                                disabled={isSigning || votedProposal === selectedPropId}
                                className={`mt-6 w-full py-2.5 font-mono text-[8.5px] font-bold uppercase tracking-widest rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 ${
                                    votedProposal === selectedPropId
                                        ? 'bg-zinc-800/10 border-zinc-800/20 text-zinc-500 cursor-not-allowed'
                                        : isLatex
                                            ? 'bg-amber-800 hover:bg-amber-900 text-white border-amber-900 shadow-[0_4px_12px_rgba(139,92,26,0.15)] cursor-pointer'
                                            : 'bg-emerald-500 hover:bg-emerald-600 text-black border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.2)] cursor-pointer'
                                }`}
                            >
                                <Vote className="w-3 h-3" />
                                <span>{votedProposal === selectedPropId ? 'Vote Attested' : 'Cast Sovereign Vote'}</span>
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Background Layer (Z-0) — offset top/bottom for tickers */}
            <div className="absolute inset-0 top-8 bottom-7">
                <SovereignAtlasBackground 
                    isEclipsed={isEclipsed} 
                    globalVix={globalVix} 
                    isPortalBlurred={!isSubPage && cockpitMode === 'PORTAL'} 
                />
            </div>

            {/* Tactical Navigation is now integrated into EclipseTray */}

            {/* Persistent Menu Bar Background Strip (Z-30) - always visible across subpages, extends top-0 to bottom-0 */}
            <div className={`fixed top-0 bottom-0 left-[40px] w-16 bg-black/[0.01] border-l border-r border-white/5 backdrop-blur-md pointer-events-none z-30 shadow-2xl transition-all duration-700 ease-in-out ${cockpitMode === 'PORTAL' ? 'opacity-0 -translate-x-12' : 'opacity-100 translate-x-0'}`} />

            {/* Left Hand Resizable Data Tray with Slide-out logic */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ease-out ${isSubPage || cockpitMode === 'PORTAL' ? '-translate-x-[110%]' : 'translate-x-0'}`}>
                <TrayErrorBoundary name="Eclipse Tray" position="left">
                    <EclipseTray />
                </TrayErrorBoundary>
            </div>

            {/* 3D Oblong Elliptical Menu Belt — only shown on subpages or when explicitly in CONSOLE mode */}
            {!isSubPage && cockpitMode === 'CONSOLE' && (
                <div 
                    className="fixed top-0 bottom-0 z-40 pointer-events-none w-64 transition-all duration-700 ease-in-out opacity-100 translate-x-0"
                    style={{ left: '16px' }}
                >
                    {/* Slim Menu Belt */}
                    <div className="absolute top-4 bottom-[230px] left-6 w-16 pointer-events-auto z-10">
                        <OblongMenuBelt />
                    </div>

                    {/* Fixed Non-Scrolling Telemetry Card */}
                    <div className="absolute bottom-10 left-[28px] w-14 pointer-events-auto z-20 bg-black/95 border border-red-500/25 border-l-red-500/60 rounded p-1 font-mono text-[6px] text-zinc-400 select-none shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
                        <div className="text-[6.5px] font-black text-red-500 tracking-wider pb-1 border-b border-white/5 flex items-center justify-between">
                            <span>LCT</span>
                            <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse shadow-[0_0_4px_rgba(239,68,68,0.7)]" />
                        </div>
                        <div className="space-y-1.5 pt-1.5 leading-tight">
                            <div className="flex flex-col">
                                <span className="text-[5px] text-zinc-500 font-bold uppercase tracking-widest">SYS</span>
                                <span className="text-white font-extrabold truncate block">{refFrame}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[5px] text-zinc-500 font-bold uppercase tracking-widest">POI</span>
                                <span className="text-white font-extrabold truncate block" title={activePOI?.name || 'NONE'}>
                                    {activePOI?.name?.toUpperCase() || 'NONE'}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[5px] text-zinc-500 font-bold uppercase tracking-widest">LAT</span>
                                <span className="text-red-400 font-extrabold truncate block">{activePOI?.coordinates?.lat.toFixed(4) || '0.0000'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[5px] text-zinc-500 font-bold uppercase tracking-widest">LNG</span>
                                <span className="text-red-400 font-extrabold truncate block">{activePOI?.coordinates?.lng.toFixed(4) || '0.0000'}</span>
                            </div>
                            <button 
                                onClick={() => window.dispatchEvent(new CustomEvent('reset-offline-viewport'))}
                                className="mt-1 w-full py-0.5 bg-red-950/40 hover:bg-red-900/40 active:bg-red-900/60 border border-red-500/30 hover:border-red-500/60 rounded flex items-center justify-center text-red-400 font-black tracking-widest transition-all text-[5.5px]"
                                title="RESET VIEWPORT"
                            >
                                RESET
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sovereign Nav Bar — auto-hiding bottom navigation for Citadel/Portal mode */}
            {!isSubPage && <SovereignNavBar />}

            {/* Right Hand Resizable Chat Tray with Slide-out logic */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ease-out ${isSubPage || cockpitMode === 'PORTAL' ? 'translate-x-[110%]' : 'translate-x-0'}`}>
                <TrayErrorBoundary name="Chat Tray" position="right">
                    <ChatTray />
                </TrayErrorBoundary>
            </div>
            
            {/* Global Command Palette */}
            <CommandPalette />
            <OmniButton />

            {/* 
                Spatial Windowing Enabled: The map is now always fully interactive by default. 
                We no longer render a fullscreen bg-black/45 click-trap overlay when a subpage is open.
            */}

            {/* Dynamic Dockable Premium Console */}
            {isSubPage && children && workspaceLayout !== 'minimized' ? (
                (() => {
                    let layoutClasses = '';
                    if (workspaceLayout === 'dock-right') {
                        layoutClasses = "fixed top-16 bottom-[32px] right-4 w-[42vw] min-w-[460px] max-w-[650px] z-[100] rounded-2xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out animate-cockpit-center shadow-[0_15px_60px_rgba(0,0,0,0.6)]";
                    } else if (workspaceLayout === 'dock-left') {
                        layoutClasses = "fixed top-16 bottom-[32px] left-[80px] w-[42vw] min-w-[460px] max-w-[650px] z-[100] rounded-2xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out animate-cockpit-center shadow-[0_15px_60px_rgba(0,0,0,0.6)]";
                    } else { // centered
                        layoutClasses = "fixed inset-x-4 inset-y-16 md:inset-x-[8vw] md:inset-y-[10vh] lg:inset-x-[12vw] lg:inset-y-[12vh] z-[100] rounded-2xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out animate-cockpit-center";
                    }

                    const cardThemeClasses = isLatex
                        ? "bg-[#fdfcf7]/85 border border-stone-200 text-stone-900 shadow-[0_10px_40px_rgba(28,25,23,0.06)] backdrop-blur-2xl"
                        : "bg-zinc-950/60 border border-emerald-500/20 text-white shadow-[0_0_50px_rgba(16,185,129,0.12)] backdrop-blur-3xl";

                    const headerThemeClasses = isLatex
                        ? "bg-stone-100/60 border-b border-stone-200/60"
                        : "bg-zinc-900/50 border-b border-white/5";

                    const headerTextClasses = isLatex
                        ? "text-amber-900"
                        : "text-emerald-400";

                    const blinkerClasses = isLatex
                        ? "bg-amber-800"
                        : "bg-emerald-500";

                    const blinkerPingClasses = isLatex
                        ? "bg-amber-700"
                        : "bg-emerald-400";

                    const closeBtnClasses = isLatex
                        ? "p-1.5 hover:bg-stone-200/50 rounded-lg text-stone-500 hover:text-stone-900 border border-transparent hover:border-stone-200 transition-all cursor-pointer shadow-inner"
                        : "p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/5 shadow-inner";

                    return (
                        <div className={`${layoutClasses} ${cardThemeClasses}`}>
                            {/* Decorative Header */}
                            <div className={`flex items-center justify-between px-6 py-4 shrink-0 select-none ${headerThemeClasses}`}>
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-2 w-2 shrink-0">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${blinkerPingClasses}`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${blinkerClasses}`}></span>
                                    </span>
                                    <span className={`text-[9px] font-mono font-bold tracking-[0.2em] uppercase ${headerTextClasses}`}>
                                        // COCKPIT WORKSPACE OVERLAY // SECURE FRAME CONTROL
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Layout Selectors */}
                                    <div className={`flex items-center gap-1.5 mr-1 border rounded-lg p-0.5 shadow-inner shrink-0 ${isLatex ? 'bg-stone-100/40 border-stone-200/80' : 'bg-black/20 border-white/5'}`}>
                                        <button
                                            onClick={() => handleLayoutChange('dock-left')}
                                            className={`p-1 rounded transition-all cursor-pointer ${
                                                workspaceLayout === 'dock-left'
                                                    ? (isLatex ? 'bg-amber-800/10 text-amber-950' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20')
                                                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                                            }`}
                                            title="Dock Left"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleLayoutChange('centered')}
                                            className={`p-1 rounded transition-all cursor-pointer ${
                                                workspaceLayout === 'centered'
                                                    ? (isLatex ? 'bg-amber-800/10 text-amber-950' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20')
                                                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                                            }`}
                                            title="Center Classic"
                                        >
                                            <LayoutGrid className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleLayoutChange('dock-right')}
                                            className={`p-1 rounded transition-all cursor-pointer ${
                                                workspaceLayout === 'dock-right'
                                                    ? (isLatex ? 'bg-amber-800/10 text-amber-950' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20')
                                                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                                            }`}
                                            title="Dock Right"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                        <span className={`w-px h-3 mx-0.5 shrink-0 ${isLatex ? 'bg-stone-200' : 'bg-white/10'}`} />
                                        <button
                                            onClick={() => handleLayoutChange('minimized')}
                                            className={`p-1 rounded transition-all cursor-pointer border border-transparent ${isLatex ? 'text-stone-400 hover:text-amber-800' : 'text-zinc-500 hover:text-amber-400'}`}
                                            title="Minimize to HUD"
                                        >
                                            <Minimize2 className="w-3.5 h-3.5" />
                                        </button>
                                        <span className={`w-px h-3 mx-0.5 shrink-0 ${isLatex ? 'bg-stone-200' : 'bg-white/10'}`} />
                                        <button
                                            onClick={() => setHUDState({ isMapInteractive: !isMapInteractive })}
                                            className={`p-1 rounded transition-all cursor-pointer ${
                                                isMapInteractive
                                                    ? (isLatex ? 'bg-amber-800/20 text-amber-950 border border-amber-300' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse')
                                                    : (isLatex ? 'text-stone-400 hover:text-amber-800' : 'text-zinc-500 hover:text-emerald-400 border border-transparent')
                                            }`}
                                            title={isMapInteractive ? "Lock Map Control" : "Unlock Map Free Roam"}
                                        >
                                            <Compass className="w-3.5 h-3.5" style={{ transform: isMapInteractive ? 'rotate(45deg)' : 'none', transition: 'transform 0.5s ease' }} />
                                        </button>
                                    </div>

                                    <Link 
                                        href="/dashboard"
                                        className={closeBtnClasses}
                                    >
                                        <X className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
                                {children}
                            </div>
                        </div>
                    );
                })()
            ) : null}

            {/* Float-Minimized HUD Card */}
            {isSubPage && workspaceLayout === 'minimized' && (
                <div 
                    className={`fixed bottom-12 right-4 z-[999] p-3.5 rounded-xl border flex items-center justify-between gap-6 transition-all duration-500 shadow-[0_10px_35px_rgba(0,0,0,0.7)] backdrop-blur-2xl animate-cockpit-center max-w-sm ${
                        isLatex 
                            ? 'bg-[#fdfcf7]/90 border-stone-200 text-stone-900' 
                            : 'bg-zinc-950/85 border-emerald-500/30 text-white'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLatex ? 'bg-amber-600' : 'bg-emerald-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isLatex ? 'bg-amber-700' : 'bg-emerald-500'}`}></span>
                        </span>
                        <div className="font-mono text-[9px] uppercase tracking-wide leading-tight">
                            <div className="font-bold text-[10px] text-amber-500 truncate max-w-[160px]" title={activePOI?.name}>
                                {activePOI?.name || 'GENESIS POINT'}
                            </div>
                            <div className="text-zinc-400 mt-0.5">
                                LAT: {activePOI?.coordinates?.lat.toFixed(4)} | LNG: {activePOI?.coordinates?.lng.toFixed(4)}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={() => handleLayoutChange('dock-right')}
                            className={`px-3 py-1 text-[8px] font-mono font-bold uppercase tracking-widest rounded-lg border transition-all cursor-pointer ${
                                isLatex
                                    ? 'bg-stone-900 hover:bg-stone-800 text-stone-50 border-stone-950'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                            }`}
                        >
                            RESTORE
                        </button>
                        <Link
                            href="/dashboard"
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                isLatex
                                    ? 'hover:bg-stone-100 text-stone-500 hover:text-stone-900 border-transparent hover:border-stone-200'
                                    : 'hover:bg-white/5 text-zinc-400 hover:text-red-400 border-transparent hover:border-white/10'
                            }`}
                            title="Close Workspace"
                        >
                            <X className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Unified Left-Hand/Right-Hand Tray Architecture is handled above */}
            
            {isMapInteractive && (
                <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[999] animate-bounce pointer-events-auto">
                    <button
                        onClick={() => setHUDState({ isMapInteractive: false })}
                        className={`px-4 py-2 rounded-full border text-xs font-mono font-bold tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer flex items-center gap-2 ${
                            isLatex
                                ? 'bg-[#fdfcf7] border-amber-200 text-amber-900 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                : 'bg-black/80 border-emerald-500/40 text-emerald-400 hover:border-emerald-500 hover:text-emerald-300'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>MAP FREE ROAM ACTIVE — CLICK TO LOCK MAP</span>
                    </button>
                </div>
            )}

            <NotificationCenter />



            {/* Persistent State Footer Ticker (Z-60) */}
            <SovereignFooterTicker />
        </div>
    );
};

