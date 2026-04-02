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
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@promethea/firebase';
import { collection, query, where, type Query } from 'firebase/firestore';
import { UniversalValueToken } from '@promethea/lib';
import { Skeleton } from '@promethea/ui';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { RealityBadge } from '@promethea/components';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';
import { format } from 'date-fns';

export default function LedgerPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();

  const tokensQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'universal_value_tokens'), where('ownerId', '==', user.uid)) : null) as Query<UniversalValueToken> | null,
    [firestore, user]
  );
  const { data: tokens, isLoading: areTokensLoading } =
    useCollection<UniversalValueToken>(tokensQuery as any);

  const isLoading = areTokensLoading || isAuthLoading;

  // Process data for chart
  const chartData = useMemo(() => {
    if (!tokens || tokens.length === 0) return [];
    
    // Sort by date
    const sorted = [...tokens].sort((a, b) => {
      const dateA = a.timestamp?.seconds || new Date(a.createdAt).getTime() / 1000;
      const dateB = b.timestamp?.seconds || new Date(b.createdAt).getTime() / 1000;
      return dateA - dateB;
    });

    let runningTotal = 0;
    return sorted.map(t => {
      runningTotal += t.amount;
      const date = t.timestamp?.seconds ? new Date(t.timestamp.seconds * 1000) : new Date(t.createdAt);
      return {
        date: format(date, 'MMM dd'),
        amount: runningTotal,
        rawDate: date
      };
    });
  }, [tokens]);

  const stats = useMemo(() => {
    if (!tokens) return { labor: 0, capital: 0, reputation: 0, total: 0 };
    return tokens.reduce((acc, t) => {
      acc.total += t.amount;
      if (t.tokenType === 'Labor') acc.labor += t.amount;
      if (t.tokenType === 'Capital') acc.capital += t.amount;
      if (t.tokenType === 'Reputation') acc.reputation += t.amount;
      return acc;
    }, { labor: 0, capital: 0, reputation: 0, total: 0 });
  }, [tokens]);

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
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold uppercase tracking-tighter flex items-center gap-4">
            UVT Ledger <RealityBadge state="ACTUALIZED" />
          </h1>
          <p className="text-muted-foreground text-lg">
            A real-time record of your sovereign value creation on the Solana Mainnet.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-primary/10">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-[10px] font-bold tracking-widest">Total Balance</CardDescription>
            <CardTitle className="text-3xl font-headline">{stats.total.toLocaleString()} UVT</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-black/40 border-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-blue-400">Labor Equity</CardDescription>
            <CardTitle className="text-2xl font-headline">{stats.labor.toLocaleString()} UVT</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-black/40 border-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-amber-400">Capital Stake</CardDescription>
            <CardTitle className="text-2xl font-headline">{stats.capital.toLocaleString()} UVT</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-black/40 border-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-red-500">Reputation</CardDescription>
            <CardTitle className="text-2xl font-headline">{stats.reputation.toLocaleString()} UVT</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="bg-black/40 border-white/5 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-headline uppercase tracking-tight">Accumulation History</CardTitle>
          <CardDescription>Visualizing your growth as a Sovereign Citizen.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full pt-4">
          {isLoading ? (
            <Skeleton className="w-full h-full rounded-lg" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUvt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} 
                />
                <Tooltip 
                  contentStyle={{backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}}
                  itemStyle={{color: 'hsl(var(--primary))'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorUvt)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-white/5 rounded-xl">
              <p>No transaction history found on the UVT Ledger.</p>
              <p className="text-xs">Start contributing to see your growth curve.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-black/40 border-white/5">
        <CardHeader>
          <CardTitle className="text-xl font-headline uppercase tracking-tight">On-Chain Activity Logs</CardTitle>
          <CardDescription>
            Transparent record of all past actions actualized on Solana.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/5">
                <TableHead className="uppercase text-[10px] font-bold tracking-widest">Event Source</TableHead>
                <TableHead className="uppercase text-[10px] font-bold tracking-widest hidden md:table-cell">Identity (Owner)</TableHead>
                <TableHead className="uppercase text-[10px] font-bold tracking-widest">Type</TableHead>
                <TableHead className="text-right uppercase text-[10px] font-bold tracking-widest">Amount (UVT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : tokens && tokens.length > 0 ? (
                tokens.map((token) => (
                  <TableRow key={token.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium">
                      <div className="font-medium">
                        {token.tokenType === 'Labor' ? 'Sweat Equity Mint' : token.tokenType === 'Capital' ? 'Capital Pledge' : 'Reputation Accrual'}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono flex items-center gap-2 mt-1">
                        {token.id.slice(0, 8)}...
                        {token.onChainSignature && (
                          <a
                            href={`https://solscan.io/tx/${token.onChainSignature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-white transition-colors flex items-center gap-0.5"
                          >
                            Verify Tx <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground hidden md:table-cell">
                      {token.ownerId}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={getBadgeVariant(token.tokenType) as any} className="w-fit">
                          {token.tokenType}
                        </Badge>
                        {token.onChainStatus === 'Settled' ? (
                          <RealityBadge state="ACTUALIZED" />
                        ) : (
                          <span className="text-[9px] text-amber-500/70 font-mono uppercase tracking-tighter animate-pulse">Syncing...</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-lg">
                      +{token.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No transactions recorded on-chain.
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

