'use client';
export const dynamic = 'force-dynamic';
import { useState } from "react";
import { EthicalRefinementTool } from "@promethea/components";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@promethea/ui";
import { Input } from "@promethea/ui";
import { Label } from "@promethea/ui";
import { Button } from "@promethea/ui";
import { Textarea } from "@promethea/ui";

import { useRouter } from "next/navigation";
import { handleRefine } from "./actions";
import { ProposalWizard } from "@promethea/components";
import { addSovereignData } from "@promethea/hooks";

export default function NewProposalPage() {
  const router = useRouter();

  const onComplete = async (formData: any) => {
    try {
      await addSovereignData('proposals', {
        ...formData,
        proposerId: 'sovereign-citizen-01',
        status: 'Active',
        realityState: 'SIMULATED',
        createdAt: new Date().toISOString(),
        votingEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      router.push('/dashboard/governance');
    } catch (e) {
      console.error(e);
      alert('Failed to submit proposal.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-headline font-bold tracking-tighter">Governance Engine</h1>
        <p className="text-zinc-500 max-w-2xl mt-2">
          Translate your sovereign intent into a verifiable protocol. Use the wizard below to synthesize, simulate, and actualize your proposal.
        </p>
      </div>

      <ProposalWizard 
        onComplete={onComplete}
        onRefine={handleRefine}
      />
    </div>
  );
}
