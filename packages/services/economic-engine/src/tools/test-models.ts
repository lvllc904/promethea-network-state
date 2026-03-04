import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('Missing GEMINI_API_KEY');
        process.exit(1);
    }

    console.log("Fetching available models via REST API...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Available models:");
        // @ts-ignore
        data.models.forEach((m: any) => {
            console.log(`- ${m.name} (${m.displayName})`);
        });

    } catch (e) {
        console.error("Failed to list models", e);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Try to use a model we find (or just re-test gemini-2.0-flash with prefix)
    // The name in the list will likely be 'models/gemini-2.0-flash-001'
}

listModels();
