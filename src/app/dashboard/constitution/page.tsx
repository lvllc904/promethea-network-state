
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


const ConstitutionRenderer = ({ content }: { content: string }) => (
    <div className={cn("prose prose-lg max-w-none text-foreground/90 dark:prose-invert prose-headings:font-headline prose-headings:tracking-tight prose-p:leading-relaxed prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl", "prose-numbered pl-14")}>
        {/* In a real scenario, we would use a Markdown renderer here. For now, we'll just display the text. */}
        <p>This page displays the live, canonical version of the Promethean Constitution, fetched directly from Firestore. The content below represents the initial version derived from the whitepaper.</p>
        <hr/>
        {/* A proper markdown renderer would be used here. For simplicity, we are splitting by newlines */}
        {content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
        ))}
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
            {constitution && (
                <p className="text-muted-foreground">Version {constitution.version} - Last Amended: {new Date(constitution.lastAmended).toLocaleDateString()}</p>
            )}
        </div>
        <Card>
            <CardContent className="pt-6">
                {!constitution ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Constitution Not Yet Ratified</AlertTitle>
                      <AlertDescription>
                        The canonical constitution document has not been seeded in the database.
                        This is the next step in our roadmap.
                      </AlertDescription>
                    </Alert>
                ) : (
                    // This will eventually render markdown from constitution.content
                    <ConstitutionRenderer content={constitution.content} />
                )}
            </CardContent>
        </Card>
    </div>
  );
}
