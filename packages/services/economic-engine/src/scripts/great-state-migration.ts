import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import bs58 from 'bs58';

/**
 * Phase B: The Great State Migration (The Genesis Event)
 * 
 * 1. Takes a real-time snapshot of the legacy Firestore database (UVT balances, Citizens, Proposals).
 * 2. Compiles a cryptographic Merkle tree (or direct ledger array) of the State.
 * 3. Prepares the executable payload to Airdrop UVT and initialize State on Solana Mainnet.
 */

// Load Google Service Account
const serviceAccountPath = path.resolve(process.cwd(), '../../../../env.production.yaml'); // Adjust based on execution path if necessary
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON; 

if (!getApps().length && GOOGLE_SERVICE_ACCOUNT_JSON) {
    initializeApp({
        credential: cert(JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON)),
        projectId: 'studio-9105849211-9ba48'
    });
} else if (!getApps().length) {
    console.warn("⚠️  GOOGLE_SERVICE_ACCOUNT_JSON missing. Running in dry-run mode without database access.");
}

const db = getApps().length ? getFirestore() : null;

// Solana Configuration
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

async function migrateState() {
    console.log("=========================================");
    console.log("🌌 INITIATING THE GREAT STATE MIGRATION");
    console.log("=========================================\n");

    if (!db) {
        console.error("❌ Database connection failed. Aborting migration.");
        return;
    }

    console.log("[1/4] Taking Snapshot of Citizens (Reputation & Wallets)...");
    const citizensSnap = await db.collection('citizens').get();
    const citizens: Record<string, any> = {};
    let totalReputation = 0;

    citizensSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.solanaAddress || data.ethAddress) { // Only migrate citizens with wallets
            citizens[doc.id] = {
                reputation: data.reputation || 0,
                solanaAddress: data.solanaAddress || null,
                roles: data.roles || []
            };
            totalReputation += (data.reputation || 0);
        }
    });
    console.log(`✅ Snapshot complete: ${Object.keys(citizens).length} Sovreign Citizens mapped. Total Network Rep: ${totalReputation}`);


    console.log("\n[2/4] Consolidating Universal Value Tokens (UVT)...");
    const uvtSnap = await db.collection('universal_value_tokens').get();
    const uvtBalances: Record<string, number> = {};
    
    let totalCirculatingUVT = 0;
    uvtSnap.docs.forEach(doc => {
        const data = doc.data();
        const owner = data.ownerId;
        if (!uvtBalances[owner]) uvtBalances[owner] = 0;
        
        uvtBalances[owner] += data.amount || 0;
        totalCirculatingUVT += data.amount || 0;
    });
    console.log(`✅ Snapshot complete: ${totalCirculatingUVT} UVT found across ${Object.keys(uvtBalances).length} wallets.`);

    console.log("\n[3/4] Archiving Constitutional Proposals...");
    const proposalsSnap = await db.collection('proposals').get();
    const legacyProposals = [];
    proposalsSnap.docs.forEach(doc => {
        legacyProposals.push({
            id: doc.id,
            ...doc.data()
        });
    });
    console.log(`✅ Snapshot complete: ${legacyProposals.length} Proposals documented for IPFS archival.`);


    console.log("\n[4/4] Generating Migration Payload...");
    
    // Create the Genesis payload
    const genesisPayload = {
        timestamp: new Date().toISOString(),
        networkTarget: 'Solana Mainnet',
        uvtMint: 'Bm2GRKS92odxL6P4grmYyDMNChWNhQPHrLgcJRab7vf1',
        totalCirculatingUVT,
        totalReputation,
        state: {
            citizens,
            uvtBalances,
            legacyProposals
        }
    };

    const outputPath = path.resolve(__dirname, 'genesis_snapshot.json');
    fs.writeFileSync(outputPath, JSON.stringify(genesisPayload, null, 2));

    console.log(`\n🎉 The Great State Migration snapshot is complete!`);
    console.log(`📂 Saved to: ${outputPath}`);
    console.log(`\n⚠️  NEXT STEP: Execute this payload against the new Sovereign Smart Contracts on Solana Mainnet.`);
    console.log("   Command: ts-node migrate-to-chain.ts genesis_snapshot.json");
    console.log("=========================================");
}

migrateState().catch(console.error);
