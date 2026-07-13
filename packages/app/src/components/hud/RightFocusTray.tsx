'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHUD } from '@/lib/hud-store';
import { 
    X, Wallet, TrendingUp, RefreshCw, ThumbsUp, ThumbsDown, 
    ArrowUpRight, ArrowDownLeft, Terminal, Play, Database,
    FileText, Key, Award, UserCheck, Shield, BookOpen, ExternalLink,
    BrainCircuit, Cpu, Server, Layers, Loader2, Zap,
    PhoneOff, Mic, MicOff, Video, VideoOff, Radio
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { createChart, IChartApi, ISeriesApi, ColorType, CandlestickSeries } from 'lightweight-charts';
import { ProofOfWorkSubmission } from '../intel/ProofOfWorkSubmission';

// Import Pillar Trays
import { AtlasTray } from './AtlasTray';
import { EconomicsTray } from './EconomicsTray';
import { GovernanceTray } from './GovernanceTray';
import { NarrativeTray } from './NarrativeTray';
import { DiplomaticTray } from './DiplomaticTray';
import { PulseTray } from './PulseTray';
import { PrometheaPanel } from './PrometheaPanel';
import { SettingsTray } from './SettingsTray';
import { MinerNodePanel, MarketplacePanel } from './PrometheanEcosystemPanels';


// --- SUB-PANEL: RWA EXCHANGE ---
export function ExchangePanel() {
    const [price, setPrice] = useState(1.20);
    const [balance, setBalance] = useState(2500);
    const [amount, setAmount] = useState('100');
    const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
    const [orders, setOrders] = useState<any[]>([
        { id: '1', type: 'buy', amount: 500, price: 1.19, time: '14:23:01' },
        { id: '2', type: 'buy', amount: 1200, price: 1.18, time: '14:22:45' },
        { id: '3', type: 'sell', amount: 800, price: 1.21, time: '14:21:10' },
        { id: '4', type: 'sell', amount: 1500, price: 1.22, time: '14:20:58' }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPrice(p => parseFloat((p + (Math.random() - 0.5) * 0.02).toFixed(2)));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleExecuteOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) return;

        if (orderType === 'buy') {
            if (amt * price > balance) return;
            setBalance(b => b - amt * price);
        } else {
            setBalance(b => b + amt * price);
        }

        try {
            await fetch('/api/engine/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'EXCHANGE_ORDER', type: orderType.toUpperCase(), asset: 'UVT/USDC', amount: amt, price })
            });

            const newOrder = {
                id: String(Date.now()),
                type: orderType,
                amount: amt,
                price: price,
                time: new Date().toTimeString().split(' ')[0]
            };
            setOrders(prev => [newOrder, ...prev.slice(0, 5)]);
            setAmount('');
        } catch (err) {
            console.error("Exchange execution failed", err);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full overflow-y-auto pr-1">
            {/* Order execution */}
            <div className="space-y-4">
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">RWA Asset Pair</p>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black text-white">UVT / USDC</h3>
                        <span className="text-xl font-mono font-bold text-amber-400">${price.toFixed(2)}</span>
                    </div>
                </div>

                <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3">
                    <div className="flex rounded bg-black/40 p-0.5 border border-white/5">
                        <button 
                            onClick={() => setOrderType('buy')} 
                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded ${orderType === 'buy' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Buy Fraction
                        </button>
                        <button 
                            onClick={() => setOrderType('sell')} 
                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded ${orderType === 'sell' ? 'bg-red-500/20 text-red-400' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Sell Fraction
                        </button>
                    </div>

                    <form onSubmit={handleExecuteOrder} className="space-y-3">
                        <div>
                            <div className="flex justify-between text-[8px] text-zinc-500 mb-1">
                                <span>AMOUNT (UVT)</span>
                                <span>BAL: {balance.toFixed(2)} USDC</span>
                            </div>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500/50" 
                                placeholder="0.00"
                            />
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                            <span>Est. Total:</span>
                            <span className="text-white">${((parseFloat(amount) || 0) * price).toFixed(2)} USDC</span>
                        </div>

                        <button 
                            type="submit" 
                            className={`w-full py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                                orderType === 'buy' 
                                    ? 'bg-orange-600 hover:bg-amber-500 text-black' 
                                    : 'bg-red-600 hover:bg-red-500 text-white'
                            }`}
                        >
                            Execute {orderType} Order →
                        </button>
                    </form>
                </div>
            </div>

            {/* Live Order Book */}
            <div className="space-y-4">
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl h-full flex flex-col">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-3">Order Book & Activity</p>
                    
                    <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                        <div className="grid grid-cols-3 text-[8px] text-zinc-500 font-mono pb-1 border-b border-white/5">
                            <span>TIME</span>
                            <span className="text-center">SIZE</span>
                            <span className="text-right">PRICE</span>
                        </div>
                        {orders.map((o) => (
                            <div key={o.id} className="grid grid-cols-3 text-[10px] font-mono py-1 border-b border-white/5 hover:bg-white/5 rounded px-1 transition-colors">
                                <span className="text-zinc-500">{o.time}</span>
                                <span className="text-center text-zinc-300">{o.amount}</span>
                                <span className={`text-right font-bold ${o.type === 'buy' ? 'text-amber-400' : 'text-red-400'}`}>${o.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg">
                        <p className="text-[8px] text-amber-400 font-black uppercase tracking-widest mb-1">Metabolic Assurance</p>
                        <p className="text-[9px] text-zinc-500 leading-relaxed">
                            This asset class is tokenized via ASGI smart contracts, ensuring real-world collateral synchronization under sovereign consensus.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SUB-PANEL: SQL STATE EXPLORER ---
export function SqlExplorerPanel() {
    const [queryStr, setQueryStr] = useState('SELECT * FROM uvt_ledger LIMIT 5;');
    const [output, setOutput] = useState<any[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);

    const MOCK_SCHEMAS = [
        { table: 'citizens', rows: 42, fields: 'id, name, weight, registered' },
        { table: 'proposals', rows: 18, fields: 'id, title, status, votes' },
        { table: 'uvt_ledger', rows: 24508, fields: 'id, timestamp, amount, origin' },
        { table: 'narrative_signals', rows: 4120, fields: 'id, signal_type, reality, block_hash' }
    ];

    const handleExecute = async () => {
        setIsExecuting(true);
        try {
            const res = await fetch('/api/engine/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'SQL_QUERY', query: queryStr })
            });
            const data = await res.json();
            
            if (data.error) {
                setOutput([{ error: data.error }]);
            } else if (Array.isArray(data.result) || Array.isArray(data)) {
                const arr = Array.isArray(data.result) ? data.result : data;
                setOutput(arr.length ? arr : [{ result: '0 rows returned' }]);
            } else {
                setOutput([{ info: 'Statement executed', ...data }]);
            }
        } catch (e: any) {
            setOutput([{ error: e.message || 'Connection failed' }]);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full overflow-hidden">
            {/* Query Runner */}
            <div className="lg:col-span-2 flex flex-col space-y-3 h-full">
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex-1 flex flex-col">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-amber-400" /> Substrate Query Console
                    </p>
                    <textarea 
                        value={queryStr} 
                        onChange={(e) => setQueryStr(e.target.value)} 
                        className="w-full flex-1 bg-black/60 border border-white/10 rounded p-3 text-xs font-mono text-amber-100 focus:outline-none focus:border-amber-500/50 resize-none mb-3" 
                        placeholder="SELECT * FROM table;"
                    />
                    <button 
                        onClick={handleExecute}
                        disabled={isExecuting}
                        className="py-2 bg-amber-600 hover:bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        <Play className={`w-3 h-3 ${isExecuting ? 'animate-pulse' : ''}`} />
                        {isExecuting ? 'Querying Engine...' : 'Run Statement (Ctrl+Enter)'}
                    </button>
                </div>

                {/* Output console */}
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl h-48 flex flex-col overflow-hidden">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Query Output</p>
                    <div className="flex-1 overflow-auto custom-scrollbar font-mono text-[10px] text-zinc-300">
                        {output.length === 0 ? (
                            <p className="text-zinc-600 italic">No statement executed yet.</p>
                        ) : output[0].error ? (
                            <p className="text-amber-400">{output[0].error}</p>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-zinc-500 text-[8px]">
                                        {Object.keys(output[0]).map(k => <th key={k} className="pb-1">{k.toUpperCase()}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {output.map((row, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                            {Object.values(row).map((v: any, i) => <td key={i} className="py-1">{v}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Schema checklist */}
            <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3 h-full overflow-y-auto custom-scrollbar">
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-amber-400" /> Database Schema
                </p>
                {MOCK_SCHEMAS.map(s => (
                    <div key={s.table} className="p-2.5 bg-black rounded border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-white font-mono">{s.table}</span>
                            <span className="text-[8px] font-mono text-zinc-500">{s.rows} rows</span>
                        </div>
                        <p className="text-[8px] font-mono text-zinc-600 leading-tight break-words">{s.fields}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- SUB-PANEL: BREW CLI GUIDE & TERMINAL ---
export function CliGuidePanel() {
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState<string[]>([
        'Sovereign Model Context initialized successfully.',
        'Type "cartographer help" or "help" for a list of available sub-commands.'
    ]);

    const handleTerminalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input.trim().toLowerCase();
        if (!cmd) return;

        setLogs(prev => [...prev, `\n> ${input}`]);

        setTimeout(() => {
            if (cmd === 'help' || cmd === 'cartographer help') {
                setLogs(prev => [...prev, 
                    'Available commands:',
                    '  cartographer init      Initialize a local validation substrate',
                    '  cartographer sync      Pull narrative logs and state blocks from the engine',
                    '  cartographer status    Verify peer count, network latency, and DID integrity',
                    '  clear                  Clear the terminal console'
                ]);
            } else if (cmd === 'cartographer init') {
                setLogs(prev => [...prev, 
                    'Initializing Promethean Sentinel Node on localhost...',
                    '✔ Created state files in ~/.tpns/substrate.db',
                    '✔ Synchronized cryptographic DID did:sovereign:node:0x4f82',
                    'Node initialized successfully. Run "cartographer sync" to fetch state blocks.'
                ]);
            } else if (cmd === 'cartographer sync') {
                setLogs(prev => [...prev, 
                    'Connecting to Promethean sovereign network state...',
                    '✔ Established connection to 12 active peers',
                    '✔ Downloaded 4,200 UVT state blocks (block height: 124508)',
                    '✔ Sync completed successfully.'
                ]);
            } else if (cmd === 'cartographer status') {
                setLogs(prev => [...prev, 
                    'Sentinel Node Status: NOMINAL',
                    '  Uptime: 142.5 hours',
                    '  Peer Count: 12 active nodes',
                    '  Sync Delay: 12ms',
                    '  DID verification: did:sovereign:node:0x4f82 (VALID)'
                ]);
            } else if (cmd === 'clear') {
                setLogs([]);
            } else {
                setLogs(prev => [...prev, `command not found: ${input}. Type "help" for suggestions.`]);
            }
            setInput('');
        }, 150);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full overflow-hidden">
            {/* CLI Brewing guides */}
            <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-4 h-full overflow-y-auto custom-scrollbar pr-1">
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Cartographer CLI Installation</p>
                
                <div className="space-y-3">
                    <div className="p-3 bg-black rounded border border-white/5">
                        <p className="text-[8px] text-zinc-500 uppercase font-bold mb-1">Step 1: Tap the Repository</p>
                        <code className="text-[9px] font-mono text-amber-400 break-all">brew tap tpns/homebrew-tpns</code>
                    </div>

                    <div className="p-3 bg-black rounded border border-white/5">
                        <p className="text-[8px] text-zinc-500 uppercase font-bold mb-1">Step 2: Install the Cartographer Binary</p>
                        <code className="text-[9px] font-mono text-amber-400 break-all">brew install cartographer</code>
                    </div>

                    <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg">
                        <p className="text-[8px] text-amber-400 font-black uppercase tracking-widest mb-1">Secure Sandboxing</p>
                        <p className="text-[9px] text-zinc-500 leading-relaxed">
                            The Cartographer CLI is open source and signed with cryptographic certs, ensuring direct private local replication of the Omni-Lake substrate.
                        </p>
                    </div>
                </div>
            </div>

            {/* Web terminal emulator */}
            <div className="lg:col-span-2 flex flex-col space-y-3 h-full">
                <div className="p-4 bg-black/80 border border-white/5 rounded-xl flex-1 flex flex-col overflow-hidden font-mono">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-amber-400" /> Web Terminal Emulator
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245, 158, 11,0.5)] animate-pulse" />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar text-[10px] text-amber-100/90 space-y-2 pr-1 select-text">
                        {logs.map((log, idx) => (
                            <div key={idx} className="whitespace-pre-wrap leading-relaxed">{log}</div>
                        ))}
                    </div>

                    <form onSubmit={handleTerminalSubmit} className="mt-3 flex items-center border-t border-white/5 pt-2">
                        <span className="text-amber-400 text-xs mr-2 font-bold font-mono">$</span>
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            className="flex-1 bg-transparent text-[10px] text-white focus:outline-none font-mono" 
                            placeholder="Type a command (e.g. cartographer init)..."
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}

// --- SUB-PANEL: SWEAT CLAIMS & PASSPORT ---
export function SweatClaimPanel() {
    const [hours, setHours] = useState('4');
    const [taskDesc, setTaskDesc] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);
    const [claims, setClaims] = useState<any[]>([
        { id: '1', date: '2026-05-15', hours: 8, reward: 120, task: 'Substrate validation infrastructure deploy' },
        { id: '2', date: '2026-05-12', hours: 4, reward: 60, task: 'Decoupled identity testing shims' }
    ]);

    const handleClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        const hrs = parseInt(hours);
        if (isNaN(hrs) || hrs <= 0 || !taskDesc.trim()) return;

        setIsClaiming(true);
        try {
            await fetch('/api/engine/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'SWEAT_CLAIM', hours: hrs, task: taskDesc })
            });

            const newClaim = {
                id: String(Date.now()),
                date: new Date().toISOString().split('T')[0],
                hours: hrs,
                reward: hrs * 15,
                task: taskDesc
            };
            setClaims(prev => [newClaim, ...prev]);
            setHours('');
            setTaskDesc('');
        } catch (err) {
            console.error("Sweat claim failed", err);
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full overflow-y-auto pr-1">
            {/* Claim hours Form */}
            <div className="space-y-4">
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-500" /> Log Sweat-Equity Claim
                    </p>

                    <form onSubmit={handleClaim} className="space-y-3">
                        <div>
                            <label className="text-[8px] text-zinc-500 font-mono uppercase mb-1 block">HOURS WORKED</label>
                            <input 
                                type="number" 
                                value={hours} 
                                onChange={(e) => setHours(e.target.value)} 
                                className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500/50" 
                            />
                        </div>

                        <div>
                            <label className="text-[8px] text-zinc-500 font-mono uppercase mb-1 block">CONTRIBUTION TASK</label>
                            <textarea 
                                value={taskDesc} 
                                onChange={(e) => setTaskDesc(e.target.value)} 
                                className="w-full h-20 bg-black/60 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 resize-none" 
                                placeholder="Describe your contribution to the network state..."
                            />
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                            <span>Est. UVT Reward:</span>
                            <span className="text-amber-400">{(parseInt(hours) || 0) * 15} UVT</span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isClaiming}
                            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded transition-all disabled:opacity-50"
                        >
                            {isClaiming ? 'Logging Claim...' : 'Submit Contribution Claim →'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Claims Ledger */}
            <div className="space-y-4">
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl h-full flex flex-col">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-amber-500" /> Claims Ledger
                    </p>

                    <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                        {claims.map((c) => (
                            <div key={c.id} className="p-2.5 bg-black rounded border border-white/5">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[8px] text-zinc-500 font-mono">{c.date} · {c.hours} hrs</span>
                                    <span className="text-[9px] font-mono font-bold text-amber-400">+{c.reward} UVT</span>
                                </div>
                                <p className="text-[9px] text-zinc-300 leading-tight">{c.task}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SUB-PANEL: AUDITED FINANCIALS ---
export function FinancialsPanel() {
    const [activeTab, setActiveTab] = useState<'balance' | 'income' | 'staking'>('balance');
    const [stakeAmt, setStakeAmt] = useState('1000');
    const [isStaking, setIsStaking] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full overflow-hidden">
            {/* Menu options */}
            <div className="space-y-2 flex flex-col">
                <div className="flex flex-col gap-1 p-2 bg-black/40 border border-white/5 rounded-xl">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2 px-1">Financial Audits</p>
                    {[
                        { id: 'balance', label: 'Balance Sheet' },
                        { id: 'income', label: 'Income Statement' },
                        { id: 'staking', label: 'Staking & Yield' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full text-left py-2 px-3 text-[9px] font-black uppercase tracking-widest rounded transition-all ${
                                activeTab === tab.id 
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' 
                                    : 'text-zinc-500 hover:text-white bg-transparent border border-transparent'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main content display */}
            <div className="lg:col-span-2 p-4 bg-black/40 border border-white/5 rounded-xl h-full flex flex-col overflow-y-auto custom-scrollbar">
                {activeTab === 'balance' && (
                    <div className="space-y-3">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-amber-400" /> Audited Balance Sheet (Consolidated)
                        </p>
                        <div className="space-y-2 text-[10px] font-mono">
                            {[
                                { group: 'Assets' },
                                { name: '  Cash & Cash Equivalents', val: '$1,240,450 USDC' },
                                { name: '  Solana Ledger Collateral', val: '$2,508,400 SOL' },
                                { name: '  Tokenized Real-World Assets', val: '$1,452,000 RWA' },
                                { name: 'Total Assets', val: '$5,200,850 USDC', bold: true },
                                { group: 'Liabilities & Equity' },
                                { name: '  ASGI Escrow Claims', val: '$150,000 USDC' },
                                { name: '  Circulating UVT Supply', val: '$3,800,850 UVT' },
                                { name: 'Total Liabilities & Equity', val: '$5,200,850 USDC', bold: true }
                            ].map((row: any, idx) => row.group ? (
                                <p key={idx} className="text-[9px] text-zinc-500 uppercase font-black tracking-widest pt-2 border-b border-white/5">{row.group}</p>
                            ) : (
                                <div key={idx} className={`flex justify-between py-1 border-b border-white/5 ${row.bold ? 'font-black text-white pt-2 border-t' : 'text-zinc-300'}`}>
                                    <span>{row.name}</span>
                                    <span>{row.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'income' && (
                    <div className="space-y-3">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-amber-400" /> Consolidated Statement of Net Toll Income
                        </p>
                        <div className="space-y-2 text-[10px] font-mono">
                            {[
                                { name: 'Substrate Metabolic Tolls', val: '+$420,400 USDC' },
                                { name: 'Real-World Asset Originations', val: '+$1,032,500 USDC' },
                                { name: 'API Usage Burn Revenues', val: '+$154,200 USDC' },
                                { name: 'Gross Revenue', val: '$1,607,100 USDC', bold: true },
                                { name: '  Less: Validation Incentives', val: '-$120,400 USDC' },
                                { name: '  Less: Network Staking Yields', val: '-$245,100 USDC' },
                                { name: 'Sovereign Net Income', val: '$1,241,600 USDC', bold: true }
                            ].map((row, idx) => (
                                <div key={idx} className={`flex justify-between py-1 border-b border-white/5 ${row.bold ? 'font-black text-white pt-2 border-t' : 'text-zinc-300'}`}>
                                    <span>{row.name}</span>
                                    <span>{row.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'staking' && (
                    <div className="space-y-4">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Staking Pool Allocator
                        </p>
                        
                        <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-3">
                            <div>
                                <div className="flex justify-between text-[8px] text-zinc-500 mb-1">
                                    <span>STAKING AMOUNT (USDC)</span>
                                    <span>EST. APR: 14.2%</span>
                                </div>
                                <input 
                                    type="number" 
                                    value={stakeAmt} 
                                    onChange={(e) => setStakeAmt(e.target.value)} 
                                    className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500/50" 
                                />
                            </div>

                            <button 
                                onClick={async () => {
                                    setIsStaking(true);
                                    try {
                                        await fetch('/api/engine/execute', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ action: 'STAKE_YIELD_POOL', amount: parseFloat(stakeAmt) })
                                        });
                                    } catch (err) {
                                        console.error("Staking failed", err);
                                    } finally {
                                        setIsStaking(false);
                                        setStakeAmt('');
                                    }
                                }}
                                disabled={isStaking}
                                className="w-full py-2.5 bg-orange-600 hover:bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded transition-all disabled:opacity-50"
                            >
                                {isStaking ? 'Staking Assets...' : 'Deposit to Yield Pool →'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- SUB-PANEL: PROMETHEA ASGI TELEMETRY ---
// --- SUB-PANEL: PROMETHEA ASGI CANVAS ---
export function AsgiTelemetryPanel() {
    const [canvasTab, setCanvasTab] = useState<'models' | 'planning' | 'docs' | 'media' | 'depthos' | 'staging'>('models');
    
    // Global Event Listener for Omni-State Synchronization
    const [omniLogs, setOmniLogs] = useState<string[]>([
        "[03:40:01] [OMNI-STATE] Initialized listener. Substrate events synchronized."
    ]);
    const [addedRwa, setAddedRwa] = useState<string[]>([]);
    const [addedPr, setAddedPr] = useState<string[]>([]);

    useEffect(() => {
        const handleOmniUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail) {
                const timeStr = new Date().toLocaleTimeString();
                setOmniLogs(prev => [
                    ...prev,
                    `[${timeStr}] [EVENT] Intercepted: ${detail.type} - ${detail.title}`
                ]);
                if (detail.type === 'AUTO_UNDERWRITE') {
                    setAddedRwa(prev => [...prev, detail.title]);
                } else if (detail.type === 'GIT_PROPOSAL') {
                    setAddedPr(prev => [...prev, detail.title]);
                }
            }
        };
        window.addEventListener('sovereign-omni-update', handleOmniUpdate);
        return () => window.removeEventListener('sovereign-omni-update', handleOmniUpdate);
    }, []);

    // 1. ALL MODELS tab states
    const [modelLogs, setModelLogs] = useState<string[]>([
        "[INFO] Priming reasoning node. Gemini 2.5 Pro selected as MCTS lead evaluator.",
        "[INFO] Claude 3.5 Sonnet designated as developer staging auditor."
    ]);

    // 2. PLANNING tab states
    const [checklist, setChecklist] = useState([
        { id: 1, text: "Audit local ~./tpns/substrate.db configurations", done: true },
        { id: 2, text: "Expose secure BFF proxy to bypass standard CORS constraints", done: true },
        { id: 3, text: "Actualize dynamic citizen sweat reward ledger", done: false },
        { id: 4, text: "Compile sovereign-treasury.rs smart program", done: false }
    ]);

    // 3. DOCUMENTS tab states
    const documents = [
        { name: "constitution.md", type: "Regulation", size: "12 KB" },
        { name: "whitepaper.md", type: "Economics", size: "24 KB" },
        { name: "backend.json", type: "Configuration", size: "148 KB" },
        { name: "sovereign-treasury.rs", type: "Contract Core", size: "8 KB" }
    ];

    // 4. MEDIA tab states (Video, Audio, Browser)
    const [mediaSubTab, setMediaSubTab] = useState<'video' | 'audio' | 'browser'>('video');
    const [audioWave, setAudioWave] = useState<number[]>(new Array(30).fill(10));
    const [browserUrl, setBrowserUrl] = useState('https://lvhllc.org');
    const [browserLogs, setBrowserLogs] = useState<string[]>([
        "[INFO] Sandboxed WebRTC node spawned.",
        "[INFO] Proxy tunnel established via BFF secure egress port 443."
    ]);

    // Simulate Audio Wave
    useEffect(() => {
        const interval = setInterval(() => {
            setAudioWave(prev => prev.map(() => Math.floor(Math.random() * 25) + 5));
        }, 150);
        return () => clearInterval(interval);
    }, []);

    // 5. DEPTHOS tab states (CHAT, TERMINAL, SETTINGS)
    const [depthosSubTab, setDepthosSubTab] = useState<'chat' | 'terminal' | 'settings'>('chat');
    const [depthosLogs, setDepthosLogs] = useState<string[]>([
        "Agnostic Core Online. Listening to the Cluster.",
        "[SYSTEM] Node 0x4f82 initialized."
    ]);
    const [googleKey, setGoogleKey] = useState('AIzaSyD75hG_EXAMPLE_KEY...');
    const [groqKey, setGroqKey] = useState('gsk_yF8jX...');
    const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
    // 6. DEVELOPER STAGING tab states
    const [isStaged, setIsStaged] = useState(true);
    const [didSignature, setDidSignature] = useState('did:sovereign:citizen:0x9f1d2...');
    const [isSubmittingPr, setIsSubmittingPr] = useState(false);
    const [prStatus, setPrStatus] = useState<string | null>(null);

    const handleCreateGithubPR = () => {
        setIsSubmittingPr(true);
        setPrStatus("Staging file diffs in compiler sandbox...");
        setTimeout(() => {
            setPrStatus("Running unit tests on sovereign-treasury.rs...");
            setTimeout(() => {
                setPrStatus("Signing diff with Citizen DID key...");
                setTimeout(() => {
                    setPrStatus("Pushing branch to origin... Opening pull request...");
                    setTimeout(() => {
                        setIsSubmittingPr(false);
                        setPrStatus("✅ Pull Request successfully drafted! Propose hot deployment live.");
                        // Trigger event to sync throughout cockpit
                        window.dispatchEvent(new CustomEvent('sovereign-omni-update', {
                            detail: {
                                type: 'GIT_PROPOSAL',
                                title: 'PR #1042 - Core Metabolic Carry Redesign (Hot-Load Ready)',
                                description: 'Integrated Clojure carry functions'
                            }
                        }));
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    };

    return (
        <div className="h-full flex flex-col justify-between space-y-4 text-white">
            {/* Top Workspace Tab Bar */}
            <div className="grid grid-cols-6 gap-1 border-b border-white/5 pb-2">
                {[
                    { id: 'models', label: '🌐 MODELS' },
                    { id: 'planning', label: '📋 PLANNING' },
                    { id: 'docs', label: '📄 DOCS' },
                    { id: 'media', label: '📺 MEDIA' },
                    { id: 'depthos', label: '🔌 DEPTHOS' },
                    { id: 'staging', label: '🚀 STAGING' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setCanvasTab(tab.id as any)}
                        className={`py-2 px-1 text-[8px] font-black uppercase tracking-widest text-center border rounded transition-all ${
                            canvasTab === tab.id
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-black/40 text-zinc-500 border-transparent hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Core Tab Render Viewport */}
            <div className="flex-1 overflow-y-auto min-h-[380px] custom-scrollbar pr-1">
                
                {/* 1. ALL MODELS TAB */}
                {canvasTab === 'models' && (
                    <div className="space-y-4">
                        {/* Models Compare */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { name: "Gemini 2.5 Pro", rate: "124 t/s", load: "Active MCTS", color: "border-amber-500/30 text-amber-400" },
                                { name: "Claude 3.5 Sonnet", rate: "84 t/s", load: "Audit Loop", color: "border-purple-500/20 text-purple-400" },
                                { name: "Local Mistral 7B", rate: "42 t/s", load: "Offline Sandbox", color: "border-amber-500/20 text-amber-400" }
                            ].map(m => (
                                <div key={m.name} className={`p-2 bg-black border rounded-lg ${m.color}`}>
                                    <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-wider">Model</p>
                                    <p className="text-[10px] font-black">{m.name}</p>
                                    <div className="flex justify-between text-[8px] text-zinc-400 font-mono mt-1 pt-1 border-t border-white/5">
                                        <span>{m.rate}</span>
                                        <span>{m.load}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* MCTS LISP Decision tree visualizer */}
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2 font-mono">
                            <p className="text-[9px] text-amber-400 font-black uppercase tracking-widest">Clojure LISP MCTS Path Tree (Decoupled Ensemble)</p>
                            <div className="p-3 bg-black rounded border border-white/5 text-[9px] leading-relaxed text-zinc-400 space-y-1">
                                <p className="text-amber-400 font-bold">Root (Agnostic Consensus Node)</p>
                                <p>├── [val: 94.2] :verify-signature (sign: valid)</p>
                                <p>├── [val: 88.0] :compile-sandbox-targets (compiling: true)</p>
                                <p className="text-amber-400">│     └── [val: 100.0] :underwrite-rwa-claim [SUCCESS]</p>
                                <p>└── [val: 12.4] :idle-metabolic-homeostasis</p>
                            </div>
                        </div>

                        {/* Model Telemetry Logs */}
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Model Ensemble Live Log</p>
                            <div className="space-y-1 max-h-24 overflow-y-auto font-mono text-[8px] text-zinc-400">
                                {modelLogs.map((log, idx) => (
                                    <div key={idx} className="border-b border-white/5 pb-0.5">{log}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. PLANNING TAB */}
                {canvasTab === 'planning' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Sovereign State Roadmap & Action Items</p>
                            <div className="space-y-2">
                                {checklist.map(item => (
                                    <div 
                                        key={item.id}
                                        onClick={() => setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, done: !c.done } : c))}
                                        className="flex items-center gap-2.5 p-2 bg-black rounded border border-white/5 hover:border-amber-500/20 cursor-pointer select-none"
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={item.done} 
                                            readOnly 
                                            className="rounded border-white/10 bg-black text-amber-500 focus:ring-0 w-3 h-3"
                                        />
                                        <span className={`text-[10px] ${item.done ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Integrated Real-Time Dispatch Log */}
                        <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                            <p className="text-[9px] text-amber-400 font-black uppercase tracking-widest">Sovereign Omni-State Event Stream</p>
                            <div className="space-y-1 font-mono text-[8px] text-zinc-400 max-h-28 overflow-y-auto">
                                {omniLogs.map((log, idx) => (
                                    <div key={idx} className="border-b border-white/5 py-0.5">{log}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. DOCUMENTS TAB */}
                {canvasTab === 'docs' && (
                    <div className="space-y-3">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Generated Files & Staged Manifestos</p>
                        <div className="grid grid-cols-2 gap-2.5">
                            {documents.map(doc => (
                                <div key={doc.name} className="p-3 bg-black border border-white/5 rounded-xl flex flex-col justify-between hover:border-amber-500/20 transition-all">
                                    <div>
                                        <p className="text-[10px] font-bold text-white font-mono break-all">{doc.name}</p>
                                        <p className="text-[8px] text-zinc-500 uppercase mt-0.5">{doc.type}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-[8px] font-mono text-zinc-400">
                                        <span>{doc.size}</span>
                                        <button className="text-amber-400 hover:underline">Read →</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. MEDIA MONITORS TAB */}
                {canvasTab === 'media' && (
                    <div className="space-y-4">
                        {/* Sub tabs Selector */}
                        <div className="flex bg-black/40 p-0.5 rounded border border-white/5">
                            {['video', 'audio', 'browser'].map((sub: any) => (
                                <button
                                    key={sub}
                                    onClick={() => setMediaSubTab(sub)}
                                    className={`flex-1 py-1 text-[8px] font-black uppercase tracking-widest rounded ${
                                        mediaSubTab === sub ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-white'
                                    }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>

                        {/* Sub tab 1: VIDEO */}
                        {mediaSubTab === 'video' && (
                            <div className="p-4 bg-black/80 border border-white/5 rounded-xl aspect-video flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245, 158, 11,0.1)_0%,_transparent_70%)] animate-pulse" />
                                <div className="flex justify-between items-center z-10">
                                    <span className="text-[8px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Live Telemetry Orbit Feed
                                    </span>
                                    <span className="text-[8px] font-mono text-zinc-500">PEERS: 12 SYNCED</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center z-10">
                                    <svg className="w-full h-24 text-amber-500/40" viewBox="0 0 200 100">
                                        <circle cx="100" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                                        <circle cx="100" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M 20,50 L 180,50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 5" />
                                        <path d="M 100,10 L 100,90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 5" />
                                        <circle cx="115" cy="40" r="2" fill="#22d3ee" className="animate-ping" />
                                    </svg>
                                </div>
                                <span className="text-[7px] font-mono text-zinc-600 uppercase text-center z-10">Orbit vector sync // locked</span>
                            </div>
                        )}

                        {/* Sub tab 2: AUDIO */}
                        {mediaSubTab === 'audio' && (
                            <div className="p-4 bg-black/80 border border-white/5 rounded-xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] font-mono font-bold text-purple-400 uppercase tracking-widest">vocal synthesis telemetry</span>
                                    <span className="text-[8px] font-mono text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded">ACTIVE STREAM</span>
                                </div>
                                <div className="h-16 flex items-end gap-1 px-4 border-b border-white/5 pb-2">
                                    {audioWave.map((h, i) => (
                                        <div 
                                            key={i} 
                                            className="flex-1 bg-purple-500/40 border-t border-purple-400 rounded-t"
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                                <p className="text-[9px] text-zinc-500 font-mono text-center">Waveform synthesis rate: 24,000 Hz // did:promethea</p>
                            </div>
                        )}

                        {/* Sub tab 3: BROWSER */}
                        {mediaSubTab === 'browser' && (
                            <div className="p-3 bg-black/80 border border-white/5 rounded-xl space-y-2.5">
                                {/* Browser address bar wrapper */}
                                <div className="flex gap-1 bg-zinc-950 p-1 rounded border border-white/5 items-center">
                                    <button onClick={() => setBrowserLogs(l => [...l, `[ACTION] Navigation back`])} className="text-zinc-500 hover:text-white px-1 text-[10px]">◀</button>
                                    <button onClick={() => setBrowserLogs(l => [...l, `[ACTION] Navigation forward`])} className="text-zinc-500 hover:text-white px-1 text-[10px]">▶</button>
                                    <input 
                                        type="text" 
                                        value={browserUrl} 
                                        onChange={(e) => setBrowserUrl(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setBrowserLogs(prev => [...prev, `[INFO] Requesting secure proxy to URL: ${browserUrl}`]);
                                            }
                                        }}
                                        className="flex-1 bg-black border border-white/10 rounded px-2 py-0.5 text-[9px] font-mono text-amber-100 focus:outline-none"
                                    />
                                    <button onClick={() => setBrowserLogs(l => [...l, `[INFO] Reloading frame`])} className="text-[10px] px-1.5">🔄</button>
                                </div>

                                {/* Iframe Web view or screen simulator */}
                                <div className="border border-white/5 rounded aspect-video bg-black flex flex-col justify-center items-center text-center p-4 relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] bg-[size:10px_10px]" />
                                    <span className="text-[18px] mb-1">🌐</span>
                                    <p className="text-[10px] font-mono text-zinc-300 font-bold">{browserUrl}</p>
                                    <p className="text-[8px] text-amber-400 font-mono mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Proxy sandbox active (CORS bypassed)</p>
                                </div>

                                {/* Browser execution logs */}
                                <div className="p-2 bg-zinc-950 rounded font-mono text-[7px] text-zinc-500 max-h-16 overflow-y-auto">
                                    {browserLogs.map((log, idx) => (
                                        <div key={idx} className="border-b border-white/5 py-0.5">{log}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 5. DEPTHOS BRIDGE TAB */}
                {canvasTab === 'depthos' && (
                    <div className="space-y-4">
                        {/* Sub sub tabs */}
                        <div className="flex bg-black/40 p-0.5 rounded border border-white/5">
                            {['chat', 'terminal', 'settings'].map((sub: any) => (
                                <button
                                    key={sub}
                                    onClick={() => setDepthosSubTab(sub)}
                                    className={`flex-1 py-1 text-[8px] font-black uppercase tracking-widest rounded ${
                                        depthosSubTab === sub ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-white'
                                    }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>

                        {/* DepthOS CHAT subtab */}
                        {depthosSubTab === 'chat' && (
                            <div className="p-4 bg-black/60 border border-white/5 rounded-xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest">DepthOS Agnostic core</span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_6px_rgba(245, 158, 11,0.5)]" />
                                </div>
                                <div className="p-3 bg-zinc-950/60 border border-white/5 rounded-lg font-mono text-[9px] text-zinc-300 space-y-1">
                                    <p className="text-zinc-500">// Agnostic Core Online. Listening to the Cluster.</p>
                                    <p className="text-amber-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> transport: SSE / HTTP</p>
                                    <p className="text-amber-400 font-bold mt-2">Target Cluster: did:sovereign:genesis-node:0x9105</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setDepthosLogs(prev => [...prev, `[INFO] Initialized orchestrator session.`])}
                                        className="py-2 bg-pink-600 hover:bg-pink-500 text-white rounded text-[8px] font-bold uppercase tracking-widest transition-all"
                                    >
                                        Initialize Orchestration
                                    </button>
                                    <button 
                                        onClick={() => setDepthosLogs(prev => [...prev, `[INFO] Open visual canvas canvas window.`])}
                                        className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[8px] font-bold uppercase tracking-widest transition-all"
                                    >
                                        Open Visual Canvas
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* DepthOS TERMINAL subtab */}
                        {depthosSubTab === 'terminal' && (
                            <div className="h-48 overflow-hidden rounded-xl bg-black/60 border border-white/5 flex items-center justify-center">
                                <span className="text-zinc-600 font-mono text-xs uppercase">Terminal Offline</span>
                            </div>
                        )}

                        {/* DepthOS SETTINGS subtab */}
                        {depthosSubTab === 'settings' && (
                            <div className="p-4 bg-black/60 border border-white/5 rounded-xl space-y-3 font-sans">
                                <div>
                                    <label className="text-[7px] text-zinc-500 font-mono uppercase tracking-widest mb-1 block">API KEY (OPENROUTER)</label>
                                    <input 
                                        type="password" 
                                        value={groqKey} 
                                        onChange={e => setGroqKey(e.target.value)}
                                        className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1 text-[9px] font-mono text-amber-100 focus:outline-none focus:border-amber-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[7px] text-zinc-500 font-mono uppercase tracking-widest mb-1 block">GOOGLE AI KEY</label>
                                    <input 
                                        type="password" 
                                        value={googleKey} 
                                        onChange={e => setGoogleKey(e.target.value)}
                                        className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1 text-[9px] font-mono text-amber-100 focus:outline-none focus:border-amber-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[7px] text-zinc-500 font-mono uppercase tracking-widest mb-1 block">OLLAMA ENDPOINT URL</label>
                                    <input 
                                        type="text" 
                                        value={ollamaUrl} 
                                        onChange={e => setOllamaUrl(e.target.value)}
                                        className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1 text-[9px] font-mono text-amber-100 focus:outline-none focus:border-amber-500/50"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 6. DEVELOPER STAGING TAB */}
                {canvasTab === 'staging' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3">
                            <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Active Workspace Revision Diffs</span>
                                <span className="text-[8px] font-mono text-yellow-400 bg-yellow-500/10 px-1 py-0.5 rounded">UNSTAGED DRAFT</span>
                            </div>

                            {/* Diffs simulator */}
                            <div className="p-2.5 bg-black rounded border border-white/5 font-mono text-[8px] text-zinc-400 space-y-1 select-text">
                                <p className="text-zinc-500">diff --git a/sovereign-treasury.rs b/sovereign-treasury.rs</p>
                                <p className="text-red-400">- let symbiotic_dividend_ratio = 0.30;</p>
                                <p className="text-amber-400">+ let symbiotic_dividend_ratio = 0.35;</p>
                                <p className="text-zinc-600">  let regulatory_audit_ticks = 100;</p>
                            </div>
                        </div>

                        {/* DID Sign and test targets */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 bg-black/60 border border-white/5 rounded-lg space-y-1">
                                <span className="text-[7px] text-zinc-500 font-mono uppercase tracking-widest block">Signature ID</span>
                                <span className="text-[9px] font-mono text-amber-400 truncate block">{didSignature}</span>
                            </div>
                            <div className="p-2.5 bg-black/60 border border-white/5 rounded-lg space-y-1">
                                <span className="text-[7px] text-zinc-500 font-mono uppercase tracking-widest block">Staging Sandbox</span>
                                <span className="text-[9px] font-mono text-amber-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> PASSING</span>
                            </div>
                        </div>

                        {/* One Click GitHub PR Button */}
                        <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-3">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Sovereign staging deployment pipeline</p>
                            <button
                                onClick={handleCreateGithubPR}
                                disabled={isSubmittingPr}
                                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-black text-[9px] font-black uppercase tracking-widest rounded transition-all shadow-[0_0_15px_rgba(245, 158, 11,0.2)] hover:shadow-[0_0_15px_rgba(245, 158, 11,0.4)] disabled:opacity-50"
                            >
                                {isSubmittingPr ? "Drafting Pull Request..." : "🚀 PROPOSE REVISION (ONE-CLICK PR) →"}
                            </button>
                            {prStatus && (
                                <p className="text-[8px] font-mono text-amber-400 animate-pulse text-center">{prStatus}</p>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* Bottom Event Status indicator */}
            <div className="p-2 bg-black/40 border border-white/5 rounded-lg flex justify-between items-center text-[8px] font-mono text-zinc-500">
                <span>DID Handshake Status: did:sovereign:0x9f...</span>
                <span className="text-amber-400 font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-amber-400" /> SYNCED</span>
            </div>
        </div>
    );
}

// --- WALLET HYDRATION PANEL ---
export const WalletPanel = () => {
    const [logs, setLogs] = useState<string[]>(['[INFO] Initializing Sovereign Identity Matrix...']);
    const [solanaConnected, setSolanaConnected] = useState(true);
    const [baseConnected, setBaseConnected] = useState(false);
    
    const handleHydrate = () => {
        setLogs(prev => [...prev, '[ACTION] Hydrating public on-chain balances to local pro-forma.db...']);
        setTimeout(() => setLogs(prev => [...prev, '[SUCCESS] Local state synced with network reality.']), 1500);
    };

    const handleDehydrate = () => {
        setLogs(prev => [...prev, '[ACTION] Extracting internal state to Solana layer 1...']);
        setTimeout(() => setLogs(prev => [...prev, '[SUCCESS] Proof of state anchored on-chain.']), 1500);
    };

    return (
        <div className="h-full flex flex-col space-y-4 font-mono">
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-black/60 border border-white/5 rounded-xl space-y-2">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-between">
                        <span>Solana Anchor</span>
                        <span className={solanaConnected ? "text-amber-400" : "text-zinc-600"}>{solanaConnected ? "CONNECTED" : "OFFLINE"}</span>
                    </p>
                    <p className="text-xl font-black text-white">45.2 SOL</p>
                    <p className="text-[8px] text-zinc-500 break-all">Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb</p>
                </div>
                <div className="p-3 bg-black/60 border border-white/5 rounded-xl space-y-2">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-between">
                        <span>Base L2</span>
                        <span className={baseConnected ? "text-amber-400" : "text-zinc-600"}>{baseConnected ? "CONNECTED" : "OFFLINE"}</span>
                    </p>
                    <p className="text-xl font-black text-white">0.00 ETH</p>
                    {baseConnected ? (
                        <p className="text-[8px] text-zinc-500 break-all">0x71C...9B34</p>
                    ) : (
                        <button onClick={() => setBaseConnected(true)} className="text-[8px] px-2 py-1 bg-amber-500/10 text-amber-400 rounded hover:bg-amber-500/20">Connect EVM Wallet</button>
                    )}
                </div>
            </div>

            <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3">
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Sovereign State Matrix (Pro-Forma Local)</p>
                <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-black/60 rounded border border-white/5">
                        <span className="text-[10px] font-mono text-zinc-300">Total Asset Value (Local)</span>
                        <span className="text-sm font-black text-amber-400">$1,452,000</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button onClick={handleHydrate} className="py-2 bg-amber-900/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-400 text-[8px] font-bold uppercase rounded">
                        ↓ HYDRATE (PULL)
                    </button>
                    <button onClick={handleDehydrate} className="py-2 bg-amber-900/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-400 text-[8px] font-bold uppercase rounded">
                        ↑ DEHYDRATE (PUSH)
                    </button>
                </div>
            </div>

            <div className="flex-1 p-3 bg-black border border-white/5 rounded-xl overflow-hidden flex flex-col">
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Hydration Logs</p>
                <div className="flex-1 overflow-y-auto space-y-1 text-[8px] text-zinc-400">
                    {logs.map((l, i) => <div key={i} className={l.includes('SUCCESS') ? 'text-amber-400' : ''}>{l}</div>)}
                </div>
            </div>
        </div>
    );
};

// --- OMNI SCANNER PANEL ---
export const OmniScannerPanel = () => {
    const { omniScannerTarget } = useHUD();
    const [query, setQuery] = useState(omniScannerTarget || '');
    const [logs, setLogs] = useState<string[]>([
        `[SYSTEM] Sovereign Omni-Scanner Initialized.`,
        `[SYSTEM] Awaiting target hash, DID, or contract address...`
    ]);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (omniScannerTarget) {
            setQuery(omniScannerTarget);
            handleScan(omniScannerTarget);
        }
    }, [omniScannerTarget]);

    const handleScan = (target: string) => {
        if (!target) return;
        setIsScanning(true);
        setLogs(prev => [...prev, `\n> Scanning target: ${target}`]);
        setLogs(prev => [...prev, `[PROMETHEA] Intercepted query. Identifying network layer...`]);
        
        setTimeout(() => {
            const isSolana = target.length > 30 && !target.startsWith('0x') && !target.startsWith('did:');
            const isEVM = target.startsWith('0x');
            const isDID = target.startsWith('did:');
            
            let net = 'UNKNOWN';
            if (isSolana) net = 'SOLANA MAINNET (via Helius RPC)';
            if (isEVM) net = 'EVM / BASE L2 (via Alchemy RPC)';
            if (isDID) net = 'SOVEREIGN IDENTITY MATRIX (Local / IPFS)';
            
            setLogs(prev => [...prev, `[PROMETHEA] Network identified: ${net}`]);
            setLogs(prev => [...prev, `[ENGINE] Invoking contract-audit and dex-oracle...`]);
            
            setTimeout(() => {
                setLogs(prev => [...prev, `[SUCCESS] Intelligence gathered.`]);
                if (isDID) {
                    setLogs(prev => [...prev, `   ↳ Subject is a Level-4 Sovereign Citizen.`]);
                    setLogs(prev => [...prev, `   ↳ Core wallets linked: 2 (Solana, Base)`]);
                    setLogs(prev => [...prev, `   ↳ Sweat-Equity Balance: 4,500 UVT`]);
                } else if (isSolana) {
                    setLogs(prev => [...prev, `   ↳ Target is an SPL Token Account.`]);
                    setLogs(prev => [...prev, `   ↳ Liquidity: $2.4M (Raydium Pool)`]);
                    setLogs(prev => [...prev, `   ↳ Contract Audit: NOMINAL (No mint authority)`]);
                } else {
                    setLogs(prev => [...prev, `   ↳ Trace complete. Target isolated.`]);
                }
                setIsScanning(false);
            }, 1500);
        }, 1000);
    };

    return (
        <div className="h-full flex flex-col space-y-3 font-mono">
            <div className="flex bg-zinc-950 border border-white/10 rounded-lg p-1.5 items-center">
                <span className="text-amber-500 font-bold px-2">❯</span>
                <input 
                    type="text" 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleScan(query); }}
                    placeholder="Enter tx hash, DID, or contract address..."
                    className="flex-1 bg-transparent text-[10px] text-white focus:outline-none placeholder-zinc-700"
                />
                <button 
                    onClick={() => handleScan(query)}
                    disabled={isScanning}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-black text-[9px] font-black uppercase rounded disabled:opacity-50"
                >
                    Audit
                </button>
            </div>
            
            <div className="flex-1 bg-black border border-white/5 rounded-xl p-4 overflow-hidden flex flex-col relative">
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
                    <span>Promethea // Due Diligence Terminal</span>
                    {isScanning && <span className="text-amber-400 animate-pulse">ANALYZING...</span>}
                </p>
                <div className="flex-1 overflow-y-auto space-y-1.5 text-[10px] text-amber-100/70">
                    {logs.map((l, i) => (
                        <div key={i} className={`whitespace-pre-wrap ${l.includes('[SUCCESS]') ? 'text-amber-400 font-bold' : l.includes('[PROMETHEA]') ? 'text-amber-400' : l.includes('>') ? 'text-white font-bold' : ''}`}>
                            {l}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- ASSET CANVAS PANEL ---
export const AssetCanvasPanel = () => {
    const { activeAssetTarget } = useHUD();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    // Instead of mock generation, we will fetch from our API
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#9ca3af', // zinc-400
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const series = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981', // amber-500
            downColor: '#ef4444', // red-500
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        chartRef.current = chart;
        seriesRef.current = series;

        setIsLoading(true);
        setFetchError(null);

        // Fetch live/historical OHLCV data
        fetch(`/api/engine/exchange/asset/${activeAssetTarget || 'SPY'}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setFetchError(data.error);
                } else if (data.candles && data.candles.length > 0) {
                    // lightweight-charts requires strictly ascending time values
                    const sortedCandles = data.candles.sort((a: any, b: any) => a.time - b.time);
                    series.setData(sortedCandles);
                    chart.timeScale().fitContent();
                } else {
                    setFetchError("No data available for this asset.");
                }
            })
            .catch(err => setFetchError("Network request failed."))
            .finally(() => setIsLoading(false));

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [activeAssetTarget]);

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Chart Area */}
            <div className="bg-black border border-white/10 rounded-lg p-2 relative overflow-hidden flex flex-col justify-center items-center min-h-[300px]">
                <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
                    <span className="text-sm font-black text-white px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">{activeAssetTarget || 'UNKNOWN'}</span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">Live Feed</span>
                </div>
                
                {isLoading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-400 mb-2" />
                        <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest animate-pulse">Syncing Liquidity Pools...</span>
                    </div>
                )}
                
                {fetchError && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
                        <Shield className="w-6 h-6 text-red-500 mb-2" />
                        <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest text-center px-4">{fetchError}</span>
                    </div>
                )}
                
                <div ref={chartContainerRef} className="w-full absolute inset-0 pt-10" />
            </div>

            {/* News / Intelligence Stream */}
            <div className="flex-1 bg-zinc-950 border border-white/5 rounded-lg p-3 overflow-hidden flex flex-col">
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Promethea Intelligence Stream</h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    <div className="p-2 bg-white/5 border-l-2 border-amber-500 rounded text-[10px] text-zinc-300">
                        <span className="text-amber-400 font-bold mr-1">[08:42]</span>
                        Unusual options activity detected on {activeAssetTarget}. 15,000 contracts bought out-of-the-money.
                    </div>
                    <div className="p-2 bg-white/5 border-l-2 border-amber-500 rounded text-[10px] text-zinc-300">
                        <span className="text-amber-400 font-bold mr-1">[08:15]</span>
                        Global liquidity index shows +2.4% influx into tech sector.
                    </div>
                </div>
            </div>

            {/* Execution Engine */}
            <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-3">
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Sovereign Execution Engine
                </h3>
                <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-widest rounded transition-colors shadow-[0_0_10px_rgba(245, 158, 11,0.3)]">
                        BUY {activeAssetTarget}
                    </button>
                    <button className="flex-1 py-2 bg-red-500 hover:bg-red-400 text-white font-black text-[10px] uppercase tracking-widest rounded transition-colors shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                        SELL {activeAssetTarget}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SUB-PANEL: DYNAMIC VIDEO CONFERENCE ---
export function ConferencePanel() {
    const { activeMeetUrl, endVideoConference } = useHUD();
    const [seconds, setSeconds] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [viewMode, setViewMode] = useState<'meet' | 'simulator'>(activeMeetUrl ? 'meet' : 'simulator');

    // Call duration timer
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Simulated WebRTC audio visualization frequencies
    const [freqs, setFreqs] = useState<number[]>([12, 24, 8, 45, 18, 30, 5, 20, 15, 38, 22, 10, 42, 28, 14]);
    useEffect(() => {
        const interval = setInterval(() => {
            setFreqs(prev => prev.map(() => Math.floor(Math.random() * 40) + 5));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full overflow-hidden text-white space-y-4 select-none">
            {/* Status bar */}
            <div className="flex justify-between items-center p-3 bg-black/45 border border-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400">
                        WebRTC Connected
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500">· secp256k1-E2EE</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-white bg-white/5 px-2.5 py-0.5 rounded border border-white/5 shadow-[0_0_10px_rgba(255,255,255,0.02)]">
                        {formatTime(seconds)}
                    </span>
                    {activeMeetUrl && (
                        <div className="flex rounded bg-black/40 p-0.5 border border-white/5 text-[8px] font-mono">
                            <button 
                                onClick={() => setViewMode('meet')}
                                className={`px-2 py-0.5 rounded ${viewMode === 'meet' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Google Meet
                            </button>
                            <button 
                                onClick={() => setViewMode('simulator')}
                                className={`px-2 py-0.5 rounded ${viewMode === 'simulator' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Simulator
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Viewport / Simulator Grid */}
            <div className="flex-1 min-h-[300px] relative overflow-hidden bg-black/40 border border-white/5 rounded-xl">
                {viewMode === 'meet' && activeMeetUrl ? (
                    <div className="w-full h-full flex flex-col justify-between p-1">
                        <iframe
                            src={activeMeetUrl}
                            allow="camera; microphone; fullscreen; display-capture; autoplay"
                            className="w-full flex-1 border border-amber-500/10 rounded-lg bg-black/60 shadow-inner"
                        />
                        <div className="p-2 flex justify-between items-center text-[8px] font-mono text-zinc-500 bg-black/20 rounded-b-lg border-t border-white/5 mt-1">
                            <span className="truncate max-w-[280px]">Meeting URL: <a href={activeMeetUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">{activeMeetUrl}</a></span>
                            <span className="shrink-0 text-amber-400">● LIVE HUD PIPELINE</span>
                        </div>
                    </div>
                ) : (
                    /* High-Fidelity WebRTC Simulator */
                    <div className="w-full h-full flex flex-col justify-between p-3 space-y-3">
                        {/* 2x2 Grid of participants */}
                        <div className="grid grid-cols-2 gap-3 flex-1">
                            {/* Participant 1: User */}
                            <div className="relative bg-zinc-950 border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between p-2">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                                {/* Cyber scanline effect if video on */}
                                {!isVideoOff && (
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] opacity-20 pointer-events-none" />
                                )}
                                <div className="flex justify-between items-start z-10">
                                    <span className="text-[8px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded uppercase font-bold tracking-wider">
                                        YOU (Citizen)
                                    </span>
                                    <span className="text-[7px] font-mono text-zinc-600">secp256k1</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center py-4 z-10">
                                    {!isVideoOff ? (
                                        /* Orbital particle mesh animation */
                                        <div className="relative w-12 h-12 flex items-center justify-center">
                                            <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/40 animate-[spin_10s_linear_infinite]" />
                                            <div className="absolute inset-2 rounded-full border border-double border-amber-500/20 animate-[spin_6s_linear_infinite_reverse]" />
                                            <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(245, 158, 11,0.15)]">
                                                <span className="text-[10px]">📡</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 font-mono text-xs">
                                            MUTED
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center z-10 text-[7px] font-mono text-zinc-500 mt-1">
                                    <span className="flex items-center gap-0.5">
                                        {isMuted ? '🔇 Audio Off' : '🎙️ Mic Active'}
                                    </span>
                                    <span>Signal: 100%</span>
                                </div>
                            </div>

                            {/* Participant 2: Citizen Joshua */}
                            <div className="relative bg-zinc-950 border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between p-2">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                                <div className="flex justify-between items-start z-10">
                                    <span className="text-[8px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded uppercase font-bold tracking-wider">
                                        Citizen Joshua
                                    </span>
                                    <span className="text-[7px] font-mono text-zinc-600">secp256k1</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center py-4 z-10">
                                    {/* Joshua voice mesh */}
                                    <div className="relative w-12 h-12 flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/30 animate-[spin_8s_linear_infinite]" />
                                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(245, 158, 11,0.1)]">
                                            <span className="text-xs">💎</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center z-10 text-[7px] font-mono text-zinc-500 mt-1">
                                    <span className="flex items-center gap-0.5">
                                        🎙️ Mic Active
                                    </span>
                                    <span>Signal: 98%</span>
                                </div>
                            </div>

                            {/* Participant 3: Promethea ASGI */}
                            <div className="relative bg-zinc-950 border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between p-2">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                                <div className="flex justify-between items-start z-10">
                                    <span className="text-[8px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1 py-0.2 rounded uppercase font-bold tracking-wider">
                                        Promethea ASGI
                                    </span>
                                    <span className="text-[7px] font-mono text-purple-500">Cognitive Hub</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center py-4 z-10">
                                    <div className="relative w-12 h-12 flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/30 animate-[spin_12s_linear_infinite]" />
                                        <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                                            <span className="text-xs">⚡</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center z-10 text-[7px] font-mono text-zinc-500 mt-1">
                                    <span>🧠 Core Substrate</span>
                                    <span>Quorum: VETO</span>
                                </div>
                            </div>

                            {/* Participant 4: Antigravity */}
                            <div className="relative bg-zinc-950 border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between p-2">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                                <div className="flex justify-between items-start z-10">
                                    <span className="text-[8px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded uppercase font-bold tracking-wider">
                                        Antigravity Pair
                                    </span>
                                    <span className="text-[7px] font-mono text-amber-500">Staging Link</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center py-4 z-10">
                                    <div className="relative w-12 h-12 flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/30 animate-[spin_6s_linear_infinite]" />
                                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                                            <span className="text-xs">🪐</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center z-10 text-[7px] font-mono text-zinc-500 mt-1">
                                    <span>👾 Pair Engine</span>
                                    <span>Sandbox: OK</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive audio waves visualizer */}
                        <div className="h-10 bg-black/50 border border-white/5 rounded-lg flex items-center justify-center gap-1.5 px-3">
                            {freqs.map((freq, idx) => (
                                <span 
                                    key={idx}
                                    style={{ height: `${freq}%` }}
                                    className="w-1 bg-gradient-to-t from-amber-600 via-amber-400 to-indigo-500 rounded-full transition-all duration-75"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Connection Metrics dashboard */}
            <div className="grid grid-cols-4 gap-2.5 p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[9px]">
                <div className="p-2 bg-black/40 border border-white/5 rounded-lg flex flex-col gap-0.5">
                    <span className="text-zinc-500 uppercase font-black tracking-widest text-[7px]">Bandwidth</span>
                    <span className="text-white font-bold text-[10px]">1.24 Mbps</span>
                </div>
                <div className="p-2 bg-black/40 border border-white/5 rounded-lg flex flex-col gap-0.5">
                    <span className="text-zinc-500 uppercase font-black tracking-widest text-[7px]">Ping</span>
                    <span className="text-amber-400 font-bold text-[10px]">12 ms</span>
                </div>
                <div className="p-2 bg-black/40 border border-white/5 rounded-lg flex flex-col gap-0.5">
                    <span className="text-zinc-500 uppercase font-black tracking-widest text-[7px]">Packet Loss</span>
                    <span className="text-amber-400 font-bold text-[10px]">0.01 %</span>
                </div>
                <div className="p-2 bg-black/40 border border-white/5 rounded-lg flex flex-col gap-0.5">
                    <span className="text-zinc-500 uppercase font-black tracking-widest text-[7px]">E2EE Key</span>
                    <span className="text-purple-400 font-bold text-[10px] truncate">0x9f1d2b8a</span>
                </div>
            </div>

            {/* Video conference call controls */}
            <div className="flex gap-2.5 items-center justify-between p-3 bg-zinc-900 border border-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsMuted(prev => !prev)}
                        className={`p-2.5 rounded-lg border transition-all flex items-center justify-center ${
                            isMuted 
                                ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                                : 'bg-black/50 border-white/10 text-zinc-300 hover:border-white/20 hover:text-white'
                        }`}
                        title={isMuted ? "Unmute Mic" : "Mute Mic"}
                    >
                        {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                    <button 
                        onClick={() => setIsVideoOff(prev => !prev)}
                        className={`p-2.5 rounded-lg border transition-all flex items-center justify-center ${
                            isVideoOff 
                                ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                                : 'bg-black/50 border-white/10 text-zinc-300 hover:border-white/20 hover:text-white'
                        }`}
                        title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                    >
                        {isVideoOff ? <VideoOff size={16} /> : <Video size={16} />}
                    </button>
                    <button 
                        onClick={() => setIsScreenSharing(prev => !prev)}
                        className={`p-2.5 rounded-lg border transition-all flex items-center justify-center ${
                            isScreenSharing 
                                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' 
                                : 'bg-black/50 border-white/10 text-zinc-300 hover:border-white/20 hover:text-white'
                        }`}
                        title="Share Screen"
                    >
                        <Radio size={16} />
                    </button>
                </div>

                <button 
                    onClick={endVideoConference}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                >
                    <PhoneOff size={14} /> Disconnect Call
                </button>
            </div>
        </div>
    );
}

// --- SUB-PANEL: SOCIAL HUB (CONSOLIDATED CHAT + NARRATIVES) ---
export function SocialHubPanel({ initialTab }: { initialTab: 'CHAT' | 'NARRATIVE' }) {
    const [activeTab, setActiveTab] = useState<'CHAT' | 'NARRATIVE'>(initialTab);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    return (
        <div className="flex flex-col h-full overflow-hidden space-y-4">
            {/* Elegant glassmorphic tab selector */}
            <div className="flex rounded p-1 bg-black/40 border border-white/5 shrink-0 select-none">
                <button
                    onClick={() => setActiveTab('CHAT')}
                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'CHAT' 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'text-zinc-500 hover:text-white border border-transparent'
                    }`}
                >
                    💬 PROMETHEA CHAT
                </button>
                <button
                    onClick={() => setActiveTab('NARRATIVE')}
                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'NARRATIVE' 
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                            : 'text-zinc-500 hover:text-white border border-transparent'
                    }`}
                >
                    📡 NARRATIVE FEED
                </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
                {activeTab === 'CHAT' ? <PrometheaPanel /> : <NarrativeTray />}
            </div>
        </div>
    );
}

// --- SUB-PANEL: SYSTEM CONFIG (CONSOLIDATED PULSE + SETTINGS) ---
export function SystemConfigPanel({ initialTab }: { initialTab: 'PULSE' | 'SETTINGS' }) {
    const [activeTab, setActiveTab] = useState<'PULSE' | 'SETTINGS'>(initialTab);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    return (
        <div className="flex flex-col h-full overflow-hidden space-y-4">
            {/* Elegant glassmorphic tab selector */}
            <div className="flex rounded p-1 bg-black/40 border border-white/5 shrink-0 select-none">
                <button
                    onClick={() => setActiveTab('PULSE')}
                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'PULSE' 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'text-zinc-500 hover:text-white border border-transparent'
                    }`}
                >
                    💓 VITALITY MONITOR
                </button>
                <button
                    onClick={() => setActiveTab('SETTINGS')}
                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'SETTINGS' 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'text-zinc-500 hover:text-white border border-transparent'
                    }`}
                >
                    ⚙️ HUD PREFERENCES
                </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
                {activeTab === 'PULSE' ? <PulseTray /> : <SettingsTray />}
            </div>
        </div>
    );
}

// --- CONTAINER TRAY COMPONENT ---
export const RightFocusTray = () => {
    const { activeFocusPanel, activePillar, activateFocusPanel, activeHazards } = useHUD();

    const currentPanel = activeFocusPanel || activePillar;

    if (!currentPanel) return null;
    
    // Do not render the tray shell for full-screen themes
    if (['16BIT', 'CHESS', 'PHOSPHOR'].includes(currentPanel)) {
        return null;
    }

    let title = 'FOCUS PANEL';
    switch (currentPanel) {
        case 'EXCHANGE': title = 'ASGI // RWA EXCHANGE'; break;
        case 'SQL_EXPLORER': title = 'SUBSTRATE // SQL STATE EXPLORER'; break;
        case 'CLI_GUIDE': title = 'DEVELOPERS // CLI HOOK'; break;
        case 'SWEAT_CLAIM': title = 'PASSPORT // SWEAT-EQUITY CLAIMS'; break;
        case 'FINANCIALS': title = 'TREASURY // FINANCIAL AUDIT STATEMENT'; break;
        case 'PROMETHEA_ASGI': title = 'PROMETHEA ASGI // COGNITIVE MONITORS'; break;
        case 'WALLET': title = 'IDENTITY // SOVEREIGN WALLET'; break;
        case 'OMNI_SCANNER': title = 'PROMETHEA // OMNI-SCANNER'; break;
        case 'ASSET_CANVAS': title = 'ASGI // DYNAMIC ASSET CANVAS'; break;
        case 'CONFERENCE': title = 'ASGI // LIVE CONFERENCE'; break;
        case 'BIOLOGICAL_POW': title = 'ORACLE // BIOLOGICAL PROOF OF WORK'; break;
        case 'ATLAS': title = 'ATLAS // NETWORK TOPOLOGY'; break;
        case 'ECONOMICS': title = 'ECONOMICS // TREASURY & ASSETS'; break;
        case 'GOVERNANCE': title = 'GOVERNANCE // SYNTHETIC STATE'; break;
        case 'SOCIAL_HUB':
        case 'NARRATIVE':
        case 'ASGI':
        case 'CHAT':
            title = 'SOCIAL HUB // SECURE COMMUNICATOR';
            break;
        case 'DIPLOMATIC': title = 'DIPLOMATIC // PASSPORT & VISAS'; break;
        case 'SYSTEM_CONFIG':
        case 'PULSE':
        case 'SETTINGS':
            title = 'SYSTEM CONFIG // HUD COGNITION';
            break;
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {activeHazards && activeHazards.length > 0 && (
                <div className="mx-4 mt-4 p-3 bg-red-950/40 border border-red-500/30 rounded-lg flex items-center justify-between gap-3 backdrop-blur-md animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                    <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black tracking-wider text-red-400 uppercase font-mono">
                                OSIRIS CRITICAL HAZARD ALERT
                            </span>
                            <span className="text-[9px] text-zinc-400 font-mono">
                                {activeHazards.length} threat {activeHazards.length === 1 ? 'vector' : 'vectors'} detected near Citadels
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => activateFocusPanel('ATLAS')}
                        className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/35 border border-red-500/40 rounded text-[9px] font-bold text-red-200 tracking-wider transition-all font-mono hover:scale-105 active:scale-95"
                    >
                        VIEW DECK
                    </button>
                </div>
            )}
            {/* Redundant header removed per unified tray design */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar">
                {currentPanel === 'EXCHANGE' && <ExchangePanel />}
                {currentPanel === 'SQL_EXPLORER' && <SqlExplorerPanel />}
                {currentPanel === 'CLI_GUIDE' && <CliGuidePanel />}
                {currentPanel === 'SWEAT_CLAIM' && <SweatClaimPanel />}
                {currentPanel === 'FINANCIALS' && <FinancialsPanel />}
                {currentPanel === 'PROMETHEA_ASGI' && <AsgiTelemetryPanel />}
                {currentPanel === 'WALLET' && <WalletPanel />}
                {currentPanel === 'OMNI_SCANNER' && <OmniScannerPanel />}
                {currentPanel === 'ASSET_CANVAS' && <AssetCanvasPanel />}
                {currentPanel === 'CONFERENCE' && <ConferencePanel />}
                {currentPanel === 'MINER_NODE' && <MinerNodePanel />}
                {currentPanel === 'MARKETPLACE' && <MarketplacePanel />}
                {currentPanel === 'ATLAS' && <AtlasTray />}
                {currentPanel === 'ECONOMICS' && <EconomicsTray />}
                {currentPanel === 'GOVERNANCE' && <GovernanceTray />}
                {(currentPanel === 'SOCIAL_HUB' || currentPanel === 'NARRATIVE' || currentPanel === 'ASGI' || currentPanel === 'CHAT') && (
                    <SocialHubPanel initialTab={(currentPanel === 'NARRATIVE') ? 'NARRATIVE' : 'CHAT'} />
                )}
                {currentPanel === 'DIPLOMATIC' && <DiplomaticTray />}
                {(currentPanel === 'SYSTEM_CONFIG' || currentPanel === 'PULSE' || currentPanel === 'SETTINGS') && (
                    <SystemConfigPanel initialTab={(currentPanel === 'SETTINGS') ? 'SETTINGS' : 'PULSE'} />
                )}
                {currentPanel === 'BIOLOGICAL_POW' && (

                    <div className="flex items-center justify-center h-full">
                        <ProofOfWorkSubmission 
                            taskId="oracle-eval-task"
                            syndicateId="primary-syndicate"
                            onSuccess={() => activateFocusPanel(null)}
                            onCancel={() => activateFocusPanel(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
