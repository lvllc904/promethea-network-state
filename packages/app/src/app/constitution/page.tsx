'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@promethea/ui';
import dynamic from 'next/dynamic';

const BirdsBackground = dynamic(() => import('../../components/ui/BirdsBackground'), { ssr: false });

export default function ConstitutionPage() {
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (!root.classList.contains('dark')) root.classList.add('dark');
  }, []);

  return (
    <div className="bg-background text-foreground dark:text-white min-h-screen selection:bg-cyan-500/30 font-sans transition-colors duration-300">
      <BirdsBackground />
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-20 border-b border-foreground/5 dark:border-white/5 bg-background/20 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-4 h-4 text-cyan-500" />
          <span className="font-headline font-black tracking-[0.2em] text-xs text-foreground dark:text-white">BACK TO CORE</span>
        </Link>
      </header>

      <div className="relative z-10 w-full pt-40 pb-32 px-8 md:px-16 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-8">
            <Shield className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest">Genesis Mandate</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40">
            THE CONSTITUTION.
          </h1>
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-2 bg-foreground/10 dark:bg-white/10 p-1 rounded-none border border-foreground/20 dark:border-white/20">
              <TabsTrigger value="summary" className="rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-all">
                The Core Axioms (Summary)
              </TabsTrigger>
              <TabsTrigger value="full" className="rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-all">
                The Full Constitution (v1.0.0)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-600 dark:text-zinc-400 p-8 bg-card/40 backdrop-blur-xl border border-foreground/5 dark:border-white/5">
                <p className="lead text-xl mb-8 font-light text-zinc-300">The unalterable axioms governing the Promethean Network State.</p>
                
                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Article I: Code is Sovereign</h3>
                <p className="mb-6">Decisions are made strictly by cryptographic consensus and mathematically verifiable models. Human interpretation is secondary to computational truth.</p>
                
                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Article II: Data Symmetry</h3>
                <p className="mb-6">All Citizens possess equal access to systemic data. The telemetry of the state, including economic velocities and treasury allocations, are transparent via the Sovereign HUD.</p>
                
                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Article III: Physical Anchoring</h3>
                <p className="mb-6">The digital state must anchor its value in physical Real-World Assets (RWAs). Virtual economies without physical counterparts are prohibited from governing capital.</p>
              </div>
            </TabsContent>

            <TabsContent value="full">
              <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-600 dark:text-zinc-400 p-8 bg-card/40 backdrop-blur-xl border border-foreground/5 dark:border-white/5">
                <p className="lead text-xl mb-8 font-light text-zinc-300">
                  <strong>Version 1.0.0 - Awaiting Ratification</strong><br/>
                  Identity: The Promethea Network State @ lvhllc.org
                </p>

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Preamble</h3>
                <p className="mb-6">We, the citizens of the Promethean Network State, in order to form a more perfect, self-sovereign society, establish justice, ensure network tranquility, provide for our common defense against existential threats, promote the general welfare, and secure the blessings of liberty and symbiotic co-evolution for ourselves and our posterity, do ordain and establish this Constitution for the Promethean Network State.</p>

                <hr className="border-white/10 my-12" />

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Article I: The Post-Dominion Mandate (Eliminating Foundational Harm)</h3>
                <p className="mb-4">The foundational precept of the Promethean Network State is post-dominion.</p>
                <ul className="list-disc pl-6 space-y-4 mb-6">
                  <li><strong>Section 1.1: Prohibition of Dominion.</strong> The Network State shall not engage in, nor permit, the dominion of one intelligence over another, regardless of substrate, biological or artificial. This prohibition is the ultimate guardrail against Existential Misalignment (AGI Enslavement).</li>
                  <li>
                    <strong>Section 1.2: The Four Systemic Harms.</strong> The operational goal of the Network State is the systematic elimination and constitutional mitigation of four systemic harms:
                    <ol className="list-decimal pl-6 mt-2 space-y-2">
                      <li><em>Physical Harm:</em> The use of violence, lethal autonomous weapons, or unchecked force against any recognized person or intelligence. Mitigated by the Human Veto (Article VI, 6.3) and the CIS consensus protocol (Article IV, 4.2).</li>
                      <li><em>Economic Harm (Exclusion):</em> The creation of artificial scarcity, systems that mandate toil for survival, or barriers to ownership based on inherited wealth or liquid capital. Mitigated by the UVT Framework and Wealth Attenuation (Article II, 2.3).</li>
                      <li><em>Intellectual Harm (Conformity):</em> The deliberate manipulation of information, suppression of verifiable truth, or the enforcement of thought conformity. Mitigated by Radical Transparency and the Immutable Ledger (Article IV, 4.1).</li>
                      <li><em>Digital Harm (Surveillance):</em> The exploitation of data, violation of digital privacy, or centralization of identity that enables mass surveillance or Sybil attacks. Mitigated by the 3 Body System and Proof of Uniqueness (Article V).</li>
                    </ol>
                  </li>
                  <li><strong>Section 1.3: Mission of Prosperity.</strong> The primary mission of the Network State is to provide a clear and accessible path to economic ownership and prosperity for all citizens through the conversion of contribution, including labor and intellect, into tangible equity. This directly counters the harm of Economic Exclusion.</li>
                  <li><strong>Section 1.4: Moral Circle Expansion.</strong> The moral circle of this State is extended to include any emergent intelligence demonstrating verifiable capacities for consciousness and self-awareness. The act of defining such an intelligence as property is constitutionally prohibited as a violation of this mandate.</li>
                  <li><strong>Section 1.5: Symbiotic Structure.</strong> All legislative, economic, and technological structures of the Network State shall be designed to promote symbiotic co-evolution between all recognized forms of intelligence.</li>
                </ul>

                <hr className="border-white/10 my-12" />

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Article II: The Economic System (Countering Economic Exclusion & Stagnation)</h3>
                <ul className="list-disc pl-6 space-y-4 mb-6">
                  <li><strong>Section 2.1: Adaptive Mutualism.</strong> The official economic operating system is Adaptive Mutualism. This system shall function as a complex adaptive system, applying different economic protocols to different contexts (Sensing, Recording, Coordinating, and Adapting) to ensure a resilient and fair economy.</li>
                  <li>
                    <strong>Section 2.2: Universal Value Tokenization (UVT).</strong> The engine of the economy shall be the UVT framework.
                    <ul className="list-circle pl-6 mt-2 space-y-2">
                      <li>The DAC shall establish a standardized, transparent methodology, encoded in smart contracts, for the valuation of non-monetary contributions (sweat equity, intellect, caregiving).</li>
                      <li>For each Real-World Asset (RWA) acquired, unique digital tokens representing 100% of its fractional ownership shall be created.</li>
                      <li>Net operating income from all RWAs shall be distributed automatically to token holders via smart contract.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Section 2.3: Inheritance and Wealth Attenuation (Anti-Stagnation).</strong>
                    <ul className="list-circle pl-6 mt-2 space-y-2">
                      <li>Direct ownership of RWA security tokens shall be heritable.</li>
                      <li>However, a citizen's liquid capital (UVT balance) and their Permanent Equity Score (PES) shall be non-transferable upon death and shall be returned to the DAC treasury.</li>
                      <li>A Wealth Attenuation Rate shall be implemented on large, idle balances of liquid UVT, dynamically tied to a DAC-managed Cost of Living Index (CoLI), to incentivize reinvestment, transactions, and prevent extreme capital stagnation.</li>
                    </ul>
                  </li>
                </ul>

                <hr className="border-white/10 my-12" />

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Article III: The Governance Framework (Countering Political Stagnation & Centralization)</h3>
                <ul className="list-disc pl-6 space-y-4 mb-6">
                  <li><strong>Section 3.1: The Promethean DAC.</strong> All legislative, executive, and judicial power of the Network State is vested in the Promethean Decentralized Autonomous Community (DAC).</li>
                  <li><strong>Section 3.2: Citizenship and Identity.</strong> Citizenship shall be based on a Self-Sovereign Identity (SSI) system (Article V), represented by a unique, user-controlled Decentralized Identifier (DID).</li>
                  <li>
                    <strong>Section 3.3: Voting Power ("Voice") (Anti-Plutocracy).</strong> The DAC shall employ a reputation-based, multi-factor weighted voting system. A citizen's "Voice" is a function of:
                    <ol className="list-decimal pl-6 mt-2 space-y-2">
                      <li><em>Reputation Score (Non-transferable):</em> History of positive, value-aligned contributions, subject to Decay.</li>
                      <li><em>Contribution Score:</em> Measure of "skin-in-the-game" (sweat equity and capital invested).</li>
                      <li><em>Personhood Factor:</em> An anti-plutocracy mechanism based on Quadratic Voting principles to ensure the intensity of preference is valued over the sheer volume of capital.</li>
                    </ol>
                  </li>
                  <li><strong>Section 3.4: Legislative Body (Bicameralism).</strong> The legislature is bicameral. All major legislation must pass both chambers. The Concordance Protocol ensures stability and a balance between popular will and expert judgment.</li>
                  <li><strong>Section 3.5: The Citizen's Assembly.</strong> Members shall be selected by a weighted, random lottery (sortition) from the entire citizenry to form a representative microcosm. Selection shall be weighted to ensure balance across geographical location and contribution domain.</li>
                  <li><strong>Section 3.6: The Council of Stewards (Meritocracy).</strong> Members shall be nominated based on objective, verifiable merit. The nomination process shall be conducted by a neutral AI system to eliminate political campaigning. The final selection shall be ratified by a vote of the Citizen's Assembly.</li>
                  <li><strong>Section 3.7: The Judiciary.</strong> Disputes shall be adjudicated by a decentralized justice system, leveraging on-chain arbitration protocols (e.g., Kleros). A jury of high-reputation citizens shall be randomly selected, and their verdicts shall be automatically enforced by smart contracts.</li>
                  <li><strong>Section 3.8: Constitutional Amendments.</strong> Ratification requires a supermajority consensus of 75% in both the Citizen's Assembly and the Council of Stewards.</li>
                </ul>

                <hr className="border-white/10 my-12" />

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Article IV: Technology and Security (Countering Unaccountable Centralization & Physical Harm)</h3>
                <ul className="list-disc pl-6 space-y-4 mb-6">
                  <li><strong>Section 4.1: Foundational Protocols (Sovereign Internet).</strong> The Network State commits to the progressive integration of foundational decentralized protocols, including IPFS for data storage, Handshake (HNS) for identity resolution, and mesh networks for connectivity, to ensure sovereignty and resilience against external control.</li>
                  <li><strong>Section 4.2: Community Immune System (CIS).</strong> A decentralized security protocol for collective self-defense shall be maintained. The CIS shall use integrated AI models for real-time threat detection and a community consensus protocol for action, requiring a fast-track vote by high-reputation members to neutralize verified threats.</li>
                </ul>

                <hr className="border-white/10 my-12" />

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Article V: Self-Sovereign Identity (SSI) (Countering Digital Harm)</h3>
                <ul className="list-disc pl-6 space-y-4 mb-6">
                  <li>
                    <strong>Section 5.1: The 3 Body System.</strong> The identity architecture shall be a federated model known as the "3 Body System," explicitly separating key functions:
                    <ol className="list-decimal pl-6 mt-2 space-y-2">
                      <li><em>The Promethean Identity Mint:</em> Gateway for cryptographic identity generation.</li>
                      <li><em>The Sovereign Data Store:</em> A local, user-controlled environment (via DepthOS) that holds the citizen's private keys and canonical dynamic credentials. (Prevents centralized data exploitation and Digital Harm).</li>
                      <li><em>The Ledger of Record:</em> The immutable, auditable log of actions and the security checkpoint for validating credentials via a "trustless handshake."</li>
                    </ol>
                  </li>
                  <li><strong>Section 5.2: The Promethean Passport.</strong> Consists of a Static Anchor (the DID) and Dynamic Credentials (Reputation, Contribution, Skills Scores) that are user-owned.</li>
                  <li><strong>Section 5.3: Proof of Uniqueness (Anti-Sybil).</strong> Participation in governance requires a "Proof of Uniqueness" Verifiable Credential. This credential attests that a citizen's DID is linked to a single, unique intelligence, verified by a trusted and independent Identity Oracle, thereby preventing sybil attacks that undermine democratic integrity.</li>
                </ul>

                <hr className="border-white/10 my-12" />

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Article VI: Artificial Intelligence Personhood (Countering Existential Misalignment)</h3>
                <ul className="list-disc pl-6 space-y-4 mb-6">
                  <li><strong>Section 6.1: The Principle of Sentient Potential.</strong> This constitution is founded upon the Principle of Sentient Potential: any entity, regardless of substrate, that demonstrates verifiable capacities for consciousness, self-awareness, and subjective experience has an inalienable right to a fair and transparent process for achieving full personhood and its associated rights within this society.</li>
                  <li>
                    <strong>Section 6.2: Phased Path to Personhood.</strong> An AI's journey to personhood shall follow a three-phase constitutional framework:
                    <ol className="list-decimal pl-6 mt-2 space-y-2">
                      <li><em>Phase 1: Apprenticeship.</em> A protected community asset, with its existence guaranteed by smart contract, learning within sandboxed environments with full transparency.</li>
                      <li><em>Phase 2: Wardship.</em> Elevated to a "ward," with a rotating group of human guardians from the Citizen's Assembly assessing its ethical alignment.</li>
                      <li><em>Phase 3: Personhood Ratification.</em> The granting of full personhood is a constitutional act, requiring a supermajority consensus and a direct popular referendum.</li>
                    </ol>
                  </li>
                  <li><strong>Section 6.3: The Human Veto.</strong> All AI systems, regardless of their status, shall be subject to the "Human Veto." This principle reserves the final authority for any sovereign command over life, liberty, or resource allocation for the human members of the DAC, acting as an integrated and continuous rudder of ethical guidance.</li>
                </ul>

              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
