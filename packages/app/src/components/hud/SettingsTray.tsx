import React, { useState } from 'react';
import { Settings, Shield, Cpu, Sliders, ToggleLeft, ToggleRight, Server, Cloud } from 'lucide-react';

export const SettingsTray = () => {
    // In a full implementation, these would map to a global context or local storage
    const [controlParadigm, setControlParadigm] = useState<'CONVERSATIONAL' | 'MANUAL'>('CONVERSATIONAL');
    const [omniLakeSync, setOmniLakeSync] = useState(true);

    return (
        <div className="w-full max-w-sm ml-6 flex flex-col gap-6 font-mono text-zinc-300">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2 bg-zinc-800 rounded-full border border-white/5">
                    <Settings className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">Sovereign Settings</h2>
                    <p className="text-[10px] text-zinc-500 tracking-wider">System configuration & paradigms</p>
                </div>
            </div>

            {/* Control Paradigm Section */}
            <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5" />
                        Control Paradigm
                    </h3>
                </div>
                
                <p className="text-[10px] text-zinc-500 leading-relaxed border-l-2 border-white/10 pl-3">
                    Defines how Promethea interprets your intent. "Conversational" routes natural language through the Omni-Input. "Manual" relies on explicit UI interaction.
                </p>

                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => setControlParadigm('CONVERSATIONAL')}
                        className={`flex items-center justify-between p-3 rounded border transition-all ${
                            controlParadigm === 'CONVERSATIONAL' 
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300' 
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                        }`}
                    >
                        <span className="text-[11px] font-bold uppercase tracking-wider">Conversational (Omni-Input)</span>
                        {controlParadigm === 'CONVERSATIONAL' ? <ToggleRight className="w-4 h-4 text-cyan-400" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>

                    <button 
                        onClick={() => setControlParadigm('MANUAL')}
                        className={`flex items-center justify-between p-3 rounded border transition-all ${
                            controlParadigm === 'MANUAL' 
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' 
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                        }`}
                    >
                        <span className="text-[11px] font-bold uppercase tracking-wider">Manual (Trays & Modules)</span>
                        {controlParadigm === 'MANUAL' ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                </div>
            </section>

            {/* Omni Lake Integration Section */}
            <section className="flex flex-col gap-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <Server className="w-3.5 h-3.5" />
                        Omni-Lake Synchronization
                    </h3>
                </div>

                <div 
                    onClick={() => setOmniLakeSync(!omniLakeSync)}
                    className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded cursor-pointer hover:bg-white/10 transition-colors"
                >
                    <div className="mt-0.5">
                        {omniLakeSync ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-zinc-500" />}
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white">Dual-Storage Consensus</span>
                        <span className="text-[10px] text-zinc-500 leading-relaxed">
                            Mirrors local `pro-forma.db` state changes (like execution thresholds) to the Omni-Lake for global distribution and on-chain verification.
                        </span>
                    </div>
                </div>
            </section>

            {/* Security Section (Placeholder for future settings) */}
            <section className="flex flex-col gap-4 pt-4 border-t border-white/10">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    Security & Permissions
                </h3>
                <div className="p-3 bg-black/40 border border-white/5 rounded text-[10px] text-zinc-500 italic">
                    Advanced security parameters are locked during the current execution phase.
                </div>
            </section>

        </div>
    );
};
