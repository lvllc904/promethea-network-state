
"use client";

import React, { useState } from 'react';
import { useAppState } from '../StateContext';

const JsonOverlay: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { state, dispatch } = useAppState();
    const [json, setJson] = useState(JSON.stringify({ ecosystem: state.ecosystem, plan: state.plan }, null, 2));
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleApply = () => {
        try {
            const parsed = JSON.parse(json);
            if (!parsed.ecosystem || !parsed.plan) throw new Error("Invalid schema: Missing ecosystem or plan root.");
            dispatch({ type: 'IMPORT_FULL_STATE', payload: parsed });
            onClose();
        } catch (e: any) {
            setError(e.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8">
            <div className="w-full max-w-4xl bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl flex flex-col h-[80vh]">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-black italic">AGENT STATE INGESTION <span className="text-emerald-500">JSON</span></h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><i className="fas fa-times"></i></button>
                </div>
                <div className="flex-1 p-6 font-mono text-xs">
                    <textarea
                        value={json}
                        onChange={(e) => setJson(e.target.value)}
                        className="w-full h-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                        placeholder="Paste Promethea State JSON here..."
                    />
                </div>
                {error && <div className="px-6 py-2 text-red-500 text-[10px] uppercase font-black">{error}</div>}
                <div className="p-6 border-t border-gray-800 flex gap-4">
                    <button onClick={onClose} className="px-6 py-2 text-xs font-black uppercase text-gray-500 hover:text-white">Cancel</button>
                    <button onClick={handleApply} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-900/20">Apply Evolution State</button>
                </div>
            </div>
        </div>
    );
};

export default JsonOverlay;
