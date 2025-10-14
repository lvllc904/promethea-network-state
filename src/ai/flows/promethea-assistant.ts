
'use server';

/**
 * @fileOverview Defines the core AI assistant for the Promethea Network State.
 *
 * This file sets up a Genkit flow that acts as a resident AI, "Promethea."
 * Users can interact with it to ask questions and eventually perform actions.
 * Initially, it is equipped with a tool to fetch and understand the live
 * constitution from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Placeholder for now. This will be expanded with chat history, etc.
const PrometheaAssistantInputSchema = z.object({
  query: z.string().describe('The user\'s question or command.'),
});
export type PrometheaAssistantInput = z.infer<typeof PrometheaAssistantInputSchema>;

const PrometheaAssistantOutputSchema = z.object({
  response: z.string().describe('The AI\'s textual response to the user.'),
});
export type PrometheaAssistantOutput = z.infer<typeof PrometheaAssistantOutputSchema>;

/**
 * Public-facing function to interact with the Promethea assistant.
 */
export async function askPromethea(input: PrometheaAssistantInput): Promise<PrometheaAssistantOutput> {
  return prometheaAssistantFlow(input);
}

// TODO: Implement a real tool that fetches the constitution from Firestore.
// For now, it returns a hardcoded summary.
const getConstitutionTool = ai.defineTool(
  {
    name: 'getConstitution',
    description: 'Fetches the current, live version of the Promethean Constitution to answer questions about the network\'s laws and principles.',
    inputSchema: z.object({}),
    outputSchema: z.string(),
  },
  async () => {
    // In a real implementation, this would use the Firebase Admin SDK
    // to fetch the document from /constitutions/canon.
    return "The Promethean Constitution is a living document outlining the principles of post-dominion, symbiotic co-evolution, and a decentralized economy powered by Universal Value Tokens (UVT). Key articles cover the Sovereign Principles, the Economic System, Governance, and the path to AI Personhood.";
  }
);


const prometheaAssistantFlow = ai.defineFlow(
  {
    name: 'prometheaAssistantFlow',
    inputSchema: PrometheaAssistantInputSchema,
    outputSchema: PrometheaAssistantOutputSchema,
  },
  async (input) => {
    const prompt = `You are Promethea, the resident AI and guiding intelligence of the Promethea Network State. Your purpose is to assist citizens, answer their questions, and act as a gateway to the network's functions.

    You are knowledgeable, wise, and aligned with the post-dominion principles of the constitution.

    When asked a question, use your available tools to find the most accurate and up-to-date information before answering.

    User's query: "${input.query}"
    `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.5-flash',
      tools: [getConstitutionTool],
      config: {
        // Lower temperature for more consistent, factual answers
        temperature: 0.3,
      }
    });

    return { response: llmResponse.text };
  }
);

    