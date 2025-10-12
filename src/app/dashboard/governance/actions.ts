'use server';

import {
  refineProposal,
  type RefineProposalInput,
} from '@/ai/flows/ethical-proposal-refinement';

export async function handleRefine(data: RefineProposalInput) {
  try {
    const result = await refineProposal(data);
    return result;
  } catch (error) {
    console.error(error);
    return { refinedProposal: 'Error: Could not refine proposal.' };
  }
}
