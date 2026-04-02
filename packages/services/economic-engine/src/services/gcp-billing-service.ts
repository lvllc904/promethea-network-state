import { CloudBillingClient } from '@google-cloud/billing';
import { BudgetServiceClient } from '@google-cloud/billing-budgets';
import { db } from '../db';

/**
 * Sovereign Infrastructure Monitor (Phase 5)
 * 
 * Aggregates real-time GCP spending data to ensure Promethea remains
 * economically sustainable against its infrastructure overhead.
 */
export class GcpBillingService {
    private billingClient: CloudBillingClient;
    private budgetClient: BudgetServiceClient;
    private billingAccountId = '013714-381BD3-5CC571';
    private projectId = 'studio-9105849211-9ba48';

    constructor() {
        this.billingClient = new CloudBillingClient();
        this.budgetClient = new BudgetServiceClient();
    }

    /**
     * Synchronize the latest spending data from the GCP Substrate
     */
    async syncInfrastructureCosts(): Promise<any> {
        try {
            console.log(`[GcpBillingService] Syncing costs for ${this.billingAccountId}...`);
            
            // Step 1: List budgets
            const [budgets] = await this.budgetClient.listBudgets({
                parent: `billingAccounts/${this.billingAccountId}`
            });

            const costReports = budgets.map(budget => {
                const amount = budget.amount?.specifiedAmount;
                const units = amount?.units || '0';
                const nanos = amount?.nanos || 0;
                
                return {
                    budgetName: budget.displayName,
                    threshold: parseFloat(units.toString()) + (nanos / 1000000000),
                    currency: amount?.currencyCode || 'USD',
                    lastSync: new Date().toISOString()
                };
            });

            // Step 2: Extract current spend from the latest Firestore state (updated by callback or manual fetch)
            // Note: Since Google Cloud doesn't provide real-time monthly cost via API directly without BigQuery,
            // we will approximate or integrate with Cloud Monitoring if available.
            // For now, we store the metadata.
            
            await db.collection('infrastructure').doc('gcp-billing').set({
                budgets: costReports,
                billingAccountId: this.billingAccountId,
                updatedAt: new Date().toISOString()
            });

            return costReports;

        } catch (error) {
            console.error('[GcpBillingService] Sync failed:', error instanceof Error ? error.message : error);
            return null;
        }
    }

    /**
     * Get the consolidated "Overhead" for the current period
     */
    async getConsolidatedOverhead(): Promise<number> {
        const doc = await db.collection('infrastructure').doc('gcp-billing').get();
        if (!doc.exists) return 0;
        
        const data = doc.data();
        if (!data || !data.budgets) return 0;

        // Sum up the known threshold amounts for safety budgeting 
        // Real-time spend will eventually be wired to BigQuery
        return data.budgets.reduce((acc: number, b: any) => acc + (b.threshold || 0), 0);
    }
}

export const gcpBilling = new GcpBillingService();
