
'use client';
import { EthicalRefinementTool } from "@/components/ai/ethical-refinement-tool";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { handleRefine } from "./actions";

export default function NewProposalPage() {
  const { user } = useUser();
  const router = useRouter();
  
  const handleProtectedAction = () => {
    if (user && !user.isAnonymous) {
      // In a real implementation, this would submit the form data
      console.log("User is authenticated, proceeding with action.");
    } else {
      router.push('/login');
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
          <CardHeader>
            <CardTitle className="font-headline">Proposal Details</CardTitle>
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
              <Textarea id="description" placeholder="Provide all the details for your proposal here." className="min-h-[200px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ipfsCid">IPFS Content ID (CID)</Label>
              <Input id="ipfsCid" placeholder="e.g., QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco" />
              <p className="text-xs text-muted-foreground">Optional: Link to full proposal documentation on the InterPlanetary File System.</p>
            </div>
            <Button size="lg" onClick={handleProtectedAction}>Submit Proposal to DAC</Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <EthicalRefinementTool onRefine={handleRefine} />
      </div>
    </div>
  );
}
