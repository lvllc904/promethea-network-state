import { BaseMethod, ExecutionResult } from './base-method';
import { db, COLLECTIONS } from '../db';
import { settlementService } from '../services/settlement-service';

/**
 * Method 22: Settlement Processor (Phase 6, Wave 1)
 * 
 * System method that bridges simulated UVT to on-chain Solana SPL tokens.
 * This is the "Hard Link" that makes the Network State economy real.
 */
export class SettlementProcessorMethod extends BaseMethod {
    constructor() {
        super('settlement-processor', 'Settlement Processor', {
            enabled: true,
            priority: 10, // Max priority
            maxExecutionsPerDay: 48, // Every 30 mins
            estimatedRevenue: { min: 0, max: 0 }, // It consumes gas, doesn't generate "revenue" but enables value.
        });
    }

    async execute(): Promise<ExecutionResult> {
        const logs: string[] = [];
        let cost = 0;

        try {
            logs.push('Scanning for unsettled UVT transfers...');

            const snapshot = await db.collection(COLLECTIONS.UVT_TRANSFERS)
                .where('onChainStatus', '!=', 'Settled')
                .limit(5) // Settle in batches to stay within fee/time limits
                .get();

            if (snapshot.empty) {
                logs.push('No pending settlements found.');
                return {
                    success: true,
                    revenue: 0,
                    cost: 0,
                    profit: 0,
                    timestamp: Date.now(),
                    logs
                };
            }

            logs.push(`Found ${snapshot.size} transfers pending settlement.`);

            let successfulSettlements = 0;
            for (const doc of snapshot.docs) {
                const result = await settlementService.settleUVT(doc.id);
                if (result.success) {
                    successfulSettlements++;
                    logs.push(`✅ Settled ${doc.id}: ${result.signature}`);
                    cost += 0.005; // Estimated Solana Tx Fee in USD
                } else {
                    logs.push(`❌ Failed to settle ${doc.id}: ${result.error}`);
                }
            }

            return {
                success: true,
                revenue: 0,
                cost,
                profit: -cost, // Settlement is an operational cost
                timestamp: Date.now(),
                modelDID: 'did:prmth:engine:settlement-processor',
                logs,
            };
        } catch (error: any) {
            return {
                success: false,
                revenue: 0,
                cost: 0,
                profit: 0,
                timestamp: Date.now(),
                logs,
                error: error.message
            };
        }
    }
}
