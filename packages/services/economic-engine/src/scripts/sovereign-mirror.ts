import axios from 'axios';
import PinataClient from '@pinata/sdk';
import fs from 'fs';
import path from 'path';

// Load credentials from the verified environment
const PINATA_JWT = process.env.PINATA_JWT || '';
const ENGINE_URL = "https://economic-engine-385120524005.us-central1.run.app";

const pinata = new PinataClient({ pinataJWTKey: PINATA_JWT });

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

        // Step 3: Pin to IPFS (The Immutable Layer)
        console.log("[IPFS] ⛓️  Staking snapshot to the decentralized web via Pinata...");
        
        const options = {
            pinataMetadata: {
                name: `Promethean_Network_State_Mirror_${new Date().toISOString()}`,
                keyvalues: {
                    type: 'SOVEREIGN_MIRROR',
                    origin: 'GCP_CLOUD_RUN'
                }
            }
        };

        const result = await pinata.pinFromFS(buildDir, options);
        
        console.log("\n[SUCCESS] ✅ SOVEREIGN MIRROR DEPLOYED.");
        console.log(`[IPFS] 🌐 CID: ${result.IpfsHash}`);
        console.log(`[IPFS] 🔗 Gateway: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
        
    } catch (error) {
        console.error("[CRITICAL] ❌ Mirror Protocol Failure:", error);
    }
}

executeSovereignMirror();
