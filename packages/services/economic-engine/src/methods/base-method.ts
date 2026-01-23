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
}

export interface ExecutionResult {
    success: boolean;
    revenue: number; // USD
    cost: number; // USD (API costs, gas fees, etc.)
    profit: number; // revenue - cost
    timestamp: number;
    logs: string[];
    error?: string;
}

export abstract class BaseMethod {
    protected config: MethodConfig;
    protected executionCount: number = 0;
    protected totalRevenue: number = 0;
    protected totalCost: number = 0;

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

            // TODO: Log to Firestore /revenue_events collection
            console.log(`[${this.methodName}] Revenue: $${result.revenue}, Cost: $${result.cost}, Profit: $${result.profit}`);

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
