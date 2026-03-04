import 'dotenv/config';
import { taskQueue } from './scheduler/task-queue';
import { SEOBloggingMethod } from './methods/seo-blog';
import { LandScannerMethod } from './methods/land-scanner';
import { ManufacturingMethod } from './methods/manufacturing';

/**
 * Bootstrap file for Economic Engine
 * Registers all autonomous methods and starts the task queue
 */

async function bootstrap() {
    console.log('[Bootstrap] Initializing Promethea Economic Engine...');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('[Bootstrap] FATAL: Missing GEMINI_API_KEY');
        process.exit(1);
    }

    // Register all methods
    console.log('[Bootstrap] Registering economic methods...');

    // Phase 3 & 4 Methods
    taskQueue.registerMethod(new SEOBloggingMethod(apiKey));

    // Import other methods dynamically to keep bootstrap manageable if needed, 
    // but for now we'll register the core ones explicitly.
    const { StockAssetMethod } = require('./methods/stock-assets');
    const { NewsletterMethod } = require('./methods/newsletter');
    const { TechnicalTranslationMethod } = require('./methods/technical-translation');
    const { ContractAuditMethod } = require('./methods/contract-audit');
    const { PaymentGatewayMethod } = require('./methods/payment-gateway');
    const { DexOracleMethod } = require('./methods/dex-oracle');

    taskQueue.registerMethod(new StockAssetMethod(apiKey));
    taskQueue.registerMethod(new NewsletterMethod(apiKey));
    taskQueue.registerMethod(new TechnicalTranslationMethod(apiKey));
    taskQueue.registerMethod(new ContractAuditMethod(apiKey));
    taskQueue.registerMethod(new PaymentGatewayMethod(apiKey));
    taskQueue.registerMethod(new DexOracleMethod(apiKey));

    // Phase 5 Methods
    const landScanner = new LandScannerMethod(apiKey);
    const manufacturing = new ManufacturingMethod(apiKey);

    taskQueue.registerMethod(landScanner);
    taskQueue.registerMethod(manufacturing);

    console.log(`[Bootstrap] Registered ${taskQueue.getStatus().registeredMethodsCount} methods`);

    // --- Start Sovereign Loops ---

    // 1. Governance Tally Loop (Every 10 minutes)
    const { governanceService } = require('./services/governance-service');
    setInterval(() => {
        governanceService.processPendingProposals().catch((err: any) => console.error('[Bootstrap] Gov Loop Error:', err.message));
    }, 10 * 60 * 1000);

    // 2. Proposal Execution Loop (Every 5 minutes)
    const { proposalExecutor } = require('./services/proposal-executor');
    setInterval(() => {
        proposalExecutor.executePassedProposals().catch((err: any) => console.error('[Bootstrap] Executor Loop Error:', err.message));
    }, 5 * 60 * 1000);

    // 3. Settlement Loop (Wait for transfers to be marked as Pending)
    // Handled on-demand for now by individual methods or can be a separate loop.

    // Schedule initial executions
    taskQueue.schedule('seo-blog', 1); // High priority
    taskQueue.schedule('newsletter', 2);
    taskQueue.schedule('stock-assets', 5);

    // Start autonomous loop
    console.log('[Bootstrap] Starting autonomous execution...');
    await taskQueue.start();
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('[Bootstrap] SIGTERM received, shutting down...');
    taskQueue.stop();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[Bootstrap] SIGINT received, shutting down...');
    taskQueue.stop();
    process.exit(0);
});

bootstrap().catch((error) => {
    console.error('[Bootstrap] Fatal error:', error);
    process.exit(1);
});
