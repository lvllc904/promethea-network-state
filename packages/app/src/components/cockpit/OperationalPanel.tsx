'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Terminal, Play, Pause, AlertTriangle, Activity, CheckCircle, Network } from 'lucide-react';
import { useHUD } from '@/lib/hud-store';

interface Agent {
    id: string;
    name: string;
    role: string;
    status: 'ACTIVE' | 'IDLE' | 'ALERT';
    currentTask: string;
}

export function OperationalPanel() {
    const { isPhosphorMode } = useHUD();
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
        <div className="w-64 h-[calc(100vh-7.5rem)] flex flex-col gap-2 z-40 relative pointer-events-auto overflow-hidden">

            {/* AGENTS MODULE */}
            <div className="flex-1 bg-black/60 backdrop-blur-xl rounded-xl p-2.5 flex flex-col overflow-hidden" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)' }}>
                <div className="flex items-center justify-between pb-1.5 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-1.5">
                        <Cpu className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-400 font-label">
                            Sovereign Agents
                        </span>
                    </div>
                    <span className="text-[7px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 tracking-wider font-data">
                        {agents.filter(a => a.status === 'ACTIVE').length} ONLINE
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-0.5 space-y-1.5">
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
            </div>

            {/* LIVE CONSOLE LOGS */}
            <div className="h-48 bg-black/60 backdrop-blur-xl rounded-xl p-2.5 flex flex-col overflow-hidden" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)' }}>
                <div className="flex items-center gap-1.5 pb-1.5 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <Terminal className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-400 font-label">
                        Operational Log
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 font-data text-[8px]">
                    {logs.map((log) => (
                        <div key={log.id} className="flex gap-1.5 leading-snug">
                            <span className="text-zinc-600 select-none shrink-0">[{log.time}]</span>
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
            </div>
        </div>
    );
}
