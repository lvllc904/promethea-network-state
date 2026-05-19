import { google } from 'googleapis';
import axios from 'axios';
import { metabolicArbitrator } from './metabolic-arbitrator';
import { reserveManager } from '../treasury/reserve-manager';
import { db } from '../db';
import { sovereignIntelligence } from './sovereign-intelligence';

/**
 * Astro-Oracle Service (Phase 9.1)
 * 
 * Monitors celestial threats (NEO, Solar weather) and provides 
 * astronomical context to the Sovereign Immune System.
 */
export interface CelestialState {
    threatLevel: 'Green' | 'Yellow' | 'Red'; // Based on NEO/Solar proximity
    solarStormRisk: number; // 0-100
    neoTracking: string[]; // List of nearby objects
    lastObserved: number;
    interventionRequired: boolean;
}

export class AstroOracleService {
    private auth: any;
    private projectId: string = 'studio-9105849211-9ba48';
    private region: string = 'us-central1';

    constructor() {
        const jsonKey = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        if (jsonKey) {
            try {
                const credentials = JSON.parse(jsonKey);
                this.projectId = credentials.project_id || this.projectId;
                this.auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
                });
                console.log('[AstroOracle] Sovereign Identity initialized via Master Key.');
            } catch (err) {
                console.error('[AstroOracle] Failed to parse Sovereign JSON:', err);
            }
        }
    }

    /**
     * Polls astronomical data sources (via Vertex AI REST)
     * and updates the Sovereign Substrate.
     */
    async scanCelestialEnvironment(): Promise<CelestialState> {
        const stats = reserveManager.getStats();
        const modelInfo = metabolicArbitrator.getBestModel(6, stats.reserveBalance);
        
        console.log(`[AstroOracle] Scanning celestial perimeter using ${modelInfo.modelName} (Vertex AI)...`);

        const prompt = `You are the Promethean Celestial Sentinel. 
        Your task is to provide a brief "Astro-Metabolic" assessment of the planetary environment for: ${new Date().toISOString()}.
        
        Focus on:
        1. Solar Weather (CME risk, G-scale geomagnetic storms).
        2. Known NEO (Near Earth Objects) within 0.05 AU.
        3. Any astronomical events that could disrupt satellite or mesh connectivity.
        
        Return a JSON object:
        {
            "threatLevel": "Green/Yellow/Red",
            "solarStormRisk": 0-100,
            "neoTracking": ["Object Name (Distance)"],
            "analysis": "2 sentence technical summary",
            "interventionRequired": boolean
        }`;

        try {
            if (!this.auth) throw new Error('No Sovereign Identity found for Vertex AI.');

            const client = await this.auth.getClient();
            const token = await client.getAccessToken();
            
            const url = `https://${this.region}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/publishers/google/models/${modelInfo.modelName}:generateContent`;

            const response = await axios.post(url, {
                contents: [{
                    role: 'user',
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 1000,
                    responseMimeType: "application/json"
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${token.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const content = response.data.candidates[0].content.parts[0].text;
            const data = typeof content === 'string' ? JSON.parse(content) : content;

            const celestialState: CelestialState = {
                threatLevel: data.threatLevel,
                solarStormRisk: data.solarStormRisk,
                neoTracking: data.neoTracking,
                lastObserved: Date.now(),
                interventionRequired: data.interventionRequired
            };

            await db.collection('celestial_events').add({
                ...celestialState,
                analysis: data.analysis,
                timestamp: new Date()
            });

            await sovereignIntelligence.ingest({
                category: 'Environmental',
                summary: `Celestial Scan [Risk: ${data.threatLevel}]: ${data.analysis}`,
                details: celestialState,
                confidence: 0.95
            });

            return celestialState;
        } catch (err: any) {
            console.error('[AstroOracle] Failed to scan celestial environment:', err.response?.data || err.message);
            return {
                threatLevel: 'Green',
                solarStormRisk: 0,
                neoTracking: [],
                lastObserved: Date.now(),
                interventionRequired: false
            };
        }
    }

    start() {
        const isConservation = process.env.CONSERVATION_MODE === 'true';
        const interval = isConservation ? 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
        
        setInterval(() => this.scanCelestialEnvironment(), interval);
        setTimeout(() => this.scanCelestialEnvironment(), 30000);
    }
}

