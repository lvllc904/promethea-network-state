// @ts-check
// This script runs the Penny Test logic defined in the compiled @promethea/lib package.
require('dotenv').config();
const { runPennyTest } = require('../packages/lib/dist/transaction/pennyTest');

async function executeTest() {
    console.log("[SENTINEL] Executing Constitutional Verification: Penny Test...");

    // The runPennyTest function handles env var validation and the transaction.
    try {
        const result = await runPennyTest();

        if (result.success) {
            console.log(`[SENTINEL] RING 1 SUCCESS: Financial Sovereignty Verified. Tx Hash: ${result.hash}`);
            process.exit(0);
        } else {
            console.error(`[SENTINEL] RING 1 FAILURE: Financial Sovereignty Check Failed. Error: ${result.error}`);
            process.exit(1);
        }
    } catch (err) {
        console.error(`[SENTINEL] UNEXPECTED ERROR: ${err.message}`);
        process.exit(1);
    }
}

executeTest();
