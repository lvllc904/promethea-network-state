'use client';

import React, { useState, useEffect } from 'react';
import { useHUD } from '@/lib/hud-store';
import { Activity } from 'lucide-react';

export const VixSimulator = () => {
    const { globalVix, setGlobalVix } = useHUD();
    const [localVix, setLocalVix] = useState(globalVix);

    // Sync local state when global state changes from elsewhere
    useEffect(() => {
        setLocalVix(globalVix);
    }, [globalVix]);

    const handleApply = () => {
        setGlobalVix(localVix);
        // Ideally we would also call an API route to update vixService in the backend
        fetch('/api/vix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vix: localVix })
        }).catch(err => console.warn('Failed to update backend VIX:', err));
    };

    return (
        <div className="flex flex-col gap-4 p-4 bg-black/40 border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 font-mono text-sm uppercase tracking-widest">
                <Activity className="w-4 h-4" />
                VIX (Fear Gauge) Simulator
            </div>
            
            <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Complacency (10)</span>
                    <span className="text-white font-bold">{localVix.toFixed(1)}</span>
                    <span className="text-red-500">Panic (40+)</span>
                </div>
                
                <input 
                    type="range" 
                    min="10" 
                    max="50" 
                    step="0.5" 
                    value={localVix} 
                    onChange={(e) => setLocalVix(parseFloat(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
            </div>
            
            <div className="flex justify-end mt-2">
                <button 
                    onClick={handleApply}
                    className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-500/50 text-red-100 font-mono text-xs rounded transition-colors"
                >
                    Apply Market Shock
                </button>
            </div>
            
            <div className="text-[10px] text-zinc-500 font-mono mt-2">
                &gt; Increases yield friction in CarryTradeService<br/>
                &gt; Deepens red atmospheric tint in SovereignHUD
            </div>
        </div>
    );
};
