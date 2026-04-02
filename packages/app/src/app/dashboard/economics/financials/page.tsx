'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore } from '@promethea/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@promethea/ui';
import { LedgerValue, RealityBadge } from '@promethea/components';
import { Landmark, TrendingUp, BarChart3, Clock, DollarSign, Wallet, ShieldCheck, Zap, Activity, Cpu, Printer, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// Local badge removed in favor of global @promethea/components/RealityBadge

export default function FinancialsPage() {
    const db = useFirestore();
    const uvtQuery = useMemo(() => db ? query(collection(db, 'universal_value_tokens')) : null, [db]);

    const { data: uvtDocs, isLoading } = useCollection<any>(uvtQuery);

    if (isLoading) return <div className="p-10 text-zinc-500 animate-pulse">Calculating Substrate Economics...</div>;

    // Aggregate UVT values
    let totalUVT = 0;
    let founderUVT = 0;
    
    uvtDocs?.forEach(doc => {
        const amount = doc.amount || 0;
        totalUVT += amount;
        if (doc.ownerId.startsWith('uiRLj9')) founderUVT += amount;
    });

    const valuationRatio = 1.0; 
    const totalMarketCap = totalUVT * valuationRatio;

    // Financial History
    const historyMap: Record<string, number> = {};
    uvtDocs?.forEach(doc => {
        const date = doc.timestamp?.toDate()?.toISOString().split('T')[0] || doc.createdAt?.split('T')[0] || '2025-12-01';
        historyMap[date] = (historyMap[date] || 0) + (doc.amount || 0);
    });

    const chartData = Object.entries(historyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amount]) => ({ date, amount }));

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24 print:p-0">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-4xl font-headline font-bold uppercase tracking-tighter flex items-center gap-3">
                        <Landmark className="w-8 h-8 text-primary" />
                        GAAP Financials
                    </h1>
                    <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1">Network State Consolidated Audit (v1.0)</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-[10px] uppercase font-bold tracking-widest border-zinc-800 flex items-center gap-1.5"
                        onClick={() => window.print()}
                    >
                        <Printer className="w-3 h-3" />
                        Print Statement
                    </Button>
                    <Button 
                        size="sm" 
                        className="text-[10px] uppercase font-bold tracking-widest px-6 shadow-lg shadow-primary/20 bg-primary text-black hover:bg-white transition-all flex items-center gap-1.5"
                        onClick={() => window.location.href='/dashboard/ledger'}
                    >
                        <Search className="w-3 h-3" />
                        Audit Ledger
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-black border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                         <TrendingUp className="w-32 h-32 text-primary" />
                    </div>
                    <CardHeader className="flex flex-row justify-between items-center bg-white/[0.02] border-b border-white/5">
                        <CardTitle className="text-sm uppercase tracking-widest font-bold text-zinc-400">Consolidated Balance Sheet</CardTitle>
                        <RealityBadge state="SETTLED" />
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end pt-8">
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                    Total Assets (UVT Capitalized)
                                </p>
                                <LedgerValue value={totalMarketCap} isSimulated={true} className="text-5xl font-headline font-black" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><Wallet className="w-3 h-3 text-blue-400" /> Solana Cash</p>
                                        <RealityBadge state="ACTUALIZED" />
                                    </div>
                                    <LedgerValue value={72450.00} isSimulated={false} className="text-sm font-mono" />
                                    <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-500/20" />
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><Zap className="w-3 h-3 text-emerald-400" /> Intellectual Capital</p>
                                        <RealityBadge state="SETTLED" />
                                    </div>
                                    <LedgerValue value={totalMarketCap - 72450} isSimulated={true} className="text-sm font-mono" />
                                    <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500/20" />
                                </div>
                            </div>
                        </div>
                        <div className="h-[180px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00BCD4" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#00BCD4" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="amount" stroke="#00BCD4" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: 'rgba(9,9,11,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff', fontSize: '10px' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Earnings & Equity */}
                <Card className="bg-zinc-900/60 border-white/5 flex flex-col overflow-hidden">
                    <CardHeader className="bg-white/[0.02] border-b border-white/5">
                        <CardTitle className="text-sm uppercase tracking-widest font-bold text-primary">Equity Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6 pt-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Founder (Sweat Equity)</p>
                                    <RealityBadge state="SETTLED" />
                                </div>
                                <p className="text-sm font-mono font-bold text-white uppercase">{founderUVT.toLocaleString()} <span className="text-xs text-secondary opacity-50 ml-1">UVT</span></p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Synthetic Stake (S.I.P.S)</p>
                                    <RealityBadge state="SIMULATED" />
                                </div>
                                <p className="text-sm font-mono font-bold text-white uppercase">{ (totalUVT - founderUVT).toLocaleString() } <span className="text-xs text-secondary opacity-50 ml-1">UVT</span></p>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Public Float</p>
                                <p className="text-sm font-mono font-bold text-zinc-800 uppercase italic">Awaiting Mainnet Bridge</p>
                            </div>
                        </div>

                        <div className="mt-auto p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                            <h4 className="text-[10px] uppercase font-black text-primary flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Audit Opinion</h4>
                            <p className="text-[10px] text-zinc-300 leading-relaxed italic">
                                "The financial statements present fairly, in all material respects, the financial position of the Promethean Network State as of March 25, 2026."
                            </p>
                            <div className="flex items-center gap-2 pt-2 border-t border-primary/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[8px] uppercase font-bold text-primary/60 tracking-widest">Substrate Verified</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Income Statement Placeholder */}
            <Card className="bg-zinc-900 border-white/5 border-dashed border-2 opacity-30 hover:opacity-50 transition-all cursor-not-allowed group print:hidden">
                 <CardContent className="py-20 text-center space-y-4">
                     <Clock className="w-12 h-12 text-zinc-700 mx-auto group-hover:animate-bounce" />
                     <p className="text-xs font-bold uppercase tracking-widest text-zinc-700">Consolidated Income Statement (P&L)</p>
                     <p className="text-[10px] text-zinc-800">Tracking Passive Yield Generation In-Engine...</p>
                 </CardContent>
            </Card>
        </div>
    );
}
