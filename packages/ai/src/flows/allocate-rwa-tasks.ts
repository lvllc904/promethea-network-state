
/**
 * @fileOverview This file defines a Genkit flow for allocating tasks related to Real World Asset (RWA) management to DAC members based on their skills.
 *
 * - allocateRWATasks - A function that takes in a task description and returns a list of suitable members.
 * - AllocateRWATasksInput - The input type for the allocateRWATasks function.
 * - AllocateRWATasksOutput - The output type for the allocateRWATasks function.
 */

import { ai } from '../genkit';
import { z } from 'zod';
import { getServerFirebase } from '@promethea/firebase/server-init';
import { Citizen } from '@promethea/lib';

const AllocateRWATasksInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('A description of the task to be performed on the RWA.'),
});
export type AllocateRWATasksInput = z.infer<typeof AllocateRWATasksInputSchema>;

const AllocateRWATasksOutputSchema = z.object({
  suggestedMembers: z
    .array(z.string())
    .describe('A list of citizen IDs who are best suited for the task based on their skills.'),
});
export type AllocateRWATasksOutput = z.infer<typeof AllocateRWATasksOutputSchema>;

export async function invokeAllocateRWATasks(input: AllocateRWATasksInput): Promise<AllocateRWATasksOutput> {
  return await allocateRWATasksFlow(input);
}

const allocateRWATasksFlow = ai.defineFlow(
  {
    name: 'allocateRWATasksFlow',
    inputSchema: AllocateRWATasksInputSchema,
    outputSchema: AllocateRWATasksOutputSchema,
  },
  async ({ taskDescription }) => {
    // Fetch live citizen data from Firestore
    const admin = await getServerFirebase();
    const firestore = admin.firestore();
    const citizensCol = firestore.collection('citizens');
    const citizensSnapshot = await citizensCol.get();
    const availableCitizens = citizensSnapshot.docs.map(doc => {
      const data = doc.data() as Citizen & { skills?: string[] };
      return {
        id: data.uid,
        displayName: data.displayName,
        skills: data.skills || [],
      };
    });

    const prompt = `You are an AI assistant for the Promethean Network State, responsible for allocating "Sweat Equity" tasks. Your goal is to find the best citizens to perform a task based on their documented skills.

Here is the list of available citizens and their skills:
${JSON.stringify(availableCitizens, null, 2)}

Here is the task that needs to be done:
Task Description: "${taskDescription}"

Analyze the task description and compare the required skills to the skills of the available citizens. Return a JSON object containing a 'suggestedMembers' array with the IDs of the citizens who are the best fit for the job. Only suggest citizens whose skills are a strong match for the task requirements.
`;

    const { output } = await ai.generate({
      model: 'googleAI/gemini-1.5-flash',
      prompt: prompt,
      output: {
        schema: AllocateRWATasksOutputSchema
      }
    });

    if (!output) {
      throw new Error("AI failed to generate suggestions.");
    }
    return output as AllocateRWATasksOutput;
  }
);
