'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@promethea/ui';
import { Wallet, Users, BookOpen, LineChart, ArrowRight, Landmark } from 'lucide-react';
import Link from 'next/link';

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

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
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

            {mounted && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-headline">Sovereign Reserve Status</CardTitle>
                        <CardDescription>Consolidated view of the planetary buy-back fund.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                            <div>
                                <p className="text-2xl font-mono font-bold text-primary">$1,240.50</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">Reserve Balance</p>
                            </div>
                            <div>
                                <p className="text-2xl font-mono font-bold text-primary">124,050</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">UVT Supply</p>
                            </div>
                            <div>
                                <p className="text-2xl font-mono font-bold text-green-500">+12%</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">24h Growth</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
