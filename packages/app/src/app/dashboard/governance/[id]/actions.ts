'use server';

import { getServerFirebase } from '@promethea/firebase/server-init';
import { revalidatePath } from 'next/cache';
import { Citizen } from '@promethea/lib';

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

export async function castVote(
  proposalId: string,
  userId: string,
  support: boolean,
  path: string,
  voteCredits: number = 1
) {
  if (!proposalId || !userId) {
    return { success: false, error: 'Invalid input.' };
  }

  if (voteCredits < 1 || voteCredits > 25) {
    return { success: false, error: 'Vote credits must be between 1 and 25.' };
  }



  try {
    const admin = await getServerFirebase();
    const db = admin.firestore();
    const FieldValue = admin.firestore.FieldValue;

    const citizenRef = db.collection('citizens').doc(userId);
    const voteRef = db.collection('votes').doc(`${proposalId}_${userId}`);

    await db.runTransaction(async (transaction) => {
      const citizenDoc = await transaction.get(citizenRef);
      const voteDoc = await transaction.get(voteRef);

      if (!citizenDoc.exists) {
        throw new Error('Citizen not found. You must have a passport to vote.');
      }

      if (voteDoc.exists) {
        throw new Error('You have already cast a vote on this proposal.');
      }

      const citizen = citizenDoc.data() as Citizen;
      const availableReputationPoints = citizen.reputationScore || 0;
      const reputation = citizen.reputation || 0;

      // Trust Multiplier based on citizen reputation (1.0 for 0 rep, 2.0 for 1000 rep)
      const trustMultiplier = 1 + (reputation / 1000);
      const voiceWeight = Math.sqrt(voteCredits) * trustMultiplier;
      const reputationCost = voteCredits * voteCredits;

      // Enforce QV cost: citizen must have enough reputation points to cover the cost
      if (availableReputationPoints < reputationCost) {
        throw new Error(`Insufficient reputation points. This vote requires ${reputationCost} units but you have ${availableReputationPoints}.`);
      }

      // Deduct reputation cost (QV: spending voice has a real cost)
      transaction.update(citizenRef, {
        reputationScore: FieldValue.increment(-reputationCost),
        totalVotingCreditsUsed: FieldValue.increment(reputationCost),
      });

      transaction.set(voteRef, {
        proposalId,
        voter: userId,
        support,
        weight: voiceWeight,
        creditsSpent: voteCredits,
        reputationCost,
        createdAt: FieldValue.serverTimestamp(),
      });

      console.log(`[QV] Vote cast by ${userId} on ${proposalId}. Support: ${support}, Credits: ${voteCredits}, Voice: ${voiceWeight.toFixed(3)}, Rep Cost: ${reputationCost}`);
    });

    revalidatePath(path);
    return { success: true };
  } catch (error: any) {
    console.error('Error casting vote:', error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}


export async function executeProposalAction(
  proposalId: string,
  userId: string,
  path: string
) {
  if (!proposalId || !userId) {
    return { success: false, error: 'Invalid input.' };
  }

  try {
    const admin = await getServerFirebase();
    const db = admin.firestore();

    const citizenRef = db.collection('citizens').doc(userId);
    const citizenDoc = await citizenRef.get();

    if (!citizenDoc.exists) {
      throw new Error('Citizen not found. You must have a passport to execute.');
    }

    // Call the Economic Engine API to execute the logic safely within the trusted environment
    // or trigger it locally if the Engine is co-located.
    const engineUrl = process.env.ECONOMIC_ENGINE_URL || 'http://localhost:8080';
    const response = await fetch(`${engineUrl}/api/engine/proposals/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Engine Error: ${text}`);
    }

    revalidatePath(path);
    return { success: true };
  } catch (error: any) {
    console.error('Error executing proposal:', error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}
