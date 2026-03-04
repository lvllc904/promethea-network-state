'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@promethea/ui';
import { Scale, Landmark, FileText, GitMerge, ArrowRight, Gavel } from 'lucide-react';
import Link from 'next/link';

export default function WillPillar() {
    const sections = [
        {
            title: "Governance",
            description: "Reputation-weighted voting and active proposals.",
            icon: Landmark,
            href: "/dashboard/governance",
            color: "text-red-500"
        },
        {
            title: "Constitution",
            description: "The core legal substrate and binary social contract.",
            icon: Scale,
            href: "/dashboard/constitution",
            color: "text-blue-500"
        },
        {
            title: "Roadmap",
            description: "The Sovereign Manifest and future trajectory.",
            icon: GitMerge,
            href: "/roadmap",
            color: "text-purple-500"
        },
        {
            title: "Ethical Vetoes",
            description: "Public records of Promethea's constitutional intervention.",
            icon: FileText,
            href: "/dashboard/will/vetoes", // Sub-section
            color: "text-gray-500"
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="border-b border-primary/10 pb-6">
                <h1 className="text-3xl font-headline flex items-center gap-2">
                    <Gavel className="w-8 h-8 text-primary" />
                    Sovereign Will
                </h1>
                <p className="text-muted-foreground mt-1">
                    The legislative heart of the state. Where the Manifest is actualized through collective action.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => (section.href.startsWith('/') ? (
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
                ) : (
                    <Card key={section.title} className="opacity-50 border-primary/5">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-muted ${section.color}`}>
                                    <section.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-headline">{section.title}</CardTitle>
                                    <CardDescription>Section Offline</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                )))}
            </div>

            <Card className="border-red-500/20 bg-red-500/5">
                <CardHeader>
                    <CardTitle className="text-lg font-headline text-red-400">Governance Snapshot</CardTitle>
                    <CardDescription>Current state of the democratic substrate.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                        <div>
                            <p className="text-2xl font-mono font-bold text-red-500">12</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">Active Proposals</p>
                        </div>
                        <div>
                            <p className="text-2xl font-mono font-bold text-red-500">45,210</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">Total Votes Cast</p>
                        </div>
                        <div>
                            <p className="text-2xl font-mono font-bold text-green-500">85%</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">Quorum Status</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
