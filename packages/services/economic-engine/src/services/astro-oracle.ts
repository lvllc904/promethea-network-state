import { GoogleGenerativeAI } from '@google/generative-ai';
import { metabolicArbitrator } from './metabolic-arbitrator';
import { reserveManager } from '../treasury/reserve-manager';
import { db, COLLECTIONS } from '../db';
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
    private genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Polls astronomical data sources (simulated via high-reasoning model)
     * and updates the Sovereign Substrate.
     */
    async scanCelestialEnvironment(): Promise<CelestialState> {
        const stats = reserveManager.getStats();
        const modelInfo = metabolicArbitrator.getBestModel(6, stats.reserveBalance);
        const model = this.genAI.getGenerativeModel({ model: modelInfo.modelName });

        console.log(`[AstroOracle] Scanning celestial perimeter using ${modelInfo.modelName}...`);

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
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(jsonStr);

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

            // Phase 10: Ingest into Sovereign Intelligence
            await sovereignIntelligence.ingest({
                category: 'Environmental',
                summary: `Celestial Scan [Risk: ${data.threatLevel}]: ${data.analysis}`,
                details: celestialState,
                confidence: 0.95
            });

            return celestialState;
        } catch (err) {
            console.error('[AstroOracle] Failed to scan celestial environment:', err);
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
        // Scan environment every 12 hours
        setInterval(() => this.scanCelestialEnvironment(), 12 * 60 * 60 * 1000);
        // Initial scan
        setTimeout(() => this.scanCelestialEnvironment(), 30000);
    }
}
