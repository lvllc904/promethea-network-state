'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCollection, useFirestore, useSovereignMemo, collection, query, orderBy, type Query } from '@promethea/sovereign-store';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@promethea/ui';
import { LedgerValue, RealityBadge } from '@promethea/components';
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
    X,
    TrendingUp,
    Plus,
    Flame
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

    const marketQuery = useSovereignMemo(
        () => (firestore ? query(
            collection(firestore, 'marketplace'),
            orderBy('createdAt', 'desc')
        ) : null) as unknown as Query<MarketplaceItem> | null,
        [firestore]
    );

    const { data: rawItems, isLoading: isFirestoreLoading } = useCollection<MarketplaceItem>(marketQuery as any);

    const items = React.useMemo(() => {
        if (!rawItems) return [];
        return rawItems.filter(item => item.status === 'Available');
    }, [rawItems]);

    // REST API state for progressive real world assets & quests
    const [rwaAssets, setRwaAssets] = useState<any[]>([]);
    const [quests, setQuests] = useState<any[]>([]);
    const [isRestLoading, setIsRestLoading] = useState(true);

    const fetchAssetsAndQuests = useCallback(async () => {
        try {
            const resAssets = await fetch('/api/assets');
            if (resAssets.ok) {
                const data = await resAssets.json();
                setRwaAssets(data);
            }
            const resQuests = await fetch('/api/data/quests');
            if (resQuests.ok) {
                const data = await resQuests.json();
                setQuests(data);
            }
        } catch (e) {
            console.error('[Marketplace REST Fetch] error:', e);
        } finally {
            setIsRestLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssetsAndQuests();
        // Set up interval for active updates
        const interval = setInterval(fetchAssetsAndQuests, 10000);
        return () => clearInterval(interval);
    }, [fetchAssetsAndQuests]);

    // Blend standard items and progressive RWA assets together
    const combinedMarketItems = useMemo(() => {
        const standard = items.map(item => ({
            ...item,
            progressionState: 'ACTUALIZED', // Legacy marketplace items are immediately actualized
            isRwa: false
        }));

        const rwas = rwaAssets.map(a => ({
            id: a.id,
            title: a.title || a.name || 'Sovereign Asset',
            description: a.description || 'Sovereign progressive real-world asset underwriting proposal.',
            type: 'Physical' as const,
            price: parseFloat(a.price || a.value || '0'),
            currency: a.currency || 'USD',
            methodId: a.methodId || 'direct',
            status: a.status || 'Idea',
            barterAllowed: true,
            progressionState: a.progressionState || 'IDEA',
            assetType: a.assetType || 'RESTORATION_LAND',
            isRwa: true,
            yesVotes: a.yesVotes || 0,
            noVotes: a.noVotes || 0,
            prerequisiteTasks: a.prerequisiteTasks || []
        }));

        return [...rwas, ...standard] as any[];
    }, [items, rwaAssets]);

    const [searchQuery, setSearchQuery] = React.useState('');
    const [isInvestorMode, setIsInvestorMode] = React.useState(false);
    const [proposalText, setProposalText] = React.useState('');
    const [isIngesting, setIsIngesting] = React.useState(false);
    const [droppedFiles, setDroppedFiles] = useState<File[]>([]);

    // Selected asset for the side drawer details overlay
    const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

    // Form inputs for underwriting actions
    const [swapPayAmount, setSwapPayAmount] = useState('100');
    const [swapReceiveAmount, setSwapReceiveAmount] = useState('10000');
    const [commitCapitalAmount, setCommitCapitalAmount] = useState('25');
    const [commitLaborHours, setCommitLaborHours] = useState('5');
    const [lockOptionsAmount, setLockOptionsAmount] = useState('500');
    const [isActionSubmitting, setIsActionSubmitting] = useState(false);

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
                alert('Sovereign Ingestion Success! Promethea has listed your asset in the IDEA state.');
                fetchAssetsAndQuests();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsIngesting(false);
        }
    };

    const handleCompleteQuestDirect = async (questId: string) => {
        setIsActionSubmitting(true);
        try {
            const res = await fetch(`/api/quests/${questId}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completedBy: 'SOVEREIGN_USER' })
            });
            if (res.ok) {
                alert('Labor logged! Progressive actualization sequence checked.');
                await fetchAssetsAndQuests();
                // Update selected asset in-place to reflect updated quest checklist
                const updatedRes = await fetch('/api/assets');
                if (updatedRes.ok) {
                    const updatedAssets = await updatedRes.json();
                    const fresh = updatedAssets.find((x: any) => x.id === selectedAsset.id);
                    if (fresh) {
                        setSelectedAsset({
                            ...selectedAsset,
                            progressionState: fresh.progressionState,
                            prerequisiteTasks: fresh.prerequisiteTasks
                        });
                    }
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsActionSubmitting(false);
        }
    };

    const filteredItems = React.useMemo(() => {
        if (!combinedMarketItems) return [];
        return combinedMarketItems.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [combinedMarketItems, searchQuery]);

    const STATES_ORDER = ['IDEA', 'VETTED', 'LEGALIZED', 'SECURED', 'ACTUALIZED'];
    const STATE_LABELS: Record<string, string> = {
        IDEA: 'Idea',
        VETTED: 'Vetted',
        LEGALIZED: 'Entity',
        SECURED: 'Secured',
        ACTUALIZED: 'Active'
    };

    return (
        <div className="space-y-8 p-4 md:p-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
                        <ShoppingCart className="w-8 h-8 text-primary" />
                        Sovereign Marketplace
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Exchange value, pool underwrite capital, or commit labor to progressive RWA actualization.
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
                    {isInvestorMode ? "Standard View" : "Bloomberg Terminal"}
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
                        One-Click progressive RWA Ingestion
                    </CardTitle>
                    <CardDescription>Paste a proposal, drag & drop files (PDF, images, docs), or describe your offering. Promethea will autonomously list your asset in the early IDEA state.</CardDescription>
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
                                {isIngesting ? <RefreshCw className="animate-spin text-primary" /> : <PlusCircle className="w-6 h-6 text-primary" />}
                                {isIngesting ? 'Ingesting...' : 'Autonomous List'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2 pb-2">
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20 transition-colors">All Categories</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">Digital Media</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors font-mono">Real-World Assets (RWA)</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">Physical Substrate</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors border-dashed"><Filter className="w-3 h-3 mr-1" /> Advanced Filters</Badge>
            </div>

            {
                (isFirestoreLoading && isRestLoading) ? (
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
                                {filteredItems.map((item) => {
                                    const currentIdx = STATES_ORDER.indexOf(item.progressionState);
                                    
                                    return (
                                        <Card 
                                            key={item.id} 
                                            onClick={() => setSelectedAsset(item)}
                                            className={`group hover:border-primary/40 transition-all duration-300 border-primary/10 flex flex-col h-full cursor-pointer overflow-hidden ${
                                                isInvestorMode 
                                                    ? 'bg-black text-green-400 font-mono text-xs' 
                                                    : 'bg-gradient-to-br from-background to-muted/20'
                                            }`}
                                        >
                                            {isInvestorMode ? (
                                                <div className="p-4 space-y-2 relative">
                                                    {item.isRwa && (
                                                        <div className="absolute top-2 right-2 flex items-center gap-1 text-[7px] font-mono border border-amber-500/30 bg-amber-500/10 px-1 py-0.5 rounded text-amber-400">
                                                            RWA: {item.progressionState}
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between border-b border-green-900 pb-1">
                                                        <span className="opacity-60">ASSET_ID:</span>
                                                        <span className="text-white">{item.id?.substring(0, 8)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="opacity-60">TYPE:</span>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[10px] border-green-900 text-green-400">{item.uvxType || 'STANDARD'}</Badge>
                                                            <RealityBadge state="SIMULATED" size="sm" showLabel={false} />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="opacity-60">TIER:</span>
                                                        <span className="text-green-300 font-bold">{item.tier || 'D'}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 bg-green-900/10 px-1">
                                                        <span className="text-white font-bold">VALUATION:</span>
                                                        <LedgerValue value={item.price} isSimulated={true} className="text-green-400" />
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
                                                        <div className="aspect-video bg-muted/30 flex flex-col items-center justify-center rounded-t-lg border-b border-primary/5 p-4 relative text-center">
                                                            {item.isRwa ? (
                                                                <div className="absolute top-2 right-2 flex items-center gap-1 text-[7px] font-black border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-400">
                                                                    RWA: {item.progressionState}
                                                                </div>
                                                            ) : (
                                                                <Badge className="absolute top-2 right-2" variant="secondary">
                                                                    {item.type}
                                                                </Badge>
                                                            )}
                                                            <Zap className="w-10 h-10 text-primary/20 mb-2" />
                                                            <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest">{item.assetType || 'ASSET_PROPOSAL'}</span>
                                                        </div>
                                                    )}
                                                    <CardHeader className="pb-2">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-2">
                                                                <CardTitle className="text-lg font-headline group-hover:text-primary transition-colors truncate max-w-[200px]">{item.title}</CardTitle>
                                                                <RealityBadge state="SIMULATED" size="sm" showLabel={false} />
                                                            </div>
                                                        </div>
                                                        <CardDescription className="line-clamp-2 mt-1 min-h-[32px]">{item.description}</CardDescription>
                                                    </CardHeader>

                                                    {/* Horizontal Stepper inside the card for visual progression tracking */}
                                                    {item.isRwa && (
                                                        <div className="mt-1 px-6 pb-2" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex justify-between items-center relative py-1">
                                                                <div className="absolute left-0 right-0 top-1.5 h-[1.5px] bg-zinc-800 -z-0" />
                                                                <div 
                                                                    className="absolute left-0 top-1.5 h-[1.5px] bg-emerald-500 transition-all duration-500" 
                                                                    style={{ width: `${(Math.max(0, currentIdx) / (STATES_ORDER.length - 1)) * 100}%` }}
                                                                />
                                                                {STATES_ORDER.map((st, idx) => {
                                                                    const isDone = idx < currentIdx;
                                                                    const isActive = idx === currentIdx;
                                                                    return (
                                                                        <div key={st} className="flex flex-col items-center relative z-10">
                                                                            <div className={`w-3 h-3 rounded-full flex items-center justify-center border font-mono text-[5.5px] font-black transition-all ${
                                                                                isDone 
                                                                                    ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_6px_rgba(16,185,129,0.5)]' 
                                                                                    : isActive 
                                                                                        ? 'bg-amber-500 border-amber-400 text-black animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]' 
                                                                                        : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                                                                            }`}>
                                                                                {isDone ? '✓' : idx + 1}
                                                                            </div>
                                                                            <span className={`text-[6px] font-bold font-mono mt-0.5 tracking-tighter uppercase ${
                                                                                isActive ? 'text-amber-400 font-extrabold' : isDone ? 'text-emerald-400' : 'text-zinc-600'
                                                                            }`}>
                                                                                {STATE_LABELS[st]}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <CardContent className="mt-auto pt-4">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Sovereign Price</span>
                                                                <LedgerValue value={item.price} isSimulated={true} className="text-xl font-mono font-bold text-primary" />
                                                            </div>
                                                            <div className="text-right flex flex-col items-end gap-1 font-mono">
                                                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Settlement</span>
                                                                <RealityBadge state="SIMULATED" showLabel={true} />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="pt-0 border-t border-primary/5 p-4 flex gap-2 child:flex-1">
                                                        <Button variant="secondary" className="justify-between" size="sm">
                                                            Details
                                                            <ExternalLink className="w-3 h-3 ml-1" />
                                                        </Button>
                                                        {item.isRwa && item.progressionState !== 'ACTUALIZED' ? (
                                                            <Button className="font-bold border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-black" variant="outline" size="sm">
                                                                Underwrite
                                                                <Flame className="w-3 h-3 ml-2" />
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
                                    );
                                })}
                            </div>
                        )}
                    </>
                )
            }

            {/* Custom Side-Drawer Dialog Details Overlay */}
            {selectedAsset && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end transition-all" onClick={() => setSelectedAsset(null)}>
                    <div 
                        className="w-full max-w-md bg-zinc-950 border-l border-primary/20 p-6 flex flex-col h-full overflow-y-auto space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.08)] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedAsset(null)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 hover:bg-zinc-900 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div>
                            <span className="text-[9px] font-black font-mono text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded">
                                {selectedAsset.assetType || selectedAsset.uvxType || 'SOVEREIGN_ASSET'}
                            </span>
                            <h2 className="text-2xl font-headline font-bold text-white uppercase mt-3">{selectedAsset.title}</h2>
                            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{selectedAsset.description}</p>
                        </div>

                        {/* Stepper progress bar inside Overlay */}
                        {selectedAsset.isRwa && (
                            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 shadow-[0_0_15px_rgba(245,158,11,0.01)] space-y-3">
                                <p className="text-[10px] font-black font-mono uppercase tracking-widest text-amber-500">Sovereign Lifecycle Stepper</p>
                                <div className="flex justify-between items-center relative py-1.5">
                                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-zinc-850 -z-0" />
                                    <div 
                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-emerald-500 transition-all duration-500" 
                                        style={{ 
                                            width: `${(Math.max(0, STATES_ORDER.indexOf(selectedAsset.progressionState || 'IDEA')) / (STATES_ORDER.length - 1)) * 100}%` 
                                        }}
                                    />
                                    {STATES_ORDER.map((st, idx) => {
                                        const currentIdx = STATES_ORDER.indexOf(selectedAsset.progressionState || 'IDEA');
                                        const isDone = idx < currentIdx;
                                        const isActive = idx === currentIdx;
                                        return (
                                            <div key={st} className="flex flex-col items-center relative z-10">
                                                <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center border font-mono text-[8px] font-black transition-all ${
                                                    isDone 
                                                        ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                                                        : isActive 
                                                            ? 'bg-amber-500 border-amber-400 text-black animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]' 
                                                            : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                                                }`}>
                                                    {isDone ? '✓' : idx + 1}
                                                </div>
                                                <span className={`text-[7.5px] font-black font-mono mt-1 tracking-tighter uppercase ${
                                                    isActive ? 'text-amber-400 font-extrabold' : isDone ? 'text-emerald-400' : 'text-zinc-600'
                                                }`}>
                                                    {STATE_LABELS[st]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center p-3 bg-zinc-900/30 border border-white/5 rounded-lg font-mono">
                            <span className="text-[10px] uppercase text-zinc-500">Asset Valuation</span>
                            <span className="text-xl font-bold text-amber-400">${selectedAsset.price?.toLocaleString()} UVT</span>
                        </div>

                        {/* Dual-Mode Swap / Underwrite Widget */}
                        {selectedAsset.isRwa && selectedAsset.progressionState !== 'ACTUALIZED' ? (
                            /* Mode B: Underwriting & Crowdfunding Dashboard */
                            <div className="space-y-4">
                                <div className="p-4 bg-zinc-900/30 border border-amber-500/20 rounded-xl space-y-4">
                                    <p className="text-[10px] font-black font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Mode B: Underwriting Dashboard
                                    </p>
                                    <p className="text-[10.5px] text-zinc-400 leading-relaxed">Collaboratively actualize this asset. fund state operating fees, claim tasks, or lock options.</p>

                                    {/* Commit Capital */}
                                    <div className="p-3 bg-black/60 border border-white/5 rounded-lg space-y-2 font-mono text-[10px]">
                                        <p className="text-[9px] font-black uppercase text-amber-400">1. Commit Capital</p>
                                        <p className="text-zinc-500 leading-tight">Fund state operating files, legal drafting, or land boundary registry budgets.</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={commitCapitalAmount}
                                                onChange={(e) => setCommitCapitalAmount(e.target.value)}
                                                className="w-20 px-2 py-1 bg-zinc-950 border border-white/10 text-[10px] rounded text-white focus:outline-none focus:border-amber-500/50"
                                            />
                                            <Button
                                                disabled={isActionSubmitting}
                                                onClick={async () => {
                                                    setIsActionSubmitting(true);
                                                    try {
                                                        await new Promise(r => setTimeout(r, 1000));
                                                        alert(`Pooled ${commitCapitalAmount} UVT into underwriting escrow for ${selectedAsset.title}.`);
                                                    } finally {
                                                        setIsActionSubmitting(false);
                                                    }
                                                }}
                                                size="sm"
                                                className="flex-1 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black font-bold uppercase text-[8px] border border-amber-500/20"
                                            >
                                                Pool Capital
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Commit Labor (Sweat Equity) */}
                                    <div className="p-3 bg-black/60 border border-white/5 rounded-lg space-y-2 font-mono text-[10px]">
                                        <p className="text-[9px] font-black uppercase text-amber-400">2. Commit Labor (Sweat Equity)</p>
                                        <p className="text-zinc-500 leading-tight">Claim active quests and log hours into the sovereign labor ledger to earn fractional RWA equity.</p>
                                        
                                        {/* Fetch current quests for this asset */}
                                        {quests.filter((q: any) => q.associatedAssetId === selectedAsset.id).length === 0 ? (
                                            <p className="text-[8.5px] text-zinc-600 uppercase italic">No active quests found.</p>
                                        ) : (
                                            <div className="space-y-1.5 mt-1">
                                                {quests.filter((q: any) => q.associatedAssetId === selectedAsset.id).map((q: any) => {
                                                    const isCompleted = q.status === 'COMPLETED';
                                                    return (
                                                        <div key={q.id || q.questId} className="flex justify-between items-center p-2 bg-zinc-950 border border-white/5 rounded">
                                                            <div className="max-w-[70%]">
                                                                <p className="text-[9.5px] font-bold text-white truncate">{q.title}</p>
                                                                <p className="text-[7.5px] text-zinc-500 mt-0.5 leading-none line-clamp-1">{q.description}</p>
                                                            </div>
                                                            {isCompleted ? (
                                                                <span className="text-[7px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1 py-0.5 rounded">Complete</span>
                                                            ) : (
                                                                <Button
                                                                    disabled={isActionSubmitting}
                                                                    onClick={() => handleCompleteQuestDirect(q.id || q.questId)}
                                                                    size="sm"
                                                                    className="bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 text-amber-400 hover:text-black font-bold uppercase text-[7px]"
                                                                >
                                                                    Claim & Log
                                                                </Button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Lock Option Claims */}
                                    <div className="p-3 bg-black/60 border border-white/5 rounded-lg space-y-2 font-mono text-[10px]">
                                        <p className="text-[9px] font-black uppercase text-amber-400">3. Lock Option Claims</p>
                                        <p className="text-zinc-500 leading-tight">Secure future fractionalized RWA token allocations at a 25% floor discount.</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={lockOptionsAmount}
                                                onChange={(e) => setLockOptionsAmount(e.target.value)}
                                                className="w-20 px-2 py-1 bg-zinc-950 border border-white/10 text-[10px] rounded text-white focus:outline-none focus:border-amber-500/50"
                                            />
                                            <Button
                                                disabled={isActionSubmitting}
                                                onClick={async () => {
                                                    setIsActionSubmitting(true);
                                                    try {
                                                        await new Promise(r => setTimeout(r, 1000));
                                                        alert(`Floor option locked! Registered ${lockOptionsAmount} option claims for ${selectedAsset.title}.`);
                                                    } finally {
                                                        setIsActionSubmitting(false);
                                                    }
                                                }}
                                                size="sm"
                                                className="flex-1 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black font-bold uppercase text-[8px] border border-amber-500/20"
                                            >
                                                Lock Options
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Mode A: Standard DEX AMM Swapper (Liquid/Actualized Assets) */
                            <div className="space-y-4">
                                <div className="p-4 bg-zinc-900/30 border border-emerald-500/20 rounded-xl space-y-3">
                                    <p className="text-[10px] font-black font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Mode A: Liquid AMM Swap
                                    </p>
                                    <p className="text-[10.5px] text-zinc-400">Swap Universal Value Tokens (UVT) instantly for liquid fractional asset shares.</p>

                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-[8.5px] font-mono uppercase text-zinc-500">Pay Amount</label>
                                            <div className="flex gap-2 bg-black border border-white/10 rounded-lg p-2.5">
                                                <input
                                                    type="number"
                                                    value={swapPayAmount}
                                                    onChange={(e) => {
                                                        setSwapPayAmount(e.target.value);
                                                        setSwapReceiveAmount((parseFloat(e.target.value || '0') * 100).toString());
                                                    }}
                                                    className="w-full bg-transparent text-xs text-white font-mono focus:outline-none"
                                                />
                                                <span className="text-[10px] font-black font-mono text-zinc-400 self-center">UVT</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-center py-0.5">
                                            <div className="w-5 h-5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white cursor-pointer transition-colors text-xs font-bold">
                                                ↓
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[8.5px] font-mono uppercase text-zinc-500">Receive Shares (Est.)</label>
                                            <div className="flex gap-2 bg-black border border-white/10 rounded-lg p-2.5">
                                                <input
                                                    type="number"
                                                    value={swapReceiveAmount}
                                                    readOnly
                                                    className="w-full bg-transparent text-xs text-primary font-mono focus:outline-none"
                                                />
                                                <span className="text-[10px] font-black font-mono text-primary self-center">SHARES</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Route telemetry */}
                                    <div className="p-2 bg-black rounded border border-white/5 space-y-1 text-[8.5px] font-mono text-zinc-500">
                                        <div className="flex justify-between">
                                            <span>Exchange Rate:</span>
                                            <span>1 UVT = 100 RWA</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Price Impact / Slippage:</span>
                                            <span>&lt;0.05% (0.5% max)</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-400 font-bold">
                                            <span>Routing Mechanism:</span>
                                            <span>Raydium Substrate Route v4</span>
                                        </div>
                                    </div>

                                    <Button 
                                        disabled={isActionSubmitting}
                                        onClick={async () => {
                                            setIsActionSubmitting(true);
                                            try {
                                                await new Promise(r => setTimeout(r, 1200));
                                                alert(`DEX Atomic Swap Executed! Transferred ${swapPayAmount} UVT and received ${swapReceiveAmount} shares of ${selectedAsset.title}.`);
                                                setSelectedAsset(null);
                                            } finally {
                                                setIsActionSubmitting(false);
                                            }
                                        }}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[10px] py-2.5 rounded-lg transition-all"
                                    >
                                        {isActionSubmitting ? 'Simulating DEX Swap...' : 'Execute AMM Swap'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Metabolic Summary footer */}
            <Card className="border-primary/20 bg-primary/5 border-dashed">
                <CardContent className="py-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10 animate-pulse">
                            <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-headline font-bold">Dynamic Metabolic Cycle</h4>
                            <p className="text-xs text-muted-foreground">The autonomous engine regenerates marketplace inventory and actualization states every 240 minutes.</p>
                        </div>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-center">
                            <p className="text-lg font-mono font-bold">{filteredItems.length}</p>
                            <p className="text-[10px] text-muted-foreground uppercase opacity-70">Active Signals</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-mono font-bold text-green-500">100%</p>
                            <p className="text-[10px] text-muted-foreground uppercase opacity-70">Proven Rarity</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { fetchAssetsAndQuests(); alert('Metabolic states synchronized successfully!'); }}>
                        Force Metabolic Refresh
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
