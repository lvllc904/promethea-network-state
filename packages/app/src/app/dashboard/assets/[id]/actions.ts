'use server';

import * as Ai from '@promethea/ai';
import type { AllocateRWATasksInput, AllocateRWATasksOutput } from '@promethea/ai';
import { getServerFirebase } from '@promethea/firebase/server-init';
import { Pledge, type CompensationChoice } from '@promethea/lib';
import { revalidatePath } from 'next/cache';

export async function handleAllocate(data: AllocateRWATasksInput): Promise<AllocateRWATasksOutput | { error: string }> {
  try {
    const result = await Ai.invokeAllocateRWATasks(data);
    if (!result || !result.suggestedMembers) {
      return { error: 'Received an invalid response from the AI.' };
    }
    return result;
  } catch (error) {
    console.error('Error in handleAllocate action:', error);
    return { error: 'Failed to get AI suggestions.' };
  }
}


export async function applyForTask(
  taskId: string,
  proposalId: string,
  citizenId: string,
  compensationChoice: CompensationChoice,
  assetPath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getServerFirebase();
    const db = admin.firestore();

    await db.runTransaction(async (transaction) => {
      const taskRef = db.collection('tasks').doc(taskId);
      const proposalRef = db.collection('proposals').doc(proposalId);

      // 1. Create a new Pledge document
      const pledgeRef = db.collection('pledges').doc();
      transaction.set(pledgeRef, {
        citizenId,
        proposalId,
        taskId,
        type: 'SweatEquity',
        compensationChoice,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. Update the Task document
      transaction.update(taskRef, {
        assigneeId: citizenId,
        status: 'In Progress',
        compensationChoice: compensationChoice,
      });

      // 3. Increment the pledgedSweatEquity count on the Proposal
      const proposalDoc = await transaction.get(proposalRef);
      if (!proposalDoc.exists) {
        throw new Error("Proposal not found!");
      }
      const currentPledgedSweat = proposalDoc.data()?.pledgedSweatEquity || 0;
      transaction.update(proposalRef, { pledgedSweatEquity: currentPledgedSweat + 1 });
    });

    // Revalidate the path to show the updated data
    revalidatePath(assetPath);

    return { success: true };

  } catch (error) {
    console.error(`Error applying for task ${taskId}:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while applying for the task.";
    return { success: false, error: errorMessage };
  }
}
