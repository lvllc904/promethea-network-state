import { reserveManager } from '../treasury/reserve-manager';
import { db, COLLECTIONS } from '../db';
import { laborValidator } from '../tools/labor-validator';

/**
 * Base Method Abstract Class (Phase 3)
 * 
 * All 50 economic methods extend this class.
 * Enforces consistent interface for execution, logging, and revenue tracking.
 */

/**
 * Conservation Tier — Defines how a method behaves relative to CONSERVATION_MODE.
 *
 * ZERO_COST    — Only uses existing API keys (Gemini, etc.) with no real capital at risk.
 *               These ALWAYS run regardless of CONSERVATION_MODE.
 *               Examples: SEO Blog, Newsletter, Synthetic Data, Documentation.
 *
 * LOW_RISK     — Requires small amounts of SOL/tokens already held in treasury.
 *               Runs when CONSERVATION_MODE=false OR treasury has sufficient balance.
 *               Examples: cNFT minting, small DEX swaps, pool seeding.
 *
 * HIGH_RISK    — Requires significant capital and can incur losses.
 *               ONLY runs when CONSERVATION_MODE=false AND treasury balance > $100.
 *               Examples: MEV Executor, Liquidation Bot, Leveraged Staking, Flash Loans.
 */
export type ConservationTier = 'ZERO_COST' | 'LOW_RISK' | 'HIGH_RISK';

export interface MethodConfig {
    enabled: boolean;
    priority: number; // 1-10, higher = more important
    maxExecutionsPerDay: number;
    estimatedRevenue: { min: number; max: number }; // USD per execution
    complexity: number; // 1-10, for Metabolic Optimization (Phase 7.1)
    conservationTier: ConservationTier;
}

export interface ExecutionResult {
    success: boolean;
    revenue: number; // USD
    cost: number; // USD (API costs, gas fees, etc.)
    profit: number; // revenue - cost
    timestamp: number;
    logs: string[];
    modelDID?: string; // Phase 2.3: Tracking labor by model
    error?: string;
}

export abstract class BaseMethod {
    protected config: MethodConfig;
    protected executionCount: number = 0;
    protected totalRevenue: number = 0;
    protected totalCost: number = 0;
    protected modelStats: Record<string, { executions: number; profit: number }> = {};

    private static conservationMode = process.env.CONSERVATION_MODE === 'true';

    constructor(
        public readonly methodId: string,
        public readonly methodName: string,
        config: Partial<MethodConfig> = {}
    ) {
        this.config = {
            enabled: config.enabled ?? true,
            priority: config.priority ?? 5,
            maxExecutionsPerDay: config.maxExecutionsPerDay ?? 10,
            estimatedRevenue: config.estimatedRevenue ?? { min: 0, max: 100 },
            complexity: config.complexity ?? 5,
            conservationTier: config.conservationTier ?? 'LOW_RISK',
        };
    }

    /**
     * Tiered conservation check:
     * - ZERO_COST methods always pass
     * - LOW_RISK passes if CONSERVATION_MODE=false OR Treasury > $1.00
     * - HIGH_RISK passes ONLY if CONSERVATION_MODE=false AND Treasury > $100
     */
    protected isConservationBlocked(): boolean {
        const stats = reserveManager.getStats();
        
        // Tier 0: Narrative/Content/Data (Always Live)
        if (this.config.conservationTier === 'ZERO_COST') return false; 

        // Tier 1: Small on-chain actions (Live if we have > $1.00 gas)
        if (this.config.conservationTier === 'LOW_RISK') {
            if (!BaseMethod.conservationMode || stats.reserveBalance >= 1.0) {
                return false;
            }
        }

        // Tier 2: Major financial risk (Live ONLY if explicit OFF and > $100 buffer)
        if (this.config.conservationTier === 'HIGH_RISK') {
            if (!BaseMethod.conservationMode && stats.reserveBalance >= 100) {
                return false;
            }
        }

        console.log(`[${this.methodName}] 🧊 Blocked — ${this.config.conservationTier} requires higher balance (Current: $${stats.reserveBalance.toFixed(2)})`);
        return true;
    }



    /**
     * Main execution logic - must be implemented by each method
     */
    abstract execute(): Promise<ExecutionResult>;

    /**
     * Omni-Lake Receptor (Iteration 2)
     * Allows the method to snatch raw data packets relevant to its operation.
     */
    async onOmniStimulus(packet: any): Promise<void> {
        // Default implementation is a no-op. Methods override this to ingest active data.
    }

    /**
     * Validation before execution
     */
    async canExecute(): Promise<boolean> {
        if (!this.config.enabled) return false;
        if (this.executionCount >= this.config.maxExecutionsPerDay) return false;
        return true;
    }

    /**
     * Wrapper that handles logging and tracking
     */
    async run(): Promise<ExecutionResult> {
        const canRun = await this.canExecute();
        if (!canRun) {
            return {
                success: false,
                revenue: 0,
                cost: 0,
                profit: 0,
                timestamp: Date.now(),
                logs: ['Execution skipped: method disabled or quota exceeded'],
            };
        }

        const blocked = this.isConservationBlocked();

        try {
            // If conservation is blocked, we still run the method but it should handle 
            // the simulation internally or we return a high-level simulation result.
            // For now, if blocked, we simulate at the Base level to ensure zero risk.
            if (blocked) {
                const simulatedRevenue = Math.random() * (this.config.estimatedRevenue.max - this.config.estimatedRevenue.min) + this.config.estimatedRevenue.min;
                return {
                    success: true,
                    revenue: simulatedRevenue,
                    cost: 0,
                    profit: simulatedRevenue,
                    timestamp: Date.now(),
                    logs: [`[SIMULATION] ${this.methodName} executed in conservation mode.`],
                };
            }

            // ACTUAL EXECUTION: Method is either ZERO_COST or conservation is OFF
            const result = await this.execute();

            // Update tracking
            this.executionCount++;
            this.totalRevenue += result.revenue;
            this.totalCost += result.cost;

            // Track model contribution (Phase 2.3)
            if (result.modelDID) {
                if (!this.modelStats[result.modelDID]) {
                    this.modelStats[result.modelDID] = { executions: 0, profit: 0 };
                }
                this.modelStats[result.modelDID].executions++;
                this.modelStats[result.modelDID].profit += result.profit;
            }

            // Track profit in Sovereign Reserve (Phase 3.1)
            if (result.success && result.profit > 0) {
                reserveManager.onProfitRealized(result.profit);

                // Phase 3.5: Log Revenue Event
                db.collection(COLLECTIONS.REVENUE_EVENTS).add({
                    methodId: this.methodId,
                    methodName: this.methodName,
                    revenue: result.revenue,
                    cost: result.cost,
                    profit: result.profit,
                    modelDID: result.modelDID,
                    timestamp: new Date().toISOString()
                }).catch(err => console.error(`[BaseMethod] Failed to log revenue event: ${err.message}`));

                // Phase 4.1: Hybrid Labor Compensation (UI + Service)
                // If a model or citizen performed the labor, distribute according to their hybrid preferences.
                const performantId = result.modelDID || 'did:prmth:engine:autonomous';

                // For models, we default to 100% Equity (Sovereignty) as they don't need "Capital" yet.
                if (performantId.startsWith('did:prmth:model:')) {
                    const uvtAmount = result.profit * 0.7 * 10;
                    const timestamp = Date.now();
                    const signature = await laborValidator.signLabor({
                        modelDID: performantId,
                        amount: uvtAmount,
                        methodId: this.methodId,
                        timestamp
                    });

                    db.collection(COLLECTIONS.UVT_TRANSFERS).add({
                        ownerId: performantId,
                        amount: uvtAmount,
                        tokenType: 'Labor',
                        assetId: this.methodId,
                        description: `Autonomous Labor Credit: ${this.methodName}`,
                        signature: signature,
                        authority: laborValidator.getAuthorityAddress(),
                        onChainStatus: 'Pending',
                        timestamp: new Date(timestamp).toISOString()
                    }).catch(err => console.error(`[BaseMethod] Failed to mint Labor UVT: ${err.message}`));
                } else {
                    // It's a citizen or other entity, use the CompensationService for Hybrid Split
                    // In a real scenario, we'd pass the actual citizen ID here.
                    // For now, if no modelDID is provided, we simulate the "Core Citizen" payout.
                    // (Assuming the trigger might have been a human action)
                }
            }

            // TODO: Log to Firestore /revenue_events collection
            console.log(`[${this.methodName}] Revenue: $${result.revenue}, Cost: $${result.cost}, Profit: $${result.profit}${result.modelDID ? ` (Labor: ${result.modelDID})` : ''}`);

            return result;
        } catch (error) {
            return {
                success: false,
                revenue: 0,
                cost: 0,
                profit: 0,
                timestamp: Date.now(),
                logs: [],
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Get method statistics
     */
    getStats() {
        return {
            methodId: this.methodId,
            methodName: this.methodName,
            executionCount: this.executionCount,
            totalRevenue: this.totalRevenue,
            totalCost: this.totalCost,
            totalProfit: this.totalRevenue - this.totalCost,
            modelStats: this.modelStats,
            config: this.config,
        };
    }

    /**
     * Enable/disable method
     */
    setEnabled(enabled: boolean): void {
        this.config.enabled = enabled;
    }
}
