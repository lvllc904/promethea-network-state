'use client';

import React from 'react';
import { useHUD } from '@/lib/hud-store';
import { CircleDollarSign, Landmark, BookOpen, Fingerprint, Globe, Activity, BrainCircuit } from 'lucide-react';

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
        </div>
    );
};
