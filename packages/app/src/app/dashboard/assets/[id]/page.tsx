'use client';
export const dynamic = 'force-dynamic';
import { notFound, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@promethea/lib';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
import { Button } from '@promethea/ui';
import { DollarSign, MapPin, Wrench, PieChart, Briefcase, Star, Users, Loader2 } from 'lucide-react';
import { TaskAllocationTool } from '@promethea/components';
import { useDoc, useCollection, useMemoFirebase, useUser, useFirestore } from '@promethea/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { RealWorldAsset, Task, UniversalValueToken } from '@promethea/lib';
import { Skeleton } from '@promethea/ui';
import { handleAllocate, applyForTask } from './actions';
import { Pie, Cell, ResponsiveContainer, PieChart as RechartsPieChart } from 'recharts';
import { type DocumentReference, type Query } from 'firebase/firestore';
import { Avatar, AvatarFallback } from '@promethea/ui';
import { useToast } from '@promethea/hooks';
import { useState, useMemo } from 'react';

const COLORS = {
  Labor: 'hsl(var(--chart-1))',
  Capital: 'hsl(var(--chart-2))',
  Reputation: 'hsl(var(--chart-3))'
};

const chartConfig = {
  uvt: {
    label: "UVT",
  },
  Labor: {
    label: "Labor",
    color: "hsl(var(--chart-1))",
  },
  Capital: {
    label: "Capital",
    color: "hsl(var(--chart-2))",
  },
  Reputation: {
    label: "Reputation",
    color: "hsl(var(--chart-3))",
  },
}

export default function AssetDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [applyingTaskId, setApplyingTaskId] = useState<string | null>(null);

  const assetRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'real_world_assets', params.id) : null) as DocumentReference<RealWorldAsset> | null,
    [firestore, params.id]
  );
  const { data: asset, isLoading: isAssetLoading } = useDoc<RealWorldAsset>(assetRef as any);

  const tasksQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
          collection(firestore, 'tasks'),
          where('assetId', '==', params.id)
        ) as Query<Task>
        : null,
    [firestore, params.id]
  );
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksQuery as any);

  const uvtQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
          collection(firestore, 'universal_value_tokens'),
          where('assetId', '==', params.id)
        ) as Query<UniversalValueToken>
        : null,
    [firestore, params.id]
  );
  const { data: uvts, isLoading: areUvtsLoading } = useCollection<UniversalValueToken>(uvtQuery as any);

  const handleApplyForTask = async (taskId: string) => {
    if (user && !user.isAnonymous) {
      setApplyingTaskId(taskId);
      try {
        if (asset) {
          const result = await applyForTask(taskId, params.id, user.uid, 'SweatEquity', pathname);
          if (result.success) {
            toast({
              title: "Task Assigned!",
              description: "You have successfully applied for the task. It is now assigned to you.",
            });
          } else {
            throw new Error(result.error || "Failed to apply for the task.");
          }
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: "Application Failed",
          description: error.message || "An unknown error occurred.",
        });
      } finally {
        setApplyingTaskId(null);
      }
    } else {
      window.location.href = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001';
    }
  };

  const tokenDistribution = useMemo(() => {
    if (!uvts) return [];
    const distribution = uvts.reduce((acc, token) => {
      const existing = acc.find(item => item.name === token.tokenType);
      if (existing) {
        existing.value += token.amount;
      } else {
        acc.push({ name: token.tokenType, value: token.amount });
      }
      return acc;
    }, [] as { name: string, value: number }[]);
    return distribution;
  }, [uvts]);

  const isLoading = isAssetLoading || areUvtsLoading || areTasksLoading;

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <Skeleton className="h-64 w-full" />
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3 mt-2" />
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
                <div>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1 space-y-8">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (!asset) {
    notFound();
  }

  const assetImage = PlaceHolderImages.find(
    (p) => p.id === `asset${asset.id}`
  );

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        <Card className="shadow-lg overflow-hidden">
          {assetImage && (
            <div className="relative h-64 w-full">
              <Image
                src={assetImage.imageUrl}
                alt={asset.name}
                fill
                className="object-cover"
                data-ai-hint={assetImage.imageHint}
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="font-headline text-3xl">
              {asset.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 pt-1">
              <MapPin className="w-4 h-4" /> {asset.location}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-foreground/80">{asset.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Total Value
                </h3>
                <p className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {asset.value.toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Asset Type
                </h3>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {asset.assetType}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Users className="w-6 h-6" />
              Capitalization Table
            </CardTitle>
            <CardDescription>
              A transparent record of all token holders for this asset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Citizen</TableHead>
                  <TableHead>Token Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uvts?.map(token => (
                  <TableRow key={token.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{token.ownerId.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-mono text-xs">{token.ownerId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        token.tokenType === 'Labor' ? 'default' :
                          token.tokenType === 'Capital' ? 'secondary' :
                            'outline'
                      }>{token.tokenType}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">{token.amount.toLocaleString()} UVT</TableCell>
                  </TableRow>
                ))}
                {uvts?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No token holders yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>


        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Wrench className="w-6 h-6" />
              Sweat Equity Tasks
            </CardTitle>
            <CardDescription>
              Contribute labor to earn ownership in this asset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Due Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks && tasks.map((task) => {
                  const isApplying = applyingTaskId === task.id;
                  const isAssigned = !!task.assigneeId;
                  const canApply = task.status === 'Open' && !isAssigned;
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.description}</TableCell>
                      <TableCell>
                        <Badge
                          {...({ variant: task.status === 'Open' ? 'default' : 'secondary' } as any)}
                          className={
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
                      <TableCell className="text-right font-mono">{task.dueDate}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          {...({ variant: "outline", size: "sm" } as any)}
                          onClick={() => handleApplyForTask(task.id)}
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
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No tasks available for this asset yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {user?.isAnonymous && (
              <p className="text-xs text-center text-muted-foreground pt-4">Create a Promethean Passport to apply for tasks.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <PieChart className="w-6 h-6" />
              Token Distribution
            </CardTitle>
            <CardDescription>Universal Value Token (UVT) allocation for this asset.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
              <RechartsPieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie data={tokenDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {tokenDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ChartContainer>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" style={{ color: COLORS['Labor'] }} /> Labor</span>
                <span className="font-medium">
                  {tokenDistribution.find(d => d.name === 'Labor')?.value?.toLocaleString() || 0} UVT
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" style={{ color: COLORS['Capital'] }} /> Capital</span>
                <span className="font-medium">
                  {tokenDistribution.find(d => d.name === 'Capital')?.value?.toLocaleString() || 0} UVT
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Star className="w-4 h-4" style={{ color: COLORS['Reputation'] }} /> Reputation</span>
                <span className="font-medium">
                  {tokenDistribution.find(d => d.name === 'Reputation')?.value?.toLocaleString() || 0} UVT
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <TaskAllocationTool onAllocate={async (data) => {
          const result = await handleAllocate(data);
          if ('error' in result) {
            return { suggestedMembers: [] };
          }
          return result as { suggestedMembers: string[] };
        }} />
      </div>
    </div>
  );
}
