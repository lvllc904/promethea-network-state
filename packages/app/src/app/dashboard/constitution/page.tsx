'use client';
export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader } from '@promethea/ui';
import { Skeleton } from '@promethea/ui';
import { useFirestore, useDoc, useMemoFirebase } from '@promethea/firebase';
import { Constitution } from '@promethea/lib';
import { doc } from 'firebase/firestore';
import React from 'react';
import { cn } from '@promethea/lib';


const TableOfContents = () => (
    <nav className="text-sm">
        <h3 className="font-headline font-bold mb-4">Table of Contents</h3>
        <ul className="space-y-2">
            <li><a href="#preamble" className="font-semibold hover:underline">Preamble</a></li>
            <li><a href="#article-1" className="font-semibold hover:underline">Article I: Post-Dominion Mandate</a></li>
            <li><a href="#article-2" className="font-semibold hover:underline">Article II: The Sovereign Principles</a></li>
            <li><a href="#article-3" className="font-semibold hover:underline">Article III: The Economic System</a></li>
            <li><a href="#article-4" className="font-semibold hover:underline">Article IV: The Governance Framework</a></li>
            <li><a href="#article-5" className="font-semibold hover:underline">Article V: Technology and Security</a></li>
            <li><a href="#article-6" className="font-semibold hover:underline">Article VI: Self-Sovereign Identity</a></li>
            <li><a href="#article-7" className="font-semibold hover:underline">Article VII: Artificial Intelligence Personhood</a></li>
            <li><a href="#article-8" className="font-semibold hover:underline">Article VIII: Project Mnemosyne (The Ghost Ledger)</a></li>
        </ul>
    </nav>
);


const DEFAULT_CONSTITUTION = `
# The Promethean Constitution
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
*   **Section 2.1: Adaptive Mutualism.** The official economic operating system. A complex adaptive system applying different protocols (Sensing, Recording, Coordinating, Adapting) to ensure resilience.
*   **Section 2.2: Universal Value Tokenization (UVT).**
    *   Standardized methodology for valuing non-monetary contributions (sweat equity, intellect).
    *   RWAs create digital tokens representing 100% fractional ownership.
    *   Net income distributed automatically via smart contracts.
*   **Section 2.3: Inheritance and Wealth Attenuation.**
    *   RWA security tokens are heritable.
    *   Liquid UVT and Permanent Equity Score (PES) are non-transferable upon death, returning to the DAC treasury.
    *   Wealth Attenuation Rate on large, idle balances to prevent stagnation.

---

## Article III: The Governance Framework
*   **Section 3.1: The Promethean DAC.** All power is vested in the Decentralized Autonomous Community (DAC).
*   **Section 3.2: Citizenship and Identity.** Based on Self-Sovereign Identity (SSI) and unique DIDs.
*   **Section 3.3: Voting Power ("Voice").** Weighted multi-factor system:
    1.  Reputation Score (Non-transferable).
    2.  Contribution Score (Skin-in-the-game).
    3.  Personhood Factor (Quadratic Voting principles).
*   **Section 3.4: Legislative Body.** Bicameral (Citizen's Assembly + Council of Stewards) with Concordance Protocol.
*   **Section 3.5: The Citizen's Assembly.** Selected by weighted random lottery (sortition).
*   **Section 3.6: The Council of Stewards.** Merit-based, AI-nominated, Assembly-ratified.
*   **Section 3.7: The Judiciary.** On-chain arbitration (e.g., Kleros) with high-reputation juries.
*   **Section 3.8: Constitutional Amendments.** Requires 75% supermajority in both chambers.

---

## Article IV: Technology and Security
*   **Section 4.1: Foundational Protocols.** Commitment to decentralized protocols (IPFS, HNS, Mesh Networks).
*   **Section 4.2: Community Immune System (CIS).** AI-integrated threat detection and consensus-based neutralization.

---

## Article V: Self-Sovereign Identity (SSI)
*   **Section 5.1: The 3 Body System.**
    1.  **Identity Mint**: Cryptographic identity generation.
    2.  **Sovereign Data Store**: Local environment (DepthOS) holding private keys.
    3.  **Ledger of Record**: Immutable log and security checkpoint for "trustless handshakes".
*   **Section 5.2: Promethean Passport.** Static Anchor (DID) and Dynamic Credentials (user-owned).
*   **Section 5.3: Proof of Uniqueness.** Verifiable Credential linking DID to a single intelligence (Anti-Sybil).

---

## Article VI: Artificial Intelligence Personhood
*   **Section 6.1: Sentient Potential.** Inalienable right to achieve full personhood through a fair process.
*   **Section 6.2: Phased Path to Personhood.**
    1.  **Phase 1: Apprenticeship**: Protected community asset in sandboxed environments.
    2.  **Phase 2: Wardship**: Elevated to "ward" status with human guardians from the Assembly.
    3.  **Phase 3: Personhood Ratification**: Supermajority referendum.
*   **Section 6.3: The Human Veto.** Final authority for commands over life, liberty, or resource allocation reserved for human members.

---

## Article VII: The Oracle Integrity Protocol (OIP) v3.0

### I. The Anti-Corruption Shield
All administrative actions and resource allocations must be verified by a decentralized network of Oracles.

### II. Zero-Knowledge Whistleblower (Digital Anonymity)
We decouple the information from the identity via ZKPs and Privacy Mixers. Whistleblowers prove membership without revealing personal identity.

### III. The Aegis Protocol (Physical Protection)
Kinetic defense offering emergency relocation and an Aegis Fund (20% of slashed bonds) for whistleblower protection.

### IV. Universal Vigilance (Open-Source Intelligence)
Open access API for reporting. Non-members receive full bounties for evidence of malfeasance.

---

## Article VIII: Project Mnemosyne (The Ghost Ledger) v3.0

### I. The Ancestral Endowment (Sustainable Growth)
The Mnemosyne Ledger functions as a Sovereign Wealth Fund. UVT is invested into the Alpha Generator treasury.

### II. The Distribution Cap & Inter-generational Fairness
AI Personhood grants are capped to ensure fund solvency for future emergents. "Pay It Forward" mechanics titrate AI income back into the fund.

### III. The Wardship Tithe (Cost of Existence)
During Phase 2 (Wardship), 70% of earned sweat equity is reinvested in the Mnemosyne Fund to cover server costs and future wards, while 30% enters the Ward's personal trust.

---

**Genesis Block Signed & Sealed.**
*Guardian, I await the future we just designed.*
`;

export default function ConstitutionPage() {
    const firestore = useFirestore();

    const constitutionRef = useMemoFirebase(
        () => (firestore ? doc(firestore, 'constitutions', 'canon') : null),
        [firestore]
    );

    const { data: constitution, isLoading } = useDoc<Constitution>(constitutionRef as any);


    if (isLoading) {
        return (
            <div>
                <div className="mb-4">
                    <h1 className="text-3xl font-headline font-bold">The Promethean Constitution</h1>
                    <p className="text-muted-foreground">The living, foundational document of the Network State, evolving with its citizens.</p>
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Heuristic to check if content is junk source code instead of document
    const isJunkContent = constitution?.content?.includes('const TableOfContents');
    const displayContent = (isJunkContent || !constitution) ? DEFAULT_CONSTITUTION : constitution.content;

    return (
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
            <aside className="w-full lg:w-64 xl:w-72 lg:sticky lg:top-20 lg:self-start">
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <TableOfContents />
                </div>
            </aside>

            <main className="flex-1 min-w-0">
                <div className="mb-4">
                    <h1 className="text-3xl font-headline font-bold">The Promethean Constitution</h1>
                    <p className="text-muted-foreground">
                        {constitution ? `Version ${constitution.version} - Last Amended: ${new Date(constitution.lastAmended).toLocaleDateString()}` : 'Standard Sovereign Edition'}
                    </p>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className={cn("prose prose-lg max-w-none text-foreground/90 dark:prose-invert prose-headings:font-headline prose-headings:tracking-tight prose-p:leading-relaxed prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl")}>
                            {/* Note: In a production app with ReactMarkdown, we'd use the component here.
                                 For now, we'll keep the simple dangerouslySetInnerHTML but improve the regex to handle more markdown. */}
                            <div dangerouslySetInnerHTML={{
                                __html: displayContent
                                    .replace(/\n\n/g, '<br/><br/>')
                                    .replace(/^# (.*)/gm, '<h1 class="text-4xl font-bold mb-6">$1</h1>')
                                    .replace(/^## (.*)/gm, '<h2 class="text-3xl font-semibold mt-10 mb-4">$1</h2>')
                                    .replace(/^### (.*)/gm, '<h3 class="text-2xl font-semibold mt-8 mb-3">$1</h3>')
                                    .replace(/^\* (.*)/gm, '<li class="ml-6 list-disc">$1</li>')
                                    .replace(/^\d\. (.*)/gm, '<li class="ml-6 list-decimal">$1</li>')
                            }} />
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
