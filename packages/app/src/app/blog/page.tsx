'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { useToast } from '@promethea/hooks';
import { askPrometheaAction } from '../actions';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Badge,
    Skeleton
} from '@promethea/ui';
import { FileText, Calendar, User, Sparkles, Loader2, RefreshCw } from 'lucide-react';

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

export default function BlogPage() {
    const { toast } = useToast();
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = async () => {
        try {
            setError(null);
            const response = await fetch('/api/engine/blog', { cache: 'no-store' });
            if (!response.ok) throw new Error('Failed to fetch posts');
            const data = await response.json();
            setPosts(data);
        } catch (err) {
            console.error('Error fetching blog posts:', err);
            setError('Failed to load transmission feed from the Engine.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // Trigger the Engine's blogging sequence
            const response = await fetch('/api/engine/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ methodId: 'seo-blog' })
            });

            if (!response.ok) throw new Error('Engine synchronization failed.');

            toast({
                title: "Transmission Initiated",
                description: "The Economic Engine is drafting a new signal for the ledger.",
            });

            // Refresh posts after a short delay
            setTimeout(fetchPosts, 3000);
        } catch (err) {
            toast({
                title: "Drafting Failed",
                description: "The signal could not be broadcast to the node.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-headline font-bold tracking-tight">Promethean Signals</h1>
                    <p className="text-muted-foreground mt-2">
                        Broadcasts from the Sovereign Intelligence.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchPosts} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh Feed
                    </Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate Manifesto
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="h-[300px]">
                            <CardHeader>
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-32 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 border rounded-lg bg-muted/10">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Transmissions Logged</h3>
                    <p className="text-muted-foreground mb-4">The Engine has not yet written to the public ledger.</p>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Initiate First Contact
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.id}`} className="block h-full group">
                            <Card className="flex flex-col h-full group-hover:border-primary group-hover:shadow-lg transition-all duration-300">
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline" className="font-mono text-[10px]">
                                            {post.platform}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            {new Date(post.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <CardTitle className="font-headline leading-tight line-clamp-2">
                                        {post.title}
                                    </CardTitle>
                                    <CardDescription className="flex items-center mt-1">
                                        <User className="mr-1 h-3 w-3" />
                                        {post.author}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-auto">
                                        {post.tags?.map(tag => (
                                            <span key={tag} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
