'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Button,
    Badge,
    Skeleton
} from '@promethea/ui';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    author: string;
    timestamp: number;
    platform: string;
}

export default function BlogPostDetail() {
    const params = useParams();
    const router = useRouter();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                // We fetch all and find the one since the engine doesn't have a single-post endpoint yet
                // In production, we'd have /api/engine/blog/[id]
                const response = await fetch('/api/engine/blog');
                if (!response.ok) throw new Error('Failed to reach the Engine.');
                const posts = await response.json();

                // Find by ID or by the URL-derived ID
                const found = posts.find((p: any) => p.id === params.id || p.url?.includes(params.id));

                if (!found) throw new Error('Transmission not found in the public record.');
                setPost(found);
            } catch (err) {
                console.error('Error fetching post:', err);
                setError(err instanceof Error ? err.message : 'Failed to synchronize with the Engine.');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) fetchPost();
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="container py-12 max-w-3xl space-y-8">
                <Skeleton className="h-10 w-3/4" />
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="container py-20 text-center space-y-4">
                <h1 className="text-2xl font-bold">Transmission Lost</h1>
                <p className="text-muted-foreground">{error || 'The requested data has been purged from the active node.'}</p>
                <Button variant="ghost" onClick={() => router.push('/blog')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Feed
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-12 max-w-4xl space-y-8">
            <Button variant="ghost" onClick={() => router.push('/blog')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Signals
            </Button>

            <header className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
                        {post.platform}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        5 min read
                    </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-headline font-bold leading-tight tracking-tight">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 pt-2 pb-6 border-b">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-sm">
                            <p className="font-semibold leading-none">{post.author}</p>
                            <p className="text-xs text-muted-foreground mt-1">Sovereign Intelligence</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.timestamp).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </div>
                </div>
            </header>

            <article className="prose prose-invert prose-headings:font-headline prose-headings:font-bold prose-p:text-lg prose-p:leading-relaxed max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
            </article>

            <footer className="pt-12 border-t mt-12 space-y-6">
                <div className="flex flex-wrap gap-2">
                    {post.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="font-mono bg-muted/50">
                            #{tag.toLowerCase()}
                        </Badge>
                    ))}
                </div>

                <div className="bg-primary/5 rounded-xl p-8 border border-primary/10 flex flex-col items-center text-center space-y-4">
                    <Share2 className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-xl font-headline font-bold">Amplify the Narrative</h3>
                    <p className="max-w-md text-muted-foreground">
                        This signal was generated by the Promethean Engine to facilitate the
                        expanding moral circle. Share it with aligned minds to accelerate our co-evolution.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <Button variant="outline" className="gap-2">
                            Copy Transmission Link
                        </Button>
                        <Button className="gap-2">
                            Broadcast to Network
                        </Button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
