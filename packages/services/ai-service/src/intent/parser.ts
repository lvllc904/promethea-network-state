import { sovereignAI } from '../services/sovereign-ai';

export interface IntentBlock {
    intent: 'STAKE_CLAIM' | 'SWAP_TOKENS' | 'SUBMIT_PROPOSAL' | 'DISTRIBUTE_REVENUE' | 'UNKNOWN';
    params: Record<string, any>;
    rawInput: string;
}

const PRIMARY_MODEL = 'gemini-1.5-flash';

/**
 * AI Intent Parser
 * 
 * Translates natural language conversational instructions into typed,
 * executable JSON intent blocks to drive downstream cockpit services.
 */
export async function parseIntent(query: string): Promise<IntentBlock> {
    const prompt = `You are a high-fidelity natural language intent parser for the Promethean Network State Cockpit.
Your task is to analyze the user's input and parse it into a structured, executable JSON intent block.

Available Intents and their schemas:

1. INTENT: STAKE_CLAIM
   - Triggered when the user wants to stake a geographical land, air, or resource claim.
   - Parameters:
     - lat (number): Latitude coordinate
     - lng (number): Longitude coordinate
     - description (string, optional): Description of the claim or cell
   - Example input: "Stake a claim at coordinates 41.2, -110.5"
   - Output: { "intent": "STAKE_CLAIM", "params": { "lat": 41.2, "lng": -110.5, "description": "Off-grid cell" } }

2. INTENT: SWAP_TOKENS
   - Triggered when the user wants to swap, exchange, buy, or sell tokens (e.g. UVT, SOL, ETH, USDC).
   - Parameters:
     - tokenFrom (string): Symbol of token to swap from
     - tokenTo (string): Symbol of token to swap to
     - amount (number): Amount of token to swap
   - Example input: "Swap 150 SOL for UVT"
   - Output: { "intent": "SWAP_TOKENS", "params": { "tokenFrom": "SOL", "tokenTo": "UVT", "amount": 150 } }

3. INTENT: SUBMIT_PROPOSAL
   - Triggered when the user wants to submit, draft, or propose a new governance action or proposal.
   - Parameters:
     - title (string): Title of the proposal
     - category (string): Category of the proposal (e.g. "Economic", "Territorial", "Constitutional", "Grant")
     - narrative (string): Detailed description or narrative of what the proposal does
     - current (number, optional): Initial votes score (defaults to 0 or 1 if user indicates voting start)
     - threshold (number, optional): Vote threshold required to pass (defaults to 10)
   - Example input: "Propose a constitutional amendment called '3-Body Protocol Integration' to merge DepthOS telemetry with net votes"
   - Output: { "intent": "SUBMIT_PROPOSAL", "params": { "title": "3-Body Protocol Integration", "category": "Constitutional", "narrative": "merge DepthOS telemetry with net votes", "threshold": 15 } }

4. INTENT: DISTRIBUTE_REVENUE
   - Triggered when routing B2B transaction fees or distributing revenues.
   - Parameters:
     - amount (number): Amount to route/distribute
     - assetType (string, optional): Type of asset (e.g., "RWA")
   - Example input: "Distribute 5000 USDC of B2B revenue according to Shadow Protocol rules"
   - Output: { "intent": "DISTRIBUTE_REVENUE", "params": { "amount": 5000 } }

If the input does not match any of these intents or is general conversation, use:
5. INTENT: UNKNOWN
   - Parameters: {}
   - Output: { "intent": "UNKNOWN", "params": {} }

CRITICAL: Return ONLY valid, minified JSON matching the parsed intent block structure. Do not wrap in markdown blocks, do not add explanation.

User Input: "${query.replace(/"/g, '\\"')}"
Output JSON:`;

    try {
        const aiResponse = await sovereignAI.generateContent(PRIMARY_MODEL, prompt, true);
        const parsed = JSON.parse(aiResponse.trim());
        
        return {
            intent: parsed.intent || 'UNKNOWN',
            params: parsed.params || {},
            rawInput: query
        };
    } catch (err: any) {
        console.error('[IntentParser] Parsing failed:', err.message);
        // Fallback heuristics if AI is offline/throttled
        return fallbackParseHeuristics(query);
    }
}

/**
 * Simple regex-based fallback heuristics to maintain system integrity if the AI service is unreachable.
 */
function fallbackParseHeuristics(query: string): IntentBlock {
    const text = query.toLowerCase();
    
    // Heuristic 1: STAKE_CLAIM
    const coordsMatch = text.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if ((text.includes('claim') || text.includes('stake') || text.includes('coordinate')) && coordsMatch) {
        return {
            intent: 'STAKE_CLAIM',
            params: {
                lat: parseFloat(coordsMatch[1]),
                lng: parseFloat(coordsMatch[2]),
                description: 'Geographical claim registered via fallback heuristics'
            },
            rawInput: query
        };
    }

    // Heuristic 2: SWAP_TOKENS
    const swapMatch = text.match(/swap\s+(\d+\.?\d*)\s*([a-z]+)\s+for\s+([a-z]+)/i);
    if (swapMatch) {
        return {
            intent: 'SWAP_TOKENS',
            params: {
                amount: parseFloat(swapMatch[1]),
                tokenFrom: swapMatch[2].toUpperCase(),
                tokenTo: swapMatch[3].toUpperCase()
            },
            rawInput: query
        };
    }

    // Heuristic 3: SUBMIT_PROPOSAL
    if (text.includes('proposal') || text.includes('propose') || text.includes('amendment')) {
        return {
            intent: 'SUBMIT_PROPOSAL',
            params: {
                title: 'New Sovereign Proposal',
                category: text.includes('constitutional') ? 'Constitutional' : 'Economic',
                narrative: query,
                threshold: 10
            },
            rawInput: query
        };
    }

    return {
        intent: 'UNKNOWN',
        params: {},
        rawInput: query
    };
}
