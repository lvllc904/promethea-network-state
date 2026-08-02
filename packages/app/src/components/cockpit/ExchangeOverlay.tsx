'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, ShieldCheck, ArrowRight, Activity, Box, Coins, Lock, Vault as VaultIcon } from 'lucide-react';
import { useHUD } from '@/lib/hud-store';
import type { Asset } from '@/lib/hud-store';
import { ComplianceDocumentVault } from './ComplianceDocumentVault';

export function ExchangeOverlay() {
    const { activeFocusPanel, setHUDState, assets, escrows, createEscrow, executeAtomicSwap, treasury, userDid } = useHUD();
    const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
    const [amountUSDC, setAmountUSDC] = useState('');
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [centerTab, setCenterTab] = useState<'CHART' | 'VAULT'>('CHART');
    const isOpen = activeFocusPanel === 'EXCHANGE';


    // Auto-select first asset if none selected
    useEffect(() => {
        if (isOpen && assets.length > 0 && !selectedAssetId) {
            setSelectedAssetId(assets[0].id);
        }
    }, [isOpen, assets, selectedAssetId]);

    const activeAsset = assets.find(a => a.id === selectedAssetId);

    // Dynamic state
    const [mockPrice, setMockPrice] = useState(1.0);
    useEffect(() => {
        if (!isOpen || !activeAsset) return;
        const interval = setInterval(() => {
            setMockPrice(prev => parseFloat((prev + (Math.random() - 0.5) * 0.005).toFixed(4)));
        }, 2000);
        return () => clearInterval(interval);
    }, [isOpen, activeAsset]);

    const handleExecute = () => {
        if (!activeAsset) return;
        
        // Ensure input amount is valid
        const numericAmount = Number(amountUSDC);
        if (isNaN(numericAmount) || numericAmount <= 0) return;

        // In a real app we'd wait for block confirmation, here we instantly create & execute
        const escrowId = `escrow-tx-${Date.now()}`;
        
        // Create pending escrow
        createEscrow(userDid, activeAsset.id, numericAmount);

        // Atomic settlement
        setTimeout(() => {
            // Find the auto-generated escrow ID (since createEscrow generates its own inside state, 
            // we will just pull the latest pending escrow for this user & asset).
            // This is a simplified hack for the UI prototype.
            const latestEscrow = [...escrows].reverse().find(e => e.buyerDid === userDid && e.assetId === activeAsset.id && e.status === 'PENDING');
            if (latestEscrow) {
                executeAtomicSwap(latestEscrow.id);
            }
            setAmountUSDC('');
        }, 800);
    };

    if (!isOpen) return null;

    // Derived UI flags
    const isFixedOTC = activeAsset?.pricingMode === 'FIXED';
    const isFractional = activeAsset?.ownership === 'FRACTIONAL';

    // Charts
    const chartPoints = [
        { x: 0, y: 80 }, { x: 50, y: 75 }, { x: 100, y: 85 }, { x: 150, y: 65 },
        { x: 200, y: 90 }, { x: 250, y: 55 }, { x: 300, y: 40 }, { x: 350, y: 45 },
        { x: 400, y: 30 }, { x: 450, y: 35 }, { x: 500, y: 15 }
    ];
    const pathD = `M ${chartPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;
    const areaD = `${pathD} L 500 120 L 0 120 Z`;

    const displayValuation = activeAsset ? activeAsset.valuationUSDC : 0;
    const sharePrice = isFractional && activeAsset?.sharesTotal ? (displayValuation / activeAsset.sharesTotal) : displayValuation;

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
                    <select 
                        value={selectedAssetId || ''}
                        onChange={(e) => setSelectedAssetId(e.target.value)}
                        className="bg-black border border-white/20 text-white font-mono font-bold text-sm px-3 py-1.5 rounded-lg outline-none focus:border-emerald-500/50 max-w-[200px] truncate"
                    >
                        {assets.map(a => (
                            <option key={a.id} value={a.id}>{a.name} ({a.ownership})</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-2">
                        {activeAsset?.pricingMode === 'FIXED' ? (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/20">OTC MARKET</span>
                        ) : (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 font-mono font-bold px-2 py-0.5 rounded border border-amber-500/20">ORDER BOOK</span>
                        )}
                    </div>

                    <div className="h-8 w-px bg-white/10 mx-2" />

                    {isFixedOTC ? (
                        <div>
                            <span className="text-[8px] text-zinc-500 font-mono block">OTC VALUATION</span>
                            <span className="text-sm font-mono text-white font-bold">${displayValuation.toLocaleString()}</span>
                        </div>
                    ) : (
                        <div>
                            <span className="text-[8px] text-zinc-500 font-mono block">LAST PRICE</span>
                            <span className="text-sm font-mono text-emerald-400 font-bold">${(sharePrice * mockPrice).toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 items-center">
                    <div className="text-right">
                        <span className="text-[8px] text-zinc-500 font-mono block uppercase">Your Capital</span>
                        <span className="text-sm font-mono text-white font-bold">${treasury.balanceUSDC.toLocaleString()}</span>
                    </div>
                    <button 
                        onClick={() => setHUDState({ activeFocusPanel: null })}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors ml-4"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Split Screen Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: Order Book / Properties */}
                <div className="w-64 border-r border-white/10 p-5 flex flex-col overflow-y-auto">
                    {isFixedOTC ? (
                        <>
                            <span className="text-[9px] font-mono font-black text-zinc-400 tracking-widest uppercase mb-4 block">Asset Details</span>
                            <div className="space-y-4">
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                    <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Type</span>
                                    <span className="text-xs text-white font-bold">{activeAsset?.type.replace('_', ' ')}</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                    <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Ownership</span>
                                    <span className="text-xs text-white font-bold">{activeAsset?.ownership}</span>
                                    {isFractional && (
                                        <div className="mt-2 text-[10px] font-mono text-emerald-400">
                                            {activeAsset.sharesAvailable} / {activeAsset.sharesTotal} Shares Available
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                    <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Legal Status</span>
                                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> UCC-1 Anchored
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="text-[9px] font-mono font-black text-zinc-400 tracking-widest uppercase mb-4 block">Order Book (Shares)</span>
                            
                            {/* Asks */}
                            <div className="space-y-1.5 mb-4 text-[10px] font-mono">
                                {[1.02, 1.015, 1.008].map((mult, i) => (
                                    <div key={i} className="flex justify-between text-red-400 hover:bg-red-500/5 p-1 rounded transition-colors">
                                        <span>${(sharePrice * mockPrice * mult).toFixed(2)}</span>
                                        <span className="text-zinc-500">{Math.floor(Math.random() * 500) + 10}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Mid Spread */}
                            <div className="py-2 my-2 border-y border-white/5 flex justify-between text-[11px] font-mono text-zinc-300 font-bold">
                                <span>Spread</span>
                                <span>$0.45</span>
                            </div>

                            {/* Bids */}
                            <div className="space-y-1.5 text-[10px] font-mono">
                                {[0.995, 0.985, 0.98].map((mult, i) => (
                                    <div key={i} className="flex justify-between text-emerald-400 hover:bg-emerald-500/5 p-1 rounded transition-colors">
                                        <span>${(sharePrice * mockPrice * mult).toFixed(2)}</span>
                                        <span className="text-zinc-500">{Math.floor(Math.random() * 500) + 10}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* CENTER: Chart / Vault tabs */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {/* Center tab bar */}
                    <div className="flex items-center gap-0 border-b border-white/10 px-4 bg-white/[0.01] shrink-0">
                        <button
                            onClick={() => setCenterTab('CHART')}
                            className={`flex items-center gap-1.5 px-4 py-3 text-[9px] font-mono font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
                                centerTab === 'CHART'
                                    ? 'border-emerald-500 text-emerald-400'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <Activity className="w-3 h-3" /> Chart
                        </button>
                        <button
                            onClick={() => setCenterTab('VAULT')}
                            className={`flex items-center gap-1.5 px-4 py-3 text-[9px] font-mono font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
                                centerTab === 'VAULT'
                                    ? 'border-cyan-400 text-cyan-400'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <VaultIcon className="w-3 h-3" /> Vault & Fees
                        </button>
                    </div>

                    {/* Chart Tab */}
                    {centerTab === 'CHART' && (
                        <div className="flex-1 p-6 flex flex-col justify-between overflow-hidden">
                            <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col justify-center">
                                <div className="w-full h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] font-mono font-black text-zinc-400 tracking-widest uppercase">
                                            {isFixedOTC ? 'Valuation Trajectory' : 'Live Activity Index'}
                                        </span>
                                        <div className="flex gap-2 text-[9px] font-mono">
                                            {['1M', '5M', '15M', '1H', '1D'].map((t) => (
                                                <button key={t} className={`px-2 py-0.5 rounded ${t === '15M' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full relative min-h-[160px] flex items-center justify-center">
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
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5 shrink-0">
                                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                                    <Box className="w-3.5 h-3.5 text-zinc-600" />
                                    <span>{activeAsset?.description}</span>
                                </div>
                                <a
                                    href="/dashboard/exchange"
                                    className="text-[9px] font-mono text-zinc-400 hover:text-emerald-400 font-bold tracking-wider flex items-center gap-1 transition-colors"
                                >
                                    VIEW ON-CHAIN AUDIT <ArrowRight className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Vault & Fees Tab */}
                    {centerTab === 'VAULT' && (
                        <div className="flex-1 overflow-y-auto p-4">
                            <ComplianceDocumentVault
                                userWallet={userDid ? userDid.slice(0, 6) + '...' + userDid.slice(-4) : '0x...????'}
                                isAccredited={true}
                            />
                        </div>
                    )}
                </div>

                {/* RIGHT: Action terminal (Escrow/Swap) */}
                <div className="w-80 border-l border-white/10 p-5 flex flex-col justify-between bg-white/[0.005]">
                    <div className="space-y-4">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                            <button 
                                onClick={() => setAction('BUY')}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                                    action === 'BUY' 
                                        ? 'bg-emerald-500 text-black shadow-md' 
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

                        {isFixedOTC && !isFractional ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                <Lock className="w-6 h-6 text-emerald-400 mb-2" />
                                <h4 className="text-xs font-bold text-white mb-1">Bonded Escrow</h4>
                                <p className="text-[10px] text-zinc-400">Purchasing this asset transfers 100% of the Controllable Electronic Record (CER) atomically.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Commitment (USDC)</label>
                                <div className="relative flex items-center">
                                    <input 
                                        type="number"
                                        value={amountUSDC}
                                        onChange={(e) => setAmountUSDC(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-white/5 border border-white/5 focus:border-white/15 focus:outline-none p-3 rounded-xl text-sm font-mono text-white placeholder:text-zinc-700"
                                    />
                                    <span className="absolute right-3 text-[10px] font-mono text-zinc-500">USDC</span>
                                </div>
                                {isFractional && (
                                    <div className="text-[9px] text-emerald-400 text-right mt-1 font-mono">
                                        ≈ {Math.floor(Number(amountUSDC || 0) / sharePrice)} Shares
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Calculations summary */}
                        <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl space-y-2 text-[10px] font-mono">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Subtotal</span>
                                <span className="text-zinc-300">
                                    ${isFixedOTC && !isFractional ? displayValuation.toLocaleString() : (amountUSDC || '0.00')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Escrow Fee (0.1%)</span>
                                <span className="text-zinc-300">
                                    ${((isFixedOTC && !isFractional ? displayValuation : Number(amountUSDC || 0)) * 0.001).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between font-bold pt-1.5 border-t border-white/5">
                                <span className="text-zinc-400">Total Settlement</span>
                                <span className="text-emerald-400">
                                    ${((isFixedOTC && !isFractional ? displayValuation : Number(amountUSDC || 0)) * 1.001).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            if (isFixedOTC && !isFractional) {
                                setAmountUSDC(displayValuation.toString());
                            }
                            handleExecute();
                        }}
                        className={`w-full py-3 rounded-xl font-bold font-mono tracking-widest text-xs transition-all shadow-md active:scale-[0.98] mt-4 ${
                            action === 'BUY' 
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-black' 
                                : 'bg-red-500 hover:bg-red-400 text-white'
                        }`}
                    >
                        EXECUTE ATOMIC SWAP
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
