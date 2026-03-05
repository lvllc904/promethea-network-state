'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@promethea/ui';
import { Wallet, Users, BookOpen, LineChart, ArrowRight, Landmark, ExternalLink, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface UVTData {
    mintAddress: string;
    sovereignRoot: string;
    totalSupply: number;
    decimals: number;
    solBalance: number;
    solscanUrl: string;
    sovereignSolscanUrl: string;
    network: string;
    fetchedAt: string;
    fallback?: boolean;
    stale?: boolean;
}

export default function TreasuryPillar() {
    const sections = [
        {
            title: "Passport",
            description: "Sovereign Identity and personal balance.",
            icon: Wallet,
            href: "/dashboard/passport",
            color: "text-blue-500"
        },
        {
            title: "Founders",
            description: "Cap table and stakeholder distribution.",
            icon: Users,
            href: "/dashboard/founder",
            color: "text-purple-500"
        },
        {
            title: "UVT Ledger",
            description: "Public metabolic ledger and transaction history.",
            icon: BookOpen,
            href: "/dashboard/ledger",
            color: "text-green-500"
        },
        {
            title: "Financial Reports",
            description: "Real-time Pro Forma and fiscal performance.",
            icon: LineChart,
            href: "/dashboard/intel",
            color: "text-amber-500"
        }
    ];

    const [uvtData, setUvtData] = React.useState<UVTData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        fetch('/api/uvt')
            .then(r => r.json())
            .then(data => {
                setUvtData(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="border-b border-primary/10 pb-6">
                <h1 className="text-3xl font-headline flex items-center gap-2">
                    <Landmark className="w-8 h-8 text-primary" />
                    The Treasury
                </h1>
                <p className="text-muted-foreground mt-1">
                    The financial heart of the Network State. Real-time metabolics and resource allocation.
                </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-mono text-green-500 font-bold uppercase tracking-widest">Sovereign Network State: ON-CHAIN</span>
                </div>
                <div className="text-[10px] text-green-500/60 font-mono">
                    PROMETHEAN_GENESIS_ACTIVE // SOLANA_MAINNET_LOCKED
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <Card key={section.title} className="hover:border-primary/40 transition-colors border-primary/10 bg-gradient-to-br from-background to-muted/30">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-muted ${section.color}`}>
                                    <section.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-headline">{section.title}</CardTitle>
                                    <CardDescription>{section.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Link href={section.href}>
                                <Button className="w-full justify-between" variant="ghost">
                                    Access Module
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Live On-Chain UVT Data */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-headline flex items-center gap-2">
                                Sovereign Reserve Status
                                {!isLoading && uvtData && !uvtData.fallback && (
                                    <span className="flex items-center gap-1 text-xs text-green-400 font-normal">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Live · Mainnet
                                    </span>
                                )}
                            </CardTitle>
                            <CardDescription>
                                Consolidated view from the Solana blockchain — real supply, no simulation.
                            </CardDescription>
                        </div>
                        {uvtData && (
                            <a
                                href={uvtData.solscanUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                                View on Solscan <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Querying Solana Mainnet...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                            <div>
                                <p className="text-2xl font-mono font-bold text-primary">
                                    {uvtData?.totalSupply?.toLocaleString() ?? '—'}
                                </p>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">Total UVT Supply</p>
                                <p className="text-xs text-muted-foreground/50 mt-0.5">On-Chain · Genesis Mint</p>
                            </div>
                            <div>
                                <p className="text-2xl font-mono font-bold text-amber-400">
                                    {uvtData?.solBalance?.toFixed(4) ?? '—'} SOL
                                </p>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">Sovereign Root Balance</p>
                                <a
                                    href={uvtData?.sovereignSolscanUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary/60 hover:text-primary mt-0.5 flex items-center justify-center gap-1"
                                >
                                    {uvtData?.sovereignRoot?.slice(0, 8)}…{uvtData?.sovereignRoot?.slice(-4)}
                                    <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                            </div>
                            <div>
                                <p className="text-2xl font-mono font-bold text-green-400">
                                    {uvtData?.mintAddress?.slice(0, 6)}…{uvtData?.mintAddress?.slice(-4)}
                                </p>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">Mint Address</p>
                                <a
                                    href={uvtData?.solscanUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary/60 hover:text-primary mt-0.5 flex items-center justify-center gap-1"
                                >
                                    Verify on Solscan <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                            </div>
                        </div>
                    )}
                    {uvtData?.fallback && (
                        <p className="text-center text-xs text-amber-400/70 mt-4">
                            ⚠ Displaying genesis values — RPC temporarily unavailable
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
