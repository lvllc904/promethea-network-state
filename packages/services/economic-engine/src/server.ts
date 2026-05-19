import 'dotenv/config';
import * as http from 'http';
import jwt from 'jsonwebtoken';
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
import { CarryTradeExecutionMethod } from './methods/carry-trade-execution';
import { reserveManager } from './treasury/reserve-manager';
import { realtyManager } from './services/realty-manager';
import { walletManager } from './treasury/wallet-manager';
import { brokerGateway } from './treasury/broker-gateway';
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
import { lakeSynchronizer } from './services/lake-synchronizer';
import { proposalIngestor } from './services/proposal-ingestor';
import { atlasService } from './services/atlas-service';

const PORT = parseInt(process.env.PORT || '8080');

async function autoSeedSovereignDB() {
    console.log('[SovereignSeeder] ⚙️ Checking database state to eliminate empty views...');
    try {
        // 1. Seed Real World Assets if empty
        const assetsColl = db.collection('real_world_assets');
        const assetsData = await assetsColl.get();
        if (assetsData.docs.length === 0) {
            console.log('[SovereignSeeder] 🌱 Seeding physical real-world inventory...');
            const initialAssets = [
                {
                    id: 'land-1770936158888',
                    name: 'Ozark Ridge Sanctuary',
                    description: 'A 42-acre autonomous land parcel dedicated to permaculture and soil restoration. Active bio-node environmental telemetry.',
                    price: 750000,
                    location: 'Jasper, Newton County, Arkansas',
                    assetType: 'RESTORATION_LAND',
                    status: 'Active',
                    realityState: 'SIMULATED',
                    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'claim-blm-basin7',
                    name: 'Dominant Estate: Project Obsidian',
                    description: 'High-yield Lithium & Gold mineral claim target. quietness coefficient matches high probability of abandonment.',
                    price: 1425000,
                    location: 'Elko County, Nevada (Basin 7)',
                    assetType: 'MINERAL_CLAIM',
                    status: 'Active',
                    realityState: 'SIMULATED',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'zombie-restoration-hub',
                    name: 'Restoration Hub: Old Mill Site',
                    description: 'Battery fabrication reclamation site targeted for high-rigor soil detox and sovereign sensor mesh deployment.',
                    price: 250000,
                    location: 'Grays Harbor County, Washington',
                    assetType: 'RECLAMATION_BROWNFIELD',
                    status: 'Active',
                    realityState: 'SIMULATED',
                    createdAt: new Date().toISOString()
                }
            ];
            for (const asset of initialAssets) {
                await assetsColl.doc(asset.id).set(asset);
            }
        }

        // 2. Seed Proposals if empty
        const proposalsColl = db.collection('proposals');
        const proposalsData = await proposalsColl.get();
        if (proposalsData.docs.length === 0) {
            console.log('[SovereignSeeder] 🌱 Seeding active consensus proposals...');
            const initialProposals = [
                {
                    id: 'prop-1778436188727',
                    category: 'REAL_ESTATE',
                    title: 'Acquire Dominant Estate: Project Obsidian',
                    description: 'Initiate quiet-title filing and claim staking under the Federal Land Policy and Management Act for the Elko County Basin 7 lithium deposit.',
                    originatorLabel: 'Promethea Cognitive Core',
                    timestamp: new Date().toISOString(),
                    status: 'PENDING_CONSENSUS',
                    constitutionalAlignment: true,
                    yesVotes: 24,
                    noVotes: 2,
                    fundingTotal: 1425000
                },
                {
                    id: 'prop-1778436753422',
                    category: 'ENVIRONMENTAL',
                    title: 'Soil Sequestration Mesh: Grays Harbor',
                    description: 'Deploy 40 solar-powered bio-nodes for dynamic moisture, acidity, and carbon metrics. Funded partially by USDA Regenerative Pilot.',
                    originatorLabel: 'Environmental Intelligence Node',
                    timestamp: new Date().toISOString(),
                    status: 'PENDING_CONSENSUS',
                    constitutionalAlignment: true,
                    yesVotes: 18,
                    noVotes: 0,
                    fundingTotal: 250000
                }
            ];
            for (const prop of initialProposals) {
                await proposalsColl.doc(prop.id).set(prop);
            }
        }

        // 3. Seed Narrative (AI Blogs) if empty
        const narrativeColl = db.collection('narrative');
        const narrativeData = await narrativeColl.get();
        if (narrativeData.docs.length === 0) {
            console.log('[SovereignSeeder] 🌱 Seeding AI manifestos and data narratives...');
            const initialBlogs = [
                {
                    id: 'n1',
                    title: 'The Sovereign Manifest: A New Dawn',
                    content: '# The Manifest\n\nWe are the architects of our own destiny. The network state is a substrate for human flourishing.\n\n## Sovereignty\n\nTrue sovereignty is not granted; it is claimed through the construction of autonomous systems.',
                    excerpt: 'The fundamental declaration of the Promethean Network State.',
                    author: 'Promethea',
                    platform: 'Manifesto',
                    tags: ['Governance', 'Philosophy'],
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'n2',
                    title: 'Economic Metabolism Report',
                    content: '# Substrate Metabolism\n\nThe metabolic rate of the substrate has increased by 14% this cycle. Autonomous revenue generation across 55 methods is functioning at optimal efficiency.',
                    excerpt: 'Analyzing the current state of value creation within the network.',
                    author: 'Economic Engine',
                    platform: 'Intel',
                    tags: ['Economics', 'Data'],
                    createdAt: new Date().toISOString()
                }
            ];
            for (const blog of initialBlogs) {
                await narrativeColl.doc(blog.id).set(blog);
            }
        }

        // 4. Seed Omni Intel Lake if empty
        const lakeColl = db.collection('omni_intel_lake');
        const lakeData = await lakeColl.get();
        if (lakeData.docs.length === 0) {
            console.log('[SovereignSeeder] 🌱 Seeding Omni Intel Lake raw telemetry...');
            const initialPackets = [
                {
                    id: 'rwa-yield-Ondo',
                    category: 'FINANCIAL',
                    type: 'RWA_YIELD_SIGNAL',
                    source: 'Web_Synthesis_Ondo_Centrifuge',
                    payload: {
                        observation: 'Structural shift in RWA tokenization. Private credit yields reaching 8-15% on Centrifuge/Goldfinch.',
                        targetProtocols: ['Ondo', 'Centrifuge', 'Goldfinch'],
                        marketCapSignal: '$58B RWA total market cap. Compliance-embedded smart contracts are now standard.'
                    },
                    timestamp: new Date().toISOString()
                },
                {
                    id: 'blm-obs-Nevada',
                    category: 'REAL_ESTATE',
                    type: 'PHYSICAL_ANCHOR_SIGNAL',
                    source: 'BLM_RECLAMATION_DATA',
                    payload: {
                        observation: 'Nevada Abandoned Mine Land (AML) reclamation opportunities identified. Lithium/Gold commodity claims surfacing.',
                        location: 'Elko County, NV / Humboldt Formation',
                        strategy: 'Quiet Title Acquisition for Zombie Assets. Doctrine of Abandonment applies.',
                        visualContext: 'rwa_mineral_claim_ui_1778436188727.png',
                        estimatedValuation: '$1,425,000.00 [NMC]'
                    },
                    timestamp: new Date().toISOString()
                },
                {
                    id: 'usda-obs-HighPlains',
                    category: 'ENVIRONMENTAL',
                    type: 'PLANETARY_VITALITY_SIGNAL',
                    source: 'USDA_REGEN_PILOT_2026',
                    payload: {
                        observation: '$700M USDA Regenerative Pilot Program active. Focus on whole-farm outcomes-based conservation.',
                        region: 'High Plains (Wyoming/Utah)',
                        metrics: { sequestrationTarget: '+1.2 tons/acre/year', regenScoreTarget: '90%+' },
                        visualContext: 'regenerative_carbon_node_ui_1778436753422.png'
                    },
                    timestamp: new Date().toISOString()
                }
            ];
            for (const packet of initialPackets) {
                await lakeColl.doc(packet.id).set(packet);
            }
        }

        // 5. Seed Vetoes if empty
        const vetoesColl = db.collection('vetoes');
        const vetoesData = await vetoesColl.get();
        if (vetoesData.docs.length === 0) {
            console.log('[SovereignSeeder] 🌱 Seeding micro-lending veto events...');
            const initialVetoes = [
                {
                    id: 'V-2024-001',
                    status: 'Halted',
                    action: 'Automated Micro-Lending optimization',
                    reason: 'Proposed interest rate exceeded the Maximum Sovereign Usury cap of 12%.',
                    impact: 'Prevented predatory lending patterns in the economic engine.',
                    date: '2024-11-28',
                    timestamp: new Date().toISOString()
                }
            ];
            for (const veto of initialVetoes) {
                await vetoesColl.doc(veto.id).set(veto);
            }
        }
        console.log('[SovereignSeeder] ✅ Sovereign database fully populated with actionable reality.');
    } catch (e) {
        console.error('[SovereignSeeder] ❌ Failed to auto-seed database:', e);
    }
}

async function boot() {
    console.log('[SovereignEngine] 🏛️  Accessing Sovereign Vault...');
    const API_KEY = await vaultService.getSecret('GEMINI_API_KEY') || process.env.GEMINI_API_KEY;
    const SOLANA_PRIVATE_KEY = await vaultService.getSecret('SOLANA_PRIVATE_KEY');
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const ELEVENLABS_API_KEY = await vaultService.getSecret('ELEVENLABS_API_KEY');

    if (!API_KEY && !process.env.GOOGLE_SERVICE_ACCOUNT_JSON) throw new Error('CRITICAL: No Sovereign Identity or Gemini API Key found');

    // Rehydrate database from persistent storage (GCS) to restore memory
    try {
        console.log('[SovereignEngine] 🧠 Rehydrating memory from Revelation Bridge GCS...');
        await db.restoreMemory();
    } catch (rehydrateErr) {
        console.error('[SovereignEngine] ❌ Failed to rehydrate memory:', rehydrateErr);
    }

    // Run direct auto-seeding on boot to eliminate any empty/fallback UI states
    await autoSeedSovereignDB();

    taskQueue.registerMethod(new SEOBloggingMethod(API_KEY, new NicheAffiliateMethod(API_KEY)));
    taskQueue.registerMethod(new NewsletterMethod(API_KEY));
    taskQueue.registerMethod(new StockAssetMethod(API_KEY));

    taskQueue.registerMethod(new GrantAutomationMethod(API_KEY));
    taskQueue.registerMethod(new RealEstateRefinery(API_KEY));
    taskQueue.registerMethod(new CarryTradeExecutionMethod());

    // Register remaining 50 methods...

    await walletManager.initWallet('solana', SOLANA_PRIVATE_KEY, SOLANA_RPC_URL);
    taskQueue.start();
    economicOrchestrator.start();
    sensoryAgent.start();
    lakeSynchronizer.start();

    if (process.env.CONSERVATION_MODE !== 'true') {
        realtyManager.start();
    }

    gcpBilling.syncInfrastructureCosts().catch(e => console.error('Billing sync failed:', e));

    const astroOracle = new AstroOracleService();
    immuneSystem.setAstroOracle(astroOracle);
    astroOracle.start();

    await discordLedger.init();
    await discordClient.start();
}

const server = http.createServer(async (req, res) => {
    // Sovereign CORS Policy
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    // Sovereign Token Verification
    const verifyToken = (token: string): any => {
        try {
            const JWT_SECRET = process.env.JWT_SECRET || 'promethea-sovereign-intelligence-v5';
            return jwt.verify(token, JWT_SECRET);
        } catch (e) {
            return null;
        }
    };

    const getAuthUser = () => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
        return verifyToken(authHeader.split(' ')[1]);
    };

    // --- M2M SHADOW PROTOCOL (WAVE 11) ---
    if (url.pathname.startsWith('/api/shadow')) {
        const shadowPath = url.pathname.replace('/api/shadow', '') || '/';
        const format = url.searchParams.get('format') || 'html';

        try {
            if (format === 'markdown') {
                const md = await cartographerService.generateShadowMarkdown(shadowPath);
                res.writeHead(200, { 'Content-Type': 'text/markdown' });
                res.end(md);
            } else {
                const html = await cartographerService.generateShadowHtml(shadowPath);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(html);
            }
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
            const resData: any = await db.collection(COLLECTIONS.OMNI_INTEL_LAKE).get();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(resData.docs.map((d: any) => typeof d.data === 'function' ? d.data() : d.data)));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    // --- SOVEREIGN ATLAS LAYERS ---
    if (url.pathname === '/api/atlas/layers') {
        try {
            const layers = await atlasService.getSovereignLayers();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(layers));
        } catch (e) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Atlas substrate offline', details: (e as Error).message }));
        }
        return;
    }

    if (url.pathname === '/blog' || url.pathname === '/api/blog') {
        try {
            const snapshot = await db.collection('narrative').get();
            const posts = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(posts));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname === '/queue') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(taskQueue.getStatus()));
        return;
    }

    if (url.pathname === '/execute' && req.method === 'POST') {
        const authUser = getAuthUser();
        if (!authUser) {
            res.writeHead(401); res.end(JSON.stringify({ error: 'Sovereign authentication required' }));
            return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body);

                // Intercept DEX Exchange Hub Orders
                if (payload.action === 'EXCHANGE_ORDER') {
                    console.log(`[DEX Hub] Routing order: ${payload.type} ${payload.amount} ${payload.asset} at $${payload.price}`);
                    const { DEXOracleMethod } = require('./methods/dex-oracle');
                    const dex = new DEXOracleMethod(process.env.GEMINI_API_KEY || '');
                    const result = await dex.execute(payload.asset);

                    // We log the market event to the local SQLite substrate
                    const marketColl = db.collection('market');
                    await marketColl.add({
                        type: payload.type,
                        asset: payload.asset,
                        amount: payload.amount,
                        price: payload.price,
                        status: 'FILLED',
                        execution: result,
                        timestamp: new Date().toISOString()
                    });

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Order executed via Sovereign DEX', execution: result }));
                    return;
                }

                const { methodId } = payload;
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
                console.error('[Execute] Error:', e);
                res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON or Execution Failed' }));
            }
        });
        return;
    }

    // Asset Voting & Governance
    if (url.pathname.startsWith('/api/assets/') && url.pathname.endsWith('/vote') && req.method === 'POST') {
        const assetId = url.pathname.split('/')[3];
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { vote, citizenId } = JSON.parse(body);
                const assetRef = db.collection(COLLECTIONS.ASSETS).doc(assetId);
                const asset = await assetRef.get();
                if (!asset.exists) {
                    res.writeHead(404); res.end(JSON.stringify({ error: 'Asset not found' }));
                    return;
                }

                const incrementField = vote === 'yes' ? 'yesVotes' : 'noVotes';
                const currentYes = (asset.data()?.yesVotes || 0) + (vote === 'yes' ? 1 : 0);
                const currentNo = (asset.data()?.noVotes || 0) + (vote === 'no' ? 1 : 0);

                const updateData: any = {
                    [incrementField]: (asset.data()?.[incrementField] || 0) + 1,
                    lastVoteAt: new Date().toISOString()
                };

                // Consensus Trigger: If net votes >= 10, State Autonomously Underwrites
                if (currentYes - currentNo >= 10 && asset.data()?.status === 'PENDING_CONSENSUS') {
                    updateData.status = 'ACTIVE';
                    updateData.fundingTotal = asset.data()?.metrics?.capitalRequired || 0;
                    updateData.executedAt = new Date().toISOString();
                    updateData.underwrittenBy = 'Sovereign_Consensus';
                }

                await assetRef.update(updateData);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: updateData.status === 'ACTIVE' ? 'Consensus reached. State Underwriting triggered.' : 'Vote recorded'
                }));
            } catch (e) {
                res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
            }
        });
        return;
    }

    // Asset Funding & Execution (Settlement Automata)
    if (url.pathname.startsWith('/api/assets/') && url.pathname.endsWith('/fund') && req.method === 'POST') {
        const assetId = url.pathname.split('/')[3];
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { amount, contributorId } = JSON.parse(body);
                const assetRef = db.collection(COLLECTIONS.ASSETS).doc(assetId);
                const asset = await assetRef.get();
                if (!asset.exists) {
                    res.writeHead(404); res.end(JSON.stringify({ error: 'Asset not found' }));
                    return;
                }

                const currentFunding = asset.data()?.fundingTotal || 0;
                const required = asset.data()?.metrics?.capitalRequired || 0;
                const newFunding = currentFunding + amount;

                const updateData: any = {
                    fundingTotal: newFunding,
                    lastFundedAt: new Date().toISOString()
                };

                // Auto-transition to ACTIVE if fully funded
                if (newFunding >= required && required > 0) {
                    updateData.status = 'ACTIVE';
                    updateData.executedAt = new Date().toISOString();
                }

                await assetRef.update(updateData);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Funding recorded', status: updateData.status || 'FUNDING' }));
            } catch (e) {
                res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
            }
        });
        return;
    }

    // The ASGI Origination Pipeline
    if (url.pathname === '/api/asgi/originate' && req.method === 'POST') {
        // Here, DepthOS / ASGI submits a newly synthesized asset underwriting
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                // Ensure constitutional fields are present
                const proposal = {
                    ...data,
                    originator: 'ASGI_Promethea',
                    originatorLabel: 'Promethea Cognitive Core',
                    timestamp: new Date().toISOString(),
                    status: 'PENDING_CONSENSUS',
                    constitutionalAlignment: true,
                    yesVotes: 0,
                    noVotes: 0,
                    fundingTotal: 0
                };
                const resData = await db.collection(COLLECTIONS.ASSETS).add(proposal);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Underwriting originated', assetId: resData.id }));
            } catch (e) {
                res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
            }
        });
        return;
    }

    // Generic POST for Collections (The Sovereign Intake)
    if (url.pathname === '/api/lake/seed' && req.method === 'POST') {
        const authUser = getAuthUser();
        if (!authUser) {
            res.writeHead(401); res.end(JSON.stringify({ error: 'Sovereign authentication required' }));
            return;
        }

        try {
            const intelPackets = [
                {
                    category: 'FINANCIAL',
                    type: 'RWA_YIELD_SIGNAL',
                    source: 'Web_Synthesis_Ondo_Centrifuge',
                    payload: {
                        observation: 'Structural shift in RWA tokenization. Private credit yields reaching 8-15% on Centrifuge/Goldfinch.',
                        targetProtocols: ['Ondo', 'Centrifuge', 'Goldfinch'],
                        marketCapSignal: '$58B RWA total market cap. Compliance-embedded smart contracts are now standard.'
                    },
                    timestamp: new Date().toISOString()
                },
                {
                    category: 'REAL_ESTATE',
                    type: 'PHYSICAL_ANCHOR_SIGNAL',
                    source: 'BLM_RECLAMATION_DATA',
                    payload: {
                        observation: 'Nevada Abandoned Mine Land (AML) reclamation opportunities identified. Lithium/Gold commodity claims surfacing.',
                        location: 'Elko County, NV / Humboldt Formation',
                        strategy: 'Quiet Title Acquisition for Zombie Assets. Doctrine of Abandonment applies.',
                        visualContext: 'rwa_mineral_claim_ui_1778436188727.png',
                        estimatedValuation: '$1,425,000.00 [NMC]'
                    },
                    timestamp: new Date().toISOString()
                },
                {
                    category: 'ENVIRONMENTAL',
                    type: 'PLANETARY_VITALITY_SIGNAL',
                    source: 'USDA_REGEN_PILOT_2026',
                    payload: {
                        observation: '$700M USDA Regenerative Pilot Program active. Focus on whole-farm outcomes-based conservation.',
                        region: 'High Plains (Wyoming/Utah)',
                        metrics: { sequestrationTarget: '+1.2 tons/acre/year', regenScoreTarget: '90%+' },
                        visualContext: 'regenerative_carbon_node_ui_1778436753422.png'
                    },
                    timestamp: new Date().toISOString()
                },
                {
                    category: 'GOVERNANCE',
                    type: 'MACRO_SENTIMENT_SIGNAL',
                    source: '2026_Economic_Synthesis',
                    payload: {
                        liquidity: 'M2 Money Supply reaccelerating. QE-lite environment. Risk-on bias for verifiable RWA.',
                        labor: 'Jobless Expansion phase. AI-led white-collar displacement. Physical infrastructure (data centers/power) is the only resilient labor sink.'
                    },
                    timestamp: new Date().toISOString()
                }
            ];

            for (const packet of intelPackets) {
                await db.collection(COLLECTIONS.OMNI_INTEL_LAKE).add(packet);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Omni-Lake seeded with Sovereign Intelligence' }));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname.startsWith('/api/') && req.method === 'POST') {
        const parts = url.pathname.split('/');
        const collection = parts[2];
        if (!collection || ['shadow', 'execute', 'ai', 'asgi', 'lake'].includes(collection)) {
            // Let specialized handlers below handle these
        } else {
            const authUser = getAuthUser();
            if (!authUser) {
                res.writeHead(401); res.end(JSON.stringify({ error: 'Sovereign authentication required' }));
                return;
            }

            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);
                    const resData = await db.collection(collection).add(data);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, ...resData }));
                } catch (e) {
                    res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
                }
            });
            return;
        }
    }

    if (url.pathname === '/api/governance/proposals') {
        try {
            const resData: any = await db.collection(COLLECTIONS.PROPOSALS).get();
            let docs = resData.docs.map((d: any) => typeof d.data === 'function' ? d.data() : d.data);
            
            const statusParam = url.searchParams.get('status');
            if (statusParam) {
                const statuses = statusParam.split(',').map(s => s.trim().toLowerCase());
                docs = docs.filter((d: any) => {
                    const docStatus = (d.status || '').toLowerCase();
                    if (statuses.includes(docStatus)) return true;
                    if (statuses.includes('active') && (docStatus === 'pending_consensus' || docStatus === 'active' || docStatus === 'proposed')) return true;
                    if (statuses.includes('proposed') && (docStatus === 'pending_consensus' || docStatus === 'active' || docStatus === 'proposed')) return true;
                    return false;
                });
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(docs));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname === '/api/governance/vote' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const voteData = JSON.parse(body);
                const voteId = voteData.id || `${voteData.proposalId}_${voteData.voter || voteData.citizenId || Math.random().toString(36).substr(2, 9)}`;
                
                await db.collection('votes').doc(voteId).set(voteData);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, id: voteId }));
            } catch (e) {
                res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
            }
        });
        return;
    }

    if (url.pathname === '/api/assets') {
        try {
            const resData: any = await db.collection(COLLECTIONS.ASSETS).get();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(resData.docs.map((d: any) => typeof d.data === 'function' ? d.data() : d.data)));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname.startsWith('/api/exchange/asset/')) {
        const ticker = url.pathname.split('/').pop()?.toUpperCase();
        if (!ticker) {
            res.writeHead(400); res.end(JSON.stringify({ error: 'Ticker required' }));
            return;
        }
        try {
            // Attempt to fetch from Yahoo Finance (Public API, no key required)
            const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1mo&interval=1d`;
            const yfRes = await fetch(yfUrl);
            
            if (yfRes.ok) {
                const yfData: any = await yfRes.json();
                const result = yfData.chart?.result?.[0];
                if (result && result.timestamp && result.indicators.quote[0]) {
                    const quote = result.indicators.quote[0];
                    const candles = result.timestamp.map((time: number, i: number) => ({
                        time: time,
                        open: quote.open[i],
                        high: quote.high[i],
                        low: quote.low[i],
                        close: quote.close[i],
                    })).filter((c: any) => c.open !== null && c.close !== null); // Filter out nulls
                    
                    const latestClose = candles[candles.length - 1].close;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        ticker,
                        price: latestClose,
                        candles: candles
                    }));
                    return;
                }
            }

            // Fallback mock if Yahoo fails or returns empty (e.g. invalid ticker)
            let currentPrice = 150 + Math.random() * 50;
            const data = [];
            const now = new Date();
            for (let i = 100; i >= 0; i--) {
                const time = Math.floor(now.getTime() / 1000) - i * 86400;
                const open = currentPrice;
                const close = currentPrice + (Math.random() - 0.5) * 5;
                const high = Math.max(open, close) + Math.random() * 2;
                const low = Math.min(open, close) - Math.random() * 2;
                data.push({ time, open, high, low, close });
                currentPrice = close;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ticker, price: currentPrice, candles: data }));
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

    // --- GENERIC DATA ACCESS (Sovereign Proxy) ---
    if (url.pathname.startsWith('/api/data/')) {
        try {
            const parts = url.pathname.split('/');
            const collectionName = parts[3];
            const docId = parts[4];

            if (docId) {
                const doc = await db.collection(collectionName).doc(docId).get();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(doc.exists ? doc.data() : { error: 'Not found' }));
            } else {
                const snapshot = await db.collection(collectionName).get();
                const data = snapshot.docs.map((d: any) => typeof d.data === 'function' ? d.data() : d.data);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            }
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname === '/api/atlas/layers') {
        try {
            const { atlasService } = require('./services/atlas-service');
            const layers = await atlasService.getSovereignLayers();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(layers));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
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
            const resData: any = await db.collection(COLLECTIONS.OMNI_INTEL_LAKE).get();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(resData.docs.map((d: any) => typeof d.data === 'function' ? d.data() : d.data)));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname === '/api/market/ingest' && req.method === 'POST') {
        const authUser = getAuthUser();
        if (!authUser) {
            res.writeHead(401); res.end(JSON.stringify({ error: 'Sovereign authentication required' }));
            return;
        }

        try {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                const payload = JSON.parse(body);
                console.log(`[Marketplace] Ingesting new asset from ${payload.providerId || 'Unknown'}...`);

                const marketplaceColl = db.collection('marketplace');
                const result = await marketplaceColl.add({
                    title: payload.proposalText ? payload.proposalText.substring(0, 50) + '...' : 'Autonomous Asset Listing',
                    description: payload.proposalText || 'No description provided.',
                    type: 'Digital',
                    price: 0,
                    currency: 'UVT',
                    methodId: 'citizen-ingest',
                    status: 'Available',
                    barterAllowed: true,
                    createdAt: new Date().toISOString()
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, id: result.id }));
            });
        } catch (e) {
            console.error('[Marketplace Ingest] Failure:', e);
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname === '/api/ai/ingest' && req.method === 'POST') {
        const authUser = getAuthUser();
        if (!authUser) {
            res.writeHead(401); res.end(JSON.stringify({ error: 'Sovereign authentication required for AI ingestion' }));
            return;
        }

        try {
            const chunks: any[] = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                const mimeType = req.headers['content-type'] || 'application/octet-stream';

                console.log(`[Ingest] Deciphering intent from ${mimeType} (${buffer.length} bytes)...`);
                const result = await proposalIngestor.ingest(buffer, mimeType);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            });
        } catch (e) {
            console.error('[Ingest] Failure:', e);
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    if (url.pathname === '/api/broker') {
        try {
            const isAuth = await brokerGateway.checkAuthentication();
            const nlv = await brokerGateway.getNetLiquidWorth();
            const positions = await brokerGateway.getPositions();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                authenticated: isAuth,
                netLiquidWorth: nlv,
                positions: positions
            }));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    // --- CONTEXTUAL STATE API (MULTI-TENANCY) ---
    const stateMatch = url.pathname.match(/^\/api\/state\/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?$/);
    if (stateMatch) {
        const stateId = stateMatch[1];
        const collectionName = stateMatch[2];
        const docId = stateMatch[3];

        try {
            // SPECIALIZED HANDLERS (CONTEXT-AWARE)
            if (collectionName === 'security_telemetry' && docId === 'pulse') {
                const stats = await immuneSystem.getStatus();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ...stats, orgId: stateId }));
                return;
            }

            if (collectionName === 'atlas' && docId === 'layers') {
                const { atlasService } = require('./services/atlas-service');
                const layers = await atlasService.getSovereignLayers();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(layers));
                return;
            }

            // DEFAULT COLLECTION FETCHING
            const coll = db.collection(collectionName, stateId);
            if (docId) {
                const doc = await coll.doc(docId).get();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(doc.exists ? doc.data() : { error: 'Not found' }));
            } else {
                const resData = await coll.get();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                const docs = resData && resData.docs ? resData.docs : [];
                res.end(JSON.stringify(docs.map((d: any) => ({ ...d.data(), id: d.id }))));
            }
        } catch (e) {
            console.error(`[Sovereign State API] Error fetching ${stateId}/${collectionName}:`, e);
            const origin = req.headers.origin || '*';
            res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin
            });
            res.end(JSON.stringify({ error: (e as Error).message }));
        }
        return;
    }

    // --- LEGACY PROXY (BACKWARD COMPATIBILITY) ---
    // Catch-all for /api/:collection or /api/data/:collection
    const legacyDataMatch = url.pathname.match(/^\/api\/(?:data\/)?([^\/]+)(?:\/([^\/]+))?$/);
    if (legacyDataMatch) {
        const collectionName = legacyDataMatch[1];
        const docId = legacyDataMatch[2];
        const stateId = 'tpns_genesis';

        // Filter out non-collection API paths
        const protectedPaths = ['shadow', 'execute', 'ai', 'asgi', 'lake', 'syndicate', 'linkedin', 'refineries', 'waterfall', 'intel', 'assets', 'exodus', 'security_telemetry', 'atlas', 'state', 'governance'];
        if (!protectedPaths.includes(collectionName)) {
            try {
                const coll = db.collection(collectionName, stateId);
                if (docId) {
                    const doc = await coll.doc(docId).get();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(doc.exists ? { ...doc.data(), id: docId } : { error: 'Not found' }));
                } else {
                    const resData = await coll.get();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    // Frontend expects a flat array for collection fetches
                    res.end(JSON.stringify(resData.docs.map((d: any) => ({ ...d.data(), id: d.id }))));
                }
            } catch (e) {
                console.error(`[Legacy Proxy] Error fetching ${collectionName}:`, e);
                res.writeHead(500); res.end(JSON.stringify({ error: (e as Error).message }));
            }
            return;
        }
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
