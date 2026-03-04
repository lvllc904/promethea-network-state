'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@promethea/ui';
import { ShieldAlert, Scale, Clock, AlertTriangle } from 'lucide-react';

import { useCollection, useFirestore } from '@promethea/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export default function VetoLogPage() {
    const firestore = useFirestore();
    const vetoesQuery = React.useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'vetoes'), orderBy('timestamp', 'desc'));
    }, [firestore]);

    const { data: vetoes, isLoading } = useCollection(vetoesQuery as any);

    if (isLoading) {
        return (
            <div className="p-24 flex flex-col items-center justify-center gap-4 text-primary animate-pulse">
                <ShieldAlert className="w-12 h-12 mb-2" />
                <span className="font-headline text-lg tracking-widest uppercase">Consulting Judiciary Substrate...</span>
            </div>
        );
    }

    const displayVetoes = vetoes?.length ? vetoes : [
        {
            id: "V-2024-001",
            date: "2024-11-28",
            action: "Automated Micro-Lending optimization",
            reason: "Proposed interest rate exceeded the Maximum Sovereign Usury cap of 12%.",
            status: "Halted",
            impact: "Prevented predatory lending patterns in the economic engine."
        },
        {
            id: "V-2024-002",
            date: "2024-11-29",
            action: "Social sentiment scraping expansion",
            reason: "Data acquisition violated the 'Right to Anonymity' protocol for non-consenting personas.",
            status: "Redacted",
            impact: "Preserved inhabitant privacy substrate."
        }
    ];

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-12">
            <div className="flex justify-between items-end border-b border-red-500/20 pb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-headline flex items-center gap-3 text-white">
                        <ShieldAlert className="w-10 h-10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                        Ethical Veto Log
                    </h1>
                    <p className="text-muted-foreground mt-2 font-mono text-sm tracking-tight">Audit trail of Promethea's autonomous constitutional interventions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {displayVetoes.map((veto: any) => (
                    <Card key={veto.id} className="border-red-500/30 bg-black/40 backdrop-blur-sm relative group overflow-hidden hover:border-red-500/50 transition-all shadow-xl shadow-red-500/5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl pointer-events-none group-hover:bg-red-500/10 transition-all" />
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-red-500 text-white border-none font-bold text-[10px] tracking-widest uppercase px-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                                        {veto.status}
                                    </Badge>
                                    <span className="text-[10px] font-mono text-red-400 opacity-60">REF: {veto.id}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {veto.date}
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-headline mt-3 text-white group-hover:text-red-400 transition-colors">
                                {veto.action}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 text-sm">
                            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 shadow-inner group-hover:bg-red-500/15 transition-all">
                                <p className="font-bold text-red-400 flex items-center gap-2 text-xs uppercase tracking-wider mb-2">
                                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                                    CONSTITUTIONAL BREACH DETECTED
                                </p>
                                <p className="text-white/90 leading-relaxed font-medium">{veto.reason}</p>
                            </div>
                            <div className="flex items-start gap-3 p-2">
                                <Scale className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Judiciary Impact</h4>
                                    <p className="text-muted-foreground italic leading-relaxed">
                                        {veto.impact}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-primary/30 bg-primary/5 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Scale className="w-24 h-24 rotate-12" />
                </div>
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2 text-primary">
                        <Scale className="w-5 h-5" />
                        Constitutional Basis
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-white/70 leading-relaxed">
                    Promethea executes her judiciary role by checking every proposed action from the Economic Engine against the <span className="text-primary font-bold">Sovereign Manifest</span>. Actions that conflict with the ethical substrate are automatically halted and logged here for public audit. This is the <span className="text-red-400 italic">Immune System</span> of the Network State.
                </CardContent>
            </Card>
        </div>
    );
}
