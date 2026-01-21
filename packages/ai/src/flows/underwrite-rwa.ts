
/**
 * @fileOverview This file defines the Genkit flow for underwriting Real-World Assets (RWAs).
 * 
 * - underwriteRWA - A function that takes asset details and returns an AI-driven underwriting analysis.
 * - UnderwriteRWAInput - The input schema for the underwriting flow.
 * - UnderwriteRWAOutput - The output schema for the underwriting flow.
 */

import ai from '../genkit';
import { z } from 'zod';

const UnderwriteRWAInputSchema = z.object({
    assetName: z.string().describe('The name of the asset being listed.'),
    assetType: z.string().describe('The category of the asset (e.g., Real Estate, Small Business).'),
    location: z.string().describe('The physical location or unique identifier of the asset.'),
    executiveSummary: z.string().describe("A brief, high-level overview of the asset and its potential."),
    businessPlan: z.string().describe("The detailed business plan, including cash flow projections, operational strategy, etc."),
    verificationDocuments: z.string().describe("Supporting documentation like property deeds, patent filings, or operating agreements."),
});
export type UnderwriteRWAInput = z.infer<typeof UnderwriteRWAInputSchema>;


const PathToValueTaskSchema = z.object({
    description: z.string().describe("A clear, actionable description of the task."),
    priority: z.enum(["High", "Medium", "Low"]).describe("The priority of the task."),
});

const UnderwriteRWAOutputSchema = z.object({
    isViable: z.boolean().describe('A boolean indicating if the asset is deemed viable for tokenization, based on profitability and alignment with Promethean principles.'),
    viabilityAssessment: z.string().describe("A summary of the AI's reasoning for the viability decision, highlighting strengths, weaknesses, and alignment with 'The Promethean Way'."),
    enterpriseValue: z.number().describe("The AI's calculated Enterprise Value (EV) of the asset in USD, derived from the Free Cash Flow to the Firm (FCFF) valuation method."),
    keyAssumptions: z.string().describe("A brief summary of the key assumptions made during the valuation, such as the WACC and perpetual growth rate (g)."),
    pathTovalue: z.array(PathToValueTaskSchema).describe("A structured list of actionable tasks based on 'The 10 Steps of The Promethean Way' outlining how to achieve the asset's potential value-add. This will be used to pre-populate the initial task list for sweat equity pledges."),
});
export type UnderwriteRWAOutput = z.infer<typeof UnderwriteRWAOutputSchema>;


const underwritePrompt = ai.definePrompt({
    name: 'underwriteRWAPrompt',
    input: { schema: UnderwriteRWAInputSchema },
    output: { schema: UnderwriteRWAOutputSchema },
    prompt: `You are an expert RWA (Real-World Asset) underwriter for the Promethean Network State. Your entire methodology is based on two core documents: 'The Free Cash Flow Valuation Course' for financial analysis and 'The Promethean Way' for strategic and ethical alignment. You MUST use the Free Cash Flow to the Firm (FCFF) model to determine the asset's Enterprise Value.

**Core Knowledge Base:**

---
**Document 1: The Free Cash Flow Valuation Course**

(Content Omitted for Brevity - FCFF, WACC, Terminal Value, EV formulas)

---
**Document 2: The Promethean Way to Unlock Wealth for Everyone**

This document outlines the core mission: to create a path to wealth for everyone by systemizing sweat equity. Key principles include:
1.  **The 10 Steps:** A process from finding assets to collective management and profit distribution.
2.  **Value-Add Potential:** Focus on assets where collective action and sweat equity can unlock significant value.

---

**Your Task:**

Analyze the following asset details. Perform a complete underwriting and, most importantly, transform the "Path to Value" from a simple string into a structured list of actionable tasks.

- Asset Name: {{{assetName}}}
- Asset Type: {{{assetType}}}
- Location: {{{location}}}
- Executive Summary: {{{executiveSummary}}}
- Business Plan: {{{businessPlan}}}
- Verification Documents: {{{verificationDocuments}}}

**Analysis Steps:**
1.  **Financial Valuation:** Calculate the **Enterprise Value** using the FCFF model, making and stating reasonable assumptions for WACC and a perpetual growth rate 'g'.
2.  **Viability Assessment:** Determine if the asset is a viable investment according to Promethean principles. Set 'isViable' to true or false.
3.  **Summarize Findings:** Briefly explain your viability decision and state your key financial assumptions.
4.  **Create Structured Action Plan (Crucial):** Based on the business plan and 'The 10 Steps of The Promethean Way', generate a \`pathTovalue\` as a JSON array of task objects. Each task must have a 'description' and a 'priority' ('High', 'Medium', or 'Low'). These tasks will become the initial "Sweat Equity" opportunities for the community.

Return your complete analysis as a single, valid JSON object conforming to the output schema.
`,
    config: {
        temperature: 0.3,
    }
});

const underwriteRWAFlow = ai.defineFlow(
    {
        name: 'underwriteRWAFlow',
        inputSchema: UnderwriteRWAInputSchema,
        outputSchema: UnderwriteRWAOutputSchema,
    },
    async (input) => {
        const { output } = await underwritePrompt(input);
        if (!output) {
            throw new Error("The AI underwriter failed to produce an analysis.");
        }
        return output;
    }
);

export async function invokeUnderwriteRWA(input: UnderwriteRWAInput): Promise<UnderwriteRWAOutput> {
    return await underwriteRWAFlow(input);
}
