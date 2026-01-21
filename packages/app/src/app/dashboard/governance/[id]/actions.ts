'use server';

import { getServerFirebase } from '@promethea/firebase/server-init';
import { revalidatePath } from 'next/cache';

export async function pledgeCapital(
  proposalId: string,
  userId: string,
  amount: number,
  path: string
) {
  if (!proposalId || !userId || !amount || amount <= 0) {
    return { success: false, error: 'Invalid input.' };
  }

  try {
    const admin = await getServerFirebase();
    const db = admin.firestore();
    const FieldValue = admin.firestore.FieldValue;

    const proposalRef = db.collection('proposals').doc(proposalId);
    const citizenRef = db.collection('citizens').doc(userId);

    await db.runTransaction(async (transaction) => {
      const proposalDoc = await transaction.get(proposalRef);
      const citizenDoc = await transaction.get(citizenRef);

      if (!proposalDoc.exists) {
        throw new Error('Proposal not found.');
      }
      if (!citizenDoc.exists) {
        throw new Error('Citizen not found. You must have a passport to pledge.');
      }

      const proposal = proposalDoc.data();

      const newPledgedCapital = (proposal?.pledgedCapital || 0) + amount;
      if (proposal?.targetEquity && newPledgedCapital > proposal.targetEquity) {
        throw new Error('Pledge amount exceeds the remaining target equity.');
      }

      transaction.update(proposalRef, {
        pledgedCapital: FieldValue.increment(amount),
      });

      const pledgeRef = db.collection('pledges').doc();
      transaction.set(pledgeRef, {
        proposalId,
        citizenId: userId,
        type: 'Capital',
        amount: amount,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    revalidatePath(path);
    return { success: true };
  } catch (error: any) {
    console.error('Error pledging capital:', error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}
