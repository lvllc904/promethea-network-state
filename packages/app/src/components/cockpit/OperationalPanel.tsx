'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Terminal, Play, Pause, AlertTriangle, Activity, CheckCircle, Network, Database, Orbit } from 'lucide-react';
import { useHUD } from '@/lib/hud-store';
import { getCelestialById } from '@/lib/celestial-data';
import { MetabolicWaterfallVisualizer } from './MetabolicWaterfallVisualizer';

interface Agent {
    id: string;
    name: string;
    role: string;
    status: 'ACTIVE' | 'IDLE' | 'ALERT';
    currentTask: string;
}

export function OperationalPanel() {
    const { isPhosphorMode, mapMode, selectedCelestialId, selectedDeepFieldBody, setHUDState, cockpitOpsTab } = useHUD();
    const selectedPlanet = selectedCelestialId ? getCelestialById(selectedCelestialId) ?? null : null;
    const selectedBody = selectedDeepFieldBody;
    const [activeTab, setActiveTab] = useState<'AGENTS' | 'TELEMETRY' | 'LOGS'>('AGENTS');

    // Sync with HUD-driven tab routing from CommandCenter nav chips
    useEffect(() => {
        if (cockpitOpsTab) {
            setActiveTab(cockpitOpsTab);
            setHUDState({ cockpitOpsTab: null }); // consume
        }
    }, [cockpitOpsTab]);

    const [agents, setAgents] = useState<Agent[]>([
        { id: '1', name: 'Promethea Core', role: 'Sovereign Steward', status: 'ACTIVE', currentTask: 'Analyzing incoming state proposals' },
        { id: '2', name: 'Treasury Watcher', role: 'Liquidity Safeguard', status: 'ACTIVE', currentTask: 'Monitoring multi-sig wallets' },
        { id: '3', name: 'Governance Oracle', role: 'Vote Validator', status: 'IDLE', currentTask: 'Awaiting next cycle' },
        { id: '4', name: 'Osiris Sentinel', role: 'Substrate Guardian', status: 'ALERT', currentTask: 'High entropy detected in Node-3' }
    ]);

    const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string; type: 'info' | 'warn' | 'success' }>>([
        { id: '1', time: '14:52:10', msg: 'System check: 3-Body Handshake verified.', type: 'success' },
        { id: '2', time: '14:52:15', msg: 'Osiris Telemetry: Local daemon online.', type: 'info' },
        { id: '3', time: '14:52:45', msg: 'Node-3 latency elevated to 320ms.', type: 'warn' },
        { id: '4', time: '14:53:10', msg: 'Treasury vault: Balance snapshot complete.', type: 'info' }
    ]);

    // Live log stream simulator
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0];
            const messages = [
                { msg: 'Agent "Treasury Watcher" completed cycle audit.', type: 'success' as const },
                { msg: 'Global state synced with substrate.', type: 'info' as const },
                { msg: 'P2P network propagation complete across 3 nodes.', type: 'info' as const },
                { msg: 'Osiris Telemetry: Entropy verified at 14.2 J/s.', type: 'info' as const }
            ];
            const chosen = messages[Math.floor(Math.random() * messages.length)];
            
            setLogs(prev => [
                { id: Date.now().toString(), time: timeStr, ...chosen },
                ...prev.slice(0, 15)
            ]);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const toggleAgent = (id: string) => {
        setAgents(prev => prev.map(agent => {
            if (agent.id === id) {
                const isIdle = agent.status === 'IDLE';
                return {
                    ...agent,
                    status: isIdle ? 'ACTIVE' : 'IDLE',
                    currentTask: isIdle ? 'Running execution cycles' : 'Idle'
                };
            }
            return agent;
        }));
    };

    return (
        <div className="w-64 h-[calc(100vh-7.5rem)] flex flex-col gap-2 z-40 relative pointer-events-auto overflow-y-auto custom-scrollbar">

            {/* CELESTIAL TARGET MODULE (Interstellar mode only) */}
            {mapMode === 'INTERSTELLAR' && (
                <div className="bg-[#090d16]/90 backdrop-blur-2xl rounded-xl p-2.5 flex flex-col overflow-hidden shrink-0 border border-white/[0.08]" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.06)', maxHeight: '55%' }}>
                    <div className="flex items-center justify-between pb-1.5 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-1.5">
                            <Orbit className="w-3 h-3 text-amber-400 animate-spin shrink-0" style={{ animationDuration: '6s' }} />
                            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-400 font-label">
                                Celestial Target
                            </span>
                        </div>
                        {selectedPlanet && (
                            <button
                                onClick={() => setHUDState({ selectedCelestialId: null })}
                                className="text-[7px] text-zinc-500 hover:text-amber-400 font-bold uppercase tracking-wider font-data cursor-pointer transition-colors"
                            >
                                [Reset]
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-0.5 space-y-1.5">
                        {selectedPlanet ? (
                            <>
                                {/* Planet header */}
                                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/[0.015]" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                                    <div
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: selectedPlanet.color, boxShadow: `0 0 8px ${selectedPlanet.color}` }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-semibold text-zinc-200 truncate block font-label">{selectedPlanet.name}</span>
                                        <span className="text-[7px] text-zinc-500 tracking-wider block font-data">{selectedPlanet.details.type}</span>
                                    </div>
                                </div>

                                {/* Stats grid */}
                                <div className="space-y-1 font-data text-[8px]">
                                    <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                                        <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">Atmosphere</span>
                                        <span className="text-zinc-300 font-semibold">{selectedPlanet.details.atmosphere}</span>
                                    </div>
                                    <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                                        <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">Surface Temp</span>
                                        <span className="text-zinc-300 font-semibold">{selectedPlanet.details.temp}</span>
                                    </div>
                                    <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                                        <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">Governance</span>
                                        <span className="text-amber-400 font-semibold">{selectedPlanet.details.governance}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                                            <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">Nodes</span>
                                            <span className="text-emerald-400 font-semibold">{selectedPlanet.details.nodesActive} Active</span>
                                        </div>
                                        <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                                            <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">Network</span>
                                            <span className="text-orange-400 font-semibold truncate block">{selectedPlanet.details.nodesActive > 0 ? 'RFC 5050' : 'OFFLINE'}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : selectedBody ? (
                            <>
                                {/* Deep field body header */}
                                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/[0.015]" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                                    <div
                                        className={`w-3 h-3 rounded-full shrink-0 ${
                                            selectedBody.type === 'star' ? 'bg-yellow-200' : selectedBody.type === 'galaxy' ? 'bg-amber-400' : 'bg-rose-500'
                                        }`}
                                        style={{
                                            boxShadow: `0 0 8px ${selectedBody.type === 'star' ? '#fef08a' : selectedBody.type === 'galaxy' ? '#22d3ee' : '#f43f5e'}`
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-semibold text-zinc-200 truncate block font-label">{selectedBody.id}</span>
                                        <span className="text-[7px] text-zinc-500 tracking-wider block font-data">Deep Field {selectedBody.type}</span>
                                    </div>
                                    <button
                                        onClick={() => setHUDState({ selectedDeepFieldBody: null })}
                                        className="text-[7px] text-zinc-500 hover:text-zinc-300 font-bold uppercase cursor-pointer font-data"
                                    >
                                        [ESC]
                                    </button>
                                </div>

                                {/* RA/DEC/Mag/Redshift */}
                                <div className="space-y-1 font-data text-[8px]">
                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                                            <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">RA</span>
                                            <span className="text-zinc-300 font-semibold">{selectedBody.ra}°</span>
                                        </div>
                                        <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                                            <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">DEC</span>
                                            <span className="text-zinc-300 font-semibold">{selectedBody.dec}°</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                                            <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">Magnitude</span>
                                            <span className="text-zinc-300 font-semibold">{selectedBody.mag} mag</span>
                                        </div>
                                        <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                                            <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">Redshift (z)</span>
                                            <span className="text-rose-400 font-bold">{selectedBody.z}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                                        <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">Classification</span>
                                        <span className="text-amber-400 font-semibold">
                                            {selectedBody.type === 'star' ? 'Milky Way Foreground Star' : selectedBody.type === 'galaxy' ? 'Luminous Red Galaxy (LRG)' : 'Active Galactic Nucleus'}
                                        </span>
                                    </div>
                                    <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                                        <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">Distance</span>
                                        <span className="text-amber-400 font-semibold">{(selectedBody.z * 13.8 * 3.26).toFixed(2)} Billion LY</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center text-center text-zinc-500 text-[8px] uppercase tracking-widest leading-relaxed p-4 font-data">
                                Select a celestial body to view telemetry
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TABS CONTAINER FOR OPERATIONAL HUD */}
            <div className="flex-1 bg-[#090d16]/90 backdrop-blur-2xl rounded-xl p-2.5 flex flex-col overflow-hidden border border-white/[0.08]" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.06)' }}>
                {/* Tab Navigation */}
                <div className="flex bg-white/5 p-0.5 rounded-lg mb-2 text-[8px] font-mono border border-white/5 shrink-0">
                    <button
                        onClick={() => setActiveTab('AGENTS')}
                        className={`flex-1 py-1 rounded text-center transition-all ${
                            activeTab === 'AGENTS' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        AGENTS ({agents.filter(a => a.status === 'ACTIVE').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('TELEMETRY')}
                        className={`flex-1 py-1 rounded text-center transition-all ${
                            activeTab === 'TELEMETRY' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        TELEMETRY
                    </button>
                    <button
                        onClick={() => setActiveTab('LOGS')}
                        className={`flex-1 py-1 rounded text-center transition-all ${
                            activeTab === 'LOGS' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        SYSTEM LOGS
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto pr-0.5">
                    {activeTab === 'AGENTS' && (
                        <div className="space-y-1.5">
                            {agents.map((agent) => {
                                const isActive = agent.status === 'ACTIVE';
                                const isAlert = agent.status === 'ALERT';
                                return (
                                    <div
                                        key={agent.id}
                                        className={`p-2 rounded-lg bg-white/[0.015] transition-all ${
                                            isAlert
                                                ? 'bg-red-950/15'
                                                : isActive
                                                    ? 'hover:bg-white/[0.03]'
                                                    : 'opacity-50'
                                        }`}
                                        style={{ boxShadow: isAlert ? 'inset 0 0 0 1px rgba(239,68,68,0.15)' : 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-semibold text-zinc-200 truncate font-label">
                                                        {agent.name}
                                                    </span>
                                                    {isAlert && <AlertTriangle className="w-2.5 h-2.5 text-red-500 animate-pulse shrink-0" />}
                                                </div>
                                                <span className="text-[8px] text-zinc-500 tracking-wider block font-data">
                                                    {agent.role}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => toggleAgent(agent.id)}
                                                className={`p-0.5 rounded-md ml-1 transition-colors shrink-0 ${
                                                    isActive
                                                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                        : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                                                }`}
                                            >
                                                {isActive ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                                            </button>
                                        </div>
                                        <div className="text-[8px] text-zinc-400 line-clamp-1 bg-black/20 px-1.5 py-1 rounded-md font-data" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)' }}>
                                            &gt; {agent.currentTask}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'TELEMETRY' && (
                        <div className="rounded-lg overflow-hidden">
                            <MetabolicWaterfallVisualizer />
                        </div>
                    )}

                    {activeTab === 'LOGS' && (
                        <div className="space-y-1 font-data text-[8px] leading-snug">
                            {logs.map((log) => (
                                <div key={log.id} className="flex gap-1.5">
                                    <span className="text-zinc-600 select-none">[{log.time}]</span>
                                    <span className={
                                        log.type === 'success'
                                            ? 'text-emerald-400'
                                            : log.type === 'warn'
                                                ? 'text-amber-400 font-semibold'
                                                : 'text-zinc-400'
                                    }>
                                        {log.msg}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
