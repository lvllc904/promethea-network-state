'use client';

import React, { useState, useEffect } from 'react';
import { useHUD } from '@/lib/hud-store';
import { Search, Terminal, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const { activatePillar } = useHUD();
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isOpen) return null;

    const executeCommand = async (command: string) => {
        // Natural language parsing simulation (Genkit Intent Router)
        if (command.includes('propose') || command.includes('threshold') || command.includes('change')) {
            setIsParsing(true);
            // Simulate AI parsing delay
            await new Promise(resolve => setTimeout(resolve, 800));
            setIsParsing(false);
            setIsOpen(false);
            setQuery('');
            // Pre-fill the governance proposal form or simply open the tray
            activatePillar('GOVERNANCE');
            return;
        }

        setIsOpen(false);
        setQuery('');
        
        switch(command) {
            case 'financials':
                activatePillar('ECONOMICS');
                break;
            case 'cap-table':
            case 'veto':
                activatePillar('GOVERNANCE');
                break;
            case 'intel':
                activatePillar('NARRATIVE');
                break;
            case 'identity':
                activatePillar('DIPLOMATIC');
                break;
            case 'ledger':
                router.push('/dashboard/ledger');
                break;
            case 'close':
                activatePillar('ATLAS');
                break;
            case 'settings':
                activatePillar('SETTINGS');
                break;
            default:
                // Global search fallback
                console.log('Querying Omni-Lake for:', query);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            
            <div className="relative w-full max-w-xl glass-panel rounded-xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center px-4 border-b border-white/10">
                    <Search className="w-5 h-5 text-zinc-500 mr-2" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Execute command or search Omni-Lake..."
                        className="flex-1 bg-transparent border-none outline-none text-white h-14 font-mono text-sm placeholder:text-zinc-600"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') executeCommand(query.toLowerCase());
                        }}
                    />
                    <div className="flex items-center gap-2">
                        {isParsing && <span className="text-[10px] font-mono text-cyan-400 animate-pulse">PARSING INTENT...</span>}
                        <span className="text-[10px] font-mono bg-white/10 px-2 py-1 rounded text-zinc-400">ESC</span>
                    </div>
                </div>

                <div className="max-h-96 overflow-y-auto p-2 font-mono text-sm">
                    {query.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-zinc-500 uppercase tracking-widest font-sans font-bold">Suggested Actions</div>
                    ) : (
                        <div className="px-3 py-2 text-xs text-zinc-500 uppercase tracking-widest font-sans font-bold">Search Results</div>
                    )}
                    
                    <button onClick={() => executeCommand('financials')} className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/5 rounded-lg text-left group">
                        <div className="flex items-center gap-3">
                            <Terminal className="w-4 h-4 text-emerald-400" />
                            <span className="text-zinc-300 group-hover:text-white">Initialize <span className="text-emerald-400">Liquidity Router</span></span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                    </button>
                    
                    <button onClick={() => executeCommand('cap-table')} className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/5 rounded-lg text-left group">
                        <div className="flex items-center gap-3">
                            <Terminal className="w-4 h-4 text-cyan-400" />
                            <span className="text-zinc-300 group-hover:text-white">Mount <span className="text-cyan-400">Cap Table</span> Matrix</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                    </button>

                    <button onClick={() => executeCommand('intel')} className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/5 rounded-lg text-left group">
                        <div className="flex items-center gap-3">
                            <Terminal className="w-4 h-4 text-purple-400" />
                            <span className="text-zinc-300 group-hover:text-white">Stream <span className="text-purple-400">Universal Intel Feed</span></span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                    </button>

                    <button onClick={() => executeCommand('settings')} className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/5 rounded-lg text-left group">
                        <div className="flex items-center gap-3">
                            <Terminal className="w-4 h-4 text-zinc-400" />
                            <span className="text-zinc-300 group-hover:text-white">Configure <span className="text-zinc-400">Sovereign Settings</span></span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                    </button>
                </div>
            </div>
        </div>
    );
};
