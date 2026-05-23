'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, BarChart3, Zap, TrendingUp, RefreshCw, ThumbsUp, ThumbsDown, ShieldCheck, Plus, Trash2, BrainCircuit } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

function useBFFData<T>(path: string, defaultValue: T): { data: T; refetch: () => void } {
    const [data, setData] = useState<T>(defaultValue);
    const fetchData = () => {
        fetch(path)
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d !== null) setData(d); })
            .catch(() => {});
    };
    useEffect(() => { fetchData(); }, [path]);
    return { data, refetch: fetchData };
}

const generateWalk = (start: number, vol: number, trend: number, count = 30) => {
    let v = start;
    return Array.from({ length: count }, () => {
        v = Math.max(0.1, v + (Math.random() - 0.5) * vol + trend);
        return { val: v };
    });
};

import { useHUD } from '@/lib/hud-store';
import { useRouter } from 'next/navigation';

export const EconomicsTray = () => {
    const { 
        activateFocusPanel, 
        triggerOmniScanner, 
        activateAssetCanvas,
        watchlists,
        activeWatchlistName,
        createWatchlist,
        deleteWatchlist,
        addTickerToWatchlist,
        removeTickerFromWatchlist,
        setActiveWatchlist,
        setHUDState 
    } = useHUD();
    const router = useRouter();
    
    const [newListName, setNewListName] = useState('');
    const [newTickerName, setNewTickerName] = useState('');

    const { data: intel } = useBFFData<any>('/api/intel', null);
    const { data: waterfall, refetch: refetchWaterfall } = useBFFData<any>('/api/waterfall', null);
    const { data: methods } = useBFFData<any[]>('/api/refineries', []);
    const { data: broker } = useBFFData<any>('/api/broker', null);
    const { data: assets, refetch: refetchAssets } = useBFFData<any[]>('/api/assets', []);
    const [activeSection, setActiveSection] = useState<'reserve' | 'watchlists' | 'treasury' | 'waterfall' | 'methods' | 'marketplace' | 'carry'>('watchlists');
    const [isSweeping, setIsSweeping] = useState(false);

    const [extraAssets, setExtraAssets] = useState<any[]>([]);
    const [valueOffset, setValueOffset] = useState<number>(0);

    useEffect(() => {
        const handleOmniUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail && detail.type === 'AUTO_UNDERWRITE') {
                const newAsset = {
                    id: 'econ-' + Date.now(),
                    title: detail.title,
                    description: detail.description || 'Dynamic underwriting asset claim.',
                    category: 'ENERGY_ZONE',
                    status: 'PENDING',
                    yesVotes: 12,
                    noVotes: 0
                };
                setExtraAssets(prev => [newAsset, ...prev]);
                setValueOffset(prev => prev + 1250000);
            }
        };
        window.addEventListener('sovereign-omni-update', handleOmniUpdate);
        return () => window.removeEventListener('sovereign-omni-update', handleOmniUpdate);
    }, []);

    const combinedAssets = [...extraAssets, ...assets];

    const uvtData = generateWalk(1.20, 0.05, 0.002);


    const handleSweep = async () => {
        setIsSweeping(true);
        try {
            await fetch('/api/engine/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method: 'trigger_waterfall_sweep', params: {} })
            });
            refetchWaterfall();
        } catch (e) { console.error(e); }
        finally { setIsSweeping(false); }
    };

    const handleVoteAsset = async (assetId: string, vote: 'yes' | 'no') => {
        await fetch(`/api/assets/${assetId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vote, citizenId: 'SOVEREIGN_USER' })
        }).then(() => refetchAssets()).catch(console.error);
    };

    const SECTIONS = [
        { id: 'reserve', label: 'Reserve' },
        { id: 'watchlists', label: 'Watchlists' },
        { id: 'treasury', label: 'Treasury' },
        { id: 'waterfall', label: 'Waterfall' },
    ] as const;

    return (
        <div className="space-y-4">
            {/* Section Switcher */}
            <div className="flex flex-wrap gap-1">
                {SECTIONS.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`flex-1 min-w-[60px] py-1.5 px-2 text-[9px] font-black uppercase tracking-widest rounded transition-all ${activeSection === s.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500 bg-black/20 border border-transparent hover:text-white'}`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* RESERVE */}
            {activeSection === 'reserve' && (
                <div className="space-y-3">
                    <div 
                        onClick={() => activateFocusPanel('FINANCIALS')}
                        className="p-4 bg-black/40 border border-white/5 rim-highlight-reality-sim rounded-lg hover:border-emerald-500/20 cursor-pointer transition-colors relative overflow-hidden"
                    >
                        {/* Reality Boundary Badge */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 text-[7px] font-black tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded animate-pulse">
                            <span className="w-1 h-1 rounded-full bg-amber-500" /> METABOLIC SIM
                        </div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Wallet className="w-3 h-3 text-emerald-400" /> Total Capital Account
                        </p>
                        <p className="text-3xl font-black font-mono text-white">${Number((intel?.totalValue || 1452000) + valueOffset).toLocaleString() || '0'}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {(['SOL', 'ETH', 'USD', 'USDC'] as const).map(s => (
                                <div key={s} className="p-2 bg-black rounded border border-white/5 relative">
                                    <p className="text-[8px] text-zinc-600 uppercase font-bold">{s}</p>
                                    <p className="text-sm font-mono text-white">{intel?.balances?.[s.toLowerCase()] || '0.00'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-3 bg-black/40 border border-white/5 rim-highlight-reality-sim rounded-lg relative">
                        <div className="absolute top-2 right-2 flex items-center gap-1 text-[7px] font-black tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded">
                            SIMULATED VELOCITY
                        </div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2">UVT Network Velocity</p>
                        <div className="h-16">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={uvtData}>
                                    <defs>
                                        <linearGradient id="uvtGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="val" stroke="#10b981" fill="url(#uvtGrad)" strokeWidth={1.5} dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Inflow', val: `$${intel?.totalInflow || '0'}`, color: 'text-emerald-400' },
                            { label: 'API Burn', val: `$${intel?.apiBurn || '0'}`, color: 'text-orange-400' },
                            { label: 'Sovereign ROI', val: `${intel?.roi || '1.0'}x`, color: 'text-cyan-400' },
                            { label: 'UVT Equity', val: intel?.uvtEquity || '0', color: 'text-white' },
                        ].map(i => (
                            <div key={i.label} className="p-2 bg-black/40 border border-white/5 rim-highlight-reality-sim rounded">
                                <p className="text-[8px] text-zinc-600 uppercase font-bold">{i.label}</p>
                                <p className={`text-sm font-mono font-bold ${i.color}`}>{i.val}</p>
                            </div>
                        ))}
                    </div>
                    {/* Broker Panel */}
                    {broker && (
                        <div 
                            onClick={() => activateFocusPanel('FINANCIALS')}
                            className="p-3 bg-black/40 border border-white/5 rim-highlight-reality-live rounded-lg hover:border-emerald-500/20 cursor-pointer transition-colors relative overflow-hidden"
                        >
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-[7px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded">
                                🟢 LIVE LEDGER
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><BarChart3 className="w-3 h-3" /> TradFi War Chest</p>
                                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded mr-16 ${broker.authenticated ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {broker.authenticated ? 'CONNECTED' : 'DISCONNECTED'}
                                </span>
                            </div>
                            <p className="text-2xl font-black font-mono text-white">
                                ${broker.netLiquidWorth?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '---'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* WATCHLISTS SECTION */}
            {activeSection === 'watchlists' && (
                <div className="space-y-3 font-mono">
                    {/* Watchlist Manager Panel */}
                    <div className="p-3 bg-black/40 border border-white/5 rim-highlight-reality-live rounded-lg space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <TrendingUp className="w-3 h-3 text-emerald-400" /> Active Watchlist
                            </p>
                            <span className="text-[7px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded animate-pulse">
                                DYNAMIC SUBSTRATE
                            </span>
                        </div>

                        {/* Watchlist Selector Dropdown */}
                        <div className="flex gap-2">
                            <select
                                value={activeWatchlistName}
                                onChange={(e) => setActiveWatchlist(e.target.value)}
                                className="flex-1 bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-emerald-500/40"
                            >
                                {watchlists.map(w => (
                                    <option key={w.name} value={w.name}>{w.name}</option>
                                ))}
                            </select>
                            {activeWatchlistName !== 'Default Watchlist' && (
                                <button
                                    onClick={() => deleteWatchlist(activeWatchlistName)}
                                    className="p-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-500/30 hover:border-red-500/60 text-red-400 rounded transition-colors flex items-center justify-center"
                                    title="Delete Watchlist"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Create Watchlist Input Form */}
                        <div className="flex gap-1.5">
                            <input
                                type="text"
                                placeholder="Create list (e.g. Blue Chips)..."
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { createWatchlist(newListName); setNewListName(''); } }}
                                className="flex-1 bg-black/50 border border-white/5 rounded px-2 py-1 text-[8.5px] text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/20"
                            />
                            <button
                                onClick={() => { createWatchlist(newListName); setNewListName(''); }}
                                className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase rounded transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> List
                            </button>
                        </div>
                    </div>

                    {/* Add Asset Form & Asset Lists */}
                    <div className="p-3 bg-black/40 border border-white/5 rim-highlight-reality-sim rounded-lg space-y-3">
                        <div className="flex justify-between items-center pb-1 border-b border-white/5">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Plus className="w-3 h-3 text-cyan-400" /> Add Asset to {activeWatchlistName}
                            </p>
                        </div>

                        {/* Add Ticker Input */}
                        <div className="flex gap-1.5">
                            <input
                                type="text"
                                placeholder="Add ticker (e.g. SOL, AAPL, COIN)..."
                                value={newTickerName}
                                onChange={(e) => setNewTickerName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { addTickerToWatchlist(activeWatchlistName, newTickerName); setNewTickerName(''); } }}
                                className="flex-1 bg-black/50 border border-white/5 rounded px-2 py-1 text-[8.5px] text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/20"
                            />
                            <button
                                onClick={() => { addTickerToWatchlist(activeWatchlistName, newTickerName); setNewTickerName(''); }}
                                className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-[8px] font-bold uppercase rounded transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Ticker
                            </button>
                        </div>

                        {/* List of Tickers */}
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {(() => {
                                const currentList = watchlists.find(w => w.name === activeWatchlistName);
                                if (!currentList || currentList.tickers.length === 0) {
                                    return (
                                        <p className="py-6 text-center text-[8.5px] text-zinc-600 uppercase font-black tracking-widest animate-pulse">
                                            No assets in this watchlist
                                        </p>
                                    );
                                }
                                return currentList.tickers.map((ticker) => {
                                    return (
                                        <div 
                                            key={ticker} 
                                            onClick={() => activateAssetCanvas(ticker)}
                                            className="flex justify-between items-center p-2.5 bg-white/5 hover:bg-cyan-500/5 border border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer rounded group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-black text-white">{ticker}</span>
                                                <span className="text-[7px] text-zinc-600 font-mono hidden group-hover:inline">
                                                    CLICK TO CHART
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                {/* Evaluate Button */}
                                                <button
                                                    onClick={() => setHUDState({ 
                                                        pendingCoPilotPrompt: `Evaluate asset constitutional and metabolic health: ${ticker}`,
                                                        activeFocusPanel: null // Close other overlays
                                                    })}
                                                    className="p-1 bg-cyan-950/20 hover:bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 rounded transition-colors flex items-center gap-1 text-[7.5px] font-bold uppercase tracking-wider px-1.5"
                                                    title={`Evaluate ${ticker}`}
                                                >
                                                    <BrainCircuit className="w-3 h-3 text-cyan-400" />
                                                    <span>EVAL</span>
                                                </button>
                                                
                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => removeTickerFromWatchlist(activeWatchlistName, ticker)}
                                                    className="p-1 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-colors"
                                                    title="Remove Asset"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            )}


            {/* METHODS */}
            {activeSection === 'methods' && (
                <div className="space-y-2">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><Zap className="w-3 h-3 text-emerald-400" /> Economic Methods</p>
                    {methods.length === 0 ? (
                        <p className="py-8 text-center text-[9px] text-zinc-700 uppercase font-bold animate-pulse">Loading methods...</p>
                    ) : methods.map((m: any) => {
                        const isLive = m.id === 'seo-blog' || m.config?.conservationTier === 'ZERO_COST';
                        const realityClass = isLive ? 'rim-highlight-reality-live' : 'rim-highlight-reality-sim';
                        const badgeColor = isLive ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10' : 'text-amber-500 border-amber-500/25 bg-amber-500/10 animate-pulse';
                        const badgeText = isLive ? '🟢 LIVE LEDGER' : '🟡 METABOLIC SIM';
                        const statusDotColor = isLive ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]';

                        return (
                            <div 
                                key={m.id} 
                                onClick={() => activateFocusPanel('CLI_GUIDE')}
                                className={`p-3 bg-black/40 border rounded-lg hover:border-emerald-500/20 cursor-pointer transition-colors relative overflow-hidden ${realityClass}`}
                            >
                                {/* Reality Badge */}
                                <div className={`absolute top-2 right-2 flex items-center gap-1 text-[7px] font-black tracking-widest border px-1.5 py-0.5 rounded ${badgeColor}`}>
                                    {badgeText}
                                </div>
                                <div className="flex justify-between items-start mb-2 mr-24">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
                                        <span className="text-[10px] font-bold text-white uppercase">{m.name}</span>
                                    </div>
                                    <span className="text-[8px] font-mono text-zinc-600">{m.roi || '1.2'}x ROI</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${isLive ? 'bg-emerald-500/60' : 'bg-amber-500/60'}`} style={{ width: '94%' }} />
                                </div>
                                <div className="flex justify-between mt-2 text-[8px] font-mono text-zinc-600">
                                    <span>Profit: ${m.totalProfit || '0'}</span>
                                    <span>Runs: {m.executionCount || 0}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* WATERFALL */}
            {activeSection === 'waterfall' && (
                <div className="space-y-3">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-emerald-400" /> Protocol Distribution Matrix</p>
                    {[
                        { label: 'Micro-Toll Protocol', val: '0.15%', target: 'METABOLIC', reality: 'SIMULATED' },
                        { label: 'Investor Hurdle Hurdle', val: '8.0%', target: 'SENIOR', reality: 'SIMULATED' },
                        { label: 'Sovereign Plowback', val: '30%', target: 'RESERVE', reality: 'SIMULATED' },
                        { label: 'Labor Allocation', val: '40%', target: 'UVT/SOL', reality: 'SIMULATED' },
                    ].map(p => (
                        <div key={p.label} className="flex items-center justify-between p-2.5 bg-black/40 border border-white/5 rim-highlight-reality-sim rounded relative">
                            <span className="text-[9px] text-zinc-400 uppercase font-bold">{p.label}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-white">{p.val}</span>
                                <span className="text-[8px] font-mono text-zinc-600">{p.target}</span>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={handleSweep}
                        disabled={isSweeping}
                        className="w-full py-2.5 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3 h-3 ${isSweeping ? 'animate-spin' : ''}`} />
                        {isSweeping ? 'Sweeping...' : 'Trigger Manual Sweep'}
                    </button>
                    {/* Audit Ledger */}
                    {intel?.transactions && (
                        <div className="space-y-1">
                            <p className="text-[9px] text-zinc-600 uppercase font-bold">Audit Ledger</p>
                            {intel.transactions.slice(0, 5).map((tx: any) => (
                                <div key={tx.id} className="flex justify-between py-2 border-b border-white/5 rim-highlight-reality-live text-[9px] relative">
                                    <span className="font-bold text-zinc-400 uppercase">{tx.method}</span>
                                    <span className="font-mono font-bold text-emerald-400">{tx.amount}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MARKETPLACE */}
            {activeSection === 'marketplace' && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">ASGI Originations</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push('/dashboard/assets')}
                                className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase rounded transition-colors"
                            >
                                Marketplace
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/syndicate/new')}
                                className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-[8px] font-bold uppercase rounded transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Syndicate
                            </button>
                        </div>
                    </div>
                    {combinedAssets.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest animate-pulse">Promethea is synthesizing the Omni-Lake...</p>
                        </div>
                    ) : combinedAssets.map((a: any) => (
                        <div 
                            key={a.id} 
                            onClick={() => router.push('/dashboard/assets')}
                            className="p-3 bg-black/40 border rim-highlight-reality-ai rounded-lg hover:border-emerald-500/20 cursor-pointer transition-colors relative overflow-hidden"
                        >
                            {/* AI Concert Reality Badge */}
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-[7px] font-black tracking-widest text-cyan-400 border border-cyan-500/25 bg-cyan-500/10 px-1.5 py-0.5 rounded animate-pulse">
                                <span className="w-1 h-1 rounded-full bg-cyan-500" /> AI CONCERT
                            </div>
                            <div className="flex justify-between items-start mb-2 mr-20">
                                <span className="text-[8px] font-mono text-cyan-400 uppercase">{a.category || a.type || 'ASSET'}</span>
                                <span className="text-[8px] text-zinc-600 uppercase">{a.status || 'PENDING'}</span>
                            </div>
                            <p className="text-[11px] font-bold text-white uppercase mb-1">{a.title || 'Sovereign Asset'}</p>
                            <p className="text-[9px] text-zinc-500 mb-3 leading-relaxed">{a.description}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleVoteAsset(a.id, 'yes'); }} 
                                        className="flex items-center gap-1 hover:text-emerald-400 transition-colors text-zinc-500"
                                    >
                                        <ThumbsUp className="w-3 h-3" /><span className="text-[8px] font-mono">{a.yesVotes || 0}</span>
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleVoteAsset(a.id, 'no'); }} 
                                        className="flex items-center gap-1 hover:text-red-400 transition-colors text-zinc-500"
                                    >
                                        <ThumbsDown className="w-3 h-3" /><span className="text-[8px] font-mono">{a.noVotes || 0}</span>
                                    </button>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); router.push('/dashboard/assets'); }}
                                    className="px-3 py-1.5 bg-cyan-900/30 border border-cyan-500/30 hover:bg-cyan-600 text-[8px] font-black uppercase text-cyan-100 hover:text-black rounded transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                >
                                    Fund & Execute →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CARRY */}
            {activeSection === 'carry' && (
                <div className="space-y-3">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Carry Trade Funnel</p>
                    <div className="p-3 bg-black/40 border rim-highlight-reality-sim rounded-lg relative overflow-hidden">
                        <div className="absolute top-2 right-2 flex items-center gap-1 text-[7px] font-black tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded animate-pulse">
                            <span className="w-1 h-1 rounded-full bg-amber-500" /> METABOLIC SIM
                        </div>
                        <p className="text-[8px] text-zinc-500 uppercase font-bold mb-1">Active Synthesis</p>
                        <p className="text-base font-black text-white uppercase">CHF → BRL Yield Arb</p>
                        <p className="text-[9px] text-zinc-500 mt-1 mb-3">12.5% differential between legacy accommodative funding and commodity-backed targets.</p>
                        <div className="flex gap-2">
                            <span className="text-[8px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded uppercase">Net Yield: 14.2%</span>
                            <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">Delta Neutral</span>
                        </div>
                    </div>
                    {[
                        { name: 'CHF/BRL Arb', stage: 'TIER 4: REFLEXIVITY', liq: '$500M', vol: '0.12', color: 'text-emerald-400' },
                        { name: 'jJPY/UVT LP', stage: 'TIER 3: DEPTH', liq: '$12M', vol: '0.25', color: 'text-cyan-400' },
                        { name: 'Gold/USDC Delta', stage: 'TIER 2: VOLATILITY', liq: '$1.2B', vol: '0.08', color: 'text-purple-400' },
                    ].map(o => (
                        <div key={o.name} className="flex items-center justify-between p-2.5 bg-black/40 border border-white/5 rim-highlight-reality-sim rounded hover:border-white/10 transition-colors relative">
                            <div>
                                <p className={`text-[10px] font-bold uppercase ${o.color}`}>{o.name}</p>
                                <p className="text-[8px] text-zinc-600 font-mono">{o.stage}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-mono text-zinc-400">{o.liq}</p>
                                <p className="text-[8px] font-mono text-zinc-600">Vol: {o.vol}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
