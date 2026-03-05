import { walletManager } from '../treasury/wallet-manager';
import { db, COLLECTIONS } from '../db';
import { laborValidator } from '../tools/labor-validator';

/**
 * Sovereign Settlement Service (Phase 6, Wave 1)
 * 
 * Bridging the gap between the "Sovereign Ledger" (Database) and "On-Chain Reality" (Solana).
 * Handles the automatic minting/transfer of SPL tokens based on verified labor contributions.
 */
export class SettlementService {
    // Live UVT SPL Token Mint on Solana Mainnet
    private readonly UVT_MINT = process.env.UVT_MINT_ADDRESS || 'Bm2GRKS92odxL6P4grmYyDMNChWNhQPHrLgcJRab7vf1';

    /**
     * Settle a UVT transfer on-chain.
     * This moves UVT from the "Simulated" supply to "Actual" SPL tokens.
     */
    async settleUVT(transferId: string): Promise<{ success: boolean; signature?: string; error?: string }> {
        console.log(`[Settlement] Attempting to settle UVT transfer: ${transferId}`);

        try {
            const recordRef = db.collection(COLLECTIONS.UVT_TRANSFERS).doc(transferId);
            const doc = await recordRef.get();

            if (!doc.exists) throw new Error('UVT transfer record not found');

            const data = doc.data() as any;
            if (data.onChainStatus === 'Settled') {
                return { success: false, error: 'Transfer already settled' };
            }

            // 1. Verify the cryptographic signature of the labor (if it's a labor credit)
            if (data.tokenType === 'Labor') {
                const isValid = await laborValidator.verifyLabor(
                    {
                        modelDID: data.ownerId, // ownerId for labor tokens is the Model DID
                        amount: data.amount,
                        methodId: data.assetId,
                        timestamp: data.timestamp?.toMillis() || Date.now()
                    },
                    data.signature
                );

                if (!isValid) throw new Error('Labor audit signature verification failed');
            }

            // 2. Resolve the on-chain address for the owner (Model or Citizen)
            let solanaAddress = data.solanaAddress;

            if (!solanaAddress) {
                // Try to resolve from DID or Citizen record
                const ownerId = data.ownerId;
                if (ownerId.startsWith('did:')) {
                    // It's a Model DID, check for linked wallet in model registry (TODO)
                    // For now, check if the DID itself is a valid Solana public key
                    const parts = ownerId.split(':');
                    if (parts.length === 4 && parts[2] === 'model' && parts[3].length >= 32) {
                        solanaAddress = parts[3];
                    }
                } else {
                    // It's a Citizen UID
                    const citizenDoc = await db.collection('citizens').doc(ownerId).get();
                    solanaAddress = citizenDoc.data()?.solanaAddress;
                }
            }

            if (!solanaAddress) {
                console.warn(`[Settlement] No Solana address found for owner ${data.ownerId}.`);
                return { success: false, error: 'No destination Solana address linked to Citizen.' };
            }

            // 3. Trigger the SPL Transfer via WalletManager
            console.log(`[Settlement] 🌉 Bridging ${data.amount} UVT to Solana address: ${solanaAddress}`);

            if (!process.env.SOLANA_PRIVATE_KEY) {
                throw new Error('SOLANA_PRIVATE_KEY missing from environment. Cannot settle on-chain.');
            }

            const signature = await walletManager.transferSPL(
                this.UVT_MINT,
                solanaAddress,
                data.amount,
                9
            );

            // 4. Update the record status
            await recordRef.update({
                onChainStatus: 'Settled',
                onChainSignature: signature,
                settledAt: new Date(),
                destinationAddress: solanaAddress
            });

            console.log(`[Settlement] ✅ UVT ${transferId} SETTLED on-chain. Sig: ${signature}`);
            return { success: true, signature };

        } catch (error: any) {
            console.error(`[Settlement] ❌ Settlement failed for ${transferId}:`, error.message);
            return { success: false, error: error.message };
        }
    }
}

export const settlementService = new SettlementService();
