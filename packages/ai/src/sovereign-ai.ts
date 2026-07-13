import { google } from 'googleapis';
import axios from 'axios';

/**
 * Sovereign AI Bridge (Phase 11.1)
 * 
 * Provides a unified interface for Vertex AI using the Sovereign Master Key.
 * Bypasses the need for consumer-level API keys and restores autonomous intelligence.
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
            const geminiKey = process.env.GEMINI_API_KEY;
            if (geminiKey && geminiKey !== 'undefined' && geminiKey.trim() !== '') {
                console.log('[SovereignAI] Attempting direct Gemini API Key fallback...');
                try {
                    const directModel = modelName === 'gemini-1.5-flash' ? 'gemini-2.5-flash' : modelName;
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${directModel}:generateContent?key=${geminiKey}`;
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
                            'Content-Type': 'application/json'
                        }
                    });

                    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        console.log('[SovereignAI] Direct Gemini API Key fallback succeeded.');
                        return text;
                    } else {
                        throw new Error('Empty response from direct Gemini API Key');
                    }
                } catch (geminiErr: any) {
                    console.error('[SovereignAI] Direct Gemini API Key fallback failed:', geminiErr.response?.data || geminiErr.message);
                }
            }

            const openRouterKey = process.env.OPENROUTER_API_KEY;
            if (openRouterKey && openRouterKey !== 'undefined' && openRouterKey.trim() !== '') {
                console.log('[SovereignAI] Attempting OpenRouter fallback...');
                try {
                    // map model names to openrouter equivalents
                    let fallbackModel = 'google/gemini-2.5-flash';
                    if (modelName === 'gemini-1.5-flash') {
                        fallbackModel = 'google/gemini-flash-1.5';
                    } else if (modelName === 'gemini-1.5-pro') {
                        fallbackModel = 'google/gemini-pro-1.5';
                    } else if (modelName === 'gemini-2.5-pro') {
                        fallbackModel = 'google/gemini-2.5-pro';
                    }
                    
                    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                        model: fallbackModel,
                        messages: [
                            { role: 'user', content: prompt }
                        ],
                        temperature: 0.7,
                        max_tokens: 4096,
                        response_format: isJson ? { type: "json_object" } : undefined
                    }, {
                        headers: {
                            'Authorization': `Bearer ${openRouterKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'https://lvhllc.org',
                            'X-Title': 'Promethea Network State'
                        }
                    });
                    
                    const text = response.data?.choices?.[0]?.message?.content;
                    if (text) {
                        console.log('[SovereignAI] OpenRouter fallback succeeded.');
                        return text;
                    } else {
                        throw new Error('Empty response from OpenRouter');
                    }
                } catch (fallbackErr: any) {
                    console.error('[SovereignAI] OpenRouter fallback failed:', fallbackErr.response?.data || fallbackErr.message);
                    throw fallbackErr;
                }
            } else {
                throw err;
            }
        }
    }
}

export const sovereignAI = new SovereignAI();
