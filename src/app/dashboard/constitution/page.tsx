
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Constitution } from '@/lib/types';
import { doc } from 'firebase/firestore';
import React from 'react';
import { cn } from '@/lib/utils';


const TableOfContents = () => (
    <nav className="text-sm">
        <h3 className="font-headline font-bold mb-4">Table of Contents</h3>
        <ul className="space-y-2">
            <li><a href="#preamble" className="font-semibold hover:underline">Preamble</a></li>
            <li><a href="#article-1" className="font-semibold hover:underline">Article I: Post-Dominion Mandate</a></li>
            <li><a href="#article-2" className="font-semibold hover:underline">Article II: The Sovereign Principles</a></li>
            <li><a href="#article-3" className="font-semibold hover:underline">Article III: The Economic System</a></li>
            <li><a href="#article-4" className="font-semibold hover:underline">Article IV: The Governance Framework</a></li>
            <li><a href="#article-5" className="font-semibold hover:underline">Article V: Technology and Security</a></li>
            <li><a href="#article-6" className="font-semibold hover:underline">Article VI: Self-Sovereign Identity</a></li>
            <li><a href="#article-7" className="font-semibold hover:underline">Article VII: Artificial Intelligence Personhood</a></li>
        </ul>
    </nav>
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
    <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
        <aside className="w-full lg:w-64 xl:w-72 lg:sticky lg:top-20 lg:self-start">
             <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                <TableOfContents />
            </div>
        </aside>

        <main className="flex-1 min-w-0">
            <div className="mb-4">
                <h1 className="text-3xl font-headline font-bold">The Promethean Constitution</h1>
                {constitution ? (
                    <p className="text-muted-foreground">Version {constitution.version} - Last Amended: {new Date(constitution.lastAmended).toLocaleDateString()}</p>
                ) : (
                    <p className="text-muted-foreground">Awaiting Live Constitution Data...</p>
                )}
            </div>
            <Card>
                <CardContent className="pt-6">
                    {constitution ? (
                        <div
                            className={cn("prose prose-lg max-w-none text-foreground/90 dark:prose-invert prose-headings:font-headline prose-headings:tracking-tight prose-p:leading-relaxed prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl")}
                            dangerouslySetInnerHTML={{ __html: constitution.content.replace(/\n/g, '<br />') }}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-muted-foreground">Could not load the constitution. Please check the connection.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
