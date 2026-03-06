import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { askPrometheaFlow } from './flows/promethea-assistant';

const app = express();
const port = Number(process.env.PORT) || 8080;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Increase JSON payload limit

// Routes
app.post('/api/ask-promethea', async (req, res) => {
    try {
        const input = req.body;
        // Basic validation
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

app.get('/health', (req, res) => {
    res.status(200).send('OK');
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

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`AI service listening on http://0.0.0.0:${port}`);
});
