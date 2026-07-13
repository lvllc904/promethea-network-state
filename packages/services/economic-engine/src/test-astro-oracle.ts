import 'dotenv/config';
import { AstroOracleService } from './services/astro-oracle';

async function run() {
    console.log('[Test] Instantiating AstroOracleService...');
    const service = new AstroOracleService();
    console.log('[Test] Triggering celestial scan...');
    const state = await service.scanCelestialEnvironment();
    console.log('[Test] Scan complete! State:', JSON.stringify(state, null, 2));
    process.exit(0);
}

run().catch(err => {
    console.error('[Test] Uncaught execution error:', err);
    process.exit(1);
});
