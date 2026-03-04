import 'dotenv/config';
import { db, COLLECTIONS } from '../db';
import { governanceService } from '../services/governance-service';
import { proposalExecutor } from '../services/proposal-executor';
import * as admin from 'firebase-admin';

async function testGovernanceLoop() {
    console.log('--- Governance Loop Verification ---');

    const proposalId = `test-gov-${Date.now()}`;

    // 1. Create an EXPIRED proposal
    console.log('[Test] Creating expired economic proposal...');
    await db.collection(COLLECTIONS.PROPOSALS).doc(proposalId).set({
        title: 'Test Proposal: Enable Dex Oracle',
        category: 'Economic',
        action: 'ENABLE_METHOD',
        methodId: 'dex-oracle',
        status: 'Proposed',
        deadline: new Date(Date.now() - 1000), // Expired 1s ago
        createdAt: new Date()
    });

    // 2. Cast some weighted votes
    console.log('[Test] Casting weighted votes...');
    // Citizen A: High Reputation (100) -> Voice = 10.05
    await db.collection('votes').doc(`${proposalId}_citizenA`).set({
        proposalId,
        voter: 'citizenA',
        support: true,
        weight: Math.sqrt(100 + 1)
    });

    // Citizen B: Low Reputation (0) -> Voice = 1
    await db.collection('votes').doc(`${proposalId}_citizenB`).set({
        proposalId,
        voter: 'citizenB',
        support: false,
        weight: Math.sqrt(0 + 1)
    });

    // 3. Process Pending Proposals (Tallying)
    console.log('[Test] Running GovernanceService.processPendingProposals...');
    await governanceService.processPendingProposals();

    // 4. Verify status changed to Passed
    let doc = await db.collection(COLLECTIONS.PROPOSALS).doc(proposalId).get();
    let data = doc.data();

    if (data?.status === 'Passed') {
        console.log('✅ [Test] Proposal Tally PASSED (Weighted)');
    } else {
        console.error('❌ [Test] Proposal Tally Failed. Status:', data?.status);
    }

    // 5. Run Proposal Executor (Triggering)
    console.log('[Test] Running ProposalExecutor.executePassedProposals...');
    await proposalExecutor.executePassedProposals();

    // 6. Verify Execution status
    doc = await db.collection(COLLECTIONS.PROPOSALS).doc(proposalId).get();
    data = doc.data();

    if (data?.executedAt) {
        console.log('✅ [Test] Proposal Execution Triggered Successfully');
    } else {
        console.error('❌ [Test] Proposal Execution NOT Triggered');
    }

    process.exit(0);
}

testGovernanceLoop().catch(err => {
    console.error('❌ [Test] Governance Loop Failed:', err.message);
    process.exit(1);
});
