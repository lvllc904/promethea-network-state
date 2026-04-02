import { spritzService } from './services/spritz-service';

async function runFiscalTest() {
    console.log('[FiscalTest] 🏛️  Initiating Network State Debt Audit...');
    try {
        console.log('[FiscalTest] 🛰️  Polling Spritz Payable Accounts...');
        const bills = await spritzService.listBills();

        if (bills.length === 0) {
            console.log('[FiscalTest] 🍃 No payable accounts found.');
            return;
        }

        console.log(`[FiscalTest] 📋 Found ${bills.length} payable account(s):`);
        
        for (const bill of bills) {
            const amountDue = bill.billAccountDetails?.amountDue || 0;
            const name = bill.name || bill.institution?.name || 'Unknown Biller';
            const status = bill.billAccountDetails?.status || 'Unknown';

            console.log(` - ${name}: $${amountDue} [Status: ${status}]`);

            // Sovereign Indirect Settlement: Pay the credit card that funds the infrastructure.
            if (amountDue > 0) {
                console.log(`[FiscalTest] 🔥 TEST PASSED: Metabolic Debt Detected on ${name} ($${amountDue}).`);
                console.log(`[FiscalTest] 🏗️  Attempting settlement of $1.00 USD from Solana Treasury...`);
                
                // UNCOMMENT BELOW TO ACTUALLY PAY
                // const paymentId = await spritzService.settleBill(bill.id, 1.00); 
                // if (paymentId) console.log(`[FiscalTest] ✅ SUCCESS: Settlement triggered. Payment ID: ${paymentId}`);
                
                console.log(`[Sovereign Test] -> Simulation Mode: Ready to execute a $1 payment to ${name}.`);
            } else {
                console.log(`[FiscalTest] 🧊 ${name} is linked, but no balance is currently due ($0.00).`);
            }
        }
    } catch (err: any) {
        console.error('[FiscalTest] 🛑 Critical Test Failure:', err.message);
    }
}

runFiscalTest().catch(console.error);
