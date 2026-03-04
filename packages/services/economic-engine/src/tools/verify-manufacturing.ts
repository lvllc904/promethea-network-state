import 'dotenv/config';
import { ManufacturingMethod } from '../methods/manufacturing';

async function verifyManufacturing() {
    console.log('[Manufacturing] Verifying Autonomous Production...');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('[Manufacturing] Missing GEMINI_API_KEY');
        process.exit(1);
    }

    const fabAgent = new ManufacturingMethod(apiKey);
    const target = "Sovereign Coin (Simple Cylinder)";
    console.log(`[Manufacturing] Invoking Agent for: ${target}...`);

    try {
        const result = await fabAgent.execute(target);

        console.log('[Manufacturing] Execution completed.');
        if (result.logs && result.logs.length > 0) {
            console.log('[Manufacturing] Logs:\n', result.logs.join('\n'));
        }

        if (result.success) {
            console.log('[Manufacturing] ✅ SUCCESS: Digital Blueprint Created.');
            process.exit(0);
        } else {
            console.error('[Manufacturing] ❌ FAILURE: No blueprint generated.');
            if (result.error) console.error('Error:', result.error);
            process.exit(1);
        }
    } catch (error) {
        console.error('[Manufacturing] Execution Failed:', error);
        process.exit(1);
    }
}

verifyManufacturing();
