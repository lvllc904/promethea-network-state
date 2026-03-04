import 'dotenv/config';
import { billingManager } from '../treasury/billing-manager';
import { db } from '../db';

async function testBilling() {
    console.log('--- Billing & Invoicing Verification ---');

    // 1. Create a simulated B2B invoice
    const invoiceId = await billingManager.createInvoice({
        clientId: 'test-client-b2b',
        description: 'AI-as-a-Service: Monthly Retainer',
        amount: 500,
        currency: 'USD',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    console.log(`[Test] Created Invoice: ${invoiceId}`);

    // 2. Mark it as paid
    console.log(`[Test] Marking invoice as PAID...`);
    await billingManager.markAsPaid(invoiceId);

    // 3. Verify status in Firestore
    const doc = await db.collection('invoices').doc(invoiceId).get();
    const data = doc.data();

    if (data?.status === 'Paid') {
        console.log('✅ [Test] Invoice Payment Verified');
        console.log(`   Internal Profit Realized: $${data.amount}`);
    } else {
        console.error('❌ [Test] Invoice Status Mismatch:', data?.status);
    }

    process.exit(0);
}

testBilling().catch(err => {
    console.error('❌ [Test] Billing Test Failed:', err.message);
    process.exit(1);
});
