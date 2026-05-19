'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Radio, Eye, TerminalSquare, Zap } from 'lucide-react';
import { useHUD } from '@/lib/hud-store';

export const NarrativeTray = () => {
    const { activatePillar } = useHUD();
    const [intelFeed, setIntelFeed] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [localFeed, setLocalFeed] = useState<any[]>([]);

    const fetchFeed = useCallback(async () => {
        try {
            const r = await fetch('/api/lake?type=NARRATIVE_SIGNAL,GOVERNANCE,VISIONARY&limit=8', { cache: 'no-store' });
            if (r.ok) {
                const d = await r.json();
                if (Array.isArray(d) && d.length > 0) { setIntelFeed(d); setIsLoading(false); return; }
            }
        } catch (_) {}
        setIsLoading(false);
    }, []);

    // On mount + refresh
    useEffect(() => { fetchFeed(); }, [fetchFeed]);

    // Seed from live API, fallback to mock
    useEffect(() => {
        if (intelFeed && intelFeed.length > 0) {
            setLocalFeed(intelFeed);
        } else if (!isLoading) {
            setLocalFeed([
                { id: 'log_1', type: 'SYNDICATE', timestamp: 'Just now', payload: { title: 'Promethea executed market alignment via Finnhub Oracle.' }, reality: 'SIMULATED' },
                { id: 'log_2', type: 'VETO', timestamp: '2m ago', payload: { title: 'Astro-Oracle flagged high-risk transaction 0x9f...4a. Liquidity diverted.' }, reality: 'ACTUALIZED' },
                { id: 'log_3', type: 'CONTENT', timestamp: '14m ago', payload: { title: 'New AV brief generated for Sector 4 Infrastructure.' }, reality: 'SIMULATED' },
                { id: 'log_4', type: 'SYSTEM', timestamp: '1h ago', payload: { title: 'Omni-Lake synchronization complete. 4,200 UVT indexed.' }, reality: 'ACTUALIZED' },
            ]);
        }
    }, [intelFeed, isLoading]);

    // Auto-refresh every 30s
    useEffect(() => {
        const interval = setInterval(() => fetchFeed(), 30000);
        return () => clearInterval(interval);
    }, [fetchFeed]);

    const typeColors: Record<string, string> = {
        SYNDICATE: 'text-cyan-400',
        VETO: 'text-red-400',
        CONTENT: 'text-purple-400',
        SYSTEM: 'text-zinc-400',
        GOVERNANCE: 'text-amber-400',
        VISIONARY: 'text-emerald-400',
        NARRATIVE_SIGNAL: 'text-purple-300',
    };

    return (
        <div className="space-y-6">
            {/* Master Intel Radio Header */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl relative overflow-hidden group">
                <div className="absolute right-2 top-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-black/50 rounded-full border border-purple-500/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest">Live</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <Radio className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-bold text-purple-100 uppercase tracking-widest">Intel Feed</h3>
                </div>
                <p className="text-xs text-purple-200/60 leading-relaxed">
                    Direct access to Promethea's cognitive stream, AI-generated content, and systemic narrative block creation.
                </p>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-zinc-600">{localFeed.length} signals indexed</span>
                    <button
                        onClick={() => activatePillar('PULSE')}
                        className="text-[9px] text-purple-400 hover:text-purple-200 transition-colors flex items-center gap-1"
                    >
                        Full Cockpit →
                    </button>
                </div>
            </div>

            {/* The Live Stream */}
            <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[1px] before:bg-purple-500/20">
                {localFeed.map((log: any) => {
                    const title = log.payload?.title || log.payload?.observation || log.content || 'Relaying sovereign signal...';
                    const time = log.timestamp || log.time || '...';
                    const type = log.type || 'SYSTEM';
                    const reality = log.reality || log.realityState || 'SIMULATED';
                    
                    return (
                        <div key={log.id} className="relative pl-8 group cursor-pointer">
                            <div className="absolute left-[8px] top-1.5 w-2 h-2 rounded-full bg-black border border-purple-500 group-hover:bg-purple-500 transition-colors" />
                            <div className="p-3 bg-white/5 border border-white/5 rounded-lg group-hover:border-purple-500/30 transition-colors">
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${typeColors[type] || 'text-zinc-400'}`}>{type}</span>
                                    <span className="text-[8px] font-mono text-zinc-500">{time}</span>
                                </div>
                                <p className="text-xs text-zinc-300 mb-2 leading-relaxed line-clamp-2">
                                    {title.substring(0, 120)}{title.length > 120 ? '...' : ''}
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${reality === 'ACTUALIZED' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                        {reality}
                                    </span>
                                    <div className="flex gap-2">
                                        <Eye className="w-3 h-3 text-zinc-600 group-hover:text-purple-400 transition-colors" />
                                        <TerminalSquare className="w-3 h-3 text-zinc-600 group-hover:text-purple-400 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Broadcast Action */}
            <button className="w-full py-2.5 flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-lg transition-all group">
                <Zap className="w-3 h-3 text-purple-400 group-hover:text-purple-200" />
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 group-hover:text-purple-200">Broadcast Narrative Block</span>
            </button>
        </div>
    );
};
