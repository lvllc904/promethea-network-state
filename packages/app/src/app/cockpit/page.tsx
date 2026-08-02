'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useHUD } from '@/lib/hud-store';
import { SovereignHeaderTicker } from '@/components/hud/SovereignHeaderTicker';
import { ControlDock } from '@/components/cockpit/ControlDock';
import { OperationalPanel } from '@/components/cockpit/OperationalPanel';
import { HoldingsPanel } from '@/components/cockpit/HoldingsPanel';
import { CommandCenter } from '@/components/cockpit/CommandCenter';
import { ExchangeOverlay } from '@/components/cockpit/ExchangeOverlay';
import { PrometheaConcierge } from '@/components/cockpit/PrometheaConcierge';
import { AssetListingModal } from '@/components/cockpit/AssetListingModal';
import { SovereignMap } from '@/components/SovereignMap';
import { getCelestialById } from '@/lib/celestial-data';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically load InterstellarMap (SSR disabled for Three.js/Canvas)
const InterstellarMap = dynamic(
    () => import('@/components/InterstellarMap').then(m => m.InterstellarMap),
    { ssr: false }
);

function useAtlasLayers() {
    const [layers, setLayers] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/atlas/layers')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (Array.isArray(data) && data.length > 0) setLayers(data); })
            .catch(e => console.warn('[Atlas BFF] fetch failed:', e.message));
    }, []);

    return layers;
}

function AtmosphericEntryOverlay() {
    const { interstellarTransitioning, setHUDState } = useHUD();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!interstellarTransitioning) {
            setProgress(0);
            return;
        }

        const duration = 2500;
        const start = Date.now();
        const interval = setInterval(() => {
            const current = (Date.now() - start) / duration;
            if (current >= 1) {
                clearInterval(interval);
                setProgress(1);
                // Switch mode and clear transitioning state
                setHUDState({ mapMode: 'SURFACE', interstellarTransitioning: null });
            } else {
                setProgress(current);
            }
        }, 16);

        return () => clearInterval(interval);
    }, [interstellarTransitioning, setHUDState]);

    if (!interstellarTransitioning) return null;

    const planet = getCelestialById(interstellarTransitioning);
    const planetName = planet?.name || 'UNKNOWN BODY';

    return (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
            <div 
                className="absolute inset-0 bg-white transition-opacity duration-75"
                style={{ opacity: Math.pow(progress, 4) }}
            />
            <div 
                className="absolute inset-0 mix-blend-screen"
                style={{
                    background: `radial-gradient(circle at center, transparent 0%, ${planet?.color || '#fbbf24'} 100%)`,
                    opacity: progress > 0.5 ? Math.pow((progress - 0.5) * 2, 2) : 0,
                    transform: `scale(${1 + progress * 5})`
                }}
            />
            
            <div 
                className="relative z-10 flex flex-col items-center gap-2"
                style={{ opacity: progress > 0.8 ? 0 : 1 }}
            >
                <div className="text-amber-500 font-data text-2xl md:text-4xl font-bold tracking-[0.5em] uppercase text-shadow-glow animate-pulse">
                    ATMOSPHERIC ENTRY
                </div>
                <div className="text-zinc-200 font-label text-sm tracking-widest uppercase">
                    DESCENDING TO {planetName}
                </div>
                
                <div className="w-64 h-1 bg-white/10 mt-4 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>
            </div>
            
            {/* Speed lines simulation */}
            <div 
                className="absolute inset-0 opacity-30" 
                style={{ 
                    backgroundImage: 'repeating-radial-gradient(circle at center, transparent 0, transparent 2px, rgba(255,255,255,0.1) 3px, transparent 4px)',
                    transform: `scale(${1 + progress * 10})`,
                    transition: 'transform 0.1s linear'
                }} 
            />
        </div>
    );
}

export default function CockpitPage() {
    const { mapMode, competencyLevel } = useHUD();
    const [showOnboardModal, setShowOnboardModal] = useState(false);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
            {/* SPATIAL MAP BASELINE */}
            <div className="absolute inset-0 z-0">
                <div 
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: mapMode === 'SURFACE' ? 1 : 0, pointerEvents: mapMode === 'SURFACE' ? 'auto' : 'none' }}
                >
                    <SovereignMap layers={useAtlasLayers()} />
                </div>
                
                <div 
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: mapMode === 'INTERSTELLAR' ? 1 : 0, pointerEvents: mapMode === 'INTERSTELLAR' ? 'auto' : 'none' }}
                >
                    <InterstellarMap />
                </div>
                
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(3,7,18,0.7)_100%)]" />
            </div>

            {/* TICKER BAR (Top Ambient Context) */}
            <SovereignHeaderTicker />

            {/* SPATIAL HUD OVERLAYS */}
            <div className="absolute inset-x-0 top-8 bottom-16 px-4 flex justify-between items-stretch pointer-events-none z-10">
                {/* Left Panel: Operational State (Auto-expands in Operator & Architect modes) */}
                <div className={`flex items-start pt-2 transition-all duration-500 ${competencyLevel === 'NOVICE' ? 'opacity-30 hover:opacity-100 scale-95 origin-top-left' : 'opacity-100'}`}>
                    <OperationalPanel />
                </div>

                {/* Center Action Hub — competency-gated */}
                <div className="flex-1 flex flex-col items-center justify-start pt-10 relative gap-3.5 max-h-[calc(100vh-6.5rem)] overflow-y-auto custom-scrollbar px-2 pb-6">
                    <CommandCenter />

                    {/* NOVICE: Full Concierge hero — Exchange is hidden (agent handles all actions) */}
                    {competencyLevel === 'NOVICE' && (
                        <PrometheaConcierge onLaunchAssetModal={() => setShowOnboardModal(true)} />
                    )}

                    {/* OPERATOR: Concierge as a collapsible strip above Exchange panels */}
                    {competencyLevel === 'OPERATOR' && (
                        <>
                            <PrometheaConcierge onLaunchAssetModal={() => setShowOnboardModal(true)} />
                            <ExchangeOverlay />
                        </>
                    )}

                    {/* ARCHITECT: Full raw HUD — Concierge collapsed to a floating restore button */}
                    {competencyLevel === 'ARCHITECT' && (
                        <>
                            <ExchangeOverlay />
                            {/* Restore Promethea Concierge button */}
                            <button
                                onClick={() => setHUDState({ competencyLevel: 'OPERATOR' })}
                                className="fixed bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-data font-bold tracking-widest hover:bg-emerald-500/20 transition-all z-50"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                PROMETHEA ONLINE — TAP TO CONSULT
                            </button>
                        </>
                    )}
                </div>

                {/* Right Panel: Financial State (Auto-expands in Operator & Architect modes) */}
                <div className={`flex items-start pt-2 transition-all duration-500 ${competencyLevel === 'NOVICE' ? 'opacity-30 hover:opacity-100 scale-95 origin-top-right' : 'opacity-100'}`}>
                    <HoldingsPanel />
                </div>
            </div>

            <AtmosphericEntryOverlay />

            {/* SYSTEM CONTROLS (Bottom Unified Dock) */}
            <ControlDock />

            {/* Modal Layer */}
            {showOnboardModal && <AssetListingModal onClose={() => setShowOnboardModal(false)} />}
        </div>
    );
}
