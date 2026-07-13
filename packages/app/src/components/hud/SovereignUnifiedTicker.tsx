'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
    TrendingUp, 
    TrendingDown, 
    Users, 
    Scale, 
    Shield, 
    Activity, 
    Globe, 
    ChevronDown, 
    ChevronUp, 
    Clock, 
    DollarSign 
} from 'lucide-react';
import { useSolanaCitizen } from '@promethea/hooks';

interface TickerItem {
    label: string;
    value: string;
    change?: number; // percentage
    prefix?: string;
    icon?: React.ReactNode;
    reality?: 'LIVE' | 'CACHED' | 'SIMULATED' | 'AI' | 'M2M' | 'WARNING';
    status?: 'NOMINAL' | 'WARN' | 'CRITICAL';
}

const TickerItemComponent = ({ item }: { item: TickerItem }) => {
    const isPos = (item.change ?? 0) >= 0;

    // Handle reality styling from SovereignFooterTicker
    let valueColor = 'text-emerald-400';
    let labelColor = 'text-zinc-500';
    let iconColor = 'text-emerald-500/75';
    let glowClass = '';

    if (item.reality) {
        if (item.reality === 'LIVE') {
            valueColor = 'text-emerald-400 font-extrabold drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]';
        } else if (item.reality === 'CACHED') {
            valueColor = 'text-emerald-500/90';
        } else if (item.reality === 'SIMULATED') {
            valueColor = 'text-teal-400/90';
        } else if (item.reality === 'AI') {
            valueColor = 'text-indigo-400';
        } else if (item.reality === 'M2M') {
            valueColor = 'text-purple-400';
        } else if (item.reality === 'WARNING') {
            valueColor = 'text-rose-400 animate-pulse';
        }
        iconColor = valueColor;
    } else {
        // Standard financial ticker color values
        valueColor = 'text-emerald-400 font-black drop-shadow-[0_0_4px_rgba(52,211,153,0.25)]';
        labelColor = 'text-zinc-500';
    }

    return (
        <span className="inline-flex items-center gap-2 px-5 border-r border-white/5 shrink-0 transition-all duration-300">
            {item.icon && <span className={`${iconColor} opacity-80 shrink-0`}>{item.icon}</span>}
            <span className={`text-[8.5px] font-bold uppercase tracking-widest ${labelColor}`}>{item.label}</span>
            <span className={`text-[9.5px] font-mono tracking-wide ${valueColor}`}>
                {item.prefix ?? ''}{item.value}
            </span>
            {item.change !== undefined && (
                <span className={`flex items-center gap-0.5 text-[8px] font-bold font-mono ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPos ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                    {isPos ? '+' : ''}{item.change.toFixed(2)}%
                </span>
            )}
        </span>
    );
};

export function SovereignUnifiedTicker() {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [activeSyndicate, setActiveSyndicate] = useState<string>('global');
    const [time, setTime] = useState<string>('');
    const { solBalance } = useSolanaCitizen();

    // Financial ticker item state
    const [financialItems, setFinancialItems] = useState<TickerItem[]>([
        { label: 'UVT', value: '1.20', change: 0.42, prefix: '$' },
        { label: 'SOL', value: '184.20', change: 3.40, prefix: '$' },
        { label: 'Cit SOL', value: '0.0000', prefix: 'Ⓢ' },
        { label: 'BTC', value: '103,240', change: -0.18, prefix: '$' },
        { label: 'ETH', value: '3,820', change: 0.97, prefix: '$' },
        { label: 'GOLD', value: '2,650', change: 0.31, prefix: '$' },
        { label: 'Treasury', value: '0', change: 0, prefix: '$' },
        { label: 'Net Yield', value: '14.2', prefix: '' },
        { label: 'RWA Value', value: '1,452,000', change: 0, prefix: '$' },
    ]);

    // Status ticker item state
    const [statusItems, setStatusItems] = useState<TickerItem[]>([
        { icon: <Globe className="w-2.5 h-2.5" />, label: 'Network State', value: 'PROMETHEAN GENESIS', reality: 'LIVE' },
        { icon: <Users className="w-2.5 h-2.5" />, label: 'Active Citizens', value: '—', reality: 'LIVE' },
        { icon: <Scale className="w-2.5 h-2.5" />, label: 'Open Proposals', value: '0', reality: 'LIVE' },
        { icon: <Shield className="w-2.5 h-2.5" />, label: 'Defense Level', value: '4', reality: 'LIVE' },
        { icon: <Activity className="w-2.5 h-2.5" />, label: 'Substrate', value: 'NOMINAL', reality: 'LIVE' },
        { icon: <Activity className="w-2.5 h-2.5" />, label: 'Uptime', value: '98.4%', reality: 'SIMULATED' },
        { icon: <Globe className="w-2.5 h-2.5" />, label: 'Territory', value: '1,240 AC', reality: 'SIMULATED' },
        { icon: <Shield className="w-2.5 h-2.5" />, label: 'Immune Integrity', value: '94%', reality: 'SIMULATED' },
        { icon: <Scale className="w-2.5 h-2.5" />, label: 'UVT Epoch', value: 'GENESIS-5', reality: 'LIVE' },
        { icon: <Activity className="w-2.5 h-2.5" />, label: 'Atlas Sync', value: '3-BODY SYNCED', reality: 'LIVE' },
    ]);

    const sessionStartRef = useRef(Date.now());
    const baseUptimeRef = useRef(86400);
    const baseProposalsRef = useRef(2);
    const baseCitizensRef = useRef(0);

    // Initial setup from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedSyndicate = window.localStorage.getItem('activeSyndicate') || 'global';
            setActiveSyndicate(savedSyndicate);

            const savedCollapsed = window.localStorage.getItem('promethea-ticker-collapsed') === 'true';
            setIsCollapsed(savedCollapsed);
        }
    }, []);

    const handleSyndicateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setActiveSyndicate(val);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('activeSyndicate', val);
            const event = new CustomEvent('context-switch', { detail: { syndicateId: val } });
            window.dispatchEvent(event);
        }
    };

    const toggleCollapsed = () => {
        const nextState = !isCollapsed;
        setIsCollapsed(nextState);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('promethea-ticker-collapsed', String(nextState));
            // Trigger custom event so parent can adjust layout heights if needed
            window.dispatchEvent(new CustomEvent('ticker-collapsed-change', { detail: { isCollapsed: nextState } }));
        }
    };

    // SOL Balance hook mapping
    useEffect(() => {
        if (solBalance !== null) {
            setFinancialItems(prev => prev.map(item => {
                if (item.label === 'Cit SOL') return { ...item, value: solBalance.toFixed(4) };
                return item;
            }));
        }
    }, [solBalance]);

    // Financial Data Fetching and Polling
    useEffect(() => {
        const syndicateQuery = activeSyndicate !== 'global' ? `?syndicate_id=${activeSyndicate}` : '';
        
        const fetchFinancialData = async () => {
            try {
                const tickerRes = await fetch('/api/ticker');
                const tickerData = tickerRes.ok ? await tickerRes.json() : null;

                const intelRes = await fetch(`/api/intel${syndicateQuery}`);
                const intelData = intelRes.ok ? await intelRes.json() : null;

                setFinancialItems(prev => prev.map(item => {
                    let val = item.value;
                    let chg = item.change;

                    if (tickerData) {
                        if (item.label === 'BTC' && tickerData.bitcoin) {
                            val = Number(tickerData.bitcoin.usd).toLocaleString();
                            chg = tickerData.bitcoin.usd_24h_change;
                        } else if (item.label === 'ETH' && tickerData.ethereum) {
                            val = Number(tickerData.ethereum.usd).toLocaleString();
                            chg = tickerData.ethereum.usd_24h_change;
                        } else if (item.label === 'SOL' && tickerData.solana) {
                            val = Number(tickerData.solana.usd).toLocaleString();
                            chg = tickerData.solana.usd_24h_change;
                        }
                    }

                    if (intelData) {
                        if (item.label === 'Treasury') {
                            val = Number(intelData.totalValue || 0).toLocaleString();
                        } else if (item.label === 'RWA Value') {
                            val = Number(intelData.rwaValue || 1452000).toLocaleString();
                        }
                    }

                    return { ...item, value: val, change: chg };
                }));
            } catch (err) {
                console.warn('[UnifiedTicker] Financial fetch failed:', err);
            }
        };

        fetchFinancialData();
        const dataInterval = setInterval(fetchFinancialData, 10000);

        // Flicker GOLD, UVT, Net Yield for ambient dynamics
        const flickerInterval = setInterval(() => {
            setFinancialItems(prev => prev.map(item => {
                if (['UVT', 'GOLD', 'Net Yield'].includes(item.label)) {
                    const parsedVal = parseFloat(item.value.replace(/,/g, ''));
                    let newVal = item.value;
                    if (item.label === 'Net Yield') {
                        newVal = (parsedVal + (Math.random() - 0.5) * 0.05).toFixed(2);
                    } else if (item.label === 'UVT') {
                        newVal = (parsedVal + (Math.random() - 0.5) * 0.01).toFixed(4);
                    } else if (item.label === 'GOLD') {
                        newVal = Math.round(parsedVal + (Math.random() - 0.5) * 3).toLocaleString();
                    }
                    return {
                        ...item,
                        value: newVal,
                        change: item.change !== undefined
                            ? parseFloat((item.change + (Math.random() - 0.5) * 0.05).toFixed(2))
                            : undefined
                    };
                }
                return item;
            }));
        }, 2000);

        return () => {
            clearInterval(dataInterval);
            clearInterval(flickerInterval);
        };
    }, [activeSyndicate]);

    // Status Metrics fetching and real-time increments
    useEffect(() => {
        const clockInterval = setInterval(() => {
            const now = Date.now();
            setTime(new Date().toUTCString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1') + ' UTC');

            const elapsedSecs = Math.floor((now - sessionStartRef.current) / 1000);
            
            const totalSecs = baseUptimeRef.current + elapsedSecs;
            const h = Math.floor(totalSecs / 3600);
            const m = Math.floor((totalSecs % 3600) / 60);
            const s = totalSecs % 60;
            const uptimeStr = `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;

            const currentBlock = 1779198 + Math.floor(elapsedSecs / 3);
            const blockStr = `BLOCK #${currentBlock.toLocaleString()}`;

            const simulatedProposals = baseProposalsRef.current + Math.floor(elapsedSecs / 45);

            const fluctuatedIntegrity = (94.2 + Math.sin(elapsedSecs * 0.2) * 0.3).toFixed(2) + '%';

            setStatusItems(prev => prev.map(item => {
                if (item.label === 'Uptime') return { ...item, value: uptimeStr };
                if (item.label === 'Substrate') return { ...item, value: blockStr };
                if (item.label === 'Open Proposals') return { ...item, value: simulatedProposals.toString() };
                if (item.label === 'Immune Integrity') return { ...item, value: fluctuatedIntegrity };
                if (item.label === 'Active Citizens') return { ...item, value: baseCitizensRef.current.toString() };
                return item;
            }));
        }, 1000);

        const fetchStateMetrics = () => {
            fetch('/api/governance/proposals')
                .then(r => r.ok ? r.json() : null)
                .then(proposals => {
                    if (Array.isArray(proposals)) {
                        baseProposalsRef.current = proposals.length;
                    }
                }).catch(() => {});

            fetch('/api/citizens')
                .then(r => r.ok ? r.json() : null)
                .then(citizens => {
                    if (Array.isArray(citizens)) {
                        baseCitizensRef.current = citizens.length;
                    }
                }).catch(() => {});

            fetch('/api/security_telemetry/pulse')
                .then(r => r.ok ? r.json() : null)
                .then(pulse => {
                    if (pulse) {
                        baseUptimeRef.current = pulse.uptime ?? 86400;
                        setStatusItems(prev => prev.map(item => {
                            if (item.label === 'Defense Level') return { ...item, value: String(pulse.defenseLevel ?? 4) };
                            return item;
                        }));
                    }
                }).catch(() => {});
        };

        fetchStateMetrics();
        const stateInterval = setInterval(fetchStateMetrics, 15000);

        return () => {
            clearInterval(clockInterval);
            clearInterval(stateInterval);
        };
    }, []);

    // Combine both sets of items for a seamless horizontal marquee scrolling stream
    const combinedMarqueeItems = [...financialItems, ...statusItems];
    const doubledMarquee = [...combinedMarqueeItems, ...combinedMarqueeItems];

    return (
        <>
            {/* Top-Docked Consolidated Marquee Container */}
            <div 
                className={`fixed top-0 left-0 right-0 z-[100000] border-b bg-black/90 backdrop-blur-md transition-all duration-500 flex items-center overflow-hidden pointer-events-auto ${
                    isCollapsed 
                        ? 'h-[2px] border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.7)]' 
                        : 'h-9 border-white/5 shadow-lg'
                }`}
            >
                {/* 1. Syndicate dropdown, always visible when expanded */}
                {!isCollapsed && (
                    <div className="flex-shrink-0 px-3 flex items-center h-full border-r border-white/10 bg-black/60 relative group shrink-0">
                        <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-emerald-400 mr-2 select-none animate-[pulse_2s_infinite]">⬡</span>
                        <select
                            value={activeSyndicate}
                            onChange={handleSyndicateChange}
                            className="bg-transparent text-[8.5px] font-mono font-black uppercase tracking-[0.15em] text-emerald-400 border-none outline-none cursor-pointer pr-4 appearance-none hover:text-emerald-300 transition-colors"
                            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                        >
                            <option value="global" className="bg-zinc-950 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">GLOBAL NETWORK</option>
                            <option value="tpns-genesis" className="bg-zinc-950 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">GENESIS STATE</option>
                            <option value="rwa-atlas" className="bg-zinc-950 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">RWA ATLAS</option>
                            <option value="uvt-buybacks" className="bg-zinc-950 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">UVT BUYBACKS</option>
                            <option value="vanguard-yield" className="bg-zinc-950 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">VANGUARD YIELD</option>
                        </select>
                        <span className="text-[6.5px] text-emerald-500/50 pointer-events-none select-none ml-1">▼</span>
                    </div>
                )}

                {/* 2. Unified scrolling marquee */}
                {!isCollapsed && (
                    <div className="flex-1 overflow-hidden relative h-full flex items-center select-none">
                        <div
                            className="flex items-center h-full animate-ticker whitespace-nowrap"
                            style={{ animation: 'ticker-scroll-v2 25s linear infinite' }}
                        >
                            {doubledMarquee.map((item, i) => (
                                <TickerItemComponent key={`${item.label}-${i}`} item={item} />
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Right Controls Segment (Time & Expand/Collapse Trigger) */}
                {!isCollapsed && (
                    <div className="flex-shrink-0 px-3.5 flex items-center h-full border-l border-white/10 bg-black/50 gap-3 text-zinc-500 font-mono text-[8px] shrink-0">
                        <div className="flex items-center gap-1.5 border-r border-white/5 pr-3.5 h-full">
                            <Clock className="w-2.5 h-2.5 text-zinc-600" />
                            <span className="font-extrabold tracking-wider">{time}</span>
                        </div>
                        <button
                            onClick={toggleCollapsed}
                            className="p-1 hover:bg-white/5 hover:text-emerald-400 border border-transparent hover:border-white/5 rounded transition-all cursor-pointer flex items-center justify-center shadow-inner"
                            title="Collapse Ticker Strip"
                        >
                            <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Glowing Thread Restore Trigger (appears when collapsed at top-right viewport) */}
            {isCollapsed && (
                <div className="fixed top-0 right-4 z-[100005] animate-fade-in group pointer-events-auto">
                    <button
                        onClick={toggleCollapsed}
                        className="px-2.5 py-1 bg-black/95 border-b border-l border-r border-emerald-500/40 hover:border-emerald-400 text-emerald-400 rounded-b-lg font-mono text-[7px] font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-1 shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.45)] cursor-pointer"
                        title="Expand Ticker Strip"
                    >
                        <span>RESTORE TICKER</span>
                        <ChevronDown className="w-2.5 h-2.5 animate-bounce" />
                    </button>
                </div>
            )}

            {/* Dynamic CSS Scroll Keyframes */}
            <style jsx global>{`
                @keyframes ticker-scroll-v2 {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-ticker {
                    will-change: transform;
                }
            `}</style>
        </>
    );
}
