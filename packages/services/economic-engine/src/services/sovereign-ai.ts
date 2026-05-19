import { google } from 'googleapis';
import axios from 'axios';

/**
 * Sovereign AI Wrapper (Wave 11)
 * 
 * Provides a unified interface for Gemini access, automatically 
 * switching to Vertex AI (Service Account) if the Master Key is present.
 */
export class SovereignAI {
    private auth: any;
    private projectId: string = 'studio-9105849211-9ba48';
    private region: string = 'us-central1';

    constructor() {
        const jsonKey = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        if (jsonKey && jsonKey !== 'undefined' && jsonKey !== '{}' && jsonKey.trim() !== '') {
            try {
                const credentials = JSON.parse(jsonKey);
                this.projectId = credentials.project_id || this.projectId;
                this.auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
                });
            } catch (err) {
                console.error('[SovereignAI] Initialization failed:', err);
                this.auth = new google.auth.GoogleAuth({
                    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
                });
            }
        } else {
            this.auth = new google.auth.GoogleAuth({
                scopes: ['https://www.googleapis.com/auth/cloud-platform'],
            });
        }
    }

    async generateContent(modelName: string, prompt: string, isJson: boolean = false): Promise<string> {
        // Fallback to consumer SDK logic if no Sovereign Key (not recommended for production)
        if (!this.auth) {
            throw new Error('Sovereign Identity missing. Access Denied.');
        }

        try {
            const client = await this.auth.getClient();
            const token = await client.getAccessToken();
            
            const url = `https://${this.region}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/publishers/google/models/${modelName}:generateContent`;

            const response = await axios.post(url, {
                contents: [{
                    role: 'user',
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    responseMimeType: isJson ? "application/json" : "text/plain"
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${token.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const parts = response.data.candidates[0].content.parts;
            return parts[0].text;
        } catch (err: any) {
            console.error('[SovereignAI] Generation failed:', err.response?.data || err.message);
            throw err;
        }
    }
}

export const sovereignAI = new SovereignAI();
