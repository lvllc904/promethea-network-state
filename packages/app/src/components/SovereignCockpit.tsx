'use client';

import React, { useState } from 'react';
import { useBodyHandshake } from '@/lib/body-handshake';

interface PillarTab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
}

interface SovereignCockpitProps {
    title: string;
    description: string;
    tabs: PillarTab[];
    stats?: { label: string; value: string; color?: string }[];
    actions?: { label: string; action: string; params?: any }[]; // Contextual actions for the side drawer
}

export const SovereignCockpit: React.FC<SovereignCockpitProps> = ({ 
    title, 
    description, 
    tabs, 
    stats,
    actions 
}) => {
    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { executeIntent, isProcessing } = useBodyHandshake();

    const activeTab = tabs.find(t => t.id === activeTabId);

    const handleQuickAction = async (action: string, params?: any) => {
        await executeIntent({
            body: 2,
            action,
            params,
            permissionLevel: 'CITIZEN'
        });
    };

    return (
        <div className="flex flex-col h-full bg-black text-gray-100 rounded-lg border border-gray-800 overflow-hidden">
            {/* Header / Institutional Branding */}
            <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white uppercase">{title}</h1>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
                <div className="flex gap-4">
                    {stats?.map((stat, i) => (
                        <div key={i} className="text-right">
                            <p className="text-[10px] uppercase text-gray-500">{stat.label}</p>
                            <p className={`text-lg font-mono ${stat.color || 'text-emerald-400'}`}>{stat.value}</p>
                        </div>
                    ))}
                    <button 
                        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                        className="p-2 hover:bg-gray-800 rounded transition-colors"
                    >
                        <span className="text-lg">⚙️</span>
                    </button>
                </div>
            </div>

            {/* Pillar Tab Bar */}
            <div className="flex bg-gray-950 border-b border-gray-900 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                            activeTabId === tab.id 
                            ? 'border-emerald-500 bg-gray-900 text-white' 
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {tab.icon && <span className="mr-2">{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Command Viewport */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-950">
                {activeTab?.content}
            </div>

            {/* The Command Drawer (Slide-out selective controls) */}
            <div className={`fixed inset-y-0 right-0 w-80 bg-gray-900 border-l border-gray-800 transform transition-transform duration-300 z-50 shadow-2xl ${
                isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Sovereign Control</h2>
                        <button onClick={() => setIsDrawerOpen(false)} className="text-gray-500">✕</button>
                    </div>

                    <div className="space-y-6">
                        <div className="p-3 bg-black rounded border border-gray-800">
                            <p className="text-[10px] text-gray-500 uppercase mb-2">Handshake Authority</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs font-mono">Body-2/Body-3 Active</span>
                            </div>
                        </div>

                        {actions?.map((action, i) => (
                            <div key={i}>
                                <label className="text-[10px] text-gray-500 uppercase block mb-2">{action.label}</label>
                                <button
                                    onClick={() => handleQuickAction(action.action, action.params)}
                                    disabled={isProcessing}
                                    className="w-full p-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded transition-colors disabled:opacity-50"
                                >
                                    {isProcessing ? 'Handshaking...' : `Execute ${action.label}`}
                                </button>
                            </div>
                        ))}

                        <div className="pt-8 opacity-30">
                            <p className="text-[10px] leading-relaxed italic">
                                "Code as Law. Action as Intent. Sovereignty as Privacy."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
