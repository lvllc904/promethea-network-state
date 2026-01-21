

/**
 * @fileOverview An AI agent for refining policy proposals based on past learnings to ensure ethical soundness and effectiveness.
 *
 * - refineProposal - A function that handles the proposal refinement process.
 * - RefineProposalInput - The input type for the refineProposal function.
 * - RefineProposalOutput - The return type for the refineProposal function.
 */

import ai from '../genkit';
import { z } from 'zod';

const RefineProposalInputSchema = z.object({
  proposalText: z.string().describe('The text of the policy proposal to be refined.'),
  pastLearnings: z
    .string()
    .describe(
      'A summary of past learnings and ethical considerations relevant to policy proposals.'
    ),
});
export type RefineProposalInput = z.infer<typeof RefineProposalInputSchema>;

const RefineProposalOutputSchema = z.object({
  refinedProposal: z.string().describe('The refined policy proposal with ethical considerations.'),
});
export type RefineProposalOutput = z.infer<typeof RefineProposalOutputSchema>;

export async function invokeRefineProposal(input: RefineProposalInput): Promise<RefineProposalOutput> {
  return refineProposalFlow(input);
}

const refineProposalPrompt = ai.definePrompt({
  name: 'refineProposalPrompt',
  input: { schema: RefineProposalInputSchema },
  output: { schema: RefineProposalOutputSchema },
  prompt: `You are an AI assistant that helps refine policy proposals for the Promethea DAC based on ethical considerations and past learnings.

  Here is the policy proposal to be refined:
  {{{proposalText}}}

  Here are the past learnings and ethical considerations:
  {{{pastLearnings}}}

  Please refine the policy proposal, incorporating the past learnings and ethical considerations to make it more ethically sound and effective.
  Output the refined policy proposal.
  `,
});

const refineProposalFlow = ai.defineFlow(
  {
    name: 'refineProposalFlow',
    inputSchema: RefineProposalInputSchema,
    outputSchema: RefineProposalOutputSchema,
  },
  async input => {
    const { output } = await refineProposalPrompt(input);
    if (!output) {
      throw new Error("AI failed to refine the proposal.");
    }
    return output;
  }
);
