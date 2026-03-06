'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@promethea/ui';
import { Button } from '@promethea/ui';
import { Input } from '@promethea/ui';
import { Label } from '@promethea/ui';
import { Textarea } from '@promethea/ui';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@promethea/firebase';
import { collection, query, type Query } from 'firebase/firestore';
import type { GapLoan } from '@promethea/lib';
import { Skeleton } from '@promethea/ui';
import { addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@promethea/hooks';
import { AlertCircle, FileText, HandCoins, Loader2, PlusCircle } from 'lucide-react';
import { Badge } from '@promethea/ui';

function GapLoanCard({ loan }: { loan: GapLoan & { id: string } }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFunding, setIsFunding] = useState(false);

  const handleFund = async () => {
    if (!user || user.isAnonymous) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must have a Promethean Passport to fund a loan.',
      });
      return;
    }
    if (!firestore) return;

    setIsFunding(true);
    try {
      const loanRef = doc(firestore, 'gap_loans', loan.id);
      await updateDoc(loanRef, {
        funderId: user.uid,
        status: 'Funded',
        amountFunded: loan.amountNeeded,
        fundedAt: serverTimestamp(),
      });
      toast({
        title: 'Loan Funded!',
        description: `You have successfully funded the loan: "${loan.title}".`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Funding Failed',
        description: error.message || 'An error occurred',
      });
    }
    setIsFunding(false);
  };

  const isFunded = loan.status === 'Funded';
  const canFund = loan.status === 'Funding' && user?.uid !== loan.proposerId;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline">{loan.title}</CardTitle>
          <Badge {...({ variant: loan.status === 'Funded' ? 'default' : 'secondary' } as any)} className={isFunded ? "bg-green-500/20 text-green-700" : ""}>{loan.status}</Badge>
        </div>
        <CardDescription>Proposed by Citizen {loan.proposerId.slice(0, 8)}...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{loan.description}</p>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Amount Needed</h3>
            <p className="text-lg font-bold">${loan.amountNeeded.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Repayment Terms</h3>
            <p className="text-sm font-semibold">{loan.repaymentTerms}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleFund} disabled={!canFund || isFunding} className="w-full">
          {isFunding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isFunded ? 'Successfully Funded' : canFund ? 'Fund This Loan' : 'Cannot Fund'}
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function FinancingPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loansQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'gap_loans') : null) as unknown as Query<GapLoan> | null,
    [firestore]
  );
  const { data: loans, isLoading } = useCollection<GapLoan>(loansQuery as any);

  const handlePropose = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || user.isAnonymous) {
      toast({ variant: 'destructive', title: 'Authentication Required', description: 'You must have a Promethean Passport to propose a loan.' });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      if (!firestore) throw new Error("Database not connected");

      const newLoan = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        amountNeeded: parseFloat(formData.get('amountNeeded') as string),
        repaymentTerms: formData.get('repaymentTerms') as string,
        proposalId: formData.get('proposalId') as string,
        proposerId: user.uid,
        status: 'Funding',
        amountFunded: 0,
        createdAt: serverTimestamp()
      };

      if (!newLoan.title || !newLoan.amountNeeded || !newLoan.repaymentTerms) {
        throw new Error('Title, Amount Needed, and Repayment Terms are required.');
      }

      await addDoc(collection(firestore, 'gap_loans'), newLoan);

      toast({ title: 'Loan Proposal Submitted!', description: 'Your gap loan is now open for funding by the community.' });
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Proposal Failed', description: error.message || "An error occurred" });
    }

    setIsSubmitting(false);
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <h1 className="text-3xl font-headline font-bold flex items-center gap-2"><HandCoins /> Gap Financing</h1>
          <p className="text-muted-foreground">
            A peer-to-peer micro-lending facility for time-sensitive, specific project needs. Fund a loan to earn a return, or propose one to solve a problem.
          </p>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><PlusCircle /> Propose a New Loan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePropose} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Loan Title</Label>
                  <Input id="title" name="title" placeholder="e.g., Earnest Money for Asset Alpha" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proposalId">Associated Proposal ID</Label>
                  <Input id="proposalId" name="proposalId" placeholder="The ID of the main funding proposal" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amountNeeded">Amount Needed ($)</Label>
                  <Input id="amountNeeded" name="amountNeeded" type="number" placeholder="e.g., 5000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repaymentTerms">Repayment Terms</Label>
                  <Input id="repaymentTerms" name="repaymentTerms" placeholder="e.g., Repay $5500 in 60 days" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Explain exactly why this loan is needed and how the funds will be used." required />
                </div>
                <Button type="submit" disabled={isSubmitting || !user || user.isAnonymous} className="w-full">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Loan Proposal
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-headline font-bold">Open for Funding</h2>
          {isLoading && (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-72" />)}
            </div>
          )}
          {!isLoading && loans?.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border border-dashed rounded-lg">
              <AlertCircle className="w-10 h-10 mb-4" />
              <h3 className="font-semibold">No Open Loans</h3>
              <p>There are currently no gap financing opportunities available.</p>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            {loans?.filter(l => l.status === 'Funding').map((loan) => <GapLoanCard key={loan.id} loan={{ ...loan, id: loan.id }} />)}
          </div>
          <h2 className="text-2xl font-headline font-bold pt-8">Recently Funded</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {loans?.filter(l => l.status === 'Funded').map((loan) => <GapLoanCard key={loan.id} loan={{ ...loan, id: loan.id }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
