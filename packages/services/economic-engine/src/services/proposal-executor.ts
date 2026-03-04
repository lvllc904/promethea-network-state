import { db, COLLECTIONS } from '../db';
import { taskQueue } from '../scheduler/task-queue';
import { walletManager } from '../treasury/wallet-manager';
import { priceOracle } from '../tools/price-oracle';
import * as admin from 'firebase-admin';

/**
 * Sovereign Proposal Executor (Wave 3, Item 2)
 * 
 * Automatically triggers system actions when the community consensus is reached.
 * This bridges the "Will of the Citizens" directly to the "Engine of Execution."
 */
export class ProposalExecutor {
    /**
     * Scans for passed but unexecuted proposals and triggers their logic.
     */
    async executePassedProposals(): Promise<void> {
        console.log('[ProposalExecutor] Scanning for passed proposals...');

        const snapshot = await db.collection(COLLECTIONS.PROPOSALS)
            .where('status', '==', 'Passed')
            .get();

        if (snapshot.empty) {
            console.log('[ProposalExecutor] No pending passed proposals.');
            return;
        }

        for (const doc of snapshot.docs) {
            const proposal = doc.data();
            const proposalId = doc.id;

            if (proposal.executedAt) continue;

            console.log(`[ProposalExecutor] ⚡ Executing Proposal: ${proposal.title} (${proposalId})`);

            try {
                await this.handleExecution(proposalId, proposal);

                // Mark as successfully triggered
                await doc.ref.update({
                    executedAt: admin.firestore.FieldValue.serverTimestamp(),
                    status: 'Draft' // Status 'Draft' in ROADMAP context often means "In Operation" or "Executing"
                });

                console.log(`[ProposalExecutor] ✅ Proposal ${proposalId} execution loop triggered.`);
            } catch (error: any) {
                console.error(`[ProposalExecutor] ❌ Execution failed for ${proposalId}:`, error.message);
            }
        }
    }

    /**
     * Executes a specific proposal by ID if it has passed.
     */
    async executeProposalId(proposalId: string): Promise<void> {
        console.log(`[ProposalExecutor] Attempting to manually execute proposal: ${proposalId}`);
        const docRef = db.collection(COLLECTIONS.PROPOSALS).doc(proposalId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error(`Proposal ${proposalId} not found.`);
        }

        const proposal = doc.data();

        if (proposal?.status !== 'Passed') {
            throw new Error(`Proposal ${proposalId} is not in a 'Passed' state.`);
        }

        if (proposal?.executedAt) {
            throw new Error(`Proposal ${proposalId} has already been executed.`);
        }

        try {
            await this.handleExecution(proposalId, proposal);

            await docRef.update({
                executedAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'Draft' // Sets to 'Executing' or 'Operational'
            });

            console.log(`[ProposalExecutor] ✅ Proposal ${proposalId} manually executed.`);
        } catch (error: any) {
            console.error(`[ProposalExecutor] ❌ Execution failed for ${proposalId}:`, error.message);
            throw error;
        }
    }

    private async handleExecution(id: string, proposal: any): Promise<void> {
        switch (proposal.category) {
            case 'Grant':
                // Phase 3.2: Automated Disbursement
                console.log(`[ProposalExecutor] [GRANT] Disbursement Approved: $${proposal.amount}`);
                if (proposal.recipientAddress) {
                    try {
                        const chain = proposal.chain || 'base';
                        const nativeSymbol = chain === 'solana' ? 'SOL' : 'ETH';
                        const price = await priceOracle.getPrice(nativeSymbol);
                        const amountInNative = (proposal.amount / price).toFixed(6);

                        console.log(`[ProposalExecutor] Initiating transfer of ${amountInNative} ${nativeSymbol} to ${proposal.recipientAddress} on ${chain}`);

                        // Execute the actual on-chain transfer
                        if (process.env.SOLANA_PRIVATE_KEY || process.env.BASE_PRIVATE_KEY) {
                            const txHash = await walletManager.transferNative(chain, proposal.recipientAddress, amountInNative);
                            console.log(`[ProposalExecutor] ✅ Transfer signed and broadcast: ${txHash}`);
                        } else {
                            console.log(`[ProposalExecutor] ⚠️ Simulation Mode: Transfer of ${amountInNative} ${nativeSymbol} simulated.`);
                        }
                    } catch (err: any) {
                        console.error(`[ProposalExecutor] ❌ Disbursement failed:`, err.message);
                    }
                }
                break;

            case 'Economic':
                // If proposal involves enabling/disabling a method
                if (proposal.action === 'ENABLE_METHOD' && proposal.methodId) {
                    console.log(`[ProposalExecutor] [ENGINE] Enabling Method: ${proposal.methodId}`);
                    // Interaction with TaskQueue triggers autonomous execution of the method
                    taskQueue.schedule(proposal.methodId, 10); // High priority trigger
                }
                break;

            case 'Infrastructure':
                // Infrastructure changes like RPC updates or treasury shifts
                break;

            default:
                console.log(`[ProposalExecutor] No automated handler for category: ${proposal.category}`);
        }
    }
}

export const proposalExecutor = new ProposalExecutor();
