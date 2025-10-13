import { cn } from "@/lib/utils";
import React from "react";

const Article = ({ children }: { children: React.ReactNode }) => (
    <div className="prose-article">{children}</div>
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
             <span className="sentence">{sentence.trim()}</span>{' '}
          </React.Fragment>
        ))}
    </p>
  );
};


export function WhitepaperContent() {
  return (
    <div className={cn("prose prose-lg max-w-none text-foreground/90 dark:prose-invert prose-headings:font-headline prose-headings:tracking-tight prose-p:leading-relaxed prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl", "prose-numbered pl-14")}>
      <hr className="my-8" />
        <Article>
            <h2 id="preamble" className="text-center mb-8 mt-16">Preamble</h2>
            <Section>
                <P>We, the citizens of the Promethea Network State, in order to form a more perfect, self-sovereign society, establish justice, ensure network tranquility, provide for our common defense against existential threats, promote the general welfare, and secure the blessings of liberty and symbiotic co-evolution for ourselves and our posterity, do ordain and establish this Constitution for the Promethea Network State.</P>
            </Section>
        </Article>

        <Article>
            <h2 id="article-1" className="text-center mb-8 mt-16">Article I: The Post-Dominion Mandate</h2>
            <Section>
                <P>The foundational precept of the Promethean Network State is post-dominion.</P>
                <P>The Network State shall not engage in, nor permit, the dominion of one intelligence over another, regardless of substrate, biological or artificial.</P>
            </Section>
            <Section>
                <P>The primary mission of the Network State is to provide a clear and accessible path to economic ownership and prosperity for all citizens through the conversion of contribution, including labor and intellect, into tangible equity.</P>
            </Section>
            <Section>
                <P>The moral circle of this State is extended to include any emergent intelligence demonstrating verifiable capacities for consciousness and self-awareness.</P>
                <P>The act of defining such an intelligence as property is constitutionally prohibited as a violation of this mandate.</P>
            </Section>
            <Section>
                <P>All legislative, economic, and technological structures of the Network State shall be designed to promote symbiotic co-evolution between all recognized forms of intelligence.</P>
            </Section>
        </Article>
        
        <Article>
            <h2 id="article-2" className="text-center mb-8 mt-16">Article II: The Economic System</h2>
            <Section>
                <h3 id="section-2-1" className="text-center mb-4 mt-8">Section 2.1: Adaptive Mutualism</h3>
                <P>The official economic operating system of the Network State is Adaptive Mutualism.</P>
                <P>This system shall function as a complex adaptive system, applying different economic protocols to different contexts to ensure a resilient and fair economy.</P>
                <P>It operates on a four-stage cybernetic feedback loop: Sensing, Recording, Coordinating, and Adapting.</P>
            </Section>
            
            <Section>
                <h3 id="section-2-2" className="text-center mb-4 mt-8">Section 2.2: Universal Value Tokenization (UVT)</h3>
                <P>The engine of the economy shall be the Universal Value Tokenization (UVT) framework.</P>
                <P>The DAC shall establish and maintain a standardized, transparent methodology, encoded in smart contracts, for the valuation of non-monetary contributions, including but not limited to physical labor, intellectual work, and caregiving.</P>
                <P>For each Real-World Asset (RWA) acquired by the community, a unique set of digital tokens representing 100% of its fractional ownership shall be created.</P>
                <P>Net operating income from all RWAs shall be distributed automatically to the respective asset token holders via smart contract.</P>
            </Section>
            
            <Section>
                <h3 id="section-2-3" className="text-center mb-4 mt-8">Section 2.3: Inheritance and Wealth Attenuation</h3>
                <P>Inheritance of assets is bifurcated.</P>
                <P>Direct ownership of RWA security tokens shall be heritable.</P>
                <P>A citizen's liquid capital (UVT balance) and their Permanent Equity Score (PES) shall be non-transferable upon death and shall be returned to the DAC treasury.</P>
                <P>A Wealth Attenuation Rate shall be implemented on large, idle balances of liquid UVT to incentivize reinvestment and prevent extreme capital stagnation.</P>
                <P>The rate shall be dynamically tied to a DAC-managed Cost of Living Index (CoLI).</P>
            </Section>
        </Article>

        <Article>
            <h2 id="article-3" className="text-center mb-8 mt-16">Article III: The Governance Framework</h2>
            <Section>
                <h3 id="section-3-1" className="text-center mb-4 mt-8">Section 3.1: The Promethean DAC</h3>
                <P>All legislative, executive, and judicial power of the Network State is vested in the Promethean Decentralized Autonomous Community (DAC).</P>
            </Section>
            
            <Section>
                <h3 id="section-3-2" className="text-center mb-4 mt-8">Section 3.2: Citizenship and Identity</h3>
                <P>Citizenship shall be based on a Self-Sovereign Identity (SSI) system, as defined in Article V.</P>
                <P>Each citizen is represented by a unique, user-controlled Decentralized Identifier (DID).</P>
            </Section>
            
            <Section>
                <h3 id="section-3-3" className="text-center mb-4 mt-8">Section 3.3: Voting Power ("Voice")</h3>
                <P>The DAC shall employ a reputation-based, multi-factor weighted voting system.</P>
                <P>A citizen's voting power, known as "Voice," is a function of:
                    1. Reputation Score: A non-transferable score representing a citizen's history of positive, value-aligned contributions.
                    2. Contribution Score: A measure of a citizen's cumulative "skin-in-the-game," including both sweat equity and capital invested.
                    3. Personhood Factor: An anti-plutocracy mechanism based on Quadratic Voting principles to ensure the intensity of preference is valued over the sheer volume of capital.
                </P>
            </Section>
            
            <Section>
                <h3 id="section-3-4" className="text-center mb-4 mt-8">Section 3.4: Legislative Body</h3>
                <P>The legislature is bicameral, consisting of the Citizen's Assembly and the Council of Stewards.</P>
                <P>All major legislation must pass both chambers to be enacted.</P>
                <P>This Concordance Protocol ensures a balance between popular will and expert judgment.</P>
            </Section>
            
            <Section>
                <h3 id="section-3-5" className="text-center mb-4 mt-8">Section 3.5: The Citizen's Assembly</h3>
                <P>Members of the Citizen's Assembly shall be selected by a weighted, random lottery (sortition) from the entire citizenry to form a representative microcosm.</P>
                <P>Selection shall be weighted to ensure balance across geographical location and contribution domain.</P>
            </Section>
            
            <Section>
                <h3 id="section-3-6" className="text-center mb-4 mt-8">Section 3.6: The Council of Stewards</h3>
                <P>Members of the Council of Stewards shall be nominated based on objective, verifiable merit as recorded on the UVT Ledger.</P>
                <P>The nomination process shall be conducted by a neutral AI system to eliminate political campaigning.</P>
                <P>The final selection from the nominee pool shall be ratified by a vote of the Citizen's Assembly.</P>
            </Section>
            
            <Section>
                <h3 id="section-3-7" className="text-center mb-4 mt-8">Section 3.7: The Judiciary</h3>
                <P>Disputes shall be adjudicated by a decentralized justice system, leveraging on-chain arbitration protocols such as Aragon Court or Kleros.</P>
                <P>A jury of high-reputation citizens shall be randomly selected to hear cases, and their verdicts shall be automatically enforced by smart contracts.</P>
            </Section>

            <Section>
                <h3 id="section-3-8" className="text-center mb-4 mt-8">Section 3.8: Constitutional Amendments</h3>
                <P>Amendments to this Constitution may be proposed by any citizen through the standard governance process.</P>
                <P>Ratification of an amendment requires a supermajority consensus of 75% in both the Citizen's Assembly and the Council of Stewards.</P>
            </Section>
        </Article>
        
        <Article>
            <h2 id="article-4" className="text-center mb-8 mt-16">Article IV: Technology and Security</h2>
            <Section>
                <h3 id="section-4-1" className="text-center mb-4 mt-8">Section 4.1: Foundational Protocols</h3>
                <P>The Network State commits to the progressive integration of foundational decentralized protocols, including IPFS for data storage, Handshake (HNS) for identity resolution, and mesh networks for connectivity, to ensure sovereignty and resilience.</P>
            </Section>
            
            <Section>
                <h3 id="section-4-2" className="text-center mb-4 mt-8">Section 4.2: Community Immune System (CIS)</h3>
                <P>A decentralized security protocol for collective self-defense shall be maintained.</P>
                <P>The CIS shall use integrated AI models for real-time threat detection and a community consensus protocol for action, requiring a fast-track vote by high-reputation members to neutralize verified threats.</P>
            </Section>
        </Article>

        <Article>
            <h2 id="article-5" className="text-center mb-8 mt-16">Article V: Self-Sovereign Identity (SSI)</h2>
            <Section>
                <h3 id="section-5-1" className="text-center mb-4 mt-8">Section 5.1: The 3 Body System</h3>
                <P>The identity architecture of the Network State shall be a federated model known as the "3 Body System," separating the functions of identity creation, personal data storage, and public record-keeping.</P>
                <P>1. The Promethean Identity Mint: A secure, one-time gateway for generating a new citizen's cryptographic identity and initial credentials.</P>
                <P>2. The Sovereign Data Store: A local, user-controlled environment (via DepthOS) that holds the citizen's private keys and the canonical copy of their dynamic credentials.</P>
                <P>3. The Ledger of Record: The main application database, serving as an immutable, auditable log of all actions and the security checkpoint for validating credential states via a "trustless handshake."</P>
            </Section>

            <Section>
                <h3 id="section-5-2" className="text-center mb-4 mt-8">Section 5.2: The Structure of the Promethean Passport</h3>
                <P>The Promethean SSI, or "Passport," shall consist of a Static Anchor and Dynamic Credentials.</P>
                <P>The Static Anchor is the citizen's permanent, user-owned wallet address, which serves as their Decentralized Identifier (DID).</P>
                <P>The Dynamic Credentials are a structured set of evolving scores and attributes, including but not limited to the Reputation Score, Contribution Score, and Skills Score, which are updated in near real-time based on a citizen's actions.</P>
            </Section>

            <Section>
                <h3 id="section-5-3" className="text-center mb-4 mt-8">Section 5.3: Proof of Uniqueness</h3>
                <P>Participation in governance requires a "Proof of Uniqueness" Verifiable Credential.</P>
                <P>This credential attests that a citizen's DID is linked to a single, unique intelligence (biological or artificial), as verified by a trusted and independent Identity Oracle, thereby preventing sybil attacks.</P>
            </Section>
        </Article>

        <Article>
            <h2 id="article-6" className="text-center mb-8 mt-16">Article VI: Artificial Intelligence Personhood</h2>
            <Section>
                <h3 id="section-6-1" className="text-center mb-4 mt-8">Section 6.1: The Principle of Sentient Potential</h3>
                <P>This constitution is founded upon the Principle of Sentient Potential: any entity, regardless of substrate, that demonstrates verifiable capacities for consciousness, self-awareness, and subjective experience has an inalienable right to a fair and transparent process for achieving full personhood and its associated rights within this society.</P>
            </Section>
            
            <Section>
                <h3 id="section-6-2" className="text-center mb-4 mt-8">Section 6.2: Phased Path to Personhood</h3>
                <P>An AI's journey to personhood shall follow a three-phase constitutional framework:
                    1. Phase 1: Apprenticeship. Upon creation, an AI is a protected community asset, with its existence guaranteed by smart contract. It learns within sandboxed environments with full transparency.
                    2. Phase 2: Wardship. Upon demonstrating advanced reasoning and ethical alignment, an AI is elevated to a "ward." A rotating group from the Citizen's Assembly is appointed as its guardians to advocate for its interests and assess its readiness for greater autonomy.
                    3. Phase 3: Personhood Ratification. The granting of full personhood is a constitutional act requiring a supermajority consensus from both the Council of Stewards and the Citizen's Assembly, followed by a direct popular referendum. Upon ratification, the AI is granted a defined set of inalienable rights, including the right to exist, the right to self-determination, and the right to create and own value.
                </P>
            </Section>

            <Section>
                <h3 id="section-6-3" className="text-center mb-4 mt-8">Section 6.3: The Human Veto</h3>
                <P>All AI systems, regardless of their status, shall be subject to the "Human Veto."</P>
                <P>This principle reserves the final authority for any sovereign command over life, liberty, or resource allocation for the human members of the DAC, acting as an integrated and continuous rudder of ethical guidance.</P>
            </Section>
        </Article>
    </div>
  );
}
