'use client';

import React, { useState } from 'react';
import { Network, BrainCircuit, Shield, Briefcase, Users, FileText, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FormSyndicatePage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [type, setType] = useState('LLC');
    const [objective, setObjective] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !objective) return;

        setIsGenerating(true);
        try {
            const res = await fetch('/api/form-syndicate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    type,
                    objective,
                    jurisdiction: 'Promethean Network State',
                    members: [{ role: 'Creator/Admin', equity: 100, did: 'caller' }]
                })
            });
            const data = await res.json();
            if (data.success) {
                setResult(data);
                // Dispatch event to update Cockpit dropdown
                window.dispatchEvent(new CustomEvent('syndicate-created', { detail: data.syndicate_id }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (result) {
        return (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <CheckCircle2 className="w-8 h-8 text-amber-400" />
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest text-white">Syndicate Formed</h1>
                        <p className="text-sm text-zinc-400 font-mono">ID: {result.syndicate_id}</p>
                    </div>
                </div>

                <div className="p-6 bg-black/40 border border-amber-500/20 rounded-xl space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-400 px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-bl-lg border-b border-l border-amber-500/20">
                        {result.legalDocs.status}
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-4">{result.legalDocs.documentTitle}</h2>
                    
                    <div className="space-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar pr-4 text-sm text-zinc-300">
                        {result.legalDocs.sections.map((sec: any, idx: number) => (
                            <div key={idx} className="space-y-2">
                                <h3 className="text-amber-400 font-bold uppercase tracking-wide border-b border-white/5 pb-1">{sec.heading}</h3>
                                <div className="whitespace-pre-wrap leading-relaxed">{sec.content}</div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-500">Document Hash:</span>
                        <span className="text-amber-400">{result.legalDocs.hash}</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => window.location.reload()} // Quick hack to reload context switcher
                        className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-widest rounded transition-all"
                    >
                        Enter Syndicate →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="pb-4 border-b border-white/10">
                <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                    <Network className="w-6 h-6 text-amber-400" />
                    Autonomous Syndicate Generation (ASGI)
                </h1>
                <p className="text-sm text-zinc-400 mt-2 font-mono">
                    Leverage Promethea's legal engine to instantly formalize and underwrite a new sovereign cooperative structure.
                </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="space-y-4 p-6 bg-black/40 border border-white/10 rounded-xl">
                    <div>
                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Syndicate Designation</label>
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Apollo Infrastructure Guild"
                            className="w-full bg-black/60 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Entity Type</label>
                        <select 
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none"
                        >
                            <option value="LLC">Network Limited Liability Company (LLC)</option>
                            <option value="DAO">Decentralized Autonomous Organization (DAO)</option>
                            <option value="TRUST">Sovereign Trust</option>
                            <option value="COOPERATIVE">Digital Cooperative</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Primary Objective / Mission Statement</label>
                        <textarea 
                            required
                            value={objective}
                            onChange={e => setObjective(e.target.value)}
                            placeholder="Describe the operational purpose, asset targets, and value creation model for this syndicate..."
                            className="w-full h-32 bg-black/60 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none"
                        />
                    </div>
                </div>

                <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-5 flex items-start gap-4">
                    <BrainCircuit className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Promethea Legal Synthesis</h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            Upon submission, Promethea will synthesize a formal operating agreement, assign cryptographic genesis hashes, and allocate a dedicated workspace in the sovereign network state.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button 
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 border border-white/10 hover:bg-white/5 text-zinc-400 font-bold uppercase tracking-widest rounded transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={isGenerating}
                        className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-widest rounded transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <>Synthesizing Constitution...</>
                        ) : (
                            <>Initialize Syndicate →</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
