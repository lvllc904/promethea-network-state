'use client';

import React from 'react';
import { useHUD } from '@/lib/hud-store';
import { CircleDollarSign, Landmark, BookOpen, Fingerprint, Globe, Activity, BrainCircuit, MessageSquare, MoreHorizontal, Monitor, AlertTriangle } from 'lucide-react';

const PILLARS = [
    {
        id: 'ATLAS',
        icon: Globe,
        label: 'Atlas',
        activeColor: 'text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]',
        hoverColor: 'hover:text-blue-400',
    },
    {
        id: 'ECONOMICS',
        icon: CircleDollarSign,
        label: 'Economics',
        activeColor: 'text-amber-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]',
        hoverColor: 'hover:text-amber-400',
    },
    {
        id: 'GOVERNANCE',
        icon: Landmark,
        label: 'Governance',
        activeColor: 'text-amber-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]',
        hoverColor: 'hover:text-amber-400',
    },
    {
        id: 'ASGI',
        icon: BrainCircuit,
        label: 'Promethea ASGI',
        activeColor: 'text-amber-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]',
        hoverColor: 'hover:text-amber-400',
    },
    {
        id: 'NARRATIVE',
        icon: BookOpen,
        label: 'Narrative',
        activeColor: 'text-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.4)]',
        hoverColor: 'hover:text-purple-400',
    },
    {
        id: 'DIPLOMATIC',
        icon: Fingerprint,
        label: 'Passport',
        activeColor: 'text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]',
        hoverColor: 'hover:text-amber-400',
    },
    {
        id: 'PULSE',
        icon: Activity,
        label: 'Pulse',
        activeColor: 'text-red-400 shadow-[0_0_15px_rgba(248,113,113,0.4)]',
        hoverColor: 'hover:text-red-400',
    },
] as const;

export const TacticalRibbon = () => {
    const { activePillar, activatePillar, activeFocusPanel, activateFocusPanel, activeHazards } = useHUD();

    return (
        <div className="flex flex-col gap-4 p-2 w-full items-center">
            {activeHazards && activeHazards.length > 0 && (
                <div className="relative group flex items-center justify-center">
                    <div className="p-2.5 rounded-full bg-red-500/10 border border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse cursor-pointer">
                        <AlertTriangle size={20} className="animate-bounce" style={{ animationDuration: '3s' }} />
                    </div>
                    
                    {/* Floating glassmorphic tooltip with full scrollable warnings */}
                    <div className="absolute left-14 top-0 w-64 p-3 rounded-lg border border-red-500/30 bg-black/95 backdrop-blur-md shadow-2xl scale-0 group-hover:scale-100 origin-left transition-all duration-300 z-50 font-mono text-[9px] pointer-events-none space-y-2">
                        <div className="flex items-center justify-between border-b border-red-500/20 pb-1.5">
                            <span className="text-red-500 font-bold tracking-wider">CRITICAL PROXIMITY HAZARDS</span>
                            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-black text-[8px]">{activeHazards.length} ACTIVE</span>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {activeHazards.map((haz, idx) => (
                                <div key={idx} className="space-y-1 pb-1.5 border-b border-white/5 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between text-white">
                                        <span className="font-bold text-red-400 uppercase">{haz.type}</span>
                                        <span className="text-zinc-500">{haz.distanceKm}KM ({haz.bearingDegrees}°)</span>
                                    </div>
                                    <div className="text-zinc-400 font-medium text-[8px]">{haz.title}</div>
                                    <div className="text-zinc-500 text-[8px]">AFFECTED: {haz.citadelName}</div>
                                    {haz.remediationAction && (
                                        <div className="text-[7.5px] text-amber-500/90 bg-amber-500/5 px-1 py-0.5 rounded border border-amber-500/10 uppercase">
                                            ACTION: {haz.remediationAction.replace(/_/g, ' ')}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                const isActive = activePillar === pillar.id;
                const hasHazard = (pillar.id === 'ATLAS' || pillar.id === 'PULSE') && activeHazards && activeHazards.length > 0;

                return (
                    <button
                        key={pillar.id}
                        onClick={() => activatePillar(pillar.id as any)}
                        onMouseDown={(e) => e.stopPropagation()}
                        title={pillar.label}
                        className={`p-2.5 rounded-full transition-all duration-300 relative ${
                            isActive
                                ? `bg-white/10 ${pillar.activeColor}`
                                : `text-gray-500 ${pillar.hoverColor}`
                        }`}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                        {hasHazard && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping shadow-[0_0_8px_#ef4444]" />
                        )}
                        {hasHazard && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" />
                        )}
                    </button>
                );
            })}
            
            {/* Horizontal separator */}
            <div className="w-8 h-px bg-white/10 mx-auto" />

            {/* Workspaces Control Deck Toggle */}
            <button
                onClick={() => {
                    if (activeFocusPanel === 'WORKSPACES') {
                        activateFocusPanel(null);
                    } else {
                        activateFocusPanel('WORKSPACES');
                    }
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title="Decentralized Workspaces"
                className={`p-2.5 rounded-full transition-all duration-300 ${
                    activeFocusPanel === 'WORKSPACES'
                        ? 'bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.4)] border border-indigo-500/30'
                        : 'text-gray-500 hover:text-indigo-300 group'
                }`}
            >
                <Monitor size={20} strokeWidth={activeFocusPanel === 'WORKSPACES' ? 2.5 : 1.5} className="group-hover:scale-110 transition-transform" />
            </button>

            {/* Omni-Input Toggle Button */}
            <button
                onClick={() => activatePillar('CHAT' as any)}
                onMouseDown={(e) => e.stopPropagation()}
                title="Promethea Co-pilot Chat"
                className={`p-2.5 rounded-full transition-all duration-300 ${
                    activePillar === 'CHAT'
                        ? 'bg-white/10 text-amber-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                        : 'text-gray-500 hover:text-amber-300 group'
                }`}
            >
                <MessageSquare size={20} strokeWidth={activePillar === 'CHAT' ? 2.5 : 1.5} className="group-hover:scale-110 transition-transform" />
            </button>

            {/* Settings Kabob Menu */}
            <button
                onClick={() => activatePillar('SETTINGS' as any)} // Will create this pillar next
                onMouseDown={(e) => e.stopPropagation()}
                title="Sovereign Settings"
                className={`p-2.5 rounded-full transition-all duration-300 ${
                    activePillar === 'SETTINGS'
                        ? `bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.4)]`
                        : `text-gray-500 hover:text-white`
                }`}
            >
                <MoreHorizontal size={20} strokeWidth={activePillar === 'SETTINGS' ? 2.5 : 1.5} />
            </button>
        </div>
    );
};
