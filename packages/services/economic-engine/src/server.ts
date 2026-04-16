import 'dotenv/config';
import * as http from 'http';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { taskQueue } from './scheduler/task-queue';
import { SEOBloggingMethod } from './methods/seo-blog';
import { LandScannerMethod } from './methods/land-scanner';
import { ManufacturingMethod } from './methods/manufacturing';
import { NewsletterMethod } from './methods/newsletter';
import { StockAssetMethod } from './methods/stock-assets';
import { DocumentationServiceMethod } from './methods/documentation-service';
import { GrantAutomationMethod } from './methods/grant-automation';
import { RealEstateRefinery } from './methods/real-estate-refinery';
import { VideoScriptsMethod } from './methods/video-scripts';
import { AirdropFarmingMethod } from './methods/airdrop-farming';
import { MCPToolsMethod } from './methods/mcp-tools';
import { StockAnalysisMethod } from './methods/stock-analysis';
import { MarketSentimentOracleMethod } from './methods/market-sentiment';
import { ResearchReportMethod } from './methods/research-report';
import { TechnicalTranslationMethod } from './methods/technical-translation';
import { ResumeOptimizationMethod } from './methods/resume-optimization';
import { NicheAffiliateMethod } from './methods/niche-affiliate';
import { DiscordModMethod } from './methods/discord-mod';
import { DEXOracleMethod } from './methods/dex-oracle';
import { ContractAuditMethod } from './methods/contract-audit';
import { DomainAppraiserMethod } from './methods/domain-appraiser';
import { PaymentGatewayMethod } from './methods/payment-gateway';
import { SettlementProcessorMethod } from './methods/settlement-processor';
import { RPCNodeProviderMethod } from './methods/rpc-provider';
import { ContentCurationMethod } from './methods/content-curation';
import { LiquidityProvisionMethod } from './methods/liquidity-provision';
import { SovereignComputeMethod } from './methods/compute-arbitrage';
import { AgenticGovernanceMethod } from './methods/agentic-governance';
import { DiplomaticSessionMethod } from './methods/diplomatic-session';
import { DataScrapingMethod } from './methods/data-scraping';
import { PredictionMarketMethod } from './methods/prediction-markets';
import { DomainFlippingMethod } from './methods/ens-flipping';
import { NFTFloorSkatingMethod } from './methods/nft-floor-skating';
import { MicroSaaSMethod } from './methods/micro-saas';
import { DePINStorageMethod } from './methods/depin-storage';
import { DePINBandwidthMethod } from './methods/depin-bandwidth';
import { SnapshotServiceMethod } from './methods/snapshot-services';
import { MEVExecutorMethod } from './methods/mev-executor';
import { LiquidationBotMethod } from './methods/liquidation-bot';
import { LeveragedStakingMethod } from './methods/leveraged-staking';
import { GovernanceBribeMethod } from './methods/governance-bribe';
import { OracleExpansionMethod } from './methods/oracle-expansion';
import { AgentMarketplaceMethod } from './methods/agent-marketplace';
import { SyntheticDataMethod } from './methods/synthetic-data';
import { ContractDeployerMethod } from './methods/contract-deployer';
import { BrandCopywriterMethod } from './methods/brand-copywriter';
import { BugBountyMethod } from './methods/bug-bounty';
import { RealEstateTokenizationMethod } from './methods/real-estate-tokenization';
import { EnergyCreditsMethod } from './methods/energy-credits';
import { SupplyChainMethod } from './methods/supply-chain';
import { LegalPromptsMethod } from './methods/legal-prompts';
import { VirtualArchitectMethod } from './methods/virtual-architect';
import { BioNodeMethod } from './methods/bio-node';
import { reserveManager } from './treasury/reserve-manager';
import { realtyManager } from './services/realty-manager';
import { walletManager } from './treasury/wallet-manager';
import { discordClient } from './tools/discord-client';
import { SelfImprovementService } from './services/self-improvement';
import { AstroOracleService } from './services/astro-oracle';
import { discordLedger } from './treasury/discord-ledger';
import { proposalExecutor } from './services/proposal-executor';
import { governanceService } from './services/governance-service';
import { immuneSystem } from './services/immune-system';
import { economicOrchestrator } from './services/economic-orchestrator';
import { waterfallProtocol } from './treasury/waterfall-protocol';
import { gcpBilling } from './services/gcp-billing-service';
import { vaultService } from './services/vault-service';
import { db, COLLECTIONS } from './db';
import { runExodusMigration } from './tools/exodus-migration';
import { sensoryAgent } from './services/sensory-agent';
import { sovereignSyndicator } from './services/sovereign-syndicator';
import { LinkedInService } from './services/linkedin-service';
import { cartographerService } from './services/cartographer-service';

const PORT = parseInt(process.env.PORT || '8080');

async function boot() {
    console.log('[SovereignEngine] 🏛️  Accessing Sovereign Vault...');
    const API_KEY = await vaultService.getSecret('GEMINI_API_KEY') || process.env.GEMINI_API_KEY;
    const SOLANA_PRIVATE_KEY = await vaultService.getSecret('SOLANA_PRIVATE_KEY');
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const ELEVENLABS_API_KEY = await vaultService.getSecret('ELEVENLABS_API_KEY');

    if (!API_KEY) throw new Error('CRITICAL: Gemini API Key missing');

    taskQueue.registerMethod(new SEOBloggingMethod(API_KEY, new NicheAffiliateMethod(API_KEY)));
    taskQueue.registerMethod(new NewsletterMethod(API_KEY));
    taskQueue.registerMethod(new StockAssetMethod(API_KEY));
    
    taskQueue.registerMethod(new GrantAutomationMethod(API_KEY));
    taskQueue.registerMethod(new RealEstateRefinery(API_KEY));
    
    // Register remaining 50 methods...
    
    await walletManager.initWallet('solana', SOLANA_PRIVATE_KEY, SOLANA_RPC_URL);
    taskQueue.start();
    economicOrchestrator.start();
    sensoryAgent.start();
    
    if (process.env.CONSERVATION_MODE !== 'true') {
        realtyManager.start();
    }

    gcpBilling.syncInfrastructureCosts().catch(e => console.error('Billing sync failed:', e));
    
    const astroOracle = new AstroOracleService(API_KEY);
    immuneSystem.setAstroOracle(astroOracle);
    astroOracle.start();

    await discordLedger.init();
    await discordClient.start();
}

const server = http.createServer(async (req, res) => {
    // Sovereign CORS Policy
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    
    // --- M2M SHADOW PROTOCOL (WAVE 11) ---
    if (url.pathname.startsWith('/api/shadow')) {
        const shadowPath = url.pathname.replace('/api/shadow', '') || '/';
        try {
            const html = await cartographerService.generateShadowHtml(shadowPath);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname === '/health') {
        res.writeHead(200); res.end('ok'); return;
    }

    if (url.pathname === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(taskQueue.getStatus()));
        return;
    }

    if (url.pathname === '/intelligence') {
        try {
            const rawRecords: any = await db.collection(COLLECTIONS.OMNI_INTEL_LAKE).get();
            const data = (rawRecords.docs || rawRecords).map((d: any) => typeof d.data === 'function' ? d.data() : d.data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname === '/queue') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(taskQueue.getStatus()));
        return;
    }

    if (url.pathname === '/execute' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { methodId } = JSON.parse(body);
                const method = taskQueue.getMethods().find(m => m.methodId === methodId);
                if (method) {
                    // Start execution in background
                    taskQueue.executeMethod(methodId).catch(console.error);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: `Execution started for ${methodId}` }));
                } else {
                    res.writeHead(404); res.end(JSON.stringify({ error: 'Method not found' }));
                }
            } catch (e) {
                res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    if (url.pathname === '/api/assets') {
        try {
            const rawRecords: any = await db.collection(COLLECTIONS.ASSETS).get();
            const data = rawRecords.docs 
                ? rawRecords.docs.map((d: any) => typeof d.data === 'function' ? d.data() : d.data) 
                : rawRecords.map((d: any) => typeof d.data === 'function' ? d.data() : d.data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname === '/api/intel') {
        const stats = await reserveManager.getStats();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stats));
        return;
    }

    if (url.pathname === '/api/waterfall') {
        try {
            const status = await waterfallProtocol.getStatus();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(status));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname === '/api/refineries') {
        try {
            const methods = taskQueue.getMethods().map(m => m.getStats());
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(methods));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname === '/api/exodus') {
        try {
            await runExodusMigration();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Exodus complete' }));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname === '/api/security_telemetry/pulse') {
        const stats = await immuneSystem.getStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stats));
        return;
    }

    // --- LINKEDIN OAUTH FLOW --- (handles both /api/linkedin/auth and /api/engine/auth/linkedin/auth)
    if (url.pathname === '/api/linkedin/auth' || url.pathname === '/api/engine/auth/linkedin/auth') {
        const li = new LinkedInService(
            process.env.LINKEDIN_CLIENT_ID || '',
            process.env.LINKEDIN_CLIENT_SECRET || '',
            process.env.LINKEDIN_REDIRECT_URI || 'https://economic-engine-385120524005.us-central1.run.app/api/engine/auth/linkedin/callback'
        );
        const authUrl = li.getAuthorizationUrl('sovereign-state');
        res.writeHead(302, { Location: authUrl });
        res.end();
        return;
    }

    // handles both /api/linkedin/callback and /api/engine/auth/linkedin/callback (registered in LinkedIn app)
    if (url.pathname === '/api/linkedin/callback' || url.pathname === '/api/engine/auth/linkedin/callback') {
        const code = url.searchParams.get('code');
        if (!code) { res.writeHead(400); res.end('Missing code'); return; }
        try {
            const li = new LinkedInService(
                process.env.LINKEDIN_CLIENT_ID || '',
                process.env.LINKEDIN_CLIENT_SECRET || '',
                process.env.LINKEDIN_REDIRECT_URI || 'https://economic-engine-385120524005.us-central1.run.app/api/engine/auth/linkedin/callback'
            );
            await li.exchangeCodeForToken(code, 'promethea');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'LinkedIn token stored. Promethea is authorized.' }));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    // --- MANUAL SYNDICATION TRIGGER ---
    if (url.pathname === '/api/syndicate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { title, excerpt, url: postUrl, topic } = JSON.parse(body);
                sovereignSyndicator.broadcast({ title, excerpt, url: postUrl, topic }).catch(console.error);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Syndication initiated to all channels.' }));
            } catch (e) {
                res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    if (url.pathname === '/api/lake') {
        try {
            const rawRecords: any = await db.collection(COLLECTIONS.OMNI_INTEL_LAKE).get();
            const data = rawRecords.docs 
                ? rawRecords.docs.map((d: any) => typeof d.data === 'function' ? d.data() : d.data) 
                : rawRecords.map((d: any) => typeof d.data === 'function' ? d.data() : d.data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    // Generic Dynamic Collection/Doc Lookup (The Sovereign Bridge)
    const apiMatch = url.pathname.match(/^\/api\/([^\/]+)(?:\/([^\/]+))?$/);
    if (apiMatch) {
        const collection = apiMatch[1];
        const docId = apiMatch[2];

        try {
            if (docId) {
                // Single Doc
                const doc = await db.collection(collection).doc(docId).get();
                if (doc.exists) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(doc.data()));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Not Found' }));
                }
            } else {
                // Entire Collection
                const rawRecords: any = await db.collection(collection).get();
                const data = rawRecords.docs 
                    ? rawRecords.docs.map((d: any) => typeof d.data === 'function' ? d.data() : d.data) 
                    : rawRecords.map((d: any) => typeof d.data === 'function' ? d.data() : d.data);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            }
        } catch (e) {
            console.error(`[Sovereign API] Error fetching ${collection}/${docId}:`, e);
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' }); 
    res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(PORT, () => {
    console.log(`🚀 Sovereign Engine Active on port ${PORT}`);
    boot().catch(err => {
        console.error('🛑 BOOT FAILURE:', err);
        process.exit(1);
    });
});
