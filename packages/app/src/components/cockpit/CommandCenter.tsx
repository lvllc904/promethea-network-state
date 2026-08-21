'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, ShieldCheck, HelpCircle, Building2, ChevronDown, Fingerprint, FileText, Coins } from 'lucide-react';
import { useHUD } from '@/lib/hud-store';
import { DelawareSeriesTopologyCard } from './DelawareSeriesTopologyCard';
import { parseIdentifier } from '@/lib/identifier-classifier';

export function CommandCenter() {
    const { activeFocusPanel, setHUDState, mapMode } = useHUD();
    const [isFocused, setIsFocused] = useState(false);
    const [query, setQuery] = useState('');
    const [isLegalPanelOpen, setIsLegalPanelOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut to focus (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                inputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const detectedIdentifier = useMemo(() => {
        if (!query || query.length < 3) return null;
        const result = parseIdentifier(query);
        return result.isValid ? result : null;
    }, [query]);

    const quickChips = [
        { label: '→ Citizens', action: () => setHUDState({ activePillar: 'PASSPORT' as any }) },
        { label: '→ Treasury', action: () => setHUDState({ cockpitHoldingsTab: 'FINANCIALS' }) },
        { label: '→ Governance', action: () => setHUDState({ activePillar: 'GOVERNANCE' as any }) },
        { label: '→ Intel', action: () => setHUDState({ cockpitOpsTab: 'TELEMETRY' }) },
        { label: '→ Exchange', action: () => setHUDState({ activeFocusPanel: activeFocusPanel === 'EXCHANGE' ? null : 'EXCHANGE' }) },
        { label: `→ Map: ${mapMode === 'SURFACE' ? 'Space' : 'Surface'}`, action: () => setHUDState({ mapMode: mapMode === 'SURFACE' ? 'INTERSTELLAR' : 'SURFACE' }) }
    ];

    const suggestedProtocols = useMemo(() => {
        const base = [
            { label: 'Initiate Treasury Audit', cmd: '/audit' },
            { label: 'Switch Context to Genesis State', cmd: '/context tpns-genesis' },
            { label: 'Deploy Osiris Sentinel Agent', cmd: '/deploy osiris' },
            { label: 'Query Node Telemetry Latency', cmd: '/nodes status' },
            { label: 'Download Confidential PPM (State-04+)', cmd: '/vault/ppm' }
        ];

        if (detectedIdentifier) {
            if (detectedIdentifier.type === 'DID') {
                return [
                    { label: `Audit DID Credentials: ${detectedIdentifier.raw.slice(0, 20)}...`, cmd: `/did ${detectedIdentifier.raw}` },
                    ...base
                ];
            }
            if (detectedIdentifier.type === 'EVM_ADDRESS' || detectedIdentifier.type === 'SOLANA_ADDRESS') {
                return [
                    { label: `Check Compliance State (${detectedIdentifier.label})`, cmd: `/compliance check ${detectedIdentifier.normalized}` },
                    { label: `Inspect Tax Lots (IRS June 2024 Rule)`, cmd: `/taxlots ${detectedIdentifier.normalized}` },
                    ...base
                ];
            }
            if (detectedIdentifier.type === 'IPFS_CID') {
                return [
                    { label: `Fetch Watermarked Document: ${detectedIdentifier.raw.slice(0, 16)}...`, cmd: `/ipfs ${detectedIdentifier.raw}` },
                    ...base
                ];
            }
            if (detectedIdentifier.type === 'EVM_TX_HASH' || detectedIdentifier.type === 'SOLANA_SIGNATURE') {
                return [
                    { label: `Verify Settlement Audit Trail`, cmd: `/verify ${detectedIdentifier.raw}` },
                    ...base
                ];
            }
        }

        return base;
    }, [detectedIdentifier]);

    const filteredSuggestions = suggestedProtocols.filter(p => 
        p.label.toLowerCase().includes(query.toLowerCase()) || 
        p.cmd.toLowerCase().includes(query.toLowerCase()) ||
        Boolean(detectedIdentifier)
    );

    const handleSelectSuggestion = (cmd: string) => {
        setQuery(cmd);
        setIsFocused(false);
    };

    return (
        <div className="w-full max-w-[460px] z-40 relative pointer-events-auto flex flex-col items-center gap-2.5">
            {/* The Main Input Group */}
            <motion.div 
                animate={{ 
                    y: isFocused ? -4 : 0,
                    scale: isFocused ? 1.01 : 1,
                    boxShadow: isFocused 
                        ? '0 0 30px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.5)' 
                        : '0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)'
                }}
                className="w-full bg-black/75 backdrop-blur-2xl rounded-xl overflow-hidden border border-white/10 transition-all duration-200"
            >
                <div className="flex items-center p-3 gap-2.5">
                    <div className={`flex items-center justify-center p-1.5 rounded-lg transition-colors ${isFocused ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400'}`}>
                        <Search size={16} />
                    </div>
                    
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Query Matrix, Wallet, DID, or /command..."
                        className="flex-1 bg-transparent text-white text-xs md:text-sm font-light border-none focus:outline-none placeholder:text-zinc-500 font-command tracking-tight"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    />

                    {/* Auto-Sensed Identifier Type Badge */}
                    {detectedIdentifier && (
                        <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold select-none shrink-0">
                            {detectedIdentifier.type.replace('_', ' ')}
                        </span>
                    )}

                    <div className="flex items-center gap-1 opacity-60 px-2 py-0.5 rounded bg-white/10 border border-white/10 select-none">
                        <Command size={11} className="text-zinc-300" />
                        <span className="text-xs font-data text-zinc-300 font-bold">K</span>
                    </div>
                </div>
                
                {/* Suggestions List */}
                <AnimatePresence>
                    {isFocused && filteredSuggestions.length > 0 && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/10 bg-black/60"
                        >
                            <div className="p-2">
                                <div className="px-3 py-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center justify-between">
                                    <span>Suggested Protocols</span>
                                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                                </div>
                                <div className="flex flex-col gap-1 p-1">
                                    {filteredSuggestions.map((p, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleSelectSuggestion(p.cmd)}
                                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-left transition-colors group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                <span className="text-xs text-zinc-200 font-mono">{p.label}</span>
                                            </div>
                                            <span className="text-xs text-zinc-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">{p.cmd}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Quick Action Chips — single row, slim */}
            <div className="flex gap-1.5 justify-center flex-wrap sm:flex-nowrap overflow-x-auto scrollbar-none w-full px-1">
                {quickChips.map((chip, i) => (
                    <button
                        key={i}
                        onClick={chip.action}
                        className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 hover:border-emerald-500/40 text-xs font-data font-semibold tracking-wider text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                        {chip.label}
                    </button>
                ))}
            </div>

            {/* Calmer Status Indicator (No Infinite Ping) */}
            <div className="flex items-center justify-between font-data text-xs tracking-wider text-zinc-400 uppercase select-none w-full px-1">
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                        <span className="inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span className="text-xs font-mono text-zinc-400">SOVEREIGN MATRIX ONLINE · 847 NODES</span>
                </div>
                {/* Delaware Legal Panel Toggle */}
                <button
                    onClick={() => setIsLegalPanelOpen(v => !v)}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 hover:border-sky-500/50 text-sky-400 transition-all cursor-pointer"
                >
                    <Building2 size={11} />
                    <span className="text-xs font-bold tracking-wider">DRULPA</span>
                    <ChevronDown size={11} className={`transition-transform duration-200 ${isLegalPanelOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Delaware Series Topology + SEC Chain of Custody — collapsible */}
            <AnimatePresence>
                {isLegalPanelOpen && (
                    <motion.div
                        key="legal-panel"
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden w-full"
                    >
                        <DelawareSeriesTopologyCard />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
