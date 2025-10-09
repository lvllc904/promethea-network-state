"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { RefineProposalInput } from "@/ai/flows/ethical-proposal-refinement";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

type Props = {
  onRefine: (data: RefineProposalInput) => Promise<{ refinedProposal: string }>;
};

export function EthicalRefinementTool({ onRefine }: Props) {
  const { register, handleSubmit, watch } = useForm<RefineProposalInput>();
  const [refinedProposal, setRefinedProposal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<RefineProposalInput> = async (data) => {
    setIsLoading(true);
    setRefinedProposal("");
    try {
      const result = await onRefine(data);
      setRefinedProposal(result.refinedProposal);
    } catch (error) {
      console.error("Error refining proposal:", error);
      // Here you could use the toast component to show an error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg bg-background/50">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" />
          Symbiotic Refinement
        </CardTitle>
        <CardDescription>
          Use the AI ethical assistance tool to refine your proposal based on past learnings and community values.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="proposalText">Proposal Text</Label>
            <Textarea
              id="proposalText"
              placeholder="Enter the full text of your policy proposal here..."
              className="min-h-[150px]"
              {...register("proposalText", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pastLearnings">Past Learnings & Ethical Considerations</Label>
            <Textarea
              id="pastLearnings"
              placeholder="Summarize relevant past learnings, constitutional principles, or ethical guidelines..."
              className="min-h-[100px]"
              {...register("pastLearnings", { required: true })}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refining...
              </>
            ) : (
              "Refine with AI"
            )}
          </Button>
        </form>

        {(isLoading || refinedProposal) && (
          <div className="mt-6 space-y-2">
            <Label>AI-Refined Proposal</Label>
            <div className="rounded-md border bg-muted p-4 min-h-[150px] whitespace-pre-wrap">
              {isLoading ? (
                 <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>AI is thinking...</span>
                </div>
              ) : (
                <p>{refinedProposal}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
