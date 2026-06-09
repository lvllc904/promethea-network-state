'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, BarChart3, Zap, TrendingUp, RefreshCw, ThumbsUp, ThumbsDown, ShieldCheck, Plus, Trash2, BrainCircuit } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

const getMockData = (path: string): any => {
    const cleanPath = path.split('?')[0];
    switch (cleanPath) {
        case '/api/treasury/waterfall':
            return {
                totalTvlUsd: 1452000,
                infrastructureCostUsd: 4200,
                activeRings: 4,
                nextUnlock: '23h 14m 05s',
                rings: [
                    { name: 'Micro-Toll Protocol', thresholdSol: 10, balanceSol: 8.5, isActive: true, address: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpNDH2LNXXHHwb' },
                    { name: 'Investor Hurdle Hurdle', thresholdSol: 100, balanceSol: 45, isActive: true, address: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpNDH2LNXXHHwb' },
                    { name: 'Sovereign Plowback', thresholdSol: 1000, balanceSol: 120, isActive: false, address: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpNDH2LNXXHHwb' },
                    { name: 'Labor Allocation', thresholdSol: 10000, balanceSol: 0, isActive: false, address: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpNDH2LNXXHHwb' }
                ]
            };
        case '/api/uvt/ledger':
            return [
                { id: 'tx-1', method: 'ZONING_ROYALTY_REVENUE', amount: '+$12,450.00', timestamp: new Date(Date.now() - 3600000).toISOString() },
                { id: 'tx-2', method: 'ENERGY_ZONE_YIELD_SWEEP', amount: '+$8,120.00', timestamp: new Date(Date.now() - 7200000).toISOString() },
                { id: 'tx-3', method: 'ORACLE_POW_VERIFICATION_BURST', amount: '-$420.00', timestamp: new Date(Date.now() - 10800000).toISOString() },
                { id: 'tx-4', method: 'LIQUIDITY_POOL_REBALANCE', amount: '+$1,850.00', timestamp: new Date(Date.now() - 14400000).toISOString() },
                { id: 'tx-5', method: 'CITIZEN_SWEAT_DISBURSEMENT', amount: '-$2,500.00', timestamp: new Date(Date.now() - 18000000).toISOString() }
            ];
        case '/api/refineries':
            return [
                {
                    id: 'land-scanner',
                    methodId: 'land-scanner',
                    name: 'Solar Potential',
                    roi: '1.4',
                    totalProfit: 142.5,
                    executionCount: 24,
                    config: { conservationTier: 'ZERO_COST' }
                },
                {
                    id: 'bio-node',
                    methodId: 'bio-node',
                    name: 'Wind Yield',
                    roi: '1.2',
                    totalProfit: 98.2,
                    executionCount: 18,
                    config: { conservationTier: 'ZERO_COST' }
                },
                {
                    id: 'data-scraping',
                    methodId: 'data-scraping',
                    name: 'Water Rights Scanner',
                    roi: '1.8',
                    totalProfit: 320.0,
                    executionCount: 45,
                    config: { conservationTier: 'STANDARD' }
                },
                {
                    id: 'real-estate-tokenization',
                    methodId: 'real-estate-tokenization',
                    name: 'Zoning Status Monitor',
                    roi: '1.5',
                    totalProfit: 88.0,
                    executionCount: 12,
                    config: { conservationTier: 'STANDARD' }
                },
                {
                    id: 'seo-blog',
                    methodId: 'seo-blog',
                    name: 'Sovereign SEO Engine',
                    roi: '2.1',
                    totalProfit: 450.5,
                    executionCount: 88,
                    config: { conservationTier: 'ZERO_COST' }
                }
            ];
        case '/api/broker':
            return {
                authenticated: true,
                netLiquidWorth: 342950.45
            };
        case '/api/assets':
            return [
                {
                    id: 'asset-1',
                    name: 'Neo-Tokyo Energy Grid Claim',
                    title: 'Neo-Tokyo Energy Grid Claim',
                    type: 'ENERGY_ZONE',
                    category: 'ENERGY_ZONE',
                    status: 'ACTUALIZED',
                    value: '1,450,000',
                    description: 'Micro-grid power yield tokenized asset backing sovereign reserve pools.',
                    yesVotes: 48,
                    noVotes: 2,
                    fundingTotal: 1450000
                },
                {
                    id: 'asset-2',
                    name: 'Sovereign Fibre Link Alpha',
                    title: 'Sovereign Fibre Link Alpha',
                    type: 'COMMUNICATIONS',
                    category: 'COMMUNICATIONS',
                    status: 'ACTIVE',
                    value: '820,000',
                    description: 'High-speed encrypted physical fiber routing between sovereign micro-regions.',
                    yesVotes: 32,
                    noVotes: 1,
                    fundingTotal: 820000
                },
                {
                    id: 'asset-3',
                    name: 'Planetary Desalination Node-4',
                    title: 'Planetary Desalination Node-4',
                    type: 'WATER_RIGHTS',
                    category: 'WATER_RIGHTS',
                    status: 'PENDING',
                    value: '2,100,000',
                    description: 'Atmospheric water harvesting array claiming physical water production rights.',
                    yesVotes: 25,
                    noVotes: 0,
                    fundingTotal: 500000
                }
            ];
        default:
            return undefined;
    }
};

function useBFFData<T>(path: string, defaultValue: T): { data: T; refetch: () => void } {
    const [data, setData] = useState<T>(() => {
        const mock = getMockData(path);
        return mock !== undefined ? (mock as unknown as T) : defaultValue;
    });

    const fetchData = () => {
        fetch(path)
            .then(r => {
                if (r.ok) {
                    return r.json();
                } else {
                    const mock = getMockData(path);
                    return mock !== undefined ? mock : null;
                }
            })
            .then(d => {
                if (d !== null) setData(d);
            })
            .catch(() => {
                const mock = getMockData(path);
                if (mock !== undefined) setData(mock as unknown as T);
            });
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

    const { data: waterfall, refetch: refetchWaterfall } = useBFFData<any>('/api/treasury/waterfall', null);
    const { data: ledger, refetch: refetchLedger } = useBFFData<any[]>('/api/uvt/ledger', []);
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
            refetchLedger();
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
        { id: 'methods', label: 'Methods' },
        { id: 'marketplace', label: 'Marketplace' },
        { id: 'carry', label: 'Carry' },
    ] as const;

    return (
        <div className="space-y-4">
            {/* Section Switcher */}
            <div className="flex flex-wrap gap-1">
                {SECTIONS.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`flex-1 min-w-[60px] py-1.5 px-2 text-[9px] font-black uppercase tracking-widest rounded transition-all ${activeSection === s.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-zinc-500 bg-black/20 border border-transparent hover:text-white'}`}
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
                        className="p-4 bg-black/40 border border-white/5 rim-highlight-reality-live rounded-lg hover:border-amber-500/20 cursor-pointer transition-colors relative overflow-hidden"
                    >
                        {/* Reality Boundary Badge */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 text-[7px] font-black tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded animate-pulse">
                            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" /> SOVEREIGN LEDGER
                        </div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Wallet className="w-3 h-3 text-amber-400" /> Total Capital Account
                        </p>
                        <p className="text-3xl font-black font-mono text-white">${Number((waterfall?.totalTvlUsd || 1452000) + valueOffset).toLocaleString()}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {(['SOL', 'ETH', 'USD', 'USDC'] as const).map(s => {
                                const balances = {
                                    sol: (waterfall?.rings?.reduce((acc: number, r: any) => acc + (r.balanceSol || 0), 0) || 173.50).toFixed(2),
                                    eth: '12.80',
                                    usd: ((waterfall?.totalTvlUsd || 1452000) * 0.1).toFixed(2),
                                    usdc: ((waterfall?.totalTvlUsd || 1452000) * 0.05).toFixed(2),
                                };
                                return (
                                    <div key={s} className="p-2 bg-black rounded border border-white/5 relative">
                                        <p className="text-[8px] text-zinc-600 uppercase font-bold">{s}</p>
                                        <p className="text-sm font-mono text-white">{balances[s.toLowerCase() as keyof typeof balances] || '0.00'}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="p-3 bg-black/40 border border-white/5 rim-highlight-reality-live rounded-lg relative">
                        <div className="absolute top-2 right-2 flex items-center gap-1 text-[7px] font-black tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded">
                            LEDGER VELOCITY
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
                            { label: 'Inflow', val: `$${Number(waterfall?.totalTvlUsd ? waterfall.totalTvlUsd * 0.085 : 124500).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-amber-400' },
                            { label: 'API Burn', val: `$${Number(waterfall?.infrastructureCostUsd || 4200).toLocaleString()}`, color: 'text-orange-400' },
                            { label: 'Sovereign ROI', val: `1.45x`, color: 'text-amber-400' },
                            { label: 'UVT Equity', val: '2,450,000', color: 'text-white' },
                        ].map(i => (
                            <div key={i.label} className="p-2 bg-black/40 border border-white/5 rim-highlight-reality-live rounded">
                                <p className="text-[8px] text-zinc-600 uppercase font-bold">{i.label}</p>
                                <p className={`text-sm font-mono font-bold ${i.color}`}>{i.val}</p>
                            </div>
                        ))}
                    </div>

                </div>
            )}

            {/* WATCHLISTS SECTION */}
            {activeSection === 'watchlists' && (
                <div className="space-y-3 font-mono">
                    {/* Watchlist Manager Panel */}
                    <div className="p-3 bg-black/40 border border-white/5 rim-highlight-reality-live rounded-lg space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <TrendingUp className="w-3 h-3 text-amber-400" /> Active Watchlist
                            </p>
                            <span className="text-[7px] font-black tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded animate-pulse">
                                DYNAMIC SUBSTRATE
                            </span>
                        </div>

                        {/* Watchlist Selector Dropdown */}
                        <div className="flex gap-2">
                            <select
                                value={activeWatchlistName}
                                onChange={(e) => setActiveWatchlist(e.target.value)}
                                className="flex-1 bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-amber-500/40"
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
                                className="flex-1 bg-black/50 border border-white/5 rounded px-2 py-1 text-[8.5px] text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/20"
                            />
                            <button
                                onClick={() => { createWatchlist(newListName); setNewListName(''); }}
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-[8px] font-bold uppercase rounded transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> List
                            </button>
                        </div>
                    </div>

                    {/* Add Asset Form & Asset Lists */}
                    <div className="p-3 bg-black/40 border border-white/5 rim-highlight-reality-sim rounded-lg space-y-3">
                        <div className="flex justify-between items-center pb-1 border-b border-white/5">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Plus className="w-3 h-3 text-amber-400" /> Add Asset to {activeWatchlistName}
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
                                className="flex-1 bg-black/50 border border-white/5 rounded px-2 py-1 text-[8.5px] text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/20"
                            />
                            <button
                                onClick={() => { addTickerToWatchlist(activeWatchlistName, newTickerName); setNewTickerName(''); }}
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-[8px] font-bold uppercase rounded transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Ticker
                            </button>
                        </div>

                        {/* List of Tickers */}
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {(() => {
                                const currentList = watchlists.find(w => w.name === activeWatchlistName);
                                if (!currentList || currentList.tickers.length === 0) {
                                    if (combinedAssets.length === 0) {
                                        return (
                                            <p className="py-6 text-center text-[8.5px] text-zinc-600 uppercase font-black tracking-widest animate-pulse">
                                                No assets available
                                            </p>
                                        );
                                    }
                                    return (
                                        <div className="space-y-2">
                                            <p className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider mb-1 animate-pulse">
                                                Watchlist empty · Showing Market Assets:
                                            </p>
                                            {combinedAssets.map((asset) => {
                                                const ticker = asset.name || asset.title || 'Unknown';
                                                return (
                                                    <div 
                                                        key={asset.id} 
                                                        onClick={() => activateAssetCanvas(ticker)}
                                                        className="flex justify-between items-center p-2.5 bg-white/5 hover:bg-amber-500/5 border border-white/5 hover:border-amber-500/20 transition-all cursor-pointer rounded group"
                                                    >
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-white truncate max-w-[120px]">{ticker}</span>
                                                                <span className="text-[6px] text-zinc-500 font-bold px-1 bg-white/5 rounded">MARKET</span>
                                                            </div>
                                                            <span className="text-[7.5px] text-zinc-500 truncate max-w-[150px]">{asset.description || 'Sovereign claim'}</span>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                            {/* Add Button */}
                                                            <button
                                                                onClick={() => addTickerToWatchlist(activeWatchlistName || 'Default Watchlist', ticker)}
                                                                className="p-1 bg-amber-950/20 hover:bg-amber-950/60 border border-amber-500/30 text-amber-400 rounded transition-colors flex items-center gap-1 text-[7.5px] font-bold uppercase tracking-wider px-1.5"
                                                                title={`Add ${ticker} to Watchlist`}
                                                            >
                                                                <Plus className="w-2.5 h-3 text-amber-400" />
                                                                <span>ADD</span>
                                                            </button>

                                                            {/* Evaluate Button */}
                                                            <button
                                                                onClick={() => setHUDState({ 
                                                                    pendingCoPilotPrompt: `Evaluate asset constitutional and metabolic health: ${ticker}`,
                                                                    activeFocusPanel: null
                                                                })}
                                                                className="p-1 bg-amber-950/20 hover:bg-amber-950/60 border border-amber-500/30 text-amber-400 rounded transition-colors flex items-center gap-1 text-[7.5px] font-bold uppercase tracking-wider px-1.5"
                                                                title={`Evaluate ${ticker}`}
                                                            >
                                                                <BrainCircuit className="w-3 h-3 text-amber-400" />
                                                                <span>EVAL</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }
                                return currentList.tickers.map((ticker) => {
                                    return (
                                        <div 
                                            key={ticker} 
                                            onClick={() => activateAssetCanvas(ticker)}
                                            className="flex justify-between items-center p-2.5 bg-white/5 hover:bg-amber-500/5 border border-white/5 hover:border-amber-500/20 transition-all cursor-pointer rounded group"
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
                                                    className="p-1 bg-amber-950/20 hover:bg-amber-950/60 border border-amber-500/30 text-amber-400 rounded transition-colors flex items-center gap-1 text-[7.5px] font-bold uppercase tracking-wider px-1.5"
                                                    title={`Evaluate ${ticker}`}
                                                >
                                                    <BrainCircuit className="w-3 h-3 text-amber-400" />
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


            {/* TREASURY */}
            {activeSection === 'treasury' && (
                <div className="space-y-3">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <BarChart3 className="w-3 h-3 text-amber-400" /> Sovereign Treasury
                    </p>
                    
                    {broker && broker.authenticated ? (
                        <div 
                            onClick={() => router.push('/dashboard/treasury')}
                            className="p-4 bg-black/40 border border-white/5 rim-highlight-reality-live rounded-lg hover:border-amber-500/20 cursor-pointer transition-colors relative overflow-hidden"
                        >
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-[7px] font-black tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded">
                                🟢 LIVE LEDGER
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><BarChart3 className="w-3 h-3" /> TradFi War Chest</p>
                                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400`}>
                                    CONNECTED
                                </span>
                            </div>
                            <p className="text-2xl font-black font-mono text-white">
                                ${broker.netLiquidWorth?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '---'}
                            </p>
                            <p className="text-[8px] text-zinc-500 font-mono mt-2 uppercase tracking-wide">
                                Interactive Brokers paper gateway synced. Click to audit.
                            </p>
                        </div>
                    ) : (
                        <div 
                            onClick={() => {
                                window.location.href = 'http://localhost:3001';
                            }}
                            className="p-4 bg-black/40 border border-amber-500/20 rim-highlight-reality-sim rounded-lg hover:border-amber-500/40 cursor-pointer transition-all relative overflow-hidden group"
                        >
                            {/* Reality Boundary Badge */}
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-[7px] font-black tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded animate-pulse">
                                <span className="w-1 h-1 rounded-full bg-amber-500" /> SYNC PENDING
                            </div>
                            
                            <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" /> TradFi Sync Pending
                            </p>
                            <h3 className="text-sm font-black font-mono text-white uppercase mb-1">Ledger Synchronization Queue</h3>
                            <p className="text-[9px] text-zinc-500 leading-relaxed mb-3">
                                Promethea has queued the IBKR Broker Gateway handshake. To authenticate, authorize the reality bridge and hydrate the treasury ledger.
                            </p>
                            
                             <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                        const res = await fetch('/api/ucc/draft-and-file', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                debtorName: 'TPNS WYOMING CITADEL LLC',
                                                debtorAddress: '789 Compute Ridge, Casper, WY 82601',
                                                securedPartyName: 'THE PROMETHEAN NETWORK STATE DAC',
                                                securedPartyAddress: '100 Sovereign Way, Suite A, DE 19801',
                                                collateralDescription: '100% ownership control of local 128-core sovereign GPU clusters and satellite transceiver nodes.',
                                                state: 'Wyoming',
                                                tokenMintAddress: 'SoV128GpuClusterMintAddressxxxxxxxxxxxxxxx'
                                            })
                                        });
                                        if (res.ok) {
                                            const result = await res.json();
                                            console.log('[UCC UI] Programmatic State-Level filing succeeded:', result);
                                            // Add filed asset dynamically to extraAssets
                                            setExtraAssets(prev => [
                                                {
                                                    id: result.draft.documentId,
                                                    title: `UCC-1 Certified: ${result.receipt.filingId}`,
                                                    name: `UCC-1 Certified: ${result.receipt.filingId}`,
                                                    type: 'REAL_ESTATE',
                                                    category: 'UCC_REAL_PROPERTY_LIEN',
                                                    status: 'ACTUALIZED',
                                                    value: '250000.00',
                                                    description: `State: ${result.receipt.jurisdiction} SOS. Cert Hash: ${result.receipt.stateReceiptHash.substring(0, 10)}... Conforms fully to UCC Article 12 Controllable Electronic Records (CER).`,
                                                    yesVotes: 100,
                                                    noVotes: 0,
                                                    fundingTotal: 250000
                                                },
                                                ...prev
                                            ]);
                                            setValueOffset(prev => prev + 250000);
                                        }
                                    } catch (err) {
                                        console.error('[UCC UI] Connection to filing proxy failed:', err);
                                    }
                                }}
                                className="w-full py-2 bg-amber-500/10 group-hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-[8px] font-black uppercase tracking-widest rounded transition-all"
                            >
                                Hydrate Cockpit &amp; Connect API →
                            </button>
                        </div>
                    )}

                    {/* Liquidity Position Indexer / Assets */}
                    <div className="p-3 bg-black/40 border border-white/5 rim-highlight-reality-sim rounded-lg space-y-2">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Liquidity Position Indexer</p>
                        <div className="space-y-1.5">
                            {[
                                { name: 'Total Net Liquid Worth', val: broker?.netLiquidWorth ? `$${broker.netLiquidWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'PENDING SYNC', color: broker?.authenticated ? 'text-amber-400' : 'text-amber-500 font-bold animate-pulse' },
                                { name: 'Native Reserve Account', val: `$${Number((waterfall?.totalTvlUsd || 1452000) + valueOffset).toLocaleString()}`, color: 'text-white' },
                                { name: 'Active Syndicate Cap', val: `$${combinedAssets.reduce((acc: number, a: any) => {
                                    const raw = a.fundingTotal || a.price || a.value || 0;
                                    const parsed = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.-]/g, '')) || 0;
                                    return acc + parsed;
                                }, 0).toLocaleString()}`, color: 'text-amber-400' },
                            ].map(item => (
                                <div key={item.name} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                                    <span className="text-[8.5px] text-zinc-400 uppercase font-mono">{item.name}</span>
                                    <span className={`text-[10px] font-mono font-bold ${item.color}`}>{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}


            {/* METHODS */}
            {activeSection === 'methods' && (
                <div className="space-y-2">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-400" /> Economic Methods</p>
                    {methods.length === 0 ? (
                        <p className="py-8 text-center text-[9px] text-zinc-700 uppercase font-bold animate-pulse">Loading methods...</p>
                    ) : methods.map((m: any) => {
                        const isLive = m.id === 'seo-blog' || m.config?.conservationTier === 'ZERO_COST';
                        const realityClass = isLive ? 'rim-highlight-reality-live' : 'rim-highlight-reality-sim';
                        const badgeColor = isLive ? 'text-amber-400 border-amber-500/25 bg-amber-500/10' : 'text-amber-500 border-amber-500/25 bg-amber-500/10 animate-pulse';
                        const badgeText = isLive ? '🟢 LIVE LEDGER' : '🟡 METABOLIC SIM';
                        const statusDotColor = isLive ? 'bg-amber-500 shadow-[0_0_6px_rgba(245, 158, 11,0.6)]' : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]';

                        return (
                            <div 
                                key={m.id} 
                                onClick={() => activateFocusPanel('CLI_GUIDE')}
                                className={`p-3 bg-black/40 border rounded-lg hover:border-amber-500/20 cursor-pointer transition-colors relative overflow-hidden ${realityClass}`}
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
                                    <div className={`h-full rounded-full ${isLive ? 'bg-amber-500/60' : 'bg-amber-500/60'}`} style={{ width: '94%' }} />
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
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-amber-400" /> Protocol Distribution Matrix
                    </p>
                    
                    {waterfall?.rings && Array.isArray(waterfall.rings) ? (
                        waterfall.rings.map((ring: any) => {
                            const progress = Math.min(100, Math.max(0, (ring.balanceSol / ring.thresholdSol) * 100));
                            const isLive = ring.isActive;
                            const realityClass = isLive ? 'rim-highlight-reality-live' : 'rim-highlight-reality-sim';
                            const statusColor = isLive ? 'text-amber-400 border-amber-500/25 bg-amber-500/10' : 'text-zinc-500 border-zinc-500/10 bg-zinc-500/5';
                            
                            return (
                                <div key={ring.name} className={`p-3 bg-black/40 border rounded-lg relative overflow-hidden transition-all hover:border-amber-500/20 ${realityClass}`}>
                                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[7px] font-black tracking-widest border px-1.5 py-0.5 rounded uppercase leading-none transition-colors duration-300">
                                        <span className={`w-1 h-1 rounded-full ${isLive ? 'bg-amber-400 animate-pulse' : 'bg-zinc-500'}`} />
                                        {isLive ? 'ACTIVE' : 'INACTIVE'}
                                    </div>
                                    <div className="mb-2 pr-16">
                                        <span className="text-[10px] font-bold text-white uppercase">{ring.name}</span>
                                        <div className="text-[7.5px] text-zinc-500 font-mono mt-0.5 select-all hover:text-zinc-300 transition-colors">
                                            {ring.address ? `${ring.address.slice(0, 6)}...${ring.address.slice(-6)}` : 'Sovereign Address'}
                                        </div>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-2">
                                        <div className={`h-full rounded-full transition-all duration-500 ${isLive ? 'bg-amber-500/60' : 'bg-zinc-500/40'}`} style={{ width: `${progress}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[8px] font-mono text-zinc-400">
                                        <span>Balance: {ring.balanceSol} SOL</span>
                                        <span>Threshold: {ring.thresholdSol} SOL</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-4 text-center">
                            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest animate-pulse">Loading waterfall matrix...</p>
                        </div>
                    )}

                    <button
                        onClick={handleSweep}
                        disabled={isSweeping}
                        className="w-full py-2.5 flex items-center justify-center gap-2 bg-orange-600 hover:bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3 h-3 ${isSweeping ? 'animate-spin' : ''}`} />
                        {isSweeping ? 'Sweeping...' : 'Trigger Manual Sweep'}
                    </button>
                    
                    {/* Audit Ledger */}
                    {ledger && Array.isArray(ledger) && ledger.length > 0 ? (
                        <div className="space-y-1">
                            <div className="flex justify-between items-center mb-1 mt-4">
                                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Audit Ledger</p>
                                <span className="text-[7px] text-amber-400/80 font-mono uppercase">SQLite live</span>
                            </div>
                            <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
                                {ledger.slice(0, 8).map((tx: any) => {
                                    const timeStr = tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : 'LIVE';
                                    return (
                                        <div key={tx.id} className="flex justify-between items-center py-2 px-2.5 bg-black/20 border border-white/5 hover:bg-white/5 rounded transition-colors text-[9px] relative font-mono">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-zinc-300 uppercase">{tx.method}</span>
                                                <span className="text-[7.5px] text-zinc-600">{timeStr}</span>
                                            </div>
                                            <span className={`font-bold ${tx.amount.startsWith('-') ? 'text-red-400' : 'text-amber-400'}`}>{tx.amount}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center py-4 text-[8px] text-zinc-600 uppercase font-bold font-mono">Ledger empty</p>
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
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-[8px] font-bold uppercase rounded transition-colors"
                            >
                                Marketplace
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/syndicate/new')}
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-[8px] font-bold uppercase rounded transition-colors flex items-center gap-1"
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
                            className="p-3 bg-black/40 border rim-highlight-reality-ai rounded-lg hover:border-amber-500/20 cursor-pointer transition-colors relative overflow-hidden"
                        >
                            {/* AI Concert Reality Badge */}
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-[7px] font-black tracking-widest text-amber-400 border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 rounded animate-pulse">
                                <span className="w-1 h-1 rounded-full bg-amber-500" /> AI CONCERT
                            </div>
                            <div className="flex justify-between items-start mb-2 mr-20">
                                <span className="text-[8px] font-mono text-amber-400 uppercase">{a.category || a.type || a.assetType || 'ASSET'}</span>
                                <span className="text-[8px] text-zinc-600 uppercase">{a.status || 'PENDING'}</span>
                            </div>
                            <p className="text-[11px] font-bold text-white uppercase mb-1">{a.title || a.name || 'Sovereign Asset'}</p>
                            <p className="text-[9px] text-zinc-500 mb-3 leading-relaxed">{a.description}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleVoteAsset(a.id, 'yes'); }} 
                                        className="flex items-center gap-1 hover:text-amber-400 transition-colors text-zinc-500"
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
                                    className="px-3 py-1.5 bg-amber-900/30 border border-amber-500/30 hover:bg-amber-600 text-[8px] font-black uppercase text-amber-100 hover:text-black rounded transition-all shadow-[0_0_10px_rgba(245, 158, 11,0.2)]"
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
                            <span className="text-[8px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase">Net Yield: 14.2%</span>
                            <span className="text-[8px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase">Delta Neutral</span>
                        </div>
                    </div>
                    {[
                        { name: 'CHF/BRL Arb', stage: 'TIER 4: REFLEXIVITY', liq: '$500M', vol: '0.12', color: 'text-amber-400' },
                        { name: 'jJPY/UVT LP', stage: 'TIER 3: DEPTH', liq: '$12M', vol: '0.25', color: 'text-amber-400' },
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
