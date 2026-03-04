import { db, COLLECTIONS } from '../db';
import { laborValidator } from '../tools/labor-validator';
import { billingManager } from '../treasury/billing-manager';
import { reserveManager } from '../treasury/reserve-manager';
import * as admin from 'firebase-admin';

/**
 * Sovereign Compensation Service (Phase 4.1)
 * 
 * Actualizes the "Hybrid Labor Compensation" model.
 * Splits incoming labor value into Capital (Liquid) and Equity (Sovereign).
 */
export class CompensationService {
    /**
     * Distribute compensation for a piece of labor/contribution
     */
    async distributeLaborCompensation(
        citizenId: string,
        totalValue: number,
        description: string,
        methodId: string
    ): Promise<{ invoiceId?: string; uvtTransferId?: string }> {
        console.log(`[Compensation] Calculating hybrid split for ${citizenId}: $${totalValue}`);

        // 1. Fetch Citizen's Preferred Split
        const citizenDoc = await db.collection('citizens').doc(citizenId).get();
        if (!citizenDoc.exists) throw new Error('Citizen not found');

        const citizen = citizenDoc.data() as any;
        const split = citizen.preferredHybridSplit || { capital: 50, equity: 50 };

        const capitalAmount = totalValue * (split.capital / 100);
        const equityAmount = totalValue * (split.equity / 100);

        let invoiceId: string | undefined;
        let uvtTransferId: string | undefined;

        // 2. Handle Capital Payout (Invoice)
        if (capitalAmount > 0) {
            invoiceId = await billingManager.createInvoice({
                clientId: citizenId,
                description: `Hybrid Capital Payout: ${description}`,
                amount: capitalAmount,
                currency: 'USD',
                methodId,
                dueDate: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[Compensation] Capital Invoice created: ${invoiceId} ($${capitalAmount})`);
        }

        // 3. Handle Equity Payout (UVT Credit)
        if (equityAmount > 0) {
            // UVT reward is usually leveraged/multiplied by the reserve ratio
            // But for direct labor compensation, we can use a standard multiplier
            const uvtReward = equityAmount * 10;

            const timestamp = Date.now();
            const signature = await laborValidator.signLabor({
                modelDID: citizen.decentralizedId || citizenId,
                amount: uvtReward,
                methodId,
                timestamp
            });

            const transferRef = await db.collection(COLLECTIONS.UVT_TRANSFERS).add({
                ownerId: citizen.decentralizedId || citizenId,
                assetId: methodId,
                amount: uvtReward,
                tokenType: 'Labor',
                description: `Hybrid Equity Payout: ${description}`,
                signature,
                onChainStatus: 'Pending',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            uvtTransferId = transferRef.id;
            console.log(`[Compensation] Equity UVT Credit minted: ${uvtTransferId} (${uvtReward} UVT)`);
        }

        return { invoiceId, uvtTransferId };
    }
}

export const compensationService = new CompensationService();
