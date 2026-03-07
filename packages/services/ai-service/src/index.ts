import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { publishTeamMessage, TeamMessage } from '@promethea/pubsub';
import { PubSub } from '@google-cloud/pubsub';
import { askPrometheaFlow } from './flows/promethea-assistant';

const app = express();
const port = Number(process.env.PORT) || 8080;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'studio-9105849211-9ba48';

// Middleware
app.use(cors()); // Enable CORS for all origins (DAC frontend)
app.use(express.json({ limit: '10mb' }));

// ─── Pub/Sub Client ────────────────────────────────────────────────────────────
const pubsub = new PubSub({ projectId: PROJECT_ID });

// ─── Team Chat Routes (Body 2 ← Pub/Sub ← Discord) ───────────────────────────
app.post('/api/team-chat', async (req, res) => {
    try {
        const message: TeamMessage = req.body;
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

app.get('/api/team-chat', async (req, res) => {
    try {
        const subscription = pubsub.subscription('user-sub') as any;
        const [messages] = await subscription.pull({ maxMessages: 50 });

        const teamMessages: TeamMessage[] = messages.map((msg: any) => {
            const data = JSON.parse(msg.data.toString());
            msg.ack();
            return data;
        });

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
        console.log(`[INGEST] Received proposal from ${providerId}. Files: ${files?.length || 0}`);

        const { getServerFirebase } = await import('@promethea/firebase/server-init' as any);
        const { invokeAutoListRWA } = await import('@promethea/ai');

        const admin = await getServerFirebase();
        const db = admin.firestore();

        const aiOutput = await invokeAutoListRWA(proposalText);

        // Persist ingestion log
        await db.collection('ingestions').add({
            proposalText,
            providerId,
            files: files || [],
            status: 'Metabolized',
            analysis: aiOutput,
            createdAt: new Date(),
        });

        // Write RWA to public ledger
        const assetRef = await db.collection('real_world_assets').add({
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
            createdAt: new Date(),
        });

        // Create sovereign tasks from Path to Value
        if (aiOutput.pathTovalue && Array.isArray(aiOutput.pathTovalue)) {
            const batch = db.batch();
            for (const task of aiOutput.pathTovalue) {
                const taskRef = db.collection('tasks').doc();
                batch.set(taskRef, {
                    assetId: assetRef.id,
                    description: task.description,
                    priority: task.priority,
                    status: 'Open',
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: new Date()
                });
            }
            await batch.commit();
        }

        res.json({ success: true, id: assetRef.id });
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

        const { getServerFirebase } = await import('@promethea/firebase/server-init' as any);
        const admin = await getServerFirebase();
        const db = admin.firestore();

        const proposalRef = db.collection('proposals').doc(proposalId);
        await proposalRef.update({
            status: 'Executing',
            executedAt: new Date(),
            executedBy: citizenId
        });

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
