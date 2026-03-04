import { reserveManager } from '../treasury/reserve-manager';
import { db, COLLECTIONS } from '../db';
import * as admin from 'firebase-admin';
import { laborValidator } from '../tools/labor-validator';

/**
 * Base Method Abstract Class (Phase 3)
 * 
 * All 50 economic methods extend this class.
 * Enforces consistent interface for execution, logging, and revenue tracking.
 */

export interface MethodConfig {
    enabled: boolean;
    priority: number; // 1-10, higher = more important
    maxExecutionsPerDay: number;
    estimatedRevenue: { min: number; max: number }; // USD per execution
    complexity: number; // 1-10, for Metabolic Optimization (Phase 7.1)
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
        };
    }

    /**
     * Main execution logic - must be implemented by each method
     */
    abstract execute(): Promise<ExecutionResult>;

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

        try {
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

                // Phase 3.5: Log Revenue Event to Firestore
                db.collection(COLLECTIONS.REVENUE_EVENTS).add({
                    methodId: this.methodId,
                    methodName: this.methodName,
                    revenue: result.revenue,
                    cost: result.cost,
                    profit: result.profit,
                    modelDID: result.modelDID,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                }).catch(err => console.error(`[BaseMethod] Failed to log revenue event: ${err.message}`));

                // Phase 4.1: Hybrid Labor Compensation (UI + Service)
                // If a model or citizen performed the labor, distribute according to their hybrid preferences.
                const performantId = result.modelDID || 'did:prmth:engine:autonomous';

                // For models, we default to 100% Equity (Sovereignty) as they don't need "Capital" yet.
                // For citizens, we look up their preferences in CompensationService.
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
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
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
