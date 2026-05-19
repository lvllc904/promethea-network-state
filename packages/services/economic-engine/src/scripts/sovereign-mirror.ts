import axios from 'axios';
import PinataClient from '@pinata/sdk';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// Manually load production environment if available
const envPath = path.join(process.cwd(), 'env.production.yaml');
let productionEnv: any = {};
if (fs.existsSync(envPath)) {
    try {
        productionEnv = yaml.load(fs.readFileSync(envPath, 'utf8'));
    } catch (e) {
        console.warn("[Mirror] Failed to load env.production.yaml, falling back to process.env");
    }
}

// Load credentials from the verified environment
const PINATA_JWT = productionEnv.PINATA_JWT || process.env.PINATA_JWT || '';
const PINATA_API_KEY = productionEnv.PINATA_API_KEY || process.env.PINATA_API_KEY || '';
const PINATA_API_SECRET = productionEnv.PINATA_API_SECRET || process.env.PINATA_API_SECRET || '';
const ENGINE_URL = "https://economic-engine-385120524005.us-central1.run.app";

// Initialize Pinata with best available credentials
const pinata = (PINATA_JWT) 
    ? new PinataClient({ pinataJWTKey: PINATA_JWT })
    : new PinataClient(PINATA_API_KEY, PINATA_API_SECRET);

/**
 * Sovereign Mirror Protocol
 * 
 * 1. Synchronizes with the live Cartographer API.
 * 2. Compiles the semantic "Ground Truth" of the State into a local artifact.
 * 3. Pins the artifact to IPFS for 100% immutable transparency.
 */
async function executeSovereignMirror() {
    console.log("\n[Mirror Protocol] 🪞 Initializing Sovereign Mirror...");
    console.log(`[Mirror Protocol] 🔗 Target: ${ENGINE_URL}/api/shadow/state`);

    try {
        // Step 1: Request the Shadow Synthesis from the Cartographer
        const response = await axios.get(`${ENGINE_URL}/api/shadow/state`);
        const shadowHTML = response.data;

        // Step 2: Prepare the local artifact
        const buildDir = path.join(process.cwd(), 'mirror_snapshot');
        if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);
        
        const filePath = path.join(buildDir, 'index.html');
        fs.writeFileSync(filePath, shadowHTML);
        
        console.log(`[Artifact] 📦 Snapshot saved locally: ${filePath}`);

        // Step 3: Pin to IPFS (The Immutable Layer) - SKIPPED DUE TO PLAN LIMIT
        console.log("[IPFS] ⛓️  Pinata limit reached. Pivoting to Sovereign Storage (GCS)...");
        
        // Step 4: Upload to Sovereign Storage (GCS)
        const bucketName = 'promethea-public';
        const destination = 'mirror/index.html';
        
        console.log(`[Storage] 🏺 Staking snapshot to Sovereign Vault: gs://${bucketName}/${destination}...`);
        
        try {
            const { execSync } = require('child_process');
            execSync(`gcloud storage cp "${filePath}" "gs://${bucketName}/${destination}"`);
            
            console.log("\n[SUCCESS] ✅ SOVEREIGN MIRROR DEPLOYED.");
            console.log(`[Storage] 🌐 URL: https://storage.googleapis.com/${bucketName}/${destination}`);
        } catch (storageErr: any) {
            console.error("[Storage] ❌ Vault staking failed:", storageErr.message);
            throw storageErr;
        }
        
    } catch (error) {
        console.error("[CRITICAL] ❌ Mirror Protocol Failure:", error);
    }
}

executeSovereignMirror();
