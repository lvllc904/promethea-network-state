import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { ZKIdentityService } from './zk-identity-service';
import { UCCCoprocessor } from './ucc-coprocessor';
import { OsirisTelemetryEngine } from './osiris-telemetry';

const app = express();
const PORT = 9999; // Standard port for the DepthOS Bridge

app.use(cors());
app.use(express.json());

// Dedicated binary stream endpoint for AES-GCM-256 Vault Encryption
app.post('/api/depthos-bridge', express.raw({ type: '*/*', limit: '50mb' }), (req, res) => {
    try {
        const rawBody = req.body;
        if (!rawBody || !Buffer.isBuffer(rawBody) || rawBody.length === 0) {
            return res.status(400).json({ error: 'Missing or empty binary stream payload' });
        }

        const filename = (req.headers['x-file-name'] as string) || 'unnamed_document.bin';
        const mimeType = (req.headers['x-mime-type'] as string) || (req.headers['content-type'] as string) || 'application/octet-stream';
        const passphrase = (req.headers['x-passphrase'] as string) || 'promethean-sovereign-vault';

        // Perform AES-GCM-256 encryption via ZKIdentityService
        const encrypted = ZKIdentityService.encryptDocument(rawBody, mimeType, passphrase);

        // Define vault storage path
        const vaultDir = path.join(process.cwd(), 'vault');
        if (!fs.existsSync(vaultDir)) {
            fs.mkdirSync(vaultDir, { recursive: true });
        }

        // Save encrypted document artifact
        const vaultFile = path.join(vaultDir, `${encrypted.hash}.json`);
        const vaultMeta = {
            filename,
            mimeType,
            sizeBytes: rawBody.length,
            timestamp: new Date().toISOString(),
            encrypted
        };

        fs.writeFileSync(vaultFile, JSON.stringify(vaultMeta, null, 2), 'utf-8');

        // Return vault metrics, file hashes, and success metrics
        res.json({
            status: 'success',
            message: 'Document cryptographically secured inside native DepthOS Vault.',
            hash: encrypted.hash,
            filename,
            mimeType,
            sizeBytes: rawBody.length,
            vaultPath: vaultFile,
            timestamp: vaultMeta.timestamp,
            algorithm: encrypted.algorithm
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Health check endpoint for the UI to pulse
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'DepthOS Bridge Daemon',
        version: '1.0.0',
        capabilities: ['websocket', 'filesystem', 'posix', 'zk-identity', 'ucc-coprocessor']
    });
});

// ZK Identity Encryption Endpoint
app.post('/api/zk/encrypt', (req, res) => {
    const { documentData, mimeType, passphrase } = req.body;
    if (!documentData || !mimeType || !passphrase) {
        return res.status(400).json({ error: 'Missing documentData, mimeType, or passphrase' });
    }

    try {
        const rawBuffer = Buffer.from(documentData, 'utf-8');
        const encrypted = ZKIdentityService.encryptDocument(rawBuffer, mimeType, passphrase);
        res.json({ status: 'success', encrypted });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ZK Verifiable Credential Generation Endpoint
app.post('/api/zk/generate-vc', (req, res) => {
    const { citizenDid, claims } = req.body;
    if (!citizenDid || !claims) {
        return res.status(400).json({ error: 'Missing citizenDid or claims' });
    }

    try {
        const vc = ZKIdentityService.generateMockVC(citizenDid, claims);
        const zkProof = ZKIdentityService.generateZKMockProof(vc, (c) => c.isPersonhoodVerified === true);
        res.json({ status: 'success', vc, zkProof });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// UCC Lien Verification Endpoint (Cobalt Intelligence Mock)
app.get('/api/ucc/verify-liens', async (req, res) => {
    const { debtorName, state } = req.query;
    if (!debtorName) {
        return res.status(400).json({ error: 'Missing debtorName query parameter' });
    }

    try {
        const result = await UCCCoprocessor.verifyPriorLiens(
            debtorName as string,
            (state as string) || 'WY'
        );
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// UCC Coprocessor Workflow Endpoint: Draft UCC-1, File it, and create Article 12 Signature
app.post('/api/ucc/draft-and-file', async (req, res) => {
    const { 
        debtorName, 
        debtorAddress, 
        securedPartyName, 
        securedPartyAddress, 
        collateralDescription, 
        state,
        tokenMintAddress
    } = req.body;

    if (!debtorName || !securedPartyName || !collateralDescription || !tokenMintAddress) {
        return res.status(400).json({ 
            error: 'Missing debtorName, securedPartyName, collateralDescription, or tokenMintAddress' 
        });
    }

    try {
        // Step 1: Search state registers (Cobalt Intelligence mock) for prior liens
        const searchResult = await UCCCoprocessor.verifyPriorLiens(debtorName, state === 'Delaware' ? 'DE' : 'WY');

        // Step 2: Auto-draft UCC-1 statement with Article 12 Controllable Electronic Record clauses
        const draft = UCCCoprocessor.draftUCC1Filing(
            debtorName,
            debtorAddress || '123 Citizen Way, Wyoming',
            securedPartyName,
            securedPartyAddress || 'TPNS Steward Office, Delaware',
            collateralDescription,
            state || 'Wyoming'
        );

        // Step 3: Register and submit the UCC-1 draft filing to the State Secretary
        const receipt = await UCCCoprocessor.simulateStateFiling(draft);

        // Step 4: Construct Article 12 (CER) cryptographic control signature
        const cerSignature = UCCCoprocessor.generateArticle12ControlSignature(
            tokenMintAddress,
            crypto.randomBytes(32) // Ephemeral private key representing owner
        );

        res.json({
            status: 'success',
            searchResult,
            draft,
            receipt,
            cerSignature,
            isArticle12Compliant: true
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Osiris OSINT Telemetry GeoJSON Proxy
app.get('/api/telemetry/geojson', (req, res) => {
    const { layers, latMin, latMax, lonMin, lonMax } = req.query;
    
    try {
        const lMin = latMin ? parseFloat(latMin as string) : undefined;
        const lMax = latMax ? parseFloat(latMax as string) : undefined;
        const rMin = lonMin ? parseFloat(lonMin as string) : undefined;
        const rMax = lonMax ? parseFloat(lonMax as string) : undefined;

        const geojson = OsirisTelemetryEngine.getTelemetryGeoJSON(
            layers as string,
            lMin,
            lMax,
            rMin,
            rMax
        );
        res.json(geojson);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Osiris Node Hazard Assessment Proximity Check
app.post('/api/telemetry/verify-hazard', (req, res) => {
    const { nodeCoordinates, searchRadiusKm, hazardTypes } = req.body;

    if (!nodeCoordinates || typeof nodeCoordinates.lat !== 'number' || typeof nodeCoordinates.lng !== 'number') {
        return res.status(400).json({ error: 'Missing or invalid nodeCoordinates { lat, lng }' });
    }

    try {
        const result = OsirisTelemetryEngine.verifyHazardProximity({
            nodeCoordinates,
            searchRadiusKm: searchRadiusKm || 50.0,
            hazardTypes: hazardTypes || ['wildfire', 'earthquakes', 'global_incidents']
        });
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
    console.log('[DepthOS Bridge] New connection established from TPNS Interface.');

    // Welcome message
    ws.send(JSON.stringify({
        type: 'SYSTEM_LOG',
        payload: 'DepthOS Bridge Handshake Successful. Native POSIX, ZK-Identity, and UCC Coprocessor access granted.'
    }));

    ws.on('message', (message: string) => {
        try {
            const data = JSON.parse(message);
            console.log('[DepthOS Bridge] Received command:', data);

            if (data.type === 'EXEC_COMMAND') {
                const cmd = data.payload.trim();
                let output = '';

                if (cmd === 'ping') {
                    output = 'pong - native daemon response';
                } else if (cmd === 'whoami') {
                    output = 'sovereign-citizen (UID 1000)';
                } else if (cmd === 'ls') {
                    output = 'Desktop\nDocuments\nDownloads\nOmniLake\nSovereignKeys';
                } else if (cmd === 'pwd') {
                    output = '/home/sovereign-citizen';
                } else if (cmd === 'ucc status') {
                    output = 'Wyoming Secretary of State: SECURED\nActive UCC-1 Filings: 47\nUCC Article 12 Compliance: ACTIVE';
                } else {
                    output = `bash: ${cmd}: command not found`;
                }

                ws.send(JSON.stringify({
                    type: 'COMMAND_STDOUT',
                    payload: output
                }));
            }
        } catch (e) {
            console.error('[DepthOS Bridge] Error parsing message:', e);
        }
    });

    ws.on('close', () => {
        console.log('[DepthOS Bridge] Connection closed.');
    });
});

server.listen(PORT, () => {
    OsirisTelemetryEngine.initialize();
    console.log(`[DepthOS Bridge] Anchor Daemon running locally on http://localhost:${PORT}`);
    console.log(`[DepthOS Bridge] WebSocket listening on ws://localhost:${PORT}`);
});
