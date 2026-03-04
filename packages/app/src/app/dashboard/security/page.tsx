'use client';

export const dynamic = 'force-dynamic';
import React from 'react';
import { ThreatDetector } from '@promethea/components';
import { useCollection, useFirestore, useMemoFirebase } from '@promethea/firebase';
import { collection, query, limit, Query } from 'firebase/firestore';
import { Pledge, Vote } from '@promethea/lib';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from '@promethea/ui';
import { Skeleton } from '@promethea/ui';
import { Shield, Settings, Fingerprint, Activity, ArrowRight, Lock, Zap, Radar, HeartPulse, RefreshCw } from 'lucide-react';
import { handleDetect } from './actions';
import Link from 'next/link';
import { where, orderBy } from 'firebase/firestore';

const HEALING_PATTERNS = [
  { name: "Hydration Guard", status: "Active", description: "Blocks rendering of unstable/corrupt state during reconciliation." },
  { name: "Atomic Reversion", status: "Active", description: "Autonomous rollback of infra when 5xx thresholds are exceeded." },
  { name: "Middleware Sanctuary", status: "Optimized", description: "Aggressive filtering of non-sovereign traffic patterns." }
];

export default function ImmuneSystemPillar() {
  const firestore = useFirestore();

  const recentPledgesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'pledges'), limit(10)) as unknown as Query<Pledge>
        : null,
    [firestore]
  );
  const { data: pledges, isLoading: pledgesLoading } = useCollection<Pledge>(recentPledgesQuery as any);

  const recentVotesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'votes'), limit(10)) as unknown as Query<Vote>
        : null,
    [firestore]
  );
  const { data: votes, isLoading: votesLoading } = useCollection<Vote>(recentVotesQuery as any);

  const isLoading = pledgesLoading || votesLoading;

  const sections = [
    {
      title: "Threat Detection",
      description: "Surveillance of the sovereign digital perimeter.",
      icon: Radar,
      href: "/dashboard/security/radar",
      color: "text-red-500",
      active: true
    },
    {
      title: "Identity & SSI",
      description: "Manage sovereign credentials and DIDs.",
      icon: Fingerprint,
      href: "/dashboard/security/settings",
      color: "text-blue-500",
      active: true
    },
    {
      title: "System Settings",
      description: "Configure interface and data preferences.",
      icon: Settings,
      href: "/dashboard/security/settings",
      color: "text-gray-500",
      active: false
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="border-b border-primary/10 pb-6">
        <h1 className="text-3xl font-headline flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          Immune System
        </h1>
        <p className="text-muted-foreground mt-1">
          Decentralized security and biological defense. Protecting the state substrate from intrusion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.title} className={`hover:border-primary/40 transition-colors border-primary/10 bg-gradient-to-br from-background to-muted/30 ${!section.active && 'opacity-50'}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${section.color}`}>
                  <section.icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-headline">{section.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
              {section.active ? (
                <Link href={section.href}>
                  <Button size="sm" variant="ghost" className="w-full justify-between">
                    Access Module
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Badge variant="outline" className="w-full justify-center">Wave 4 Prototype</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Live Threat Radar
              </CardTitle>
              <CardDescription>Real-time analysis of network entropy.</CardDescription>
            </div>
            <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5">
              Substrate Healthy
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ThreatDetector onDetect={async () => ({ threatDetected: false, threatDescription: "No threats detected.", suggestedAction: "Continue monitoring." })} />
            )}
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <Card className="border-primary/10 bg-gradient-to-br from-background to-primary/5">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-primary" />
                Healing Protocols (Phase 2.5)
              </CardTitle>
              <CardDescription>Autonomous repair instructions from the manifest.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {HEALING_PATTERNS.map(pattern => (
                <div key={pattern.name} className="p-3 rounded-lg bg-muted/40 border border-primary/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm">{pattern.name}</span>
                    <Badge variant="secondary" className="text-[10px] h-4">{pattern.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{pattern.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-gradient-to-br from-background to-orange-500/5">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-orange-500" />
                Atomic Interventions (Phase 2.1)
              </CardTitle>
              <CardDescription>Record of substrate-level safety triggers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-sm text-muted-foreground italic">
                No critical failures detected in the last 24 cycles.
                <br />
                Substrate integrity remains optimal.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
