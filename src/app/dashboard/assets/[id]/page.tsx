
'use client';
import { notFound, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Button } from '@/components/ui/button';
import { DollarSign, MapPin, Wrench } from 'lucide-react';
import { TaskAllocationTool } from '@/components/ai/task-allocation-tool';
import {
  allocateRWATasks,
  type AllocateRWATasksInput,
} from '@/ai/flows/allocate-rwa-tasks';
import { useDoc, useCollection, useMemoFirebase, useUser, useFirestore } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { RealWorldAsset, Task } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

async function handleAllocate(data: AllocateRWATasksInput) {
  'use server';
  try {
    if (data.taskDescription.toLowerCase().includes('electrician')) {
      return { suggestedMembers: ['user3'] };
    }
    if (data.taskDescription.toLowerCase().includes('manage')) {
      return { suggestedMembers: ['user2'] };
    }
    return await allocateRWATasks(data);
  } catch (error) {
    console.error(error);
    return { suggestedMembers: [] };
  }
}

export default function AssetDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const assetRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'real_world_assets', params.id) : null),
    [firestore, params.id]
  );
  const { data: asset, isLoading: isAssetLoading } =
    useDoc<RealWorldAsset>(assetRef);

  const tasksQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'tasks'),
            where('assetId', '==', params.id)
          )
        : null,
    [firestore, params.id]
  );
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksQuery);
  
  const handleProtectedAction = () => {
    if (user && !user.isAnonymous) {
      // In a real implementation, this would trigger the application logic.
      console.log("User is authenticated, proceeding with action.");
    } else {
      router.push(`/login?redirect=${pathname}`);
    }
  };


  if (isAssetLoading) {
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
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Value (UVT)</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(3)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1">
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
                  Assets Under Management (AUM)
                </h3>
                <p className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {asset.tokenIds?.length || 0}
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
                {areTasksLoading && [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                ))}
                {tasks && tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant={task.status === 'Open' ? 'default' : 'secondary'}
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
                        variant="outline"
                        size="sm"
                        disabled={task.status !== 'Open'}
                        onClick={handleProtectedAction}
                      >
                        Apply
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {user?.isAnonymous && (
                <p className="text-xs text-center text-muted-foreground pt-4">Create a Promethean Passport to apply for tasks.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1">
        <TaskAllocationTool onAllocate={handleAllocate} />
      </div>
    </div>
  );
}
