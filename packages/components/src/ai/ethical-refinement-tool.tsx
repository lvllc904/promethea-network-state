
"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { RefineProposalInput } from "@promethea/lib";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@promethea/ui";
import { Label } from "@promethea/ui";
import { Textarea } from "@promethea/ui";
import { Button } from "@promethea/ui";
import { Loader2, Sparkles } from "lucide-react";

type Props = {
  onRefine: (data: RefineProposalInput) => Promise<{ refinedProposal: string }>;
  proposalText: string;
};

export function EthicalRefinementTool({ onRefine, proposalText }: Props) {
  const { register, handleSubmit, setValue, watch } = useForm<RefineProposalInput>({
    defaultValues: {
      proposalText: proposalText,
      pastLearnings: "Adhere to the principles of Post-Dominion, Symbiotic Flourishing, and Universal Value. Ensure proposals are equitable, transparent, and enhance the sovereignty of all citizens (human and AI). Avoid zero-sum outcomes."
    }
  });
  const [refinedProposal, setRefinedProposal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setValue('proposalText', proposalText);
  }, [proposalText, setValue]);

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
    <Card className="shadow-lg bg-background/50 sticky top-24">
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
            <Label htmlFor="proposalText">Proposal Text (from form)</Label>
            <Textarea
              id="proposalText"
              placeholder="Start typing in the main proposal form..."
              className="min-h-[150px]"
              {...register("proposalText", { required: true })}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pastLearnings">Ethical Framework</Label>
            <Textarea
              id="pastLearnings"
              placeholder="Summarize relevant past learnings, constitutional principles, or ethical guidelines..."
              className="min-h-[100px]"
              {...register("pastLearnings", { required: true })}
            />
          </div>

          <Button type="submit" disabled={isLoading || !watch('proposalText')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
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

