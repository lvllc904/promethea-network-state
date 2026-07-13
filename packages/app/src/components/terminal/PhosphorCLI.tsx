'use client';

import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

import '@xterm/xterm/css/xterm.css';
import { useHUD } from '@/lib/hud-store';

export function PhosphorCLI() {
    const terminalRef = useRef<HTMLDivElement>(null);
    const { togglePhosphorMode } = useHUD();

    useEffect(() => {
        if (!terminalRef.current) return;

        const term = new Terminal({
            theme: {
                background: '#0b0c10',
                foreground: '#ff0000', // Pure glowing red
                cursor: '#ff0000',
                selectionBackground: 'rgba(255, 0, 0, 0.3)',
            },
            fontFamily: 'monospace',
            fontSize: 16,
            cursorBlink: true,
            disableStdin: false,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);


        term.open(terminalRef.current);
        fitAddon.fit();

        term.writeln('\x1b[31mTPNS PHOSPHOR TERMINAL // DIRECT PROMETHEA LINK\x1b[0m');
        term.writeln('\x1b[31mTPNS OS v0.9 (C) 1983 - PROMETHEA INC.\x1b[0m');
        term.writeln('');
        term.write('\x1b[31mcitizen@tpns:~$ \x1b[0m');

        term.onData((data) => {
            const code = data.charCodeAt(0);
            if (code === 13) { // Enter
                term.writeln('');
                term.write('\x1b[31mcitizen@tpns:~$ \x1b[0m');
            } else if (code === 127) { // Backspace
                term.write('\b \b');
            } else {
                term.write(data);
            }
        });

        const handleResize = () => fitAddon.fit();
        window.addEventListener('resize', handleResize);

        // Add a global keyboard shortcut to exit Phosphor mode (ESC)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                togglePhosphorMode();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            term.dispose();
        };
    }, [togglePhosphorMode]);

    return (
        <div className="fixed inset-0 z-[9999] bg-[#0b0c10] flex items-center justify-center p-8 overflow-hidden pointer-events-auto">
            <style jsx global>{`
                .xterm-viewport {
                    overflow-y: auto !important;
                }
                .xterm-screen {
                    box-shadow: inset 0 0 100px rgba(255, 0, 0, 0.1);
                }
                /* CRT Scanline effect */
                .phosphor-scanlines::before {
                    content: " ";
                    display: block;
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
                    z-index: 2;
                    background-size: 100% 2px, 3px 100%;
                    pointer-events: none;
                }
            `}</style>
            <div className="phosphor-scanlines absolute inset-0 pointer-events-none" />
            <div className="w-full h-full max-w-5xl mx-auto opacity-90 shadow-[0_0_20px_rgba(255,0,0,0.2)]">
                <div ref={terminalRef} className="w-full h-full" />
            </div>
            
            <div className="absolute top-4 right-4 z-[10000]">
                <button 
                    onClick={togglePhosphorMode}
                    className="text-red-500 border border-red-500 px-3 py-1 font-mono text-sm hover:bg-red-900 transition-colors"
                >
                    [X] EXIT PHOSPHOR
                </button>
            </div>
        </div>
    );
}
