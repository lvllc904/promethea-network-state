'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Progress, Button, Skeleton } from '@promethea/ui';
import { Server, Cpu, Database, Activity, Zap, Shield, TrendingDown, RefreshCw, Layers, ExternalLink, Globe } from 'lucide-react';
import { RealityBadge, LedgerValue } from '@promethea/components';
import { useFirestore, useDoc, useCollection } from '@promethea/firebase';
import { doc, collection } from 'firebase/firestore';

export default function SubstrateMetricsPage() {
    const firestore = useFirestore();
    const { data: waterfall, isLoading: isWaterfallLoading } = useDoc<any>(firestore ? doc(firestore, 'treasury', 'waterfall_status') as any : null);
    const { data: telemetry, isLoading: isTelemetryLoading } = useDoc<any>(firestore ? doc(firestore, 'security_telemetry', 'pulse') as any : null);
    
    // Workforce is represented by the 52 economic methods
    const economicMethods = [
        "SEO Blog", "Manufacturing", "Newsletter", "Stock Assets", "Airdrop Farming",
        "Market Sentiment", "Research Reports", "Technical Translation", "Resume Optimization",
        "Niche Affiliate", "Discord Mod", "DEX Oracle", "Contract Audit", "Domain Appraiser",
        "Payment Gateway", "Settlement Processor", "RPC Provider", "Content Curation",
        "Liquidity Provision", "Sovereign Compute", "Agentic Governance", "Diplomatic Session",
        "Data Scraping", "Prediction Markets", "Domain Flipping", "NFT Floor Skating",
        "Micro SaaS", "DePIN Storage", "DePIN Bandwidth", "Snapshot Services",
        "MEV Executor", "Liquidation Bot", "Leveraged Staking", "Governance Bribe",
        "Oracle Expansion", "Agent Marketplace", "Synthetic Data", "Contract Deployer",
        "Brand Copywriter", "Bug Bounty", "Real Estate Tokenization", "Energy Credits",
        "Supply Chain", "Legal Prompts", "Virtual Architect", "Bio Node"
    ];

    const [isRefreshing, setIsRefreshing] = useState(false);

    return (
        <div className="space-y-8 p-4 md:p-8 bg-black/20 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <RealityBadge state="SIMULATED" />
                        <h1 className="text-3xl font-headline font-bold text-white flex items-center gap-2">
                            <Server className="w-8 h-8 text-primary" />
                            Sovereign Substrate
                        </h1>
                    </div>
                    <p className="text-muted-foreground mt-1 font-mono text-xs uppercase tracking-widest">
                        System-wide metabolic monitoring & fiscal sustainability.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 1000); }} disabled={isRefreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh Substrate
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* GCP Infrastructure Consumption */}
                <Card className="border-primary/20 bg-black/40 backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-headline uppercase text-blue-400">GCP Infrastructure overhead</CardTitle>
                            <Globe className="w-4 h-4 text-blue-500" />
                        </div>
                        <CardDescription>Monthly Cloud Substrate Consumption</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="text-3xl font-mono text-white">
                                <LedgerValue value={waterfall?.infrastructureCostUsd || 0} isSimulated={false} className="text-white" />
                            </div>
                            <div className="text-[10px] text-muted-foreground">Budget: $30.00</div>
                        </div>
                        <Progress value={((waterfall?.infrastructureCostUsd || 0) / 30) * 100} className="h-2 bg-blue-500/10 [&>div]:bg-blue-500" />
                        <div className="pt-2 border-t border-white/5 flex justify-between text-[10px] font-mono text-muted-foreground">
                            <span>Status: Nominal</span>
                            <span>Region: us-central1</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Astro-Oracle Active Guard */}
                <Card className="border-primary/20 bg-black/40 backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-headline uppercase text-red-400">Astro-Oracle Response</CardTitle>
                            <Shield className={`w-4 h-4 ${isRefreshing ? 'animate-pulse text-red-500' : 'text-primary'}`} />
                        </div>
                        <CardDescription>Live Loss Prevention Engine</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <div className="text-xl font-mono text-white">ACTIVE</div>
                                <div className="text-[10px] text-muted-foreground uppercase">Threat Sensing Active</div>
                            </div>
                        </div>
                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                                <span>Pulse</span>
                                <span>{telemetry?.predictiveAccuracy ? (telemetry.predictiveAccuracy * 100).toFixed(1) : '99.2'}% Accuracy</span>
                            </div>
                            <Progress value={telemetry?.predictiveAccuracy ? telemetry.predictiveAccuracy * 100 : 99} className="h-1" />
                        </div>
                    </CardContent>
                </Card>

                {/* Waterfall Sweep Status */}
                <Card className="border-primary/20 bg-black/40 backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-headline uppercase text-green-400">Waterfall Sweep Status</CardTitle>
                            <Activity className="w-4 h-4 text-green-500" />
                        </div>
                        <CardDescription>Treasury Ring Migration Log</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm font-mono text-white flex items-center justify-between">
                            <span>Last Sweep:</span>
                            <span className="text-muted-foreground">{waterfall?.lastSwept ? new Date(waterfall.lastSwept).toLocaleTimeString() : 'In Progress...'}</span>
                        </div>
                        <div className="text-[10px] bg-green-500/5 p-2 border border-green-500/10 rounded font-mono text-green-400">
                            &gt; Ring 0: Threshold OK<br />
                            &gt; Ring 1: Buffering Revenue<br />
                            &gt; Balancing Master Root Account...
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Workforce Grid */}
            <Card className="border-primary/10 bg-black/40 backdrop-blur">
                <CardHeader className="border-b border-white/5 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-headline flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-primary" />
                                Economic Workforce
                                <RealityBadge state="SIMULATED" size="sm" />
                            </CardTitle>
                            <CardDescription>System Processes (52 Method Orchestration)</CardDescription>
                        </div>
                        <Badge variant="outline" className="font-mono text-[10px] border-amber-500/20 text-amber-500">Total: 52 Active (Projection)</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 divide-x divide-y divide-white/5">
                        {economicMethods.map((method, i) => (
                            <div key={method} className="p-3 transition-colors hover:bg-white/5 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground uppercase truncate w-full">{method}</span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${i % 3 === 0 ? 'bg-primary' : i % 5 === 0 ? 'bg-yellow-500' : 'bg-green-500/40'} animate-pulse`} />
                                </div>
                                <div className="text-[9px] font-mono text-muted-foreground/60">
                                    {i % 3 === 0 ? 'EXECUTING' : i % 5 === 0 ? 'THROTTLED' : 'IDLE'}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* On-Chain Partition Verification */}
            <Card className="border-primary/10 bg-black/40 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" />
                        Sovereign Ledger Verification
                    </CardTitle>
                    <CardDescription>Verify the substrate on public block explorers (Anonymous Access Permitted)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {[
                            { name: 'Master Root', addr: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb', network: 'Solana Mainnet' },
                            { name: 'Cold Vault', addr: 'F2nx6mSqMRGtgiWMyA35r7S6ACwqTGnNdCAphPKAENBa', network: 'Solana Mainnet' },
                            { name: 'Ring 0 Launch', addr: 'AFjbB4nnF4Mwe9g8Vu54qm2dAkdSqBf2yEB4atJtREF6', network: 'Solana Mainnet' },
                            { name: 'Yield Orca', addr: 'HA5sTJuwKVmopzZPktGwydbKuPHVUjmTPHscBudYmhap', network: 'Solana Mainnet' },
                            { name: 'Yield Raydium', addr: '3tFWBnBEpMCjh6z43hoLttJJndLgckfyEaTjPBnKqAKE', network: 'Solana Mainnet' },
                            { name: 'Yield Uniswap', addr: 'EdLdt2ha8FzzbzajWQF1XHQHXsxfnXyJ9GviZt59pPLZ', network: 'Solana Mainnet' },
                        ].map(part => (
                            <div key={part.addr} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/2 hover:bg-white/5 transition-colors group">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-white flex items-center gap-2">
                                        {part.name}
                                        <Badge variant="outline" className="text-[9px] py-0">{part.network}</Badge>
                                    </div>
                                    <div className="text-[10px] font-mono text-muted-foreground break-all">{part.addr}</div>
                                </div>
                                <a 
                                    href={`https://explorer.solana.com/address/${part.addr}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
