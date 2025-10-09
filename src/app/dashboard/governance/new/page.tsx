import { EthicalRefinementTool } from "@/components/ai/ethical-refinement-tool";
import { refineProposal, type RefineProposalInput } from "@/ai/flows/ethical-proposal-refinement";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

async function handleRefine(data: RefineProposalInput) {
  "use server";
  try {
    const result = await refineProposal(data);
    return result;
  } catch (error) {
    console.error(error);
    return { refinedProposal: "Error: Could not refine proposal." };
  }
}

export default function NewProposalPage() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold">Create New Proposal</h1>
          <p className="text-muted-foreground">Draft and submit a new proposal to the Promethean DAC.</p>
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
            <Button size="lg">Submit Proposal to DAC</Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <EthicalRefinementTool onRefine={handleRefine} />
      </div>
    </div>
  );
}
