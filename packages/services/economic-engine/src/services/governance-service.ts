import { db, COLLECTIONS } from '../db';
import * as admin from 'firebase-admin';

/**
 * Sovereign Governance Service (Wave 3, Item 1)
 * 
 * Handles automated tallying and closing of proposals using Quadratic/Weighted voting.
 */
export class GovernanceService {
    /**
     * Tally and close expired proposals
     */
    async processPendingProposals(): Promise<void> {
        console.log('[Governance] Scanning for expired proposals to tally...');

        const now = new Date();
        const snapshot = await db.collection(COLLECTIONS.PROPOSALS)
            .where('status', '==', 'Proposed')
            .get();

        if (snapshot.empty) {
            console.log('[Governance] No pending proposals found.');
            return;
        }

        for (const doc of snapshot.docs) {
            const proposal = doc.data();
            const proposalId = doc.id;

            // Manual check for deadline in-memory to avoid composite index requirement
            const deadline = proposal.deadline?.toDate();
            if (!deadline || deadline > now) continue;

            console.log(`[Governance] Tallying Proposal: ${proposal.title} (${proposalId})`);

            try {
                // Fetch all votes for this proposal
                const votesSnapshot = await db.collection('votes')
                    .where('proposalId', '==', proposalId)
                    .get();

                let supportWeight = 0;
                let againstWeight = 0;
                let supportCount = 0;
                let againstCount = 0;

                votesSnapshot.forEach(vDoc => {
                    const vote = vDoc.data();
                    const weight = vote.weight || 1;
                    if (vote.support) {
                        supportWeight += weight;
                        supportCount++;
                    } else {
                        againstWeight += weight;
                        againstCount++;
                    }
                });

                const totalWeight = supportWeight + againstWeight;
                const status = supportWeight > againstWeight ? 'Passed' : 'Rejected';

                console.log(`[Governance] Tally Result for ${proposalId}: Support: ${supportWeight.toFixed(2)} (${supportCount}), Against: ${againstWeight.toFixed(2)} (${againstCount}). Status: ${status}`);

                await doc.ref.update({
                    status,
                    votesFor: supportCount,     // Raw counts for historic record
                    votesAgainst: againstCount,
                    finalSupportWeight: supportWeight,
                    finalAgainstWeight: againstWeight,
                    talliedAt: admin.firestore.FieldValue.serverTimestamp()
                });

            } catch (err: any) {
                console.error(`[Governance] Failed to tally proposal ${proposalId}:`, err.message);
            }
        }
    }
}

export const governanceService = new GovernanceService();
