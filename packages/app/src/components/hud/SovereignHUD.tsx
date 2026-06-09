'use client';

import React, { useState, useEffect } from 'react';
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



import { NotificationCenter } from './NotificationCenter';
import { SovereignHeaderTicker } from './SovereignHeaderTicker';
import { SovereignFooterTicker } from './SovereignFooterTicker';
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


const SovereignAtlasBackground = ({ isEclipsed, globalVix }: { isEclipsed: boolean, globalVix: number }) => {
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
        <div className={`absolute inset-0 z-0 transition-[filter] duration-700 ease-out ${isEclipsed ? 'brightness-[0.3] saturate-50' : 'brightness-100'}`}>
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
import { Terminal, Shield, Cpu, Zap, Power, LogOut, X, AlertCircle } from 'lucide-react';

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
    const { activePillar, activatePillar, triggerOmniScanner, activeFocusPanel, activateFocusPanel, reduceAnimations, toggleAnimations, globalVix } = useHUD();
    const { themeState } = useMesh();
    const currentTheme = themeState?.theme || 'dark';
    const router = useRouter();
    const pathname = usePathname();
    const isSubPage = pathname !== '/dashboard' && pathname !== '/dashboard/';
    const isEclipsed = activePillar !== null && activePillar !== 'ATLAS';
    const { isUnlocked, unlock, lock } = useSovereignStore();
    const { walletAddress } = useSolanaCitizen();
    const searchParams = useSearchParams();

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

            {/* Background Layer (Z-0) — offset top/bottom for tickers */}
            <div className="absolute inset-0 top-8 bottom-7">
                <SovereignAtlasBackground isEclipsed={isEclipsed} globalVix={globalVix} />
            </div>

            {/* Tactical Navigation is now integrated into EclipseTray */}

            {/* Left Hand Resizable Data Tray with Slide-out logic */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ease-out ${isSubPage ? '-translate-x-[110%]' : 'translate-x-0'}`}>
                <TrayErrorBoundary name="Eclipse Tray" position="left">
                    <EclipseTray />
                </TrayErrorBoundary>
            </div>

            {/* Right Hand Resizable Chat Tray with Slide-out logic */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ease-out ${isSubPage ? 'translate-x-[110%]' : 'translate-x-0'}`}>
                <TrayErrorBoundary name="Chat Tray" position="right">
                    <ChatTray />
                </TrayErrorBoundary>
            </div>
            
            {/* Global Command Palette */}
            <CommandPalette />
            <OmniButton />

            {/* Backdrop Blur Map Dimmer */}
            {isSubPage && (
                <div 
                    onClick={() => router.push('/dashboard')}
                    className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition-all duration-500 cursor-pointer"
                />
            )}

            {/* Centered Premium Console */}
            {isSubPage && children ? (
                <div className="fixed inset-x-4 inset-y-16 md:inset-x-[8vw] md:inset-y-[10vh] lg:inset-x-[12vw] lg:inset-y-[12vh] z-50 bg-zinc-950/90 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.12)] rounded-2xl backdrop-blur-3xl overflow-hidden flex flex-col animate-cockpit-center">
                    {/* Decorative Header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/50 border-b border-white/5 shrink-0 select-none">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[9px] font-mono font-bold text-emerald-400 tracking-[0.2em] uppercase">
                                // COCKPIT WORKSPACE OVERLAY // SECURE FRAME CONTROL
                            </span>
                        </div>
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/5 shadow-inner"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
                        {children}
                    </div>
                </div>
            ) : null}

            {/* Unified Left-Hand/Right-Hand Tray Architecture is handled above */}
            
            <NotificationCenter />

            {/* Cmd+K & Exit controls — below header ticker */}
            <div className="fixed top-11 right-6 z-50 flex items-center gap-3">
                {!isUnlocked ? (
                    <button 
                        onClick={() => {
                            window.location.href = 'http://localhost:3001';
                        }}
                        className="px-4 py-1.5 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] rounded transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-1.5 cursor-pointer">
                        <Shield className="w-3 h-3" />
                        <span>Hydrate Cockpit</span>
                    </button>
                ) : (
                    <div className="px-4 py-1.5 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] rounded flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Shield className="w-3 h-3" />
                        <span>Sovereign Link Active</span>
                    </div>
                )}
                <div className="px-4 py-1.5 bg-black/40 backdrop-blur border border-white/5 rounded text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-1.5 opacity-60">
                    <span>Command</span>
                    <span className="font-mono bg-white/10 px-1 py-0.5 rounded">⌘ K</span>
                </div>
                <button
                    onClick={toggleAnimations}
                    className={`px-3 py-1.5 border rounded text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        reduceAnimations 
                            ? 'bg-zinc-900/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800' 
                            : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-400/50'
                    }`}
                >
                    <Zap className="w-3 h-3" />
                    <span>ANIMATIONS: {reduceAnimations ? 'OFF' : 'ON'}</span>
                </button>
                <button
                    onClick={handleExitHUD}
                    className="p-1.5 bg-red-950/20 hover:bg-red-500/20 border border-red-500/20 hover:border-red-400/50 rounded text-red-400 transition-all flex items-center gap-1 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                >
                    <LogOut className="w-3 h-3" />
                    <span>Exit</span>
                </button>
            </div>

            {/* Persistent State Footer Ticker (Z-60) */}
            <SovereignFooterTicker />
        </div>
    );
};

