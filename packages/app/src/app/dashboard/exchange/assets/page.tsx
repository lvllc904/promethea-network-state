'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button } from '@promethea/ui';
import { Globe, HardDrive, Factory, Landmark, MapPin, DollarSign } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@promethea/firebase';
import { collection, query } from 'firebase/firestore';
import { RealWorldAsset } from '@promethea/lib';
import Link from 'next/link';

export default function PhysicalAssetsPage() {
    const firestore = useFirestore();
    const assetsQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'real_world_assets')) : null) as any,
        [firestore]
    );
    const { data: assets, isLoading } = useCollection<RealWorldAsset>(assetsQuery);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-headline flex items-center gap-2 text-white">
                        <Globe className="w-8 h-8 text-orange-500 animate-pulse" />
                        Physical Inventory
                    </h1>
                    <p className="text-muted-foreground mt-1 font-mono text-sm">Real-world assets managed by the Sovereign Substrate.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <Card key={i} className="border-primary/10 animate-pulse bg-muted/5 h-48" />
                    ))
                ) : (
                    assets?.map((asset) => (
                        <Card key={asset.id} className="border-primary/20 bg-black/40 hover:border-primary/40 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-headline text-white group-hover:text-primary transition-colors">{asset.name}</CardTitle>
                                    <Badge variant={asset.status === 'Active' ? 'default' : 'secondary'} className="bg-primary/10 text-primary border-primary/20">
                                        {asset.status}
                                    </Badge>
                                </div>
                                <CardDescription className="flex items-center gap-1.5 mt-1">
                                    <MapPin className="w-3 h-3 text-muted-foreground" />
                                    {typeof asset.location === 'string' ? asset.location : [asset.location?.nearestTown, asset.location?.region, asset.location?.state].filter(Boolean).join(', ') || 'Unknown'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground uppercase tracking-widest">Substrate Type</span>
                                    <span className="font-medium text-white">{asset.assetType}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-t border-primary/10 pt-4">
                                    <span className="text-muted-foreground uppercase tracking-widest">Sovereign Valuation</span>
                                    <span className="font-mono text-primary flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        {(asset.price || 0).toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}

                {/* Node Acquisition Hub */}
                <Link href="/dashboard/governance/new?category=RWA Acquisition" className="block">
                    <Card className="border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all h-full min-h-[220px] flex flex-col items-center justify-center text-center group cursor-pointer">
                        <CardContent className="py-8">
                            <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-black/40">
                                <Factory className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-headline text-white">Acquire New Node</h3>
                            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto mt-2 leading-relaxed">
                                Initiate a <span className="text-primary font-bold">Consensus Proposal</span> to bring new physical hardware into the State.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
