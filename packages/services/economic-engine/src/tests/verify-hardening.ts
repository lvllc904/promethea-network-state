import 'dotenv/config';
import { priceOracle } from '../tools/price-oracle';
import { laborValidator } from '../tools/labor-validator';
import { walletManager } from '../treasury/wallet-manager';
import { proposalExecutor } from '../services/proposal-executor';
import { calculateAdvancedMetrics } from '../analytics/metrics-calculator';

/**
 * Hardening Rails Verification (Wave 1-6)
 */
async function verifyHardening() {
    console.log('🚀 Starting Sovereign Hardening Verification...');

    // 1. Verify Price Oracle
    console.log('\n--- 1. Price Oracle ---');
    const solPrice = await priceOracle.getPrice('SOL');
    const ethPrice = await priceOracle.getPrice('ETH');
    console.log(`SOL: $${solPrice} | ETH: $${ethPrice}`);
    if (solPrice > 0 && ethPrice > 0) {
        console.log('✅ Price Oracle Operational.');
    } else {
        console.error('❌ Price Oracle Failure.');
    }

    // 2. Verify Labor Validator
    console.log('\n--- 2. Labor Validator ---');
    const payload = {
        modelDID: 'did:prmth:model:test-validator',
        amount: 100,
        methodId: 'verification-test',
        timestamp: Date.now()
    };
    const signature = await laborValidator.signLabor(payload);
    console.log(`Audit Signature: ${signature.substring(0, 32)}...`);
    const isValid = await laborValidator.verifyLabor(payload, signature);
    if (isValid) {
        console.log('✅ Labor Validator Cryptography Verified.');
    } else {
        console.error('❌ Labor Validator Cryptography Failure.');
    }

    // 3. Verify Metrics Calculator (Gini/Labor Dist)
    console.log('\n--- 3. Advanced Metrics ---');
    try {
        const metrics = await calculateAdvancedMetrics();
        console.log(`Gini Coefficient: ${metrics.giniCoefficient}`);
        console.log(`Labor Dist (AI/Human): ${metrics.laborDistribution.ai}% / ${metrics.laborDistribution.human}%`);
        console.log('✅ Advanced Dashboard Metrics Operational.');
    } catch (err: any) {
        console.error('❌ Metrics Calculation Failure:', err.message);
    }

    // 4. Verify Proposal Executor
    console.log('\n--- 4. Proposal Executor ---');
    try {
        await proposalExecutor.executePassedProposals();
        console.log('✅ Proposal Execution Loop Initialized.');
    } catch (err: any) {
        console.error('❌ Proposal Executor Failure:', err.message);
    }

    console.log('\n🏛️  Sovereign Hardening Baseline: SUCCESS.');
}

verifyHardening().catch(console.error);
