#!/usr/bin/env node
/**
 * Phase B: The Great State Migration - Genesis Snapshot Script
 * 
 * Reads from Firestore and exports the genesis state to a JSON file 
 * that will be used to initialize the on-chain state via airdrop.
 * 
 * Usage: GOOGLE_SERVICE_ACCOUNT_JSON='...' node scripts/great-state-migration.cjs
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Load credentials
let db = null;

try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON env var is required');
    }
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    if (!getApps().length) {
        initializeApp({ credential: cert(serviceAccount) });
    }
    db = getFirestore();
    console.log("✅ Firebase connection established.");
} catch (e) {
    console.error("❌ Firebase init failed:", e.message);
    process.exit(1);
}

async function migrate() {
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
    console.log(`   Citizens:    ${genesisPayload.stats.totalCitizens}`);
    console.log(`   UVT Total:   ${genesisPayload.stats.totalUVTCirculating}`);
    console.log(`   Proposals:   ${genesisPayload.stats.totalProposals}`);
    console.log(`   Votes:       ${genesisPayload.stats.totalVotes}`);
    console.log(`\n📂 Saved to: ${outputPath}`);
    console.log(`\n⚡ NEXT: Deploy Smart Contracts and run the airdrop from this snapshot.`);
    console.log("=========================================\n");
}

migrate().catch(e => {
    console.error("Migration failed:", e);
    process.exit(1);
});
