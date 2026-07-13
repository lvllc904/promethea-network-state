'use client';

export const dynamic = 'force-dynamic';

import { PlaceHolderImages } from '@promethea/lib';
import { Avatar, AvatarFallback } from '@promethea/ui';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@promethea/ui';
import { Badge } from '@promethea/ui';
import { Separator } from '@promethea/ui';
import { Copy, Star, ShieldCheck, ShieldAlert, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@promethea/ui';
import React, { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useDoc, useFirestore, useUser, useSovereignMemo, useCollection, doc, collection, query, where, type Query, type DocumentReference } from '@promethea/sovereign-store';
import { Citizen, UniversalValueToken } from '@promethea/lib';
import { Skeleton } from '@promethea/ui';
import { RealityBadge } from '@promethea/components';
import { useToast } from '@promethea/hooks';
import { useLocalProfile } from '@promethea/hooks/use-local-profile';
import { useSolanaCitizen } from '@promethea/hooks';

export default function PassportPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { localProfile } = useLocalProfile();
  const [uvtBalance, setUvtBalance] = React.useState<number | null>(null);
  
  const { walletAddress, solBalance, signMessage } = useSolanaCitizen();
  const [signatureResult, setSignatureResult] = React.useState<string | null>(null);

  const handleSignGenesis = async () => {
    const signature = await signMessage("I confirm my sovereign identity within the Promethean Network State.");
    if (signature) {
      setSignatureResult(signature);
      toast({
        title: "Signature Successful",
        description: "Your sovereign vault has cryptographically signed the message."
      });
    }
  };

  const citizenRef = useSovereignMemo(
    () => (firestore && user && user.uid !== 'anonymous' ? doc(firestore, 'citizens', user.uid) : null) as DocumentReference<Citizen> | null,
    [firestore, user]
  );
  const { data: citizen, isLoading: isCitizenLoading } = useDoc<Citizen>(citizenRef as any);

  const uvtQuery = useSovereignMemo(
    () => (firestore && user && user.uid !== 'anonymous' ? query(collection(firestore, 'universal_value_tokens'), where('ownerId', '==', user.uid)) : null) as unknown as Query<UniversalValueToken> | null,
    [firestore, user]
  );
  const { data: laborCredits } = useCollection(uvtQuery as any);

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

    const c = citizen as any;
    if (c?.solanaAddress) {
      fetch(`/api/uvt?address=${c.solanaAddress}`)
        .then(res => res.json())
        .then(data => {
          if (data.balance !== undefined) setUvtBalance(data.balance);
        })
        .catch(err => console.error('Failed to fetch user UVT balance:', err));
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
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const displayName = localProfile?.displayName || citizen.displayName || 'Citizen';
  const userAvatar = PlaceHolderImages.find((p) => p.id === `user${citizen.id.slice(0, 1)}`);

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card className="shadow-lg">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
              <AvatarFallback className="text-3xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold font-headline">
              {displayName}
            </h2>
            <p className="text-muted-foreground">Founding Member</p>
            <div className="flex flex-col items-center gap-2 mt-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-xl font-bold text-amber-500">
                  {citizen.reputationScore}
                </span>
                <span className="text-sm text-muted-foreground">Reputation</span>
              </div>
              <RealityBadge state="SIMULATED" size="sm" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2 space-y-8">
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
                <code className="text-sm font-mono truncate">{user.did}</code>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(user.did || '')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Sovereign Vault Address (Solana)
              </h3>
              <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3 mb-2">
                <code className="text-sm font-mono truncate">{walletAddress || "Provisioning..."}</code>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(walletAddress || '')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                 <p className="text-sm font-medium">Network Balance (SOL)</p>
                 <p className="font-mono text-lg font-bold">{solBalance !== null ? `${solBalance.toFixed(4)} SOL` : "..."}</p>
              </div>
              <div className="mt-4">
                 <Button onClick={handleSignGenesis} variant="outline" className="w-full bg-primary/10 hover:bg-primary/20">
                   Sign Genesis Protocol Message
                 </Button>
                 {signatureResult && (
                   <div className="mt-2 p-2 bg-muted rounded border border-primary/20">
                     <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Cryptographic Signature</p>
                     <p className="text-xs font-mono text-green-500 break-all">
                       {signatureResult}
                     </p>
                   </div>
                 )}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Sovereign Assets (UVT)
                </h3>
                <RealityBadge state={uvtBalance !== null ? 'ACTUALIZED' : 'SIMULATED'} />
              </div>
              <div className="rounded-xl bg-primary/10 p-6 flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold font-mono">
                    {uvtBalance !== null ? uvtBalance.toLocaleString() : <Skeleton className="h-10 w-24" />}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Universal Value Tokens</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <RealityBadge state={uvtBalance !== null ? 'ACTUALIZED' : 'SIMULATED'} showLabel={true} />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Labor Validation (Phase 4.2)
              </h3>
              <div className="space-y-3">
                {laborCredits && laborCredits.length > 0 ? (
                  laborCredits.map((credit: any) => (
                    <div key={credit.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-primary/10">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm font-semibold">{credit.description || credit.assetId}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {credit.onChainStatus === 'Settled' ? 'SETTLED' : 'PENDING ACTUALIZATION'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono">{credit.amount.toFixed(2)} UVT</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No labor credits minted yet. Contribute to the engine to earn UVT.</p>
                )}
              </div>
            </div>


            <Separator />

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Hybrid Compensation Strategy (Phase 4.1)
                </h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Sovereign Configuration
                </Badge>
              </div>
              <div className="bg-muted/30 border border-primary/5 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Liquid Capital (SOL/USDC)</span>
                  <span className="text-sm font-mono font-bold text-primary">{citizen.preferredHybridSplit?.capital || 50}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="bg-primary h-full transition-all duration-500 ease-out"
                    style={{ width: `${citizen.preferredHybridSplit?.capital || 50}%` }}
                  />
                  <div
                    className="bg-orange-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${citizen.preferredHybridSplit?.equity || 50}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Sovereign Equity (UVT)</span>
                  <span className="text-sm font-mono font-bold text-orange-500">{citizen.preferredHybridSplit?.equity || 50}%</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 text-[10px]" disabled>
                    Optimize for Yield
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-[10px]" disabled>
                    Maximize Sovereignty
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-[10px]">
                    Modify Split
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 italic">
                * Compensation is calculated per labor-unit and settled on-chain according to your sovereign preferences.
              </p>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">Sovereign Device Sync</h3>
                <p className="text-xs text-muted-foreground">Encrypted backup via Phase 2.4 CryptoVault.</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCcw className="w-4 h-4" />
                Sync Node
              </Button>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  Contribution Score
                  <RealityBadge state="SIMULATED" size="sm" showLabel={false} />
                </CardTitle>
                <p className="text-2xl font-bold text-amber-500">
                  {citizen.contributionScore}
                </p>
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  Personhood Score
                  <RealityBadge state="SIMULATED" size="sm" showLabel={false} />
                </CardTitle>
                <p className="text-2xl font-bold text-amber-500">{citizen.personhoodScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
