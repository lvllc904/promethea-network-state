'use client';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, CheckCircle, XCircle, Clock, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { Proposal, Vote, Citizen } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

type EnrichedProposal = Proposal & {
  proposer?: Citizen;
  votes?: Vote[];
};

export default function GovernancePage() {
  const firestore = useFirestore();
  const [proposals, setProposals] = useState<EnrichedProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const proposalsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'proposals') : null),
    [firestore]
  );
  const { data: rawProposals, isLoading: proposalsLoading } =
    useCollection<Proposal>(proposalsQuery);

  useEffect(() => {
    if (rawProposals && firestore) {
      const enrichProposals = async () => {
        setIsLoading(true);
        const enriched = await Promise.all(
          rawProposals.map(async (p) => {
            const enrichedProposal: EnrichedProposal = { ...p };
            // Fetch proposer
            if (p.proposerId) {
                try {
                    const proposerSnap = await getDocs(query(collection(firestore, 'citizens'), where('id', '==', p.proposerId)));
                    if (!proposerSnap.empty) {
                        enrichedProposal.proposer = { ...proposerSnap.docs[0].data(), id: proposerSnap.docs[0].id } as Citizen;
                    }
                } catch (e) {
                    // This can happen if the proposerId is invalid, or due to permissions
                    console.error(`Could not fetch proposer for proposal ${p.id}`, e);
                }
            }

            // Fetch votes
            const votesQuery = query(
              collection(firestore, 'votes'),
              where('proposalId', '==', p.id)
            );
            const votesSnapshot = await getDocs(votesQuery);
            enrichedProposal.votes = votesSnapshot.docs.map(
              (d) => ({ ...d.data(), id: d.id } as Vote)
            );
            return enrichedProposal;
          })
        );
        setProposals(enriched);
        setIsLoading(false);
      };
      enrichProposals();
    } else if (!proposalsLoading) {
        setIsLoading(false);
    }
  }, [rawProposals, firestore, proposalsLoading]);


  const renderProposalCard = (proposal: EnrichedProposal) => {
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
            <Badge variant="outline">{proposal.status}</Badge>
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
            <span>Citizen {proposal.proposer?.id || '...'}</span>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/governance/${proposal.id}`}>
              View & Vote
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
    const renderSkeleton = (count: number) => (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {[...Array(count)].map((_, i) => (
                <Card key={i} className="shadow-md flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                        <Skeleton className="h-6 w-3/4 mt-2" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full mt-2" />
                        <Skeleton className="h-4 w-2/3 mt-2" />
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-9 w-24" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Proposals</h1>
          <p className="text-muted-foreground">
            Participate in the Promethean DAC&apos;s decision-making process.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/governance/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Proposal
          </Link>
        </Button>
      </div>
      <Tabs defaultValue="Active">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="Active">Active</TabsTrigger>
          <TabsTrigger value="Passed">Passed</TabsTrigger>
          <TabsTrigger value="Draft">Executing</TabsTrigger>
          <TabsTrigger value="Rejected">Failed</TabsTrigger>
        </TabsList>
        {(proposalsLoading || isLoading) ? renderSkeleton(3) : 
            <>
                <TabsContent value="Active">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    {proposals
                    .filter((p) => p.status === 'Active')
                    .map(renderProposalCard)}
                </div>
                </TabsContent>
                <TabsContent value="Passed">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    {proposals
                    .filter((p) => p.status === 'Passed')
                    .map(renderProposalCard)}
                </div>
                </TabsContent>
                <TabsContent value="Draft">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    {proposals
                    .filter((p) => p.status === 'Draft')
                    .map(renderProposalCard)}
                </div>
                </TabsContent>
                <TabsContent value="Rejected">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    {proposals
                    .filter((p) => p.status === 'Rejected')
                    .map(renderProposalCard)}
                </div>
                </TabsContent>
            </>
        }
      </Tabs>
    </div>
  );
}
