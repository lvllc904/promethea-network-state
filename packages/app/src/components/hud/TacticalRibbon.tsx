'use client';

import React from 'react';
import { useHUD } from '@/lib/hud-store';
import { CircleDollarSign, Landmark, BookOpen, Fingerprint, Globe, Activity, BrainCircuit, MessageSquare, MoreHorizontal } from 'lucide-react';

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
        activeColor: 'text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]',
        hoverColor: 'hover:text-emerald-400',
    },
    {
        id: 'GOVERNANCE',
        icon: Landmark,
        label: 'Governance',
        activeColor: 'text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]',
        hoverColor: 'hover:text-cyan-400',
    },
    {
        id: 'ASGI',
        icon: BrainCircuit,
        label: 'Promethea ASGI',
        activeColor: 'text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]',
        hoverColor: 'hover:text-cyan-400',
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
    const { activePillar, activatePillar } = useHUD();

    return (
        <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-4 p-3 bg-black/40 backdrop-blur border border-white/5 rounded-full">
            {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                const isActive = activePillar === pillar.id;

                return (
                    <button
                        key={pillar.id}
                        onClick={() => activatePillar(pillar.id as any)}
                        title={pillar.label}
                        className={`p-2.5 rounded-full transition-all duration-300 ${
                            isActive
                                ? `bg-white/10 ${pillar.activeColor}`
                                : `text-gray-500 ${pillar.hoverColor}`
                        }`}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                    </button>
                );
            })}
            
            {/* Horizontal separator */}
            <div className="w-8 h-px bg-white/10 mx-auto" />

            {/* Omni-Input Toggle Button */}
            <button
                onClick={() => {
                    // Trigger the CommandPalette/Omni-Router via a custom event
                    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                    document.dispatchEvent(event);
                }}
                title="Omni-Input Router"
                className="p-2.5 rounded-full transition-all duration-300 text-gray-500 hover:text-cyan-300 group"
            >
                <MessageSquare size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            </button>

            {/* Settings Kabob Menu */}
            <button
                onClick={() => activatePillar('SETTINGS' as any)} // Will create this pillar next
                title="Sovereign Settings"
                className={`p-2.5 rounded-full transition-all duration-300 ${
                    activePillar === 'SETTINGS'
                        ? `bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.4)]`
                        : `text-gray-500 hover:text-white`
                }`}
            >
                <MoreHorizontal size={20} strokeWidth={isActive ? 2.5 : 1.5} />
            </button>
        </div>
    );
};
