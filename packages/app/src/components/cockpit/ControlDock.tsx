'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Network, Compass, Layout } from 'lucide-react';
import { useHUD } from '@/lib/hud-store';
import { useMesh } from '@/components/providers/mesh-provider';

export function ControlDock() {
    const { mapMode, setHUDState, isPhosphorMode, competencyLevel } = useHUD();
    const { themeState, setTheme } = useMesh();

    const themes = [
        { id: 'theme-citadel', label: 'CITADEL' },
        { id: 'theme-latex', label: 'LATEX' },
        { id: 'theme-16bit', label: '16-BIT' },
        { id: 'theme-phosphor', label: 'PHOSPHOR' }
    ];

    const currentTheme = themeState?.theme || 'theme-citadel';

    return (
        <div className="fixed bottom-0 left-0 w-full px-6 pb-4 pt-10 pointer-events-none flex justify-center z-50">
            <div className="flex items-center justify-between w-full max-w-6xl pointer-events-auto">
                
                {/* LEFT WING: Map Switcher */}
                <div className="flex bg-black/50 backdrop-blur-xl border border-white/[0.08] rounded-xl p-1 shadow-[0_0_16px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={() => setHUDState({ mapMode: 'SURFACE' })}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-data text-[9px] tracking-[0.14em] font-semibold transition-all ${
                            mapMode === 'SURFACE' 
                                ? 'bg-white/10 text-emerald-400 border border-emerald-500/20' 
                                : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        <Globe className="w-3 h-3" />
                        <span>SURFACE</span>
                    </button>
                    <button
                        onClick={() => setHUDState({ mapMode: 'INTERSTELLAR' })}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-data text-[9px] tracking-[0.14em] font-semibold transition-all ${
                            mapMode === 'INTERSTELLAR' 
                                ? 'bg-white/10 text-amber-500 border border-amber-500/20' 
                                : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        <Network className="w-3 h-3" />
                        <span>ORBITAL</span>
                    </button>
                </div>

                {/* CENTER: Theme Switcher */}
                <div className="flex bg-black/50 backdrop-blur-xl border border-white/[0.08] rounded-xl p-1 shadow-[0_0_16px_rgba(0,0,0,0.5)]">
                    {themes.map((t) => {
                        const isActive = currentTheme === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id as any)}
                                className={`px-3 py-1 rounded-lg font-data text-[9px] tracking-[0.14em] font-semibold transition-all ${
                                    isActive 
                                        ? 'bg-white/10 text-white border border-white/10' 
                                        : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* RIGHT WING: Competency Level & Command Matrix Trigger */}
                <div className="flex bg-black/50 backdrop-blur-xl border border-white/[0.08] rounded-xl p-1 shadow-[0_0_16px_rgba(0,0,0,0.5)] gap-1">
                    <button
                        onClick={() => {
                            const next = competencyLevel === 'NOVICE' ? 'OPERATOR' : competencyLevel === 'OPERATOR' ? 'ARCHITECT' : 'NOVICE';
                            setHUDState({ competencyLevel: next });
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-data text-[9px] tracking-[0.14em] font-semibold text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                    >
                        <Compass className="w-3 h-3 text-emerald-400" />
                        <span>MODE: {competencyLevel}</span>
                    </button>
                    <button
                        onClick={() => {
                            const event = new CustomEvent('toggle-command-matrix');
                            window.dispatchEvent(event);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-data text-[9px] tracking-[0.14em] font-semibold text-zinc-400 hover:text-white transition-all hover:bg-white/5"
                    >
                        <Layout className="w-3 h-3 text-zinc-500" />
                        <span>MATRIX</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
