'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@promethea/firebase';
import { collection, query, orderBy, type Query } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, Skeleton } from '@promethea/ui';
import { Newspaper, Send, ArrowRight, BrainCircuit, Globe, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    author: string;
    createdAt: any;
    platform: string;
    url: string;
}

export default function NarrativePage() {
    const firestore = useFirestore();

    const narrativeQuery = useMemoFirebase(
        () => (firestore ? query(
            collection(firestore, 'narrative'),
            orderBy('createdAt', 'desc')
        ) : null) as unknown as Query<BlogPost> | null,
        [firestore]
    );

    const { data: posts, isLoading } = useCollection<BlogPost>(narrativeQuery as any);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-primary/10 pb-6">
                <div>
                    <h1 className="text-3xl font-headline flex items-center gap-2">
                        <Newspaper className="w-8 h-8 text-primary" />
                        Sovereign Narrative Engine
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        High-fidelity transmissions synthesized by the Promethean Mind.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="px-3 py-1 bg-primary/5 text-primary border-primary/20">
                        <Globe className="w-3 h-3 mr-1" />
                        Live Syndication Active
                    </Badge>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse border-primary/5">
                            <CardHeader className="h-48 bg-muted rounded-t-lg" />
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : !posts || posts.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-primary/10">
                    <Send className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                    <h2 className="text-xl font-headline text-muted-foreground">Pulse Detected, No Content Syndicated</h2>
                    <p className="text-muted-foreground">Promethea is currently meditating on the Manifest. Ensure the Economic Engine is running.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <Card key={post.id} className="group hover:border-primary/40 transition-all duration-300 border-primary/10 flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest text-primary border-primary/20">
                                        {post.platform}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                        {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                    </span>
                                </div>
                                <CardTitle className="text-xl font-headline leading-tight group-hover:text-primary transition-colors">
                                    {post.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed italic border-l-2 border-primary/10 pl-4">
                                    "{post.excerpt}"
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {post.tags?.map(tag => (
                                        <Badge key={tag} className="text-[9px] bg-muted/50 text-muted-foreground border-none">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <div className="p-4 pt-0">
                                <Link href={`/dashboard/narrative/${post.id}`}>
                                    <Button className="w-full group/btn justify-between" variant="ghost">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" />
                                            Read Transmission
                                        </div>
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
