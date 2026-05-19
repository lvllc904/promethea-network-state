'use client';

import React, { useState, useEffect } from 'react';
import { useBodyHandshake } from '@/lib/body-handshake';
import { useSovereignLayout } from '@/lib/sovereign-layout';
import { WidgetRenderer } from './WidgetRenderer';
import { useUser } from '@promethea/identity';
import { useHardwareHandshake } from '@promethea/hooks';
import { Terminal } from 'lucide-react';
import { SovereignCommandMatrix } from './SovereignCommandMatrix';

interface SovereignCockpitProps {
    title: string;
    description: string;
    stats?: { label: string; value: string; color?: string }[];
    actions?: { label: string; action: string; params?: any }[];
    tabs?: { id: string; label: string; icon: React.ReactNode; content: React.ReactNode }[];
}

export const SovereignCockpit: React.FC<SovereignCockpitProps> = ({ 
    title, 
    description, 
    stats,
    actions,
    tabs
}) => {
    const { executeHandshake, executeIntent, isProcessing } = useBodyHandshake();
    const { layout, isLoading } = useSovereignLayout();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(tabs?.[0]?.id);
    const [isMatrixOpen, setIsMatrixOpen] = useState(false);
    const [renderMode, setRenderMode] = useState<'CORE' | 'NEXUS' | 'APEX'>('NEXUS');
    const { profile, isLoading: isHardwareLoading } = useHardwareHandshake();
    const { user } = useUser();

    // Fallback to anonymous identity if no auth is configured in this env
    useEffect(() => {
        if (!activeTab && tabs && tabs.length > 0) {
            setActiveTab(tabs[0].id);
        }
    }, [tabs, activeTab]);

    // BODY 2: ROLE-BASED ACCESS CONTROL
    const role = user?.uid === 'anonymous' ? 'PUBLIC' : 'CITIZEN';

    const handleQuickAction = async (action: string, params?: any) => {
        await executeIntent({
            body: 2,
            action,
            params,
            permissionLevel: 'CITIZEN'
        });
    };

    const currentTabContent = tabs?.find(t => t.id === activeTab)?.content;

    return (
        <div className="flex flex-col h-full min-h-[500px] bg-black text-gray-100 rounded-lg border-2 border-emerald-500/50 overflow-hidden">
            {/* DEBUG INDICATOR */}
            <div className="bg-emerald-500 text-black text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest text-center flex justify-between items-center">
                <span>Cockpit Active // Tabs: {tabs ? 'YES' : 'NO'} // Active: {activeTab}</span>
                <span className="animate-pulse">Hardware Identity: {profile?.gpu || 'Scanning...'} // Tier: {profile?.tier}</span>
            </div>
            {/* Header */}
            <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white uppercase">{title}</h1>
                        <p className="text-xs text-gray-500">{description} | ROLE: <span className="text-emerald-500">{role}</span></p>
                    </div>

                    {/* CONTEXT SWITCHER */}
                    <div className="flex items-center gap-2 bg-black/40 border border-gray-800 rounded-lg px-3 py-1.5">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mr-2">Context:</span>
                        <select 
                            value={user?.activeOrgId}
                            onChange={(e) => (user as any).switchContext?.(e.target.value)}
                            className="bg-transparent text-emerald-400 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:text-emerald-300 transition-colors"
                        >
                            <option value="tpns_genesis">Promethean Genesis</option>
                            <option value="opencivics">OpenCivics Hub</option>
                            <option value="locilife">Loci Life Archipelago</option>
                            <option value="network_nations">Network Nations Mesh</option>
                            <option value="personal_sovereignty">Personal Vault</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    {/* Render Global Cockpit Actions */}
                    {actions && actions.length > 0 && (
                        <div className="flex gap-2 mr-4 border-r border-gray-800 pr-4">
                            {actions.map((act, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleQuickAction(act.action, act.params)}
                                    disabled={isProcessing}
                                    className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest rounded transition-all disabled:opacity-50"
                                >
                                    {act.label}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {/* Stats Rendering */}
                    {stats?.map((stat, i) => (
                        <div key={i} className="text-right ml-4">
                            <p className="text-[10px] uppercase text-gray-500">{stat.label}</p>
                            <p className={`text-lg font-mono ${stat.color || 'text-emerald-400'}`}>{stat.value}</p>
                        </div>
                    ))}
                    
                    {/* The Omni-Matrix Trigger */}
                    <button 
                        onClick={() => setIsMatrixOpen(true)}
                        className="ml-6 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-[10px] rounded flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.8)]"
                    >
                        <Terminal className="w-4 h-4" />
                        Engine Control
                    </button>

                    {/* DIMENSIONAL TOGGLE */}
                    <div className="ml-4 flex bg-black/50 border border-gray-800 rounded p-0.5">
                        {['CORE', 'NEXUS', 'APEX'].map(mode => (
                            <button 
                                key={mode}
                                onClick={() => setRenderMode(mode as any)}
                                className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-sm transition-all ${renderMode === mode ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>


                    <button 
                        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                        className="p-2 hover:bg-gray-800 rounded transition-colors ml-2"
                    >
                        <span className="text-lg">⚙️</span>
                    </button>
                </div>
            </div>

            <SovereignCommandMatrix isOpen={isMatrixOpen} onClose={() => setIsMatrixOpen(false)} />

            {/* Tab Navigation (if provided) */}
            {tabs && (
                <div className="flex border-b border-gray-800 bg-gray-900/50 px-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border-b-2 ${
                                activeTab === tab.id 
                                ? 'border-cyan-500 text-white bg-cyan-500/5' 
                                : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Command Viewport */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-950">
                {tabs ? (
                    <div className="h-full">
                        {currentTabContent || (tabs.length > 0 ? tabs[0].content : null)}
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center justify-center h-64 text-xs font-black uppercase tracking-[0.3em] animate-pulse">
                        Synchronizing Sovereign Layout...
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-4">
                        {layout?.widgets.map((widget) => (
                            <div 
                                key={widget.id} 
                                className="col-span-12"
                                style={{ gridColumn: `span ${widget.position.w}` }}
                            >
                                <div className="p-2 bg-gray-900/50 border border-gray-800 rounded-lg">
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">{widget.pillar} // {widget.title}</span>
                                        <span className="text-[8px] text-gray-700">M2M_SYNC_OK</span>
                                    </div>
                                    <WidgetRenderer config={widget} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Side Drawer... (existing logic) */}
        </div>
    );
};
