
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Constitution } from '@/lib/types';
import { doc } from 'firebase/firestore';
import React from 'react';
import { cn } from '@/lib/utils';

// This is a temporary copy from the whitepaper content.
// In the next step, this will be replaced by live data from Firestore.
const WhitepaperContent = () => (
    <div className={cn("prose prose-lg max-w-none text-foreground/90 dark:prose-invert prose-headings:font-headline prose-headings:tracking-tight prose-p:leading-relaxed prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl", "prose-numbered pl-14")}>
        <p>This page will display the live, canonical version of the Promethean Constitution, fetched directly from Firestore. The content below is a placeholder representing the initial version derived from the whitepaper.</p>
        <p>Future changes to the constitution will be made through governance proposals and will be automatically reflected here upon ratification.</p>
        <hr/>
        <h2>Part I: The Vision - A New Social Contract for All</h2>
        <h3>1.1. The Moral Imperative: The End of Dominion</h3>
        <p>Our mission is to create a clear path to wealth for those with no money, no assets, and no plan...</p>
    </div>
);


export default function ConstitutionPage() {
    const firestore = useFirestore();

    // In a real implementation, we would fetch the 'canon' document.
    const constitutionRef = useMemoFirebase(
        () => (firestore ? doc(firestore, 'constitutions', 'canon') : null),
        [firestore]
    );

    // For now, we will just simulate the loading state and show placeholder content.
    // const { data: constitution, isLoading } = useDoc<Constitution>(constitutionRef);
    const isLoading = true;
    const constitution = null;


  if (isLoading || !constitution) {
    return (
      <div>
        <div className="mb-4">
            <h1 className="text-3xl font-headline font-bold">The Promethean Constitution</h1>
            <p className="text-muted-foreground">The living, foundational document of the Network State, evolving with its citizens.</p>
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <br/>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div>
        <div className="mb-4">
            <h1 className="text-3xl font-headline font-bold">The Promethean Constitution</h1>
            <p className="text-muted-foreground">Version {constitution.version} - Last Amended: {new Date(constitution.lastAmended).toLocaleDateString()}</p>
        </div>
        <Card>
            <CardContent className="pt-6">
                 {/* This will eventually render markdown from constitution.content */}
                <WhitepaperContent />
            </CardContent>
        </Card>
    </div>
  );
}
