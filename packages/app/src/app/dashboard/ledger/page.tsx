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
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Transactions</h1>
        <p className="text-muted-foreground">
          A record of your value creation and exchange events on the UVT Ledger.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Recent Contributions</CardTitle>
          <CardDescription>
            Your recent activity is recorded transparently on-chain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Owner</TableHead>
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
              {!isLoading && user && tokens?.map((token) => (
                <TableRow key={token.id}>
                  <TableCell className="font-medium">
                    <div className="font-medium">
                      Token Mint for Asset {token.assetId}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {token.id}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {token.ownerId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(token.tokenType) as any}>
                      {token.tokenType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {token.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
