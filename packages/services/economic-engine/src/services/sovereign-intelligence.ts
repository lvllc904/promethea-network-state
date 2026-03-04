import { db, COLLECTIONS } from '../db';
import * as admin from 'firebase-admin';

/**
 * Sovereign Intelligence Service (Phase 10)
 * 
 * Aggregates all telemetry (Financial, Environmental, Political, Technical)
 * to provide a unified "Sovereign Worldview" for the Network State.
 */

export interface IntelligenceInsight {
    category: 'Financial' | 'Environmental' | 'Narrative' | 'Technical' | 'Geopolitical';
    summary: string;
    details: any;
    confidence: number;
    timestamp: any;
}

export class SovereignIntelligenceService {
    /**
     * Ingests a new piece of intelligence from any economic method or oracle.
     */
    async ingest(insight: Omit<IntelligenceInsight, 'timestamp'>): Promise<void> {
        await db.collection('sovereign_intelligence').add({
            ...insight,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`[Intelligence] New ${insight.category} insight ingested: ${insight.summary.substring(0, 50)}...`);
    }

    /**
     * Retrieves the latest aggregated intelligence for a specific category or all.
     */
    async getLatestContext(limit: number = 10): Promise<IntelligenceInsight[]> {
        const snapshot = await db.collection('sovereign_intelligence')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => doc.data() as IntelligenceInsight);
    }

    /**
     * Generates a "Sovereign Intelligence Report" summarizing the current state of the world.
     */
    async generateWorldviewSummary(): Promise<string> {
        const insights = await this.getLatestContext(20);

        if (insights.length === 0) return "The sovereign substrate is quiet. No significant anomalies detected.";

        const summary = insights.map(i => `[${i.category}] ${i.summary}`).join('\n');
        return `Current Sovereign Worldview:\n\n${summary}`;
    }
}

export const sovereignIntelligence = new SovereignIntelligenceService();
