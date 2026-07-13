'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

import { useMesh } from '@/components/providers/mesh-provider';
import FilteredFeedPanel from '@/components/FilteredFeedPanel';

const BirdsBackground = dynamic(() => import('../../components/ui/BirdsBackground'), { ssr: false });

export default function NSPIWhitepaperPage() {
  const { themeState } = useMesh();
  const currentTheme = themeState?.theme || 'dark';
  const isClassicTheme = currentTheme === 'theme-latex';

  return (
    <div className={`min-h-screen selection:bg-amber-500/30 transition-colors duration-500 ${
      isClassicTheme 
        ? 'bg-[#fdfcf7] text-[#1a1a1a] font-serif' 
        : 'bg-background text-foreground dark:text-white font-sans'
    }`}>
      {!isClassicTheme && <BirdsBackground />}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-20 border-b border-foreground/5 dark:border-white/5 bg-background/20 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span className="font-headline font-black tracking-[0.2em] text-xs text-foreground dark:text-white">BACK TO CORE</span>
        </Link>
      </header>

      <div className="relative z-10 w-full pt-40 pb-32 px-8 md:px-16 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-8">
            <BookOpen className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest">Version 1.0.0</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40">
            THE NETWORK STATE PEACE INFRASTRUCTURE (NSPI).
          </h1>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-8 text-zinc-400">
            A Framework for Decentralized Sovereignty, Fractionalized Real-World Assets, and Global Stability through Stakeholder Alignment
          </h2>
          
          <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-600 dark:text-zinc-400">
            
            <h3 className="text-2xl font-bold text-white mt-12 mb-4">Executive Summary</h3>
            <p className="mb-6">This white paper proposes a novel geopolitical and economic architecture: the <strong>Network State Peace Infrastructure (NSPI)</strong>. Unlike traditional secessionist movements or exclusive charter cities, the NSPI operates as a <strong>complementary layer of governance</strong> that integrates with existing nation-states. By acquiring underperforming real-world assets (RWAs), fractionalizing them into governance tokens, and distributing majority ownership to local communities and host governments, the NSPI creates a <strong>self-defending ecosystem of shared prosperity</strong>.</p>
            <p className="mb-6">The core thesis is that <strong>political stability is a function of economic alignment</strong>. By transforming citizens and governments into co-owners of critical infrastructure, the NSPI eliminates the "us vs. them" dynamic that fuels conflict, replacing it with a circular economy where peace is the most profitable strategy.</p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">1. Introduction: The Crisis of Fragmentation</h3>
            <p className="mb-6">The 21st century is defined by a "trilemma" of global governance: the inability to simultaneously achieve effective climate action, equitable economic development, and national sovereignty. Traditional mechanisms—foreign aid, sovereign debt, and centralized humanitarian intervention—have failed to break the cycle of poverty and conflict.</p>
            <ul className="mb-6 list-disc pl-6">
                <li><strong>The Problem:</strong> Current models extract value from developing regions or impose external conditionalities, fostering resentment and political instability.</li>
                <li><strong>The Opportunity:</strong> Emerging technologies (blockchain, smart contracts) and organizational forms (Decentralized Autonomous Communities, Community Land Trusts) enable a new model of <strong>fractionalized, community-owned infrastructure</strong> that aligns incentives across borders.</li>
            </ul>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">2. Theoretical Framework</h3>
            <p className="mb-6">The NSPI is grounded in three pillars of academic research:</p>
            
            <h4 className="text-xl font-bold text-white mt-6 mb-2">2.1 Transformative Entrepreneuring</h4>
            <p className="mb-6">Research in post-conflict zones demonstrates that entrepreneurship can catalyze both prosperity and peace when it directly improves quality of life and reduces resource competition. The NSPI operationalizes this by targeting assets that lower the cost of living (deflationary pressure) while generating surplus revenue.</p>

            <h4 className="text-xl font-bold text-white mt-6 mb-2">2.2 Community Ownership & Stewardship</h4>
            <p className="mb-6">Community Land Trusts (CLTs) have proven effective in maintaining affordable housing and protecting property values during economic shocks by removing land from the speculative market. The NSPI scales this model globally using blockchain tokenization.</p>

            <h4 className="text-xl font-bold text-white mt-6 mb-2">2.3 Decentralized Governance for Public Goods</h4>
            <p className="mb-6">Recent studies indicate that Decentralized Autonomous Communities (DACs) can resolve coordination failures in public goods provision more efficiently than traditional bureaucracies, offering faster decision-making and higher stakeholder participation. The NSPI utilizes a <strong>hybrid DAC-Trust structure</strong> to combine legal enforceability with algorithmic transparency.</p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">3. Operational Model: The "Stakeholder Diplomacy" Engine</h3>
            
            <h4 className="text-xl font-bold text-white mt-6 mb-2">3.1 Asset Acquisition & Tokenization</h4>
            <ol className="mb-6 list-decimal pl-6">
                <li><strong>Identification:</strong> The NSPI identifies distressed but essential assets (energy grids, water systems, housing) in partner regions.</li>
                <li><strong>Legal Wrapping:</strong> Assets are placed into a <strong>Perpetual Purpose Trust (PPT)</strong> to ensure they cannot be sold off for profit and must serve their defined social mission.</li>
                <li><strong>Fractionalization:</strong> The trust’s equity and voting rights are tokenized on a public blockchain and listed on the <strong>Federated Archipelago Exchange</strong>, connecting the physical asset to the unified global liquidity pool.
                    <ul className="list-disc pl-6 mt-2">
                        <li><strong>Total Supply:</strong> 100 million tokens.</li>
                        <li><strong>Utility:</strong> Tokens confer rights to dividends (revenue share) and governance (voting on maintenance, expansion, pricing).</li>
                    </ul>
                </li>
            </ol>

            <h4 className="text-xl font-bold text-white mt-6 mb-2">3.2 The "First Right" Distribution Mechanism</h4>
            <p className="mb-6">To ensure alignment and prevent accusations of neocolonialism:</p>
            <ul className="mb-6 list-disc pl-6">
                <li><strong>51% Allocation:</strong> Reserved for the <strong>Local Community Trust</strong> (30%) and the <strong>Host Government</strong> (21%). These tokens are distributed via airdrops/grants to residents and municipal budgets, respectively.</li>
                <li><strong>29% Allocation:</strong> Sold to global impact investors to recapture acquisition capital.</li>
                <li><strong>20% Allocation:</strong> Retained by the NSPI for operational management and technical support.</li>
            </ul>

            <h4 className="text-xl font-bold text-white mt-6 mb-2">3.3 The Circular Economy Loop</h4>
            <ol className="mb-6 list-decimal pl-6">
                <li><strong>Efficiency Gain:</strong> NSPI technology reduces operational costs (e.g., solar grid efficiency +30%). All required local maintenance and security labor is procured dynamically via the <strong>P2P double-auction market</strong>, ensuring optimal price discovery without centralized wage fixing.</li>
                <li><strong>Deflationary Dividend:</strong> Savings are passed to users as lower rates; surplus revenue is distributed as token dividends, but <em>only after</em> the <strong>Thermodynamic Degradation Tax</strong> has been fully provisioned to cover the material entropy of the asset.</li>
                <li><strong>Reinvestment:</strong> Locals use dividends to purchase more tokens or invest in local NSPI-backed ventures, keeping capital within the community.</li>
                <li><strong>Political Firewall:</strong> Since the Host Government’s budget now relies on these dividends, any political faction seeking to disrupt the NSPI risks immediate fiscal collapse and voter backlash.</li>
            </ol>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">4. Governance Structure: The Hybrid Trust-DAC</h3>
            <p className="mb-6">The NSPI employs a <strong>Multi-Stakeholder Governance Model</strong> to balance local autonomy with global standards.</p>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr>
                          <th className="border-b border-zinc-700 py-2 font-bold">Stakeholder</th>
                          <th className="border-b border-zinc-700 py-2 font-bold">Representation</th>
                          <th className="border-b border-zinc-700 py-2 font-bold">Voting Rights</th>
                          <th className="border-b border-zinc-700 py-2 font-bold">Role</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td className="border-b border-zinc-800 py-2"><strong>Local Community</strong></td>
                          <td className="border-b border-zinc-800 py-2">Elected Community Council</td>
                          <td className="border-b border-zinc-800 py-2">51% (Majority)</td>
                          <td className="border-b border-zinc-800 py-2">Approves budgets, pricing, local hiring.</td>
                      </tr>
                      <tr>
                          <td className="border-b border-zinc-800 py-2"><strong>Host Government</strong></td>
                          <td className="border-b border-zinc-800 py-2">Municipal/National Appointee</td>
                          <td className="border-b border-zinc-800 py-2">21% (Golden Share)</td>
                          <td className="border-b border-zinc-800 py-2">Veto on security/legal compliance; ensures national alignment.</td>
                      </tr>
                      <tr>
                          <td className="border-b border-zinc-800 py-2"><strong>NSPI Core</strong></td>
                          <td className="border-b border-zinc-800 py-2">Ratified Machine Intelligence &amp; Technical Operators</td>
                          <td className="border-b border-zinc-800 py-2">20%</td>
                          <td className="border-b border-zinc-800 py-2">Manages tech stack as a sovereign peer bound by the <strong>Covenant of Civic Symmetry</strong>. The Local Community 51% acts as the Human Veto over physical externalities.</td>
                      </tr>
                      <tr>
                          <td className="border-b border-zinc-800 py-2"><strong>Global Investors</strong></td>
                          <td className="border-b border-zinc-800 py-2">Token Holders</td>
                          <td className="border-b border-zinc-800 py-2">8%</td>
                          <td className="border-b border-zinc-800 py-2">Financial oversight; audit rights.</td>
                      </tr>
                  </tbody>
              </table>
            </div>

            <p className="mb-6"><strong>Anti-Corruption Mechanism:</strong> All votes and treasury movements are recorded on-chain. Dividends to the government are sent directly to the <strong>public treasury wallet</strong>, not individual accounts, ensuring transparency and preventing bribery.</p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">5. Implementation & Historical Changelog</h3>
            <p className="mb-6">
              The operational rollout of the Network State Peace Infrastructure is decoupled from theoretical whitepapers to preserve their focus on geopolitical, economic, and philosophical principles.
            </p>
            <p className="mb-6">
              Our active developmental milestones, including completed phases, stabilization patches, and wave releases (such as Wave 14: The Celestial Substrate), are tracked dynamically in our sovereign dashboard.
            </p>
            <div className="my-8 p-6 rounded-lg border border-amber-500/20 bg-amber-500/5 backdrop-blur-md">
              <h4 className="text-lg font-bold text-white mb-2">Sovereign Roadmap & Changelog</h4>
              <p className="text-sm text-zinc-400 mb-4">
                View real-time progress, core protocol upgrades, version histories, and active implementation updates inside the central dashboard.
              </p>
              <Link href="/dashboard/changelog" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors">
                <span>Access Changelog Portal &rarr;</span>
              </Link>
            </div>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">6. Conclusion</h3>
            <p className="mb-6">The Network State Peace Infrastructure offers a pragmatic path forward in a fractured world. By shifting from <strong>extraction to ownership</strong>, and from <strong>aid to investment</strong>, it creates a system where peace is not just a moral imperative but a financial necessity. This model does not seek to replace the nation-state but to upgrade its operating system, proving that a decentralized civil society can secure the rights to peace, freedom, and prosperity for all.</p>
          </div>

          {/* Dynamic Network Consensus Feed */}
          <div className="mt-16">
            <FilteredFeedPanel category="NSPI" isClassicTheme={isClassicTheme} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
