import { GoogleGenerativeAI } from '@google/generative-ai';
import { vaultService } from './vault-service';

/**
 * ProposalIngestor
 * 
 * Part of the Sovereign Ingress Agent.
 * Handles multimodal analysis of raw proposal documents (PDFs, Images, Docs).
 * Extracts intent, narrative, and asset metadata to seed the underwriting loop.
 */

export interface IngestedProposal {
    title: string;
    description: string;
    category: string;
    locationHint?: string;
    estimatedValueHint?: string;
}

export class ProposalIngestor {
    private genAI: GoogleGenerativeAI | null = null;

    private async init() {
        if (this.genAI) return;
        const apiKey = await vaultService.getSecret('GEMINI_API_KEY') || process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('Missing Sovereign Identity (GEMINI_API_KEY)');
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Ingests a raw file (buffer) and extracts proposal metadata.
     * Uses Gemini 1.5 Flash for high-speed multimodal reasoning.
     */
    async ingest(fileBuffer: Buffer, mimeType: string): Promise<IngestedProposal> {
        await this.init();
        if (!this.genAI) throw new Error('AI Substrate Initialization Failed');

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            You are the Promethean Ingress Agent. 
            Analyze the provided document (which could be a deed, a business plan, a map, or a proposal).
            
            Extract the following information in a structured JSON format:
            {
                "title": "A concise, high-density name for the proposal",
                "description": "A detailed narrative of the intent, extracted from the text (min 200 words if possible)",
                "category": "One of: Real Estate, Mineral Rights, Carbon/Environmental, Technology, Financial, Infrastructure",
                "locationHint": "Any physical location mentioned (lat/lng or address)",
                "estimatedValueHint": "Any monetary values mentioned"
            }
            
            Respond ONLY with the JSON block.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: fileBuffer.toString('base64'),
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from the response (it might be wrapped in markdown blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI failed to produce a structured metadata handshake.');
        
        return JSON.parse(jsonMatch[0]) as IngestedProposal;
    }
}

export const proposalIngestor = new ProposalIngestor();
