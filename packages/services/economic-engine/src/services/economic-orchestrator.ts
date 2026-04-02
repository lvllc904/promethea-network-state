import { taskQueue } from '../scheduler/task-queue';
import { BaseMethod } from '../methods/base-method';
import { waterfallProtocol } from '../treasury/waterfall-protocol';
import { reclamationService } from './reclamation-service';
import { legalAutomation } from './legal-automation-service';
import { grantService } from './grant-automation-service';
import { bankingBridge } from './banking-bridge-service';

/**
 * Economic Orchestrator (Phase 4.1: Hyper-Scale Execution)
 * 
 * Analyzes ROI across all 50 economic methods and dynamically
 * adjusts execution frequency and priority based on profitability.
 */

export class EconomicOrchestrator {
    private isRunning: boolean = false;
    private optimizationInterval: number = process.env.CONSERVATION_MODE === 'true' 
        ? 24 * 60 * 60 * 1000  // 24 hours
        : 6 * 60 * 60 * 1000;  // 6 hours

    /**
     * Start the optimization loop
     */
    async start(): Promise<void> {
        if (this.isRunning) return;
        this.isRunning = true;

        console.log('[EconomicOrchestrator] 🚀 Hyper-Scale Optimization Loop Active');

        // Initialize the Waterfall Protocol & Sovereign Partition System
        await waterfallProtocol.initialize();

        while (this.isRunning) {
            try {
                await this.optimize();
                // Run the waterfall sweep every cycle
                await waterfallProtocol.sweep();

                // Phase 6: Physical Anchoring (V1.2.0)
                // Identifying unappropriated BLM mineral claims and "Zombie" assets
                const blmDiscovery = await reclamationService.scanBLMMineralRights();
                if (blmDiscovery.priority === 'High') {
                    await legalAutomation.draftBLMNotice(blmDiscovery.location, blmDiscovery.coordinates!);
                }

                const zombieDiscovery = await reclamationService.scanZombieAssets();
                if (zombieDiscovery.quietnessCoefficient! > 0.85) {
                    await legalAutomation.initiateQuietTitle(zombieDiscovery.id);
                }

                // Phase 7: Capital Ingestion (V1.1.0)
                // Discovering and drafting technical proposals for environmental grants
                const opportunities = await grantService.discoverOpportunities();
                for (const op of opportunities) {
                    if (op.relevanceScore > 0.95) {
                        await grantService.draftProposal(op.id);
                    }
                }
                
                await bankingBridge.scanIncomingACH();

                // Phase 5: Autonomous Metabolic Settlement (Paying the Bills)
                // The physical bridge is established via Path A (Coinbase CDP)
                const { coinbaseService } = require('./coinbase-service');
                const { headlessGcpBillingService } = require('./headless-gcp-billing-service');
                
                // Triggering a base metabolic clearance of the infrastructure cost ($175.00 USD)
                // In a future loop, this will dynamically query the GCP Billing API for the exact cent.
                const fiatPushSuccess = await coinbaseService.offrampSolToFiat(175.00);

                if (fiatPushSuccess) {
                    console.log(`[EconomicOrchestrator] ⏱️ Injecting a 5-minute cryptographic settlement window...`);
                    // We must wait for traditional fiat rails (Debit Push) to officially credit the Varo Card. 
                    // If we fire the Google pull instantly, the card will decline due to banking latency.
                    await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));

                    // Option B: The Headless Bruiser
                    // Actively forces Google to pull the fiat instantly via DOM manipulation
                    await headlessGcpBillingService.forceManualPayment();
                } else {
                    console.error(`[EconomicOrchestrator] 🛑 Fiat block failed. Aborting Headless DOM sweep to prevent checking NSF cards.`);
                }
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

            // Route ALL profit through the Waterfall Protocol
            if (stats.totalProfit > 0) {
                // Calculate profit delta since last cycle (simplified: use per-execution average)
                const profitDelta = stats.totalProfit / stats.executionCount;
                await waterfallProtocol.onRevenue(profitDelta);
            }

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
