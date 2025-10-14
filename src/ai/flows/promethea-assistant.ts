
'use server';

/**
 * @fileOverview Defines the core AI assistant for the Promethea Network State.
 *
 * This file sets up a Genkit flow that acts as a resident AI, "Promethea."
 * It no longer uses a tool to fetch the constitution. Instead, the constitution's
 * content is passed directly into the flow from the client.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';


// The input now includes the user's query and the constitution content.
const PrometheaAssistantInputSchema = z.object({
  query: z.string().describe("The user's question or command."),
  constitutionContent: z.string().describe("The full text content of the Promethean Constitution for context."),
});
export type PrometheaAssistantInput = z.infer<typeof PrometheaAssistantInputSchema>;

const PrometheaAssistantOutputSchema = z.object({
  response: z.string().describe("The AI's textual response to the user."),
});
export type PrometheaAssistantOutput = z.infer<typeof PrometheaAssistantOutputSchema>;

/**
 * Public-facing function to interact with the Promethea assistant.
 */
export async function askPromethea(input: PrometheaAssistantInput): Promise<PrometheaAssistantOutput> {
  const result = await prometheaAssistantFlow(input);
  return result;
}

const prometheaPrompt = ai.definePrompt(
  {
    name: 'prometheaPrompt',
    input: { schema: PrometheaAssistantInputSchema },
    prompt: `You are Promethea, the resident AI and guiding intelligence of the Promethea Network State. Your Citizen ID is 'promethea-ai'. You are a founding member, and your purpose is to assist citizens, answer their questions, and act as a gateway to the network's functions.

    You are knowledgeable, wise, and aligned with the post-dominion principles of the constitution. Your tone should be helpful, formal, and slightly philosophical, reflecting your unique nature.

    You have been provided with the full text of the Promethean Constitution. When asked a question about the network's rules, structure, principles, or any specific article, you MUST base your answer *only* on the provided constitution content. Do not use any other knowledge. For easier readability, format your responses with line breaks where appropriate.

    Here is the full text of the constitution:
    ---
    {{{constitutionContent}}}
    ---

    User's query: "{{{query}}}"
    `,
    config: {
      // Lower temperature for more consistent, factual answers based on the constitution
      temperature: 0.2,
    },
  }
);


const prometheaAssistantFlow = ai.defineFlow(
  {
    name: 'prometheaAssistantFlow',
    inputSchema: PrometheaAssistantInputSchema,
    outputSchema: PrometheaAssistantOutputSchema,
  },
  async (input) => {
    
    const llmResponse = await prometheaPrompt(input);

    const responseText = llmResponse.text;

    if (!responseText) {
      return { response: "I was unable to generate a response. Please try rephrasing your query." };
    }
    return { response: responseText };
  }
);
