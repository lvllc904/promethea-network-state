'use client';

import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useSolanaCitizen } from '@promethea/hooks';

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
            <span className="text-[10px] font-black font-mono text-white">{item.prefix ?? ''}{item.value}</span>
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
        { label: 'SOL', value: '72,450', change: 1.23, prefix: '$' },
        { label: 'BTC', value: '103,240', change: -0.18, prefix: '$' },
        { label: 'ETH', value: '3,820', change: 0.97, prefix: '$' },
        { label: 'GOLD', value: '2,650', change: 0.31, prefix: '$' },
        { label: 'Treasury', value: '0', change: 0, prefix: '$' },
        { label: 'Net Yield', value: '14.2', prefix: '' },
        { label: 'RWA Value', value: '1,452,000', change: 0, prefix: '$' },
    ]);

    const { solBalance } = useSolanaCitizen();

    useEffect(() => {
        // Update SOL balance if available
        if (solBalance !== null) {
            setItems(prev => prev.map(item => {
                if (item.label === 'SOL') return { ...item, value: solBalance.toFixed(4) };
                return item;
            }));
        }
    }, [solBalance]);

    useEffect(() => {
        // Fetch live financials
        fetch('/api/intel')
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (!d) return;
                setItems(prev => prev.map(item => {
                    if (item.label === 'Treasury') return { ...item, value: Number(d.totalValue || 0).toLocaleString() };
                    if (item.label === 'RWA Value') return { ...item, value: Number(d.rwaValue || 1452000).toLocaleString() };
                    return item;
                }));
            })
            .catch(() => {});

        // Slight random price flicker every 8s to feel live
        const interval = setInterval(() => {
            setItems(prev => prev.map(item => ({
                ...item,
                change: item.change !== undefined
                    ? parseFloat((item.change + (Math.random() - 0.5) * 0.1).toFixed(2))
                    : undefined
            })));
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Duplicate items for seamless loop
    const doubled = [...items, ...items];

    return (
        <div className="fixed top-0 left-0 right-0 z-[99999] h-8 bg-black/80 backdrop-blur-sm border-b border-white/5 overflow-hidden flex items-center">
            <div className="flex-shrink-0 px-3 flex items-center h-full border-r border-white/10 bg-black/40">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">⬡ SOVEREIGN</span>
            </div>
            <div className="flex-1 overflow-hidden relative">
                <div
                    className="flex items-center h-full animate-ticker whitespace-nowrap"
                    style={{ animation: 'ticker-scroll 20s linear infinite' }}
                >
                    {doubled.map((item, i) => <TickerItem key={i} item={item} />)}
                </div>
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
