const admin = require('firebase-admin');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'studio-9105849211-9ba48';

admin.initializeApp({
    projectId: projectId,
});

const db = admin.firestore();

async function initSubstrate() {
    console.log(`[INIT] Bootstrapping Substrate for project: ${projectId}`);

    // 1. Founding Citizen (Placeholder for initialization)
    // Note: Real users are created via Auth, but we can pre-seed a "Founding Team" record
    const foundingCitizenId = 'founding-citizen-alpha';
    const citizenData = {
        uid: foundingCitizenId,
        decentralizedId: `did:prmth:sol:${uuidv4()}`,
        displayName: 'Founding Steward',
        email: 'steward@promethea.network',
        governanceTokens: 1000,
        reputation: 100,
        reputationScore: 95,
        personhoodScore: 100,
        contributionScore: 500,
        isGovIdVerified: true,
        proofOfUniqueness: {
            issuanceDate: new Date().toISOString(),
            issuer: 'Promethea Root Authority',
        },
        skills: ['Sovereign Governance', 'Economic Architecture', 'AI Symbiosis'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('citizens').doc(foundingCitizenId).set(citizenData);
    console.log('[INIT] Created Founding Citizen');

    // 2. Real World Assets (RWAs)
    const assets = [
        {
            id: 'rwa-seattle-001',
            name: 'Promethean Innovation Hub (Seattle)',
            description: 'A 5,000 sq ft collaborative manufacturing and research space for autonomous systems.',
            assetType: 'Real Estate',
            location: 'Seattle, WA, USA',
            value: 1250000,
            ownerId: 'promethea-dac',
            status: 'Active',
            createdAt: new Date().toISOString(),
        },
        {
            id: 'rwa-london-001',
            name: 'Sovereign Vertical Farm (Alpha)',
            description: 'High-density hydroponic facility providing food security for the local DAC node.',
            assetType: 'Agriculture',
            location: 'London, UK',
            value: 750000,
            ownerId: 'promethea-dac',
            status: 'Active',
            createdAt: new Date().toISOString(),
        },
    ];

    for (const asset of assets) {
        await db.collection('real_world_assets').doc(asset.id).set(asset);
    }
    console.log('[INIT] Created 2 Real World Assets');

    // 3. Proposals
    const proposals = [
        {
            id: 'proposal-tokyo-001',
            proposerId: foundingCitizenId,
            title: 'Acquisition of Tokyo Edge Node',
            description: 'Proposal to acquire a server cluster in Tokyo to reduce latency for the Asian Citizen Node.',
            category: 'RWA Acquisition',
            status: 'Active',
            votingStartTime: new Date().toISOString(),
            votingEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            ipfsCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
            targetEquity: 50000,
            pledgedCapital: 12500,
            pledgedSweatEquity: 5000,
            tasks: [
                { description: 'Technical Due Diligence', priority: 'High' },
                { description: 'Contract Review', priority: 'Medium' },
            ],
        },
        {
            id: 'proposal-gov-001',
            proposerId: foundingCitizenId,
            title: 'Universal Value Token (UVT) Expansion',
            description: 'Increasing the minting capacity for Labor-based UVTs to accommodate 500 new technical contributors.',
            category: 'Governance',
            status: 'Active',
            votingStartTime: new Date().toISOString(),
            votingEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            ipfsCid: 'QmZ4tj3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
            targetEquity: 0,
            pledgedCapital: 0,
            pledgedSweatEquity: 0,
            tasks: [
                { description: 'Minting Policy Update', priority: 'High' },
            ],
        },
    ];

    for (const proposal of proposals) {
        await db.collection('proposals').doc(proposal.id).set(proposal);
    }
    console.log('[INIT] Created 2 Active Proposals');

    // 4. Topics for Pub/Sub (Mention/Log)
    console.log('[INIT] WARNING: Ensure Pub/Sub topic "promethean-team-conversation" and subscription "user-sub" exist in GCP Console.');

    console.log('[INIT] Substrate Bootstrapping Complete.');
    process.exit(0);
}

initSubstrate().catch((error) => {
    console.error('[INIT] Failed to bootstrap substrate:', error);
    process.exit(1);
});
