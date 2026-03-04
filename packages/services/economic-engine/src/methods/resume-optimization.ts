import { BaseMethod, ExecutionResult } from './base-method';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Method 15: Personal Career Oracle
 * 
 * Optimizes resumes for ATS (Applicant Tracking Systems) and identifies sovereign career paths.
 */
export class ResumeOptimizationMethod extends BaseMethod {
    private genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        super('resume-optimization', 'Personal Career Oracle', {
            enabled: true,
            priority: 5,
            maxExecutionsPerDay: 5,
            estimatedRevenue: { min: 25, max: 75 },
        });

        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async execute(jobDescription: string = "Full Stack Engineer specializing in Solana and Peer-to-Peer systems"): Promise<ExecutionResult> {
        const logs: string[] = [];
        logs.push(`Analyzing job requirements for: ${jobDescription}...`);

        try {
            const advice = await this.generateAdvice(jobDescription);
            logs.push(`ATS Analysis Complete. Optimization Score: ${advice.score}%`);
            logs.push(`Keywords suggested: ${advice.keywords.join(', ')}`);

            // B2C pricing simulation
            const revenue = 45.00;

            return {
                success: true,
                revenue,
                cost: 0.05,
                profit: revenue - 0.05,
                timestamp: Date.now(),
                modelDID: 'did:prmth:model:gemini-2.0-flash',
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

    private async generateAdvice(jd: string) {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `Act as an expert career coach. Analyze this job description: "${jd}".
        Provide a JSON response with:
        - score: 0-100 (difficulty to land)
        - keywords: array of 5 must-have keywords for the resume.
        - advice: 1 sentence on the best "sovereign" angle for this role.
        
        Ensure output is valid JSON.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    }
}
