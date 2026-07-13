'use client';

import React, { useState, useEffect } from 'react';
import { useHUD } from '@/lib/hud-store';
import { Network, Server, HardDrive, Cpu, ShieldCheck, Box, Download, CheckCircle2, Play, Activity } from 'lucide-react';

// --- SUB-PANEL: OPT-IN MINER NODE ---
export function MinerNodePanel() {
    const [isNodeActive, setIsNodeActive] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [pinnedBlocks, setPinnedBlocks] = useState(0);
    const [earnedUvt, setEarnedUvt] = useState(0.0);

    const toggleNode = () => {
        if (!isNodeActive) {
            setIsNodeActive(true);
            setLogs(prev => [...prev, "[SYSTEM] Initiating IPFS Pinning Service..."]);
            setTimeout(() => setLogs(prev => [...prev, "[SYSTEM] Storage allocated: 5GB. Bandwidth cap: 100Mbps."]), 800);
            setTimeout(() => setLogs(prev => [...prev, "[NETWORK] Connected to 12 Sovereign peers. Syncing state..."]), 1500);
        } else {
            setIsNodeActive(false);
            setLogs(prev => [...prev, "[SYSTEM] Node teardown initiated. Unpinning data..."]);
            setTimeout(() => setLogs(prev => [...prev, "[SYSTEM] Node offline. Mining rewards paused."]), 800);
        }
    };

    useEffect(() => {
        if (!isNodeActive) return;

        const interval = setInterval(() => {
            setPinnedBlocks(b => b + Math.floor(Math.random() * 5));
            setEarnedUvt(u => u + 0.0015);
            
            if (Math.random() > 0.8) {
                const msgs = [
                    "[NETWORK] Pinned new frontend asset block: QmYwAPJ...",
                    "[AUDIT] Proof-of-Hosting verified by network. Reward issued.",
                    "[SYNC] Incoming state transition from Atlas node 0x82A...",
                    "[NETWORK] Replicating constitutional artifact hash: QmZaB9C..."
                ];
                setLogs(prev => [...prev, msgs[Math.floor(Math.random() * msgs.length)]]);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isNodeActive]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full overflow-hidden">
            {/* Control Panel */}
            <div className="space-y-4 flex flex-col h-full">
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-amber-400" /> Decentralized Web Node
                    </p>
                    
                    <div className="flex items-center justify-between mb-4 bg-black/60 p-3 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isNodeActive ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245, 158, 11,0.8)]' : 'bg-red-500/50'}`} />
                            <div>
                                <p className="text-[10px] font-black text-white">{isNodeActive ? 'NODE ONLINE' : 'NODE OFFLINE'}</p>
                                <p className="text-[8px] text-zinc-500 uppercase tracking-widest">IPFS Pinning Service</p>
                            </div>
                        </div>
                        <button 
                            onClick={toggleNode}
                            className={`py-1.5 px-4 text-[9px] font-black uppercase tracking-widest rounded transition-all ${
                                isNodeActive 
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                            }`}
                        >
                            {isNodeActive ? 'Deactivate' : 'Initialize Node'}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/40 p-2 rounded border border-white/5 text-center">
                            <p className="text-[8px] text-zinc-500 uppercase tracking-wider mb-0.5">Pinned Blocks</p>
                            <p className="text-sm font-mono text-white">{pinnedBlocks.toLocaleString()}</p>
                        </div>
                        <div className="bg-black/40 p-2 rounded border border-white/5 text-center">
                            <p className="text-[8px] text-amber-500/70 uppercase tracking-wider mb-0.5">Earned UVT</p>
                            <p className="text-sm font-mono text-amber-400">{earnedUvt.toFixed(4)}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl flex-1">
                    <p className="text-[8px] text-amber-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Proof of Hosting
                    </p>
                    <p className="text-[9px] text-zinc-400 leading-relaxed">
                        By running this node, you provide decentralized storage for the Promethean Network State interface and media assets via IPFS. In exchange for your verified uptime and bandwidth, you earn a continuous stream of Universal Value Tokens (UVT).
                    </p>
                </div>
            </div>

            {/* Terminal Output */}
            <div className="p-4 bg-black/80 border border-white/5 rounded-xl h-full flex flex-col font-mono">
                <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-400" /> Node Telemetry
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar text-[9px] text-orange-100/90 space-y-1.5 pr-1 flex flex-col-reverse">
                    {[...logs].reverse().map((log, idx) => (
                        <div key={idx} className="whitespace-pre-wrap">{log}</div>
                    ))}
                    {logs.length === 0 && (
                        <div className="text-zinc-600 italic">Waiting for node initialization...</div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- SUB-PANEL: MARKETPLACE ---
export function MarketplacePanel() {
    const [installingId, setInstallingId] = useState<string | null>(null);
    const [installed, setInstalled] = useState<string[]>([]);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    const scripts = [
        { id: '1', name: 'Automated Treasury Waterfall', author: 'did:sovereign:0x12', desc: 'Routes RWA yields to bills, then treasury, then cap table distributions automatically.', price: 'Free', icon: <Activity className="w-4 h-4 text-amber-400" /> },
        { id: '2', name: 'MACD Oracle Bot', author: 'did:sovereign:0x44', desc: 'Monitors real-time market data to propose Sub-DAC trading signals.', price: '15 UVT', icon: <Cpu className="w-4 h-4 text-purple-400" /> },
        { id: '3', name: 'Delegated Voting Agent', author: 'did:sovereign:0x91', desc: 'A sovereign agent that votes on your behalf based on your defined value matrix.', price: '50 UVT', icon: <CheckCircle2 className="w-4 h-4 text-amber-400" /> }
    ];

    const handleInstall = (id: string) => {
        setVerifyingId(id);
        setTimeout(() => {
            setVerifyingId(null);
            setInstallingId(id);
            setTimeout(() => {
                setInstallingId(null);
                setInstalled(prev => [...prev, id]);
            }, 1000);
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center p-4 bg-black/40 border border-white/5 rounded-xl">
                <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Box className="w-5 h-5 text-amber-400" /> Promethean Marketplace
                    </h2>
                    <p className="text-[10px] text-zinc-500">Discover and install Constitutional 4-Harms verified scripts and bots.</p>
                </div>
                <div className="text-right">
                    <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Installed Modules</p>
                    <p className="text-lg font-mono text-amber-400">{installed.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {scripts.map(script => {
                    const isInstalled = installed.includes(script.id);
                    const isInstalling = installingId === script.id;
                    const isVerifying = verifyingId === script.id;

                    return (
                        <div key={script.id} className="bg-black/60 border border-white/5 rounded-xl p-4 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
                            {isVerifying && (
                                <div className="absolute inset-0 bg-amber-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center border border-amber-500/30">
                                    <ShieldCheck className="w-8 h-8 text-amber-400 animate-pulse mb-2" />
                                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">4-Harms Verification</p>
                                    <p className="text-[8px] text-amber-200/60 font-mono mt-1">Scanning bytecode logic...</p>
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-black rounded-lg border border-white/5">
                                    {script.icon}
                                </div>
                                <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                                    {script.price}
                                </span>
                            </div>

                            <h3 className="text-sm font-bold text-white mb-1">{script.name}</h3>
                            <p className="text-[9px] text-zinc-500 font-mono mb-2">Author: {script.author}</p>
                            <p className="text-[10px] text-zinc-400 leading-relaxed flex-1">{script.desc}</p>

                            <button
                                onClick={() => !isInstalled && !isInstalling && !isVerifying && handleInstall(script.id)}
                                disabled={isInstalled || isInstalling || isVerifying}
                                className={`mt-4 w-full py-2 flex items-center justify-center gap-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                                    isInstalled 
                                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                        : isInstalling
                                        ? 'bg-amber-600/50 text-white cursor-wait'
                                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                }`}
                            >
                                {isInstalled ? (
                                    <><CheckCircle2 className="w-3.5 h-3.5" /> Installed</>
                                ) : isInstalling ? (
                                    <><Download className="w-3.5 h-3.5 animate-bounce" /> Installing...</>
                                ) : (
                                    <><Download className="w-3.5 h-3.5" /> Install Module</>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
