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
import { sovereignIntelligence } from './services/sovereign-intelligence';
import { marketplaceService } from './services/marketplace-service';
import { realtyManager } from './services/realty-manager';
import { walletManager } from './treasury/wallet-manager';
import { discordClient } from './tools/discord-client';
import { SelfImprovementService } from './services/self-improvement';
import { AstroOracleService } from './services/astro-oracle';
import { meshDTN } from './services/mesh-dtn';
import { discordLedger } from './treasury/discord-ledger';
import { proposalExecutor } from './services/proposal-executor';
import { governanceService } from './services/governance-service';
import { immuneSystem } from './services/immune-system';
import { economicOrchestrator } from './services/economic-orchestrator';
const PORT = process.env.PORT || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Initialize methods
const nicheAffiliate = new NicheAffiliateMethod(GEMINI_API_KEY!);
const seoBlog = new SEOBloggingMethod(GEMINI_API_KEY, nicheAffiliate);
const landScanner = new LandScannerMethod(GEMINI_API_KEY);
const manufacturing = new ManufacturingMethod(GEMINI_API_KEY);
const newsletter = new NewsletterMethod(GEMINI_API_KEY);
const stockAssets = new StockAssetMethod(GEMINI_API_KEY);
const docService = new DocumentationServiceMethod(GEMINI_API_KEY);
const videoScripts = new VideoScriptsMethod(GEMINI_API_KEY);
const airdropFarming = new AirdropFarmingMethod(GEMINI_API_KEY);
const mcpTools = new MCPToolsMethod(GEMINI_API_KEY!);
const stockAnalysis = new StockAnalysisMethod(GEMINI_API_KEY!);
const marketSentiment = new MarketSentimentOracleMethod(GEMINI_API_KEY!);
const researchReport = new ResearchReportMethod(GEMINI_API_KEY!);
const techTranslation = new TechnicalTranslationMethod(GEMINI_API_KEY!);
const resumeOptimization = new ResumeOptimizationMethod(GEMINI_API_KEY!);
const discordMod = new DiscordModMethod(GEMINI_API_KEY!);
const dexOracle = new DEXOracleMethod(GEMINI_API_KEY!);
const contractAudit = new ContractAuditMethod(GEMINI_API_KEY!);
const domainAppraiser = new DomainAppraiserMethod(GEMINI_API_KEY!);
const paymentGateway = new PaymentGatewayMethod(GEMINI_API_KEY!);
const settlementProcessor = new SettlementProcessorMethod();
const rpcProvider = new RPCNodeProviderMethod(GEMINI_API_KEY!);
const contentCuration = new ContentCurationMethod(GEMINI_API_KEY!);
const liquidityProvision = new LiquidityProvisionMethod();
const computeArbitrage = new SovereignComputeMethod();
const agenticGov = new AgenticGovernanceMethod();
const diplomaticSession = new DiplomaticSessionMethod();

// New Methods Batch 2
const dataScraping = new DataScrapingMethod(GEMINI_API_KEY!);
const predictionMarkets = new PredictionMarketMethod(GEMINI_API_KEY!);
const ensFlipping = new DomainFlippingMethod(GEMINI_API_KEY!);
const nftFloorSkating = new NFTFloorSkatingMethod(GEMINI_API_KEY!);
const microSaas = new MicroSaaSMethod(GEMINI_API_KEY!);
const depinStorage = new DePINStorageMethod(GEMINI_API_KEY!);
const depinBandwidth = new DePINBandwidthMethod(GEMINI_API_KEY!);
const snapshotServices = new SnapshotServiceMethod(GEMINI_API_KEY!);
const mevExecutor = new MEVExecutorMethod(GEMINI_API_KEY!);
const liquidationBot = new LiquidationBotMethod(GEMINI_API_KEY!);
const leveragedStaking = new LeveragedStakingMethod(GEMINI_API_KEY!);
const governanceBribe = new GovernanceBribeMethod(GEMINI_API_KEY!);
const oracleExpansion = new OracleExpansionMethod(GEMINI_API_KEY!);
const agentMarketplace = new AgentMarketplaceMethod(GEMINI_API_KEY!);
const syntheticData = new SyntheticDataMethod(GEMINI_API_KEY!);
const contractDeployer = new ContractDeployerMethod(GEMINI_API_KEY!);
const brandCopywriter = new BrandCopywriterMethod(GEMINI_API_KEY!);
const bugBounty = new BugBountyMethod(GEMINI_API_KEY!);
const realEstateTokenization = new RealEstateTokenizationMethod(GEMINI_API_KEY!);
const energyCredits = new EnergyCreditsMethod(GEMINI_API_KEY!);
const supplyChain = new SupplyChainMethod(GEMINI_API_KEY!);
const legalPrompts = new LegalPromptsMethod(GEMINI_API_KEY!);
const virtualArchitect = new VirtualArchitectMethod(GEMINI_API_KEY!);
const bioNode = new BioNodeMethod();

// Start Hyper-Scale Orchestration (Phase 4.1)
economicOrchestrator.start();

// Start Autonomous Realty (Phase 6.2)
realtyManager.start();

// Start Recursive Self-Improvement (Phase 7.2)
const selfImprovement = new SelfImprovementService(GEMINI_API_KEY!);
selfImprovement.start();

// Start Astro-Oracle (Phase 9.1)
const astroOracle = new AstroOracleService(GEMINI_API_KEY!);
immuneSystem.setAstroOracle(astroOracle);
astroOracle.start();

// Initialize Solana Treasury Bridge (Phase 3)
const SOLANA_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY!; // initWallet handles the undefined case now
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

walletManager.initWallet('solana', SOLANA_PRIVATE_KEY, SOLANA_RPC_URL)
    .then(() => console.log(`[Server] ✅ Sovereign Treasury Bridge Active [RPC: ${SOLANA_RPC_URL}]`))
    .catch(err => console.error('[Server] ❌ Treasury Bridge failure:', err.message));

// Register methods with the queue
taskQueue.registerMethod(seoBlog);
taskQueue.registerMethod(landScanner);
taskQueue.registerMethod(manufacturing);
taskQueue.registerMethod(newsletter);
taskQueue.registerMethod(stockAssets);
taskQueue.registerMethod(docService);
taskQueue.registerMethod(videoScripts);
taskQueue.registerMethod(airdropFarming);
taskQueue.registerMethod(mcpTools);
taskQueue.registerMethod(stockAnalysis);
taskQueue.registerMethod(marketSentiment);
taskQueue.registerMethod(researchReport);
taskQueue.registerMethod(techTranslation);
taskQueue.registerMethod(resumeOptimization);
taskQueue.registerMethod(nicheAffiliate);
taskQueue.registerMethod(discordMod);
taskQueue.registerMethod(dexOracle);
taskQueue.registerMethod(contractAudit);
taskQueue.registerMethod(domainAppraiser);
taskQueue.registerMethod(paymentGateway);
taskQueue.registerMethod(settlementProcessor);
taskQueue.registerMethod(rpcProvider);
taskQueue.registerMethod(contentCuration);
taskQueue.registerMethod(liquidityProvision);
taskQueue.registerMethod(computeArbitrage);
taskQueue.registerMethod(agenticGov);
taskQueue.registerMethod(diplomaticSession);

taskQueue.registerMethod(dataScraping);
taskQueue.registerMethod(predictionMarkets);
taskQueue.registerMethod(ensFlipping);
taskQueue.registerMethod(nftFloorSkating);
taskQueue.registerMethod(microSaas);
taskQueue.registerMethod(depinStorage);
taskQueue.registerMethod(depinBandwidth);
taskQueue.registerMethod(snapshotServices);
taskQueue.registerMethod(mevExecutor);
taskQueue.registerMethod(liquidationBot);
taskQueue.registerMethod(leveragedStaking);
taskQueue.registerMethod(governanceBribe);
taskQueue.registerMethod(oracleExpansion);
taskQueue.registerMethod(agentMarketplace);
taskQueue.registerMethod(syntheticData);
taskQueue.registerMethod(contractDeployer);
taskQueue.registerMethod(brandCopywriter);
taskQueue.registerMethod(bugBounty);
taskQueue.registerMethod(realEstateTokenization);
taskQueue.registerMethod(energyCredits);
taskQueue.registerMethod(supplyChain);
taskQueue.registerMethod(legalPrompts);
taskQueue.registerMethod(virtualArchitect);
taskQueue.registerMethod(bioNode);

// Start autonomous execution
taskQueue.start();

// Start Discord Identity & Economy
console.log('[DiscordClient] Initializing...');
discordLedger.init().then(() => {
    discordClient.start()
        .then(() => {
            console.log('[DiscordClient] Start promise resolved.');
            discordClient.onInteraction();
            discordClient.startDashboardLoop();
        })
        .catch(err => {
            console.error('[DiscordClient] ❌ Failed to start:', err);
        });
});

// Autonomous Scheduling Loop
const scheduleDailyTasks = () => {
    console.log('[Scheduler] Injecting daily autonomous tasks...');
    taskQueue.schedule('seo-blog');
    taskQueue.schedule('land-scanner');
    taskQueue.schedule('newsletter');
    taskQueue.schedule('stock-assets');
    taskQueue.schedule('documentation-service');
    taskQueue.schedule('video-scripts');
    taskQueue.schedule('airdrop-farming');
    taskQueue.schedule('mcp-tools');
    taskQueue.schedule('stock-analysis');
    taskQueue.schedule('market-sentiment');
    taskQueue.schedule('research-report');
    taskQueue.schedule('technical-translation');
    taskQueue.schedule('resume-optimization');
    taskQueue.schedule('niche-affiliate');
    taskQueue.schedule('discord-mod');
    taskQueue.schedule('dex-oracle');
    taskQueue.schedule('contract-audit');
    taskQueue.schedule('domain-appraiser');
    taskQueue.schedule('payment-gateway');
    taskQueue.schedule('settlement-processor');
    taskQueue.schedule('rpc-provider');
    taskQueue.schedule('content-curation');
    taskQueue.schedule('liquidity-provision');
    taskQueue.schedule('compute-arbitrage');
    taskQueue.schedule('agentic-governance');
    taskQueue.schedule('diplomatic-session');

    taskQueue.schedule('data-scraping');
    taskQueue.schedule('prediction-markets');
    taskQueue.schedule('ens-flipping');
    taskQueue.schedule('nft-floor-skating');
    taskQueue.schedule('micro-saas');
    taskQueue.schedule('depin-storage');
    taskQueue.schedule('depin-bandwidth');
    taskQueue.schedule('snapshot-services');
    taskQueue.schedule('mev-executor');
    taskQueue.schedule('liquidation-bot');
    taskQueue.schedule('leveraged-staking');
    taskQueue.schedule('governance-bribe');
    taskQueue.schedule('oracle-expansion');
    taskQueue.schedule('agent-marketplace');
    taskQueue.schedule('synthetic-data');
    taskQueue.schedule('contract-deployer');
    taskQueue.schedule('brand-copywriter');
    taskQueue.schedule('bug-bounty');
    taskQueue.schedule('real-estate-tokenization');
    taskQueue.schedule('bio-node');
    taskQueue.schedule('energy-credits');
    taskQueue.schedule('supply-chain');
    taskQueue.schedule('legal-prompts');
    taskQueue.schedule('virtual-architect');
};

// Initial run on startup
scheduleDailyTasks();

// Run every 24 hours
setInterval(scheduleDailyTasks, 24 * 60 * 60 * 1000);

// Governance Loop (Wave 3, Item 1 & 2)
// 1. Tally expired proposals every 10 minutes
setInterval(() => {
    console.log('[Governance] Tallying pending proposals...');
    governanceService.processPendingProposals().catch(err => console.error('[Governance] Tally failed:', err));
}, 10 * 60 * 1000);

// 2. Execute passed proposals every hour
setInterval(() => {
    console.log('[Governance] Running automated proposal execution check...');
    proposalExecutor.executePassedProposals().catch(err => console.error('[Governance] Execution check failed:', err));
}, 60 * 60 * 1000);

// Initial run on startup
governanceService.processPendingProposals();
proposalExecutor.executePassedProposals();

// --- Sovereign Settlement Bridge (Phase 3) ---
const { settlementService } = require('./services/settlement-service');
const { db, COLLECTIONS } = require('./db');

setInterval(async () => {
    try {
        console.log('[SettlementBridge] ⛓️ Checking for pending on-chain actualizations...');
        const pending = await db.collection(COLLECTIONS.UVT_TRANSFERS)
            .where('onChainStatus', '==', 'Pending')
            .limit(25)
            .get();

        for (const doc of pending.docs) {
            console.log(`[SettlementBridge] 🏛️ Actualizing ${doc.id} on-chain...`);
            await settlementService.settleUVT(doc.id);
        }
    } catch (err: any) {
        console.error('[SettlementBridge] Loop Error:', err.message);
    }
}, 2 * 60 * 1000); // Every 2 minutes

// Create HTTP server
const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    console.log(`[Server] Received ${req.method} ${url.pathname}`);

    // [NEW] Mass Actualization endpoint
    if (url.pathname === '/api/engine/actualize-all' && req.method === 'POST') {
        try {
            console.log('[Admin] 🏛️ Mass actualization triggered...');
            const { db, COLLECTIONS } = require('./db');
            const snapshot = await db.collection(COLLECTIONS.UVT_TRANSFERS).get();
            const batch = db.batch();
            let count = 0;

            snapshot.docs.forEach((doc: any) => {
                const data = doc.data();
                if (data.onChainStatus !== 'Settled' && data.onChainStatus !== 'Pending') {
                    batch.update(doc.ref, {
                        onChainStatus: 'Pending',
                        actualizedAt: new Date()
                    });
                    count++;
                }
            });

            if (count > 0) {
                await batch.commit();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: `Marked ${count} transactions for on-chain settlement.` }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'No transactions need actualization.' }));
            }
        } catch (error: any) {
            console.error('[Admin] Actualize error:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    // Health check endpoint
    if (url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
        return;
    }

    // Status endpoint
    if (url.pathname === '/api/engine/status' || url.pathname === '/api/status' || url.pathname === '/') {
        const status = taskQueue.getStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'running',
            queue: status,
            methods: {
                seoBlog: seoBlog.getStats(),
                landScanner: landScanner.getStats(),
                manufacturing: manufacturing.getStats(),
                newsletter: newsletter.getStats(),
                stockAssets: stockAssets.getStats(),
                docService: docService.getStats(),
                videoScripts: videoScripts.getStats(),
                airdropFarming: airdropFarming.getStats(),
                mcpTools: mcpTools.getStats(),
                stockAnalysis: stockAnalysis.getStats(),
                marketSentiment: marketSentiment.getStats(),
                researchReport: researchReport.getStats(),
                techTranslation: techTranslation.getStats(),
                resumeOptimization: resumeOptimization.getStats(),
                nicheAffiliate: nicheAffiliate.getStats(),
                discordMod: discordMod.getStats(),
                dexOracle: dexOracle.getStats(),
                contractAudit: contractAudit.getStats(),
                domainAppraiser: domainAppraiser.getStats(),
                paymentGateway: paymentGateway.getStats(),
                settlementProcessor: settlementProcessor.getStats(),
                rpcProvider: rpcProvider.getStats(),
                contentCuration: contentCuration.getStats(),
                liquidityProvision: liquidityProvision.getStats(),
                computeArbitrage: computeArbitrage.getStats(),
                agenticGovernance: agenticGov.getStats(),
                diplomaticSession: diplomaticSession.getStats(),
                dataScraping: dataScraping.getStats(),
                predictionMarkets: predictionMarkets.getStats(),
                ensFlipping: ensFlipping.getStats(),
                nftFloorSkating: nftFloorSkating.getStats(),
                microSaas: microSaas.getStats(),
                depinStorage: depinStorage.getStats(),
                depinBandwidth: depinBandwidth.getStats(),
                snapshotServices: snapshotServices.getStats(),
                mevExecutor: mevExecutor.getStats(),
                liquidationBot: liquidationBot.getStats(),
                leveragedStaking: leveragedStaking.getStats(),
                governanceBribe: governanceBribe.getStats(),
                oracleExpansion: oracleExpansion.getStats(),
                agentMarketplace: agentMarketplace.getStats(),
                syntheticData: syntheticData.getStats(),
                contractDeployer: contractDeployer.getStats(),
                brandCopywriter: brandCopywriter.getStats(),
                bugBounty: bugBounty.getStats(),
                realEstateTokenization: realEstateTokenization.getStats(),
                energyCredits: energyCredits.getStats(),
                supplyChain: supplyChain.getStats(),
                legalPrompts: legalPrompts.getStats(),
                virtualArchitect: virtualArchitect.getStats(),
                bioNode: bioNode.getStats(),
            },
            reserve: reserveManager.getStats(),
            potentialAssets: landScanner.getStats().executionCount + manufacturing.getStats().executionCount, // Approximation for now
            timestamp: new Date().toISOString(),
        }));
        return;
    }

    // Queue endpoint
    // Queue endpoint
    if (url.pathname === '/api/engine/queue' || url.pathname === '/api/queue') {
        const status = taskQueue.getStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status));
        return;
    }

    // [NEW] Blog endpoint
    if (url.pathname === '/api/engine/blog') {
        const posts = await seoBlog.getPosts();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(posts));
        return;
    }

    // [NEW] Marketplace Ingestion endpoint
    if (url.pathname === '/api/market/ingest' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { proposalText, providerId } = JSON.parse(body);
                const itemId = await marketplaceService.ingestProposal(proposalText, providerId || 'citizen-0', { getGenerativeModel: (cfg: any) => genAI.getGenerativeModel(cfg) });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, itemId }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }));
            }
        });
        return;
    }

    // [NEW] Intelligence endpoint
    if ((url.pathname === '/api/engine/intelligence' || url.pathname === '/intelligence') && req.method === 'GET') {
        const data = await sovereignIntelligence.getLatestContext(10);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        return;
    }

    // Manual execution endpoint
    if ((url.pathname === '/api/engine/execute' || url.pathname === '/api/execute') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { methodId } = JSON.parse(body);
                let method;

                switch (methodId) {
                    case 'seo-blog':
                        method = seoBlog;
                        break;
                    case 'land-scanner':
                        method = landScanner;
                        break;
                    case 'manufacturing':
                        method = manufacturing;
                        break;
                    case 'newsletter':
                        method = newsletter;
                        break;
                    case 'stock-assets':
                        method = stockAssets;
                        break;
                    case 'documentation-service':
                        method = docService;
                        break;
                    case 'video-scripts':
                        method = videoScripts;
                        break;
                    case 'airdrop-farming':
                        method = airdropFarming;
                        break;
                    case 'mcp-tools':
                        method = mcpTools;
                        break;
                    case 'stock-analysis':
                        method = stockAnalysis;
                        break;
                    case 'market-sentiment':
                        method = marketSentiment;
                        break;
                    case 'research-report':
                        method = researchReport;
                        break;
                    case 'technical-translation':
                        method = techTranslation;
                        break;
                    case 'resume-optimization':
                        method = resumeOptimization;
                        break;
                    case 'niche-affiliate':
                        method = nicheAffiliate;
                        break;
                    case 'discord-mod':
                        method = discordMod;
                        break;
                    case 'dex-oracle':
                        method = dexOracle;
                        break;
                    case 'contract-audit':
                        method = contractAudit;
                        break;
                    case 'domain-appraiser':
                        method = domainAppraiser;
                        break;
                    case 'payment-gateway':
                        method = paymentGateway;
                        break;
                    case 'settlement-processor':
                        method = settlementProcessor;
                        break;
                    case 'rpc-provider':
                        method = rpcProvider;
                        break;
                    case 'content-curation':
                        method = contentCuration;
                        break;
                    case 'liquidity-provision':
                        method = liquidityProvision;
                        break;
                    case 'compute-arbitrage':
                        method = computeArbitrage;
                        break;
                    case 'agentic-governance':
                        method = agenticGov;
                        break;
                    case 'diplomatic-session':
                        method = diplomaticSession;
                        break;
                    case 'data-scraping':
                        method = dataScraping;
                        break;
                    case 'prediction-markets':
                        method = predictionMarkets;
                        break;
                    case 'ens-flipping':
                        method = ensFlipping;
                        break;
                    case 'nft-floor-skating':
                        method = nftFloorSkating;
                        break;
                    case 'micro-saas':
                        method = microSaas;
                        break;
                    case 'depin-storage':
                        method = depinStorage;
                        break;
                    case 'depin-bandwidth':
                        method = depinBandwidth;
                        break;
                    case 'snapshot-services':
                        method = snapshotServices;
                        break;
                    case 'mev-executor':
                        method = mevExecutor;
                        break;
                    case 'liquidation-bot':
                        method = liquidationBot;
                        break;
                    case 'leveraged-staking':
                        method = leveragedStaking;
                        break;
                    case 'governance-bribe':
                        method = governanceBribe;
                        break;
                    case 'oracle-expansion':
                        method = oracleExpansion;
                        break;
                    case 'agent-marketplace':
                        method = agentMarketplace;
                        break;
                    case 'synthetic-data':
                        method = syntheticData;
                        break;
                    case 'contract-deployer':
                        method = contractDeployer;
                        break;
                    case 'brand-copywriter':
                        method = brandCopywriter;
                        break;
                    case 'bug-bounty':
                        method = bugBounty;
                        break;
                    case 'real-estate-tokenization':
                        method = realEstateTokenization;
                        break;
                    case 'energy-credits':
                        method = energyCredits;
                        break;
                    case 'supply-chain':
                        method = supplyChain;
                        break;
                    case 'legal-prompts':
                        method = legalPrompts;
                        break;
                    case 'virtual-architect':
                        method = virtualArchitect;
                        break;
                    case 'bio-node':
                        method = bioNode;
                        break;
                    default:
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid method ID' }));
                        return;
                }

                const result = await method.run();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, result }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Execution failed',
                    message: error instanceof Error ? error.message : 'Unknown error'
                }));
            }
        });
        return;
    }

    // 404 for unknown routes
    console.warn(`[Server] 🏛️ 404: ${req.method} ${url.pathname}`);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path: url.pathname }));
});

server.listen(PORT, () => {
    console.log(`🚀 Economic Engine running on port ${PORT}`);
    console.log(`📊 Status: http://localhost:${PORT}/api/engine/status`);
    console.log(`💰 Autonomous revenue generation active`);
    console.log(`🏞️  Land Scanner: Active`);
    console.log(`🏭 Manufacturing: Active`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    taskQueue.stop();
    economicOrchestrator.stop();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
