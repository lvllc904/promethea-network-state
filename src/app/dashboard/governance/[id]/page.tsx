
'use client';
import { notFound } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Clock, Check, X, User } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { Proposal, Vote, Citizen } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

export default function ProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [proposer, setProposer] = useState<Citizen | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const proposalRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'proposals', params.id) : null),
    [firestore, params.id]
  );
  const { data: proposal, isLoading: isProposalLoading } = useDoc<Proposal>(proposalRef);

  useEffect(() => {
    if (proposal && firestore) {
      const fetchVotesAndProposer = async () => {
        setIsLoading(true);
        // Fetch votes
        const votesQuery = query(
          collection(firestore, 'votes'),
          where('proposalId', '==', proposal.id)
        );
        const votesSnapshot = await getDocs(votesQuery);
        const votesData = votesSnapshot.docs.map(
          (d) => ({ ...d.data(), id: d.id } as Vote)
        );
        setVotes(votesData);

        // Fetch proposer
        if (proposal.proposerId) {
            const proposerRef = doc(firestore, 'citizens', proposal.proposerId);
            const proposerSnap = await getDoc(proposerRef);
            if (proposerSnap.exists()) {
                setProposer({ ...proposerSnap.data(), id: proposerSnap.id } as Citizen);
            }
        }
        setIsLoading(false);
      };

      fetchVotesAndProposer();
    } else if (!isProposalLoading) {
        setIsLoading(false);
    }
  }, [proposal, firestore, isProposalLoading]);

  const totalVotes = votes.length;
  const forVotes = votes.filter(v => v.support).length;
  const againstVotes = totalVotes - forVotes;
  const forPercentage = totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0;

  const proposerAvatar = proposer ? PlaceHolderImages.find((p) => p.id === `user${proposer.id}`) : null;
  const canVote = user && !user.isAnonymous;

  if (isProposalLoading || isLoading) {
    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Card className="shadow-lg">
                    <CardHeader>
                        <Skeleton className="h-6 w-24 mb-2" />
                        <Skeleton className="h-8 w-3/4" />
                        <div className="flex items-center gap-2 pt-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                         <Skeleton className="h-6 w-32 mt-4" />
                        <Skeleton className="h-4 w-48" />
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1 space-y-6">
                <Card>
                    <CardHeader><Skeleton className="h-7 w-1/2" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><Skeleton className="h-7 w-1/2" /></CardHeader>
                    <CardContent className="space-y-6">
                         <div className="flex items-center justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-20" /></div>
                         <div className="flex items-center justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-5 w-12" /></div>
                         <Separator />
                         <div>
                            <div className="flex justify-between mb-1"><Skeleton className="h-4 w-12" /><Skeleton className="h-4 w-16" /></div>
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-20 ml-auto mt-1" />
                         </div>
                          <div>
                            <div className="flex justify-between mb-1"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-16" /></div>
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-20 ml-auto mt-1" />
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
  }

  if (!proposal) {
    notFound();
  }


  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card className="shadow-lg">
          <CardHeader>
            <Badge variant="outline" className="w-fit">
              {proposal.status}
            </Badge>
            <CardTitle className="font-headline text-3xl pt-2">
              {proposal.title}
            </CardTitle>
            {proposer && <CardDescription className="flex items-center gap-2 pt-2">
              <Avatar className="h-6 w-6">
                {proposerAvatar && (
                  <Image
                    src={proposerAvatar.imageUrl}
                    alt={proposer.id}
                    width={24}
                    height={24}
                    data-ai-hint={proposerAvatar.imageHint}
                  />
                )}
                <AvatarFallback>{proposer.id.charAt(0)}</AvatarFallback>
              </Avatar>
              Proposed by Citizen {proposer.id}
            </CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none text-foreground/90">
              <p>{proposal.description}</p>
              <p>
                This initiative aligns with our core mission of expanding the
                Promethean Archipelago with productive, community-owned assets.
                The financial projections indicate a 7% annual yield after
                accounting for operational costs and a 15% value-add potential
                upon completion of the sweat equity plan.
              </p>
              <h3 className="font-headline">Full Proposal Details</h3>
              <p>
                The complete documentation, including financial audits, risk
                assessments, and the sweat equity task list, is available on
                the IPFS-hosted document linked below.
              </p>
              <Button variant="link" asChild>
                <a href="#">View on IPFS</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Cast Your Vote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your Voice (voting power) is calculated based on your reputation,
              contributions, and quadratic voting principles.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="default"
                size="lg"
                className="bg-green-600 hover:bg-green-700 h-12"
                disabled={!canVote}
              >
                <Check className="mr-2 h-5 w-5" />
                Vote For
              </Button>
              <Button variant="destructive" size="lg" className="h-12" disabled={!canVote}>
                <X className="mr-2 h-5 w-5" />
                Vote Against
              </Button>
            </div>
            {!canVote && (
                 <p className="text-xs text-center text-muted-foreground pt-2">You must have a Promethean Passport to vote.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Status</span>
              </div>
              <Badge
                variant={proposal.status === 'Active' ? 'default' : 'secondary'}
                className="capitalize bg-blue-500/10 text-blue-500"
              >
                {proposal.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Total Voters</span>
              </div>
              <span className="font-medium">
                {totalVotes.toLocaleString()}
              </span>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-green-600">For</span>
                <span className="text-sm text-muted-foreground">
                  {forPercentage.toFixed(2)}%
                </span>
              </div>
              <Progress
                value={forPercentage}
                className="h-3 [&>div]:bg-green-600"
              />
              <p className="text-xs text-right text-muted-foreground mt-1">
                {forVotes.toLocaleString()} Votes
              </p>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-red-600">Against</span>
                <span className="text-sm text-muted-foreground">
                  {(100 - forPercentage).toFixed(2)}%
                </span>
              </div>
              <Progress
                value={100 - forPercentage}
                className="h-3 [&>div]:bg-red-600"
              />
              <p className="text-xs text-right text-muted-foreground mt-1">
                {againstVotes.toLocaleString()} Votes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
