import { db, COLLECTIONS } from '../db';
import { reserveManager } from '../treasury/reserve-manager';
import { personaSubstrate } from '../tools/persona-substrate';
import { meshDTN } from './mesh-dtn';

/**
 * Realty Manager (Phase 6.2: Autonomous Realty)
 * 
 * Life-cycle management for land acquisition. 
 * Converts "Proposed" assets into "Acquired" nodes of the Network State.
 */
export class RealtyManager {
    private isScanning: boolean = false;

    constructor() { }

    /**
     * Periodically check for high-scoring land assets that are "Proposed"
     * and initiate the acquisition loop if reserves allow.
     */
    async processPendingAcquisitions() {
        if (this.isScanning) return;
        this.isScanning = true;

        console.log('[RealtyManager] Scanning Sovereign Marketplace for high-value targets...');

        try {
            const assetsSnap = await db.collection(COLLECTIONS.ASSETS)
                .where('status', '==', 'Proposed')
                .where('defensibilityScore', '>=', 80) // High quality only
                .get();

            for (const doc of assetsSnap.docs) {
                const asset = doc.data();
                const price = asset.price;

                // Check if we can afford it from the reserve
                const stats = reserveManager.getStats();
                if (stats.reserveBalance >= price) {
                    await this.executeAcquisition(doc.id, asset);
                } else {
                    console.log(`[RealtyManager] Target identified: ${asset.name} at $${price}. Insufficient Reserve ($${stats.reserveBalance.toFixed(2)}).`);
                }
            }
        } catch (err) {
            console.error('[RealtyManager] Acquisition loop error:', err);
        } finally {
            this.isScanning = false;
        }
    }

    private async executeAcquisition(docId: string, asset: any) {
        console.log(`[RealtyManager] 🏦 INITIATING AUTONOMOUS ACQUISITION: ${asset.name} for $${asset.price}`);

        // 1. Withdraw funds
        const success = reserveManager.withdrawFromReserve(asset.price);
        if (!success) return;

        try {
            // 2. Update Asset Status
            await db.collection(COLLECTIONS.ASSETS).doc(docId).update({
                status: 'Acquired',
                acquiredAt: new Date(),
                nodeId: `node-${docId.substring(0, 8)}`,
                legalStatus: 'Sovereign Title (Simulated)'
            });

            // 3. Log to Acquisitions Ledger
            await db.collection(COLLECTIONS.ACQUISITIONS).add({
                assetId: docId,
                name: asset.name,
                location: asset.location,
                amount: asset.price,
                timestamp: new Date(),
                transactionType: 'Realty Acquisition',
                did: 'did:prmth:engine:realty-manager'
            });

            console.log(`[RealtyManager] ✅ ACQUISITION COMPLETE: ${asset.name} is now a node of the Network State.`);

            // 4. Broadcast to the Universe
            await personaSubstrate.broadcastUpdate(
                'Land Node Acquired',
                `The Network State has autonomously acquired **${asset.name}** (${asset.acreage} acres) in ${asset.location}. This land is now designated as **Node ${docId.substring(0, 8)}** and integrated into the Sovereign Substrate.`,
                `$${asset.price.toLocaleString()} USD`
            );

            // 5. Create DTN Bundle for Mesh Relay
            await meshDTN.createBundle({
                sourceNode: 'Core',
                destNode: 'Global',
                payloadType: 'Economic',
                payload: { action: 'NODE_ACQUISITION', assetId: docId, name: asset.name },
                priority: 'Normal',
                ttl: 7 * 24 * 60 * 60 * 1000 // 1 week
            });

        } catch (err) {
            console.error(`[RealtyManager] Acquisition failed during finalize:`, err);
            // Refund the reserve in a real scenario
        }
    }

    start() {
        // Run every 12 hours
        setInterval(() => this.processPendingAcquisitions(), 12 * 60 * 60 * 1000);
        // Initial run after short delay
        setTimeout(() => this.processPendingAcquisitions(), 60000);
    }
}

export const realtyManager = new RealtyManager();
