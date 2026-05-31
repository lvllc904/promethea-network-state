import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { publishTeamMessage, TeamMessage } from '@promethea/pubsub';
import { PubSub, v1 } from '@google-cloud/pubsub';
import { askPrometheaFlow } from './flows/promethea-assistant';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const app = express();
const port = Number(process.env.PORT) || 4002;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'studio-9105849211-9ba48';

// Middleware
app.use(cors()); // Enable CORS for all origins (DAC frontend)
app.use(express.json({ limit: '10mb' }));

// ─── Middleware: UCS-ADM Authorization ─────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'promethea-sovereign-intelligence-v5';

const ucsAdmMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const syndicateId = (req.query.syndicate_id as string) || 'global';
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const syndicates = decoded.syndicates || {};

        if (!syndicates[syndicateId]) {
            console.warn(`[UCS-ADM] Unauthorized access attempt by DID: ${decoded.did} for syndicate: ${syndicateId}`);
            return res.status(403).json({ error: 'Forbidden: You are not authorized for this syndicate' });
        }

        // Pass user context if needed
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// ─── Pub/Sub Client ────────────────────────────────────────────────────────────
const pubsub = new PubSub({ projectId: PROJECT_ID });

// ─── Team Chat Routes (Body 2 ← Pub/Sub ← Discord) ───────────────────────────
app.post('/api/team-chat', ucsAdmMiddleware, async (req, res) => {
    try {
        const message: TeamMessage = req.body;
        const syndicateId = (req.query.syndicate_id as string) || 'global';
        const messageId = await publishTeamMessage(message);

        // Mirror to Discord if configured
        const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
        if (discordWebhook) {
            try {
                await fetch(discordWebhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: `**${message.sender}**: ${message.content}`,
                        username: 'Promethea Team Chat'
                    })
                });
            } catch (err) {
                console.error('[API] Discord Mirror Failed:', err);
            }
        }

        res.json({ success: true, messageId });
    } catch (error) {
        console.error('[API] Failed to publish message:', error);
        res.status(500).json({ success: false, error: String(error) });
    }
});

app.get('/api/team-chat', ucsAdmMiddleware, async (req, res) => {
    try {
        const syndicateId = (req.query.syndicate_id as string) || 'global';
        const subscriberClient = new v1.SubscriberClient();
        const subscriptionName = `user-sub-${syndicateId}`;
        const formattedSubscription = subscriberClient.subscriptionPath(PROJECT_ID, subscriptionName);
        const [response] = await subscriberClient.pull({
            subscription: formattedSubscription,
            maxMessages: 50,
        });

        const teamMessages: TeamMessage[] = [];
        const ackIds: string[] = [];

        if (response.receivedMessages) {
            for (const msg of response.receivedMessages) {
                if (msg.message && msg.message.data) {
                    teamMessages.push(JSON.parse(msg.message.data.toString() as string));
                }
                if (msg.ackId) {
                    ackIds.push(msg.ackId);
                }
            }
        }

        if (ackIds.length > 0) {
            await subscriberClient.acknowledge({
                subscription: formattedSubscription,
                ackIds: ackIds,
            });
        }

        res.json({ success: true, messages: teamMessages });
    } catch (error) {
        console.error('[API] Failed to pull messages:', error);
        res.status(500).json({ success: false, messages: [], error: String(error) });
    }
});

// ─── Market Ingestion (Body 2 ← Firebase Admin ← AI) ─────────────────────────
app.post('/api/market/ingest', async (req, res) => {
    try {
        const { proposalText, providerId, files } = req.body;
        const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';
        const AUTH_TOKEN = process.env.ENGINE_AUTH_TOKEN || 'sovereign-internal-token'; // Internal service token

        const { invokeAutoListRWA } = await import('@promethea/ai');
        const aiOutput = await invokeAutoListRWA(proposalText);

        // 1. Persist ingestion log to Sovereign Engine
        const ingestRes = await fetch(`${ENGINE_URL}/api/ingestions`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify({
                proposalText,
                providerId,
                files: files || [],
                status: 'Metabolized',
                analysis: aiOutput,
                createdAt: new Date().toISOString(),
            })
        });

        // 2. Write RWA to public ledger via Engine
        const assetRes = await fetch(`${ENGINE_URL}/api/real_world_assets`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify({
                name: aiOutput.assetName || `New Asset: ${proposalText.substring(0, 30)}...`,
                description: aiOutput.executiveSummary || proposalText,
                assetType: aiOutput.assetType || 'Utility',
                location: aiOutput.location || 'Unknown',
                price: aiOutput.enterpriseValue || 100,
                viability: aiOutput.isViable,
                viabilityAssessment: aiOutput.viabilityAssessment,
                keyAssumptions: aiOutput.keyAssumptions,
                status: aiOutput.isViable ? 'Active' : 'Under Review',
                providerId,
                createdAt: new Date().toISOString(),
            })
        });

        const assetData = await assetRes.json();
        const assetId = assetData.id || 'unknown';

        // 3. Create sovereign tasks from Path to Value
        if (aiOutput.pathTovalue && Array.isArray(aiOutput.pathTovalue)) {
            for (const task of aiOutput.pathTovalue) {
                await fetch(`${ENGINE_URL}/api/tasks`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${AUTH_TOKEN}`
                    },
                    body: JSON.stringify({
                        assetId,
                        description: task.description,
                        priority: task.priority,
                        status: 'Open',
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        createdAt: new Date().toISOString()
                    })
                });
            }
        }

        res.json({ success: true, id: assetId });
    } catch (error: any) {
        console.error('[INGEST] Error:', error);
        res.status(500).json({ error: error.message || 'Ingestion failed' });
    }
});

// ─── AI Flows ─────────────────────────────────────────────────────────────────
app.post('/api/ask-promethea', async (req, res) => {
    try {
        const input = req.body;
        if (!input || typeof input.query !== 'string' || typeof input.constitutionContent !== 'string') {
            return res.status(400).json({ error: 'Invalid input. "query" and "constitutionContent" are required.' });
        }
        const result = await askPrometheaFlow(input);
        res.json(result);
    } catch (error) {
        console.error('Error processing /api/ask-promethea:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ error: `Failed to get response from AI: ${errorMessage}` });
    }
});

app.post('/api/self-heal', async (req, res) => {
    try {
        const { selfHealingFlow } = await import('@promethea/ai');
        const result = await selfHealingFlow(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error processing /api/self-heal:', error);
        res.status(500).json({ error: 'Failed to execute self-healing flow.' });
    }
});

app.post('/api/cognitive-heal', async (req, res) => {
    try {
        const { cognitiveHealingFlow } = await import('@promethea/ai');
        const result = await cognitiveHealingFlow(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error processing /api/cognitive-heal:', error);
        res.status(500).json({ error: 'Failed to execute cognitive-healing flow.' });
    }
});

app.post('/api/underwrite-rwa', async (req, res) => {
    try {
        const { invokeUnderwriteRWA } = await import('@promethea/ai');
        const result = await invokeUnderwriteRWA(req.body);
        res.json(result);
    } catch (error: any) {
        console.error('Error in /api/underwrite-rwa:', error);
        res.status(500).json({ error: error.message || 'Underwrite failed' });
    }
});

app.post('/api/auto-list-rwa', async (req, res) => {
    try {
        const { invokeAutoListRWA } = await import('@promethea/ai');
        const result = await invokeAutoListRWA(req.body.documents);
        res.json(result);
    } catch (error: any) {
        console.error('Error in /api/auto-list-rwa:', error);
        res.status(500).json({ error: error.message || 'Auto list failed' });
    }
});

app.post('/api/allocate-rwa-tasks', async (req, res) => {
    try {
        const { invokeAllocateRWATasks } = await import('@promethea/ai');
        const result = await invokeAllocateRWATasks(req.body);
        res.json(result);
    } catch (error: any) {
        console.error('Error in /api/allocate-rwa-tasks:', error);
        res.status(500).json({ error: error.message || 'Task allocation failed' });
    }
});

app.post('/api/form-syndicate', ucsAdmMiddleware, async (req, res) => {
    try {
        const { name, type, jurisdiction, members, objective } = req.body;
        const { invokeFormSyndicate } = await import('@promethea/ai');
        
        // 1. Generate new syndicate_id
        const syndicateId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + crypto.randomBytes(4).toString('hex');
        
        // 2. Call AI Flow
        const legalDocs = await invokeFormSyndicate({ name, type, jurisdiction, members, objective });
        
        // 3. Call Auth Service to grant user admin role
        const uid = (req as any).user.uid;
        const did = (req as any).user.did;
        const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
        
        const authRes = await fetch(`${AUTH_URL}/auth/add-syndicate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, did, syndicate_id: syndicateId, role: 'admin' })
        });
        
        const authData = await authRes.json();
        
        res.json({ success: true, syndicate_id: syndicateId, legalDocs, token: authData.token });
    } catch (error: any) {
        console.error('Error in /api/form-syndicate:', error);
        res.status(500).json({ error: error.message || 'Form syndicate failed' });
    }
});

app.post('/api/text-to-speech', async (req, res) => {
    try {
        const { invokeTextToSpeech } = await import('@promethea/ai');
        const result = await invokeTextToSpeech(req.body);
        res.json(result);
    } catch (error: any) {
        console.error('Error in /api/text-to-speech:', error);
        res.status(500).json({ error: error.message || 'Text to speech failed' });
    }
});

app.post('/api/speech-to-text', async (req, res) => {
    try {
        const { invokeSpeechToText } = await import('@promethea/ai');
        const result = await invokeSpeechToText(req.body);
        res.json(result);
    } catch (error: any) {
        console.error('Error in /api/speech-to-text:', error);
        res.status(500).json({ error: error.message || 'Speech to text failed' });
    }
});

// ─── Execute Proposal (Governance) ───────────────────────────────────────────
app.post('/api/execute-proposal', async (req, res) => {
    try {
        const { proposalId, citizenId } = req.body;
        if (!proposalId || !citizenId) {
            return res.status(400).json({ error: 'proposalId and citizenId are required' });
        }

        const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';
        const AUTH_TOKEN = process.env.ENGINE_AUTH_TOKEN || 'sovereign-internal-token';

        const updateRes = await fetch(`${ENGINE_URL}/api/proposals/${proposalId}`, {
            method: 'POST', // The engine uses generic POST for updates as well in its current implementation
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify({
                status: 'Executing',
                executedAt: new Date().toISOString(),
                executedBy: citizenId
            })
        });

        if (!updateRes.ok) throw new Error('Failed to update proposal state in engine');

        console.log(`[GOVERNANCE] Proposal ${proposalId} execution triggered by ${citizenId}`);
        res.json({ success: true });
    } catch (error: any) {
        console.error('[GOVERNANCE] Execute proposal error:', error);
        res.status(500).json({ error: error.message || 'Execution failed' });
    }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(port, '0.0.0.0', () => {
    console.log(`AI service listening on http://0.0.0.0:${port}`);
});
