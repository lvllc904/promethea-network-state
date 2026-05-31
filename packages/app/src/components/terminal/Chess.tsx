'use client';

import React from 'react';
import { useHUD } from '@/lib/hud-store';

export const ChessGame = () => {
    const { activateFocusPanel } = useHUD();

    return (
        <div className="flex flex-col h-full w-full bg-[#1e293b] border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.15)] rounded-lg overflow-hidden relative">
            <div className="h-10 bg-slate-900 border-b border-blue-500/20 flex items-center justify-between px-4 shrink-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    <span className="text-[12px] text-blue-400 font-black uppercase tracking-widest font-mono">
                        Sovereign Chess
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => {
                            document.documentElement.className = 'dark';
                            activateFocusPanel(null);
                        }}
                        className="text-[12px] text-blue-400 hover:text-blue-300 uppercase tracking-wider font-mono"
                    >
                        [ EXIT ]
                    </button>
                </div>
            </div>
            
            <div className="flex-1 w-full p-8 relative z-10 flex flex-col items-center justify-center">
                <div className="w-full max-w-md aspect-square bg-slate-800 border-4 border-slate-700 p-2 relative flex flex-col">
                    {/* Placeholder for actual chessboard */}
                    <div className="flex-1 grid grid-cols-8 grid-rows-8 border-2 border-slate-600">
                        {Array.from({ length: 64 }).map((_, i) => {
                            const row = Math.floor(i / 8);
                            const col = i % 8;
                            const isDark = (row + col) % 2 === 1;
                            return (
                                <div key={i} className={`${isDark ? 'bg-blue-900/50' : 'bg-slate-200'} flex items-center justify-center text-2xl`}>
                                    {/* Placeholder pieces */}
                                    {row === 1 && <span className="text-black drop-shadow-md">♟</span>}
                                    {row === 6 && <span className="text-white drop-shadow-md">♙</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <p className="text-blue-300 text-center max-w-lg mt-8 font-mono">
                    Awaiting opponent connection...
                </p>
            </div>
        </div>
    );
};
