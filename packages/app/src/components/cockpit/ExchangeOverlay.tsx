'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, DollarSign, Wallet, ArrowRight, Activity } from 'lucide-react';
import { useHUD } from '@/lib/hud-store';

export function ExchangeOverlay() {
    const { activeFocusPanel, setHUDState } = useHUD();
    const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState(1.2045);
    const isOpen = activeFocusPanel === 'EXCHANGE';

    // Simulate ticking price
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setPrice(prev => parseFloat((prev + (Math.random() - 0.5) * 0.005).toFixed(4)));
        }, 2000);
        return () => clearInterval(interval);
    }, [isOpen]);

    // Simple SVG chart mock coordinates
    const chartPoints = [
        { x: 0, y: 80 }, { x: 50, y: 75 }, { x: 100, y: 85 }, { x: 150, y: 65 },
        { x: 200, y: 90 }, { x: 250, y: 55 }, { x: 300, y: 40 }, { x: 350, y: 45 },
        { x: 400, y: 30 }, { x: 450, y: 35 }, { x: 500, y: 15 }
    ];
    const pathD = `M ${chartPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;
    const areaD = `${pathD} L 500 120 L 0 120 Z`;

    const bids = [
        { price: 1.2042, size: 2500, total: 3010 },
        { price: 1.2038, size: 14200, total: 17116 },
        { price: 1.2030, size: 8500, total: 20266 }
    ];

    const asks = [
        { price: 1.2048, size: 4500, total: 5421 },
        { price: 1.2052, size: 1200, total: 6867 },
        { price: 1.2060, size: 9000, total: 17721 }
    ];

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="absolute inset-0 m-6 top-16 bottom-20 z-45 bg-black/85 backdrop-blur-3xl border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl pointer-events-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.01]">
                <div className="flex items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-bold text-white">UVT / USDC</span>
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/20">LIVE</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-wider">Sovereign Utility Token Exchange</span>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    <div>
                        <span className="text-[8px] text-zinc-500 font-mono block">LAST PRICE</span>
                        <span className="text-sm font-mono text-emerald-400 font-bold">${price.toFixed(4)}</span>
                    </div>

                    <div>
                        <span className="text-[8px] text-zinc-500 font-mono block">24H CHANGE</span>
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-0.5">
                            <TrendingUp className="w-3.5 h-3.5" /> +2.41%
                        </span>
                    </div>
                </div>

                <button 
                    onClick={() => setHUDState({ activeFocusPanel: null })}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Split Screen Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: Order Book */}
                <div className="w-64 border-r border-white/10 p-5 flex flex-col overflow-y-auto">
                    <span className="text-[9px] font-mono font-black text-zinc-400 tracking-widest uppercase mb-4 block">Order Book</span>
                    
                    {/* Asks (Sells) */}
                    <div className="space-y-1.5 mb-4 text-[10px] font-mono">
                        {asks.reverse().map((ask, i) => (
                            <div key={i} className="flex justify-between text-red-400 hover:bg-red-500/5 p-1 rounded transition-colors">
                                <span>{ask.price.toFixed(4)}</span>
                                <span className="text-zinc-500">{ask.size}</span>
                            </div>
                        ))}
                    </div>

                    {/* Mid Spread */}
                    <div className="py-2 my-2 border-y border-white/5 flex justify-between text-[11px] font-mono text-zinc-300 font-bold">
                        <span>Spread</span>
                        <span>0.0003 USDC</span>
                    </div>

                    {/* Bids (Buys) */}
                    <div className="space-y-1.5 text-[10px] font-mono">
                        {bids.map((bid, i) => (
                            <div key={i} className="flex justify-between text-emerald-400 hover:bg-emerald-500/5 p-1 rounded transition-colors">
                                <span>{bid.price.toFixed(4)}</span>
                                <span className="text-zinc-500">{bid.size}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CENTER: Chart */}
                <div className="flex-1 p-6 flex flex-col justify-between overflow-hidden relative">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[9px] font-mono font-black text-zinc-400 tracking-widest uppercase">Live Activity Index</span>
                        <div className="flex gap-2 text-[9px] font-mono">
                            {['1M', '5M', '15M', '1H', '1D'].map((t) => (
                                <button key={t} className={`px-2 py-0.5 rounded ${t === '15M' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SVG Chart area */}
                    <div className="flex-1 w-full relative group">
                        <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                                </linearGradient>
                            </defs>
                            <path d={areaD} fill="url(#chartGrad)" />
                            <path d={pathD} fill="none" stroke="#10b981" strokeWidth="1.5" />
                        </svg>
                    </div>

                    {/* Ledger link */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                            <Activity className="w-3.5 h-3.5 text-zinc-600" />
                            <span>Total Volume: 142.9K UVT</span>
                        </div>
                        <a 
                            href="/dashboard/exchange" 
                            className="text-[9px] font-mono text-zinc-400 hover:text-emerald-400 font-bold tracking-wider flex items-center gap-1 transition-colors"
                        >
                            ADVANCED TRADING INTERFACE <ArrowRight className="w-3 h-3" />
                        </a>
                    </div>
                </div>

                {/* RIGHT: Action terminal */}
                <div className="w-72 border-l border-white/10 p-5 flex flex-col justify-between bg-white/[0.005]">
                    <div className="space-y-4">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                            <button 
                                onClick={() => setAction('BUY')}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                                    action === 'BUY' 
                                        ? 'bg-emerald-500 text-white shadow-md' 
                                        : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                BUY
                            </button>
                            <button 
                                onClick={() => setAction('SELL')}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                                    action === 'SELL' 
                                        ? 'bg-red-500 text-white shadow-md' 
                                        : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                SELL
                            </button>
                        </div>

                        {/* Input quantity */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Quantity (UVT)</label>
                            <div className="relative flex items-center">
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-white/5 border border-white/5 focus:border-white/15 focus:outline-none p-3 rounded-xl text-sm font-mono text-white placeholder:text-zinc-700"
                                />
                                <span className="absolute right-3 text-[10px] font-mono text-zinc-500">UVT</span>
                            </div>
                        </div>

                        {/* Calculations summary */}
                        <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl space-y-2 text-[10px] font-mono">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Rate</span>
                                <span className="text-zinc-300">{price.toFixed(4)} USDC</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Slippage Tolerance</span>
                                <span className="text-zinc-300">0.5%</span>
                            </div>
                            <div className="flex justify-between font-bold pt-1.5 border-t border-white/5">
                                <span className="text-zinc-400">Total Cost</span>
                                <span className="text-white">
                                    ${(Number(amount || 0) * price).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button className={`w-full py-3 rounded-xl font-bold font-mono tracking-widest text-xs transition-all shadow-md active:scale-[0.98] ${
                        action === 'BUY' 
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white' 
                            : 'bg-red-500 hover:bg-red-400 text-white'
                    }`}>
                        EXECUTE HANDSHAKE
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
