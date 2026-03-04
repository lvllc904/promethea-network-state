import 'dotenv/config';
import { LandScannerMethod } from '../methods/land-scanner';

async function verifyLandScanner() {
    console.log('[LandScanner] Verifying Sovereign Asset Identification...');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('[LandScanner] Missing GEMINI_API_KEY');
        process.exit(1);
    }

    const scanner = new LandScannerMethod(apiKey);
    console.log('[LandScanner] Invoking Agent...');

    try {
        const result = await scanner.execute();

        console.log('[LandScanner] Execution completed.');
        if (result.logs && result.logs.length > 0) {
            console.log('[LandScanner] Logs:\n', result.logs.join('\n'));
        }

        if (result.success) {
            console.log('[LandScanner] ✅ SUCCESS: Land Candidate Identified.');
            process.exit(0);
        } else {
            console.error('[LandScanner] ❌ FAILURE: No candidate found or error occurred.');
            if (result.error) console.error('Error:', result.error);
            process.exit(1);
        }
    } catch (error) {
        console.error('[LandScanner] Execution Failed:', error);
        process.exit(1);
    }
}

verifyLandScanner();
