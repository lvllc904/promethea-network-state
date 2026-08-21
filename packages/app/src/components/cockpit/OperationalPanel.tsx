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
        { id: '2', name: 'Treasury Watcher', role: 'Liquidity Safeguard', status: 'ACTIVE', currentTask: 'Monitoring multi-sig reserve pools' },
        { id: '3', name: 'Governance Oracle', role: 'Vote Validator', status: 'IDLE', currentTask: 'Awaiting next cycle docket' },
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
        <div className="w-72 h-[calc(100vh-7.5rem)] flex flex-col gap-2.5 z-40 relative pointer-events-auto overflow-y-auto custom-scrollbar">

            {/* CELESTIAL TARGET MODULE (Interstellar mode only) */}
            {mapMode === 'INTERSTELLAR' && (
                <div className="bg-[#090d16]/95 backdrop-blur-2xl rounded-xl p-3 flex flex-col overflow-hidden shrink-0 border border-white/10 shadow-xl" style={{ maxHeight: '55%' }}>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <Orbit className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-label">
                                Celestial Target
                            </span>
                        </div>
                        {selectedPlanet && (
                            <button
                                onClick={() => setHUDState({ selectedCelestialId: null })}
                                className="text-xs text-zinc-400 hover:text-amber-400 font-bold uppercase tracking-wider font-data cursor-pointer transition-colors"
                            >
                                [Reset]
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-0.5 space-y-2">
                        {selectedPlanet ? (
                            <>
                                {/* Planet header */}
                                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div
                                        className="w-3.5 h-3.5 rounded-full shrink-0"
                                        style={{ backgroundColor: selectedPlanet.color, boxShadow: `0 0 8px ${selectedPlanet.color}` }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-zinc-100 truncate block font-label">{selectedPlanet.name}</span>
                                        <span className="text-xs text-zinc-400 tracking-wider block font-data">{selectedPlanet.details.type}</span>
                                    </div>
                                </div>

                                {/* Stats grid */}
                                <div className="space-y-1.5 font-data text-xs">
                                    <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                        <span className="text-zinc-400 block mb-0.5 uppercase tracking-wider text-xs">Atmosphere</span>
                                        <span className="text-zinc-200 font-semibold">{selectedPlanet.details.atmosphere}</span>
                                    </div>
                                    <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                        <span className="text-zinc-400 block mb-0.5 uppercase tracking-wider text-xs">Surface Temp</span>
                                        <span className="text-zinc-200 font-semibold">{selectedPlanet.details.temp}</span>
                                    </div>
                                    <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                        <span className="text-zinc-400 block mb-0.5 uppercase tracking-wider text-xs">Governance</span>
                                        <span className="text-amber-400 font-semibold">{selectedPlanet.details.governance}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                            <span className="text-zinc-400 block mb-0.5 uppercase tracking-wider text-xs">Nodes</span>
                                            <span className="text-emerald-400 font-semibold">{selectedPlanet.details.nodesActive} Active</span>
                                        </div>
                                        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                            <span className="text-zinc-400 block mb-0.5 uppercase tracking-wider text-xs">Network</span>
                                            <span className="text-orange-400 font-semibold truncate block">{selectedPlanet.details.nodesActive > 0 ? 'RFC 5050' : 'OFFLINE'}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : selectedBody ? (
                            <>
                                {/* Deep field body header */}
                                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div
                                        className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                                            selectedBody.type === 'star' ? 'bg-yellow-200' : selectedBody.type === 'galaxy' ? 'bg-amber-400' : 'bg-rose-500'
                                        }`}
                                        style={{
                                            boxShadow: `0 0 8px ${selectedBody.type === 'star' ? '#fef08a' : selectedBody.type === 'galaxy' ? '#22d3ee' : '#f43f5e'}`
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-zinc-100 truncate block font-label">{selectedBody.id}</span>
                                        <span className="text-xs text-zinc-400 tracking-wider block font-data">Deep Field {selectedBody.type}</span>
                                    </div>
                                    <button
                                        onClick={() => setHUDState({ selectedDeepFieldBody: null })}
                                        className="text-xs text-zinc-400 hover:text-zinc-200 font-bold uppercase cursor-pointer font-data"
                                    >
                                        [ESC]
                                    </button>
                                </div>

                                {/* RA/DEC/Mag/Redshift */}
                                <div className="space-y-1.5 font-data text-xs">
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                            <span className="text-zinc-400 block mb-0.5 uppercase tracking-wider text-xs">RA</span>
                                            <span className="text-zinc-200 font-semibold font-mono tabular-nums">{selectedBody.ra}°</span>
                                        </div>
                                        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                            <span className="text-zinc-400 block mb-0.5 uppercase tracking-wider text-xs">DEC</span>
                                            <span className="text-zinc-200 font-semibold font-mono tabular-nums">{selectedBody.dec}°</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                            <span className="text-zinc-400 block mb-0.5 uppercase tracking-wider text-xs">Magnitude</span>
                                            <span className="text-zinc-200 font-semibold font-mono tabular-nums">{selectedBody.mag} mag</span>
                                        </div>
                                        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                            <span className="text-zinc-400 block mb-0.5 uppercase tracking-wider text-xs">Redshift (z)</span>
                                            <span className="text-rose-400 font-bold font-mono tabular-nums">{selectedBody.z}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                        <span className="text-zinc-400 block mb-0.5 uppercase tracking-wider text-xs">Classification</span>
                                        <span className="text-amber-400 font-semibold">
                                            {selectedBody.type === 'star' ? 'Milky Way Foreground Star' : selectedBody.type === 'galaxy' ? 'Luminous Red Galaxy (LRG)' : 'Active Galactic Nucleus'}
                                        </span>
                                    </div>
                                    <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                        <span className="text-zinc-400 block mb-0.5 uppercase tracking-wider text-xs">Distance</span>
                                        <span className="text-amber-400 font-semibold font-mono tabular-nums">{(selectedBody.z * 13.8 * 3.26).toFixed(2)} Billion LY</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center text-center text-zinc-400 text-xs uppercase tracking-wider leading-relaxed p-4 font-data">
                                Select a celestial body to view telemetry
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TABS CONTAINER FOR OPERATIONAL HUD */}
            <div className="flex-1 bg-[#090d16]/95 backdrop-blur-2xl rounded-xl p-3 flex flex-col overflow-hidden border border-white/10 shadow-xl">
                {/* Tab Navigation */}
                <div className="flex bg-white/5 p-1 rounded-lg mb-2.5 text-xs font-mono border border-white/5 shrink-0 gap-1">
                    <button
                        onClick={() => setActiveTab('AGENTS')}
                        className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer ${
                            activeTab === 'AGENTS' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                        }`}
                    >
                        AGENTS ({agents.filter(a => a.status === 'ACTIVE').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('TELEMETRY')}
                        className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer ${
                            activeTab === 'TELEMETRY' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                        }`}
                    >
                        TELEMETRY
                    </button>
                    <button
                        onClick={() => setActiveTab('LOGS')}
                        className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer ${
                            activeTab === 'LOGS' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                        }`}
                    >
                        SYSTEM LOGS
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto pr-0.5 custom-scrollbar">
                    {activeTab === 'AGENTS' && (
                        <div className="space-y-2">
                            {agents.map((agent) => {
                                const isActive = agent.status === 'ACTIVE';
                                const isAlert = agent.status === 'ALERT';
                                return (
                                    <div
                                        key={agent.id}
                                        className={`p-2.5 rounded-lg transition-all border ${
                                            isAlert
                                                ? 'bg-red-950/20 border-red-500/30'
                                                : isActive
                                                    ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
                                                    : 'bg-white/[0.01] border-white/5 opacity-60'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-1.5">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-semibold text-zinc-100 truncate font-label">
                                                        {agent.name}
                                                    </span>
                                                    {isAlert && <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />}
                                                </div>
                                                <span className="text-xs text-zinc-400 tracking-wider block font-data mt-0.5">
                                                    {agent.role}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => toggleAgent(agent.id)}
                                                className={`p-1 rounded-md ml-1.5 transition-colors shrink-0 cursor-pointer ${
                                                    isActive
                                                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                        : 'bg-white/10 text-zinc-400 hover:bg-white/20'
                                                }`}
                                            >
                                                {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                            </button>
                                        </div>
                                        <div className="text-xs text-zinc-300 line-clamp-1 bg-black/40 px-2 py-1 rounded-md font-data border border-white/5">
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
                        <div className="space-y-1.5 font-data text-xs leading-relaxed">
                            {logs.map((log) => (
                                <div key={log.id} className="flex gap-2">
                                    <span className="text-zinc-500 select-none font-mono">[{log.time}]</span>
                                    <span className={
                                        log.type === 'success'
                                            ? 'text-emerald-400'
                                            : log.type === 'warn'
                                                ? 'text-amber-400 font-semibold'
                                                : 'text-zinc-300'
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
