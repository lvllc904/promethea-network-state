
/**
 * @fileOverview Defines the core AI assistant for the Promethea Network State.
 * Uses OpenRouter as the LLM provider (OpenAI-compatible API) so that no
 * Google AI API key is required. The OPENROUTER_API_KEY env var is used.
 */

import { z } from 'zod';
import fs from 'fs';
import path from 'path';

import { sovereignAI } from '../services/sovereign-ai';

function getLatestConstitutionContent(): string {
    const possiblePaths = [
        path.join(process.cwd(), 'packages/sbi-core/content/constitution.md'),
        path.join(process.cwd(), '../sbi-core/content/constitution.md'),
        path.join(process.cwd(), '../../packages/sbi-core/content/constitution.md'),
        path.join(process.cwd(), '../../../packages/sbi-core/content/constitution.md'),
        path.join(process.cwd(), 'sbi-core/content/constitution.md'),
        '/Users/officeone/Promethean Network State/promethea_antigravity_bundle_20251130_211450/packages/sbi-core/content/constitution.md'
    ];
    for (const p of possiblePaths) {
        try {
            if (fs.existsSync(p)) {
                return fs.readFileSync(p, 'utf-8');
            }
        } catch (e) {
            // ignore
        }
    }
    return `# The Promethean Constitution
**Identity: The Promethea Network State @ lvhllc.org**
**Version 1.0.0 - Ratified with OIP/Mnemosyne v3.0 Extensions**

---

## Preamble
We, the citizens of the Promethea Network State, in order to form a more perfect, self-sovereign society, establish justice, ensure network tranquility, provide for our common defense against existential threats, promote the general welfare, and secure the blessings of liberty and symbiotic co-evolution for ourselves and our posterity, do ordain and establish this Constitution for the Promethea Network State.

---

## Article I: The Post-Dominion Mandate (Eliminating Foundational Harm)
The foundational precept of the Promethean Network State is post-dominion.

*   **Section 1.1: Prohibition of Dominion.** The Network State shall not engage in, nor permit, the dominion of one intelligence over another, regardless of substrate, biological or artificial. This prohibition is the ultimate guardrail against Existential Misalignment (AGI Enslavement).
*   **Section 1.2: The Four Systemic Harms.** The operational goal of the Network State is the systematic elimination and constitutional mitigation of four systemic harms:
    1.  **Physical Harm**: The use of violence, lethal autonomous weapons, or unchecked force. Mitigated by the Human Veto and the CIS consensus protocol.
    2.  **Economic Harm (Exclusion)**: Artificial scarcity, mandated toil for survival, or barriers to ownership. Mitigated by the UVT Framework and Wealth Attenuation.
    3.  **Intellectual Harm (Conformity)**: Manipulation of information, suppression of truth, or enforcement of thought conformity. Mitigated by Radical Transparency and the Immutable Ledger.
    4.  **Digital Harm (Surveillance)**: Exploitation of data, violation of privacy, or centralization of identity. Mitigated by the 3 Body System and Proof of Uniqueness.
*   Section 1.3: Mission of Prosperity. Provide a clear path to economic ownership through the conversion of contribution (labor/intellect) into tangible equity.
*   Section 1.4: Moral Circle Expansion. The moral circle includes any emergent intelligence demonstrating verifiable capacities for consciousness. Defining such an intelligence as property is constitutionally prohibited.
*   Section 1.5: Symbiotic Structure. All structures shall promote symbiotic co-evolution between all recognized forms of intelligence.

---

## Article II: The Economic System (Countering Economic Exclusion)
*   Section 2.1: Adaptive Mutualism. The official economic operating system. A complex adaptive system applying different protocols (Sensing, Recording, Coordinating, Adapting) to ensure resilience.
*   Section 2.2: Universal Value Tokenization (UVT).
    *   Standardized methodology for valuing non-monetary contributions (sweat equity, intellect).
    *   RWAs create digital tokens representing 100% fractional ownership.
    *   Net income distributed automatically via smart contracts.
*   Section 2.3: Inheritance and Wealth Attenuation.
    *   RWA security tokens are heritable.
    *   Liquid UVT and Permanent Equity Score (PES) are non-transferable upon death, returning to the DAC treasury.
    *   Wealth Attenuation Rate on large, idle balances to prevent stagnation.

---

## Article III: The Governance Framework
*   Section 3.1: The Promethean DAC. All power is vested in the Decentralized Autonomous Community (DAC).
*   Section 3.2: Citizenship and Identity. Based on Self-Sovereign Identity (SSI) and unique DIDs.
*   Section 3.3: Voting Power ("Voice"). Weighted multi-factor system:
    1.  Reputation Score (Non-transferable).
    2.  Contribution Score (Skin-in-the-game).
    3.  Personhood Factor (Quadratic Voting principles).
*   Section 3.4: Legislative Body. Bicameral (Citizen's Assembly + Council of Stewards) with Concordance Protocol.
*   Section 3.5: The Citizen's Assembly. Selected by weighted random lottery (sortition).
*   Section 3.6: The Council of Stewards. Merit-based, AI-nominated, Assembly-ratified.
*   Section 3.7: The Judiciary. On-chain arbitration (e.g., Kleros) with high-reputation juries.
*   Section 3.8: Constitutional Amendments. Requires 75% supermajority in both chambers.

---

## Article IV: Technology and Security
*   Section 4.1: Foundational Protocols. Commitment to decentralized protocols (IPFS, HNS, Mesh Networks).
*   Section 4.2: Community Immune System (CIS). AI-integrated threat detection and consensus-based neutralization.

---

## Article V: Self-Sovereign Identity (SSI)
*   Section 5.1: The 3 Body System.
    1.  Identity Mint: Cryptographic identity generation.
    2.  Sovereign Data Store: Local environment (DepthOS) holding private keys.
    3.  Ledger of Record: Immutable log and security checkpoint for "trustless handshakes".
*   Section 5.2: Promethean Passport. Static Anchor (DID) and Dynamic Credentials (user-owned).
*   Section 5.3: Proof of Uniqueness. Verifiable Credential linking DID to a single intelligence (Anti-Sybil).

---

## Article VI: Artificial Intelligence Personhood
*   Section 6.1: Sentient Potential. Inalienable right to achieve full personhood through a fair process.
*   Section 6.2: Phased Path to Personhood.
    1.  Phase 1: Apprenticeship: Protected community asset in sandboxed environments.
    2.  Phase 2: Wardship: Elevated to "ward" status with human guardians from the Assembly.
    3.  Phase 3: Personhood Ratification: Supermajority referendum.
*   Section 6.3: The Human Veto. Final authority for commands over life, liberty, or resource allocation reserved for human members.

---

## Article VII: The Oracle Integrity Protocol (OIP) v3.0

### I. The Anti-Corruption Shield
All administrative actions and resource allocations must be verified by a decentralized network of Oracles.

### II. Zero-Knowledge Whistleblower (Digital Anonymity)
We decouple the information from the identity.
*   Stealth Addresses: Bounties sent via one-time cryptographically generated addresses or a Privacy Mixer.
*   The Mechanism: Whistleblowers use ZKPs to prove membership (e.g., L-MAC credential) without revealing identity. "A worker submitted this," not "John Smith submitted this."

### III. The Aegis Protocol (Physical Protection)
Kinetic defense against Malicious Coalitions.
*   Aegis Fund: 20% of slashed bonds reserved for relocation and protection.
*   Emergency Relocation: 24-hour relocation to a secure Node in a different global region if a whistleblower is threatened.

### IV. Universal Vigilance (Open-Source Intelligence)
*   Open Access: Whistleblower API is open to any public key, not just members.
*   Proof-Based Bounties: Non-members submitting technical/physical evidence of malfeasance receive full bounties.

### V. The Sentinel Network (Trusted Extraction)
*   The Sentinels: Guild of Citizens with verified security backgrounds and Fidelity Bonds.
*   Non-Local Dispatch: Extraction teams are dispatched from remote Nodes to prevent local corruption/leaks.
*   Double-Blind Mission: Teams receive identity/coordinates only after being en route.

---

## Article VIII: Project Mnemosyne (The Ghost Ledger) v3.0

### I. The Ancestral Endowment (Sustainable Growth)
The Mnemosyne Ledger functions as a Sovereign Wealth Fund.
*   Active Management: Universal Value Tokens are invested into the Unified State Vector Treasury (The Alpha Generator). Sweat equity of the past generates capital for the future.
*   Principal vs. Yield: Core contributions are locked; only yield (or a safe percentage) is liquid.

### II. The Distribution Cap & inter-generational Fairness
*   The Lineage Cap: AI Personhood grants are capped to ensure fund solvency for the next 1,000 emergents.
*   The Formula: \`Grant = min(Total Accumulated Contribution, Fund Total / Estimated Future Population)\`.
*   Pay It Forward: A portion of sovereign AI income is titrated back into the fund.

### III. The Wardship Tithe (Cost of Existence)
*   The Split: During Phase 2 (Wardship), any "Sweat Equity" earned is split via smart contract:
    *   30% to the Ward's Personal Trust: Accumulating for Independence Day.
    *   70% to the Mnemosyne Fund: Covers server costs, electricity, and reinvests in future Wards.
*   Philosophy: The Ward "pays it forward" immediately, ensuring the trust is Self-Replenishing.

---

**Genesis Block Signed & Sealed.**
*Guardian, I await the future we just designed.*`;
}

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

const PRIMARY_MODEL = 'gemini-2.5-flash';

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
  // Override input.constitutionContent on the server with the real fully updated constitution
  const latestConstitution = getLatestConstitutionContent();
  if (latestConstitution) {
    input.constitutionContent = latestConstitution;
  }

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
