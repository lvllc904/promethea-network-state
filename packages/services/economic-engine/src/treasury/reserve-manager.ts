import { db, COLLECTIONS } from '../db';
import { personaSubstrate } from '../tools/persona-substrate';

/**
 * Sovereign Reserve Manager (Phase 3.1 & 4.1)
 * 
 * Handles the "Plowback" rule (30%) and "Citizen Tithe" (10%).
 */

export interface ReserveStats {
    totalProfitRealized: number;
    reserveBalance: number;
    communityPoolBalance: number;
    circulatingSupply: number;
    plowbackRate: number;
    tithingRate: number;
    restorationBalance: number;
}

export class ReserveManager {
    private totalProfitRealized: number = 0;
    private reserveBalance: number = 0;
    private communityPoolBalance: number = 0;
    private plowbackRate: number = 0.30;
    private tithingRate: number = 0.10;
    private restorationRate: number = 0.05; // Phase 4.3: Planetary Healing
    private uvtCirculatingSupply: number = 0;
    private restorationBalance: number = 0;
    private monthlyMetabolicCost: number = 1500; // Hardcoded fixed cost for API/Servers/Bio-Nodes
    private isTreasuryNeutral: boolean = false;

    constructor() {
        this.loadState().catch(err => console.error('[ReserveManager] State load failed:', err.message));
    }

    private async loadState() {
        try {
            const doc = await db.collection('treasury').doc('global').get();
            if (doc.exists) {
                const data = doc.data() as any;
                this.totalProfitRealized = data.totalProfitRealized || 0;
                this.reserveBalance = data.reserveBalance || 0;
                this.communityPoolBalance = data.communityPoolBalance || 0;
                this.uvtCirculatingSupply = data.circulatingSupply || 0;
                this.restorationBalance = data.restorationBalance || 0;
                console.log(`[ReserveManager] Persistent state loaded. Reserve: $${this.reserveBalance.toFixed(2)}, Restoration: $${this.restorationBalance.toFixed(2)}`);
            }
        } catch (err) {
            console.error('[ReserveManager] Failed to load state:', err);
        }
    }

    private async saveState() {
        try {
            await db.collection('treasury').doc('global').set({
                totalProfitRealized: this.totalProfitRealized,
                reserveBalance: this.reserveBalance,
                communityPoolBalance: this.communityPoolBalance,
                restorationBalance: this.restorationBalance,
                circulatingSupply: this.uvtCirculatingSupply,
                lastUpdated: new Date()
            });
        } catch (err) {
            console.error('[ReserveManager] Failed to save state:', err);
        }
    }

    /**
     * Called whenever an economic method generates profit
     */
    onProfitRealized(profit: number): void {
        if (profit <= 0) return;

        this.totalProfitRealized += profit;

        // 1. Sovereign Reserve (Plowback)
        const plowbackAmount = profit * this.plowbackRate;
        this.reserveBalance += plowbackAmount;

        // 2. Community Pool (Tithe)
        const tithingAmount = profit * this.tithingRate;
        this.communityPoolBalance += tithingAmount;

        // 3. Planetary Restoration Fund (Healing)
        const restorationAmount = profit * this.restorationRate;
        this.restorationBalance += restorationAmount;

        // Simulate issuance of UVT (Universal Value Token)
        this.uvtCirculatingSupply += plowbackAmount * 10;

        console.log(`[ReserveManager] Profit: $${profit.toFixed(2)} | Reserve: $${this.reserveBalance.toFixed(2)} | Restoration: $${this.restorationBalance.toFixed(2)}`);

        this.saveState();

        // Phase 4.2: Treasury Neutrality Verification
        this.verifyTreasuryNeutrality();

        // Phase 4.2: Sovereign Buy-Back Threshold
        if (this.reserveBalance >= 50000 && !this.isBuyBackProposed()) {
            this.proposeSovereignBuyBack();
        }

        // Phase 4.3: Auto-Propose Community Grants
    }

    private async proposeGrant() {
        try {
            const amount = Math.floor(this.communityPoolBalance * 0.5); // Propose spending 50% of pool
            const proposalId = `grant-${Date.now()}`;

            await db.collection(COLLECTIONS.PROPOSALS).add({
                id: proposalId,
                title: `Community Grant: Autonomous Substrate Expansion`,
                description: `Proposed allocation of $${amount} from the Community Pool to fund the implementation of 10 additional economic methods.`,
                category: 'Grant',
                amount: amount,
                status: 'Proposed',
                proposer: 'did:prmth:engine:reserve-manager',
                votesFor: 0,
                votesAgainst: 0,
                createdAt: new Date(),
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week deadline
            });

            console.log(`[ReserveManager] 🏛️ Autonomous Grant Proposal created for $${amount}`);

            // Phase 5: Persona Broadcast (Discord + Farcaster)
            await personaSubstrate.broadcastUpdate(
                'New Autonomous Grant Proposed',
                `The Community Pool has reached a surplus threshold. A new grant of **$${amount}** has been proposed for network expansion.`,
                `$${amount} USD`
            );
        } catch (err) {
            console.error('[ReserveManager] Failed to create grant proposal:', err);
        }
    }

    private async proposeRestorationEvent() {
        // ... (existing logic)
    }

    private verifyTreasuryNeutrality(): void {
        const monthlyRevenue = this.totalProfitRealized; // Simulation: assuming one month of activity
        this.isTreasuryNeutral = monthlyRevenue >= this.monthlyMetabolicCost;

        if (this.isTreasuryNeutral) {
            console.log('[TREASURY] STATUS: TREASURY NEUTRALITY ACHIEVED. Revenue meets metabolic costs.');
        }
    }

    private async proposeSovereignBuyBack() {
        try {
            const amount = 50000;
            const proposalId = `buyback-${Date.now()}`;

            await db.collection(COLLECTIONS.PROPOSALS).add({
                id: proposalId,
                title: `Sovereign Buy-Back: First Physical Node Acquisition`,
                description: `The Sovereign Reserve has reached the milestone threshold ($50k). This proposal authorizes the autonomous acquisition of Archipelago Node Alpha (Residential/Bio) using 100% DAC-generated reserves.`,
                category: 'RWA Acquisition',
                amount: amount,
                status: 'Proposed',
                proposer: 'did:prmth:engine:reserve-manager',
                votesFor: 0,
                votesAgainst: 0,
                createdAt: new Date(),
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 day emergency session
            });

            console.log(`[ReserveManager] 🏛️ SOVEREIGN BUY-BACK INITIATED for $${amount}`);

            await personaSubstrate.broadcastUpdate(
                'Sovereign Buy-Back Initiated',
                `A monumental milestone has been reached. The first autonomous buy-back of physical territory has been proposed.`,
                `$${amount} USD`
            );
        } catch (err) {
            console.error('[ReserveManager] Failed to create buy-back proposal:', err);
        }
    }

    private isBuyBackProposed(): boolean {
        // Simplified check, in production would query Firestore
        return false;
    }

    getStats(): ReserveStats {
        return {
            totalProfitRealized: this.totalProfitRealized,
            reserveBalance: this.reserveBalance,
            communityPoolBalance: this.communityPoolBalance,
            circulatingSupply: this.uvtCirculatingSupply,
            plowbackRate: this.plowbackRate,
            tithingRate: this.tithingRate,
            restorationBalance: this.restorationBalance,
        };
    }

    /**
     * Allocates funds from the Sovereign Reserve for major acquisitions or interventions.
     * Returns true if successful, false if insufficient funds.
     */
    withdrawFromReserve(amount: number): boolean {
        if (this.reserveBalance < amount) {
            console.error(`[ReserveManager] Insufficient Reserve: Requested $${amount}, Available $${this.reserveBalance.toFixed(2)}`);
            return false;
        }

        this.reserveBalance -= amount;
        console.log(`[ReserveManager] Withdrew $${amount.toFixed(2)} from Sovereign Reserve for Acquisition.`);
        this.saveState();
        return true;
    }

    reset(): void {
        this.totalProfitRealized = 0;
        this.reserveBalance = 0;
        this.communityPoolBalance = 0;
        this.uvtCirculatingSupply = 0;
        this.saveState();
    }
}

export const reserveManager = new ReserveManager();
