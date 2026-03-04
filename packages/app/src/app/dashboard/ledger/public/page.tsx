'use client';
export const dynamic = 'force-dynamic';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@promethea/ui';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@promethea/ui';
import { Badge } from '@promethea/ui';
import { useCollection, useFirestore, useMemoFirebase } from '@promethea/firebase';
import { collection, query, orderBy, limit, type Query } from 'firebase/firestore';
import { UniversalValueToken } from '@promethea/lib';
import { Skeleton } from '@promethea/ui';
import { Globe, Shield, Zap, TrendingDown, AlignLeft, Users, Clock } from 'lucide-react';

export default function PublicLedgerPage() {
    const firestore = useFirestore();

    const tokensQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'universal_value_tokens'), orderBy('timestamp', 'desc'), limit(50)) : null) as Query<UniversalValueToken & { description?: string, timestamp: any }> | null,
        [firestore]
    );
    const { data: tokens, isLoading } =
        useCollection<UniversalValueToken & { description?: string, timestamp: any }>(tokensQuery as any);

    const getBadgeVariant = (type: string) => {
        switch (type) {
            case 'Labor':
                return 'default';
            case 'Capital':
                return 'secondary';
            case 'Reputation':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
                        <Globe className="w-8 h-8 text-primary" />
                        Public Sovereign Ledger
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Real-time feed of all metabolic events and UVT distribution within the Promethean Network State.
                    </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
                    <Shield className="w-3 h-3 text-green-500" />
                    <span className="text-xs">Immutable Record</span>
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total UVT Circulating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {tokens ? tokens.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString() : '...'} UVT
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-green-600">
                            Fully Collateralized
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Last Settlement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-mono text-sm">
                            {tokens?.[0]?.timestamp?.toDate()?.toLocaleTimeString() || 'Waiting...'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Network State Epoch: 0
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Validator Nodes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            12 <Zap className="w-4 h-4 text-yellow-500" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active Consensus
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-background to-orange-500/10 border-orange-500/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-orange-500 uppercase tracking-widest flex items-center gap-2">
                            <AlignLeft className="w-4 h-4" />
                            Gini Index (Equity)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tokens && tokens.length > 0 ? (() => {
                            const balances: Record<string, number> = {};
                            tokens.forEach(t => {
                                balances[t.ownerId] = (balances[t.ownerId] || 0) + (t.amount || 0);
                            });
                            const sortedBalances = Object.values(balances).sort((a, b) => a - b);
                            const n = sortedBalances.length;
                            const total = sortedBalances.reduce((s, b) => s + b, 0);

                            if (total === 0 || n === 0) return <div className="text-2xl font-bold text-orange-500">0.000</div>;

                            // Simple Gini calculation
                            let gini = 0;
                            for (let i = 0; i < n; i++) {
                                gini += (i + 1) * sortedBalances[i];
                            }
                            const giniCoeff = ((2 * gini) / (n * total) - (n + 1) / n).toFixed(3);

                            // Top 10% concentration
                            const topPercentileCount = Math.max(1, Math.ceil(n * 0.1));
                            const topWealth = sortedBalances.slice(-topPercentileCount).reduce((s, b) => s + b, 0);
                            const concentration = ((topWealth / total) * 100).toFixed(1);

                            return (
                                <>
                                    <div className="text-2xl font-bold text-orange-500">{giniCoeff}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Concentration: {concentration}% in Top 10%</p>
                                        <Badge variant="outline" className="text-[9px] border-orange-500/20 text-orange-500 h-4">Radical Sync</Badge>
                                    </div>
                                </>
                            );
                        })() : (
                            <Skeleton className="h-10 w-full" />
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-primary/20 bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>Global Transaction Stream</CardTitle>
                    <CardDescription>
                        The canonical record of labor and capital flow.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event</TableHead>
                                <TableHead>Entity (DID)</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Amount (UVT)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading &&
                                [...Array(10)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <Skeleton className="h-5 w-48" />
                                            <Skeleton className="h-3 w-64 mt-1" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-20" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-6 w-24" />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Skeleton className="h-5 w-12 ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {!isLoading && tokens?.map((token) => (
                                <TableRow key={token.id} className="hover:bg-primary/5 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="font-medium">
                                            {token.description || `UVT Mint: ${token.assetId}`}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                            {token.timestamp?.toDate()?.toLocaleString() || 'Pending Persistence...'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        <span title={token.ownerId} className="cursor-help">
                                            {token.ownerId?.startsWith('did:') ? (
                                                <Badge variant="outline" className="text-[10px] font-mono border-blue-500/30 text-blue-500">
                                                    {token.ownerId.split(':').slice(-1)[0]}
                                                </Badge>
                                            ) : (
                                                token.ownerId?.substring(0, 8) + '...'
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getBadgeVariant(token.tokenType) as any} className="text-[10px] uppercase tracking-wider">
                                            {token.tokenType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-primary">
                                        <div className="flex flex-col items-end">
                                            <span>+{token.amount.toFixed(2)}</span>
                                            {token.onChainStatus === 'Settled' ? (
                                                <a
                                                    href={`https://explorer.solana.com/tx/${token.onChainSignature}?cluster=devnet`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] text-green-500 hover:underline flex items-center gap-0.5"
                                                >
                                                    <Shield className="w-2.5 h-2.5" />
                                                    {token.onChainSignature?.substring(0, 8)}...
                                                </a>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground italic flex items-center gap-0.5">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && tokens?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                        No transactions found on the Sovereign Ledger.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
