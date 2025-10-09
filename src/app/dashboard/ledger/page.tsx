
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { UniversalValueToken } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function LedgerPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  
  const tokensQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'universal_value_tokens') : null),
    [firestore]
  );
  const { data: tokens, isLoading: areTokensLoading } =
    useCollection<UniversalValueToken>(tokensQuery);
    
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
        <h1 className="text-3xl font-headline font-bold">UVT Ledger</h1>
        <p className="text-muted-foreground">
          A rich, multi-dimensional, and immutable record of how value is
          created and exchanged.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            All value creation and exchange events are recorded transparently
            on-chain.
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
