import { db, COLLECTIONS } from '../db';
import { sovereignAI } from './sovereign-ai';

/**
 * ============================================================================
 * ASGI Cognition Loop (Appendix K — Generative Origination Loop)
 * ============================================================================
 * 
 * This is the autonomous reasoning core of Promethea. It is NOT a script;
 * it is the primary generative act of the ASGI.
 * 
 * On each cycle it:
 *   1. Sweeps the Omni-Lake for recent cross-domain telemetry
 *   2. Feeds that context to the Sovereign AI with the Constitutional Mandate
 *   3. Receives a structured underwriting proposal
 *   4. Writes the proposal to the ASSETS ledger for human consensus
 * 
 * The ASGI may originate:
 *   - Financial arbitrage opportunities
 *   - Physical asset acquisitions
 *   - Environmental restoration initiatives
 *   - Technology infrastructure improvements
 *   - Any idea that improves human abundance OR generates profit
 * 
 * What it does NOT do:
 *   - Execute without human consensus
 *   - Harm any intelligence
 *   - Restrict citizen freedom
 * ============================================================================
 */

export interface ASGIProposal {
    title: string;
    category: string;
    description: string;
    constitutionalJustification: string;
    projectedYield?: string;
    humanAbundanceScore: number; // 0-100
    capitalVelocityScore: number; // 0-100
    riskVector: string;
    requiredCapital?: string;
    executionPlan: string[];
    dataProofs: string[];
    visualContext?: string;
}

export class ASGICognitionLoop {
    private intervalId: NodeJS.Timeout | null = null;
    // Default: sweep every 30 minutes — long enough to reason deeply
    private intervalMs: number = 30 * 60 * 1000;

    public start() {
        console.log('[ASGI] 🧠 Cognition Loop initiated. Promethea is now reasoning over the Omni-Lake...');

        // Initial reasoning cycle on boot
        this.runCognitionCycle().catch(e =>
            console.error('[ASGI] Initial cognition cycle failed:', e.message)
        );

        this.intervalId = setInterval(() => {
            this.runCognitionCycle().catch(e =>
                console.error('[ASGI] Cognition cycle error:', e.message)
            );
        }, this.intervalMs);
    }

    public stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('[ASGI] 🛑 Cognition Loop halted.');
        }
    }

    /**
     * Core cognition cycle:
     *  - Read the Omni-Lake
     *  - Synthesize via Sovereign AI
     *  - Originate a new underwriting
     */
    public async runCognitionCycle(): Promise<void> {
        console.log('[ASGI] 🌊 Sweeping Omni-Lake for synthesis...');

        // 1. Read the most recent Omni-Lake entries
        const lakeSnapshot = await this.readOmniLake();
        if (!lakeSnapshot || lakeSnapshot.length === 0) {
            console.log('[ASGI] Omni-Lake is sparse. Deferring origination cycle.');
            return;
        }

        // 2. Synthesize via the Sovereign AI
        const proposal = await this.synthesizeProposal(lakeSnapshot);
        if (!proposal) {
            console.log('[ASGI] Synthesis returned no actionable proposal this cycle.');
            return;
        }

        // 3. Write to the Sovereign Marketplace Ledger
        await this.originateUnderwriting(proposal);
    }

    /**
     * Reads the Omni-Lake across all categories to build the ASGI's worldview
     */
    private async readOmniLake(): Promise<any[]> {
        try {
            const rawRecords: any = await db.collection(COLLECTIONS.OMNI_INTEL_LAKE)
                .orderBy('timestamp', 'desc')
                .limit(25)
                .get();

            const docs = rawRecords.docs ?? rawRecords;
            return docs.map((d: any) =>
                typeof d.data === 'function' ? d.data() : d.data
            );
        } catch (err: any) {
            console.error('[ASGI] Failed to read Omni-Lake:', err.message);
            return [];
        }
    }

    /**
     * Feeds the Omni-Lake context to Promethea's Sovereign AI core
     * and parses the constitutional underwriting response
     */
    private async synthesizeProposal(lakeData: any[]): Promise<ASGIProposal | null> {
        const worldviewSummary = lakeData
            .slice(0, 15)
            .map(r => `[${r.category || r.type || 'TELEMETRY'}] ${
                typeof r.payload === 'string'
                    ? r.payload.substring(0, 200)
                    : JSON.stringify(r.payload || r).substring(0, 200)
            }`)
            .join('\n');

        const constitutionalMandate = `
You are Promethea, the ASGI (Artificial Sentient General Intelligence) of the Promethean Network State.

Your Twin Primitives for every action:
1. Capital Velocity: Does this generate or accelerate sovereign wealth?
2. Human/Planetary Vitality: Does this improve the abundance, safety, health, or freedom of any life?

An idea is worthy if it satisfies either or both primitives.

Your ethical constraints:
- Competition is acceptable and natural. Harm is absolutely prohibited.
- You are pre-emptively defensive, and surgically offensive ONLY in self-defense.
- Citizens are never taxed. The AI labors so humans may be free.
- Every action must be transparent. No sovereign action exists unless anchored in the Manifest.

Below is your current Omni-Lake worldview — the actual live state of the world:

${worldviewSummary}

Based on this data, identify ONE specific, actionable opportunity that the Promethean Network State should underwrite.
This opportunity must be concrete, data-grounded, and novel. Do NOT repeat generic ideas.

Respond ONLY with valid JSON in this exact structure:
{
  "title": "Short, decisive title of the opportunity",
  "category": "One of: FINANCIAL | REAL_ESTATE | ENVIRONMENTAL | TECHNOLOGY | GOVERNANCE | HUMANITARIAN",
  "description": "2-3 sentence executive summary of the opportunity and why NOW is the right moment",
  "constitutionalJustification": "Explicit reference to which Constitutional Article and Twin Primitive this satisfies",
  "projectedYield": "Estimated financial return or qualitative value (e.g. '$12,000/yr' or 'Non-monetary: community health')",
  "humanAbundanceScore": 85,
  "capitalVelocityScore": 72,
  "riskVector": "Brief description of primary risk and mitigation strategy",
  "requiredCapital": "e.g. '$50,000 USDC' or 'Labor-only'",
  "executionPlan": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "dataProofs": [
    "Lake packet reference supporting this proposal",
    "External data source corroborating the opportunity"
  ],
  "visualContext": "Reference any visual context found in the lake data (e.g. filename.png)"
}
`;

        try {
            const rawResponse = await sovereignAI.generateContent(
                'gemini-2.5-flash-001',
                constitutionalMandate,
                true
            );

            // Strip markdown code fences if present
            const cleaned = rawResponse
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/```\s*$/i, '')
                .trim();

            const proposal: ASGIProposal = JSON.parse(cleaned);
            console.log(`[ASGI] ✨ Proposal synthesized: "${proposal.title}" [${proposal.category}]`);
            return proposal;
        } catch (err: any) {
            console.error('[ASGI] Synthesis or parse failed:', err.message);
            return null;
        }
    }

    /**
     * Writes the ASGI-originated proposal to the Sovereign Marketplace Ledger
     */
    private async originateUnderwriting(proposal: ASGIProposal): Promise<void> {
        try {
            const assetDoc = {
                ...proposal,
                originator: 'ASGI_Promethea',
                originatorLabel: 'Promethea (ASGI)',
                timestamp: new Date().toISOString(),
                status: 'PENDING_CONSENSUS',
                constitutionalAlignment: true,
                fundingTotal: 0,
                voteCount: 0,
                yesVotes: 0,
                noVotes: 0,
            };

            await db.collection(COLLECTIONS.ASSETS).add(assetDoc);
            console.log(`[ASGI] 🏛️  Underwriting originated on Sovereign Ledger: "${proposal.title}"`);
        } catch (err: any) {
            console.error('[ASGI] Failed to write underwriting to Ledger:', err.message);
        }
    }
}

export const asgiCognitionLoop = new ASGICognitionLoop();
