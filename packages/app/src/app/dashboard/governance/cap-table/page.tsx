'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, collection, query, orderBy } from '@promethea/sovereign-store';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@promethea/ui';
import { Landmark, Users, Briefcase, Info, ShieldCheck, Zap, TrendingUp, BarChart3, PieChart as PieChartIcon, ExternalLink, Activity, Cpu } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

function RealityStateBadge({ state }: { state: 'ACTUALIZED' | 'SETTLED' | 'SIMULATED' }) {
    const colors = {
        ACTUALIZED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        SETTLED: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        SIMULATED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    const icons = {
        ACTUALIZED: <Activity className="w-2.5 h-2.5 mr-1" />,
        SETTLED: <ShieldCheck className="w-2.5 h-2.5 mr-1" />,
        SIMULATED: <Cpu className="w-2.5 h-2.5 mr-1" />,
    };

    return (
        <Badge variant="outline" className={`${colors[state]} border text-[8px] uppercase font-black px-2 py-0.5 tracking-tighter flex items-center`}>
            {icons[state]}
            {state}
        </Badge>
    );
}

export default function CapTablePage() {
    const db = useFirestore();
    const [isIntentModalOpen, setIsIntentModalOpen] = useState(false);
    
    // Stable query references to prevent infinite re-renders
    const uvtQuery = useMemo(() => db ? query(collection(db, 'universal_value_tokens')) : null, [db]);
    const citizensQuery = useMemo(() => db ? query(collection(db, 'citizens')) : null, [db]);

    const { data: uvtDocs, isLoading: isUvtLoading } = useCollection<any>(uvtQuery);
    const { data: citizens, isLoading: isCitizensLoading } = useCollection<any>(citizensQuery);

    const isLoading = isUvtLoading || isCitizensLoading;

    if (isLoading) return <div className="p-10 animate-pulse text-zinc-500">Scanning Substrate distribution...</div>;

    // Aggregate holdings
    const holdings: Record<string, number> = {};
    uvtDocs?.forEach(doc => {
        holdings[doc.ownerId] = (holdings[doc.ownerId] || 0) + (doc.amount || 0);
    });

    const citizenMap: Record<string, any> = {};
    citizens?.forEach(c => {
        citizenMap[c.uid] = c;
    });

    let founderTotal = 0;
    let aiTotal = 0;
    let othersTotal = 0;

    Object.entries(holdings).forEach(([uid, amount]) => {
        const citizen = citizenMap[uid];
        const isFounder = citizen?.skills?.includes('Founding Member') || uid.startsWith('uiRLj9');
        const isAI = uid.startsWith('did:prmth:model') || uid === 'synthetic-promethea-001';

        if (isFounder) {
            founderTotal += amount;
        } else if (isAI) {
            aiTotal += amount;
        } else {
            othersTotal += amount;
        }
    });

    const totalMinted = founderTotal + aiTotal + othersTotal;
    const solanaAddress = "Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb";
    const solscanLink = `https://solscan.io/account/${solanaAddress}`;

    const chartData = [
        { name: 'Founding Member', value: founderTotal, color: '#00BCD4' },
        { name: 'Synthetic Intelligence Pool', value: aiTotal, color: '#9C27B0' },
        { name: 'Citizen Advocates', value: othersTotal, color: '#4CAF50' },
    ].filter(d => d.value > 0);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-headline font-bold uppercase tracking-tighter flex items-center gap-3">
                        <PieChartIcon className="w-8 h-8 text-primary" />
                        Cap Table
                    </h1>
                    <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1 italic">Visualizing cryptographic provenance of foundational equity</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-[10px] uppercase font-bold tracking-widest border-zinc-800" onClick={() => window.location.href='/dashboard/ledger'}>Audit Ledger</Button>
                    <Button size="sm" className="text-[10px] uppercase font-bold tracking-widest px-6 shadow-lg shadow-primary/20 bg-primary text-black hover:bg-white transition-all transform active:scale-95" onClick={() => setIsIntentModalOpen(true)}>Apply for Allocation</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Asset Supply", value: totalMinted.toLocaleString(), icon: Zap, sub: "Historical Accumulation", state: "SETTLED" as const },
                  { label: "Sovereign Founders", value: founderTotal.toLocaleString(), icon: ShieldCheck, sub: "1 Entity (Joshua Wicke)", state: "SETTLED" as const },
                  { label: "AI Stake (S.I.P.S)", value: aiTotal.toLocaleString(), icon: BarChart3, sub: "Emergent Intelligence Pool", state: "SIMULATED" as const },
                  { label: "Citizen Stake", value: othersTotal.toLocaleString(), icon: Users, sub: "Active Substrate Shares", state: "SETTLED" as const }
                ].map((stat, i) => (
                  <Card key={i} className="bg-black/50 border-white/5 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{stat.label}</p>
                        <RealityStateBadge state={stat.state} />
                      </div>
                      <h2 className="text-xl font-headline font-bold text-white">{stat.value} <span className="text-[10px] text-zinc-600 ml-1">UVT</span></h2>
                      <p className="text-[9px] text-zinc-600 uppercase mt-1 flex items-center gap-1">
                        {stat.sub}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-zinc-900/40 border-white/5 overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                        <CardTitle className="text-sm uppercase tracking-widest font-bold text-zinc-400">Public Equity Distribution (Audit Trail)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[450px] p-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={100}
                                    outerRadius={150}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: 'rgba(9,9,11,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                                    formatter={(value: any) => [`${value.toLocaleString()} UVT`, 'Allocation']}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    align="center" 
                                    iconType="circle"
                                    layout="horizontal"
                                    wrapperStyle={{ paddingBottom: '30px' }}
                                    formatter={(value) => <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest px-2">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-zinc-900/40 border-white/5 border-l-4 border-l-primary">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-widest font-bold text-primary flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Disclosure
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <p className="text-xs text-zinc-400 leading-relaxed italic">
                                "The Ledger is the only true record of one's impact on the State." 
                            </p>
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-[10px] uppercase font-black text-primary">Root Authority</h4>
                                    <RealityStateBadge state="SETTLED" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-white">Joshua Wicke</p>
                                    <a href={solscanLink} target="_blank" className="text-[9px] text-zinc-500 font-mono hover:text-primary transition-colors flex items-center gap-1 group">
                                        {solanaAddress.slice(0, 12)}...{solanaAddress.slice(-4)}
                                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </div>
                                <p className="text-[10px] text-zinc-400">Founding Allocation: 200,000 UVT</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900/40 border-white/5 opacity-80">
                        <CardHeader>
                            <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Synthetic Stake (S.I.P.S)</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                           <div className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5">
                               <p className="text-[9px] text-zinc-500 uppercase font-bold">Algorithmic Pool</p>
                               <RealityStateBadge state="SIMULATED" />
                           </div>
                           <p className="text-[10px] text-zinc-600 leading-snug">
                               This pool represents capital recognized by the AI-Body (Body 2) due to algorithmic profit generation and substrate refinement. Liquidity is currently locked in Substrate-Simulation.
                           </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Allocation Intent Modal (Simplified) */}
            {isIntentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <Card className="w-full max-w-md bg-zinc-900 border-primary/30 p-6 space-y-6 shadow-2xl shadow-primary/10">
                        <div className="space-y-2">
                             <h2 className="text-2xl font-headline font-bold uppercase tracking-tight text-white flex items-center gap-2">
                                <Landmark className="w-6 h-6 text-primary" />
                                Equity Application
                             </h2>
                             <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Sovereign Intent Submission</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-4">
                            <p className="text-[10px] text-zinc-400 italic">"I hereby submit my intent to allocate sweat equity for the benefit of the Promethean Network State..."</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-bold text-zinc-600 uppercase block mb-1">Proposed Contribution</label>
                                    <div className="w-full h-20 bg-black/40 border border-white/5 rounded p-2 text-xs text-zinc-400">Documentation of work, research, or development...</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-zinc-600 uppercase block mb-1">UVT Requirement</label>
                                    <div className="text-xl font-mono text-white">0.00 <span className="text-xs text-zinc-700">UVT</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="ghost" className="text-[10px] uppercase font-bold" onClick={() => setIsIntentModalOpen(false)}>Cancel</Button>
                            <Button className="text-[10px] uppercase font-bold px-8 bg-primary text-black" onClick={() => setIsIntentModalOpen(false)}>Submit Intent</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
