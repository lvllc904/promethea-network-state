import { taskQueue } from '../scheduler/task-queue';
import { BaseMethod } from '../methods/base-method';

/**
 * Economic Orchestrator (Phase 4.1: Hyper-Scale Execution)
 * 
 * Analyzes ROI across all 50 economic methods and dynamically
 * adjusts execution frequency and priority based on profitability.
 */

export class EconomicOrchestrator {
    private isRunning: boolean = false;
    private optimizationInterval: number = 6 * 60 * 60 * 1000; // Optimize every 6 hours

    /**
     * Start the optimization loop
     */
    async start(): Promise<void> {
        if (this.isRunning) return;
        this.isRunning = true;

        console.log('[EconomicOrchestrator] 🚀 Hyper-Scale Optimization Loop Active');

        while (this.isRunning) {
            try {
                await this.optimize();
            } catch (error) {
                console.error(`[EconomicOrchestrator] ❌ Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            await this.sleep(this.optimizationInterval);
        }
    }

    /**
     * Perform ROI analysis and re-scheduling
     */
    private async optimize(): Promise<void> {
        console.log('[EconomicOrchestrator] Analyzing Institutional ROI across 50 methods...');
        const methods = taskQueue.getMethods();

        if (methods.length === 0) {
            console.log('[EconomicOrchestrator] ⚠️ No methods registered yet. Skipping optimization.');
            return;
        }

        for (const method of methods) {
            const stats = method.getStats();

            // Skip methods that haven't run yet
            if (stats.executionCount === 0) {
                continue;
            }

            const roi = stats.totalProfit / (stats.totalCost || 0.1); // Avoid division by zero

            // Strategy: Hyper-Scale high performers, Normalize others
            if (roi > 20) {
                // Exceptional ROI: Max out frequency
                console.log(`[EconomicOrchestrator] 🔥 HYPER-SCALING ${method.methodName} (ROI: ${roi.toFixed(1)}x)`);
                taskQueue.schedule(method.methodId, 10); // Highest priority
                taskQueue.schedule(method.methodId, 10); // Queue twice for double frequency
            } else if (roi > 5) {
                // High ROI: Increase priority
                console.log(`[EconomicOrchestrator] 📈 Boosting ${method.methodName} (ROI: ${roi.toFixed(1)}x)`);
                taskQueue.schedule(method.methodId, 8);
            } else if (roi < 0) {
                // Negative ROI: Cool down
                console.log(`[EconomicOrchestrator] ❄️ Cooling down ${method.methodName} (Profit: -$${Math.abs(stats.totalProfit).toFixed(2)})`);
                // Don't auto-schedule; let the daily cycle handle it with low priority
            } else {
                // Steady performer: Regular priority
                taskQueue.schedule(method.methodId, 5);
            }
        }

        console.log('[EconomicOrchestrator] ✅ Optimization cycle complete.');
    }

    /**
     * Stop the orchestrator
     */
    stop(): void {
        this.isRunning = false;
        console.log('[EconomicOrchestrator] Stopped.');
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export const economicOrchestrator = new EconomicOrchestrator();
