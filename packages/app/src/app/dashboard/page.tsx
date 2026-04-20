'use client';
export const dynamic = 'force-dynamic';
import { useDoc, useCollection, useMemoFirebase, useUser, useFirestore } from '@promethea/identity';
import { doc, collection, query, where, type Query, type DocumentReference } from 'firebase/firestore';
import { RealityBadge, LedgerValue } from '@promethea/components';
import {
  RealWorldAsset,
  Proposal,
  UniversalValueToken,
  Citizen
} from '@promethea/lib';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@promethea/ui';
import { Badge } from '@promethea/ui';
import { Button } from '@promethea/ui';
import {
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  Shield,
  Wrench,
  PieChart,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@promethea/ui';
import {
  Pie,
  Cell,
  ResponsiveContainer,
  PieChart as RechartsPieChart
} from 'recharts';
import { Skeleton } from '@promethea/ui';
import { useMemo, useState, useEffect } from 'react';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const COLORS = {
  Labor: 'hsl(var(--chart-1))',
  Capital: 'hsl(var(--chart-2))',
  Reputation: 'hsl(var(--chart-3))'
};

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const citizenRef = useMemoFirebase(
    () => (firestore && user && user.uid !== 'anonymous' ? doc(firestore, 'citizens', user.uid) : null) as DocumentReference<Citizen> | null,
    [firestore, user]
  );
  const { data: citizen, isLoading: isCitizenLoading } = useDoc<Citizen>(citizenRef as any);

  const assetsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'real_world_assets'), where('status', '==', 'Active')) : null) as unknown as Query<RealWorldAsset> | null,
    [firestore]
  );
  const { data: assets, isLoading: areAssetsLoading } = useCollection<RealWorldAsset>(assetsQuery as any) as any;

  const proposalsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'proposals'), where('status', 'in', ['Active', 'Proposed'])) : null) as unknown as Query<Proposal> | null,
    [firestore]
  );
  const { data: activeProposals, isLoading: areProposalsLoading } = useCollection<Proposal>(proposalsQuery as any) as any;

  // Contributions/UVTs are private per user
  const uvtsQuery = useMemoFirebase(
    () => (firestore && user && user.uid !== 'anonymous' ? query(collection(firestore, 'universal_value_tokens'), where('ownerId', '==', user.uid)) : null) as unknown as Query<UniversalValueToken> | null,
    [firestore, user]
  );
  const { data: myContributions, isLoading: areContributionsLoading } = useCollection<UniversalValueToken>(uvtsQuery as any) as any;

  // Fetch live waterfall status from the engine
  const [waterfall, setWaterfall] = useState<any>(null);
  const [isWaterfallLoading, setIsWaterfallLoading] = useState(true);

  useEffect(() => {
    fetch('/api/treasury/waterfall')
      .then(res => res.json())
      .then(data => {
        setWaterfall(data || { rings: [] });
        setIsWaterfallLoading(false);
      })
      .catch(err => {
        console.error('Waterfall fetch error:', err);
        setIsWaterfallLoading(false);
      });
  }, []);

  const isLoading = isCitizenLoading || areAssetsLoading || areProposalsLoading || (user && user.uid !== 'anonymous' && areContributionsLoading);

  const portfolioStats = useMemo(() => {
    if (!myContributions) return { totalValue: 0, distribution: [] };

    const totalValue = myContributions.reduce((sum: number, t: any) => sum + t.amount, 0);
    const distribution = myContributions.reduce((acc: any[], token: any) => {
      const existing = acc.find(item => item.name === token.tokenType);
      if (existing) {
        existing.value += token.amount;
      } else {
        acc.push({ name: token.tokenType, value: token.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

    return { totalValue, distribution };
  }, [myContributions]);

  // Decouple skeletons so the layout renders immediately.
  const isEssentialDataLoading = isUserLoading || isCitizenLoading;

  if (isEssentialDataLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px]" />
                <Skeleton className="h-3 w-[140px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isGuest = !user || user.uid === 'anonymous';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">
            {isGuest ? 'Welcome to Promethea' : `Welcome, ${citizen?.displayName || user?.displayName || 'Citizen'}`}
          </h2>
          <p className="text-muted-foreground">
            {isGuest
              ? "Exploring the public ledger of the Sovereign Digital Nation."
              : "Here's what's happening with your Sovereign assets today."}
          </p>
        </div>
          <div className="flex items-center gap-3">
            <RealityBadge state="SIMULATED" />
            <a 
              href="https://explorer.solana.com/address/Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 py-1.5 px-3 flex items-center gap-2 cursor-pointer hover:bg-green-500/20 active:scale-95 transition-all">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase">Solana Mainnet: ON-CHAIN</span>
              </Badge>
            </a>
          </div>
      </div>

        <div className="bg-gradient-to-r from-green-500/5 to-primary/5 border border-green-500/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-bold text-green-500 uppercase tracking-tight">Actualization Phase Active</p>
              <p className="text-xs text-muted-foreground">Historical ledger data is being bridged to Solana Mainnet. System transparency is 24/7.</p>
            </div>
          </div>
          <Link href="/dashboard/ledger">
            <Button size="sm" variant="outline" className="text-xs h-8">View Bridge Status</Button>
          </Link>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-amber-500 bg-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Net Portfolio Health
              <RealityBadge state="SIMULATED" size="sm" />
            </CardTitle>
            <TrendingUp className={`h-4 w-4 ${waterfall?.totalTvlUsd > 0 ? 'text-amber-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <LedgerValue value={waterfall?.totalTvlUsd || 0} isSimulated={true} className="text-2xl font-bold" />
            <p className="text-[10px] text-muted-foreground">
              Overhead: <LedgerValue value={waterfall?.infrastructureCostUsd || 0} isSimulated={true} /> / mo
            </p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Reputation Score
              <RealityBadge state="SIMULATED" size="sm" />
            </CardTitle>
            <Shield className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{citizen?.reputation || 0}</div>
            <p className="text-xs text-muted-foreground">Certified Sovereign Node</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Voting Power
              <RealityBadge state="SIMULATED" size="sm" />
            </CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{citizen?.governanceTokens || 0} gPROM</div>
            <p className="text-xs text-muted-foreground">{activeProposals?.length || 0} Active Proposals</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rings</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waterfall?.activeRings || 0} / 10</div>
            <p className="text-[10px] text-muted-foreground truncate" title={waterfall?.nextUnlock}>
              Next: {waterfall?.nextUnlock || 'Warming up...'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Waterfall Visualization */}
      <Card className="overflow-hidden bg-black/40 border-primary/10">
        <CardHeader className="border-b border-white/5 bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Sovereign Waterfall Protocol
              </CardTitle>
              <CardDescription>Concentric Ring Treasury Actualization</CardDescription>
            </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px] text-red-400 border-red-400/20">Overhead: <LedgerValue value={waterfall?.infrastructureCostUsd || 0} isSimulated={true} /></Badge>
                <Badge variant="outline" className="font-mono text-[10px]">Net TVL: <LedgerValue value={waterfall?.totalTvlUsd || 0} isSimulated={true} /></Badge>
              </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-x divide-y divide-white/5">
            {waterfall?.rings.slice(0, 10).map((ring: any, i: number) => (
              <div key={ring.name} className={`p-4 group transition-colors hover:bg-white/5 ${ring.isActive ? 'bg-primary/5' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ring {i}</span>
                  <RealityBadge state={ring.isActive ? 'ACTUALIZED' : 'SIMULATED'} showLabel={false} />
                </div>
                <h4 className={`text-xs font-bold mb-1 ${ring.isActive ? 'text-primary' : 'text-foreground'}`}>{ring.name}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${ring.isActive ? 'bg-primary' : 'bg-white/20'}`} 
                      style={{ width: `${Math.min(100, (ring.balanceSol / ring.thresholdSol) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {ring.isActive ? '100%' : `${((ring.balanceSol / (ring.thresholdSol || 0.001)) * 100).toFixed(0)}%`}
                  </span>
                </div>
                <p className="text-[9px] font-mono text-muted-foreground break-all opacity-40 group-hover:opacity-100 transition-opacity">
                  {ring.address}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ErrorBoundary moduleName="Portfolio Distribution">
          <Card className="col-span-4 shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline">Portfolio Distribution</CardTitle>
              <CardDescription aria-hidden="true" className="sr-only">Visual breakdown of your Universal Value Token (UVT) holdings.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer
                config={{
                  Labor: { label: "Labor", color: "hsl(var(--chart-1))" },
                  Capital: { label: "Capital", color: "hsl(var(--chart-2))" },
                  Reputation: { label: "Reputation", color: "hsl(var(--chart-3))" },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={portfolioStats.distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {portfolioStats.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </ErrorBoundary>
        <ErrorBoundary moduleName="Active Assets">
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="font-headline">Active Assets</CardTitle>
              <CardDescription>Real world assets under Sovereign governance.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {assets?.slice(0, 4).map((asset: any) => (
                  <div key={asset.id} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <PieChart className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">{asset.name}</p>
                        <RealityBadge state={asset.realityState || 'SIMULATED'} showLabel={false} />
                      </div>
                      <p className="text-xs text-muted-foreground">{typeof asset.location === 'string' ? asset.location : [asset.location?.nearestTown, asset.location?.region, asset.location?.state].filter(Boolean).join(', ') || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <LedgerValue value={asset.price || 0} isSimulated={asset.realityState !== 'ACTUALIZED'} className="text-sm" />
                      <Link href={`/dashboard/assets/${asset.id}`} className="text-[10px] text-primary hover:underline flex items-center justify-end gap-1">
                        View <ArrowRight className="h-2 w-2" />
                      </Link>
                    </div>
                  </div>
                ))}
                {assets?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground italic">
                    No active assets found. Start a proposal to acquire one.
                  </div>
                )}
              </div>
              {assets && assets.length > 4 && (
                <Button variant="ghost" className="w-full mt-4 text-xs" asChild>
                  <Link href="/dashboard/assets">View All Assets</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </ErrorBoundary>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ErrorBoundary moduleName="Live Governance">
          <Card className="col-span-7">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline">Live Governance</CardTitle>
                  <CardDescription>Active proposals requiring your contribution or vote.</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/governance">Go to Governance</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeProposals?.slice(0, 3).map((proposal: any) => (
                  <Card key={proposal.id} className="bg-muted/30 border-none shadow-none">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <Badge {...({ variant: "outline" } as any)} className="bg-background text-[10px]">{proposal.category}</Badge>
                          <RealityBadge state={proposal.realityState || 'SIMULATED'} showLabel={false} />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {proposal.id.slice(0, 8)}</span>
                      </div>
                      <h4 className="font-headline font-bold mb-2 truncate">{proposal.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{proposal.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-muted">
                        <div className="flex -space-x-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold">
                              {['JD', 'MS', 'AK'][i]}
                            </div>
                          ))}
                          <div className="h-6 w-6 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                            +12
                          </div>
                        </div>
                        <Button size="sm" className="h-7 text-xs px-3" asChild>
                          <Link href={`/dashboard/governance/${proposal.id}`}>Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </ErrorBoundary>
      </div>
    </div >
  );
}
