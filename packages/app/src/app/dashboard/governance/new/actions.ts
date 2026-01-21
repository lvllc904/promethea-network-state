'use server';

import type { RefineProposalInput } from '@promethea/lib';

export async function handleRefine(data: RefineProposalInput): Promise<{ refinedProposal: string }> {
  try {
    const Ai = await import('@promethea/ai');
    const result = await Ai.invokeRefineProposal(data);
    if (!result || !result.refinedProposal) {
      throw new Error('Received an invalid response from the AI.');
    }
    return { refinedProposal: result.refinedProposal };
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || 'Could not refine proposal.');
  }
}
