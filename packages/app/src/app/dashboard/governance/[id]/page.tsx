'use client';
export const dynamic = 'force-dynamic';
import { notFound, useRouter, usePathname } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  RadioGroup,
  RadioGroupItem,
  Input,
} from '@promethea/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@promethea/ui';
import { Badge } from '@promethea/ui';
import { Progress } from '@promethea/ui';
import { Button } from '@promethea/ui';
import { Separator } from '@promethea/ui';
import { PlaceHolderImages } from '@promethea/lib';
import Image from 'next/image';
import {
  Clock,
  Check,
  X,
  User,
  DollarSign,
  Wrench,
  Loader2,
  FileText,
  Star,
  Banknote,
} from 'lucide-react';
import {
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
  useCollection,
} from '@promethea/firebase';
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  type Query,
  type DocumentReference
} from 'firebase/firestore';
import { Proposal, Vote, Citizen, Task, type CompensationChoice } from '@promethea/lib';
import { Skeleton } from '@promethea/ui';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@promethea/ui';
import { applyForTask } from '../../assets/[id]/actions';
import { pledgeCapital } from './actions';
import { useToast } from '@promethea/hooks';
import { Label } from '@promethea/ui';

function PledgeCapitalDialog({
  open,
  onOpenChange,
  onPledge,
  isPledging,
  targetEquity,
  pledgedCapital,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPledge: (amount: number) => void;
  isPledging: boolean;
  targetEquity: number;
  pledgedCapital: number;
}) {
  const [amount, setAmount] = useState('');
  const remainingEquity = targetEquity - pledgedCapital;

  const handlePledge = () => {
    const pledgeAmount = parseFloat(amount);
    if (!isNaN(pledgeAmount) && pledgeAmount > 0) {
      if (pledgeAmount > remainingEquity) {
        alert(`Pledge amount cannot exceed the remaining target of $${remainingEquity.toLocaleString()}`);
      } else {
        onPledge(pledgeAmount);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pledge Capital to this Proposal</DialogTitle>
          <DialogDescription>
            Enter the amount you wish to contribute. This will be recorded on the
            Ledger of Record.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Remaining Target</p>
            <p className="text-3xl font-bold">${remainingEquity.toLocaleString()}</p>
          </div>
          <Label htmlFor="amount">Pledge Amount (USD)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 500"
            className="text-lg"
          />
        </div>
        <Button onClick={handlePledge} disabled={isPledging || !amount || parseFloat(amount) <= 0}>
          {isPledging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm Pledge
        </Button>
      </DialogContent>
    </Dialog>
  );
}


function CompensationChoiceDialog({ open, onOpenChange, onApply, isApplying, currentTask }: { open: boolean, onOpenChange: (open: boolean) => void, onApply: (choice: CompensationChoice) => void, isApplying: boolean, currentTask: Task | null }) {
  const [selectedChoice, setSelectedChoice] = useState<CompensationChoice | null>(null);

  const handleApply = () => {
    if (selectedChoice) {
      onApply(selectedChoice);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Your Compensation</DialogTitle>
          <DialogDescription>
            Select how you would like to be compensated for completing the task: "{currentTask?.description}". Your choice impacts the project's financial model.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup onValueChange={(value) => setSelectedChoice(value as CompensationChoice)}>
            <div className="flex items-start space-x-4 rounded-md border p-4">
              <RadioGroupItem value="Equity" id="equity" />
              <Label htmlFor="equity" className="flex flex-col gap-1 w-full cursor-pointer">
                <span className="font-bold flex items-center gap-2"><FileText className="w-4 h-4" /> Equity Stake</span>
                <span className="text-xs text-muted-foreground">Convert the value of your labor into direct ownership tokens of the asset.</span>
              </Label>
            </div>
            <div className="flex items-start space-x-4 rounded-md border p-4">
              <RadioGroupItem value="ProfitShare" id="profit" />
              <Label htmlFor="profit" className="flex flex-col gap-1 w-full cursor-pointer">
                <span className="font-bold flex items-center gap-2"><Star className="w-4 h-4" /> Profit Share</span>
                <span className="text-xs text-muted-foreground">Defer your payment to be claimed from the asset's future profits after it becomes operational.</span>
              </Label>
            </div>
            <div className="flex items-start space-x-4 rounded-md border p-4">
              <RadioGroupItem value="UpfrontCapital" id="capital" />
              <Label htmlFor="capital" className="flex flex-col gap-1 w-full cursor-pointer">
                <span className="font-bold flex items-center gap-2"><Banknote className="w-4 h-4" /> Upfront Capital</span>
                <span className="text-xs text-muted-foreground">Receive payment for your labor as a wage from the capital raised for the project.</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <Button onClick={handleApply} disabled={!selectedChoice || isApplying}>
          {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm Pledge
        </Button>
      </DialogContent>
    </Dialog>
  );
}


export default function ProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [votes, setVotes] = useState<Vote[]>([]);
  const [proposer, setProposer] = useState<Citizen | null>(null);
  const [isSecondaryLoading, setIsSecondaryLoading] = useState(true);
  const [isCompensationDialogOpen, setIsCompensationDialogOpen] = useState(false);
  const [isPledgeDialogOpen, setIsPledgeDialogOpen] = useState(false);
  const [isPledging, setIsPledging] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [applyingTaskId, setApplyingTaskId] = useState<string | null>(null);

  const proposalRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'proposals', params.id) : null) as unknown as DocumentReference<Proposal> | null,
    [firestore, params.id]
  );
  const { data: proposal, isLoading: isProposalLoading } =
    useDoc<Proposal>(proposalRef as any);

  const tasksQuery = useMemoFirebase(
    () =>
      firestore && proposal
        ? query(
          collection(firestore, 'tasks'),
          where('proposalId', '==', proposal.id)
        ) as unknown as Query<Task>
        : null,
    [firestore, proposal]
  );
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksQuery as any);

  useEffect(() => {
    if (!proposal || !firestore) {
      if (!isProposalLoading) {
        setIsSecondaryLoading(false);
      }
      return;
    }

    const fetchVotesAndProposer = async () => {
      setIsSecondaryLoading(true);
      const votesQuery = query(
        collection(firestore, 'votes'),
        where('proposalId', '==', proposal.id)
      );
      const votesSnapshot = await getDocs(votesQuery);
      const votesData = votesSnapshot.docs.map(
        (d) => ({ ...d.data(), id: d.id } as Vote)
      );
      setVotes(votesData);

      if (proposal.proposerId) {
        const proposerRef = doc(firestore, 'citizens', proposal.proposerId);
        const proposerSnap = await getDoc(proposerRef);
        if (proposerSnap.exists()) {
          setProposer(
            { ...proposerSnap.data(), id: proposerSnap.id } as Citizen
          );
        }
      }
      setIsSecondaryLoading(false);
    };

    fetchVotesAndProposer();
  }, [proposal, firestore, isProposalLoading]);

  const handleVote = (support: boolean) => {
    if (user && !user.isAnonymous) {
      toast({
        title: "Vote Cast!",
        description: `You have voted ${support ? 'FOR' : 'AGAINST'} this proposal.`
      });
    } else {
      window.location.href = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001';
    }
  };

  const handlePledgeCapital = async (amount: number) => {
    if (user && !user.isAnonymous && proposal) {
      setIsPledging(true);
      try {
        const result = await pledgeCapital(proposal.id, user.uid, amount, pathname);
        if (result.success) {
          toast({
            title: 'Pledge Recorded!',
            description: `Your capital pledge of $${amount.toLocaleString()} has been successfully recorded.`,
          });
          setIsPledgeDialogOpen(false);
        } else {
          throw new Error(result.error || 'Failed to record pledge.');
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Pledge Failed',
          description: error.message || 'An unknown error occurred.',
        });
      } finally {
        setIsPledging(false);
      }
    }
  };

  const openCompensationDialog = (task: Task) => {
    if (user && !user.isAnonymous) {
      setCurrentTask(task);
      setIsCompensationDialogOpen(true);
    } else {
      window.location.href = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001';
    }
  };

  const openPledgeDialog = () => {
    if (user && !user.isAnonymous) {
      setIsPledgeDialogOpen(true);
    } else {
      window.location.href = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001';
    }
  };

  const handleApplyForTask = async (compensationChoice: CompensationChoice) => {
    if (user && !user.isAnonymous && currentTask && proposal) {
      setApplyingTaskId(currentTask.id);
      try {
        const result = await applyForTask(currentTask.id, proposal.id, user.uid, compensationChoice, pathname);
        if (result.success) {
          toast({
            title: 'Pledge Recorded!',
            description: `Your sweat equity pledge for "${currentTask.description}" has been recorded.`,
          });
        } else {
          throw new Error(result.error || 'Failed to apply for the task.');
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Application Failed',
          description: error.message || 'An unknown error occurred.',
        });
      } finally {
        setApplyingTaskId(null);
        setCurrentTask(null);
        setIsCompensationDialogOpen(false);
      }
    }
  };


  const totalVotes = votes.length;
  const forVotes = votes.filter((v) => v.support).length;
  const againstVotes = totalVotes - forVotes;
  const forPercentage = totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0;

  const capitalProgress = proposal?.targetEquity ? ((proposal.pledgedCapital || 0) / proposal.targetEquity) * 100 : 0;

  const proposerAvatar = proposer
    ? PlaceHolderImages.find((p) => p.id === `user${proposer.id}`)
    : null;

  const isLoading = isProposalLoading || isSecondaryLoading || areTasksLoading;

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
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
          <Card>
            <CardHeader><Skeleton className="h-7 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
        </div>
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Separator />
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-20 ml-auto mt-1" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-20 ml-auto mt-1" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!proposal) {
    notFound();
  }

  return (
    <>
      <PledgeCapitalDialog
        open={isPledgeDialogOpen}
        onOpenChange={setIsPledgeDialogOpen}
        onPledge={handlePledgeCapital}
        isPledging={isPledging}
        targetEquity={proposal.targetEquity || 0}
        pledgedCapital={proposal.pledgedCapital || 0}
      />
      <CompensationChoiceDialog
        open={isCompensationDialogOpen}
        onOpenChange={setIsCompensationDialogOpen}
        onApply={handleApplyForTask}
        isApplying={!!applyingTaskId}
        currentTask={currentTask}
      />
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                {proposal.status}
              </Badge>
              <CardTitle className="font-headline text-3xl pt-2">
                {proposal.title}
              </CardTitle>
              {proposer && (
                <CardDescription className="flex items-center gap-2 pt-2">
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
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none text-foreground/90">
                <p>{proposal.description}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button {...({ variant: "outline", asChild: true } as any)} disabled={isLoading || !user}>
                <a
                  href={
                    proposal.ipfsCid
                      ? `https://ipfs.io/ipfs/${proposal.ipfsCid}`
                      : '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Full Proposal on IPFS
                </a>
              </Button>
            </CardFooter>
          </Card>

          {proposal.category === 'RWA Acquisition' && tasks && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <Wrench className="w-6 h-6" />
                  Sweat Equity Pledges
                </CardTitle>
                <CardDescription>
                  Pledge your labor to this proposal to earn ownership.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => {
                      const isApplying = applyingTaskId === task.id;
                      const isAssigned = !!task.assigneeId;
                      const canApply = task.status === 'Open' && !isAssigned;
                      return (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.description}</TableCell>
                          <TableCell>
                            <Badge {...({ variant: proposal.status === 'Passed' ? 'default' : 'secondary' } as any)} className={
                              task.status === 'Open'
                                ? 'bg-green-500/10 text-green-700'
                                : task.status === 'In Progress'
                                  ? 'bg-blue-500/10 text-blue-700'
                                  : 'bg-gray-500/10 text-gray-700'
                            }
                            >
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCompensationDialog(task)}
                              disabled={!canApply || isApplying}
                            >
                              {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : isAssigned ? 'Assigned' : 'Apply'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {tasks?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">No tasks defined for this proposal.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

        </div>
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Live Funding Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-primary">Capital Pledged</span>
                  <span className="text-sm text-muted-foreground">
                    ${(proposal.pledgedCapital || 0).toLocaleString()} / ${(proposal.targetEquity || 0).toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={capitalProgress}
                  className="h-3"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-accent">Labor Pledged</span>
                  <span className="text-sm text-muted-foreground">
                    {tasks?.filter(t => t.assigneeId).length || 0} / {tasks?.length || 0} Tasks
                  </span>
                </div>
                <Progress
                  value={tasks ? (tasks.filter(t => t.assigneeId).length / tasks.length) * 100 : 0}
                  className="h-3 [&>div]:bg-accent"
                />
              </div>
              <Separator />
              <Button size="lg" className="w-full" onClick={openPledgeDialog}>
                <DollarSign className="mr-2 h-5 w-5" />
                Pledge Capital
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Cast Your Vote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your Voice is calculated based on your reputation,
                contributions, and quadratic voting principles.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="default"
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 h-12"
                  onClick={() => handleVote(true)}
                >
                  <Check className="mr-2 h-5 w-5" />
                  Vote For
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  className="h-12"
                  onClick={() => handleVote(false)}
                >
                  <X className="mr-2 h-5 w-5" />
                  Vote Against
                </Button>
              </div>
              {user?.isAnonymous && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  Create a Promethean Passport to vote.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Current Vote Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Status</span>
                </div>
                <Badge
                  variant={
                    proposal.status === 'Active' ? 'default' : 'secondary'
                  }
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
                <span className="font-medium">{totalVotes.toLocaleString()}</span>
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
                  <span className="text-sm font-medium text-red-600">
                    Against
                  </span>
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
    </>
  );
}
