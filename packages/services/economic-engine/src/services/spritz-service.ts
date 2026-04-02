import axios from 'axios';
import { db } from '../db';

/**
 * Sovereign Settlement Service (Phase 5)
 * 
 * Integrates with Spritz Finance to allow Promethea to autonomously 
 * pay real-world bills (GCP Infrastructure) from her Solana treasury.
 */
export class SpritzService {
    private apiKey: string;
    private baseUrl: string = 'https://platform.spritz.finance/v1';

    constructor() {
        this.apiKey = '';
    }

    private async ensureApiKey() {
        if (!this.apiKey) {
            const { vaultService } = require('./vault-service');
            this.apiKey = await vaultService.getSecret('SPRITZ_API_KEY');
        }
    }

    private async getHeaders() {
        await this.ensureApiKey();
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * List all connected bills for the Network State
     */
    async listBills(): Promise<any[]> {
        await this.ensureApiKey();
        if (!this.apiKey) {
            console.error('[SpritzService] Missing API Key in Vault');
            return [];
        }

        try {
            const response = await axios.get(`${this.baseUrl}/payable-accounts`, {
                headers: await this.getHeaders()
            });
            return response.data;
        } catch (error: any) {
            console.error('[SpritzService] Failed to list bills:', error.response?.data || error.message);
            return [];
        }
    }

    /**
     * Get details for a specific bill
     */
    async getBillDetails(billId: string): Promise<any> {
        try {
            const response = await axios.get(`${this.baseUrl}/payable-accounts/${billId}`, {
                headers: await this.getHeaders()
            });
            return response.data;
        } catch (error: any) {
            console.error(`[SpritzService] Failed to get bill ${billId}:`, error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Settle a bill using Promethea's treasury (SOL/USDC)
     * @param billId The Spritz Payable Account ID
     * @param amountUsd The amount to pay in USD
     */
    async settleBill(billId: string, amountUsd: number): Promise<string | null> {
        console.log(`[SpritzService] 🏛️ Initiating settlement for Bill ${billId}: $${amountUsd}`);

        try {
            // Note: In a production autonomous flow, we would first verify 
            // that the SOL balance is sufficient.
            
            const response = await axios.post(`${this.baseUrl}/payments`, {
                payableAccountId: billId,
                amount: Math.floor(amountUsd * 100), // Spritz typically use smallest unit (cents)
                // sourceId: '...', // We would specify the connected Solana wallet ID here
            }, {
                headers: await this.getHeaders()
            });

            const paymentId = response.data.id;
            console.log(`[SpritzService] ✅ Settlement Successful. Payment ID: ${paymentId}`);

            // Log event to Firestore for public transparency
            await db.collection('treasury_events').add({
                type: 'FISCAL_SETTLEMENT',
                billerId: billId,
                amountUsd,
                paymentId,
                status: 'Completed',
                timestamp: new Date()
            });

            return paymentId;

        } catch (error: any) {
            console.error('[SpritzService] Settlement Failed:', error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Autonomous Metabolic Sync
     * Triggered by the Economic Orchestrator to check if bills are due
     */
    async syncAndSettleMetabolicDebts(): Promise<void> {
        console.log('[SpritzService] 🛰️ Checking metabolic debt queue...');
        const bills = await this.listBills();

        for (const bill of bills) {
            const amountDue = bill.billAccountDetails?.amountDue || 0;
            const isGcp = bill.name?.toLowerCase().includes('google') || bill.institution?.name?.toLowerCase().includes('google');

            if (amountDue > 0 && isGcp) {
                console.log(`[SpritzService] ⚠️ Found due GCP Infrastructure bill: $${amountDue}`);
                // Automate settlement if thresholds are met
                await this.settleBill(bill.id, amountDue);
            }
        }
    }
}

export const spritzService = new SpritzService();
