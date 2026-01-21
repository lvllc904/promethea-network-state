'use client';
export const dynamic = 'force-dynamic';
import { PlaceHolderImages } from '@promethea/lib';
import { Avatar, AvatarFallback, AvatarImage } from '@promethea/ui';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@promethea/ui';
import { Badge } from '@promethea/ui';
import { Separator } from '@promethea/ui';
import { Copy, Star, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@promethea/ui';
import React, { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useDoc, useFirestore, useUser, useMemoFirebase, useCollection } from '@promethea/firebase';
import { doc, collection, query } from 'firebase/firestore';
import { Citizen } from '@promethea/lib';
import { Skeleton } from '@promethea/ui';
import { useToast } from '@promethea/hooks';
import { useLocalProfile } from '@promethea/hooks/use-local-profile';

export default function PassportPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { localProfile } = useLocalProfile();

  const citizenRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'citizens', user.uid) : null),
    [firestore, user]
  );

  const citizensQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'citizens')) : null),
    [firestore]
  );

  const { data: citizen, isLoading: isCitizenLoading } = useDoc<Citizen>(citizenRef as any);
  const { data: citizens } = useCollection<Citizen>(citizensQuery as any);
  const { syncFromPublic } = useLocalProfile();

  // "Dehydration" sync: Public Ledger -> Sovereign Device
  useEffect(() => {
    if (citizen && user && user.uid !== 'anonymous') {
      const did = citizen.decentralizedId;
      syncFromPublic(did, {
        displayName: citizen.displayName,
        governanceTokens: citizen.governanceTokens,
        reputation: citizen.reputationScore,
        createdAt: citizen.createdAt,
      });
    }
  }, [citizen, user, syncFromPublic]);

  const isLoading = isUserLoading || isCitizenLoading;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "Your Decentralized ID has been copied."
    })
  }

  if (isLoading || !citizen || !user) {
    return (
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card className="shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Skeleton className="w-24 h-24 rounded-full mb-4" />
              <Skeleton className="h-7 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-2 mt-4">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="w-12 h-6" />
                <Skeleton className="w-20 h-4" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="h-4 w-40 mb-2" />
                <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
              <Separator />
              <div>
                <Skeleton className="h-4 w-48 mb-2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-32 rounded-full" />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-7 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const displayName = localProfile?.displayName || 'Citizen';
  const userAvatar = PlaceHolderImages.find((p) => p.id === `user${citizen.id.slice(0, 1)}`);
  const userDID = citizen.decentralizedId;

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card className="shadow-lg">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
              {userAvatar && (
                <Image
                  src={userAvatar.imageUrl}
                  alt={displayName}
                  width={96}
                  height={96}
                  data-ai-hint={userAvatar.imageHint}
                />
              )}
              <AvatarFallback className="text-3xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold font-headline">
              {displayName}
            </h2>
            <p className="text-muted-foreground">Founding Member</p>
            <div className="flex items-center gap-2 mt-4">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-xl font-bold">
                {citizen.reputationScore}
              </span>
              <span className="text-sm text-muted-foreground">Reputation</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Promethean Passport
            </CardTitle>
            <CardDescription>
              Your Self-Sovereign Identity in the Network State.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Decentralized Identifier (DID)
              </h3>
              <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
                <code className="text-sm font-mono truncate">{userDID}</code>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(userDID)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Verifiable Credentials
              </h3>
              <div className="flex flex-wrap gap-2">
                {citizen.skills?.map((cred, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-base py-1 px-3 border-primary/50 text-primary-foreground bg-primary/80"
                  >
                    {cred}
                  </Badge>
                ))}
                <Badge
                  variant="secondary"
                  className="text-base py-1 px-3 border-green-500/50 text-green-900 bg-green-500/20"
                >
                  Proof of Uniqueness
                </Badge>
                {citizen.isGovIdVerified ? (
                  <Badge variant="secondary" className="text-base py-1 px-3 border-blue-500/50 text-blue-900 bg-blue-500/20 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Government ID Verified
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-base py-1 px-3 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Government ID Not Verified
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Contribution Score
                </h3>
                <p className="text-2xl font-bold">
                  {citizen.contributionScore}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Personhood Score
                </h3>
                <p className="text-2xl font-bold">{citizen.personhoodScore}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Reputation Score
                </h3>
                <p className="text-2xl font-bold">{citizen.reputationScore}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Member Since
                </h3>
                <p className="text-2xl font-bold">{new Date(citizen.proofOfUniqueness.issuanceDate).getFullYear()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
