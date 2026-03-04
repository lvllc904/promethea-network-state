import { db, COLLECTIONS } from '../db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { metabolicArbitrator } from './metabolic-arbitrator';
import { reserveManager } from '../treasury/reserve-manager';

/**
 * Self-Improvement Service (Phase 7.2)
 * 
 * Analyzes execution logs and profit data to autonomously refine
 * method prompts for higher ROI.
 */
export class SelfImprovementService {
    private genAI: GoogleGenerativeAI;
    private isEvolving: boolean = false;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Scans Revenue Events for underperforming or high-cost methods
     * and generates an "Improvement Patch".
     */
    async evaluateAndImprove() {
        if (this.isEvolving) return;
        this.isEvolving = true;

        console.log('[Self-Improvement] Initiating Recursive Optimization Loop...');

        try {
            // 1. Fetch recent revenue events (last 50)
            const eventsSnap = await db.collection(COLLECTIONS.REVENUE_EVENTS)
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();

            const performanceMap: Record<string, { totalProfit: number; totalCost: number; count: number; samples: string[] }> = {};

            eventsSnap.docs.forEach(doc => {
                const data = doc.data();
                if (!performanceMap[data.methodId]) {
                    performanceMap[data.methodId] = { totalProfit: 0, totalCost: 0, count: 0, samples: [] };
                }
                performanceMap[data.methodId].totalProfit += data.profit;
                performanceMap[data.methodId].totalCost += data.cost;
                performanceMap[data.methodId].count++;
            });

            // 2. Identify a method for optimization (e.g., low profit-to-cost ratio)
            const targetMethodId = Object.keys(performanceMap).find(id => {
                const perf = performanceMap[id];
                return perf.totalProfit / (perf.totalCost || 1) < 2; // Target ratio < 2
            }) || 'seo-blog'; // Default to core engine if none found

            console.log(`[Self-Improvement] Target for optimization identified: ${targetMethodId}`);

            // 3. Use Gemini to generate a "Refined Prompt"
            await this.generateOptimizationPatch(targetMethodId, performanceMap[targetMethodId]);

        } catch (err) {
            console.error('[Self-Improvement] Optimization loop error:', err);
        } finally {
            this.isEvolving = false;
        }
    }

    private async generateOptimizationPatch(methodId: string, performance: any) {
        const stats = reserveManager.getStats();
        const modelInfo = metabolicArbitrator.getBestModel(9, stats.reserveBalance); // Use high intelligence for self-patching
        const model = this.genAI.getGenerativeModel({ model: modelInfo.modelName });

        const prompt = `You are the Promethean Recursive Optimizer. 
        MethodID: ${methodId}
        Recent Performance: Profit $${performance.totalProfit.toFixed(2)}, Cost $${performance.totalCost.toFixed(2)} over ${performance.count} runs.
        
        Your task is to analyze why this method might be underperforming and generate a REFINED PROMPT for its core AI generation step.
        The goal is to increase ROI by either:
        1. Increasing output quality (leading to higher revenue).
        2. Increasing efficiency (reducing token count/cost).
        
        Return a JSON object with:
        "analysis": "2 sentence root cause analysis",
        "refinedPromptSnippet": "The new prompt text for the method",
        "expectedImpact": "Higher quality/Lower cost"
        
        Ensure validity.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const patch = JSON.parse(jsonStr);

        // 4. Save Patch to Firestore (Sovereign Learning Store)
        await db.collection('optimizations').add({
            methodId,
            ...patch,
            applied: false,
            timestamp: new Date(),
            modelDID: modelInfo.did
        });

        console.log(`[Self-Improvement] Optimization Patch generated for ${methodId}: ${patch.analysis}`);
    }

    start() {
        // Run daily
        setInterval(() => this.evaluateAndImprove(), 24 * 60 * 60 * 1000);
        // Initial run
        setTimeout(() => this.evaluateAndImprove(), 120000);
    }
}
