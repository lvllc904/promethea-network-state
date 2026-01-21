'use client';
export const dynamic = 'force-dynamic';
import { useDoc, useCollection, useMemoFirebase, useUser, useFirestore } from '@promethea/firebase';
import { doc, collection, query, where, type Query, type DocumentReference } from 'firebase/firestore';
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
import { useMemo, useState } from 'react';

const COLORS = {
  Labor: 'hsl(var(--chart-1))',
  Capital: 'hsl(var(--chart-2))',
  Reputation: 'hsl(var(--chart-3))'
};

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const citizenRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'citizens', user.uid) : null) as DocumentReference<Citizen> | null,
    [firestore, user]
  );
  const { data: citizen, isLoading: isCitizenLoading } = useDoc<Citizen>(citizenRef as any);

  const assetsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'real_world_assets'), where('status', '==', 'Active')) : null) as unknown as Query<RealWorldAsset> | null,
    [firestore]
  );
  const { data: assets, isLoading: areAssetsLoading } = useCollection<RealWorldAsset>(assetsQuery as any) as any;

  const proposalsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'proposals'), where('category', '==', 'RWA Acquisition'), where('status', '==', 'Active')) : null) as unknown as Query<Proposal> | null,
    [firestore]
  );
  const { data: activeProposals, isLoading: areProposalsLoading } = useCollection<Proposal>(proposalsQuery as any) as any;

  const uvtsQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'universal_value_tokens'), where('ownerId', '==', user.uid)) : null) as unknown as Query<UniversalValueToken> | null,
    [firestore, user]
  );
  const { data: myContributions, isLoading: areContributionsLoading } = useCollection<UniversalValueToken>(uvtsQuery as any) as any;

  const isLoading = isCitizenLoading || areAssetsLoading || areProposalsLoading || areContributionsLoading;

  const portfolioStats = useMemo(() => {
    if (!myContributions) return { totalValue: 0, distribution: [] };

    // In a real app, we'd fetch asset prices. Here we assume 1 UVT = $1 for simplicity in the demo.
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

  if (isLoading) {
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Welcome, {citizen?.displayName || 'Citizen'}</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your Sovereign assets today.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolioStats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" /> +2.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citizen?.reputation || 0}</div>
            <p className="text-xs text-muted-foreground">Certified Sovereign Node</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voting Power</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citizen?.governanceTokens || 0} gPROM</div>
            <p className="text-xs text-muted-foreground">{activeProposals?.length || 0} Active Proposals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 pending verification</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Portfolio Distribution</CardTitle>
            <CardDescription aria-hidden="true" className="sr-only">Visual breakdown of your Universal Value Token (UVT) holdings.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
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
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Active Assets</CardTitle>
            <CardDescription>Real world assets under Sovereign governance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {assets?.slice(0, 4).map((asset) => (
                <div key={asset.id} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <PieChart className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${asset.value.toLocaleString()}</p>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
              {activeProposals?.slice(0, 3).map(proposal => (
                <Card key={proposal.id} className="bg-muted/30 border-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge {...({ variant: "outline" } as any)} className="bg-background text-[10px]">{proposal.category}</Badge>
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
      </div>
    </div>
  );
}
