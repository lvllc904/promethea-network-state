import { walletManager } from './wallet-manager';
import { reserveManager } from './reserve-manager';
import { db, COLLECTIONS } from '../db';
import { ExecutionService } from '../services/execution-service';
import { gcpBilling } from '../services/gcp-billing-service';

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
    }

    /**
     * Returns a live status snapshot of all rings for the Dashboard.
     */
    async getStatus(): Promise<WaterfallStatus> {
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

        const infrastructureCostUsd = await gcpBilling.getConsolidatedOverhead();

        return {
            rings,
            totalTvlUsd: totalTvlUsd - infrastructureCostUsd, // Net Treasury Value
            activeRings,
            nextUnlock,
            lastSwept: this.lastSwept.toISOString(),
            infrastructureCostUsd
        };
    }
}

export const waterfallProtocol = new WaterfallProtocol();
