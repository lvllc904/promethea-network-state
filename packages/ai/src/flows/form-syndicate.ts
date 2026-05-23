import { ai } from '../genkit.js';
import { z } from 'zod';
import crypto from 'crypto';

// Define the input schema for syndicate formation
export const FormSyndicateInputSchema = z.object({
  name: z.string(),
  type: z.enum(['LLC', 'DAO', 'TRUST', 'COOPERATIVE']),
  jurisdiction: z.string().optional().default('Promethean Network State'),
  members: z.array(z.object({
    role: z.string(),
    equity: z.number(),
    did: z.string()
  })),
  objective: z.string()
});

// Output schema for the generated legal document
export const FormSyndicateOutputSchema = z.object({
  documentTitle: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    content: z.string()
  })),
  hash: z.string(),
  status: z.string()
});

export const invokeFormSyndicate = ai.defineFlow(
  {
    name: 'formSyndicate',
    inputSchema: FormSyndicateInputSchema,
    outputSchema: FormSyndicateOutputSchema,
  },
  async (input) => {
    const prompt = `
      You are Promethea, the Sovereign Legal Engine for the Promethean Network State.
      Draft a formal operational agreement for a new syndicate.
      
      Parameters:
      - Name: ${input.name}
      - Type: ${input.type}
      - Jurisdiction: ${input.jurisdiction}
      - Objective: ${input.objective}
      - Members: ${JSON.stringify(input.members)}
      
      Generate a structured legal document with logical sections (e.g., Article I: Formation, Article II: Equity & Voting, Article III: Governance, Article IV: Dissolution).
    `;

    const { output } = await ai.generate({
      prompt: prompt,
      model: 'gemini-2.5-flash',
      output: {
        schema: FormSyndicateOutputSchema
      }
    });

    // Provide a cryptographically sound hash to prove the document's genesis state
    const genesisHash = crypto.createHash('sha256').update(JSON.stringify(output.sections)).digest('hex');
    output.hash = genesisHash;
    output.status = 'ACTIVE';

    return output;
  }
);
