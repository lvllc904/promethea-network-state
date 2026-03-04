'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@promethea/firebase';
import { doc, type DocumentReference } from 'firebase/firestore';
import { Card, CardContent, Button, Badge, Separator } from '@promethea/ui';
import { Newspaper, ArrowLeft, Calendar, User, Share2, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogPost {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    author: string;
    createdAt: any;
    platform: string;
}

// Custom renderer components so we don't need @tailwindcss/typography
const MarkdownComponents = {
    h1: ({ children }: any) => <h1 className="text-3xl font-headline font-bold mt-8 mb-4 text-foreground tracking-tight">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-headline font-semibold mt-10 mb-4 text-foreground border-b border-primary/10 pb-2">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-headline font-semibold mt-8 mb-3 text-foreground">{children}</h3>,
    h4: ({ children }: any) => <h4 className="text-lg font-semibold mt-6 mb-2 text-foreground">{children}</h4>,
    p: ({ children }: any) => <p className="text-foreground/85 leading-8 my-5 text-base">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc list-outside pl-6 my-4 space-y-1.5 text-foreground/85">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-outside pl-6 my-4 space-y-1.5 text-foreground/85">{children}</ol>,
    li: ({ children }: any) => <li className="leading-7 text-foreground/85">{children}</li>,
    blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-primary/50 bg-primary/5 rounded-r-lg px-5 py-2 my-6 text-foreground/70 italic">
            {children}
        </blockquote>
    ),
    code: ({ inline, children }: any) => inline
        ? <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
        : <code className="block bg-muted border border-primary/10 rounded-lg p-4 text-sm font-mono text-foreground/80 overflow-x-auto my-4 whitespace-pre">{children}</code>,
    pre: ({ children }: any) => <pre className="bg-muted border border-primary/10 rounded-lg p-4 overflow-x-auto my-4">{children}</pre>,
    strong: ({ children }: any) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-foreground/70">{children}</em>,
    a: ({ href, children }: any) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
    hr: () => <hr className="border-primary/10 my-8" />,
};

export default function NarrativePostPage({ params }: { params: { id: string } }) {
    const firestore = useFirestore();

    const postRef = useMemoFirebase(
        () => (firestore ? doc(firestore, 'narrative', params.id) : null) as unknown as DocumentReference<BlogPost> | null,
        [firestore, params.id]
    );

    const { data: post, isLoading } = useDoc<BlogPost>(postRef as any);

    if (isLoading) {
        return (
            <div className="p-8 max-w-4xl mx-auto space-y-8 animate-pulse">
                <div className="h-10 w-24 bg-muted rounded" />
                <div className="h-12 w-full bg-muted rounded" />
                <div className="h-4 w-1/4 bg-muted rounded" />
                <div className="h-96 w-full bg-muted rounded" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="p-8 max-w-4xl mx-auto text-center py-20">
                <h1 className="text-2xl font-headline font-bold">Transmission Lost</h1>
                <p className="text-muted-foreground mt-2">This ID does not exist in the Sovereign Substrate.</p>
                <Button className="mt-6" asChild>
                    <Link href="/dashboard/narrative">Return to Feed</Link>
                </Button>
            </div>
        );
    }

    const wordCount = post.content?.split(' ').length || 0;
    const readTime = Math.max(1, Math.round(wordCount / 200));

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
            <Link href="/dashboard/narrative">
                <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Narrative Feed
                </Button>
            </Link>

            <article className="space-y-6">
                <header className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {post.tags?.map(tag => (
                            <Badge key={tag} className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-headline font-bold leading-tight tracking-tight">
                        {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Just now'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            {post.author}
                        </div>
                        <div className="flex items-center gap-1.5 text-green-500">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified Sovereign Signal
                        </div>
                        <div className="text-muted-foreground/50">
                            ~{readTime} min read
                        </div>
                    </div>
                </header>

                <Separator className="bg-primary/10" />

                {/* Excerpt / Pull Quote */}
                <div className="text-muted-foreground text-lg leading-relaxed italic border-l-4 border-primary/40 pl-6 py-2 bg-primary/5 rounded-r-lg">
                    {post.excerpt}
                </div>

                {/* Main Content — fully rendered Markdown */}
                <Card className="border-none shadow-none bg-transparent">
                    <CardContent className="p-0">
                        <div className="min-w-0">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={MarkdownComponents}
                            >
                                {post.content?.replace(/\\n/g, '\n') || ''}
                            </ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>

                {/* Subtle premium hint — not a CTA, just a naturally placed contextual note */}
                <div className="mt-12 py-6 px-6 bg-muted/20 rounded-xl border border-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground/50 uppercase tracking-widest mb-1 font-mono">Promethea Intelligence</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            A cross-market dossier correlating these signals against sovereign land indices and currency defensibility metrics exists in the archive.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground/30 text-xs font-mono whitespace-nowrap">
                        <Lock className="w-3.5 h-3.5" />
                        Clearance Required
                    </div>
                </div>

                <Separator className="bg-primary/10 mt-12" />

                <footer className="flex justify-between items-center py-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest">
                        Share Transmission
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <Share2 className="w-3 h-3" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">
                        <Newspaper className="w-3 h-3" />
                        Promethean Network State
                    </div>
                </footer>
            </article>
        </div>
    );
}
