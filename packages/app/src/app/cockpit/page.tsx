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
import { SovereignMap } from '@/components/SovereignMap';

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

export default function CockpitPage() {
    const { mapMode } = useHUD();
    const layers = useAtlasLayers();

    return (
        <div className="fixed inset-0 bg-[#0b0c10] overflow-hidden text-white font-body selection:bg-amber-500/30 select-none">
            {/* DYNAMIC HIGH-FIDELITY MAP BACKDROP */}
            <div className="absolute inset-0 z-0">
                {/* Surface Map (Google Maps / 3D Tiles) */}
                <div 
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: mapMode === 'SURFACE' ? 1 : 0, pointerEvents: mapMode === 'SURFACE' ? 'auto' : 'none' }}
                >
                    <SovereignMap layers={layers} />
                </div>

                {/* Orbital Map (Three.js Starfield/Topology) */}
                <div 
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: mapMode === 'INTERSTELLAR' ? 1 : 0, pointerEvents: mapMode === 'INTERSTELLAR' ? 'auto' : 'none' }}
                >
                    <InterstellarMap />
                </div>
                
                {/* Global depth vignette overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(3,7,18,0.7)_100%)]" />
            </div>

            {/* TICKER BAR (Top Ambient Context) */}
            <SovereignHeaderTicker />

            {/* SPATIAL HUD OVERLAYS */}
            <div className="absolute inset-x-0 top-8 bottom-16 px-4 flex justify-between items-stretch pointer-events-none z-10">
                {/* Left Panel: Operational State */}
                <div className="flex items-start pt-2">
                    <OperationalPanel />
                </div>

                {/* Center Action Hub & Overlays */}
                <div className="flex-1 flex flex-col items-center justify-start pt-16 relative">
                    <CommandCenter />
                    <ExchangeOverlay />
                </div>

                {/* Right Panel: Financial State */}
                <div className="flex items-start pt-2">
                    <HoldingsPanel />
                </div>
            </div>

            {/* SYSTEM CONTROLS (Bottom Unified Dock) */}
            <ControlDock />
        </div>
    );
}
