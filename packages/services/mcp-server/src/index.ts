import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { ethers } from 'ethers';
import crypto from 'crypto';
import { URL } from 'url';

// In-memory store for challenges. In a real implementation, this would be a more robust, expiring store like Redis.
const challenges = new Map<string, string>();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// In-memory store for messages. In a real implementation, this would be a more robust queue or database.
const messages: any[] = [];

app.use(express.json());

// --- Middleware for Agent HTTP Authentication (DID Signature) ---
const authenticateAgent = async (req: Request, res: Response, next: NextFunction) => {
    const did = req.headers['x-agent-did'] as string;
    const signature = req.headers['x-agent-signature'] as string;
    // The original challenge is sent back to be verified
    const challenge = req.headers['x-challenge'] as string;

    if (!did || !signature || !challenge) {
        return res.status(401).send({ error: 'Unauthorized: Missing agent authentication headers (X-Agent-DID, X-Challenge, X-Agent-Signature).' });
    }

    const storedChallenge = challenges.get(did);

    if (storedChallenge !== challenge) {
        console.warn(`[MCP Server] Failed auth attempt for DID ${did}. Challenge mismatch or replay attempt.`);
        return res.status(403).send({ error: 'Forbidden: Invalid or expired challenge.' });
    }

    // Challenge is single-use, delete it immediately to prevent replay attacks.
    challenges.delete(did);

    try {
        const signerAddr = ethers.verifyMessage(challenge, signature);
        if (signerAddr.toLowerCase() !== did.toLowerCase()) {
            throw new Error('Signature does not match DID.');
        }
        next();
    } catch (err) {
        console.error(`[MCP Server] Agent authentication failed for DID ${did}: Invalid signature.`);
        return res.status(403).send({ error: 'Forbidden: Invalid signature.' });
    }
};

// Endpoint for agents to post messages
app.post('/messages', authenticateAgent, (req: Request, res: Response) => {
    const message = req.body;
    message.timestamp = new Date().toISOString();
    // The DID is now authenticated by the middleware, we can trust it as the source.
    message.source = req.headers['x-agent-did'];

    console.log(`[MCP Server] Received authenticated message from agent: ${message.source}`);

    messages.push(message);

    // Broadcast the new message to all connected clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });

    res.status(200).send({ status: 'Message received' });
});

// Endpoint to get all historical messages
app.get('/messages', authenticateAgent, (req: Request, res: Response) => {
    res.status(200).json(messages);
});

// --- Challenge-Response for Human/Steward/Agent Authentication ---
app.post('/auth/challenge', (req: Request, res: Response) => {
    const { did } = req.body;
    if (!did || !ethers.isAddress(did)) {
        return res.status(400).send({ error: 'A valid DID (Ethereum address) is required.' });
    }
    const challenge = `Sign this message to authenticate with the MCP Server: ${crypto.randomBytes(16).toString('hex')}`;
    challenges.set(did, challenge);
    console.log(`[MCP Server] Generated challenge for DID: ${did}`);
    res.status(200).send({ challenge });
});

wss.on('connection', (ws: WebSocket) => {
    console.log('[MCP Server] Authenticated client connected for real-time logs.');

    // Send historical messages to the newly connected client
    messages.forEach(msg => {
        ws.send(JSON.stringify(msg));
    });

    ws.on('close', () => {
        console.log('[MCP Server] Client disconnected.');
    });
});

// --- WebSocket Connection Handling with Authentication ---
server.on('upgrade', async (request, socket, head) => {
    const { searchParams } = new URL(request.url, `http://${request.headers.host}`);
    const did = searchParams.get('did');
    const signature = searchParams.get('signature');

    if (!did || !signature) {
        console.log('[MCP Server] WebSocket connection rejected: Missing DID or signature.');
        socket.write('HTTP/1.1 401 Unauthorized\\r\\n\\r\\n');
        socket.destroy();
        return;
    }

    const challenge = challenges.get(did);

    if (!challenge) {
        console.log(`[MCP Server] WebSocket connection rejected: No challenge found for DID ${did}.`);
        socket.write('HTTP/1.1 401 Unauthorized\\r\\n\\r\\n');
        socket.destroy();
        return;
    }

    // Clean up the used challenge
    challenges.delete(did);

    try {
        const signerAddr = ethers.verifyMessage(challenge, signature);
        if (signerAddr.toLowerCase() !== did.toLowerCase()) {
            throw new Error('Signature does not match DID.');
        }
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } catch (err) {
        console.log(`[MCP Server] WebSocket connection rejected: Invalid signature for DID ${did}.`);
        socket.write('HTTP/1.1 403 Forbidden\\r\\n\\r\\n');
        socket.destroy();
    }
});

const PORT = process.env.PORT || 8081; // MCP Server port
server.listen(PORT, () => {
    console.log(`[MCP Server] Listening on http://localhost:${PORT}`);
});