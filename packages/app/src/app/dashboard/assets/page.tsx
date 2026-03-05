'use client';
export const dynamic = 'force-dynamic';
import { PlaceHolderImages } from '@promethea/lib';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@promethea/ui';
import { Button } from '@promethea/ui';
import { DollarSign, MapPin, ArrowUpRight, Clock, CheckCircle, XCircle, User, PlusCircle } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@promethea/firebase';
import { collection, query, where } from 'firebase/firestore';
import { RealWorldAsset, Proposal, Vote } from '@promethea/lib';
import { type Query } from 'firebase/firestore';
import { Skeleton } from '@promethea/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@promethea/ui';
import { Badge } from '@promethea/ui';
import { Progress } from '@promethea/ui';

function formatLocation(location: any): string {
  if (!location) return 'Unknown';
  if (typeof location === 'string') return location;
  // Handle object format: { region, nearestTown, state, coordinates }
  const { nearestTown, region, state } = location as Record<string, string>;
  return [nearestTown, region, state].filter(Boolean).join(', ') || JSON.stringify(location);
}

function AssetCard({ asset }: { asset: RealWorldAsset }) {
  const assetImage = PlaceHolderImages.find(
    (p) => p.id === `asset${asset.id}`
  );
  return (
    <Card
      key={asset.id}
      className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col"
    >
      <CardHeader className="p-0 relative h-48">
        {assetImage && (
          <Image
            src={assetImage.imageUrl}
            alt={asset.name}
            fill
            className="object-cover"
            data-ai-hint={assetImage.imageHint}
          />
        )}
      </CardHeader>
      <div className="p-6 flex flex-col flex-grow">
        <CardTitle className="font-headline text-xl">
          {asset.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <MapPin className="w-4 h-4" />
          {formatLocation(asset.location)}
        </CardDescription>

        <p className="text-sm text-muted-foreground mt-4 flex-grow line-clamp-2">
          {asset.description}
        </p>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">
            ${(asset.price || 0).toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">VALUE</span>
        </div>

        <Button asChild className="w-full mt-4">
          <Link href={`/dashboard/assets/${asset.id}`}>
            Manage Asset
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function ProposalCard({ proposal }: { proposal: Proposal & { votes?: Vote[] } }) {
  const totalVotes = proposal.votes?.length || 0;
  const forVotes = proposal.votes?.filter((v) => v.support).length || 0;
  const forPercentage = totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0;
  const endsIn = proposal.votingEndTime
    ? `${Math.ceil(
      (new Date(proposal.votingEndTime).getTime() - new Date().getTime()) /
      (1000 * 3600 * 24)
    )} days`
    : 'N/A';

  const statusMap = {
    Active: {
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      text: `Ends in ${endsIn}`,
      color: 'bg-blue-500/10 text-blue-500',
    },
    Passed: {
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      text: 'Passed',
      color: 'bg-green-500/10 text-green-500',
    },
    Rejected: {
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      text: 'Failed',
      color: 'bg-red-500/10 text-red-500',
    },
    Draft: {
      icon: <CheckCircle className="w-4 h-4 text-purple-500" />,
      text: 'Executing',
      color: 'bg-purple-500/10 text-purple-500',
    },
  };
  const statusInfo = statusMap[proposal.status];

  return (
    <Card
      key={proposal.id}
      className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant="outline">{proposal.category}</Badge>
          {statusInfo && (
            <div
              className={`flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-full ${statusInfo.color}`}
            >
              {statusInfo.icon}
              <span>{statusInfo.text}</span>
            </div>
          )}
        </div>
        <CardTitle className="font-headline pt-2">{proposal.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">
          {proposal.description}
        </p>
        {proposal.status === 'Active' && (
          <div className="mt-4 space-y-2">
            <Progress value={forPercentage} />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>For: {forVotes.toLocaleString()}</span>
              <span>Against: {(totalVotes - forVotes).toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>Citizen {proposal.proposerId || '...'}</span>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/governance/${proposal.id}`}>
            View & Vote
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function AssetMarketplacePage() {
  const firestore = useFirestore();
  const assetsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'real_world_assets')) : null) as Query<RealWorldAsset> | null,
    [firestore]
  );
  const { data: assets, isLoading: areAssetsLoading } = useCollection<RealWorldAsset>(assetsQuery);

  const proposalsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'proposals'), where('category', '==', 'RWA Acquisition'), where('status', '==', 'Active')) : null) as Query<Proposal> | null,
    [firestore]
  );
  const { data: proposals, isLoading: areProposalsLoading } = useCollection<Proposal>(proposalsQuery as any);


  const isLoading = areAssetsLoading || areProposalsLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-headline font-bold">Asset Marketplace</h1>
          <p className="text-muted-foreground">
            Discover, fund, and manage the assets of the Promethean Archipelago.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/assets/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            List New Asset
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="explore">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="explore">Explore Assets</TabsTrigger>
          <TabsTrigger value="funding">Funding Proposals</TabsTrigger>
        </TabsList>
        <TabsContent value="explore">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="shadow-md overflow-hidden flex flex-col">
                  <CardHeader className="p-0 relative h-48">
                    <Skeleton className="h-full w-full" />
                  </CardHeader>
                  <div className="p-6 flex flex-col flex-grow">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                    <Skeleton className="h-4 w-full mt-4" />
                    <Skeleton className="h-4 w-full mt-1" />
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-10 w-full mt-4" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
              {assets?.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="funding">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i}><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
              {proposals?.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <h3 className="font-headline text-xl">No Active Funding Proposals</h3>
                  <p className="text-muted-foreground">Check back later or propose a new asset acquisition!</p>
                </div>
              )}
              {proposals?.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
