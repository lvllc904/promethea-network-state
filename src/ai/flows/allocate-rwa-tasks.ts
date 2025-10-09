'use server';
/**
 * @fileOverview This file defines a Genkit flow for allocating tasks related to Real World Asset (RWA) management to DAC members based on their skills.
 *
 * - allocateRWATasks - A function that takes in a task description and returns a list of suitable members.
 * - AllocateRWATasksInput - The input type for the allocateRWATasks function.
 * - AllocateRWATasksOutput - The output type for the allocateRWATasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AllocateRWATasksInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('A description of the task to be performed on the RWA.'),
});
export type AllocateRWATasksInput = z.infer<typeof AllocateRWATasksInputSchema>;

const AllocateRWATasksOutputSchema = z.object({
  suggestedMembers: z
    .array(z.string())
    .describe('A list of member IDs who are best suited for the task.'),
});
export type AllocateRWATasksOutput = z.infer<typeof AllocateRWATasksOutputSchema>;

export async function allocateRWATasks(
  input: AllocateRWATasksInput
): Promise<AllocateRWATasksOutput> {
  return allocateRWATasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'allocateRWATasksPrompt',
  input: {schema: AllocateRWATasksInputSchema},
  output: {schema: AllocateRWATasksOutputSchema},
  prompt: `You are an AI assistant tasked with allocating tasks to members of a Decentralized Autonomous Community (DAC) for Real World Asset (RWA) management. Based on the task description, suggest a list of member IDs who are best suited for the task.

Task Description: {{{taskDescription}}}

Consider member skills, reputation, and past contributions to similar tasks. Return only a list of member IDs.

Example: ["member123", "member456", "member789"]

Ensure that the list is concise and only includes the most relevant members.

Output: {"suggestedMembers": 
`,
});

const allocateRWATasksFlow = ai.defineFlow(
  {
    name: 'allocateRWATasksFlow',
    inputSchema: AllocateRWATasksInputSchema,
    outputSchema: AllocateRWATasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
