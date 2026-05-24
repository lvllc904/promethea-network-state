import React from 'react';
import { Briefcase, Bot, Scale, ArrowRight, ExternalLink } from 'lucide-react';

const MOCK_GIGS = [
    { id: 'G-104', title: 'Write CLI implementation for the Substrate', reward: '500 UVT', status: 'OPEN', type: 'GIG' },
    { id: 'A-002', title: 'Optimize Liquidity Pools based on new threshold', reward: 'Autonomous', status: 'IN_PROGRESS', type: 'AI_ACTION' },
    { id: 'P-992', title: 'Increase RESTORATION threshold to 10%', reward: 'Governance', status: 'PENDING_VOTE', type: 'PROPOSAL' },
];

export const MarketplaceTray = () => {
    return (
        <div className="w-full max-w-sm ml-6 flex flex-col gap-6 font-mono text-zinc-300">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2 bg-zinc-800 rounded-full border border-white/5">
                    <Briefcase className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">Universal Matrix</h2>
                    <p className="text-[10px] text-zinc-500 tracking-wider">Gigs, Autonomous Actions & Proposals</p>
                </div>
            </div>

            {/* Matrix List */}
            <div className="space-y-3">
                {MOCK_GIGS.map((item) => (
                    <div key={item.id} className="p-3 bg-black/40 border border-white/5 rounded-lg hover:border-cyan-500/20 transition-colors group cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                {item.type === 'GIG' && <Briefcase className="w-3 h-3 text-emerald-400" />}
                                {item.type === 'AI_ACTION' && <Bot className="w-3 h-3 text-purple-400" />}
                                {item.type === 'PROPOSAL' && <Scale className="w-3 h-3 text-cyan-400" />}
                                <span className="text-[8px] text-zinc-500 font-bold uppercase">{item.type} · {item.id}</span>
                            </div>
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                item.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400' :
                                item.status === 'IN_PROGRESS' ? 'bg-purple-500/10 text-purple-400' :
                                'bg-cyan-500/10 text-cyan-400'
                            }`}>
                                {item.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-[11px] font-bold text-white uppercase leading-tight mb-2">{item.title}</p>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                            <span className="text-[10px] text-zinc-400">{item.reward}</span>
                            <div className="flex items-center gap-1 text-[9px] text-zinc-500 group-hover:text-white transition-colors">
                                View Details <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer action */}
            <button className="w-full py-2.5 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-[9px] font-black uppercase tracking-widest rounded transition-all">
                <ExternalLink className="w-3 h-3" /> Open Full Matrix
            </button>
        </div>
    );
};
