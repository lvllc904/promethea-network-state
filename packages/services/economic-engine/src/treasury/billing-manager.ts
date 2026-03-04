
import { db, COLLECTIONS } from '../db';
import * as admin from 'firebase-admin';
import { reserveManager } from './reserve-manager';

/**
 * Sovereign Billing Manager (Phase 4.2)
 * 
 * Handles B2B invoicing and automated payment tracking for AI-as-a-Service bounties.
 */

export interface Invoice {
    id: string;
    clientId: string;
    description: string;
    amount: number;
    currency: 'USD' | 'SOL' | 'ETH';
    status: 'Pending' | 'Paid' | 'Overdue';
    methodId?: string; // Link to the economic method that generated this
    metadata?: Record<string, any>;
    dueDate: any;
    paidAt?: any;
    createdAt: any;
}

export class BillingManager {
    /**
     * Create a new Sovereign Invoice
     */
    async createInvoice(data: Omit<Invoice, 'id' | 'createdAt' | 'status'>): Promise<string> {
        const invoiceRef = await db.collection('invoices').add({
            ...data,
            status: 'Pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`[BillingManager] Invoice created: ${invoiceRef.id} for $${data.amount}`);
        return invoiceRef.id;
    }

    /**
     * Mark an invoice as paid and trigger profit realization
     */
    async markAsPaid(invoiceId: string): Promise<void> {
        const invoiceRef = db.collection('invoices').doc(invoiceId);
        const doc = await invoiceRef.get();

        if (!doc.exists) throw new Error('Invoice not found');

        const data = doc.data() as Invoice;
        await invoiceRef.update({
            status: 'Paid',
            paidAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`[BillingManager] Invoice ${invoiceId} marked as PAID. Amount: $${data.amount}`);

        // Trigger the profit realization in the reserve manager
        // This distributes 30% to reserve, 10% to community, and issues UVT
        reserveManager.onProfitRealized(data.amount);
    }
}

export const billingManager = new BillingManager();
