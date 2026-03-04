'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from '@promethea/ui';
import { Store, Newspaper, Globe, ArrowRight, TrendingUp, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function ExchangePillar() {
    const sections = [
        {
            title: "Marketplace",
            description: "Browse and license sovereign digital assets.",
            icon: Store,
            href: "/dashboard/exchange/market",
            color: "text-orange-500"
        },
        {
            title: "Sovereign Narratives",
            description: "Autonomous transmissions synthesized by Promethea.",
            icon: Newspaper,
            href: "/dashboard/narrative",
            color: "text-blue-400"
        },
        {
            title: "Physical Inventory",
            description: "Managed land parcels and manufacturing capacity.",
            icon: Globe,
            href: "/dashboard/exchange/assets",
            color: "text-green-500"
        }
    ];

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="border-b border-primary/10 pb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-headline flex items-center gap-2">
                        <TrendingUp className="w-8 h-8 text-primary" />
                        The Exchange
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        The engine's economic output. Where the Network State interfaces with the global market.
                    </p>
                </div>
                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                    <Cpu className="w-3 h-3 mr-1" />
                    25 Active Methods
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sections.map((section) => (
                    <Card key={section.title} className="hover:border-primary/40 transition-colors border-primary/10 bg-gradient-to-br from-background to-muted/30 flex flex-col">
                        <CardHeader className="pb-2">
                            <div className="p-2 w-fit rounded-lg bg-muted mb-4">
                                <section.icon className={`w-6 h-6 ${section.color || 'text-muted-foreground'}`} />
                            </div>
                            <CardTitle className="text-xl font-headline">{section.title}</CardTitle>
                            <CardDescription>{section.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 mt-auto">
                            <Link href={section.href}>
                                <Button className="w-full justify-between" variant="secondary">
                                    Enter Hub
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-orange-500/20 bg-orange-500/5 mt-8">
                <CardHeader>
                    <CardTitle className="text-lg font-headline">Economic Performance</CardTitle>
                    <CardDescription>Real-time yield from autonomous agents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-40 flex items-end gap-2 px-4 pb-4">
                        {mounted && [40, 65, 45, 90, 80, 55, 70, 85, 95, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-primary/40 rounded-t sm:block hidden" style={{ height: `${h}%` }} />
                        ))}
                        <div className="flex-1 text-center w-full">
                            <p className="text-4xl font-mono font-bold text-primary">$420.69</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">Daily Revenue (Projected)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
