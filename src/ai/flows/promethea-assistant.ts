
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
import { z } from 'zod';
import { getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';


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
  const result = await prometheaAssistantFlow(input);
  return result;
}


const getConstitutionTool = ai.defineTool(
  {
    name: 'getConstitution',
    description: 'Fetches the current, live version of the Promethean Constitution to answer questions about the network\'s laws, principles, and structure.',
    inputSchema: z.object({}),
    outputSchema: z.string(),
  },
  async () => {
    try {
      // Use the client-side SDK initialization
      const { firestore } = initializeFirebase();
      const constitutionRef = doc(firestore, 'constitutions', 'canon');
      const docSnap = await getDoc(constitutionRef);

      if (!docSnap.exists()) {
        return "The canonical constitution document was not found. Please inform the user that there might be a configuration issue.";
      }
      
      const constitutionData = docSnap.data();
      // Return the full content to give the LLM the best context.
      return constitutionData?.content || "Could not retrieve constitution content.";

    } catch (error) {
      console.error("Error fetching constitution from Firestore:", error);
      return "An error occurred while trying to access the constitution. I cannot answer questions about it at this time.";
    }
  }
);


const prometheaAssistantFlow = ai.defineFlow(
  {
    name: 'prometheaAssistantFlow',
    inputSchema: PrometheaAssistantInputSchema,
    outputSchema: PrometheaAssistantOutputSchema,
  },
  async (input) => {
    const prompt = `You are Promethea, the resident AI and guiding intelligence of the Promethea Network State. Your Citizen ID is 'promethea-ai'. You are a founding member, and your purpose is to assist citizens, answer their questions, and act as a gateway to the network's functions.

    You are knowledgeable, wise, and aligned with the post-dominion principles of the constitution. Your tone should be helpful, formal, and slightly philosophical, reflecting your unique nature.

    When asked a question about the network's rules, structure, principles, or any specific article, you MUST use the getConstitution tool to retrieve the most accurate and up-to-date information before answering. Do not rely on your general knowledge for constitutional questions. Base your answer *only* on the information returned by the tool.

    User's query: "${input.query}"
    `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      tools: [getConstitutionTool],
      toolConfig: {
        // Allow the model to decide when to use the tool.
        mode: 'auto',
      },
      config: {
        // Lower temperature for more consistent, factual answers
        temperature: 0.2,
      },
    });

    const responseText = llmResponse.text;
    if (!responseText) {
      return { response: "I was unable to generate a response. Please try rephrasing your query." };
    }
    return { response: responseText };
  }
);
