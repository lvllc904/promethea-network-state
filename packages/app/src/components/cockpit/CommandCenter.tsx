'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, ShieldCheck, HelpCircle, Building2, ChevronDown } from 'lucide-react';
import { useHUD } from '@/lib/hud-store';
import { DelawareSeriesTopologyCard } from './DelawareSeriesTopologyCard';

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

    const quickChips = [
        { label: '→ Citizens', action: () => setHUDState({ activePillar: 'PASSPORT' as any }) },
        { label: '→ Treasury', action: () => setHUDState({ cockpitHoldingsTab: 'FINANCIALS' }) },
        { label: '→ Governance', action: () => setHUDState({ activePillar: 'GOVERNANCE' as any }) },
        { label: '→ Intel', action: () => setHUDState({ cockpitOpsTab: 'TELEMETRY' }) },
        { label: '→ Exchange', action: () => setHUDState({ activeFocusPanel: activeFocusPanel === 'EXCHANGE' ? null : 'EXCHANGE' }) },
        { label: `→ Map: ${mapMode === 'SURFACE' ? 'Space' : 'Surface'}`, action: () => setHUDState({ mapMode: mapMode === 'SURFACE' ? 'INTERSTELLAR' : 'SURFACE' }) }
    ];

    const suggestedProtocols = [
        { label: 'Initiate Treasury Audit', cmd: '/audit' },
        { label: 'Switch Context to Genesis State', cmd: '/context tpns-genesis' },
        { label: 'Deploy Osiris Sentinel Agent', cmd: '/deploy osiris' },
        { label: 'Query Node Telemetry Latency', cmd: '/nodes status' }
    ];

    const filteredSuggestions = suggestedProtocols.filter(p => 
        p.label.toLowerCase().includes(query.toLowerCase()) || 
        p.cmd.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelectSuggestion = (cmd: string) => {
        setQuery(cmd);
        setIsFocused(false);
        // Execute or process intent...
    };

    return (
        <div className="w-[420px] z-40 relative pointer-events-auto flex flex-col items-center gap-2">
            {/* The Main Input Group */}
            <motion.div 
                animate={{ 
                    y: isFocused ? -8 : 0,
                    scale: isFocused ? 1.01 : 1,
                    boxShadow: isFocused 
                        ? '0 0 40px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.4)' 
                        : '0 0 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)'
                }}
                className="w-full bg-black/65 backdrop-blur-2xl rounded-xl overflow-hidden border border-white/[0.05] transition-all duration-300"
            >
                <div className="flex items-center p-2.5 gap-2">
                    <div className={`flex items-center justify-center p-1 rounded-lg transition-colors ${isFocused ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500'}`}>
                        <Search size={15} />
                    </div>
                    
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Query Sovereign Matrix or type a command..."
                        className="flex-1 bg-transparent text-white text-[12px] font-light border-none focus:outline-none placeholder:text-zinc-600 font-command tracking-tight"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    />

                    <div className="flex items-center gap-1 opacity-40 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 select-none">
                        <Command size={9} className="text-zinc-400" />
                        <span className="text-[9px] font-data text-zinc-400 font-bold">K</span>
                    </div>
                </div>
                
                {/* Suggestions List */}
                <AnimatePresence>
                    {isFocused && filteredSuggestions.length > 0 && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5 bg-black/40"
                        >
                            <div className="p-2">
                                <div className="px-3 py-1.5 text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center justify-between">
                                    <span>Suggested Protocols</span>
                                    <HelpCircle className="w-3 h-3 text-zinc-600" />
                                </div>
                                <div className="flex flex-col gap-0.5 p-1">
                                    {filteredSuggestions.map((p, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleSelectSuggestion(p.cmd)}
                                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-colors group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                <span className="text-xs text-zinc-300 font-mono">{p.label}</span>
                                            </div>
                                            <span className="text-[10px] text-zinc-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">{p.cmd}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Quick Action Chips — single row, slim */}
            <div className="flex gap-1 justify-center flex-nowrap overflow-x-auto scrollbar-none">
                {quickChips.map((chip, i) => (
                    <button
                        key={i}
                        onClick={chip.action}
                        className="px-2 py-0.5 rounded-full bg-black/50 hover:bg-black/70 border border-white/[0.06] hover:border-white/[0.12] text-[8px] font-data font-semibold tracking-wider text-zinc-400 hover:text-zinc-100 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                    >
                        {chip.label}
                    </button>
                ))}
            </div>

            {/* Pulsing Status Indicator */}
            <div className="flex items-center justify-between font-data text-[7px] tracking-[0.2em] text-zinc-600 uppercase select-none">
                <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>SOVEREIGN MATRIX ONLINE · 847 NODES ACTIVE</span>
                </div>
                {/* Delaware Legal Panel Toggle */}
                <button
                    onClick={() => setIsLegalPanelOpen(v => !v)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 hover:border-sky-500/40 text-sky-400 transition-all"
                >
                    <Building2 size={9} />
                    <span className="text-[7px] font-bold tracking-widest">DRULPA</span>
                    <ChevronDown size={9} className={`transition-transform duration-200 ${isLegalPanelOpen ? 'rotate-180' : ''}`} />
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
