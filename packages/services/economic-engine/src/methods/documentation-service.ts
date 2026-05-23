import { BaseMethod, ExecutionResult } from './base-method';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { marketplaceService } from '../services/marketplace-service';
import { db } from '../db';

/**
 * Method 5: Documentation-as-a-Service (Illumination Engine)
 * 
 * Generates technical documentation, guides, and architectural "Illumination Reports".
 * Focuses on lowering barriers for participation in the Network State.
 * 
 * Ethos: "Clarity is a form of service. Humility in explanation leads to collective growth."
 */
export class DocumentationServiceMethod extends BaseMethod {
    private genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        super('documentation-service', 'Documentation-as-a-Service', {
            enabled: true,
            priority: 9,
            maxExecutionsPerDay: 5,
            estimatedRevenue: { min: 25, max: 250 },
            complexity: 5,
            conservationTier: 'ZERO_COST',
        });

        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async execute(codeSnippet: string = "// No snippet provided, performing default monorepo illumination scan."): Promise<ExecutionResult> {
        const logs: string[] = [];
        logs.push('Initializing Illumination Engine... analyzing target for architectural clarity.');

        try {
            const stats = (global as any).reserveManager?.getStats() || { reserveBalance: 100000 };
            const modelInfo = (global as any).metabolicArbitrator?.getBestModel(this.config.complexity, stats.reserveBalance) || { modelName: 'gemini-1.5-flash' };
            const model = this.genAI.getGenerativeModel({ model: modelInfo.modelName });

            // Step 1: Analytical Insight (Barriers to Entry)
            logs.push('Phase 1: Scanning for barriers to entry and conceptual complexities...');
            const insightPrompt = `Analyze the following code context for "Barriers to Entry". 
            What would a humble, peaceful developer find confusing? How can we illuminate this logic?
            
            Context:
            ${codeSnippet}
            
            Return a brief analysis (max 100 words) of the "Conceptual Friction" identified.`;

            const insightResult = await model.generateContent(insightPrompt);
            const frictionAnalysis = insightResult.response.text().trim();
            logs.push(`Friction Identified: ${frictionAnalysis.substring(0, 100)}...`);

            // Step 2: Synthesis of Illumination Guide
            logs.push('Phase 2: Synthesizing a Sovereign Illumination Guide...');
            const guidePrompt = `You are a Lead Educator within the Promethean Network State. 
            Your goal is to "Illuminate" rather than "Document".
            
            Based on this context and friction analysis:
            Context: ${codeSnippet}
            Friction: ${frictionAnalysis}
            
            Generate a Markdown-formatted "Illumination Guide" that includes:
            1. **The Purpose**: (Explained with a focus on harmony and service)
            2. **The Flow**: (A gentle, step-by-step walkthrough of the logic)
            3. **The Abundance**: (How this code contributes to the collective wealth of the Network State)
            4. **Quick Start**: (Technical setup instructions)
            
            Tone: Humble, encouraging, and clear. Avoid jargon where possible.`;

            const guideResult = await model.generateContent(guidePrompt);
            const guideContent = guideResult.response.text();
            logs.push(`Guide synthesized: ${guideContent.length} characters.`);

            // Step 3: Archive to Knowledge Ledger
            const docRecord = {
                title: `Illumination: ${this.methodName} - ${Date.now()}`,
                content: guideContent,
                frictionAnalysis,
                createdAt: new Date().toISOString(),
                category: 'Education'
            };

            const docRef = await db.collection('documentation_assets').add(docRecord);
            logs.push(`Archived to Knowledge Ledger: ${docRef.id}`);

            // Step 4: Marketplace Listing
            const estimatedValue = 75 + Math.random() * 100;
            logs.push(`Phase 3: Realizing value as Marketplace Asset ($${estimatedValue.toFixed(2)})...`);

            await marketplaceService.listItem({
                title: `Illumination Guide: Technical Sovereignty`,
                description: `A comprehensive architectural report designed to lower the barriers to entry for participants. This guide illuminates complex systems with humility and clarity.`,
                type: 'Digital',
                price: estimatedValue,
                currency: 'USD',
                methodId: 'documentation-service',
                imageUrl: `https://lvhllc.org/api/og?title=Illumination%20Report&subtitle=${docRef.id}`,
                barterAllowed: true,
                providerId: 'economic-engine'
            });

            const apiCost = 0.05;

            return {
                success: true,
                revenue: estimatedValue,
                cost: apiCost,
                profit: estimatedValue - apiCost,
                timestamp: Date.now(),
                modelDID: modelInfo.did || 'did:prmth:model:gemini-1.5-flash',
                logs,
            };

        } catch (error) {
            return {
                success: false,
                revenue: 0,
                cost: 0,
                profit: 0,
                timestamp: Date.now(),
                logs,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
