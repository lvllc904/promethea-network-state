'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Landmark,
  FileText,
  ArrowUpRight,
  DollarSign,
  Users,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import {
  useCollection,
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { collection, doc, query, where, limit } from 'firebase/firestore';
import { Citizen, Proposal, RealWorldAsset, UniversalValueToken } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const firestore = useFirestore();
  const { user } = useUser();

  const citizenRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'citizens', user.uid) : null),
    [firestore, user]
  );
  const { data: citizen, isLoading: isCitizenLoading } = useDoc<Citizen>(citizenRef);

  const activeProposalsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'proposals'),
            where('status', '==', 'Active'),
            limit(3)
          )
        : null,
    [firestore]
  );
  const { data: activeProposals, isLoading: areProposalsLoading } =
    useCollection<Proposal>(activeProposalsQuery);

  const assetsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'real_world_assets') : null),
    [firestore]
  );
  const { data: assets, isLoading: areAssetsLoading } =
    useCollection<RealWorldAsset>(assetsQuery);
    
  const myContributionsQuery = useMemoFirebase(() => 
    firestore && user ? query(collection(firestore, 'universal_value_tokens'), where('ownerId', '==', user.uid), limit(5)) : null
  , [firestore, user]);
  const { data: myContributions, isLoading: areContributionsLoading } = useCollection<UniversalValueToken>(myContributionsQuery);


  const totalAUM =
    assets?.reduce((acc, asset) => acc + (asset.tokenIds?.length || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Reputation</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isCitizenLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{citizen?.reputationScore || 0}</div>}
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Contribution
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isCitizenLoading ? <Skeleton className="h-8 w-28" /> : <div className="text-2xl font-bold">
              {citizen?.contributionScore || 0}
            </div>}
            <p className="text-xs text-muted-foreground">
              Based on network participation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network AUM</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {areAssetsLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">
              {totalAUM.toLocaleString()}
            </div>}
            <p className="text-xs text-muted-foreground">
              Across {assets?.length || 0} Real-World Assets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Proposals
            </CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {areProposalsLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">+{activeProposals?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">
              Awaiting community vote
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Active Proposals</CardTitle>
              <CardDescription>
                Proposals currently under review by the DAC.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/governance">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proposal</TableHead>
                  <TableHead className="text-right">Ends In</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areProposalsLoading ? (
                    [...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-48 mb-1" /><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : (
                    activeProposals?.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>
                      <Link href={`/dashboard/governance/${proposal.id}`} className="font-medium hover:underline">{proposal.title}</Link>
                      <div className="text-sm text-muted-foreground">
                        Proposed by Citizen {proposal.proposerId}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{`${Math.ceil((new Date(proposal.votingEndTime || 0).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}d`}</TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Recent Contributions</CardTitle>
            <CardDescription>
              A summary of your recent activity on the UVT Ledger.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
             {areContributionsLoading ? (
                [...Array(2)].map((_, i) => (
                     <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="grid gap-1 flex-1">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-6 w-20 ml-auto" />
                    </div>
                ))
            ) : (
                myContributions?.map(contribution => (
                <div key={contribution.id} className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {contribution.tokenType === 'Labor' ? <FileText className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  {contribution.tokenType} Contribution
                </p>
                <p className="text-sm text-muted-foreground">
                  Asset: {contribution.assetId}
                </p>
              </div>
              <div className="ml-auto font-medium text-green-600">
                +{contribution.amount} UVT
              </div>
            </div>
            )))}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/ledger">View Full Ledger</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
