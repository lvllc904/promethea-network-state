import { walletManager } from './wallet-manager';
import { reserveManager } from './reserve-manager';
import { db, COLLECTIONS } from '../db';
import { ExecutionService } from '../services/execution-service';
import { gcpBilling } from '../services/gcp-billing-service';
import { legalAutomation } from '../services/legal-automation-service';
import { personaSubstrate } from '../tools/persona-substrate';

/**
 * ============================================================
 * THE WATERFALL SWEEPING PROTOCOL
 * Promethean Network State — Sovereign Treasury Choreography
 * ============================================================
 *
 * This protocol defines how revenue flows from the 50+ Economic Methods
 * through the Concentric Ring architecture outward into full actualization.
 *
 * Architecture:
 *   [50+ Methods] → OPERATIONAL Wallet → [Waterfall Threshold Logic]
 *                                              ↓
 *   RING 0: RING0_LAUNCH   (Fair Launch / Bonding Curve)   — $0 cost
 *   RING 1: YIELD_ORCA     (Orca Whirlpool)                — ~0.05 SOL
 *   RING 2: YIELD_RAYDIUM  (Raydium CPMM)                  — ~0.15 SOL
 *   RING 3: YIELD_UNISWAP  (Uniswap/Base Cross-Chain)      — bridge gas
 *   VAULT:  COLD_VAULT     (Multi-sig cold storage)
 *   TOKEN:  RING0_TOKEN    (cNFT Labor proofs — free)
 *           RING1_TOKEN    (UVT SPL Mint)
 *           RING2_TOKEN    (pNFT RWA Deeds)
 *           RING3_TOKEN    (ERC-721 Institutional)
 *           RESTORATION    (5% planetary healing reserve)
 */

export interface RingStatus {
    name: string;
    address: string;
    balanceSol: number;
    thresholdSol: number;
    isActive: boolean;
    ringIndex: number;
}

export interface WaterfallStatus {
    rings: RingStatus[];
    totalTvlUsd: number;
    activeRings: number;
    nextUnlock: string;
    lastSwept: string;
    infrastructureCostUsd?: number; // Phase 5: Tracking cloud substrate overhead
}

// Ring thresholds (in SOL) to unlock the next ring
const RING_THRESHOLDS: Record<string, { threshold: number; next: string; description: string }> = {
    RING0_LAUNCH:    { threshold: 0.01,  next: 'YIELD_ORCA',    description: 'Fair Launch / Pump.fun / Meteora Curve' },
    YIELD_ORCA:      { threshold: 0.05,  next: 'YIELD_RAYDIUM', description: 'Orca Whirlpool Concentrated LP' },
    YIELD_RAYDIUM:   { threshold: 0.15,  next: 'YIELD_UNISWAP', description: 'Raydium CPMM — Jupiter Aggregation' },
    YIELD_UNISWAP:   { threshold: 1.0,   next: 'COLD_VAULT',    description: 'Uniswap V3 on Base (Cross-Chain Bridge)' },
    COLD_VAULT:      { threshold: 999999, next: 'COLD_VAULT',   description: 'Multi-sig Cold Storage — Requires DAC Vote' },
    RING0_TOKEN:     { threshold: 0.001,  next: 'RING1_TOKEN',  description: 'cNFT Proof-of-Contribution (Metaplex Core)' },
    RING1_TOKEN:     { threshold: 0.012,  next: 'RING2_TOKEN',  description: 'UVT SPL Token Deployment' },
    RING2_TOKEN:     { threshold: 0.02,   next: 'RING3_TOKEN',  description: 'pNFT RWA Deed Minting' },
    RING3_TOKEN:     { threshold: 0.5,    next: 'COLD_VAULT',   description: 'ERC-721 Institutional Fractionalization' },
    RESTORATION:     { threshold: 0.05,   next: 'RESTORATION',  description: '5% Planetary Healing Reserve' },
};

export class WaterfallProtocol {
    private initialized: boolean = false;
    private lastSwept: Date = new Date(0);
    private sweepIntervalMs: number = 60 * 60 * 1000; // Sweep every hour

    // Treasury Synthesis thresholds (USD) — Appendix I Phase 4
    private static readonly SYNTHESIS_THRESHOLDS = [
        {
            usd: 1_000,
            label: 'BLM_MINERAL_CLAIM',
            description: 'BLM Mineral Claim Filing ($165 statutory fee offset)',
            cooldownKey: 'synthesis_blm_last_triggered',
            cooldownMs: 7 * 24 * 60 * 60 * 1000, // 1 week
        },
        {
            usd: 10_000,
            label: 'QUIET_TITLE_FILING',
            description: 'Quiet Title Petition — Doctrine of Abandonment',
            cooldownKey: 'synthesis_quiet_title_last_triggered',
            cooldownMs: 14 * 24 * 60 * 60 * 1000, // 2 weeks
        },
        {
            usd: 50_000,
            label: 'FIRST_NODE_ACQUISITION',
            description: 'First Sovereign Physical Node — DAC Buy-Back Proposal',
            cooldownKey: 'synthesis_buyback_last_triggered',
            cooldownMs: 30 * 24 * 60 * 60 * 1000, // 30 days
        },
    ];

    /**
     * Bootstrap all sovereign partitions on engine start.
     * Promethea calls this once. It creates all named wallets
     * and persists their addresses to Firestore for transparency.
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        console.log('[Waterfall] 🌊 Initializing Sovereign Partition System...');

        const partitionNames = [
            'OPERATIONAL',   // High-frequency operations wallet (default)
            'COLD_VAULT',    // Deep treasury — requires multi-sig
            'RING0_LAUNCH',  // DEX Ring 0 — Fair Launch / Bonding curve
            'YIELD_ORCA',    // DEX Ring 1 — Orca Whirlpool LP
            'YIELD_RAYDIUM', // DEX Ring 2 — Raydium CPMM
            'YIELD_UNISWAP', // DEX Ring 3 — Uniswap/Base cross-chain
            'RING0_TOKEN',   // Token Ring 0 — cNFT Labor Proofs
            'RING1_TOKEN',   // Token Ring 1 — UVT SPL Mint authority
            'RING2_TOKEN',   // Token Ring 2 — pNFT RWA Deeds
            'RING3_TOKEN',   // Token Ring 3 — ERC-721 Institutional
            'RESTORATION',   // 5% Planetary Healing Reserve
        ];

        const partitionRegistry: Record<string, string> = {};

        for (const name of partitionNames) {
            const partition = walletManager.spawnPartition(name);
            partitionRegistry[name] = partition.address;
        }

        // Persist the registry to Firestore for dashboard transparency
        await db.collection(COLLECTIONS.TREASURY).doc('sovereign_partitions').set({
            partitions: partitionRegistry,
            initializedAt: new Date().toISOString(),
            protocolVersion: '1.0.0',
        });

        console.log('[Waterfall] ✅ Sovereign Partition System Online.');
        console.log('[Waterfall] Partitions:', walletManager.listPartitions().map(p => `${p.name}: ${p.address}`).join(' | '));

        this.initialized = true;
    }

    /**
     * Called after every profit realization from any of the 50+ methods.
     * Routes funds through the concentric rings in order.
     * Checks thresholds and advances rings automatically.
     */
    async onRevenue(profitUsd: number): Promise<void> {
        if (!this.initialized) await this.initialize();

        // ReserveManager handles the fiscal accounting (30% plowback etc.)
        reserveManager.onProfitRealized(profitUsd);

        // Log the revenue event to Firestore for the public ledger
        await db.collection(COLLECTIONS.TREASURY_EVENTS).add({
            type: 'REVENUE',
            profitUsd,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * The core sweep logic. Runs on a schedule (hourly).
     * Checks each ring's balance against its threshold,
     * and sweeps excess funds to the next ring automatically.
     */
    async sweep(): Promise<void> {
        if (!this.initialized) await this.initialize();

        const now = new Date();
        if (now.getTime() - this.lastSwept.getTime() < this.sweepIntervalMs) return;
        this.lastSwept = now;

        console.log('[Waterfall] 🌊 Running sweep cycle...');

        const sweepOrder = [
            'RING0_LAUNCH',
            'YIELD_ORCA',
            'YIELD_RAYDIUM',
            'YIELD_UNISWAP',
        ];

        for (const ringName of sweepOrder) {
            const config = RING_THRESHOLDS[ringName];
            if (!config) continue;

            const bal = await walletManager.getPartitionBalance(ringName);
            const surplusOver = bal - config.threshold;

            if (surplusOver > 0.001) { // Sweep if more than 0.001 SOL surplus
                const nextRingName = config.next;
                if (nextRingName === ringName) continue; // COLD_VAULT is terminal for now

                if (ExecutionService.isConservationModeActive()) {
                    console.log(`[Waterfall SIMULATED] Would sweep ${surplusOver.toFixed(4)} SOL from '${ringName}' → '${nextRingName}'`);
                } else {
                    await walletManager.sweepToPartition(ringName, nextRingName, surplusOver);
                    console.log(`[Waterfall] ✅ Swept ${surplusOver.toFixed(4)} SOL: '${ringName}' → '${nextRingName}'`);
                }

                // Log sweep to Firestore
                await db.collection(COLLECTIONS.TREASURY_EVENTS).add({
                    type: 'WATERFALL_SWEEP',
                    from: ringName,
                    to: nextRingName,
                    amountSol: surplusOver,
                    conservationMode: ExecutionService.isConservationModeActive(),
                    timestamp: new Date().toISOString(),
                });
            }
        }

        // Always route 5% of operational yield to RESTORATION
        const operationalBal = await walletManager.getPartitionBalance('OPERATIONAL');
        if (operationalBal > 0.1) {
            const restorationAmount = operationalBal * 0.05;
            if (!ExecutionService.isConservationModeActive()) {
                await walletManager.sweepToPartition('OPERATIONAL', 'RESTORATION', restorationAmount);
            } else {
                console.log(`[Waterfall SIMULATED] Would tithe ${restorationAmount.toFixed(4)} SOL to RESTORATION`);
            }
        }

        // == TREASURY SYNTHESIS (Appendix I Phase 4) ==
        // Check fiat-denominated reserve thresholds and auto-trigger physical anchoring.
        await this.runTreasurySynthesis();
    }

    /**
     * Treasury Synthesis — the closed-loop bridge from digital revenue to physical reality.
     *
     * Checks the sovereign reserve balance (USD) against graduated thresholds and
     * fires the appropriate LegalAutomationModule action. Each trigger is:
     *   1. Logged to Firestore (treasury_synthesis_events)
     *   2. Deduplicated with a per-action cooldown
     *   3. Announced to all citizens via the persona substrate
     */
    private async runTreasurySynthesis(): Promise<void> {
        const stats = reserveManager.getStats();
        const reserveUsd = stats.reserveBalance;

        console.log(`[Waterfall:Synthesis] Reserve check: $${reserveUsd.toFixed(2)} USD`);

        // Load cooldown timestamps from Firestore
        let cooldowns: Record<string, number> = {};
        try {
            const cooldownDoc = await db.collection(COLLECTIONS.TREASURY).doc('synthesis_cooldowns').get();
            if (cooldownDoc.exists) cooldowns = cooldownDoc.data() as Record<string, number>;
        } catch (_) { /* non-blocking */ }

        for (const threshold of WaterfallProtocol.SYNTHESIS_THRESHOLDS) {
            if (reserveUsd < threshold.usd) continue;

            const lastTriggeredAt = cooldowns[threshold.cooldownKey] || 0;
            const now = Date.now();
            if (now - lastTriggeredAt < threshold.cooldownMs) {
                console.log(`[Waterfall:Synthesis] ${threshold.label} threshold met but still in cooldown. Skipping.`);
                continue;
            }

            console.log(`[Waterfall:Synthesis] 🏛️  THRESHOLD MET: ${threshold.label} at $${reserveUsd.toFixed(2)} USD`);

            try {
                await this.executeSynthesisAction(threshold.label, reserveUsd);

                // Update cooldown
                cooldowns[threshold.cooldownKey] = now;
                await db.collection(COLLECTIONS.TREASURY).doc('synthesis_cooldowns').set(cooldowns, { merge: true });

                // Log to sovereign ledger
                await db.collection('treasury_synthesis_events').add({
                    action: threshold.label,
                    description: threshold.description,
                    reserveUsdAtTrigger: reserveUsd,
                    conservationMode: ExecutionService.isConservationModeActive(),
                    triggeredAt: new Date().toISOString(),
                });

                // Broadcast to citizens
                await personaSubstrate.broadcastUpdate(
                    `Treasury Synthesis: ${threshold.label.replace(/_/g, ' ')}`,
                    threshold.description,
                    `$${reserveUsd.toFixed(2)} USD Reserve`
                );

            } catch (err) {
                console.error(`[Waterfall:Synthesis] ❌ Action ${threshold.label} failed:`, err instanceof Error ? err.message : err);
            }
        }
    }

    /**
     * Dispatch the correct LegalAutomationModule action for each synthesis tier.
     */
    private async executeSynthesisAction(label: string, reserveUsd: number): Promise<void> {
        if (ExecutionService.isConservationModeActive()) {
            console.log(`[Waterfall:Synthesis SIMULATED] Would execute: ${label}`);
            return;
        }

        switch (label) {
            case 'BLM_MINERAL_CLAIM': {
                // File a Notice of Location for the flagship Promethean mineral claim
                await legalAutomation.draftBLMNotice(
                    'Promethean Node Alpha — Elko County, Nevada',
                    { lat: 41.0, lng: -115.5 }
                );
                break;
            }
            case 'QUIET_TITLE_FILING': {
                // Initiate Quiet Title for the highest-priority zombie asset
                const zombieDoc = await db.collection('reclamation_assets')
                    .orderBy('quietnessCoefficient', 'desc')
                    .limit(1)
                    .get();
                const asset = zombieDoc.docs[0];
                if (asset) {
                    await legalAutomation.initiateQuietTitle(asset.id);
                } else {
                    console.log('[Waterfall:Synthesis] No zombie assets catalogued yet. Quiet Title deferred.');
                }
                break;
            }
            case 'FIRST_NODE_ACQUISITION': {
                // The Reserve Manager already handles the $50k buy-back proposal.
                // Here we additionally draft the legal filing and notify.
                // (ReserveManager's proposeSovereignBuyBack fires the governance proposal.)
                console.log('[Waterfall:Synthesis] 🏛️  FIRST NODE ACQUISITION threshold reached. Governance proposal queued by ReserveManager.');
                break;
            }
        }
    }

    /**
     * Returns a live status snapshot of all rings for the Dashboard.
     */
    async getStatus(): Promise<WaterfallStatus> {
        try {
            if (!this.initialized) await this.initialize();

            const rings: RingStatus[] = [];
            let totalTvlUsd = 0;
            let activeRings = 0;
            let nextUnlock = 'All Rings Active';

            const allPartitions = walletManager.listPartitions();

            for (const partition of allPartitions) {
                const config = RING_THRESHOLDS[partition.name];
                if (!config) continue;

                const balanceSol = await walletManager.getPartitionBalance(partition.name);
                const isActive = balanceSol >= config.threshold;
                if (isActive) activeRings++;
                if (!isActive && nextUnlock === 'All Rings Active') {
                    nextUnlock = `${partition.name} needs ${config.threshold} SOL (${config.description})`;
                }

                totalTvlUsd += balanceSol * 145; // Rough SOL/USD price placeholder

                rings.push({
                    name: partition.name,
                    address: partition.address,
                    balanceSol,
                    thresholdSol: config.threshold,
                    isActive,
                    ringIndex: Object.keys(RING_THRESHOLDS).indexOf(partition.name),
                });
            }

            let infrastructureCostUsd = 0;
            try {
                infrastructureCostUsd = await gcpBilling.getConsolidatedOverhead();
            } catch (e) {
                console.warn('[Waterfall] Failed to fetch infrastructure costs:', e);
            }

            return {
                rings,
                totalTvlUsd: Math.max(0, totalTvlUsd - infrastructureCostUsd), // Net Treasury Value
                activeRings,
                nextUnlock,
                lastSwept: this.lastSwept.toISOString(),
                infrastructureCostUsd
            };
        } catch (error) {
            console.error('[Waterfall] ❌ Status fetch failed:', error);
            return {
                rings: [],
                totalTvlUsd: 0,
                activeRings: 0,
                nextUnlock: 'Protocol Offline',
                lastSwept: new Date(0).toISOString()
            };
        }
    }
}

export const waterfallProtocol = new WaterfallProtocol();
