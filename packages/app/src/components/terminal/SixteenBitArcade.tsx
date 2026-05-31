'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useHUD } from '@/lib/hud-store';
import '@xterm/xterm/css/xterm.css';

export const SixteenBitArcade = ({ isEmbedded = false }: { isEmbedded?: boolean }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const currentLineRef = useRef<string>('');
    const { activateFocusPanel, reduceAnimations, userDid } = useHUD();
    const userDidRef = useRef(userDid);
    const [booting, setBooting] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('CONNECTING...');

    useEffect(() => {
        userDidRef.current = userDid;
    }, [userDid]);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize xterm.js
        const term = new Terminal({
            theme: {
                background: '#1a001a', // Deep arcade purple
                foreground: '#d946ef', // Fuchsia
                cursor: '#d946ef',
                selectionBackground: 'rgba(217, 70, 239, 0.3)',
            },
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 14,
            cursorBlink: true,
            disableStdin: false,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        
        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Boot sequence and WebSocket connection
        let isConnected = false;
        
        const connectDaemon = () => {
            const ws = new WebSocket('ws://localhost:9999');
            wsRef.current = ws;

            ws.onopen = () => {
                isConnected = true;
                setConnectionStatus('NATIVE DAEMON LINKED');
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'SYSTEM_LOG') {
                        term.writeln(`\x1b[32m[DAEMON]\x1b[0m ${msg.payload}`);
                    } else if (msg.type === 'COMMAND_STDOUT') {
                        const didShort = userDidRef.current?.split(':').pop()?.substring(0, 4).toUpperCase() || 'XXXX';
                        term.writeln(msg.payload.replace(/\n/g, '\r\n'));
                        term.write(`\r\n\x1b[1;35mARCADE_USER@${didShort}:~# \x1b[0m`);
                    }
                } catch (e) {
                    console.error("Failed to parse message", e);
                }
            };

            ws.onerror = () => {
                isConnected = false;
                setConnectionStatus('STANDALONE MODE');
            };

            ws.onclose = () => {
                isConnected = false;
                setConnectionStatus('STANDALONE MODE');
            };
        };

        const bootLogs = [
            "Initializing 16-Bit Arcade Matrix...",
            "Establishing DepthOS Bridge via WebSocket (ws://localhost:9999)...",
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < bootLogs.length) {
                term.writeln(`\x1b[35m${bootLogs[i]}\x1b[0m`);
                i++;
            } else {
                clearInterval(interval);
                connectDaemon();
                setTimeout(() => {
                    if (!isConnected) {
                        term.writeln('\x1b[33m[WARN] DepthOS Bridge Daemon not detected. Entering local standalone mode.\x1b[0m');
                        term.writeln('\x1b[35mLoading v86 WASM environment...\x1b[0m');
                        term.writeln('\x1b[35mAllocating 512MB RAM...\x1b[0m');
                        term.writeln('\x1b[35mMounting virtual filesystem...\x1b[0m');
                        term.writeln('\x1b[35mBooting JSLinux x86 kernel...\x1b[0m');
                        term.writeln('\x1b[35mSystem ready.\x1b[0m');
                    }
                    const didShort = userDidRef.current?.split(':').pop()?.substring(0, 4).toUpperCase() || 'XXXX';
                    setBooting(false);
                    term.write(`\r\n\x1b[1;35mARCADE_USER@${didShort}:~# \x1b[0m`);
                    term.focus();
                }, 1000);
            }
        }, 300);

        // Input handling
        term.onData((data) => {
            if (booting) return;
            const code = data.charCodeAt(0);
            if (code === 13) { // Enter
                const cmd = currentLineRef.current.trim();
                currentLineRef.current = '';
                term.write('\r\n');
                
                const didShort = userDidRef.current?.split(':').pop()?.substring(0, 4).toUpperCase() || 'XXXX';
                const prompt = `\x1b[1;35mARCADE_USER@${didShort}:~# \x1b[0m`;

                if (cmd) {
                    const args = cmd.split(' ');
                    const baseCmd = args[0].toLowerCase();

                    // --- STANDARD TERMINAL MODE ---
                    if (baseCmd === 'help') {
                        term.writeln('\x1b[32m16-Bit Arcade Terminal v1.0.0\x1b[0m');
                        term.writeln('Available Commands:');
                        term.writeln('  \x1b[36mpkg install <package>\x1b[0m   - Install virtual packages (e.g., 16bit-arcade, chess)');
                        term.writeln('  \x1b[36mpromethea <query>\x1b[0m       - Interface directly with Promethea AI');
                        term.writeln('  \x1b[36mclear\x1b[0m                   - Clear terminal screen');
                        term.writeln('  \x1b[36mexit\x1b[0m                    - Exit 16-Bit mode');
                        term.write(`\r\n\x1b[1;35mARCADE_USER@${didShort}:~# \x1b[0m`);
                    } else if (baseCmd === 'clear') {
                        term.clear();
                        term.write(prompt);
                    } else if (baseCmd === 'exit') {
                        document.documentElement.className = 'dark';
                        activateFocusPanel(null);
                    } else if (baseCmd === 'pkg' && args[1] === 'install') {
                        const pkgName = args[2];
                        if (pkgName === '16bit-arcade') {
                            term.writeln(`\x1b[33mFetching ${pkgName} from Sovereign Repositories...\x1b[0m`);
                            setTimeout(() => term.writeln(`\x1b[32mUnpacking ${pkgName}...\x1b[0m`), 500);
                            setTimeout(() => term.writeln(`\x1b[32mVerifying SHA-256 signatures...\x1b[0m`), 1000);
                            setTimeout(() => term.writeln(`\x1b[32mSuccessfully installed ${pkgName}. Booting...\x1b[0m`), 1500);
                            setTimeout(() => {
                                activateFocusPanel('16BIT');
                            }, 2000);
                        } else if (pkgName === 'chess') {
                            term.writeln(`\x1b[33mFetching ${pkgName} from Sovereign Repositories...\x1b[0m`);
                            setTimeout(() => term.writeln(`\x1b[32mUnpacking ${pkgName}...\x1b[0m`), 500);
                            setTimeout(() => term.writeln(`\x1b[32mVerifying SHA-256 signatures...\x1b[0m`), 1000);
                            setTimeout(() => term.writeln(`\x1b[32mSuccessfully installed ${pkgName}. Booting...\x1b[0m`), 1500);
                            setTimeout(() => {
                                activateFocusPanel('CHESS');
                            }, 2000);
                        } else if (pkgName) {
                            term.writeln(`\x1b[31mError: Package '${pkgName}' not found in sovereign repositories.\x1b[0m`);
                            term.write('\r\n' + prompt);
                        } else {
                            term.writeln(`\x1b[31mUsage: pkg install <package>\x1b[0m`);
                            term.write('\r\n' + prompt);
                        }
                    } else if (baseCmd === 'promethea') {
                        const query = args.slice(1).join(' ');
                        if (query) {
                            term.writeln(`\x1b[36m[PROMETHEA]: Thinking...\x1b[0m`);
                            // Simulate AI delay
                            setTimeout(() => {
                                term.writeln(`\x1b[36m[PROMETHEA]: I am currently operating in limited capacity within this terminal shell. Full neural integration is pending.\x1b[0m`);
                                term.write('\r\n' + prompt);
                            }, 1500);
                        } else {
                            term.writeln(`\x1b[31mUsage: promethea <query>\x1b[0m`);
                            term.write('\r\n' + prompt);
                        }
                    } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        // Forward to real backend if connected
                        wsRef.current.send(JSON.stringify({ type: 'EXEC_COMMAND', payload: cmd }));
                    } else {
                        // Fallback for unhandled commands in standalone mode
                        term.writeln(`\x1b[33mbash: ${cmd}: command not found (Standalone Mode)\x1b[0m`);
                        term.writeln(`Type \x1b[36mhelp\x1b[0m for available simulated commands.`);
                        term.write('\r\n' + prompt);
                    }
                } else {
                    term.write(prompt);
                }
            } else if (code === 127) { // Backspace
                if (currentLineRef.current.length > 0) {
                    currentLineRef.current = currentLineRef.current.slice(0, -1);
                    term.write('\b \b');
                }
            } else {
                currentLineRef.current += data;
                term.write(data);
            }
        });

        const handleResize = () => {
            fitAddon.fit();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            term.dispose();
        };
    }, []);

    const containerClass = `flex flex-col h-full w-full rounded-lg overflow-hidden relative ${reduceAnimations ? '' : 'transition-all duration-1000'} bg-[#1a001a] border border-fuchsia-500/20 shadow-[0_0_50px_rgba(217,70,239,0.15)]`;
    const headerClass = `h-10 bg-fuchsia-950/40 border-b border-fuchsia-500/20 flex items-center justify-between px-4 shrink-0 z-10`;

    return (
        <div className={containerClass}>
            <div className={headerClass}>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)]" />
                    <span className="text-[12px] text-fuchsia-400 font-black uppercase tracking-widest" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                        16-Bit Arcade
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`text-[9px] font-mono ${connectionStatus === 'NATIVE DAEMON LINKED' ? 'text-green-400' : 'text-fuchsia-400/60'}`}>
                        {connectionStatus}
                    </span>
                    {!isEmbedded && (
                        <button 
                            onClick={() => {
                                document.documentElement.className = 'dark';
                                activateFocusPanel(null);
                            }}
                            className="text-[12px] text-fuchsia-400 hover:text-fuchsia-300 uppercase tracking-wider"
                            style={{ fontFamily: '"Press Start 2P", monospace' }}
                        >
                            [ EXIT ]
                        </button>
                    )}
                </div>
            </div>
            
            {!reduceAnimations && (
                <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_100px_rgba(217,70,239,0.1)] mix-blend-overlay bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%]" />
            )}
            
            <div className="flex-1 w-full p-4 relative z-10 custom-scrollbar" ref={terminalRef} />
        </div>
    );
};
