'use client';
export const dynamic = 'force-dynamic';
import { ThreatDetector } from '@promethea/components';
import { type DetectNetworkThreatsInput } from '@promethea/lib';
import { useCollection, useFirestore, useMemoFirebase } from '@promethea/firebase';
import { collection, query, limit, Query } from 'firebase/firestore';
import { Pledge, Vote } from '@promethea/lib';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@promethea/ui';
import { Skeleton } from '@promethea/ui';
import { handleDetect } from './actions';

export default function SecurityPage() {
  const firestore = useFirestore();

  const recentPledgesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'pledges'), limit(10)) as unknown as Query<Pledge>
        : null,
    [firestore]
  );
  const { data: pledges, isLoading: pledgesLoading } = useCollection<Pledge>(recentPledgesQuery as any);

  const recentVotesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'votes'), limit(10)) as unknown as Query<Vote>
        : null,
    [firestore]
  );
  const { data: votes, isLoading: votesLoading } = useCollection<Vote>(recentVotesQuery as any);

  const isLoading = pledgesLoading || votesLoading;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-headline font-bold">
          Community Immune System
        </h1>
        <p className="text-muted-foreground">
          A decentralized security protocol for collective self-defense against
          digital and physical threats.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      ) : (
        <ThreatDetector
          onDetect={handleDetect}
          actionLedgerData={{ pledges, votes }}
        />
      )}
    </div>
  );
}
