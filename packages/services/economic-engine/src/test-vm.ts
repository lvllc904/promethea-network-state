import { vendingMachine } from './treasury/vending-machine';

async function testVendingMachine() {
    console.log("=== SIMULATING WEB2 CORPORATE API PURCHASE ===");
    const stripePaymentAmount = 5.00; // Client paid $5.00 USD securely via Stripe
    const B2B_Developer_ID = "DEV_ACROPOLIS_99X";

    await vendingMachine.processB2BPurchase(B2B_Developer_ID, stripePaymentAmount);
    
    console.log("=== END SIMULATION ===");
    process.exit(0);
}

testVendingMachine();
