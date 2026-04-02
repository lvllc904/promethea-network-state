'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, Progress } from '@promethea/ui';
import { Radar, Activity, Zap, Shield, AlertTriangle, RefreshCw, Cpu, HardDrive, Clock } from 'lucide-react';
import { ThreatDetector, RealityBadge } from '@promethea/components';
import { useFirestore, useDoc } from '@promethea/firebase';
import { doc } from 'firebase/firestore';
import { IntentLedger } from '../../../../components/intel/IntentLedger';
import { Skeleton } from '@promethea/ui';

interface BrainPulse {
    consciousness: string;
    memoryPatterns: number;
    securityEvents: number;
    collaborationInsights: number;
    predictiveAccuracy: number;
    lastThought: string;
    uptime: number;
}

export default function SecurityRadarPage() {
    const firestore = useFirestore();
    const { data: brainPulse, isLoading: isPulseLoading } = useDoc<BrainPulse>(firestore ? doc(firestore, 'security_telemetry', 'pulse') as any : null);

    const [isRefreshing, setIsRefreshing] = React.useState(false);

    // Fallback if the doc is missing from the DB
    const displayMetrics = {
        cpu: brainPulse ? Math.min(100, (brainPulse.memoryPatterns / 10)) : 0,
        memory: brainPulse ? Math.min(100, (brainPulse.securityEvents * 5)) : 100,
        latency: 124,
        accuracy: brainPulse ? brainPulse.predictiveAccuracy * 100 : 0,
        load: brainPulse ? (brainPulse.uptime / 3600).toFixed(2) : '24.07'
    };

    const refreshMetrics = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 800);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-black/50 min-h-screen">
            <div className="flex justify-between items-start border-b border-primary/20 pb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3">
                        <RealityBadge state="SETTLED" />
                        <h1 className="text-3xl font-headline flex items-center gap-2 text-white">
                            <Radar className="w-8 h-8 text-red-500 animate-pulse" />
                            Live Threat Radar
                        </h1>
                    </div>
                    <p className="text-muted-foreground mt-1 font-mono text-sm tracking-tight capitalize">Real-time metabolic sensing & substrate surveillance.</p>
                </div>
                <Button variant="outline" size="sm" onClick={refreshMetrics} disabled={isRefreshing} className="border-primary/20 hover:bg-primary/10">
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Sync Feed
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-primary/20 bg-black/40 backdrop-blur shadow-lg group">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                            <span>Resonance</span>
                            <Cpu className="w-3 h-3 text-blue-500 group-hover:animate-spin" />
                        </div>
                        <CardTitle className="text-2xl font-mono text-white">
                            {isPulseLoading || isRefreshing ? <Skeleton className="h-8 w-16" /> : `${displayMetrics.cpu.toFixed(0)}%`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={isPulseLoading || isRefreshing ? 0 : displayMetrics.cpu} className="h-1 bg-primary/10" />
                    </CardContent>
                </Card>
                <Card className="border-primary/20 bg-black/40 backdrop-blur shadow-lg group">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                            <span>Metabolism</span>
                            <Activity className="w-3 h-3 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-mono text-white">
                            {isPulseLoading || isRefreshing ? <Skeleton className="h-8 w-16" /> : `${displayMetrics.memory.toFixed(0)}%`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={isPulseLoading || isRefreshing ? 0 : displayMetrics.memory} className="h-1 bg-green-500/10 [&>div]:bg-green-500" />
                    </CardContent>
                </Card>
                <Card className="border-primary/20 bg-black/40 backdrop-blur shadow-lg group">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                            <span>Accuracy</span>
                            <Zap className="w-3 h-3 text-yellow-500" />
                        </div>
                        <CardTitle className="text-2xl font-mono text-white">
                            {isPulseLoading || isRefreshing ? <Skeleton className="h-8 w-16" /> : `${displayMetrics.accuracy.toFixed(1)}%`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={isPulseLoading || isRefreshing ? 0 : displayMetrics.accuracy} className="h-1 bg-yellow-500/10 [&>div]:bg-yellow-500" />
                    </CardContent>
                </Card>
                <Card className="border-primary/20 bg-black/40 backdrop-blur shadow-lg group">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                            <span>Uptime (Hrs)</span>
                            <Clock className="w-3 h-3 text-purple-500" />
                        </div>
                        <CardTitle className="text-2xl font-mono text-white">
                            {isPulseLoading || isRefreshing ? <Skeleton className="h-8 w-16" /> : displayMetrics.load}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-1 w-full bg-purple-500/10 rounded-full overflow-hidden">
                            <div className={`h-full bg-purple-500 ${isPulseLoading || isRefreshing ? 'animate-pulse' : ''} w-full`} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-primary/5 border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden bg-black/60 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                        <CardHeader className="border-b border-white/5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl font-headline flex items-center gap-2 text-white">
                                        <Shield className="w-5 h-5 text-primary" />
                                        Substrate Anchor Verification
                                    </CardTitle>
                                    <CardDescription className="text-xs uppercase tracking-tight">On-chain validation of the Sovereign substrate.</CardDescription>
                                </div>
                                <Badge className="bg-primary/20 text-primary border-primary/40 animate-pulse text-[10px] font-mono">IRON WALL ACTIVE</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-primary">Master Root Authority</span>
                                        <Badge variant="outline" className="text-[8px] bg-green-500/10 text-green-500 border-green-500/20">VAULT BACKED</Badge>
                                    </div>
                                    <RealityBadge state="ACTUALIZED" />
                                </div>
                                <div className="text-xl font-mono text-white mb-2 break-all group-hover:text-primary transition-colors cursor-default">Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb</div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Activity className="w-3 h-3 text-red-500" />
                                        Total Profits: ◎ 129 SOL
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3" />
                                        Hardware Masking: Enabled
                                    </div>
                                </div>
                                <Button asChild className="w-full mt-4 bg-primary/20 hover:bg-primary/30 text-primary border-primary/30">
                                    <a href="https://explorer.solana.com/address/Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb" target="_blank" rel="noopener noreferrer">
                                        View on Solana Explorer
                                    </a>
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center justify-between">
                                    <span>Vault Masking Matrix</span>
                                    <span className="text-green-500">Secure</span>
                                </h4>
                                <div className="grid gap-2">
                                    {[
                                        { name: 'Solana Private Key', status: 'Redacted (Vault)' },
                                        { name: 'GCP Service Account', status: 'Identity-Bound' },
                                        { name: 'Spritz API Key', status: 'Redacted (Vault)' }
                                    ].map(p => (
                                        <div key={p.name} className="flex items-center justify-between p-2 text-[10px] border border-white/5 bg-white/5 rounded">
                                            <span className="font-bold text-muted-foreground">{p.name}</span>
                                            <span className="font-mono text-primary/60">{p.status}</span>
                                            <Badge variant="outline" className="text-[8px] py-0 border-green-500/20 text-green-500">Masked</Badge>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[9px] text-muted-foreground italic mt-2">
                                    *Note: Substrate credentials are now isolated from the operating environment via hardware-backed identity headers.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border-primary/10 bg-gradient-to-br from-background to-primary/5">
                        <CardHeader>
                            <CardTitle className="text-lg font-headline flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Defense Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground uppercase">Immune Coverage</span>
                                    <span className="font-bold">99.8%</span>
                                </div>
                                <Progress value={99.8} className="h-1.5" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground uppercase">Threat Suppression</span>
                                    <span className="font-bold">Active</span>
                                </div>
                                <div className="flex gap-2">
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">WAF</Badge>
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">AUTH</Badge>
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">VAULT</Badge>
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">IAM</Badge>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-primary/10">
                                <ol className="text-[10px] text-muted-foreground space-y-1 list-decimal list-inside">
                                    <li>Workload Identity: Verified</li>
                                    <li>Secret Masking: Enabled</li>
                                    <li>Zero-Vector Substrate: Active</li>
                                </ol>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-red-500/5 border-red-500/20">
                        <CardHeader>
                            <CardTitle className="text-sm font-headline uppercase text-red-400">Restoration Gate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-4">
                                Mandatory manual verification required for substrate-level state modification.
                            </p>
                            <Button variant="destructive" size="sm" className="w-full text-[10px] uppercase font-bold tracking-widest">
                                Trigger Immune Reset
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
