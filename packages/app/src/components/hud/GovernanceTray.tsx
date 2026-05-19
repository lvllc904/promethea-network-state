'use client';

import React, { useState, useEffect } from 'react';
import { Scale, Users, Gavel, PlusCircle, CheckCircle, XCircle, ArrowLeft, Send, Loader2 } from 'lucide-react';

function useBFFData<T>(path: string, defaultValue: T): { data: T; refetch: () => void } {
    const [data, setData] = useState<T>(defaultValue);
    const fetchData = () => {
        fetch(path)
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d !== null) setData(d); })
            .catch(() => {});
    };
    useEffect(() => { fetchData(); }, [path]);
    return { data, refetch: fetchData };
}

import { useHUD } from '@/lib/hud-store';

const PROPOSAL_TYPES = ['CONSTITUTIONAL', 'ECONOMIC', 'DIPLOMATIC', 'OPERATIONAL', 'TERRITORIAL'] as const;

// ─── Inline Proposal Creation Form ──────────────────────────────────────────
const NewProposalForm = ({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<string>('CONSTITUTIONAL');
    const [narrative, setNarrative] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !narrative.trim()) {
            setError('Title and narrative are required.');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await fetch('/api/governance/proposals', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('pns_sovereign_token') : ''}`,
                },
                body: JSON.stringify({ title, type, narrative }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `Server error: ${res.status}`);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to submit proposal.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onBack}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
                </button>
                <p className="text-[9px] text-cyan-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Scale className="w-3 h-3" /> Draft New Proposal
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Type Selector */}
                <div>
                    <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Proposal Type</label>
                    <div className="flex flex-wrap gap-1">
                        {PROPOSAL_TYPES.map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${
                                    type === t
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        : 'bg-black/40 text-zinc-600 border border-white/5 hover:text-zinc-300'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Proposal Title</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="State the sovereign intent..."
                        className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-[11px] text-white placeholder-zinc-700 focus:outline-none focus:border-cyan-500/40 transition-colors"
                    />
                </div>

                {/* Narrative */}
                <div>
                    <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Initial Narrative</label>
                    <textarea
                        value={narrative}
                        onChange={e => setNarrative(e.target.value)}
                        placeholder="Describe the constitutional basis and desired outcome..."
                        rows={5}
                        className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-[11px] text-white placeholder-zinc-700 focus:outline-none focus:border-cyan-500/40 transition-colors resize-none"
                    />
                </div>

                {error && (
                    <p className="text-[9px] text-red-400 font-mono">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-black text-[9px] font-black uppercase tracking-widest rounded transition-all"
                >
                    {isSubmitting ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Submitting to Docket...</>
                    ) : (
                        <><Send className="w-3 h-3" /> Actualize Proposal</>
                    )}
                </button>
            </form>
        </div>
    );
};

// ─── Main Tray ──────────────────────────────────────────────────────────────
export const GovernanceTray = () => {
    const { activateFocusPanel } = useHUD();
    const { data: proposals, refetch: refetchProposals } = useBFFData<any[]>('/api/governance/proposals', []);
    const { data: capTable } = useBFFData<any>('/api/governance/cap-table', null);
    const { data: citizens } = useBFFData<any[]>('/api/citizens', []);
    const [activeSection, setActiveSection] = useState<'proposals' | 'cap_table' | 'citizens'>('proposals');
    const [isVoting, setIsVoting] = useState<string | null>(null);
    const [showNewProposal, setShowNewProposal] = useState(false);

    const [extraProposals, setExtraProposals] = useState<any[]>([]);

    useEffect(() => {
        const handleOmniUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail && (detail.type === 'GIT_PROPOSAL' || detail.type === 'AUTO_UNDERWRITE')) {
                const newProposal = {
                    id: 'prop-' + Date.now(),
                    title: detail.title,
                    type: detail.type === 'GIT_PROPOSAL' ? 'CONSTITUTIONAL' : 'TERRITORIAL',
                    current: 4,
                    threshold: 10,
                    narrative: detail.description || 'Dynamic operational revision proposal.'
                };
                setExtraProposals(prev => [newProposal, ...prev]);
            }
        };
        window.addEventListener('sovereign-omni-update', handleOmniUpdate);
        return () => window.removeEventListener('sovereign-omni-update', handleOmniUpdate);
    }, []);

    const combinedProposals = [...extraProposals, ...proposals];


    const handleVote = async (proposalId: string, vote: 'FOR' | 'AGAINST') => {
        setIsVoting(proposalId);
        try {
            await fetch('/api/governance/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proposalId, vote })
            });
            refetchProposals();
        } catch (e) {
            console.error(e);
        } finally {
            setIsVoting(null);
        }
    };

    const cap = capTable || { promethea: 40.0, citizens: 35.2, liquidity: 24.8 };

    // Show inline form instead of navigating away
    if (showNewProposal) {
        return (
            <NewProposalForm
                onBack={() => setShowNewProposal(false)}
                onSuccess={() => {
                    setShowNewProposal(false);
                    refetchProposals();
                }}
            />
        );
    }

    return (
        <div className="space-y-5">
            {/* Section Switcher */}
            <div className="flex rounded-lg border border-white/10 p-0.5 bg-black/40">
                {(['proposals', 'cap_table', 'citizens'] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setActiveSection(s)}
                        className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${activeSection === s ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-white'}`}
                    >
                        {s === 'proposals' ? 'Docket' : s === 'cap_table' ? 'Cap Table' : 'Citizens'}
                    </button>
                ))}
            </div>

            {activeSection === 'proposals' && (
                <>
                    <div className="flex justify-between items-center">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <Scale className="w-3 h-3 text-cyan-400" /> Active Proposals
                        </p>
                        <button
                            onClick={() => setShowNewProposal(true)}
                            className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded text-[9px] font-black text-cyan-400 transition-all"
                        >
                            <PlusCircle className="w-3 h-3" /> New
                        </button>
                    </div>

                    {combinedProposals.length === 0 ? (
                        <div className="py-10 flex flex-col items-center gap-3 text-center">
                            <Scale className="w-8 h-8 text-zinc-800" />
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase">No Proposals Pending</p>
                                <p className="text-[9px] text-zinc-700 mt-1">Draft a new constitutional mandate to direct the state.</p>
                            </div>
                            <button
                                onClick={() => setShowNewProposal(true)}
                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black text-[9px] font-black uppercase tracking-widest rounded transition-all"
                            >
                                Draft New Proposal
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {combinedProposals.map((p: any) => {
                                const progress = Math.min(100, ((p.current || 0) / (p.threshold || 100)) * 100);
                                return (
                                    <div key={p.id} className="p-3 bg-black/40 border border-white/5 rounded-lg hover:border-cyan-500/20 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-[8px] text-zinc-600 font-bold uppercase">{p.type} · {p.id}</span>
                                                <p className="text-[11px] font-bold text-white uppercase leading-tight">{p.title}</p>
                                            </div>
                                            <span className="text-[9px] font-mono text-cyan-400">{p.current}/{p.threshold}</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-3">
                                            <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleVote(p.id, 'FOR')}
                                                disabled={isVoting === p.id}
                                                className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-400 uppercase transition-all disabled:opacity-50"
                                            >
                                                <CheckCircle className="w-3 h-3" /> Affirm
                                            </button>
                                            <button
                                                onClick={() => handleVote(p.id, 'AGAINST')}
                                                disabled={isVoting === p.id}
                                                className="px-4 py-1.5 flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 rounded text-[9px] font-black text-red-500 uppercase transition-all disabled:opacity-50"
                                            >
                                                <XCircle className="w-3 h-3" /> Dissent
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {activeSection === 'cap_table' && (
                <div className="space-y-4">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Gavel className="w-3 h-3 text-cyan-400" /> Live Cap Table
                    </p>
                    {[
                        { label: 'Promethea Base', val: cap.promethea, color: 'bg-cyan-500' },
                        { label: 'Citizen Pool', val: cap.citizens, color: 'bg-purple-500' },
                        { label: 'Liquidity Routing', val: cap.liquidity, color: 'bg-emerald-500' },
                    ].map(row => (
                        <div key={row.label}>
                            <div className="flex justify-between text-[9px] mb-1">
                                <span className="text-zinc-400 font-bold uppercase">{row.label}</span>
                                <span className="text-white font-mono font-bold">{row.val?.toFixed(1) ?? '—'}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.val ?? 0}%` }} />
                            </div>
                        </div>
                    ))}

                    <div className="mt-4 p-3 bg-black/40 border border-white/5 rounded-lg">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Scale className="w-3 h-3" /> Constitutional Manifest
                        </p>
                        <p className="text-[10px] font-mono text-zinc-600 leading-relaxed">
                            [ READ-ONLY MIRROR OF ROADMAP.MD ]<br /><br />
                            The Manifest is the absolute anchor of the state. Every sovereign action must be committed to this ledger before implementation.
                        </p>
                    </div>
                </div>
            )}

            {activeSection === 'citizens' && (
                <div className="space-y-2">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-cyan-400" /> Citizen Ledger
                    </p>
                    {citizens.length === 0 ? (
                        <p className="py-8 text-center text-[9px] text-zinc-700 uppercase font-bold tracking-widest">No Citizens Registered</p>
                    ) : citizens.map((c: any) => (
                        <div
                            key={c.id}
                            onClick={() => activateFocusPanel('SWEAT_CLAIM')}
                            className="flex items-center gap-3 px-3 py-2.5 bg-black/40 border border-white/5 rounded-lg hover:border-cyan-500/20 cursor-pointer transition-colors"
                        >
                            <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-[9px] font-black text-cyan-400">{(c.name || c.displayName || 'C')[0]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-white uppercase truncate">{c.name || c.displayName || c.id}</p>
                                <p className="text-[8px] font-mono text-zinc-600 truncate">{c.id}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-[8px] text-zinc-600 uppercase">Weight</p>
                                <p className="text-[10px] font-mono text-zinc-300 font-bold">{c.weight || '0'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
