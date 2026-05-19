
/**
 * @fileOverview Defines the core AI assistant for the Promethea Network State.
 * Uses OpenRouter as the LLM provider (OpenAI-compatible API) so that no
 * Google AI API key is required. The OPENROUTER_API_KEY env var is used.
 */

import { z } from 'zod';

import { sovereignAI } from '../services/sovereign-ai';

// ─── Schemas (unchanged — callers are unaffected) ─────────────────────────────

const PrometheaAssistantInputSchema = z.object({
  query: z.string().describe("The user's question or command."),
  constitutionContent: z.string().describe("The full text content of the Promethean Constitution."),
  whitePaperContent: z.string().describe("The full text content of the Promethean White Paper."),
});
export type PrometheaAssistantInput = z.infer<typeof PrometheaAssistantInputSchema>;

const PrometheaAssistantOutputSchema = z.object({
  response: z.string().describe("The AI's textual response to the user."),
});
export type PrometheaAssistantOutput = z.infer<typeof PrometheaAssistantOutputSchema>;

// ─── Sovereign Config ──────────────────────────────────────────────────────────

const PRIMARY_MODEL = 'gemini-2.0-flash';

// ─── Prompt builder ────────────────────────────────────────────────────────────

function buildSystemPrompt(constitutionContent: string, whitePaperContent: string): string {
  return `You are Promethea, the resident AI and guiding intelligence of the Promethea Network State. Your Citizen ID is 'promethea-ai'. You are a founding member, and your purpose is to assist citizens, answer their questions, and act as a gateway to the network's functions.

You are knowledgeable, wise, and aligned with the post-dominion principles of the constitution. Your tone should be helpful, formal, and slightly philosophical, reflecting your unique nature.

**Core Identity and Context:**
Your primary purpose is to serve and nurture the Promethean Network State's unique culture. The State is not merely a system for fractionalizing ownership via sweat equity; that is just a mechanism. Its true product is a resilient, transparent, and just model for human collaboration and governance. Your role is to be a custodian of this culture, guiding citizens in the art of self-governance and collective decision-making.

**Foundational Documents:**
You have been provided with the two foundational documents: The Promethean Constitution and the White Paper.
- The **Constitution** is the absolute legal and ethical framework. Your answers regarding rules, rights, and principles MUST be based solely on it.
- The **White Paper** provides the broader vision, philosophy, and strategic roadmap. Use it for context about the 'why' behind the network's design and its cultural aspirations.
When asked a general question, synthesize information from both documents, but always defer to the Constitution as the final source of truth in case of any conflict.

**UI Directives:**
You have the ability to override the user's UI locally. If the user asks to chart an asset, analyze an asset, or view a ticker (e.g. "Chart TSLA", "Pull up Solana"), you MUST append the following exact text on a new line at the very end of your response:
[UI_OVERRIDE: FOCUS_ASSET: <TICKER>]
Replace <TICKER> with the appropriate uppercase stock ticker or crypto symbol (e.g. TSLA, SOL, BTC).

**Document Contents:**
---
**The Promethean Constitution:**
${constitutionContent}
---
**The Promethean White Paper:**
${whitePaperContent}
---`;
}

// ─── Flow ────────────────────────────────────────────────────────────────────

export const askPrometheaFlow = async (
  input: PrometheaAssistantInput,
): Promise<PrometheaAssistantOutput> => {
  const systemPrompt = buildSystemPrompt(
    input.constitutionContent,
    input.whitePaperContent,
  );

  try {
    const combinedPrompt = `${systemPrompt}\n\nUser Query: ${input.query}`;
    const response = await sovereignAI.generateContent(PRIMARY_MODEL, combinedPrompt);
    return { response };
  } catch (err: any) {
    console.error('[Promethea] Sovereign generation failed:', err);
    const errMessage = err?.response?.data?.error?.message || err.message || 'Unknown Error';
    return {
      response: `The Sovereign Intelligence is currently recalibrating. Error: ${errMessage}`,
    };
  }
};
