'use client';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, MapPin } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { RealWorldAsset } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function RwaManagementPage() {
  const firestore = useFirestore();
  const assetsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'real_world_assets') : null),
    [firestore]
  );
  const { data: assets, isLoading } = useCollection<RealWorldAsset>(assetsQuery);

  if (isLoading) {
    return (
        <div className="flex flex-col gap-4">
        <div>
            <h1 className="text-3xl font-headline font-bold">RWA Management</h1>
            <p className="text-muted-foreground">Browse and manage the globally distributed assets of the Promethean Archipelago.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-headline font-bold">RWA Management</h1>
        <p className="text-muted-foreground">
          Browse and manage the globally distributed assets of the Promethean
          Archipelago.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assets?.map((asset) => {
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
                  {asset.location}
                </CardDescription>

                <p className="text-sm text-muted-foreground mt-4 flex-grow line-clamp-2">
                  {asset.description}
                </p>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {(asset.tokenIds?.length || 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">TOKENS</span>
                </div>

                <Button asChild className="w-full mt-4">
                  <Link href={`/dashboard/assets/${asset.id}`}>
                    Manage Asset
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
