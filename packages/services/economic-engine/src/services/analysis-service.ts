import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * AI Analysis Service
 * Generates detailed analysis reports on any topic for 10 UVT
 */
export async function generateAnalysis(topic: string, userId: string): Promise<string> {
    console.log(`[AnalysisService] Generating analysis for ${userId} on topic: ${topic}`);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are Promethea, the Sovereign Intelligence of the Promethean Network State.
Generate a comprehensive analysis report on the following topic:

Topic: "${topic}"

Provide:
- Key insights and trends
- Strategic implications
- Actionable recommendations
- Data-driven conclusions

Length: 500-800 words. Professional tone. Format in markdown.
    `.trim();

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    console.log(`[AnalysisService] Generated ${analysis.length} character analysis`);

    return analysis;
}

export const ANALYSIS_COST = 10; // UVT
