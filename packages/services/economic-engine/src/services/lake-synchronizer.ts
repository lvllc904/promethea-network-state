import { db, COLLECTIONS } from '../db';
import { brokerGateway } from '../treasury/broker-gateway';
import { reserveManager } from '../treasury/reserve-manager';
import { taskQueue } from '../scheduler/task-queue';
import { personaSubstrate } from '../tools/persona-substrate';
import { vectorDB } from './vector-db';

export interface LakeSnapshot {
    timestamp: string;
    unix_time: number;
    tradfi: {
        authenticated: boolean;
        netLiquidWorth: number;
        positions: any[];
    };
    defi: any;
    engine: any;
    geopolitics?: any; // To be populated by external Oracles later
}

export class LakeSynchronizer {
    private syncIntervalMs: number = 5 * 60 * 1000; // 5 minutes
    private intervalId: NodeJS.Timeout | null = null;

    public start() {
        console.log('[LakeSynchronizer] 🌊 Initiating Omni-Intel Lake Telemetry Sweep...');
        
        // Run immediately on boot
        this.executeSweep().catch(e => console.error('[LakeSynchronizer] Initial sweep failed:', e));

        // Schedule continuous synchronization
        this.intervalId = setInterval(() => {
            this.executeSweep().catch(e => console.error('[LakeSynchronizer] Sweep failed:', e));
        }, this.syncIntervalMs);
    }

    public stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('[LakeSynchronizer] 🛑 Halting Telemetry Sweep.');
        }
    }

    public async executeSweep() {
        try {
            // 1. Ingest TradFi State
            const tradfiAuth = await brokerGateway.checkAuthentication();
            const netLiquidWorth = await brokerGateway.getNetLiquidWorth();
            const positions = await brokerGateway.getPositions();

            // 2. Ingest DeFi State
            const defiStats = await reserveManager.getStats();

            // 3. Ingest Engine / Method State
            const engineStatus = taskQueue.getStatus();
            const methodStats = taskQueue.getMethods().map(m => m.getStats());

            // 4. Construct the Time-Series Snapshot
            const snapshot: LakeSnapshot = {
                timestamp: new Date().toISOString(),
                unix_time: Date.now(),
                tradfi: {
                    authenticated: tradfiAuth,
                    netLiquidWorth,
                    positions
                },
                defi: defiStats,
                engine: {
                    globalStatus: engineStatus,
                    methods: methodStats
                }
            };

            // 5. Commit to the Omni-Intel Lake
            await db.collection(COLLECTIONS.OMNI_INTEL_LAKE).add({
                type: 'SYSTEM_TELEMETRY',
                payload: snapshot,
                timestamp: snapshot.timestamp
            });

            console.log(`[LakeSynchronizer] 🌊 Telemetry synchronized to Lake. TradFi NLV: $${netLiquidWorth.toLocaleString()}`);

            // Periodically announce the pulse to the Discord Ledger
            if (Math.random() < 0.1) { // 10% chance to report to Discord to avoid spam
                await personaSubstrate.broadcastUpdate(
                    'Omni-Lake Synchronization',
                    `Metabolic sweep complete. TradFi NLV: $${netLiquidWorth.toLocaleString()}, DeFi Liquidity verified.`,
                    'RESERVE_HUB'
                );
            }

            // 6. Vectorize the Semantic Memory
            // We create a human-readable string of the current state so Promethea can query it via NLP later.
            const semanticSummary = `Sovereign Network State Telemetry Snapshot. TradFi Net Liquid Worth: $${netLiquidWorth.toLocaleString()}. Open TradFi Positions: ${positions.length}. DeFi Liquidity Active. Total active AI labor methods: ${engineStatus.registeredMethodsCount}. Current timestamp: ${snapshot.timestamp}.`;
            await vectorDB.indexDocument(semanticSummary, { source: 'LakeSynchronizer', type: 'SystemPulse', unix_time: snapshot.unix_time });

        } catch (error) {
            console.error('[LakeSynchronizer] Error executing sweep:', error);
        }
    }
}

export const lakeSynchronizer = new LakeSynchronizer();
