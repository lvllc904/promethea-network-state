const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml'); // I hope this is installed, otherwise I'll use regex
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function run() {
    console.log("Reading env.production.yaml...");
    const envPath = path.resolve(__dirname, '../env.production.yaml');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Simple regex to extract the JSON string if js-yaml isn't reliable for this format
    const match = envContent.match(/GOOGLE_SERVICE_ACCOUNT_JSON:\s*'({.*})'/);
    if (!match) {
        console.error("Could not find GOOGLE_SERVICE_ACCOUNT_JSON in env.production.yaml");
        process.exit(1);
    }
    
    // Use the extracted service-account.json via environment variable
    const serviceAccountPath = path.resolve(__dirname, 'service-account.json');
    process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;

    if (!getApps().length) {
        initializeApp({ 
            // credential: cert(serviceAccountFile), // Still failing with cert parsing
            projectId: "studio-9105849211-9ba48"
        });
    }
    const db = getFirestore();
    console.log("✅ Firebase connection established.");

    // Copy-pasting logic from great-state-migration.cjs
    console.log("\n=========================================");
    console.log("🌌 THE GREAT STATE MIGRATION — GENESIS SNAPSHOT");
    console.log("=========================================\n");

    // 1. Citizens
    console.log("[1/4] Snapshotting Citizens...");
    const citizensSnap = await db.collection('citizens').get();
    const citizens = {};
    citizensSnap.docs.forEach(doc => {
        const data = doc.data();
        citizens[doc.id] = {
            reputation: data.reputation || 0,
            solanaAddress: data.solanaAddress || null,
            roles: data.roles || [],
            displayName: data.displayName || doc.id
        };
    });
    console.log(`  ✅ ${Object.keys(citizens).length} citizens snapshotted`);

    // 2. UVT Ledger
    console.log("[2/4] Snapshotting UVT Ledger...");
    const uvtSnap = await db.collection('universal_value_tokens').get();
    const uvtBalances = {};
    let totalUVT = 0;
    uvtSnap.docs.forEach(doc => {
        const data = doc.data();
        const owner = data.ownerId;
        if (!uvtBalances[owner]) uvtBalances[owner] = 0;
        uvtBalances[owner] += (data.amount || 0);
        totalUVT += (data.amount || 0);
    });
    console.log(`  ✅ ${totalUVT} total UVT across ${Object.keys(uvtBalances).length} holders`);

    // 3. Proposals (for IPFS archival)
    console.log("[3/4] Snapshotting Proposals...");
    const proposalsSnap = await db.collection('proposals').get();
    const proposals = proposalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`  ✅ ${proposals.length} proposals archived`);

    // 4. Votes
    console.log("[4/4] Snapshotting Votes...");
    const votesSnap = await db.collection('votes').get();
    const votes = votesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`  ✅ ${votes.length} votes recorded`);

    // Generate Genesis Payload
    const genesisPayload = {
        timestamp: new Date().toISOString(),
        networkTarget: 'Solana Mainnet',
        contracts: {
            uvtMint: 'Bm2GRKS92odxL6P4grmYyDMNChWNhQPHrLgcJRab7vf1',
            treasury: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
            governance: 'GrAkKfEpTKQuVHG2Y97Y2FF4i7y7Q5AHLK94PC5Bpcy3',
            rwaRegistry: 'HmbTLCmaGvZhKnn1Zfa1JVnp7vkMV4DYVxPLWBVoN65L'
        },
        stats: {
            totalCitizens: Object.keys(citizens).length,
            totalUVTCirculating: totalUVT,
            totalProposals: proposals.length,
            totalVotes: votes.length
        },
        state: { citizens, uvtBalances, proposals, votes }
    };

    const outputPath = path.resolve(__dirname, 'genesis_snapshot.json');
    fs.writeFileSync(outputPath, JSON.stringify(genesisPayload, null, 2));

    console.log(`\n🎉 GENESIS SNAPSHOT COMPLETE`);
    console.log(`\n📂 Saved to: ${outputPath}`);
    console.log("=========================================\n");
}

run().catch(console.error);
