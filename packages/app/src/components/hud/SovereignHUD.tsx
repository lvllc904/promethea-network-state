'use client';

import React, { useState, useEffect } from 'react';
import { useHUD } from '@/lib/hud-store';
import { TacticalRibbon } from './TacticalRibbon';
import { EclipseTray } from './EclipseTray';
import { SovereignMap } from '@/components/SovereignMap';

import { EconomicsTray } from './EconomicsTray';
import { GovernanceTray } from './GovernanceTray';
import { NarrativeTray } from './NarrativeTray';
import { DiplomaticTray } from './DiplomaticTray';
import { PulseTray } from './PulseTray';
import { PrometheaPanel } from './PrometheaPanel';
import { AtlasTray } from './AtlasTray';
import { CommandPalette } from './CommandPalette';
import { SovereignHeaderTicker } from './SovereignHeaderTicker';
import { SovereignFooterTicker } from './SovereignFooterTicker';
import { RightFocusTray } from './RightFocusTray';

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


const SovereignAtlasBackground = ({ isEclipsed }: { isEclipsed: boolean }) => {
    const layers = useAtlasLayers();
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 10;
            const y = (e.clientY / window.innerHeight - 0.5) * 10;
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // If Atlas layers have loaded, show the real Google Map
    if (layers.length > 0) {
        return (
            <div className={`absolute inset-0 z-0 transition-[filter] duration-700 ease-out ${isEclipsed ? 'brightness-[0.3] saturate-50' : 'brightness-100'}`}>
                <SovereignMap
                    layers={layers}
                    center={{ lat: 42.8252, lng: -108.7513 }}
                />
                {/* Vignette overlay for depth */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.7)_100%)]" />
            </div>
        );
    }

    // Fallback: rich animated background while Atlas layers load
    return (
        <div className={`absolute inset-0 z-0 bg-zinc-950 transition-[filter] duration-700 ease-out overflow-hidden ${isEclipsed ? 'brightness-[0.3]' : ''}`}>
            {/* Parallax radial gradient */}
            <div
                className="absolute inset-[-50px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black opacity-80"
                style={{ transform: `translate(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px)` }}
            />
            {/* Dot grid */}
            <div
                className="absolute inset-[-50px] opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
                }}
            />
            {/* Sovereignty watermark */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` }}
            >
                <h1 className="text-[10vw] font-black uppercase tracking-tighter text-white/5 mix-blend-overlay select-none">
                    PROMETHEA
                </h1>
            </div>
            {/* Atlas loading indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Synchronizing Atlas Substrate...
            </div>
        </div>
    );
};

import { useRouter, usePathname } from 'next/navigation';
import { Terminal, Shield, Cpu, Zap, Power, LogOut, X } from 'lucide-react';

import { ethers } from 'ethers';

export const SovereignHUD = ({ children }: { children?: React.ReactNode }) => {
    const { activePillar, activatePillar, triggerOmniScanner, activateFocusPanel } = useHUD();
    const router = useRouter();
    const pathname = usePathname();
    const isSubPage = pathname !== '/dashboard' && pathname !== '/dashboard/';
    const isEclipsed = activePillar !== 'ATLAS';

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

    const [bootStage, setBootStage] = useState<'loading' | 'telemetry' | 'ready_prompt' | 'morphing' | 'active'>('loading');
    const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (bootStage === 'loading') {
            const t = setTimeout(() => setBootStage('telemetry'), 800);
            return () => clearTimeout(t);
        }
    }, [bootStage]);

    useEffect(() => {
        if (bootStage === 'telemetry') {
            const logs = [
                '🔑 DEPTHOS SOVEREIGN KEYS: SYNCHRONIZING...',
                '🔌 PORT BINDINGS: did:sovereign:genesis-node',
                '🧠 ASGI LISP MCTS ENSEMBLE: RUNNING SIMULATION MATRICES...',
                '🛡️ IMMUNE GLIA CONSERVATION: LEVEL 4 HOMEOCONTROL...',
                '💰 TREASURY WATERFALL: SOVEREIGN ROUTER ACTIVE...',
                '🌐 SOVEREIGN ATLAS GRID MAP: BUFFERING SATELLITE TILES...'
            ];
            let current = 0;
            const interval = setInterval(() => {
                if (current < logs.length) {
                    setTelemetryLogs(prev => [...prev, logs[current]]);
                    current++;
                } else {
                    clearInterval(interval);
                    setBootStage('ready_prompt');
                }
            }, 300);
            return () => clearInterval(interval);
        }
    }, [bootStage]);

    React.useEffect(() => {
        if (activePillar === 'ASGI') {
            activateFocusPanel('PROMETHEA_ASGI');
        }
    }, [activePillar]);

    const handleEnterHUD = async () => {
        setBootStage('loading'); // Show loading indicator
        
        // Passive Identity Hydration: Check if we have an existing session
        const existingAuth = localStorage.getItem('authStatus');
        const existingDID = localStorage.getItem('userDID');
        
        if (existingAuth === 'authenticated' && existingDID) {
            console.log('[SovereignHUD] Passively hydrated identity:', existingDID);
            // In a full implementation, we'd validate the token here if needed
        } else {
            console.log('[SovereignHUD] Proceeding as Anonymous Guest (Radical Transparency)');
        }

        // Simulate HUD boot sequence
        setTimeout(() => {
            setBootStage('morphing');
            setTimeout(() => {
                setBootStage('active');
            }, 900);
        }, 300); // Brief delay for the loading state
    };

    const handleExitHUD = () => {
        setIsExiting(true);
        setTimeout(() => {
            router.push('/');
        }, 800);
    };

    // Pre-flight Boot/Morph overlays
    if (bootStage !== 'active' || isExiting) {
        return (
            <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center font-mono overflow-hidden z-[9999] selection:bg-cyan-500/20 text-white select-none">
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
                    @keyframes morph-out-left {
                        0% { transform: translateX(0) scale(1); opacity: 1; }
                        100% { transform: translateX(-150%) scale(1.2); opacity: 0; }
                    }
                    @keyframes morph-out-right {
                        0% { transform: translateX(0) scale(1); opacity: 1; }
                        100% { transform: translateX(150%) scale(1.2); opacity: 0; }
                    }
                    .animate-ring { animation: pulse-ring 3s infinite ease-in-out; }
                    .animate-scan { animation: scanline 6s infinite linear; }
                `}} />

                {/* Dot background layer */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                {/* CRT Scanline Glitch Grid */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[150%] animate-scan z-50" />
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] z-50" />

                {/* Unified central vector core container */}
                <div className={`relative flex flex-col items-center gap-12 max-w-lg px-8 transition-all duration-700 ease-out ${
                    bootStage === 'morphing' || isExiting ? 'scale-150 opacity-0 blur-md' : 'scale-100 opacity-100'
                }`}>
                    
                    {/* Ring Assembly */}
                    <div className="relative w-36 h-36 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ring" />
                        <div className="absolute inset-2 rounded-full border border-dashed border-emerald-500/20" />
                        <div className="absolute inset-6 rounded-full border border-cyan-500/10" />
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                            <Cpu className="w-6 h-6 text-cyan-400" />
                        </div>
                    </div>

                    {/* Telemetry output */}
                    <div className="w-96 min-h-[140px] bg-black/60 border border-white/5 p-4 rounded-lg flex flex-col justify-start gap-1.5 shadow-[0_4px_30px_rgba(0,0,0,0.8)] backdrop-blur">
                        <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase tracking-wider border-b border-white/5 pb-1.5 mb-1.5">
                            <span>Console Signal</span>
                            <span>did:sovereign:genesis</span>
                        </div>
                        {bootStage === 'loading' && (
                            <span className="text-[10px] text-cyan-400/60 animate-pulse font-mono">LOADING CYBERNETIC COCKPIT CONTEXT...</span>
                        )}
                        {telemetryLogs.map((log, idx) => (
                            <span key={idx} className="text-[9px] text-zinc-300 font-mono flex items-center gap-1.5 leading-relaxed">
                                <span className="w-1 h-1 rounded-full bg-emerald-500" /> {log}
                            </span>
                        ))}
                    </div>

                    {/* Activation button overlay */}
                    <div className="h-14 flex items-center justify-center">
                        {bootStage === 'ready_prompt' && !isExiting && (
                            <button
                                onClick={handleEnterHUD}
                                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 border border-cyan-300/40 text-black text-[10px] font-black uppercase tracking-[0.25em] rounded transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:-translate-y-0.5"
                            >
                                Activate Secure Cockpit →
                            </button>
                        )}
                        {isExiting && (
                            <span className="text-[10px] text-red-400 font-black uppercase tracking-[0.25em] animate-pulse">
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
            `}} />

            {/* Persistent Financial Header Ticker (Z-60) */}
            <SovereignHeaderTicker />

            {/* Background Layer (Z-0) — offset top/bottom for tickers */}
            <div className="absolute inset-0 top-8 bottom-7">
                <SovereignAtlasBackground isEclipsed={isEclipsed} />
            </div>

            {/* Tactical Navigation (Z-50) — offset for header ticker */}
            <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
                <TacticalRibbon />
            </div>

            {/* Slide-out Data Trays (Z-40) — inset for tickers */}
            <div className="fixed inset-0 top-8 bottom-7 pointer-events-none z-40">
                <div className="relative w-full h-full pointer-events-none [&>*]:pointer-events-auto">
                    <EclipseTray>
                        {activePillar === 'ATLAS'      && <div className="slide-hud-left"><AtlasTray /></div>}
                        {activePillar === 'ECONOMICS'  && <div className="slide-hud-left"><EconomicsTray /></div>}
                        {activePillar === 'GOVERNANCE' && <div className="slide-hud-left"><GovernanceTray /></div>}
                        {activePillar === 'ASGI'       && <div className="slide-hud-left"><PrometheaPanel /></div>}
                        {activePillar === 'NARRATIVE'  && <div className="slide-hud-left"><NarrativeTray /></div>}
                        {activePillar === 'DIPLOMATIC' && <div className="slide-hud-left"><DiplomaticTray /></div>}
                        {activePillar === 'PULSE'      && <div className="slide-hud-left"><PulseTray /></div>}
                    </EclipseTray>
                </div>
            </div>

            {/* Global Command Palette */}
            <CommandPalette />

            {/* Right-wing Detailed Focus Overlay */}
            {isSubPage && children ? (
                <div className="fixed inset-y-11 right-0 w-[60vw] min-w-[600px] z-50 bg-black/95 backdrop-blur-2xl border-l border-white/10 shadow-[-30px_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col slide-hud-right">
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-50 group"
                    >
                        <X className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                    </button>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-16">
                        {children}
                    </div>
                </div>
            ) : (
                <RightFocusTray />
            )}

            {/* Cmd+K & Exit controls — below header ticker */}
            <div className="fixed top-11 right-6 z-50 flex items-center gap-3">
                <div className="px-4 py-1.5 bg-black/40 backdrop-blur border border-white/5 rounded text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-1.5 opacity-60">
                    <span>Command</span>
                    <span className="font-mono bg-white/10 px-1 py-0.5 rounded">⌘ K</span>
                </div>
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

