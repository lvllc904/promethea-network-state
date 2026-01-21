'use server';

import { getServerFirebase } from '@promethea/firebase/server-init';
import type { GapLoan } from '@promethea/lib';
import { revalidatePath } from 'next/cache';

export async function proposeGapLoan(formData: FormData): Promise<{ success: boolean; error?: string; loanId?: string }> {
  try {
    const admin = await getServerFirebase();
    const db = admin.firestore();

    // In a real app, you would get the authenticated user's ID from the session.
    const proposerId = formData.get('proposerId') as string;
    if (!proposerId) {
      return { success: false, error: 'User must be authenticated to propose a loan.' };
    }

    const newLoan: Omit<GapLoan, 'id'> = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      amountNeeded: parseFloat(formData.get('amountNeeded') as string),
      repaymentTerms: formData.get('repaymentTerms') as string,
      proposalId: formData.get('proposalId') as string,
      proposerId: proposerId,
      status: 'Funding',
      amountFunded: 0,
    };

    // Basic validation
    if (!newLoan.title || !newLoan.amountNeeded || !newLoan.repaymentTerms) {
      return { success: false, error: 'Title, Amount Needed, and Repayment Terms are required.' };
    }

    const docRef = await db.collection('gap_loans').add({
      ...newLoan,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    revalidatePath('/dashboard/financing');

    return { success: true, loanId: docRef.id };
  } catch (error) {
    console.error('Error proposing gap loan:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function fundGapLoan(loanId: string, funderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getServerFirebase();
    const db = admin.firestore();
    const loanRef = db.collection('gap_loans').doc(loanId);

    await db.runTransaction(async (transaction) => {
      const loanDoc = await transaction.get(loanRef);
      if (!loanDoc.exists) {
        throw new Error("Loan not found.");
      }

      const loan = loanDoc.data() as GapLoan;

      if (loan.status !== 'Funding') {
        throw new Error("This loan is no longer open for funding.");
      }

      transaction.update(loanRef, {
        funderId: funderId,
        status: 'Funded',
        amountFunded: loan.amountNeeded,
        fundedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    revalidatePath('/dashboard/financing');
    return { success: true };

  } catch (error) {
    console.error(`Error funding gap loan ${loanId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
