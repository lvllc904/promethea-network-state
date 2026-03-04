import 'dotenv/config';
import { SEOBloggingMethod } from '../methods/seo-blog';

async function verifySolvency() {
    console.log('[SolvencyCheck] Verifying Treasury Neutrality...');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('[SolvencyCheck] Missing GEMINI_API_KEY');
        process.exit(1);
    }

    const seoMethod = new SEOBloggingMethod(apiKey);
    console.log('[SolvencyCheck] Invoking SEO Blogging Agent...');

    try {
        const result = await seoMethod.execute();

        console.log('[SolvencyCheck] Execution completed.');
        if (result.logs && result.logs.length > 0) {
            console.log('[SolvencyCheck] Logs:', result.logs.join('\n'));
        }
        if (result.error) {
            console.error('[SolvencyCheck] Method Error:', result.error);
        }

        console.log(`[SolvencyCheck] Profit: $${result.profit.toFixed(2)}`);
        console.log(`[SolvencyCheck] Revenue: $${result.revenue.toFixed(2)}`);
        console.log(`[SolvencyCheck] Cost: $${result.cost.toFixed(2)}`);

        if (result.profit > 0) {
            console.log('[SolvencyCheck] ✅ SUCCESS: System is solvent (Profit > 0).');
            process.exit(0);
        } else {
            console.error('[SolvencyCheck] ❌ FAILURE: System is insolvent (Profit <= 0).');
            process.exit(1);
        }
    } catch (error) {
        console.error('[SolvencyCheck] Execution Failed:', error);
        process.exit(1);
    }
}

verifySolvency();
