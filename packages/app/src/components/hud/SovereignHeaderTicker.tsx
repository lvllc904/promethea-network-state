'use client';

import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useSolanaCitizen } from '@promethea/hooks';
import { UiVersionToggle } from '@/components/layout/UiVersionToggle';

interface TickerItem {
    label: string;
    value: string;
    change?: number; // percentage
    prefix?: string;
}

const TickerItem = ({ item }: { item: TickerItem }) => {
    const isPos = (item.change ?? 0) >= 0;
    return (
        <span className="inline-flex items-center gap-1.5 px-4 border-r border-white/5 shrink-0">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{item.label}</span>
            <span className="text-[10px] font-black font-mono text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)] animate-[pulse_2s_cubic-bezier(0.4,_0,_0.6,_1)_infinite]">{item.prefix ?? ''}{item.value}</span>
            {item.change !== undefined && (
                <span className={`flex items-center gap-0.5 text-[8px] font-bold font-mono ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {isPos ? '+' : ''}{item.change.toFixed(2)}%
                </span>
            )}
        </span>
    );
};

export function SovereignHeaderTicker() {
    const [items, setItems] = useState<TickerItem[]>([
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

    const { solBalance } = useSolanaCitizen();
    const [activeSyndicate, setActiveSyndicate] = useState<string>('global');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = window.localStorage.getItem('activeSyndicate') || 'global';
            setActiveSyndicate(saved);
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

    useEffect(() => {
        // Update SOL balance if available
        if (solBalance !== null) {
            setItems(prev => prev.map(item => {
                if (item.label === 'Cit SOL') return { ...item, value: solBalance.toFixed(4) };
                return item;
            }));
        }
    }, [solBalance]);

    useEffect(() => {
        const syndicateQuery = activeSyndicate !== 'global' ? `?syndicate_id=${activeSyndicate}` : '';
        
        const fetchData = async () => {
            try {
                // Fetch CoinGecko prices
                const tickerRes = await fetch('/api/ticker');
                const tickerData = tickerRes.ok ? await tickerRes.json() : null;

                // Fetch intelligence pro-forma values
                const intelRes = await fetch(`/api/intel${syndicateQuery}`);
                const intelData = intelRes.ok ? await intelRes.json() : null;

                setItems(prev => prev.map(item => {
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
                console.warn('[HeaderTicker] Failed to fetch live Omni Lake rates:', err);
            }
        };

        fetchData();
        
        // Poll every 10s to stay extremely fresh and live
        const dataInterval = setInterval(fetchData, 10000);

        // Pulsing random tick flicker every 2s for non-coingecko assets (like GOLD or UVT or Net Yield) to feel alive
        const flickerInterval = setInterval(() => {
            setItems(prev => prev.map(item => {
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

    // Duplicate items for seamless loop
    const doubled = [...items, ...items];

    return (
        <div className="fixed top-0 left-0 right-0 z-[99999] h-8 bg-black/80 backdrop-blur-sm border-b border-white/5 overflow-hidden flex items-center pointer-events-none">
            <div className="flex-shrink-0 px-3 flex items-center h-full border-r border-white/10 bg-black/60 pointer-events-auto relative group">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mr-1.5 select-none animate-[pulse_2s_infinite]">⬡</span>
                <select
                    value={activeSyndicate}
                    onChange={handleSyndicateChange}
                    className="bg-transparent text-[9px] font-mono font-black uppercase tracking-[0.15em] text-emerald-400 border-none outline-none cursor-pointer pr-4 appearance-none hover:text-emerald-300 transition-colors"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                    <option value="global" className="bg-zinc-950 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">GLOBAL NETWORK</option>
                    <option value="tpns-genesis" className="bg-zinc-950 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">GENESIS STATE</option>
                    <option value="rwa-atlas" className="bg-zinc-950 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">RWA ATLAS</option>
                    <option value="uvt-buybacks" className="bg-zinc-950 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">UVT BUYBACKS</option>
                    <option value="vanguard-yield" className="bg-zinc-950 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">VANGUARD YIELD</option>
                </select>
                <span className="text-[7px] text-emerald-500/50 pointer-events-none select-none ml-1">▼</span>
            </div>
            <div className="flex-1 overflow-hidden relative">
                <div
                    className="flex items-center h-full animate-ticker whitespace-nowrap"
                    style={{ animation: 'ticker-scroll 20s linear infinite' }}
                >
                    {doubled.map((item, i) => <TickerItem key={i} item={item} />)}
                </div>
            </div>
            <div className="flex-shrink-0 px-2 flex items-center h-full pointer-events-auto border-l border-white/10 bg-black/60">
                <UiVersionToggle className="scale-90" />
            </div>
            <style>{`
                @keyframes ticker-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
