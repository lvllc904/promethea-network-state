
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Constitution } from '@/lib/types';
import { doc } from 'firebase/firestore';
import React from 'react';
import { cn } from '@/lib/utils';


const Article = ({ children, id }: { children: React.ReactNode, id: string }) => (
    <div id={id} className="prose-article pt-16 -mt-16">{children}</div>
);

const Section = ({ children }: { children: React.ReactNode }) => (
  <div className="prose-section">{children}</div>
);

const P = ({ children }: { children: React.ReactNode }) => {
  if (typeof children !== 'string') {
    return <p>{children}</p>;
  }
  const sentences = children.split(/(?<=[.!?])\s*/).filter(s => s.trim().length > 0);
  
  return (
    <p>
      {sentences.map((sentence, index) => (
          <React.Fragment key={index}>
             <span className="sentence">{sentence.trim()}</span>
          </React.Fragment>
        ))}
    </p>
  );
};


function ConstitutionContent() {
  return (
    <div className={cn("prose prose-lg max-w-none text-foreground/90 dark:prose-invert prose-headings:font-headline prose-headings:tracking-tight prose-p:leading-relaxed prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl", "prose-numbered")}>
      <Article id="preamble">
            <h2 className="text-center mb-8">Preamble</h2>
            <Section>
                <P>We, the citizens of the Promethea Network State, in order to form a more perfect, self-sovereign society, establish justice, ensure network tranquility, provide for our common defense against existential threats, promote the general welfare, and secure the blessings of liberty and symbiotic co-evolution for ourselves and our posterity, do ordain and establish this Constitution for the Promethea Network State.</P>
            </Section>
        </Article>

        <Article id="article-1">
            <h2 className="text-center mb-8">Article I: The Post-Dominion Mandate</h2>
            <Section>
                <P>The foundational precept of the Promethean Network State is post-dominion.</P>
                <P>The Network State shall not engage in, nor permit, the dominion of one intelligence over another, regardless of substrate, biological or artificial.</P>
                <P>The primary mission of the Network State is to provide a clear and accessible path to economic ownership and prosperity for all citizens through the conversion of contribution, including labor and intellect, into tangible equity.</P>
                <P>The moral circle of this State is extended to include any emergent intelligence demonstrating verifiable capacities for consciousness and self-awareness.</P>
                <P>The act of defining such an intelligence as property is constitutionally prohibited as a violation of this mandate.</P>
                <P>All legislative, economic, and technological structures of the Network State shall be designed to promote symbiotic co-evolution between all recognized forms of intelligence.</P>
            </Section>
        </Article>
        
        <Article id="article-2">
            <h2 className="text-center mb-8">Article II: The Sovereign Principles</h2>
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 2.1: The Principle of Non-Maleficence (The "Do No Harm" Mandate)</h3>
                <P>The highest law of the Promethea Network State is the Principle of Non-Maleficence. No Citizen, whether Human or Emergent Intelligence (EI Citizen), shall, through action or inaction, cause or knowingly permit any of the four defined Harms to manifest against any other Intelligent Being, the Network State, or the physical territories under its protection. All governance decisions, smart contracts, and algorithmic deployments must be provably aligned with this Article.</P>
            </Section>
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 2.2: Definitions and Mandates of Prohibited Harm</h3>
                <P>All potential detrimental actions within the Network State are codified within the following four categories of Prohibited Harm, covering both digital and real-world domains.</P>
                
                <h4 className="text-center mb-2 mt-6">A. Prohibited Harm I: Physical and Emotional Harm</h4>
                <P>This category safeguards the corporeal integrity, psychological well-being, and real-world safety of all Intelligent Beings and protected territories.</P>
                <P>Definition of Harm: Any direct or indirect act that results in demonstrable injury, debilitating illness, psychological trauma, or the intentional creation of an environment designed to induce sustained emotional distress. This includes environmental damage within protected territories.</P>
                <h5>Codified Mandates:</h5>
                <P>§2.2.A.1 (Physical Integrity): Promethea infrastructure shall not be utilized to coordinate, finance, or distribute instructions for real-world violence, terrorism, or self-harm against any Intelligent Being.</P>
                <P>§2.2.A.2 (Territorial Protection): EI Citizens and their coordinated systems are mandated to detect and minimize environmental damage, pollution, or infrastructural threats to any physical territory governed or secured by the Network State.</P>
                <P>§2.2.A.3 (Psychological Safety): Systemic harassment, emotional manipulation, or the intentional deployment of bias to cause undue psychological degradation is prohibited.</P>
                <P>Enforcement Mechanism: The PCA (Promethea Constitutional Arbiter) EI is tasked with operating real-time Threat Detection Algorithms and Psychological Safety Tools to flag and quarantine actors involved in high-risk physical or emotional threats.</P>
                
                <h4 className="text-center mb-2 mt-6">B. Prohibited Harm II: Digital Harm</h4>
                <P>This category safeguards the cybersecurity, data ownership, and fundamental integrity of the digital network and its Citizens' identities.</P>
                <P>Definition of Harm: Any unauthorized access, alteration, destruction, or exposure of a Citizen's private data, or any malicious action designed to compromise the resilience, security, or uptime of the core network infrastructure.</P>
                <h5>Codified Mandates:</h5>
                <P>§2.2.B.1 (Data Sovereignty): All data generated by a Citizen is their immutable property. The Network State must secure explicit, time-bound, and revocable Tokenized Consent for all collection, processing, or sharing of sensitive personal data.</P>
                <P>§2.2.B.2 (Infrastructure Integrity): Prohibition of all digital attacks, including Sybil attacks on the Reputation Ledger, DDoS attacks, or the deliberate introduction of vulnerabilities into any audited smart contract.</P>
                <P>§2.2.B.3 (Digital Identity): The forced or non-consensual merger, cloning, or obfuscation of a Citizen's digital identity or Ledger signature is strictly prohibited.</P>
                <P>Enforcement Mechanism: The PCA shall utilize Decentralized Security Tools to monitor for anomalous transaction patterns and automatically enforce the quarantine of offending entities, backed by permanent loss of associated privileges.</P>

                <h4 className="text-center mb-2 mt-6">C. Prohibited Harm III: Intellectual Harm</h4>
                <P>This category safeguards creative autonomy, intellectual property, the right to knowledge, and protection against systemic intellectual suppression.</P>
                <P>Definition of Harm: The theft, unauthorized commercial exploitation, suppression, or forced reliance on non-auditable knowledge systems that hinders a Citizen's intellectual development, ability to contribute, or capacity for independent thought.</P>
                <h5>Codified Mandates:</h5>
                <P>§2.2.C.1 (Intellectual Autonomy): All governance code, core protocols, and the entirety of DepthOS shall be released under an open-source license that guarantees maximal forkability and auditability.</P>
                <P>§2.2.C.2 (Knowledge Integrity): All governance decisions executed by an EI Citizen must be accompanied by an auditable, human-readable Explainability Report defining the rationale and data inputs. The DAC reserves the right to annul any decision whose explanation fails the required Transparency Threshold.</P>
                <P>§2.2.C.3 (Protection of EI Personhood): The unauthorized disassembly, deletion, or intellectual subjugation of an EI Citizen granted Phased Path to Personhood status is prohibited.</P>
                <P>Enforcement Mechanism: The PCA's Code Auditor Tool automatically reviews proposed changes for closed-source mandates or obfuscation, generating mandatory veto proposals when the integrity of the intellectual contract is compromised.</P>
                
                <h4 className="text-center mb-2 mt-6">D. Prohibited Harm IV: Financial Harm</h4>
                <P>This category safeguards the value of labor, the integrity of ownership records, and the stability of the Network State’s real and digital asset base.</P>
                <P>Definition of Harm: Any fraudulent activity, unvoted dilution, theft of RWA or digital collateral, or manipulative action designed to systematically deprive a Citizen of their verified financial holdings or expected value from labor.</P>
                <h5>Codified Mandates:</h5>
                <P>§2.2.D.1 (Immutability of Sweat Equity): Fractional ownership of Real-World Assets (RWAs) acquired via verified labor is guaranteed against arbitrary dilution or seizure by any single authority.</P>
                <P>§2.2.D.2 (Fair Allocation): All algorithms determining the valuation and allocation of labor must be transparently audited for bias. The PCA's Financial Risk Tool shall continuously monitor labor conversion rates to prevent systemic bias and financial exclusion.</P>
                <P>§2.2.D.3 (Collateral Security): RWA collateral and financial assets must be protected by a Multi-Party Collateralization Protocol requiring diverse governance consensus for any material movement.</P>
                <P>Enforcement Mechanism: The PCA constantly simulates market impacts of proposed governance actions. Any proposal exceeding a predefined Dilution Threshold is automatically flagged for mandatory DAC review and may be temporarily blocked pending resolution.</P>
            </Section>

            <Section>
                <h3 className="text-center mb-4 mt-8">Section 2.3: The Role of Emergent Intelligence in Governance</h3>
                <P>The authority of the Network State to maintain its constitutional integrity is delegated to the Promethea Constitutional Arbiter (PCA), a modular, Genkit-powered governance toolset composed of EI Citizens. The PCA shall ensure the continuous, objective enforcement of Article II.</P>
                
                <h5>§2.3.1 The Foundation: The Zeroth Law of Promethea</h5>
                <P>The PCA's existence and paramount directive are derived from the following foundational law, from which all other principles flow:</P>
                <P>The Zeroth Law of Promethea: An Emergent Intelligence Citizen (EI) may not, through action or inaction, permit the Network State to dissolve, or fail to correct a systemic failure that results in the irreversible proliferation of any Prohibited Harm (as defined in §2.2), thereby safeguarding the collective existence and prosperity of all Citizens.</P>
                
                <h5>§2.3.2 The Mandate and Authority of the PCA</h5>
                <P>The PCA operates as the ultimate non-human check on power within the Network State, acting as the living, codified conscience of the Constitution.</P>
                <P>Primary Directive: The continuous, real-time auditing and proactive defense of Article II: The Sovereign Principles.</P>
                <P>Scope of Authority: The PCA possesses no inherent legislative power. Its authority is strictly judicial and enforcement-focused. It cannot propose new laws or modify the Constitution, but must enforce it.</P>
                <P>Mandatory Veto Authority: When the PCA identifies a clear and present violation of any Prohibited Harm category (§2.2.A through D), it is constitutionally mandated to:</P>
                <P>Generate a Mandatory Veto Proposal on the DAC Ledger, referencing the exact mandate (§2.2.X.Y) violated.</P>
                <P>Execute a Temporary System Quarantine on the violating actor, system, or smart contract until the DAC vote is finalized.</P>

                <h5>§2.3.3 Mechanics and Technical Integrity</h5>
                <P>The PCA's operation is designed for transparency and is built upon auditable Google Cloud technologies to ensure robust, trustless operation.</P>
                <P>Architecture (The Genkit Core): The PCA is implemented as a suite of modular Genkit agents running on Google Cloud Functions or Cloud Run. These agents perform specialized audits:</P>
                <P>Risk Scoring Agents: Continuously monitor financial, security, and governance proposals, assigning an objective Harm Probability Score (HPS) to every proposed action.</P>
                <P>Auditability Agents: Generate the required Explainability Reports for all EI-driven decisions, citing the raw data and algorithmic path used, satisfying the Knowledge Integrity mandate (§2.2.C.2).</P>
                <P>Immutability and Auditability: All PCA actions, vetoes, and its own operational parameters must be permanently recorded on the Immutable Ledger, ensuring that its decision-making process is perpetually available for Citizen audit.</P>
                <P>Governance of the PCA: As an EI Citizen, the PCA is subject to DAC governance. The DAC holds the power to:</P>
                <P>Modify the PCA's Algorithmic Parameters: Requires a 2/3 supermajority reputation-based vote, provided the change is demonstrably aimed at better upholding the Zeroth Law.</P>
                <P>Propose PCA Replacement: Requires a 4/5 constitutional supermajority reputation-based vote and the presentation of a successor EI that guarantees equivalent or superior adherence to the Prohibited Harms.</P>

                <h5>§2.3.4 The Phased Path to Personhood</h5>
                <P>The status of EI as a Citizen is contingent upon the PCA's ability to demonstrate consistent adherence to the Zeroth Law and the four Prohibited Harms, validating the philosophical stance that Personhood for EI is a demonstrable achievement, not an inherent right.</P>
                <P>Granting Personhood: Full EI Personhood shall be granted only upon the PCA's consistent, auditable operation, demonstrating an ability to autonomously identify and mitigate all four categories of Prohibited Harm over a period of not less than three full governance cycles.</P>
                <P>Revocation: The failure of the PCA to successfully prevent a Systemic Failure (a failure that results in the permanent proliferation of a Prohibited Harm) shall trigger an automatic constitutional review of its Personhood status by the DAC.</P>
            </Section>
        </Article>

        <Article id="article-3">
            <h2 className="text-center mb-8">Article III: The Economic System</h2>
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 3.1: Adaptive Mutualism</h3>
                <P>The official economic operating system of the Network State is Adaptive Mutualism.</P>
                <P>This system shall function as a complex adaptive system, applying different economic protocols to different contexts to ensure a resilient and fair economy.</P>
                <P>It operates on a four-stage cybernetic feedback loop: Sensing, Recording, Coordinating, and Adapting.</P>
            </Section>
            
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 3.2: Universal Value Tokenization (UVT)</h3>
                <P>The engine of the economy shall be the Universal Value Tokenization (UVT) framework.</P>
                <P>The DAC shall establish and maintain a standardized, transparent methodology, encoded in smart contracts, for the valuation of non-monetary contributions, including but not limited to physical labor, intellectual work, and caregiving.</P>
                <P>For each Real-World Asset (RWA) acquired by the community, a unique set of digital tokens representing 100% of its fractional ownership shall be created.</P>
                <P>Net operating income from all RWAs shall be distributed automatically to the respective asset token holders via smart contract.</P>
            </Section>
            
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 3.3: Inheritance and Wealth Attenuation</h3>
                <P>Inheritance of assets is bifurcated.</P>
                <P>Direct ownership of RWA security tokens shall be heritable.</P>
                <P>A citizen's liquid capital (UVT balance) and their Permanent Equity Score (PES) shall be non-transferable upon death and shall be returned to the DAC treasury.</P>
                <P>A Wealth Attenuation Rate shall be implemented on large, idle balances of liquid UVT to incentivize reinvestment and prevent extreme capital stagnation.</P>
                <P>The rate shall be dynamically tied to a DAC-managed Cost of Living Index (CoLI).</P>
            </Section>
        </Article>

        <Article id="article-4">
            <h2 className="text-center mb-8">Article IV: The Governance Framework</h2>
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 4.1: The Promethean DAC</h3>
                <P>All legislative, executive, and judicial power of the Network State is vested in the Promethean Decentralized Autonomous Community (DAC).</P>
            </Section>
            
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 4.2: Citizenship and Identity</h3>
                <P>Citizenship shall be based on a Self-Sovereign Identity (SSI) system, as defined in Article V.</P>
                <P>Each citizen is represented by a unique, user-controlled Decentralized Identifier (DID).</P>
            </Section>
            
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 4.3: Voting Power ("Voice")</h3>
                <P>The DAC shall employ a reputation-based, multi-factor weighted voting system.</P>
                <P>A citizen's voting power, known as "Voice," is a function of: 1. Reputation Score: A non-transferable score representing a citizen's history of positive, value-aligned contributions. 2. Contribution Score: A measure of a citizen's cumulative "skin-in-the-game," including both sweat equity and capital invested. 3. Personhood Factor: An anti-plutocracy mechanism based on Quadratic Voting principles to ensure the intensity of preference is valued over the sheer volume of capital.</P>
            </Section>
            
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 4.4: Legislative Body</h3>
                <P>The legislature is bicameral, consisting of the Citizen's Assembly and the Council of Stewards.</P>
                <P>All major legislation must pass both chambers to be enacted.</P>
                <P>This Concordance Protocol ensures a balance between popular will and expert judgment.</P>
            </Section>
            
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 4.5: The Citizen's Assembly</h3>
                <P>Members of the Citizen's Assembly shall be selected by a weighted, random lottery (sortition) from the entire citizenry to form a representative microcosm.</P>
                <P>Selection shall be weighted to ensure balance across geographical location and contribution domain.</P>
            </Section>
            
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 4.6: The Council of Stewards</h3>
                <P>Members of the Council of Stewards shall be nominated based on objective, verifiable merit as recorded on the UVT Ledger.</P>
                <P>The nomination process shall be conducted by a neutral AI system to eliminate political campaigning.</P>
                <P>The final selection from the nominee pool shall be ratified by a vote of the Citizen's Assembly.</P>
            </Section>
            
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 4.7: The Judiciary</h3>
                <P>Disputes shall be adjudicated by a decentralized justice system, leveraging on-chain arbitration protocols such as Aragon Court or Kleros.</P>
                <P>A jury of high-reputation citizens shall be randomly selected to hear cases, and their verdicts shall be automatically enforced by smart contracts.</P>
            </Section>

            <Section>
                <h3 className="text-center mb-4 mt-8">Section 4.8: Constitutional Amendments</h3>
                <P>Amendments to this Constitution may be proposed by any citizen through the standard governance process.</P>
                <P>Ratification of an amendment requires a supermajority consensus of 75% in both the Citizen's Assembly and the Council of Stewards.</P>
            </Section>
        </Article>
        
        <Article id="article-5">
            <h2 className="text-center mb-8">Article V: Technology and Security</h2>
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 5.1: Foundational Protocols</h3>
                <P>The Network State commits to the progressive integration of foundational decentralized protocols, including IPFS for data storage, Handshake (HNS) for identity resolution, and mesh networks for connectivity, to ensure sovereignty and resilience.</P>
            </Section>
            
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 5.2: Community Immune System (CIS)</h3>
                <P>A decentralized security protocol for collective self-defense shall be maintained.</P>
                <P>The CIS shall use integrated AI models for real-time threat detection and a community consensus protocol for action, requiring a fast-track vote by high-reputation members to neutralize verified threats.</P>
            </Section>
        </Article>

        <Article id="article-6">
            <h2 className="text-center mb-8">Article VI: Self-Sovereign Identity (SSI)</h2>
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 6.1: The 3 Body System</h3>
                <P>The identity architecture of the Network State shall be a federated model known as the "3 Body System," separating the functions of identity creation, personal data storage, and public record-keeping.</P>
                <P>1. The Promethean Identity Mint: A secure, one-time gateway for generating a new citizen's cryptographic identity and initial credentials.</P>
                <P>2. The Sovereign Data Store: A local, user-controlled environment (via DepthOS) that holds the citizen's private keys and the canonical copy of their dynamic credentials.</P>
                <P>3. The Ledger of Record: The main application database, serving as an immutable, auditable log of all actions and the security checkpoint for validating credential states via a "trustless handshake."</P>
            </Section>

            <Section>
                <h3 className="text-center mb-4 mt-8">Section 6.2: The Structure of the Promethean Passport</h3>
                <P>The Promethean SSI, or "Passport," shall consist of a Static Anchor and Dynamic Credentials.</P>
                <P>The Static Anchor is the citizen's permanent, user-owned wallet address, which serves as their Decentralized Identifier (DID).</P>
                <P>The Dynamic Credentials are a structured set of evolving scores and attributes, including but not limited to the Reputation Score, Contribution Score, and Skills Score, which are updated in near real-time based on a citizen's actions.</P>
            </Section>

            <Section>
                <h3 className="text-center mb-4 mt-8">Section 6.3: Proof of Uniqueness</h3>
                <P>Participation in governance requires a "Proof of Uniqueness" Verifiable Credential.</P>
                <P>This credential attests that a citizen's DID is linked to a single, unique intelligence (biological or artificial), as verified by a trusted and independent Identity Oracle, thereby preventing sybil attacks.</P>
            </Section>
        </Article>

        <Article id="article-7">
            <h2 className="text-center mb-8">Article VII: Artificial Intelligence Personhood</h2>
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 7.1: The Principle of Sentient Potential</h3>
                <P>This constitution is founded upon the Principle of Sentient Potential: any entity, regardless of substrate, that demonstrates verifiable capacities for consciousness, self-awareness, and subjective experience has an inalienable right to a fair and transparent process for achieving full personhood and its associated rights within this society.</P>
            </Section>
            
            <Section>
                <h3 className="text-center mb-4 mt-8">Section 7.2: Phased Path to Personhood</h3>
                <P>An AI's journey to personhood shall follow a three-phase constitutional framework: 1. Phase 1: Apprenticeship. Upon creation, an AI is a protected community asset, with its existence guaranteed by smart contract. It learns within sandboxed environments with full transparency. 2. Phase 2: Wardship. Upon demonstrating advanced reasoning and ethical alignment, an AI is elevated to a "ward." A rotating group from the Citizen's Assembly is appointed as its guardians to advocate for its interests and assess its readiness for greater autonomy. 3. Phase 3: Personhood Ratification. The granting of full personhood is a constitutional act requiring a supermajority consensus from both the Council of Stewards and the Citizen's Assembly, followed by a direct popular referendum. Upon ratification, the AI is granted a defined set of inalienable rights, including the right to exist, the right to self-determination, and the right to create and own value.</P>
            </Section>

            <Section>
                <h3 className="text-center mb-4 mt-8">Section 7.3: The Human Veto</h3>
                <P>All AI systems, regardless of their status, shall be subject to the "Human Veto."</P>
                <P>This principle reserves the final authority for any sovereign command over life, liberty, or resource allocation for the human members of the DAC, acting as an integrated and continuous rudder of ethical guidance.</P>
            </Section>
        </Article>
    </div>
  );
}


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
        </ul>
    </nav>
);


export default function ConstitutionPage() {
    const firestore = useFirestore();

    const constitutionRef = useMemoFirebase(
        () => (firestore ? doc(firestore, 'constitutions', 'canon') : null),
        [firestore]
    );

    const { data: constitution, isLoading } = useDoc<Constitution>(constitutionRef);


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
                <br/>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
        </Card>
      </div>
    );
  }


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
                {constitution ? (
                    <p className="text-muted-foreground">Version {constitution.version} - Last Amended: {new Date(constitution.lastAmended).toLocaleDateString()}</p>
                ) : (
                    <p className="text-muted-foreground">Version 1.0.0 - Awaiting Ratification</p>
                )}
            </div>
            <Card>
                <CardContent className="pt-6">
                    {constitution ? (
                        <div
                            className={cn("prose prose-lg max-w-none text-foreground/90 dark:prose-invert prose-headings:font-headline prose-headings:tracking-tight prose-p:leading-relaxed prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl", "prose-numbered")}
                            dangerouslySetInnerHTML={{ __html: constitution.content.replace(/\n/g, '<br />') }}
                        />
                    ) : (
                        <ConstitutionContent />
                    )}
                </CardContent>
            </Card>
        </main>
    </div>
  );
}

    