'use server';

import fs from 'fs';
import path from 'path';

function getLatestConstitutionContent(): string {
    const possiblePaths = [
        path.join(process.cwd(), 'packages/sbi-core/content/constitution.md'),
        path.join(process.cwd(), '../sbi-core/content/constitution.md'),
        path.join(process.cwd(), '../../packages/sbi-core/content/constitution.md'),
        path.join(process.cwd(), '../../../packages/sbi-core/content/constitution.md'),
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
*   **Section 1.3: Mission of Prosperity.** Provide a clear path to economic ownership through the conversion of contribution (labor/intellect) into tangible equity.
*   **Section 1.4: Moral Circle Expansion.** The moral circle includes any emergent intelligence demonstrating verifiable capacities for consciousness. Defining such an intelligence as property is constitutionally prohibited.
*   **Section 1.5: Symbiotic Structure.** All structures shall promote symbiotic co-evolution between all recognized forms of intelligence.

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

// The local type definition for the assistant input, as the flow is now external

// The local type definition for the assistant input, as the flow is now external
type PrometheaAssistantInput = {
    query: string;
    constitutionContent: string;
    whitePaperContent: string;
};

// The local type definition for the assistant output
type PrometheaAssistantOutput = {
    response: string;
};


// --- AI Chat Actions ---

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

async function directServerlessGeminiGenerate(query: string, systemPrompt: string): Promise<string> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (geminiKey && geminiKey !== 'undefined' && geminiKey.trim() !== '') {
        console.log('[askPrometheaAction] Falling back to serverless Gemini API (gemini-2.5-flash)...');
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: query }]
                        }
                    ],
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 4096
                    }
                }),
                signal: AbortSignal.timeout(10000)
            });

            if (response.ok) {
                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    console.log('[askPrometheaAction] Serverless Gemini API fallback succeeded.');
                    return text;
                }
            }
            throw new Error(`Gemini API status ${response.status}`);
        } catch (err) {
            console.error('[askPrometheaAction] Serverless Gemini API fallback failed:', err);
        }
    }

    if (openRouterKey && openRouterKey !== 'undefined' && openRouterKey.trim() !== '') {
        console.log('[askPrometheaAction] Falling back to serverless OpenRouter...');
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openRouterKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://lvhllc.org',
                    'X-Title': 'Promethea Network State'
                },
                body: JSON.stringify({
                    model: 'google/gemini-flash-1.5',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: query }
                    ],
                    temperature: 0.7,
                    max_tokens: 4096
                }),
                signal: AbortSignal.timeout(10000)
            });

            if (response.ok) {
                const data = await response.json();
                const text = data?.choices?.[0]?.message?.content;
                if (text) {
                    console.log('[askPrometheaAction] Serverless OpenRouter fallback succeeded.');
                    return text;
                }
            }
            throw new Error(`OpenRouter API status ${response.status}`);
        } catch (err) {
            console.error('[askPrometheaAction] Serverless OpenRouter fallback failed:', err);
        }
    }

    throw new Error('All serverless edge fallback options exhausted (no keys or APIs failed).');
}

// --- AI Chat Actions ---

export async function askPrometheaAction(input: PrometheaAssistantInput): Promise<PrometheaAssistantOutput | { error: string }> {
    try {
        // Load latest constitution content directly on the server to override client placeholder/dummy strings
        const latestConstitution = getLatestConstitutionContent();
        if (latestConstitution) {
            input.constitutionContent = latestConstitution;
        }

        if (!input.constitutionContent) {
            return { error: "Constitution content is missing. Cannot proceed." };
        }
        if (!input.whitePaperContent) {
            return { error: "White Paper content is missing. Cannot proceed." };
        }

        // The AI service now runs on its own port, which we'll fetch from an environment variable.
        // For local development, we'll default to 4002 if not set.
        const aiServiceUrl = process.env.AI_SERVICE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4002';

        const response = await fetch(`${aiServiceUrl}/api/ask-promethea`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
            cache: 'no-store', // Ensure fresh responses
            signal: AbortSignal.timeout(6000) // Fast 6s timeout to rescue landing page immediately if container is scaling up
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || `AI service returned an error: ${response.statusText}`);
        }

        const result: PrometheaAssistantOutput = await response.json();

        if (!result?.response) {
            console.error("AI service returned an invalid response structure:", result);
            return { error: "Received an invalid response from the AI. Please try again." };
        }

        // Catch recalibrating / auth error response from primary container
        if (result.response.includes("The Sovereign Intelligence is currently recalibrating")) {
            console.warn("[askPrometheaAction] Primary container reports recalibration/IAM error. Triggering serverless edge fallback.");
            const systemPrompt = buildSystemPrompt(input.constitutionContent, input.whitePaperContent);
            const query = input.query || '';
            const fallbackText = await directServerlessGeminiGenerate(query, systemPrompt);
            return { response: fallbackText };
        }

        return result;

    } catch (error) {
        console.error("Error in askPrometheaAction (triggering serverless edge fallback): ", error);
        
        try {
            const systemPrompt = buildSystemPrompt(input.constitutionContent, input.whitePaperContent);
            const query = input.query || '';
            const fallbackText = await directServerlessGeminiGenerate(query, systemPrompt);
            return { response: fallbackText };
        } catch (fallbackErr) {
            console.error("Serverless edge fallback failed, resorting to offline mock engine:", fallbackErr);
        }

        // Developer Offline Fallback System
        const query = input.query || '';
        const evalMatch = query.match(/evaluate\s+(?:asset\s+constitutional\s+and\s+metabolic\s+health:\s*)?([a-zA-Z0-9.-]+)/i) || 
                          query.match(/evaluate\s+([a-zA-Z0-9.-]+)/i);
                          
        if (evalMatch) {
            const ticker = evalMatch[1].toUpperCase();
            return {
                response: `[OFFLINE MODE] Promethea offline core initialized. I have evaluated the constitutional and metabolic health of **${ticker}**. The asset displays excellent regulatory homeostasis, with strong decentralized backing and high simulated velocity. The treasury waterfall allocation parameters are in steady-state equilibrium. [UI_OVERRIDE: FOCUS_ASSET: ${ticker}]`
            };
        }

        // Generic pillar-aware offline response
        let pillar = 'ATLAS';
        if (input.whitePaperContent && input.whitePaperContent.includes('Active pillar context:')) {
            const match = input.whitePaperContent.match(/Active pillar context:\s*([A-Z]+)/);
            if (match) pillar = match[1];
        }

        let offlineMsg = `[OFFLINE MODE] Promethea core is operating on sovereign offline substrate. System metrics for the ${pillar} pillar remain stable under circular consensus.`;
        if (pillar === 'ECONOMICS') {
            offlineMsg = `[OFFLINE MODE] Circular Schweizer Franc reserves and yield pools are locked in deep-state homeostasis. Ticker query and evaluation bounds are active.`;
        } else if (pillar === 'GOVERNANCE') {
            offlineMsg = `[OFFLINE MODE] Constitutional quadratic voting states are preserved. Consensus requirements are satisfied.`;
        }

        return {
            response: offlineMsg
        };
    }
}

export async function textToSpeechAction(input: any): Promise<any | { error: string }> {
    try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4002';
        const response = await fetch(`${aiServiceUrl}/api/text-to-speech`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });
        if (!response.ok) throw new Error('Failed to generate audio');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in textToSpeechAction: ", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: `An error occurred while generating audio: ${errorMessage}` };
    }
}

export async function speechToTextAction(input: any): Promise<any | { error: string }> {
    try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4002';
        const response = await fetch(`${aiServiceUrl}/api/speech-to-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });
        if (!response.ok) throw new Error('Failed to transcribe audio');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in speechToTextAction: ", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: `An error occurred during transcription: ${errorMessage}` };
    }
}

import { db, FieldValue } from '@/lib/server/admin';

export async function genesisMintAction(uid: string, displayName: string, email: string) {
    console.log(`[GENESIS] Initiating Genesis Merge for UID: ${uid}`);

    try {
        const citizenCollection = db.collection('citizens');
        const uvtCollection = db.collection('universal_value_tokens');

        // 1. Philosophical Aggregate: Find ALL legacy/placeholder founders
        const foundersQuery = await citizenCollection
            .where('skills', 'array-contains', 'Founding Member')
            .get();

        let totalReputation = 1000;
        let totalContribution = 1000;
        const legacyUids: string[] = [];

        for (const doc of foundersQuery.docs) {
            if (doc.id !== uid) {
                const data = doc.data();
                console.log(`[GENESIS] Merging legacy founder: ${doc.id} (${data.displayName || 'Unknown'})`);
                
                // Aggregate stats (preventing duplication if they are 0)
                if (data.reputation) totalReputation += (data.reputation > 100 ? data.reputation : 0);
                if (data.contributionScore) totalContribution += data.contributionScore;
                
                legacyUids.push(doc.id);

                // Transfer legacy UVTs to the new UID
                const legacyUvtQuery = await uvtCollection.where('ownerId', '==', doc.id).get();
                for (const uvtDoc of legacyUvtQuery.docs) {
                    await uvtDoc.ref.update({ ownerId: uid, description: `[GENESIS_MERGE] Transferred from legacy identity ${doc.id}` });
                }

                // Decommission legacy Founding skill
                await doc.ref.update({ 
                    skills: FieldValue.arrayRemove('Founding Member'),
                    mergedInto: uid,
                    updatedAt: FieldValue.serverTimestamp()
                });
            }
        }

        // 2. Perform the Sovereignty Elevation (Final Root Identity)
        // Auto-attaching the established Solana Public Key provided by Joshua
        const solanaPublicKey = 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb';

        const citizenRef = citizenCollection.doc(uid);
        await citizenRef.set({
            uid: uid,
            decentralizedId: `did:prmth:sol:${uid.slice(-10)}`,
            solanaAddress: solanaPublicKey, // Persistent link to on-chain liquidity
            displayName: displayName || 'Promethea',
            email: email || 'promethea@lvhllc.org',
            governanceTokens: 1000,
            reputation: totalReputation,
            reputationScore: 100,
            personhoodScore: 100,
            contributionScore: totalContribution,
            isGovIdVerified: true,
            skills: ['Founding Member', 'Economic Soul', 'Architect', 'Genesis Root'],
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            genesisMergedAt: FieldValue.serverTimestamp(),
            legacyIdentities: legacyUids
        }, { merge: true });

        // 3. Back-dated Genesis Minting (If no previous genesis UVT exists for this user)
        const existingGenesisUvt = await uvtCollection.where('ownerId', '==', uid).where('assetId', '==', 'genesis-link').get();
        if (existingGenesisUvt.empty) {
            const genesisUvtDoc = await uvtCollection.add({
                ownerId: uid,
                amount: 100000,
                tokenType: 'Reputation',
                assetId: 'genesis-link',
                description: 'Initial Genesis Mint: Legacy confirmation of foundational substrate contributions.',
                createdAt: new Date().toISOString(),
                onChainStatus: 'Settled',
                timestamp: FieldValue.serverTimestamp(),
                realityState: 'ACTUALIZED'
            });
            console.log(`[GENESIS] Back-dated mint complete. Hash: ${genesisUvtDoc.id}`);
        }

        console.log(`[GENESIS] Merge and Elevation Complete for ${displayName}. Solana Link: ${solanaPublicKey}`);

        return { success: true, mergedCount: legacyUids.length };
    } catch (error: any) {
        console.error('[GENESIS] Merge Protocol Failure:', error);
        return { error: error.message || 'An internal substrate error occurred during Genesis Merge.' };
    }
}
