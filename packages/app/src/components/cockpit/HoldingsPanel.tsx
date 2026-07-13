'use client';

import React, { useState, useEffect } from 'react';
import { Coins, Activity, TrendingUp, ShieldCheck, Zap, ExternalLink, ArrowRight } from 'lucide-react';
import { useHUD } from '@/lib/hud-store';

export function HoldingsPanel() {
    const { globalVix } = useHUD();
    const [stats, setStats] = useState({
        totalTreasury: 142394.00,
        change24h: 2.41,
        mvsIndex: 0.894,
        nodesOnline: 3,
        entropy: 14.2,
        netYield: 14.20
    });

    // Simulate light ticks for live metrics
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                totalTreasury: prev.totalTreasury + (Math.random() - 0.5) * 1.5,
                entropy: parseFloat((prev.entropy + (Math.random() - 0.5) * 0.05).toFixed(2)),
                mvsIndex: parseFloat((prev.mvsIndex + (Math.random() - 0.5) * 0.001).toFixed(4))
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-64 h-[calc(100vh-7.5rem)] flex flex-col gap-2 z-40 relative pointer-events-auto overflow-hidden">

            {/* TREASURY MODULE */}
            <div className="bg-black/60 backdrop-blur-xl rounded-xl p-2.5 flex flex-col" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)' }}>
                <div className="flex items-center gap-1.5 pb-1.5 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <Coins className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-400 font-label">
                        Sovereign Treasury
                    </span>
                </div>

                <div className="bg-white/[0.02] p-2.5 rounded-lg mb-2 relative overflow-hidden group" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-emerald-500/10 transition-colors" />
                    <p className="text-[7px] text-zinc-500 uppercase tracking-[0.16em] mb-1 font-label">
                        Total Assets (USD Equiv.)
                    </p>
                    <div className="text-xl font-light text-white tracking-tight font-command">
                        ${stats.totalTreasury.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center gap-1 mt-1 font-data">
                        <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="text-[8px] text-emerald-400">+{stats.change24h}% THIS CYCLE</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 font-data text-[8px] mb-2">
                    <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                        <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">RWA Value</span>
                        <span className="text-zinc-200 font-semibold">$1,452,000</span>
                    </div>
                    <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                        <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">Net Yield</span>
                        <span className="text-emerald-400 font-semibold">{stats.netYield}%</span>
                    </div>
                </div>

                <a
                    href="/dashboard/treasury"
                    className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-data text-[8px] font-bold tracking-[0.14em] rounded-lg transition-all border border-emerald-500/20 hover:border-emerald-500/30 flex items-center justify-center gap-1"
                >
                    AUDIT LEDGER <ExternalLink className="w-2 h-2" />
                </a>
            </div>

            {/* TELEMETRY MODULE */}
            <div className="flex-1 bg-black/60 backdrop-blur-xl rounded-xl p-2.5 flex flex-col overflow-hidden" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)' }}>
                <div className="flex items-center gap-1.5 pb-1.5 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <Activity className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-400 font-label">
                        System Telemetry
                    </span>
                </div>

                <div className="space-y-3 flex-1">
                    {/* MVS Progress Bar */}
                    <div>
                        <div className="flex justify-between font-data text-[8px] mb-1">
                            <span className="text-zinc-400 uppercase tracking-wider">Sentience Index (MVS)</span>
                            <span className="text-amber-400 font-semibold">{stats.mvsIndex.toFixed(4)}</span>
                        </div>
                        <div className="w-full h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-500 shadow-[0_0_6px_#f59e0b]"
                                style={{ width: `${stats.mvsIndex * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Metric Grid */}
                    <div className="grid grid-cols-2 gap-1.5 font-data text-[8px]">
                        <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                            <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">Entropy Drag</span>
                            <span className="text-zinc-200 font-semibold">{stats.entropy} J/s</span>
                        </div>
                        <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                            <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">Active Nodes</span>
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping inline-block" />
                                {stats.nodesOnline} ONLINE
                            </span>
                        </div>
                    </div>

                    {/* Integrity Row */}
                    <div className="border-t border-white/[0.04] pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <span className="text-[7px] font-label uppercase tracking-[0.16em] text-zinc-500 block mb-1.5">System Integrity</span>
                        <div className="flex items-center gap-1.5 font-data text-[8px] text-zinc-400 bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>3-Body isolating protocol active and synced.</span>
                        </div>
                    </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className="mt-auto pt-2 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <button className="w-full py-1 px-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 font-data text-[8px] font-semibold tracking-[0.14em] uppercase transition-all flex items-center justify-between group" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                        <span>Initiate Vote</span>
                        <ArrowRight className="w-2.5 h-2.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    </button>
                    <button className="w-full py-1 px-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 font-data text-[8px] font-semibold tracking-[0.14em] uppercase transition-all flex items-center justify-between group" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                        <span>Propose Const. Delta</span>
                        <ArrowRight className="w-2.5 h-2.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    </button>
                </div>
            </div>
        </div>
    );
}
