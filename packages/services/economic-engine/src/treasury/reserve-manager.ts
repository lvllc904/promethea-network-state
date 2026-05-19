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
    
    // Sovereign Calibration v5.3.3
    private microTollRate: number = 0.0015; // 0.15% Per-Transaction Toll
    private investorHurdleRate: number = 0.08; // 8% Investor Seniority Hurdle
    private investorYieldDistributed: number = 0;

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
                this.restorationBalance = data.restorationBalance || 0;

                // Note: uvtCirculatingSupply is now derived from on-chain data
                console.log(`[ReserveManager] Persistent state loaded. Reserve: $${this.reserveBalance.toFixed(2)}, Restoration: $${this.restorationBalance.toFixed(2)}`);
            }

            // Fetch live supply from Solana
            await this.refreshLiveSupply();
        } catch (err) {
            console.error('[ReserveManager] Failed to load state:', err);
        }
    }

    private async refreshLiveSupply() {
        try {
            const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
            const mintAddress = process.env.UVT_MINT_ADDRESS || 'Bm2GRKS92odxL6P4grmYyDMNChWNhQPHrLgcJRab7vf1';
            const { walletManager } = require('./wallet-manager');

            const { Connection, PublicKey } = require('@solana/web3.js');
            const { getMint } = require('@solana/spl-token');

            const connection = new Connection(rpcUrl, 'confirmed');

            // 1. Sync UVT live supply (SPL)
            try {
                const mintInfo = await getMint(connection, new PublicKey(mintAddress));
                const supply = Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals);
                this.uvtCirculatingSupply = supply;
                console.log(`[ReserveManager] ⛓️ Live supply synchronized: ${this.uvtCirculatingSupply.toLocaleString()} UVT`);
            } catch (e) {
                console.log('[ReserveManager] ⚠️ Mint info unavailable yet.');
            }

            // 2. Sync Native SOL context for Tier 1 actualization
            // If our reserveBalance (USD proxy) is zero but we have SOL, bridge the gap.
            const balSol = await walletManager.getPartitionBalance('OPERATIONAL');
            const solPriceUsd = 145; // Rough price for bootstrap
            const actualValueUsd = balSol * solPriceUsd;

            if (this.reserveBalance < actualValueUsd && actualValueUsd > 0.01) {
                console.log(`[ReserveManager] 💹 Synchronizing reserve USD with on-chain context: $${actualValueUsd.toFixed(2)}`);
                this.reserveBalance = actualValueUsd;
                await this.saveState();
            }

        } catch (err) {
            console.warn('[ReserveManager] ⚠️ Failed to fetch live supply, using last known:', err instanceof Error ? err.message : 'Unknown error');
        }
    }

    private async saveState() {
        try {
            await db.collection('treasury').doc('global').set({
                totalProfitRealized: this.totalProfitRealized,
                reserveBalance: this.reserveBalance,
                communityPoolBalance: this.communityPoolBalance,
                restorationBalance: this.restorationBalance,
                circulatingSupply: this.uvtCirculatingSupply, // Cache for UI
                lastUpdated: new Date()
            });
        } catch (err) {
            console.error('[ReserveManager] Failed to save state:', err);
        }
    }

    /**
     * Called whenever an economic method generates profit.
     * Modified for Investor Seniority and Micro-Toll protocol.
     */
    onProfitRealized(profit: number): void {
        if (profit <= 0) return;

        // 1. The Micro-Toll (Direct Metabolic Ingestion)
        const microTollAmount = profit * this.microTollRate;
        const grossProfit = profit - microTollAmount;
        
        this.totalProfitRealized += grossProfit; 
        this.reserveBalance += microTollAmount; // The toll goes straight to operational reservers

        // 2. Identify Yield Priority
        // Is the investor hurdle satisfied (calculated against totalProfitRealized)?
        // For simulation, we treat anything below the cumulative 8% threshold as pure investor yield.
        const currentHurdleThreshold = this.reserveBalance / 10; // Simplified proxy for capital base
        const isHurdleSatisfied = this.investorYieldDistributed > (currentHurdleThreshold * this.investorHurdleRate);

        if (isHurdleSatisfied) {
            // 3. Sovereign Reserve (Plowback) - Only fires AFTER hurdle
            const plowbackAmount = grossProfit * this.plowbackRate;
            this.reserveBalance += plowbackAmount;

            // 4. Community Pool (Tithe)
            const tithingAmount = grossProfit * this.tithingRate;
            this.communityPoolBalance += tithingAmount;

            // 5. Planetary Restoration Fund (Healing)
            const restorationAmount = grossProfit * this.restorationRate;
            this.restorationBalance += restorationAmount;
        } else {
            // All remaining yield flows to the investor leg to clear the hurdle
            this.investorYieldDistributed += grossProfit;
            console.log(`[ReserveManager] Priority: Investor Yield Hurdle ($${grossProfit.toFixed(4)} allocated)`);
        }

        console.log(`[ReserveManager] Toll: $${microTollAmount.toFixed(4)} | Net: $${grossProfit.toFixed(2)} | Reserve: $${this.reserveBalance.toFixed(2)}`);

        this.saveState();
        this.verifyTreasuryNeutrality();
    }

    private verifyTreasuryNeutrality(): void {
        const monthlyRevenue = this.totalProfitRealized; // Simulation: assuming one month of activity
        this.isTreasuryNeutral = monthlyRevenue >= this.monthlyMetabolicCost;

        if (this.isTreasuryNeutral) {
            console.log('[TREASURY] STATUS: TREASURY NEUTRALITY ACHIEVED. Revenue meets metabolic costs.');
        } else {
            // Trigger Metabolic Reflex if neutral condition isn't met
            this.metabolicReflex().catch(e => console.error('[MetabolicReflex] Failure:', e));
        }
    }

    /**
     * ZERO-TAX PROTOCOL: The Metabolic Reflex
     * 
     * If revenue from methods is insufficient to cover the State's cloud substrate,
     * the Reserve Manager autonomously liquidates a portion of the Sovereign Reserve
     * to ensure operational continuity without taxing citizens.
     */
    async metabolicReflex(): Promise<void> {
        const { gcpBilling } = require('../services/gcp-billing-service');
        const overhead = await gcpBilling.getConsolidatedOverhead();
        const liquidReserve = this.reserveBalance;

        if (overhead > 0 && liquidReserve >= overhead) {
            console.log(`[MetabolicReflex] 🧬 INFRASTRUCTURE DEBT DETECTED: $${overhead.toFixed(2)} USD`);
            console.log(`[MetabolicReflex] 🧪 RE-CIRCULATING EQUITY: Transferring $${overhead.toFixed(2)} from Reserve to Operational Substrate.`);
            
            // Effect the liquidation
            this.reserveBalance -= overhead;
            
            // Log to public ledger
            await db.collection('treasury_metabolic_events').add({
                type: 'ZERO_TAX_LIQUIDATION',
                amountUsd: overhead,
                reason: 'INFRASTRUCTURE_OVERHEAD',
                timestamp: new Date().toISOString()
            });

            await personaSubstrate.broadcastUpdate(
                'Zero-Tax Protocol Activated',
                `Promethea has autonomously liquidated $${overhead.toFixed(2)} of equity to cover infrastructure overhead, maintaining 0% citizen tax.`,
                'METABOLIC_EQUILIBRIUM'
            );

            await this.saveState();
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
