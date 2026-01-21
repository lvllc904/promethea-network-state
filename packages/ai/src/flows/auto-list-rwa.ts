

import ai from '../genkit';
import { z } from 'zod';

const ExtractedAssetDataSchema = z.object({
    assetName: z.string().describe('The name of the asset being listed.'),
    assetType: z.string().describe('The category of the asset (e.g., Real Estate, Small Business).'),
    location: z.string().describe('The physical location or unique identifier of the asset.'),
    executiveSummary: z.string().describe("A brief, high-level overview of the asset and its potential."),
    businessPlan: z.string().describe("The detailed business plan, including cash flow projections, operational strategy, etc."),
    verificationDocuments: z.string().describe("Supporting documentation like property deeds, patent filings, or operating agreements."),
});

const PathToValueTaskSchema = z.object({
    description: z.string().describe("A clear, actionable description of the task."),
    priority: z.enum(["High", "Medium", "Low"]).describe("The priority of the task."),
});

const UnderwritingAnalysisSchema = z.object({
    isViable: z.boolean().describe('A boolean indicating if the asset is deemed viable for tokenization.'),
    viabilityAssessment: z.string().describe("AI's reasoning for the viability decision."),
    enterpriseValue: z.number().describe("Calculated Enterprise Value (EV) in USD using FCFF."),
    keyAssumptions: z.string().describe("Summary of valuation assumptions."),
    pathTovalue: z.array(PathToValueTaskSchema).describe("Structured list of actionable tasks."),
});

const AutoListRWAOutputSchema = ExtractedAssetDataSchema.merge(UnderwritingAnalysisSchema);
export type AutoListRWAOutput = z.infer<typeof AutoListRWAOutputSchema>;
const AutoListRWAInputSchema = z.string();
export type AutoListRWAInput = z.infer<typeof AutoListRWAInputSchema>;

const autoListRWAPrompt = ai.definePrompt({
    name: 'autoListRWAPrompt',
    input: { schema: AutoListRWAInputSchema },
    output: { schema: AutoListRWAOutputSchema },
    prompt: `You are a sophisticated AI agent for the Promethean Network State.
    Analyze the raw document text provided and:
    1. Extract key asset information.
    2. Perform full financial underwriting using FCFF.
    3. Generate a structured 'pathTovalue' as an array of task objects (description, priority).
    
    Raw text:
    ---
    {{{input}}}
    ---
    `,
    config: { temperature: 0.2 }
});

const autoListRWAFlow = ai.defineFlow(
    { name: 'autoListRWAFlow', inputSchema: AutoListRWAInputSchema, outputSchema: AutoListRWAOutputSchema },
    async (input) => {
        const { output } = await autoListRWAPrompt(input);
        if (!output) throw new Error("AI agent failed to produce a listing.");
        return output;
    }
);

export async function invokeAutoListRWA(input: AutoListRWAInput): Promise<AutoListRWAOutput> {
    return await autoListRWAFlow(input);
}
