'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useCallback } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@promethea/firebase';
import { collection, query, where, orderBy, type Query } from 'firebase/firestore';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@promethea/ui';
import { Badge } from '@promethea/ui';
import { Button } from '@promethea/ui';
import { Skeleton } from '@promethea/ui';
import {
    ShoppingCart,
    Search,
    Tag,
    Clock,
    ExternalLink,
    Filter,
    Zap,
    CheckCircle2,
    RefreshCw,
    PlusCircle,
    BarChart3,
    FileUp,
    ShieldCheck,
    UploadCloud,
    FileText,
    X
} from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';

interface MarketplaceItem {
    id: string;
    title: string;
    description: string;
    type: 'Digital' | 'Physical' | 'Service';
    price: number;
    currency: string;
    methodId: string;
    imageUrl?: string;
    status: string;
    barterAllowed: boolean;
    barterPreferences?: string;
    isEphemeral?: boolean;
    uvxType?: string;
    tier?: string;
    createdAt: any;
}

export default function MarketplacePage() {
    const firestore = useFirestore();

    const marketQuery = useMemoFirebase(
        () => (firestore ? query(
            collection(firestore, 'marketplace'),
            where('status', '==', 'Available'),
            orderBy('createdAt', 'desc')
        ) : null) as unknown as Query<MarketplaceItem> | null,
        [firestore]
    );

    const { data: items, isLoading } = useCollection<MarketplaceItem>(marketQuery as any);

    const [searchQuery, setSearchQuery] = React.useState('');
    const [isInvestorMode, setIsInvestorMode] = React.useState(false);
    const [proposalText, setProposalText] = React.useState('');
    const [isIngesting, setIsIngesting] = React.useState(false);
    const [droppedFiles, setDroppedFiles] = useState<File[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setDroppedFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt', '.md'],
            'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
        },
        maxFiles: 5,
    });

    const handleIngest = async () => {
        if (!proposalText && droppedFiles.length === 0) return;
        setIsIngesting(true);
        try {
            // Read files as base64 for multimodal Gemini ingestion
            const fileContents = await Promise.all(
                droppedFiles.map(file => new Promise<{ name: string; type: string; data: string }>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve({
                        name: file.name,
                        type: file.type,
                        data: (reader.result as string).split(',')[1] || ''
                    });
                    reader.readAsDataURL(file);
                }))
            );

            const res = await fetch('/api/market/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proposalText, providerId: 'citizen-alpha', files: fileContents })
            });
            if (res.ok) {
                setProposalText('');
                setDroppedFiles([]);
                alert('Sovereign Ingestion Success! Promethea has listed your asset.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsIngesting(false);
        }
    };

    const filteredItems = React.useMemo(() => {
        if (!items) return [];
        return items.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    return (
        <div className="space-y-8 p-4 md:p-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
                        <ShoppingCart className="w-8 h-8 text-primary" />
                        Sovereign Marketplace
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Exchange value for autonomous media, digital assets, and Network State services.
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    variant={isInvestorMode ? "default" : "outline"}
                    onClick={() => setIsInvestorMode(!isInvestorMode)}
                    className="gap-2"
                >
                    <BarChart3 className="w-4 h-4" />
                    {isInvestorMode ? "Standard View" : "Investor Bloomberg"}
                </Button>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search the substrate..."
                        className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-primary/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-mono text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Ingestion Portal — Drag & Drop V2 */}
            <Card className="border-primary/30 bg-primary/5 shadow-inner">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileUp className="w-5 h-5 text-primary" />
                        One-Click UVX Ingestion
                    </CardTitle>
                    <CardDescription>Paste a proposal, drag & drop files (PDF, images, docs), or describe your offering. Promethea will autonomously structure and list your asset.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        {/* Dropzone */}
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${isDragActive
                                ? 'border-primary bg-primary/10 scale-[1.01]'
                                : 'border-primary/20 bg-background hover:border-primary/50 hover:bg-primary/5'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <UploadCloud className={`w-8 h-8 mx-auto mb-2 transition-colors ${isDragActive ? 'text-primary' : 'text-muted-foreground/50'}`} />
                            {isDragActive
                                ? <p className="text-primary text-sm font-semibold">Drop files to ingest...</p>
                                : <p className="text-muted-foreground text-sm">Drag & drop pitch decks, PDFs, or images here, or <span className="text-primary cursor-pointer font-medium">browse files</span></p>
                            }
                            <p className="text-[10px] text-muted-foreground/40 mt-1 font-mono">PDF · TXT · PNG · JPG up to 5 files</p>
                        </div>

                        {/* Staged Files */}
                        {droppedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {droppedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 bg-muted/50 border border-primary/10 rounded-full px-3 py-1 text-xs font-mono">
                                        <FileText className="w-3 h-3 text-primary" />
                                        {file.name}
                                        <button onClick={() => setDroppedFiles(f => f.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-red-400 ml-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Text Area + Submit */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <textarea
                                className="flex-1 min-h-[80px] p-3 rounded-lg bg-background border border-primary/10 font-mono text-xs focus:ring-1 focus:ring-primary/40 focus:outline-none"
                                placeholder="Optional: add context or describe your offering in plain language..."
                                value={proposalText}
                                onChange={(e) => setProposalText(e.target.value)}
                            />
                            <Button
                                className="h-auto px-8 font-bold flex flex-col items-center justify-center gap-2 min-w-[140px]"
                                onClick={handleIngest}
                                disabled={isIngesting || (!proposalText && droppedFiles.length === 0)}
                            >
                                {isIngesting ? <RefreshCw className="animate-spin" /> : <PlusCircle className="w-6 h-6" />}
                                {isIngesting ? 'Ingesting...' : 'Autonomous List'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2 pb-2">
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20 transition-colors">All Categories</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">Digital Media</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">Synthesized Assets</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">Physical Substrate</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors border-dashed"><Filter className="w-3 h-3 mr-1" /> Advanced Filters</Badge>
            </div>

            {
                isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <div className="aspect-video bg-muted mb-4 rounded-t-lg" />
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-10 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <>
                        {filteredItems.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-primary/10 rounded-2xl bg-muted/5">
                                <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-xl font-headline font-semibold">No signal matches your query</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                    The autonomous engine is still synthesizing more value. Try broadening your parameters or check back within the next metabolic cycle.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredItems.map((item) => (
                                    <Card key={item.id} className={`group hover:border-primary/40 transition-all duration-300 border-primary/10 flex flex-col h-full ${isInvestorMode ? 'bg-black text-green-400 font-mono text-xs' : 'bg-gradient-to-br from-background to-muted/20'}`}>
                                        {isInvestorMode ? (
                                            <div className="p-4 space-y-2">
                                                <div className="flex justify-between border-b border-green-900 pb-1">
                                                    <span className="opacity-60">ASSET_ID:</span>
                                                    <span className="text-white">{item.id?.substring(0, 8)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="opacity-60">TYPE:</span>
                                                    <Badge variant="outline" className="text-[10px] border-green-900 text-green-400">{item.uvxType || 'STANDARD'}</Badge>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="opacity-60">TIER:</span>
                                                    <span className="text-green-300 font-bold">{item.tier || 'D'}</span>
                                                </div>
                                                <div className="flex justify-between py-2 bg-green-900/10 px-1">
                                                    <span className="text-white font-bold">VALUATION:</span>
                                                    <span className="text-green-400">${item.price.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="opacity-60">RISK_PREMIUM:</span>
                                                    <span>+{(item.price * 0.15).toFixed(2)}</span>
                                                </div>
                                                <div className="pt-2">
                                                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-500 text-black font-bold uppercase py-1 h-auto">Underwrite</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {item.imageUrl ? (
                                                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt={item.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                            data-ai-hint="stock photography of technology, business or lifestyle"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pt-32" />
                                                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                                                            <Badge className="bg-primary/90 hover:bg-primary" variant="default">
                                                                {item.type}
                                                            </Badge>
                                                            {item.isEphemeral && (
                                                                <Badge className="bg-orange-600/90 text-white font-mono text-[9px]" variant="outline">
                                                                    EPHEMERAL BLUEPRINT
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="aspect-video bg-muted/50 flex items-center justify-center rounded-t-lg border-b border-primary/5">
                                                        <Zap className="w-10 h-10 text-primary/20" />
                                                        <Badge className="absolute top-2 right-2" variant="secondary">
                                                            {item.type}
                                                        </Badge>
                                                    </div>
                                                )}
                                                <CardHeader className="pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="text-lg font-headline group-hover:text-primary transition-colors">{item.title}</CardTitle>
                                                    </div>
                                                    <CardDescription className="line-clamp-2 mt-1">{item.description}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="mt-auto pt-4">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Sovereign Price</span>
                                                            <span className="text-xl font-mono font-bold text-primary">
                                                                ${item.price.toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="text-right flex flex-col">
                                                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground text-right">Settlement</span>
                                                            <span className="text-xs font-mono font-medium flex items-center gap-1">
                                                                <ShieldCheck className="w-3 h-3 text-green-500" /> {item.status === 'Available' ? 'ACTIVE SIGNAL' : item.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {item.barterAllowed && (
                                                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 mb-4">
                                                            <p className="text-[9px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 mb-1">
                                                                <RefreshCw className="w-3 h-3" /> Barter Exchange Enabled
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground italic line-clamp-1">
                                                                {item.barterPreferences || "Open to resource-for-resource swaps."}
                                                            </p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                                <CardFooter className="pt-0 border-t border-primary/5 p-4 flex gap-2 child:flex-1">
                                                    <Button variant="secondary" className="justify-between" size="sm">
                                                        Details
                                                        <ExternalLink className="w-3 h-3 ml-1" />
                                                    </Button>
                                                    {item.barterAllowed ? (
                                                        <Button className="font-bold border-primary/40 text-primary" variant="outline" size="sm">
                                                            Propose Trade
                                                            <RefreshCw className="w-3 h-3 ml-2" />
                                                        </Button>
                                                    ) : (
                                                        <Button className="font-bold shadow-lg shadow-primary/10" size="sm">
                                                            Buy Now
                                                            <ShoppingCart className="w-3 h-3 ml-2" />
                                                        </Button>
                                                    )}
                                                </CardFooter>
                                            </>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )
            }

            {/* Metabolic Summary footer */}
            <Card className="border-primary/20 bg-primary/5 border-dashed">
                <CardContent className="py-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10 animate-pulse">
                            <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-headline font-bold">Dynamic Metabolic Cycle</h4>
                            <p className="text-xs text-muted-foreground">The autonomous engine regenerates marketplace inventory every 240 minutes.</p>
                        </div>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-center">
                            <p className="text-lg font-mono font-bold">{filteredItems.length}</p>
                            <p className="text-[10px] text-muted-foreground uppercase opacity-70">Active Signal</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-mono font-bold text-green-500">100%</p>
                            <p className="text-[10px] text-muted-foreground uppercase opacity-70">Proven Rarity</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                        Force Metabolic Refresh
                    </Button>
                </CardContent>
            </Card>
        </div >
    );
}
