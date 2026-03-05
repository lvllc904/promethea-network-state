'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@promethea/ui';
import { Badge } from '@promethea/ui';
import { Button } from '@promethea/ui';
import {
    DollarSign,
    TrendingUp,
    Activity,
    Zap,
    RefreshCw,
    Play,
    Pause,
    Loader2,
    MapPin,
    Wrench,
    FileText,
    Leaf,
    Shield,
    Cpu
} from 'lucide-react';
import { Skeleton } from '@promethea/ui';

// Types for Economic Engine API responses
interface ModelStat {
    executions: number;
    profit: number;
}

interface MethodStats {
    methodId: string;
    methodName: string;
    executionCount: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    modelStats: Record<string, ModelStat>;
    config: {
        enabled: boolean;
        priority: number;
        maxExecutionsPerDay: number;
        estimatedRevenue: {
            min: number;
            max: number;
        };
    };
}

interface QueueStatus {
    running: boolean;
    queueLength: number;
    registeredMethodsCount: number;
    nextTask: string | null;
}

interface ReserveStats {
    totalProfitRealized: number;
    reserveBalance: number;
    communityPoolBalance: number;
    restorationBalance: number;
    circulatingSupply: number;
    plowbackRate: number;
}

interface IntelligenceInsight {
    id: string;
    category: 'Financial' | 'Environmental' | 'Narrative' | 'Technical' | 'Geopolitical';
    summary: string;
    details: any;
    confidence: number;
    timestamp: any;
}

interface EngineStatus {
    status: string;
    queue: QueueStatus;
    methods: Record<string, MethodStats>;
    reserve: ReserveStats;
    potentialAssets?: number;
    timestamp: string;
}

const ECONOMIC_ENGINE_URL = ''; // Uses relative path via Firebase rewrites (/api/engine/...)

export default function IntelPage() {
    const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);
    const [insights, setInsights] = useState<IntelligenceInsight[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchInsights = async () => {
        try {
            const response = await fetch('/api/engine/intelligence');
            if (response.ok) {
                const data = await response.json();
                setInsights(data);
            }
        } catch (err) {
            console.error('Error fetching insights:', err);
        }
    };

    const fetchEngineStatus = async () => {
        try {
            setIsRefreshing(true);
            setError(null);

            const response = await fetch('/api/engine/status', {
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch engine status: ${response.statusText}`);
            }

            const data: EngineStatus = await response.json();
            setEngineStatus(data);
        } catch (err) {
            console.error('Error fetching engine status:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const executeMethod = async (methodId: string) => {
        try {
            const response = await fetch('/api/engine/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ methodId }),
            });

            if (!response.ok) {
                throw new Error(`Failed to execute method: ${response.statusText}`);
            }

            // Refresh status after execution
            await fetchEngineStatus();
        } catch (err) {
            console.error('Error executing method:', err);
            setError(err instanceof Error ? err.message : 'Failed to execute method');
        }
    };

    useEffect(() => {
        fetchEngineStatus();
        fetchInsights();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchEngineStatus();
            fetchInsights();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const getMethodIcon = (methodId: string) => {
        switch (methodId) {
            case 'seo-blog':
                return FileText;
            case 'land-scanner':
                return MapPin;
            case 'manufacturing':
                return Wrench;
            default:
                return Activity;
        }
    };

    const totalProfit = engineStatus
        ? Object.values(engineStatus.methods).reduce((sum, method) => sum + method.totalProfit, 0)
        : 0;

    const totalRevenue = engineStatus
        ? Object.values(engineStatus.methods).reduce((sum, method) => sum + method.totalRevenue, 0)
        : 0;

    const totalExecutions = engineStatus
        ? Object.values(engineStatus.methods).reduce((sum, method) => sum + method.executionCount, 0)
        : 0;

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-[300px]" />
                    <Skeleton className="h-10 w-[120px]" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-4 w-[100px]" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-[120px]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-headline font-bold tracking-tight">Economic Engine</h2>
                        <p className="text-muted-foreground">Autonomous revenue generation system</p>
                    </div>
                </div>
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Connection Error</CardTitle>
                        <CardDescription>Failed to connect to the Economic Engine</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{error}</p>
                        <Button onClick={fetchEngineStatus} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Connection
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-headline font-bold tracking-tight">Economic Engine</h2>
                    <p className="text-muted-foreground">Autonomous revenue generation system</p>
                </div>
                <Button
                    onClick={fetchEngineStatus}
                    variant="outline"
                    disabled={isRefreshing}
                >
                    {isRefreshing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Refresh
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${totalProfit.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Revenue: ${totalRevenue.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Methods</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{engineStatus?.queue.registeredMethodsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {Object.values(engineStatus?.methods || {}).filter(m => m.config.enabled).length} enabled
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalExecutions}</div>
                        <p className="text-xs text-muted-foreground">
                            Queue: {engineStatus?.queue.queueLength || 0} pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assets Identified</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{engineStatus?.potentialAssets || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Proposed Acquisitions
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Labor Analytics (Phase 2.3) */}
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-headline uppercase tracking-widest flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Sovereign Labor Analytics
                    </CardTitle>
                    <CardDescription>Aggregated performance metrics by model DID</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {engineStatus && (() => {
                            const laborMap: Record<string, { executions: number; profit: number }> = {};
                            Object.values(engineStatus.methods).forEach(method => {
                                if (method.modelStats) {
                                    Object.entries(method.modelStats).forEach(([did, stats]) => {
                                        if (!laborMap[did]) laborMap[did] = { executions: 0, profit: 0 };
                                        laborMap[did].executions += stats.executions;
                                        laborMap[did].profit += stats.profit;
                                    });
                                }
                            });

                            return Object.entries(laborMap).map(([did, stats]) => (
                                <div key={did} className="bg-background border rounded-lg p-3 flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="font-mono text-[10px]">
                                            {did.replace('did:prmth:model:', '')}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{stats.executions} jobs</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-muted-foreground">Cumulative Profit</span>
                                        <span className={`text-lg font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${stats.profit.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </CardContent>
            </Card>

            {/* Sovereign Worldview (Phase 10) */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Sovereign Worldview
                            </CardTitle>
                            <CardDescription>Aggregated Intelligence Feed (Meta-Analysis)</CardDescription>
                        </div>
                        <Badge variant="outline">Thought Leadership Mode</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {insights.length > 0 ? insights.map((insight, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-primary/5 hover:border-primary/20 transition-all">
                                    <div className={`p-2 h-fit rounded bg-background flex items-center justify-center`}>
                                        {insight.category === 'Financial' && <DollarSign className="w-4 h-4 text-green-500" />}
                                        {insight.category === 'Environmental' && <Leaf className="w-4 h-4 text-emerald-500" />}
                                        {insight.category === 'Technical' && <Cpu className="w-4 h-4 text-blue-500" />}
                                        {(!['Financial', 'Environmental', 'Technical'].includes(insight.category)) && <Activity className="w-4 h-4 text-primary" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{insight.category}</span>
                                            <span className="text-[10px] font-mono text-muted-foreground">Confidence: {Math.round(insight.confidence * 100)}%</span>
                                        </div>
                                        <p className="text-sm font-medium leading-tight">{insight.summary}</p>
                                        <div className="mt-2 text-[10px] text-muted-foreground">
                                            {insight.timestamp?.seconds ? new Date(insight.timestamp.seconds * 1000).toLocaleString() : 'Just now'}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center opacity-50 font-mono text-xs">
                                    Awaiting Intelligent Feed Synchronization...
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-b from-background to-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-lg">State Anomaly Radar</CardTitle>
                        <CardDescription>AI-driven threat assessments</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground group">
                                <span>Celestial Risk</span>
                                <span className="text-green-500">LOW</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[15%]" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                <span>Financial Volatility</span>
                                <span className="text-yellow-500">MODERATE</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 w-[45%]" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                <span>Mesh Connectivity</span>
                                <span className="text-primary font-mono animate-pulse">100.00%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[100%]" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-primary/10">
                            <p className="text-[10px] text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                                "The engine detects no immediate existential threats to the substrate. Expansion protocols are clear. Proceed with autonomous mining and physical actualization."
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Sovereign Treasury (Phase 3.1 & 4.1) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-background to-primary/10 border-primary/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            Sovereign Reserve
                        </CardTitle>
                        <CardDescription>30% Plowback rule active</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-3xl font-bold text-primary">
                                    ${engineStatus?.reserve?.reserveBalance.toFixed(2) || '0.00'}
                                </span>
                                <div className="flex flex-col gap-1 mt-2">
                                    <p className="text-xs text-muted-foreground">
                                        Total Profit: ${engineStatus?.reserve?.totalProfitRealized.toFixed(2) || '0.00'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px]">Plowback: 30%</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-[spin_10s_linear_infinite]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-background to-green-500/10 border-green-500/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Community Pool
                        </CardTitle>
                        <CardDescription>10% Citizen Tithe active</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-3xl font-bold text-green-500">
                                    ${engineStatus?.reserve?.communityPoolBalance.toFixed(2) || '0.00'}
                                </span>
                                <div className="flex flex-col gap-1 mt-2">
                                    <p className="text-xs text-muted-foreground">
                                        Available for Grants
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px]">Tithe: 10%</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <div className="h-10 w-10 rounded-full border-4 border-green-500/20 border-t-green-500 animate-[spin_15s_linear_infinite]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-background to-emerald-500/10 border-emerald-500/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-emerald-500" />
                            Planetary Restoration
                        </CardTitle>
                        <CardDescription>5% Healing Tithe active</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-3xl font-bold text-emerald-500">
                                    ${engineStatus?.reserve?.restorationBalance.toFixed(2) || '0.00'}
                                </span>
                                <div className="flex flex-col gap-1 mt-2">
                                    <p className="text-xs text-muted-foreground">
                                        Climate & Soil Recovery
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px]">Tithe: 5%</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <div className="h-10 w-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-[spin_20s_linear_infinite]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-background to-secondary/10 border-secondary/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-secondary" />
                            UVT Supply
                        </CardTitle>
                        <CardDescription>Verified On-Chain (Mainnet)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-3xl font-bold text-secondary">
                                    {(engineStatus?.reserve?.circulatingSupply || 0).toLocaleString()} UVT
                                </span>
                                <div className="flex flex-col gap-1 mt-2">
                                    <p className="text-xs text-muted-foreground">
                                        Primary Ledger: Solana
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">LIVE · SPL Standard</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <div className="h-10 w-10 rounded-full border-4 border-secondary/20 border-t-secondary animate-[spin_15s_linear_infinite_reverse]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {engineStatus && Object.entries(engineStatus.methods).map(([key, method]) => {
                    const Icon = getMethodIcon(method.methodId);
                    return (
                        <Card key={key} className="shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="font-headline">{method.methodName}</CardTitle>
                                            <CardDescription className="font-mono text-xs">{method.methodId}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant={method.config.enabled ? "default" : "secondary"}>
                                        {method.config.enabled ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Executions</p>
                                        <p className="text-lg font-bold">{method.executionCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Priority</p>
                                        <p className="text-lg font-bold">{method.config.priority}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Revenue</p>
                                        <p className="text-lg font-bold text-green-600">${method.totalRevenue.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Profit</p>
                                        <p className={`text-lg font-bold ${method.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${method.totalProfit.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Labor Records (Phase 2.3) */}
                                {method.modelStats && Object.keys(method.modelStats).length > 0 && (
                                    <div className="mb-4 pt-3 border-t border-dashed">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Sovereign Labor Records</p>
                                        <div className="space-y-2">
                                            {Object.entries(method.modelStats).map(([did, stats]) => (
                                                <div key={did} className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded">
                                                    <span className="font-mono truncate mr-2" title={did}>{did.replace('did:prmth:model:', '')}</span>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className="text-muted-foreground">{stats.executions} execs</span>
                                                        <span className={`font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            ${stats.profit.toFixed(3)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <p className="text-xs text-muted-foreground">
                                        Est. Revenue: ${method.config.estimatedRevenue.min}-${method.config.estimatedRevenue.max}
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => executeMethod(method.methodId)}
                                        disabled={!method.config.enabled}
                                    >
                                        <Play className="mr-2 h-3 w-3" />
                                        Execute Now
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Last Updated */}
            <div className="text-center text-xs text-muted-foreground">
                Last updated: {engineStatus ? new Date(engineStatus.timestamp).toLocaleString() : 'Never'}
            </div>
        </div>
    );
}
