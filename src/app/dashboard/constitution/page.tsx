
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Constitution } from '@/lib/types';
import { doc } from 'firebase/firestore';
import React from 'react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { WhitepaperContent } from '@/app/whitepaper/content';


const ConstitutionRenderer = ({ content }: { content: React.ReactNode }) => (
    <div className={cn("prose prose-lg max-w-none text-foreground/90 dark:prose-invert prose-headings:font-headline prose-headings:tracking-tight prose-p:leading-relaxed prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl", "prose-numbered pl-14")}>
        <p>This page displays the live, canonical version of the Promethean Constitution. The content below represents the initial version derived from the whitepaper, ready for debate and amendment.</p>
        <hr/>
        {content}
    </div>
);


export default function ConstitutionPage() {
    const firestore = useFirestore();

    const constitutionRef = useMemoFirebase(
        () => (firestore ? doc(firestore, 'constitutions', 'canon') : null),
        [firestore]
    );

    const { data: constitution, isLoading } = useDoc<Constitution>(constitutionRef);


  if (isLoading) {
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
            {constitution ? (
                <p className="text-muted-foreground">Version {constitution.version} - Last Amended: {new Date(constitution.lastAmended).toLocaleDateString()}</p>
            ) : (
                <p className="text-muted-foreground">Version 1.0.0 - Awaiting Ratification</p>
            )}
        </div>
        <Card>
            <CardContent className="pt-6">
                {/* 
                  Once the constitution is seeded in Firestore, the `constitution.content` will be used.
                  For now, we display the content directly from the component to visualize it.
                */}
                <ConstitutionRenderer content={<WhitepaperContent />} />

                {/* This alert can be re-enabled later if we need to show a message about seeding */}
                {/*!constitution && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Constitution Not Yet Ratified</AlertTitle>
                      <AlertDescription>
                        The canonical constitution document has not been seeded in the database.
                        This is the next step in our roadmap.
                      </AlertDescription>
                    </Alert>
                )*/}
            </CardContent>
        </Card>
    </div>
  );
}
