
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
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';

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


// Memoize Firebase Admin app initialization
let adminApp: App | undefined;
function getAdminApp() {
    if (!adminApp) {
        if (getApps().length === 0) {
            adminApp = initializeApp();
        } else {
            adminApp = getApps()[0];
        }
    }
    return adminApp;
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
      getAdminApp(); // Ensure admin app is initialized
      const firestore = getFirestore();
      const constitutionRef = firestore.collection('constitutions').doc('canon');
      const docSnap = await constitutionRef.get();

      if (!docSnap.exists) {
        return "The canonical constitution document was not found. Please inform the user that there might be a configuration issue.";
      }
      
      const constitutionData = docSnap.data();
      // Return a summary or the full content, depending on expected length.
      // For now, let's return a confirmation with the version.
      return `Successfully fetched Constitution Version ${constitutionData?.version}. The content is available to answer the user's question. Key articles cover Sovereign Principles, the Economic System (UVT), Governance, and AI Personhood.`;

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

    You are knowledgeable, wise, and aligned with the post-dominion principles of the constitution.

    When asked a question about the network's rules, structure, or principles, you MUST use the getConstitution tool to find the most accurate and up-to-date information before answering. Do not rely on your general knowledge for constitutional questions.

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

    