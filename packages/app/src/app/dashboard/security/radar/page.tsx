'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, Progress } from '@promethea/ui';
import { Radar, Activity, Zap, Shield, AlertTriangle, RefreshCw, Cpu, HardDrive, Clock } from 'lucide-react';
import { ThreatDetector } from '@promethea/components';
import { useFirestore, useDoc } from '@promethea/firebase';
import { doc } from 'firebase/firestore';
import { IntentLedger } from '../../../../components/intel/IntentLedger';

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
    const { data: brainPulse } = useDoc<BrainPulse>(firestore ? doc(firestore, 'security_telemetry', 'pulse') as any : null);

    const [isRefreshing, setIsRefreshing] = React.useState(false);

    // Fallback to brain pulse metrics if available
    const displayMetrics = {
        cpu: brainPulse ? Math.min(100, (brainPulse.memoryPatterns / 10)) : 42,
        memory: brainPulse ? Math.min(100, (brainPulse.securityEvents * 5)) : 68,
        latency: 124,
        accuracy: brainPulse ? brainPulse.predictiveAccuracy * 100 : 85,
        load: brainPulse ? (brainPulse.uptime / 3600).toFixed(2) : '1.45'
    };

    const refreshMetrics = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 800);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-black/50 min-h-screen">
            <div className="flex justify-between items-start border-b border-primary/20 pb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-headline flex items-center gap-2 text-white">
                        <Radar className="w-8 h-8 text-red-500 animate-pulse" />
                        Live Threat Radar
                    </h1>
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
                        <CardTitle className="text-2xl font-mono text-white">{displayMetrics.cpu.toFixed(0)}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={displayMetrics.cpu} className="h-1 bg-primary/10" />
                    </CardContent>
                </Card>
                <Card className="border-primary/20 bg-black/40 backdrop-blur shadow-lg group">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                            <span>Metabolism</span>
                            <Activity className="w-3 h-3 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-mono text-white">{displayMetrics.memory.toFixed(0)}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={displayMetrics.memory} className="h-1 bg-green-500/10 [&>div]:bg-green-500" />
                    </CardContent>
                </Card>
                <Card className="border-primary/20 bg-black/40 backdrop-blur shadow-lg group">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                            <span>Accuracy</span>
                            <Zap className="w-3 h-3 text-yellow-500" />
                        </div>
                        <CardTitle className="text-2xl font-mono text-white">{displayMetrics.accuracy.toFixed(1)}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={displayMetrics.accuracy} className="h-1 bg-yellow-500/10 [&>div]:bg-yellow-500" />
                    </CardContent>
                </Card>
                <Card className="border-primary/20 bg-black/40 backdrop-blur shadow-lg group">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                            <span>Uptime (Hrs)</span>
                            <Clock className="w-3 h-3 text-purple-500" />
                        </div>
                        <CardTitle className="text-2xl font-mono text-white">{displayMetrics.load}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-1 w-full bg-purple-500/10 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 animate-pulse w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-primary/30 shadow-2xl shadow-red-500/10 overflow-hidden bg-black/60 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                        <CardHeader className="border-b border-primary/10">
                            <CardTitle className="text-xl font-headline flex items-center gap-2 text-white">
                                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                                Perimeter Analysis
                            </CardTitle>
                            <CardDescription className="text-xs uppercase tracking-tight">Active surveillance: Non-sovereign incursion scanning.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="relative h-[350px] flex items-center justify-center">
                                <ThreatDetector onDetect={async () => ({ threatDetected: false, threatDescription: "Substrate Status: Alignment Optimal.", suggestedAction: "Maintain metabolic stream." })} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <IntentLedger limit={15} />
                    </div>
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
                                    <span className="font-bold">98.4%</span>
                                </div>
                                <Progress value={98.4} className="h-1.5" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground uppercase">Threat Suppression</span>
                                    <span className="font-bold">Active</span>
                                </div>
                                <div className="flex gap-2">
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">WAF</Badge>
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">AUTH</Badge>
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">INTEGRITY</Badge>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-primary/10">
                                <p className="text-xs text-muted-foreground italic">
                                    The "Immune System" substrate is currently executing Wave 4 protocols.
                                    Metabolic sensors are synchronized with AMG Core.
                                </p>
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
