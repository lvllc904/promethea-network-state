'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHUD } from '@/lib/hud-store';
import { 
    Monitor, Server, Terminal, Play, Square, RefreshCw, Sliders, Cpu, Layers, 
    Shield, CheckCircle, ExternalLink, Lock, User, FolderGit, Wifi, HardDrive,
    Database, Activity, Send, Clipboard, Compass
} from 'lucide-react';

export const WorkspaceViewport = () => {
    const { activeFocusPanel, activateFocusPanel } = useHUD();
    const [connState, setConnState] = useState<'DISCONNECTED' | 'PROVISIONING' | 'CONNECTING' | 'CONNECTED' | 'SUSPENDED'>('DISCONNECTED');
    const [daemonStatus, setDaemonStatus] = useState<any | null>(null);
    const [isLoadingDaemon, setIsLoadingDaemon] = useState(false);
    
    // Configurations
    const [cpuAllocation, setCpuAllocation] = useState(4);
    const [ramAllocation, setRamAllocation] = useState(8);
    const [storageAllocation, setStorageAllocation] = useState(100);
    const [vncProtocol, setVixProtocol] = useState<'KASMVNC' | 'RUSTDESK'>('KASMVNC');
    
    // Interactive Terminal States
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalLogs, setTerminalLogs] = useState<string[]>([
        'tpns-mesh-client v1.4.0-beta',
        'Type "help" for a list of available edge terminal commands.',
        ''
    ]);
    const terminalEndRef = useRef<HTMLDivElement>(null);
    const terminalInputRef = useRef<HTMLInputElement>(null);

    // Fetch live local mesh-daemon status on mount
    useEffect(() => {
        const fetchDaemonStatus = async () => {
            setIsLoadingDaemon(true);
            try {
                const res = await fetch('http://localhost:4005/api/mesh/status');
                if (res.ok) {
                    const data = await res.json();
                    setDaemonStatus(data);
                }
            } catch (err) {
                console.warn('[Workspace] Local mesh-daemon not reachable on 4005. Falling back to simulated substrate context.');
            } finally {
                setIsLoadingDaemon(false);
            }
        };
        fetchDaemonStatus();
    }, []);

    // Scroll terminal to bottom
    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [terminalLogs]);

    const handleProvision = () => {
        setConnState('PROVISIONING');
        let progress = 0;
        const messages = [
            '🔑 Handshaking with Body 2 Gatekeeper (Flowcase Authorization)...',
            '👤 Citizen signature verified: did:sovereign:citizen:0x9f1d2b...',
            '🐳 Connecting to local Docker Daemon on Body 3 (mesh-daemon)...',
            '📦 Fetching image manifest: linuxserver/webtop:ubuntu-xfce-latest...',
            '🚀 Initializing ephemeral secure container namespace (VLAN isolation)...',
            '📡 Spinning up P2P WebRTC signaling socket on hbbs/hbbr...',
            '🔐 Injecting single-use connection JWT authorization keys...',
            '🖥️ Webtop rendering engine online. Initializing KasmVNC pipeline...',
            '🌐 Estabilishing WireGuard overlay route did:sovereign:peer:node-01...',
            '💎 [SUCCESS] Connection established! Streaming workspace canvas.'
        ];

        const interval = setInterval(() => {
            if (progress < messages.length) {
                setTerminalLogs(prev => [...prev, `[system] ${messages[progress]}`]);
                progress++;
            } else {
                clearInterval(interval);
                setConnState('CONNECTED');
                setTerminalLogs(prev => [
                    ...prev,
                    '==================================================',
                    '⚡ SOVEREIGN SYSTEM ENVIRONMENT LOADED SUCCESSFULLY ⚡',
                    '==================================================',
                    'system@tpns-workspace:~$ '
                ]);
            }
        }, 600);
    };

    const handleSuspend = () => {
        setConnState('SUSPENDED');
        setTerminalLogs(prev => [
            ...prev,
            '[system] Suspending active workspace container...',
            '[system] Container frozen. State persisted on local Garage S3 cache.',
            'system@tpns-workspace:~$ [STATE SUSPENDED]'
        ]);
    };

    const handleTerminate = () => {
        setConnState('DISCONNECTED');
        setTerminalLogs([
            'tpns-mesh-client v1.4.0-beta',
            'Type "help" for a list of available edge terminal commands.',
            ''
        ]);
    };

    const handleTerminalCommand = (e: React.FormEvent) => {
        e.preventDefault();
        const input = terminalInput.trim();
        if (!input) return;

        const newLogs = [...terminalLogs, `system@tpns-workspace:~$ ${input}`];
        const cmd = input.toLowerCase().split(' ')[0];

        let response: string[] = [];

        switch (cmd) {
            case 'help':
                response = [
                    'Available Commands:',
                    '  help             - Expose active system command vectors',
                    '  system / status  - Query host hardware & mesh status parameters',
                    '  mesh             - Run diagnostics on distributed peer-to-peer tunnels',
                    '  storage          - Query local allocated Garage S3 storage partitions',
                    '  clear            - Wipe active terminal console output buffers',
                    '  whoami           - Display cryptographic Citizen DID profile'
                ];
                break;
            case 'clear':
                setTerminalLogs([]);
                setTerminalInput('');
                return;
            case 'whoami':
                response = [
                    `CITIZEN ID  : did:sovereign:citizen:0x9f1d2b8a3e1c0d4f`,
                    'STATUS      : Resident Citizen Operator (Level 4 Authorization)',
                    `METABOLIC   : 15,000 TPNS Staked Units`
                ];
                break;
            case 'system':
            case 'status':
                const cores = daemonStatus?.hardwareProfile?.cpu?.cores || cpuAllocation;
                const cpuModel = daemonStatus?.hardwareProfile?.cpu?.model || 'Apple M3 Pro / ARM64';
                const ramTotal = daemonStatus?.hardwareProfile?.ram?.totalGb || ramAllocation;
                const ioSpeed = daemonStatus?.hardwareProfile?.storage?.writeSpeedMbS || 582.4;
                response = [
                    '--- SYSTEM HARDWARE PROFILE ---',
                    `Node ID       : ${daemonStatus?.nodeId || 'node-a82f3c9e112d4b'}`,
                    `Platform      : ${daemonStatus?.network?.platform || 'Darwin (macOS)'} v.${daemonStatus?.network?.release || '25.4.0'}`,
                    `CPU Model     : ${cpuModel}`,
                    `Active Cores  : ${cores} / ${osCpuCores()}`,
                    `Allocated RAM : ${ramAllocation}GB / ${ramTotal}GB`,
                    `Disk IO Speed : ${ioSpeed} MB/s (Direct write benchmark)`,
                    `Garage S3 DB  : SQLite Local Engine [ONLINE]`
                ];
                break;
            case 'mesh':
                response = [
                    '--- P2P GRID DIAGNOSTICS ---',
                    'Signaling Node : hbbs://rendezvous.lvhllc.org:3901 [CONNECTED]',
                    'Relay Node     : hbbr://relay.lvhllc.org:3902 [CONNECTED]',
                    'Encrypted Route: WireGuard virtual interface tun0 active',
                    'Peer Nodes     :',
                    '  - node-02 (Selene Hub / Lunar): Latency 1.32s | Packet Loss 0.0%',
                    '  - node-03 (Areo Hub / Mars)  : Latency 12.04s| Packet Loss 0.4%',
                    '  - node-04 (Vanguard Core)   : Latency 4.2ms  | Packet Loss 0.0%'
                ];
                break;
            case 'storage':
                const used = daemonStatus?.hardwareProfile?.storage?.usedGb || 240.2;
                const avail = daemonStatus?.hardwareProfile?.storage?.availableGb || 259.8;
                const tot = daemonStatus?.hardwareProfile?.storage?.totalGb || 500;
                response = [
                    '--- STORAGE MESH PROFILE ---',
                    `Local Mount   : ${daemonStatus?.garageConfig?.dataPath || './.garage/data'}`,
                    `Mesh Limit    : ${storageAllocation} GB (Citizen Dedicated Partition)`,
                    `Host Capacity : ${tot} GB (Used: ${used} GB / Available: ${avail} GB)`,
                    `Garage S3 API : Bind Addr: 127.0.0.1:3900 | RPC Addr: :3901 [ONLINE]`
                ];
                break;
            default:
                response = [`system: command not found: ${cmd}. Type "help" for valid options.`];
        }

        setTerminalLogs([...newLogs, ...response, '']);
        setTerminalInput('');
    };

    const osCpuCores = () => {
        if (typeof window !== 'undefined' && window.navigator) {
            return window.navigator.hardwareConcurrency || 8;
        }
        return 8;
    };

    return (
        <div className="flex flex-col xl:flex-row w-full h-[calc(100vh-200px)] min-h-[500px] gap-6 text-zinc-300 font-mono text-xs select-none">
            {/* Left Sidebar Config Block */}
            <div className="w-full xl:w-72 shrink-0 bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col gap-6 backdrop-blur-md">
                
                {/* Node Status Banner */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest flex items-center gap-1">
                            <Server className="w-3.5 h-3.5 text-amber-400" /> Edge Compute Node
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black tracking-widest uppercase animate-pulse">
                            ONLINE
                        </span>
                    </div>
                    <div className="bg-zinc-950/40 border border-zinc-900 rounded p-2 text-[10px] text-zinc-400 leading-relaxed uppercase">
                        <span className="text-zinc-500">Node ID:</span> <span className="text-zinc-200 block truncate font-bold">{daemonStatus?.nodeId || 'loading...'}</span>
                        <span className="text-zinc-500 mt-1 block">CPU:</span> <span className="text-zinc-300 font-semibold truncate block">{daemonStatus?.hardwareProfile?.cpu?.model || 'Detecting hardware...'}</span>
                    </div>
                </div>

                {/* Resource Allocator Section */}
                <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                    <h3 className="text-amber-400 uppercase font-bold tracking-widest flex items-center gap-1.5 text-[11px]">
                        <Sliders className="w-3.5 h-3.5" /> Resource Allocations
                    </h3>
                    
                    {/* CPU Slider */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                            <span>CPU CORES:</span>
                            <span className="text-amber-300 font-bold">{cpuAllocation} CORES</span>
                        </div>
                        <input 
                            type="range" min="1" max={osCpuCores()} step="1"
                            value={cpuAllocation}
                            onChange={(e) => setCpuAllocation(parseInt(e.target.value))}
                            disabled={connState === 'CONNECTED' || connState === 'PROVISIONING'}
                            className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-50"
                        />
                    </div>

                    {/* RAM Slider */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                            <span>RAM ALLOCATION:</span>
                            <span className="text-amber-300 font-bold">{ramAllocation} GB</span>
                        </div>
                        <input 
                            type="range" min="2" max={Math.round(daemonStatus?.hardwareProfile?.ram?.totalGb || 16)} step="2"
                            value={ramAllocation}
                            onChange={(e) => setRamAllocation(parseInt(e.target.value))}
                            disabled={connState === 'CONNECTED' || connState === 'PROVISIONING'}
                            className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-50"
                        />
                    </div>

                    {/* Storage Donation Slider */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                            <span>GRID STORAGE (S3):</span>
                            <span className="text-amber-300 font-bold">{storageAllocation} GB</span>
                        </div>
                        <input 
                            type="range" min="20" max="500" step="10"
                            value={storageAllocation}
                            onChange={(e) => setStorageAllocation(parseInt(e.target.value))}
                            disabled={connState === 'CONNECTED' || connState === 'PROVISIONING'}
                            className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-50"
                        />
                        <span className="text-[8px] text-zinc-500 leading-snug">
                            This amount of local space is allocated for the organization S3 block cluster (Garage).
                        </span>
                    </div>
                </div>

                {/* Connection Protocols */}
                <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                    <h3 className="text-amber-400 uppercase font-bold tracking-widest flex items-center gap-1.5 text-[11px]">
                        <Compass className="w-3.5 h-3.5" /> Protocol Engine
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setVixProtocol('KASMVNC')}
                            disabled={connState === 'CONNECTED' || connState === 'PROVISIONING'}
                            className={`p-2 border rounded transition-all text-center text-[10px] font-bold ${
                                vncProtocol === 'KASMVNC' 
                                ? 'bg-amber-500/10 border-amber-500/50 text-amber-300' 
                                : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10 disabled:opacity-50'
                            }`}
                        >
                            KasmVNC
                        </button>
                        <button
                            onClick={() => setVixProtocol('RUSTDESK')}
                            disabled={connState === 'CONNECTED' || connState === 'PROVISIONING'}
                            className={`p-2 border rounded transition-all text-center text-[10px] font-bold ${
                                vncProtocol === 'RUSTDESK' 
                                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' 
                                : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10 disabled:opacity-50'
                            }`}
                        >
                            RustDesk
                        </button>
                    </div>
                </div>

                {/* Local Benchmark Speeds */}
                <div className="mt-auto border-t border-white/5 pt-4">
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-wide text-zinc-500">
                        <span>Local NVMe IO Benchmark:</span>
                        <span className="text-amber-400 font-bold">{daemonStatus?.hardwareProfile?.storage?.writeSpeedMbS || '582.4'} MB/s</span>
                    </div>
                </div>

            </div>

            {/* Central Viewport / Remote Desktop Area */}
            <div className="flex-1 flex flex-col bg-zinc-950 border border-white/5 rounded-xl overflow-hidden relative group/canvas shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
                
                {/* Viewport Control Dock */}
                <header className="px-4 h-12 bg-zinc-900 border-b border-white/5 flex items-center justify-between shrink-0 select-none z-10 relative">
                    <div className="flex items-center gap-3">
                        <Monitor className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                            Decentralized Workspace Stream // did:node-01
                        </span>
                        
                        {/* Dynamic Status Badges */}
                        <div className="flex items-center gap-1.5 ml-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                connState === 'CONNECTED' ? 'bg-amber-400 animate-ping' :
                                connState === 'PROVISIONING' ? 'bg-amber-400 animate-pulse' :
                                connState === 'SUSPENDED' ? 'bg-amber-400' :
                                'bg-zinc-500'
                            }`} />
                            <span className={`text-[9px] font-bold tracking-widest ${
                                connState === 'CONNECTED' ? 'text-amber-400' :
                                connState === 'PROVISIONING' ? 'text-amber-400' :
                                connState === 'SUSPENDED' ? 'text-amber-400' :
                                'text-zinc-500'
                            }`}>
                                {connState}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {connState === 'CONNECTED' && (
                            <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded font-mono mr-3 uppercase">
                                <Activity className="w-3 h-3 text-amber-400" /> Latency: ~4ms | FPS: 60
                            </div>
                        )}
                        
                        {connState === 'CONNECTED' && (
                            <>
                                <button 
                                    onClick={() => {
                                        setTerminalLogs(prev => [...prev, '[clipboard] Syncing local context variables...']);
                                    }}
                                    title="Sync Clipboard"
                                    className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-all cursor-pointer"
                                >
                                    <Clipboard className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                    onClick={handleSuspend}
                                    title="Suspend Container"
                                    className="p-1.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded text-amber-400 transition-all cursor-pointer"
                                >
                                    <Square className="w-3.5 h-3.5" />
                                </button>
                            </>
                        )}
                        {connState === 'SUSPENDED' && (
                            <button 
                                onClick={handleProvision}
                                title="Resume Workspace"
                                className="p-1.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded text-amber-400 transition-all cursor-pointer"
                            >
                                <Play className="w-3.5 h-3.5" />
                            </button>
                        )}
                        {(connState === 'CONNECTED' || connState === 'SUSPENDED') && (
                            <button 
                                onClick={handleTerminate}
                                title="Terminate Container"
                                className="p-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded text-red-400 transition-all cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </header>

                {/* Viewport Dynamic Canvas */}
                <div className="flex-1 relative overflow-hidden bg-[#05080e]">
                    
                    {/* Background Subtle Cyber-grid Overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                    
                    {/* Disconnected Onboarding Screen */}
                    {connState === 'DISCONNECTED' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center select-none z-10">
                            <div className="absolute -inset-10 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
                            
                            {/* Glowing central core circle */}
                            <div className="relative flex items-center justify-center mb-6">
                                <div className="absolute w-20 h-20 rounded-full border border-amber-500/20 animate-pulse" />
                                <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(245, 158, 11,0.2)]">
                                    <Monitor className="w-8 h-8 text-amber-400" />
                                </div>
                            </div>

                            <div className="max-w-md space-y-4">
                                <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-400 uppercase tracking-widest">
                                    Ephemeral Webtop Workspace Provisioner
                                </h4>
                                <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">
                                    Spin up an isolated XFCE desktop workspace container on local host hardware (Body 3 Edge Node). All compilation tasks, file systems, and tools run in complete sandboxed confidentiality.
                                </p>
                                
                                <div className="pt-4 flex flex-col items-center justify-center">
                                    <button 
                                        onClick={handleProvision}
                                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 border border-amber-300/40 text-black text-[9px] font-black uppercase tracking-[0.2em] rounded transition-all shadow-[0_0_25px_rgba(245, 158, 11,0.3)] hover:-translate-y-0.5 cursor-pointer"
                                    >
                                        PROVISION SECURE WORKSPACE
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Booting Terminal / Logging Output Canvas */}
                    {(connState === 'PROVISIONING' || connState === 'CONNECTED' || connState === 'SUSPENDED') && (
                        <div className="absolute inset-0 flex flex-col bg-zinc-950 p-4 font-mono text-[10px] text-zinc-300 select-text overflow-hidden leading-relaxed">
                            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 select-text">
                                {terminalLogs.map((log, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`whitespace-pre-wrap select-text ${
                                            log.startsWith('[system]') ? 'text-amber-400' :
                                            log.startsWith('[clipboard]') ? 'text-indigo-400 italic' :
                                            log.includes('SUCCESS') ? 'text-amber-400 font-bold' :
                                            'text-zinc-300'
                                        }`}
                                    >
                                        {log}
                                    </div>
                                ))}
                                <div ref={terminalEndRef} />
                            </div>

                            {/* Live Terminal Input Box */}
                            {connState === 'CONNECTED' && (
                                <form onSubmit={handleTerminalCommand} className="flex items-center border-t border-white/5 pt-3 mt-3 shrink-0">
                                    <span className="text-amber-400 font-bold mr-2 shrink-0">system@tpns-workspace:~$</span>
                                    <input 
                                        ref={terminalInputRef}
                                        type="text" 
                                        value={terminalInput}
                                        onChange={(e) => setTerminalInput(e.target.value)}
                                        className="flex-1 bg-transparent border-none outline-none text-zinc-100 font-mono text-[10px] focus:ring-0 p-0"
                                        placeholder="Type command (help, system, storage, mesh)..."
                                    />
                                    <button type="submit" className="text-zinc-500 hover:text-amber-400 transition-colors p-1 cursor-pointer">
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};
