'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, ScrollArea } from '@promethea/ui';
import { Terminal, Brain, Shield, AlertTriangle, Activity } from 'lucide-react';

interface IntentEntry {
    timestamp: string;
    thought: string;
    context: any;
    id: string;
}

export function IntentLedger({ limit = 10 }: { limit?: number }) {
    const [ledger, setLedger] = useState<IntentEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLedger = async () => {
        try {
            const url = process.env.NEXT_PUBLIC_GUARDIAN_URL || 'http://localhost:3001';
            const response = await fetch(`${url}/auth/intent-ledger?limit=${limit}`);
            const data = await response.json();
            if (data && data.ledger) {
                setLedger(data.ledger);
            }
        } catch (error) {
            console.error('Failed to fetch intent ledger', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
        const interval = setInterval(fetchLedger, 5000); // 5 seconds
        return () => clearInterval(interval);
    }, [limit]);

    if (isLoading && ledger.length === 0) {
        return (
            <div className="p-4 border border-primary/10 rounded-lg animate-pulse bg-muted/20">
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-muted rounded"></div>
            </div>
        );
    }

    return (
        <Card className="border-primary/20 bg-black/40 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardHeader className="pb-2 border-b border-primary/10">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg font-headline">Intent Mirror</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-primary/20 bg-primary/5 animate-pulse">
                        Live Stream
                    </Badge>
                </div>
                <CardDescription className="text-xs">Real-time awareness stream from the Apex Master Guardian.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px] w-full p-4">
                    <div className="space-y-4 font-mono text-xs">
                        {ledger.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground italic">
                                Awaiting neural synchronization...
                            </div>
                        ) : (
                            ledger.slice().reverse().map((entry) => (
                                <div key={entry.id} className="group/item border-l border-primary/30 pl-3 py-1 hover:bg-primary/5 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] text-primary/60">
                                            {new Date(entry.timestamp).toLocaleTimeString()}
                                        </span>
                                        <div className="flex gap-1">
                                            {entry.thought.includes('Security') && <Shield className="w-3 h-3 text-red-500" />}
                                            {entry.thought.includes('Memory') && <Brain className="w-3 h-3 text-blue-500" />}
                                            {entry.thought.includes('Pulse') && <Activity className="w-3 h-3 text-green-500" />}
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground group-hover/item:text-foreground transition-colors leading-relaxed">
                                        {entry.thought}
                                    </p>
                                    {entry.context && Object.keys(entry.context).length > 0 && (
                                        <div className="mt-2 text-[9px] text-muted-foreground/40 hidden group-hover/item:block">
                                            <pre>{JSON.stringify(entry.context, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
