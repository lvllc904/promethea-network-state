'use client';
export const dynamic = 'force-dynamic';
import { useState } from "react";
import { EthicalRefinementTool } from "@promethea/components";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@promethea/ui";
import { Input } from "@promethea/ui";
import { Label } from "@promethea/ui";
import { Button } from "@promethea/ui";
import { Textarea } from "@promethea/ui";
import { useUser } from "@promethea/firebase";
import { useRouter } from "next/navigation";
import { handleRefine } from "./actions";

export default function NewProposalPage() {
  const { user } = useUser();
  const router = useRouter();
  const [description, setDescription] = useState('');

  const handleProtectedAction = () => {
    if (user && !user.isAnonymous) {
      // In a real implementation, this would submit the form data
      console.log("User is authenticated, proceeding with action.");
    } else {
      window.location.href = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001';
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold">Create New Proposal</h1>
          <p className="text-muted-foreground">Draft and submit a new proposal to the Promethean DAC. All ideas are welcome and will be judged on their merit.</p>
        </div>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline">Proposal Details</CardTitle>
            {user?.isAnonymous && (
              <Button asChild variant="outline" size="sm" className="bg-transparent text-white border-white hover:bg-white hover:text-black">
                <a href={process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3001"}>Sign In</a>
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="A concise and descriptive title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="e.g., RWA Acquisition, Governance, Technology" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                placeholder="Provide all the details for your proposal here."
                className="min-h-[200px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ipfsCid">IPFS Content ID (CID)</Label>
              <Input id="ipfsCid" placeholder="e.g., QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco" />
              <p className="text-xs text-muted-foreground">Optional: Link to full proposal documentation on the InterPlanetary File System.</p>
            </div>
            <Button size="lg" onClick={handleProtectedAction}>Submit Proposal to DAC</Button>
            {user?.isAnonymous && (
              <p className="text-xs text-center text-muted-foreground pt-2">Create a Promethean Passport to submit a proposal.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <EthicalRefinementTool onRefine={handleRefine} proposalText={description} />
      </div>
    </div>
  );
}
