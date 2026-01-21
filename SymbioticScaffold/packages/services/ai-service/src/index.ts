import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { askPrometheaFlow } from './flows/promethea-assistant';
import { BrainMiddleware } from '@promethea/guardian';

const app = express();
const port = process.env.PORT || 4002;

// Initialize Brain Middleware
const brainMiddleware = new BrainMiddleware();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Increase JSON payload limit

// Apply the Brain Middleware to all incoming requests
app.use(brainMiddleware.processRequest);

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

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Start the server
app.listen(port, () => {
    console.log(`AI service listening on http://localhost:${port}`);
});
