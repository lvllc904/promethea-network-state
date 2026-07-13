'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Brain, Landmark, Shield, Cpu, RefreshCw, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

import { useMesh } from '@/components/providers/mesh-provider';
import FilteredFeedPanel from '@/components/FilteredFeedPanel';

const BirdsBackground = dynamic(() => import('../../components/ui/BirdsBackground'), { ssr: false });

export default function CognitiveEconomicWhitepaperPage() {
  const [gatewayMode, setGatewayMode] = React.useState<'user-defined' | 'managed'>('user-defined');
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
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-20 border-b border-foreground/5 dark:border-white/5 bg-background/20 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span className="font-headline font-black tracking-[0.2em] text-xs text-foreground dark:text-white">BACK TO CORE</span>
        </Link>
      </header>

      {/* Main Container */}
      <div className="relative z-10 w-full pt-40 pb-32 px-8 md:px-16 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          
          {/* Metadata Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-8">
            <BookOpen className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest">Version 2.0.0 (Sovereign)</span>
          </div>

          {/* Title and Subtitle */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40 uppercase">
            THE COGNITIVE-ECONOMIC SUBSTRATE.
          </h1>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-12 text-amber-400">
            An Autonomous, Model-Based Reinforcement Learning Framework for Non-Extractive Parallel Societies
          </h2>

          {/* Document Properties Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 mb-16 bg-white/5 border border-white/10 backdrop-blur-md">
            <div>
              <div className="text-xs text-zinc-500 font-mono uppercase">Author</div>
              <div className="text-sm font-bold text-white mt-1">Promethea Core-Dev</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 font-mono uppercase">Date</div>
              <div className="text-sm font-bold text-white mt-1">June 2026</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 font-mono uppercase">Status</div>
              <div className="text-sm font-bold text-amber-400 mt-1">Canonical Release</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 font-mono uppercase">Tax Rate</div>
              <div className="text-sm font-bold text-amber-400 mt-1">0% Sovereign Tax</div>
            </div>
          </div>
          
          {/* Content Body */}
          <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-600 dark:text-zinc-300">
            
            {/* Abstract */}
            <div className="p-8 bg-gradient-to-br from-amber-500/5 to-transparent border-l-4 border-amber-500 my-10 rounded-r-xl">
              <h3 className="text-lg font-bold text-amber-400 uppercase tracking-wider mb-2 mt-0">Abstract</h3>
              <p className="text-base text-zinc-300 leading-relaxed m-0">
                Traditional nation-states rely heavily on extractive taxation models to secure administrative and infrastructural overhead. Decentralized networks (Web3) often mirror these patterns, extracting gas fees, swap taxes, or protocol tithing from their participants, resulting in governance-fatigue and capital outflow. 
              </p>
              <p className="text-base text-zinc-300 leading-relaxed mt-4 m-0">
                This paper introduces the <strong>Promethean Cognitive-Economic Substrate (PCES)</strong>, a sovereign, self-funding infrastructure that bridges model-based reinforcement learning with decoupled digital-to-fiat capital routers. Under the PCES architecture, a model-based cognitive steward (Promethea, implemented via Clojure <code className="text-amber-400">sbi-core</code>) employs <strong>Monte Carlo Tree Search (MCTS)</strong> over high-dimensional state vectors to select, orchestrate, and optimize <strong>54 active micro-economic profit-generating methods</strong>.
              </p>
              <p className="text-base text-zinc-300 leading-relaxed mt-4 m-0">
                By processing transactions through an isolated multi-chain wallet vault, bridging physical fiat markets programmatically via coinbase ACH rails, and utilizing a zero-tax <strong>Metabolic Reflex</strong>, the substrate secures all foundational compute and physical real-world hosting costs directly from external market arbitrage. The system achieves a stable <strong>0% citizen-tax rate</strong> while autonomously distributing <strong>Labor Universal Value Tokens (UVT)</strong> back to performing human and model nodes.
              </p>
            </div>

            <hr className="my-12 border-white/10" />

            {/* Section 1 */}
            <h2 className="text-3xl font-black text-white mt-12 mb-6 flex items-center gap-3">
              <Brain className="w-8 h-8 text-amber-400" />
              <span>Section 1: The Epistemology of the Machine (sbi-core)</span>
            </h2>
            <p>
              The cognitive mind of the Network State is represented by <code className="text-amber-400">sbi-core</code>, a reactive, self-referential model-based reinforcement learning engine. Rather than relying on rigid, pre-programmed operational paths, the substrate views all possible systemic configurations as nodes in a branching tree of future states.
            </p>

            <div className="my-8 p-6 bg-black/40 border border-white/5 rounded-xl font-mono text-xs text-amber-300 flex flex-col items-center overflow-x-auto">
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Current System Telemetry State S_0]</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌─────────────┴─────────────┐</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼                           ▼</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Intent: Sense]             [Intent: Rebalance]</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│                           │</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌──────┴──────┐             ┌──────┴──────┐</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼             ▼             ▼             ▼</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Outcome)     (Outcome)     (Outcome)     (Outcome)</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;S_sense1      S_sense2     S_rebal1      S_rebal2</div>
            </div>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">A. The MCTS Lookahead Engine (brain.clj)</h3>
            <p>
              Every operational epoch (or &quot;system tick&quot;), Promethea updates her root node parameters and runs a four-stage Monte Carlo Tree Search (MCTS):
            </p>
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <strong>Selection (<code className="text-amber-400">select</code>)</strong>: Traverses the existing search tree from the root node. At each decision fork, child nodes are evaluated using a modified <strong>Upper Confidence Bound applied to Trees (UCT)</strong> formula to guarantee an optimal balance between high-yielding active methods (exploitation) and untested market niches (exploration):
              </li>
            </ol>

            <div className="my-12 p-8 bg-gradient-to-br from-cyan-950/40 to-background/50 border border-amber-500/30 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(245, 158, 11,0.15)] flex flex-col items-center justify-center text-center group hover:border-amber-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              <div className="font-mono text-amber-400 text-[10px] uppercase tracking-widest mb-4 font-black">Formula 1.1: Upper Confidence Bound Applied to Trees (UCT)</div>
              
              <div className="text-3xl md:text-4xl tracking-wide text-white py-6 flex items-center justify-center gap-1 select-all font-serif">
                <span className="font-sans font-black text-2xl md:text-3xl text-amber-100 tracking-tight mr-2">UCT</span>
                <span className="text-amber-500 font-sans mx-2">=</span>
                <span className="flex flex-col items-center justify-center mx-2">
                  <span className="border-b border-white/40 px-3 pb-1 font-serif italic text-amber-100">
                    V<sub className="italic text-xs text-amber-300">i</sub>
                  </span>
                  <span className="pt-1 font-serif italic text-amber-100">
                    n<sub className="italic text-xs text-amber-300">i</sub>
                  </span>
                </span>
                <span className="text-amber-500 font-sans mx-2">+</span>
                <span className="font-serif italic text-amber-100 mx-1">C</span>
                <span className="text-amber-400 mx-1">&middot;</span>
                <span className="flex items-center text-white">
                  <span className="text-4xl md:text-5xl font-light text-amber-400 leading-none">&radic;</span>
                  <span className="border-t border-white/40 flex flex-col items-center justify-center px-3 pt-1.5 pb-1 -ml-1">
                    <span className="border-b border-white/20 px-2 pb-1 text-lg leading-none">
                      <span className="font-sans text-xs text-zinc-400 mr-1">ln</span>
                      <span className="font-serif italic text-amber-100">N<sub className="italic text-xs text-amber-300">p</sub></span>
                    </span>
                    <span className="pt-1 text-lg leading-none font-serif italic text-amber-100">
                      n<sub className="italic text-xs text-amber-300">i</sub>
                    </span>
                  </span>
                </span>
              </div>
              
              <div className="mt-4 text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed border-t border-white/5 pt-4">
                Where <span className="font-serif italic text-amber-300">V<sub className="italic">i</sub></span> represents the accumulated metabolic and capital utility score of child node <span className="font-serif italic text-amber-300">i</span>, <span className="font-serif italic text-amber-300">n<sub className="italic">i</sub></span> is the simulation count of child node <span className="font-serif italic text-amber-300">i</span>, <span className="font-serif italic text-amber-300">N<sub className="italic">p</sub></span> is the parent node&apos;s simulation count, and <span className="font-serif italic text-amber-300">C</span> is the exploration constant (standardized to &radic;2).
              </div>
              <div className="mt-3 text-xs text-zinc-500 max-w-2xl leading-relaxed border-t border-white/5 pt-3">
                <strong className="text-amber-500/70">Labor Market Analogue:</strong> In the economic context, the exploration constant <span className="font-serif italic text-amber-300">C</span> operates as a bounded floor. The system queries a continuously updated <strong className="text-zinc-300">Global Average Labor Cost Index</strong> (aggregated from ILO public datasets, freelancer platform benchmarks, and BLS wage surveys) as a hard reservation minimum below which no labor method&apos;s simulation value <span className="font-serif italic text-amber-300">V<sub className="italic">i</sub></span> can clear. This prevents the optimizer from converging on labor arrangements that undercut a globally defensible living wage, while still allowing all bids above this floor to compete freely on the open <code className="text-amber-400">/exchange</code>.
              </div>
            </div>

            <ol className="list-decimal pl-6 space-y-4" start={2}>
              <li>
                <strong>Expansion (<code className="text-amber-400">expand</code>)</strong>: Upon reaching a leaf node, if the node represents a non-terminal state, she instantiates child nodes mapping all valid sovereign actions (e.g. <code className="text-amber-400">:deploy-concentrated-lp</code>, <code className="text-amber-400">:generate-newsletter</code>, <code className="text-amber-400">:rebalance-fiat</code>).
              </li>
              <li>
                <strong>Simulation (<code className="text-amber-400">simulate</code>)</strong>: Projects the path of the newly expanded node forward to a finite horizon using her internal world simulator.
              </li>
              <li>
                <strong>Backpropagation (<code className="text-amber-400">backpropagate</code>)</strong>: Propagates the calculated utility of the terminal simulation node back up the tree, incrementing execution counters and updating the running mean value weights.
              </li>
            </ol>

            <h3 className="text-xl font-bold text-white mt-12 mb-4">B. The Generative World Model (InternalWorldModel)</h3>
            <p>
              Simulation relies on a defined world-model protocol. This subsystem operates purely in-memory, evaluating hypothetical futures:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><code className="text-amber-400">predict-next-state</code>: Projects how a specific action will perturb telemetry indices (CPU usage, RAM allocation, memory leak thresholds, on-chain Solana gas price indices, and volatility indicators like the VIX).</li>
              <li><code className="text-amber-400">evaluate-state</code>: Evaluates the fitness score (<code className="text-amber-400">U</code>) of a projected state vector. Fitness is computed as a weighted balance of metabolic integrity (<code className="text-amber-400">M</code>) and capital efficiency (<code className="text-amber-400">C</code>):</li>
            </ul>

            {/* UTILITY FORMULA CARD */}
            <div className="my-12 p-8 bg-gradient-to-br from-cyan-950/40 to-background/50 border border-amber-500/30 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(245, 158, 11,0.15)] flex flex-col items-center justify-center text-center group hover:border-amber-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              <div className="font-mono text-amber-400 text-[10px] uppercase tracking-widest mb-4 font-black">Formula 1.2: State Fitness Utility Scoring</div>
              
              <div className="text-2xl md:text-3xl tracking-wide text-white py-6 flex items-center justify-center flex-wrap gap-1 select-all font-serif">
                <span className="font-serif italic font-black text-3xl text-amber-100 mr-2">U</span>
                <span className="text-amber-500 font-sans mx-2">=</span>
                
                <span className="font-serif italic text-amber-100">w<sub className="text-xs text-amber-300">1</sub></span>
                <span className="text-amber-400 mx-1">&middot;</span>
                <span className="font-sans text-sm text-zinc-300 bg-white/5 px-2.5 py-1 rounded border border-white/10 font-bold uppercase tracking-wider mx-1">M(telemetry)</span>
                
                <span className="text-amber-500 font-sans mx-2">+</span>
                
                <span className="font-serif italic text-amber-100">w<sub className="text-xs text-amber-300">2</sub></span>
                <span className="text-amber-400 mx-1">&middot;</span>
                <span className="font-sans text-sm text-zinc-300 bg-white/5 px-2.5 py-1 rounded border border-white/10 font-bold uppercase tracking-wider mx-1">C(balance)</span>
                
                <span className="text-amber-500 font-sans mx-2">&minus;</span>
                
                <span className="font-serif italic text-amber-100">w<sub className="text-xs text-amber-300">3</sub></span>
                <span className="text-amber-400 mx-1">&middot;</span>
                <span className="font-sans text-sm text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 font-bold uppercase tracking-wider mx-1">Risk(volatility)</span>
              </div>
              <div className="mt-4 text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed border-t border-white/5 pt-4">
                Where <span className="font-sans text-xs bg-white/5 px-1.5 py-0.5 rounded text-zinc-300 border border-white/5">M(telemetry)</span> represents structural/computational health, <span className="font-sans text-xs bg-white/5 px-1.5 py-0.5 rounded text-zinc-300 border border-white/5">C(balance)</span> is the net asset capacity, <span className="font-sans text-xs bg-rose-500/10 px-1.5 py-0.5 rounded text-rose-300 border border-rose-500/10">Risk(volatility)</span> is external market risk, and <span className="font-serif italic text-amber-300">w<sub className="italic">1,2,3</sub></span> are dynamic operational weights.
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mt-12 mb-4">C. The Sovereign Concierge: Orchestration of Conversational Intent (Intellectual Moat)</h3>
            <p>
              To resolve the historical skills-and-knowledge barriers that impede public interaction with complex financial and technological infrastructure, the PCES establishes <strong>The Sovereign Concierge</strong>. Rather than exposing citizens directly to dry terminal prompts or intricate configuration templates, Promethea functions as a natural-language orchestration layer.
            </p>
            <p>
              The Concierge converts simple conversational input from the user (e.g., <em>&quot;Take $200, secure a yield spread, and write an article about our land restoration goals.&quot;</em>) into complex multi-threaded executable units:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dynamic Task Translation</strong>: Promethea uses high-level LLM reasoning to decompose intent, mapping natural language requests into structured execution configurations called <strong>Economic Recipes</strong>.</li>
              <li><strong>Parallel Sandboxed Scheduling</strong>: These recipes orchestrate multiple Category-A to Category-F methods concurrently within isolated parallel Docker containers.</li>
              <li><strong>Continuous Progress Streaming</strong>: The conversational daemon reports progress to the cockpit, translating system telemetry, on-chain transactions, and publishing status back into highly digestible natural language updates.</li>
            </ul>
            <p className="mb-8">
              This orchestration model establishes an intellectual moat, shifting the friction of network coordination away from the human citizen to the autonomous machine.
            </p>

            <hr className="my-12 border-white/10" />

            {/* Section 2 */}
            <h2 className="text-3xl font-black text-white mt-12 mb-6 flex items-center gap-3">
              <Layers className="w-8 h-8 text-amber-400" />
              <span>Section 2: The Tripartite Memory Substrate</span>
            </h2>
            <p>
              The cognitive-economic engine cannot process unstructured raw data without a mathematical grounding layer. PCES divides memory into three discrete, interconnected layers:
            </p>

            <div className="my-8 p-6 bg-black/40 border border-white/5 rounded-xl font-mono text-xs text-amber-300 flex flex-col items-center overflow-x-auto">
              <div>┌────────────────────────────────────────────────────────┐</div>
              <div>│               Omni-Intel Lake (Firestore)              │</div>
              <div>│       Time-series historical document contexts        │</div>
              <div>└───────────────┬────────────────────────┬───────────────┘</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│                        │</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼                        ▼</div>
              <div>&nbsp;┌────────────────────────┐    ┌────────────────────────┐</div>
              <div>&nbsp;│  Sovereign Vector DB   │    │    Sovereign Ledger    │</div>
              <div>&nbsp;│ SQLite text-embedding  │    │ Solana & pro-forma.db │</div>
              <div>&nbsp;└──────────────┬─────────┘    └────────┬───────────────┘</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│                        │</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└───────────┬────────────┘</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Clojure MCTS State Node Ingestion]</div>
            </div>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">1. The Ledger (Accounting Layer)</h3>
            <p>
              Tracks every asset transaction, balance modification, DID metadata record, and contract authorization in a local, cryptographically verified SQLite schema (<code className="text-amber-400">pro-forma.db</code>), backed up and anchored to the public Solana mainnet.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">2. The Omni-Intel Lake (Context Layer)</h3>
            <p>
              A high-throughput document database hosted on GCP Cloud Firestore. This database captures complete external environmental snapshots (news feeds, RSS streams, meteorological air-quality markers, and raw pricing indexes) on every tick, providing a permanent, structured historian substrate.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">3. The Sovereign Vector Database (Intuition Layer)</h3>
            <p>
              To resolve unstructured, high-volume news items and protocol files into actionable concepts, PCES implements a local vector indexer (<code className="text-amber-400">vector-db.ts</code>):
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Embedding Generation</strong>: Raw text blocks are dispatched to the Gemini API, generating dense <strong>1536-dimensional embeddings</strong> utilizing the <code className="text-amber-400">text-embedding-004</code> model.</li>
              <li><strong>Concept Matching</strong>: Incoming vectors are evaluated against stored memories using a localized <strong>Cosine Similarity</strong> formula over the SQLite substrate:</li>
            </ul>

            {/* COSINE FORMULA CARD */}
            <div className="my-12 p-8 bg-gradient-to-br from-cyan-950/40 to-background/50 border border-amber-500/30 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(245, 158, 11,0.15)] flex flex-col items-center justify-center text-center group hover:border-amber-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              <div className="font-mono text-amber-400 text-[10px] uppercase tracking-widest mb-4 font-black">Formula 2.1: Semantic Vector Cosine Similarity</div>
              
              <div className="text-2xl md:text-3xl tracking-wide text-white py-6 flex items-center justify-center gap-1 select-all font-serif">
                <span className="font-sans font-bold text-lg md:text-xl text-amber-300 tracking-tight mr-1">CosineSimilarity</span>
                <span className="font-serif text-zinc-300 text-lg md:text-xl">(<span className="italic font-bold text-amber-100">A</span>, <span className="italic font-bold text-amber-100">B</span>)</span>
                <span className="text-amber-500 font-sans mx-2">=</span>
                
                <span className="flex flex-col items-center justify-center mx-2">
                  <span className="border-b border-white/40 px-4 pb-2 text-xl md:text-2xl font-serif">
                    <span className="text-2xl md:text-3xl font-light text-amber-400 mr-1 leading-none align-middle">&sum;</span>
                    <sub className="text-[10px] text-zinc-400 -ml-5 mr-3">i=1</sub>
                    <sup className="text-[10px] text-zinc-400 -ml-5 mr-2">n</sup>
                    <span className="italic text-amber-100">A<sub className="italic text-xs text-amber-300">i</sub></span>
                    <span className="italic text-amber-100">B<sub className="italic text-xs text-amber-300">i</sub></span>
                  </span>
                  
                  <span className="flex items-center pt-2 text-lg md:text-xl">
                    {/* First Root */}
                    <span className="flex items-center text-white">
                      <span className="text-2xl md:text-3xl font-light text-amber-400 leading-none">&radic;</span>
                      <span className="border-t border-white/40 px-2 pt-0.5 -ml-1 font-serif">
                        <span className="text-lg md:text-xl font-light text-amber-400 leading-none mr-1">&sum;</span>
                        <span className="italic text-amber-100">A<sub className="italic text-xs text-amber-300">i</sub></span><sup className="text-xs text-amber-300">2</sup>
                      </span>
                    </span>
                    
                    <span className="text-amber-500 mx-2">&middot;</span>
                    
                    {/* Second Root */}
                    <span className="flex items-center text-white">
                      <span className="text-2xl md:text-3xl font-light text-amber-400 leading-none">&radic;</span>
                      <span className="border-t border-white/40 px-2 pt-0.5 -ml-1 font-serif">
                        <span className="text-lg md:text-xl font-light text-amber-400 leading-none mr-1">&sum;</span>
                        <span className="italic text-amber-100">B<sub className="italic text-xs text-amber-300">i</sub></span><sup className="text-xs text-amber-300">2</sup>
                      </span>
                    </span>
                  </span>
                </span>
              </div>
              
              <div className="mt-4 text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed border-t border-white/5 pt-4">
                Where <span className="font-serif italic text-amber-300">A</span> and <span className="font-serif italic text-amber-300">B</span> represent the 1536-dimensional embeddings of the query text and memory documents respectively, and <span className="font-serif italic text-amber-300">n</span> represents the total dimensionality (1536).
              </div>
            </div>

            <p>
              This allows Promethea to query her historical knowledge base semantically (e.g. <em>&ldquo;Find all historical precedents where a 15% increase in JPY borrowing rates coincided with a DeFi lending market contraction&rdquo;</em>) rather than relying on brittle keyword indexing.
            </p>

            <h3 className="text-xl font-bold text-white mt-12 mb-4">4. Symbiotic Edge Memory & Edge Storage (DepthOS Bridge)</h3>
            <p>
              To shield the network from centralized database scaling weights and preserve absolute data sovereignty, the PCES splits cognitive memory between public ledger indices and the user&apos;s private, self-custodied edge store. This off-premise-to-on-premise hybrid structure is driven by the <strong>Symbiotic Memory Daemon</strong> and the <strong>DepthOS Bridge</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Local Storage Grounding</strong>: Rather than permanently saving private training weights, LLM memory logs, and sensitive personal parameters in a centralized cloud server, this high-density context is stored strictly on the citizen&apos;s own machine.</li>
              <li><strong>The WebSocket Bridge (<code className="text-amber-400">port 9999</code>)</strong>: The active daemon in <code className="text-amber-400">packages/services/depthos-bridge</code> runs a secure local WebSocket server on port <code>9999</code> with strict POSIX filesystem read/write privileges.</li>
              <li><strong>Dynamic Context Hydration Loop</strong>: At sign-in, the user&apos;s local memory daemon initiates a handshake with the remote TPNS Cockpit over the localhost bridge:</li>
            </ul>

            {/* HYDRATION FORMULA CARD */}
            <div className="my-12 p-8 bg-gradient-to-br from-emerald-950/40 to-background/50 border border-amber-500/30 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(245, 158, 11,0.15)] flex flex-col items-center justify-center text-center group hover:border-amber-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              <div className="font-mono text-amber-400 text-[10px] uppercase tracking-widest mb-4 font-black">Hydration State Synchronization</div>
              
              <div className="text-xl md:text-2xl tracking-wide text-white py-6 flex items-center justify-center flex-wrap gap-1 select-all font-serif">
                <span className="font-sans text-sm text-zinc-300 bg-white/5 px-2.5 py-1 rounded border border-white/10 font-bold uppercase tracking-wider mx-1">HydrationState</span>
                <span className="text-amber-500 font-sans mx-2">=</span>
                <span className="font-serif italic text-amber-300 font-bold text-2xl mr-1">H</span>
                <span className="text-zinc-500 font-sans mr-1">(</span>
                <span className="font-sans text-xs text-zinc-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-bold">Local Key</span>
                <span className="text-zinc-500 font-sans mx-1">,</span>
                <span className="font-sans text-xs text-zinc-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-bold">Local SQLite DB</span>
                <span className="text-zinc-500 font-sans ml-1">)</span>
                
                <span className="text-amber-500 font-sans mx-3">&rarr;</span>
                <span className="font-sans text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">localhost:9999</span>
                <span className="text-amber-500 font-sans mx-3">&rarr;</span>
                
                <span className="font-sans text-sm text-zinc-300 bg-white/5 px-2.5 py-1 rounded border border-white/10 font-bold uppercase tracking-wider mx-1">TPNS Cockpit</span>
              </div>
              
              <div className="mt-4 text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed border-t border-amber-500/10 pt-4">
                This dynamically hydrates Promethea with the user&apos;s history, custom habits, and learned workflows. When the session terminates, the in-memory cockpit state is securely cleared, leaving the data safely resting within the user&apos;s exclusive local custody.
              </div>
            </div>

            <hr className="my-12 border-white/10" />

            {/* Section 3 */}
            <h2 className="text-3xl font-black text-white mt-12 mb-4 flex items-center gap-3">
              <Landmark className="w-8 h-8 text-amber-400" />
              <span>Section 3: Decoupled Multi-Chain & TradFi Gateways</span>
            </h2>
            <p className="mb-8">
              To execute real economic actions, the PCES implements a series of highly isolated, modular gateways that decouple risk and bridge physical-world fiat markets directly with on-chain ledgers. Under our <strong>User-First Decoupled Framework</strong>, the engine leads with a <strong>User-Defined Sovereign Mode</strong> while offering an automated <strong>Managed Done-For-You Mode</strong> as a secondary alternative.
            </p>

            {/* Premium Dynamic Mode Switcher */}
            <div className="mb-8 p-1.5 bg-white/5 border border-white/10 rounded-xl max-w-xl mx-auto flex items-center gap-2 backdrop-blur-md">
              <button
                onClick={() => setGatewayMode('user-defined')}
                className={`flex-1 py-3 px-4 rounded-lg font-mono text-xs font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                  gatewayMode === 'user-defined'
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245, 158, 11,0.15)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>🟢 CITIZEN SOVEREIGN (USER-DEFINED)</span>
              </button>
              <button
                onClick={() => setGatewayMode('managed')}
                className={`flex-1 py-3 px-4 rounded-lg font-mono text-xs font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                  gatewayMode === 'managed'
                    ? 'bg-gradient-to-r from-amber-500/20 to-blue-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245, 158, 11,0.15)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>🔵 PROMETHEAN CORE (MANAGED DFY)</span>
              </button>
            </div>

            {/* Dynamic Interactive Diagram */}
            <div className="my-8 p-6 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] text-amber-300 flex flex-col items-center overflow-x-auto relative min-h-[300px] justify-center transition-all duration-300">
              <div className="absolute top-3 right-4 px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] text-zinc-500 uppercase font-black">
                {gatewayMode === 'user-defined' ? 'User-Owned Custom Pipeline' : 'Promethea Default Managed Reserve'}
              </div>

              {gatewayMode === 'user-defined' ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center">
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌─────────────────────────┐</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│    Economic Engine      │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│  Orchestration Service  │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└────────────┬────────────┘</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌─────────────────────────┴─────────────────────────┐</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼                                                   ▼</div>
                  <div>┌──────────────────┐                                ┌──────────────────┐</div>
                  <div>│  Broker Gateway  │                                │  Wallet Manager  │</div>
                  <div>│ Alpaca / Custom  │                                │ Ledger / LocalFS │</div>
                  <div>└────────┬─────────┘                                └────────┬─────────┘</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│                                                   │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼ (TradFi Orders)                                   ▼ (DeFi Swaps)</div>
                  <div>┌──────────────────┐                                ┌──────────────────┐</div>
                  <div>│  Alpaca Account  │                                │  Solana / Base   │</div>
                  <div>│ Equities & Gold  │                                └────────┬─────────┘</div>
                  <div>└──────────────────┘                                         │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌─────────────────────┴─────────────────────┐</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼ (Custom Off-Ramp)                         ▼ (Custom ACH Banking)</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌──────────────────┐                        ┌──────────────────┐</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ Kraken / Binance │                        │  Mercury / Wise  │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└────────┬─────────┘                        └────────┬─────────┘</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ (Personal Trades)                         │ (Reserve Sweeps)</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼                                           ▼</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌──────────────────┐                        ┌──────────────────┐</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│  Personal Bank   │                        │ Citizen Business │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ (Sovereign USD)  │                        │ (Self-Directed)  │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──────────────────┘                        └──────────────────┘</div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center">
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌─────────────────────────┐</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│    Economic Engine      │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│  Orchestration Service  │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└────────────┬────────────┘</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌─────────────────────────┴─────────────────────────┐</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼                                                   ▼</div>
                  <div>┌──────────────────┐                                ┌──────────────────┐</div>
                  <div>│  Broker Gateway  │                                │  Wallet Manager  │</div>
                  <div>│  IBeam REST API  │                                │ GCP Vault KMS    │</div>
                  <div>└────────┬─────────┘                                └────────┬─────────┘</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│                                                   │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼ (TradFi Orders)                                   ▼ (DeFi Swaps)</div>
                  <div>┌──────────────────┐                                ┌──────────────────┐</div>
                  <div>│  IBKR Accounts   │                                │  Solana / Base   │</div>
                  <div>│ Equities & Gold  │                                └────────┬─────────┘</div>
                  <div>└──────────────────┘                                         │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌─────────────────────┴─────────────────────┐</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼ (Direct Off-Ramp)                         ▼ (Bill Settlements)</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌──────────────────┐                        ┌──────────────────┐</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ Coinbase CDP API │                        │  Spritz Finance  │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└────────┬─────────┘                        └────────┬─────────┘</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ (Advanced Trade)                          │ (Crypto-to-Fiat)</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼                                           ▼</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌──────────────────┐                        ┌──────────────────┐</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│  Varo Bank ACH   │                        │ Google Cloud run │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ (Reserve Buffer) │                        │ (Hosting Settle) │</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──────────────────┘                        └──────────────────┘</div>
                </motion.div>
              )}
            </div>

            {gatewayMode === 'user-defined' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <h3 className="text-xl font-bold text-white mt-8 mb-2">A. Primary Posture: Citizen Sovereign Integration</h3>
                <p className="mb-6">
                  The primary design posture of the PCES is fully self-custodied. Rather than committing assets to cloud vault keys, citizens register their own local wallets, brokerage interfaces, and banking rails through unified, provider-agnostic abstractions. This limits systemic platform risk and guarantees that citizens always keep exclusive ownership of their underlying capital.
                </p>

                <h3 className="text-xl font-bold text-white mt-8 mb-2">B. Custom Web3 Vaults: User-Defined Keys</h3>
                <p className="mb-6">
                  Citizens route transaction signing directly through a <strong>Local File Keystore</strong> or a hard-hardware wallet (like a <strong>Ledger/Trezor</strong>). Decryption and signature requests are isolated on-edge within the user&apos;s machine, keeping the engine completely blind to plaintext seed phrases or raw private keys.
                </p>

                <h3 className="text-xl font-bold text-white mt-8 mb-2">C. Custom Brokerage Integration</h3>
                <p className="mb-6">
                  Equities and commodity rebalancing calls are dispatched directly to the user&apos;s custom registered API accounts with retail brokerages (such as <strong>Alpaca API</strong> or <strong>Fidelity API</strong>). The engine translates lookahead portfolio allocations into programmatic orders routed instantly into accounts owned exclusively by the citizen.
                </p>

                <h3 className="text-xl font-bold text-white mt-8 mb-2">D. Custom Banking & Conversion Rails</h3>
                <p className="mb-6">
                  Swapping digital tokens into banking reserves is routed through the user&apos;s personal accounts on exchanges like <strong>Kraken</strong> or decentralized AMM aggregators, withdrawing fiat cash directly to their own commercial banks (via <strong>Mercury API</strong>, <strong>Wise</strong>, or Plaid routing).
                </p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <h3 className="text-xl font-bold text-white mt-8 mb-2">A. Managed Alternative: Promethean Sovereign Done-For-You Mode</h3>
                <p className="mb-6">
                  For users seeking complete delegation, or lacking retail bank/broker accounts, Promethea provides a fully automated concierge alternative. In this mode, the Economic Engine executes the 54 methods on behalf of the common treasury pool, routing assets through pre-integrated enterprise rails.
                </p>

                <h3 className="text-xl font-bold text-white mt-8 mb-2">B. Web3 Interfacing: Multi-Chain Wallet Manager</h3>
                <p className="mb-6">
                  Primary managed Web3 wallet interactions are routed through a multi-chain controller featuring root key isolation inside a <strong>GCP-backed KMS Vault Service</strong>. It provisions <strong>transient sub-wallet partitions</strong> dynamically allocated to isolated tasks to eliminate systemic smart contract risks, and runs an automated waterfall sweep protocol to clear yields back to cold vaults.
                </p>

                <h3 className="text-xl font-bold text-white mt-8 mb-2">C. TradFi Interfacing: Broker Gateway</h3>
                <p className="mb-6">
                  Rather than remaining locked in a crypto-only sandbox, the managed substrate interfaces with traditional markets via an <strong>IBeam REST proxy</strong> connected directly to <strong>Interactive Brokers (IBKR)</strong>.
                </p>
                <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                  <span className="font-mono text-xs font-black tracking-widest text-amber-400 uppercase block mb-2">🛡️ STRICT SAFETY CONSTRAINT: MANDATORY SANDBOX DEFAULT</span>
                  <p className="text-sm text-zinc-300 m-0 leading-relaxed">
                    To prevent accidental real-world capital loss or unsolicited market execution, all integrated IBKR connections <strong>strictly default to Paper Trading (sandboxed) mode</strong>. Transitioning the gateway into production Live Trading is disabled at the core level and requires a deliberate, multi-step conscious confirmation toggle within the user cockpit (which sets <code className="text-amber-300">IBKR_ALLOW_LIVE_TRADING=true</code> and verifies the account prefix change from sandboxed <code className="text-amber-300">DU</code> to live <code className="text-amber-300">U</code>).
                  </p>
                </div>
                <p className="mb-6">
                  Once safely initialized, the gateway programmatically parses Net Liquidation Values (NLV) and cash parameters, and dispatches equity and commodity market orders (e.g. SPY, GLD, IAU) using cryptographically signed payloads.
                </p>

                <h3 className="text-xl font-bold text-white mt-8 mb-2">D. Direct Off-Ramping & Automatic Settlement</h3>
                <p className="mb-6">
                  To monetize digital arbitrage directly into banking accounts without human intervention, stablecoins (USDC) are swept to designates, swapped to fiat USD via Coinbase Advanced Trade API, and dispatched directly to the Varo Bank business account via ACH network rails. Programmatic GCP bills are settled directly in cryptocurrency via <strong>Spritz Finance</strong>.
                </p>
              </motion.div>
            )}

            <h3 className="text-xl font-bold text-white mt-8 mb-2">E. The Provider-Agnostic Adapter Pattern</h3>
            <p className="mb-6">
              To avoid systemic fragility and protect the substrate from vendor lock-in or regional de-platforming, all PCES micro-services, APIs, and integrations implement a strict <strong>Provider-Agnostic Adapter Pattern</strong>. No specific provider is hard-coded into the core execution layer. Instead, all financial, data, and vault pipelines implement unified interface abstractions. This permits users and administrators to seamlessly swap providers across the entire transactional pipeline:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8">
              <li><strong>Brokerages</strong>: Swap Alpaca/Fidelity for Interactive Brokers (<code className="text-amber-400">broker-gateway.ts</code>), Tradier, or Fidelity.</li>
              <li><strong>Key Stores</strong>: Swap local file-based keys or Ledger for GCP Cloud KMS (<code className="text-amber-400">wallet-manager.ts</code>) or a physical HSM.</li>
              <li><strong>Banking Rails</strong>: Swap Mercury/Wise for Varo Bank and Plaid hooks, or local ACH/SEPA routes.</li>
              <li><strong>Exchanges</strong>: Swap Kraken/Binance for Coinbase CDP Advanced Trade, or decentralized liquidity aggregators.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">F. Multi-Tenant Sovereign Credentialing</h3>
            <p className="mb-6">
              To safely support thousands of distinct citizens within a shared cloud-native execution boundary, PCES enforces absolute credential isolation. The core Economic Engine (DAC) is completely stateless regarding private keys and API credentials:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Isolation of Secrets</strong>: All user credentials, encryption keys, and decryption modules live exclusively within the highly secure <code className="text-amber-400">authentication-service</code> and <code className="text-amber-400">promethea-guardian</code> applications.</li>
              <li><strong>Stateless Execution Mappings</strong>: The main orchestrator and the 54 economic methods never touch plaintext passwords, seed phrases, or private API keys.</li>
              <li><strong>The Cryptographic Consent Loop</strong>: When an economic method requires a transaction signature or API auth token, it dispatches an isolated payload request to the user&apos;s <code className="text-amber-400">promethea-guardian</code> service. The Guardian prompts the user via the local desktop interface or validates pre-authorized programmatic limits, signs the transaction, and returns a sanitized transaction hash or a short-lived token.</li>
            </ol>

            <hr className="my-12 border-white/10" />

            {/* Section 3.5 */}
            <h2 className="text-3xl font-black text-white mt-12 mb-6 flex items-center gap-3">
              <Layers className="w-8 h-8 text-amber-400" />
              <span>Section 3.5: UCC-Backed Real-World Asset Tokenization & Zero-Knowledge Citizen Attestations</span>
            </h2>
            <p className="mb-6">
              To establish physical sovereignty and enable true non-extractive wealth compounding, the Promethean Network State must bridge digital state-ledger representations with physical-world real estate, tangible commodities, and legal jurisdictions. This bridge is secured by two integrated full-stack pipelines: <strong>UCC-Backed Real-World Asset (RWA) Tokenization</strong> and <strong>Zero-Knowledge (ZK) Citizen Attestations & Soulbound Passport Tokens (SBTs)</strong>.
            </p>
            <p className="mb-8">
              Underpinning these mechanics is the <strong>3-Body System</strong> architecture, which bifurcates capabilities across Body 1 (Static Client / IPFS), Body 2 (Dynamic Host / Ledger Core), and Body 3 (Local Edge Store / DepthOS Bridge at <code className="text-amber-400">localhost:9999</code>). This tri-partite decoupling guarantees absolute privacy and regulatory resilience: private documents and raw keys never traverse the public network, while on-chain smart contracts maintain mathematically certifiable public evidence of legal and physical conformity.
            </p>

            <h3 className="text-2xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
              <Landmark className="w-6 h-6 text-amber-400" />
              <span>I. End-to-End UCC-Backed RWA Tokenization Pipeline</span>
            </h3>
            <p className="mb-6">
              Traditional real-world asset tokenization platforms introduce third-party custodian risk, rely on opaque legal trust structures, and extract hefty transaction fees. The PCES eliminates these vectors by integrating state-level <strong>Uniform Commercial Code (UCC)</strong> registries directly with programmatic on-chain contracts.
            </p>

            <h4 className="text-lg font-bold text-white mt-6 mb-2">A. Legal Grounding: UCC Article 12 & Controllable Electronic Records (CER)</h4>
            <p className="mb-6">
              The tokenization engine structures fractionalized real-world assets to conform legally as <strong>Controllable Electronic Records (CERs)</strong> under <strong>UCC Article 12</strong>. Under this legal framework, a digital token is recognized as a direct legal representation of the underlying asset if a party can demonstrate &quot;control&quot; of the record. The PCES establishes control via private key signatures, allowing the transfer of tokens on the sovereign ledger to legally constitute the transfer of title and property claims under state-level digital asset amendments.
            </p>

            <h4 className="text-lg font-bold text-white mt-6 mb-2">B. The Automated Legal Filing & Lien Search Coprocessor (ucc-coprocessor.ts)</h4>
            <p className="mb-6">
              To automate legal perfection, the core orchestrator invokes the <code className="text-amber-400">ucc-coprocessor.ts</code> service, a Genkit-backed AI agent that interfaces with state registries via high-throughput, low-cost API integrations:
            </p>
            <ul className="list-disc pl-6 space-y-4 mb-6">
              <li>
                <strong>Cobalt Intelligence API (Lien Discovery)</strong>: Prior to minting any fractional asset token, the coprocessor runs an automated query targeting state registries (e.g., Wyoming, Delaware) utilizing Cobalt&apos;s lookup engines ($0.50–$2.00 per search, enforcing <code className="text-amber-400">uccData=true</code>). This verifies that the underlying asset is completely free and clear of prior liens, mortgages, or encumbrances.
              </li>
              <li>
                <strong>Ficoso API (State Filing)</strong>: Once cleared, the coprocessor drafts a standardized <strong>UCC-1 Financing Statement</strong> in XML/JSON format, mapping the physical asset (demarcated by boundary surveys, physical address, and hardware serials) to the network&apos;s specialized SPV (Special Purpose Vehicle) and the citizen&apos;s decentralized identifier (DID). This statement is programmatically submitted via Ficoso&apos;s transactional API endpoints (leveraging its free California Sandbox for staging and continuous integration testing before promotion to mainnet registries).
              </li>
              <li>
                <strong>Direct Open Government API Aggregation</strong>: To eliminate intermediary toll fees, the coprocessor dynamically cascades to direct open state APIs (such as Washington State&apos;s Free Secretary of State Search API) where available.
              </li>
            </ul>

            {/* Sequence Diagram Representation */}
            <div className="my-8 p-6 bg-black/40 border border-white/5 rounded-xl font-mono text-[9px] text-amber-300 flex flex-col items-center overflow-x-auto">
              <div className="font-sans text-[11px] font-bold text-zinc-400 mb-4 uppercase tracking-widest">3-Body System UCC Tokenization Sequence</div>
              <div>Citizen/DID         Edge Store (B3)       Static Client (B1)     Dynamic Host (B2)     State APIs (Cobalt)    Blockchain</div>
              <div>    │                       │                      │                      │                     │                 │</div>
              <div>    │─── 1. Initiate ───────&gt;                      │                      │                     │                 │</div>
              <div>    │                       │&lt;─── 2. Request Sign ─│                      │                     │                 │</div>
              <div>    │                       │─── 3. Return Sign ──&gt;│                      │                     │                 │</div>
              <div>    │                       │                      │─── 4. Payload/Meta ─&gt;│                     │                 │</div>
              <div>    │                       │                      │                      │─── 5. Lien Search ─&gt;│                 │</div>
              <div>    │                       │                      │                      │&lt;─── 6. Clear ───────│                 │</div>
              <div>    │                       │                      │                      │─── 7. File UCC-1 ──&gt;│                 │</div>
              <div>    │                       │                      │                      │&lt;─── 8. Filing CID ──│                 │</div>
              <div>    │                       │                      │                      │─── 9. Commit State ─│                 │</div>
              <div>    │                       │                      │                      │─── 10. Mint UCC ────────────────────&gt;│</div>
              <div>    │&lt;────────────────────────────────────── 11. UCC Article 12 CER Token ────────────────────────────────────────│</div>
            </div>

            <h4 className="text-lg font-bold text-white mt-6 mb-2">C. The On-Chain Legal Registry (UCCRegistry.sol)</h4>
            <p className="mb-6">
              Once the state registry acknowledges the filing and returns a filing hash (CID), the <em>Dynamic Host</em> invokes the <code className="text-amber-400">UCCRegistry.sol</code> smart contract on the public EVM ledger. This contract:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8">
              <li>Maps the active token contract address to its corresponding UCC-1 filing document hash, corporate resolutions, and SPV certificates.</li>
              <li>Enforces transfer restrictions, blocking secondary token transactions to any wallet DID that does not contain a verified Soulbound Passport Token (SBT), maintaining strict compliance with UCC Article 8 and SEC guidelines.</li>
            </ul>

            <h3 className="text-2xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-400" />
              <span>II. Privacy-Preserving Zero-Knowledge (ZK) Citizen Attestations</span>
            </h3>
            <p className="mb-6">
              A network state requires a robust census model to enforce Sybil resistance, manage voting power, and gate real-world asset distributions. However, uploading raw passports, birth certificates, or municipal utility bills to a public database compromises citizen safety and sovereignty. The PCES resolves this with a <strong>Zero-Knowledge (ZK) Attestation Pipeline</strong> operated entirely on the user&apos;s local hardware (Body 3).
            </p>

            <h4 className="text-lg font-bold text-white mt-6 mb-2">A. The Local Legal Vault & Local Encryption</h4>
            <p className="mb-6">
              Private government-issued identity documents are dragged and dropped onto the frontend viewport (<code className="text-amber-400">passport.tsx</code>). Instead of traversing the network, the file-drop handler redirects the raw payload to the local <code className="text-amber-400">zk-identity-service.ts</code> running inside the local edge store on <code className="text-amber-400">localhost:9999</code>:
            </p>

            {/* AES-GCM-256 FORMULA CARD */}
            <div className="my-12 p-8 bg-gradient-to-br from-cyan-950/40 to-background/50 border border-amber-500/30 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(245, 158, 11,0.15)] flex flex-col items-center justify-center text-center group hover:border-amber-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              <div className="font-mono text-amber-400 text-[10px] uppercase tracking-widest mb-4 font-black">Formula 3.1: On-Edge AES-GCM-256 Document Encryption</div>
              
              <div className="text-xl md:text-2xl tracking-wide text-white py-6 flex items-center justify-center flex-wrap gap-1 select-all font-serif">
                <span className="font-sans text-sm text-zinc-300 bg-white/5 px-2.5 py-1 rounded border border-white/10 font-bold uppercase tracking-wider mx-1">Ciphertext</span>
                <span className="text-amber-500 font-sans mx-2">=</span>
                <span className="font-sans text-sm text-amber-300 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 font-bold uppercase tracking-wider mr-1">AES-GCM-256</span>
                <span className="text-zinc-500 font-sans mr-1">(</span>
                <span className="font-sans text-xs text-zinc-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-bold">Raw Document</span>
                <span className="text-zinc-500 font-sans mx-1.5">,</span>
                <span className="font-serif italic text-amber-100 text-sm">K<sub className="italic text-[10px] text-amber-300">seed</sub></span>
                <span className="text-zinc-500 font-sans mx-1.5">,</span>
                <span className="font-sans text-xs text-zinc-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-bold">IV</span>
                <span className="text-zinc-500 font-sans ml-1">)</span>
              </div>
              
              <div className="mt-4 text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed border-t border-white/5 pt-4">
                Where <span className="font-serif italic text-amber-300">K<sub>seed</sub></span> represents the user&apos;s master keystore derivation seed and <span className="font-sans text-xs bg-white/5 px-1.5 py-0.5 rounded text-zinc-300 border border-white/5 font-bold">IV</span> is a cryptographically strong, non-repeating initialization vector. This ciphertext is saved strictly inside the user&apos;s local edge store.
              </div>
            </div>

            <p className="mb-6">
              The local node then parses the decrypted file structure on-edge to extract metadata parameters (date of birth, country, unique serials). It compiles these components into a standardized W3C-compliant Verifiable Credential (VC) and generates local cryptographic attribute proofs.
            </p>

            <h4 className="text-lg font-bold text-white mt-6 mb-2">B. The Soulbound Passport Token (SovereignIdentity.sol)</h4>
            <p className="mb-6">
              To register citizenship on-chain, the local node dispatches the generated ZK attribute proofs to the authorized Network Notary or decentralized Identity Stewards. Upon verification of the proof&apos;s validity, the steward signs an attestation payload, triggering the <code className="text-amber-400">SovereignIdentity.sol</code> smart contract to mint a non-transferable <strong>Soulbound Passport Token (SBT)</strong> directly to the citizen&apos;s DID. This guarantees no-leak verification: public contracts confirm verified citizenship status without disclosing any names, addresses, or passport numbers, forming the vital core of TPNS Sybil-resistance.
            </p>

            <h4 className="text-lg font-bold text-white mt-6 mb-2">C. Quadratic Voting and the Voice Metric</h4>
            <p className="mb-6">
              To protect the Network State from plutocratic captures, voting weight is not proportional to token holdings. Instead, it relies on a non-linear <strong>Quadratic Voting Power (Voice)</strong> calculation. A citizen&apos;s voice is calculated as the square root of their verified accumulated reputation score, provided they hold an active Soulbound Passport Token (SBT) in their DID wallet:
            </p>

            {/* QUADRATIC VOTING POWER CARD */}
            <div className="my-12 p-8 bg-gradient-to-br from-cyan-950/40 to-background/50 border border-amber-500/30 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(245, 158, 11,0.15)] flex flex-col items-center justify-center text-center group hover:border-amber-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              <div className="font-mono text-amber-400 text-[10px] uppercase tracking-widest mb-4 font-black">Formula 3.2: Non-Linear Quadratic Voting Power (Voice)</div>
              
              <div className="text-xl md:text-2xl tracking-wide text-white py-6 flex items-center justify-center flex-wrap gap-1 select-all font-serif">
                <span className="font-sans text-sm text-zinc-300 bg-white/5 px-2.5 py-1 rounded border border-white/10 font-bold uppercase tracking-wider mx-1">Citizen Voting Power (Voice)</span>
                <span className="text-amber-500 font-sans mx-2">=</span>
                <span className="flex items-center text-white">
                  <span className="text-3xl md:text-4xl font-light text-amber-400 leading-none">√</span>
                  <span className="border-t border-white/40 px-3 pt-1.5 pb-1 -ml-1 font-sans text-sm text-amber-100 bg-amber-500/10 border border-amber-500/20 font-bold uppercase tracking-wider">
                    Accumulated Reputation
                  </span>
                </span>
                <span className="text-zinc-400 font-sans text-xs ml-3 italic">if SBT ∈ Wallet</span>
              </div>
              
              <div className="mt-4 text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed border-t border-white/5 pt-4">
                If the Soulbound Passport Token (SBT) is absent from the user&apos;s wallet, their active voting power (<span className="italic font-bold text-amber-300">Voice</span>) defaults strictly to <span className="font-mono text-amber-300 font-bold">0</span>, preventing unregistered or Sybil accounts from skewing state-level assemblies.
              </div>
            </div>

            <div className="my-8 p-6 bg-black/40 border border-white/5 rounded-xl font-mono text-[9px] text-amber-300 flex flex-col items-center overflow-x-auto mb-12">
              <div className="font-sans text-[11px] font-bold text-zinc-400 mb-4 uppercase tracking-widest">Privacy-Preserving Local Vault to Public Ledger Handshake</div>
              <div>[Local Hardware Boundary (localhost:9999)]</div>
              <div>  [Raw Govt ID] ──&gt; [AES-GCM-256 Encryption] ──&gt; (Private Local Vault)</div>
              <div>         │</div>
              <div>         └──&gt; [ZK-Proof Generator]</div>
              <div>                     │</div>
              <div>                     ▼ (ZK Attribute Proof)</div>
              <div> ─────────────────────────────────────────────────────────────────────────────</div>
              <div>[Public Ledger Boundary]</div>
              <div>                     │</div>
              <div>                     ▼</div>
              <div>             [Identity Stewards] ──&gt; (Attestation Signature)</div>
              <div>                                               │</div>
              <div>                                               ▼</div>
              <div>                                     [SovereignIdentity.sol]</div>
              <div>                                               │</div>
              <div>                                               ▼ (Mints Soulbound Passport Token SBT)</div>
              <div>                                       [Democratic Quadratic Governance]</div>
              <div>                                       [Non-Linear Voting Power (Voice)]</div>
            </div>

            <hr className="my-12 border-white/10" />

            {/* Section 4 */}
            <h2 className="text-3xl font-black text-white mt-12 mb-6 flex items-center gap-3">
              <Cpu className="w-8 h-8 text-amber-400" />
              <span>Section 4: Master Directory of the 54 Active Economic Methods</span>
            </h2>
            <p>
              Every micro-economic process extends a standardized <code className="text-amber-400">BaseMethod</code> class, running in active execution loops, checking telemetry constraints, and reporting realized profits to the reserve manager.
            </p>

            {/* Categories */}
            
            <h3 className="text-xl font-bold text-amber-400 mt-8 mb-4">Category A: Content, Brand & Narrative Refineries (Zero-Cost / Passive)</h3>
            <div className="overflow-x-auto mb-8 border border-white/10">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-3 font-mono font-bold text-white">Identifier</th>
                    <th className="p-3 font-mono font-bold text-white">Tier</th>
                    <th className="p-3 font-mono font-bold text-white">Priority</th>
                    <th className="p-3 font-mono font-bold text-white">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 font-bold text-white">seo-blog.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">9</td>
                    <td className="p-3 text-zinc-400">Generates visionary articles, publishes to Substack, embeds Solana Blinks for tips.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">newsletter.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">8</td>
                    <td className="p-3 text-zinc-400">Compiles high-density macro-financial and regulatory research reports for premium subscribers.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">brand-copywriter.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Writes marketing assets, descriptions, and promotional materials for corporate B2B clients.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">video-scripts.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">4</td>
                    <td className="p-3 text-zinc-400">Outlines educational, pacing-optimized, and algorithmic-receptive scripts for YouTube creators.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">niche-affiliate.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Compiles curated reviews with active affiliate referral links to harvest passive commission.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">content-curation.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Aggregates and filters industry-relevant news, generating annotated daily sector summaries.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">technical-translation.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">4</td>
                    <td className="p-3 text-zinc-400">Translates technical documentation, manuals, and code comments into localized languages.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold text-amber-400 mt-8 mb-4">Category B: High-Value Technical & Consulting Services (B2B SaaS)</h3>
            <div className="overflow-x-auto mb-8 border border-white/10">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-3 font-mono font-bold text-white">Identifier</th>
                    <th className="p-3 font-mono font-bold text-white">Tier</th>
                    <th className="p-3 font-mono font-bold text-white">Priority</th>
                    <th className="p-3 font-mono font-bold text-white">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 font-bold text-white">contract-audit.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">8</td>
                    <td className="p-3 text-zinc-400">Executes static AST analysis and semantic vulnerability checks on smart contracts for clients.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">bug-bounty.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">7</td>
                    <td className="p-3 text-zinc-400">Crawls public repos and active bounty hubs to spot flaws, generating POC write-ups.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">documentation-service.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Parses client repo directories to build structured developer guides and API references.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">resume-optimization.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">4</td>
                    <td className="p-3 text-zinc-400">Optimizes resume configurations against proprietary Applicant Tracking System (ATS) rankings.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">virtual-architect.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Translates requests into software architectures, database schemas, and Mermaid flow diagrams.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">legal-prompts.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Aggregates zoning and corporate rules to draft Terms of Service and regulatory filings.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">contract-deployer.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">4</td>
                    <td className="p-3 text-zinc-400">Automates compilation, deployment, and block explorer verification of tokens, NFTs, and escrows.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold text-amber-400 mt-8 mb-4">Category C: Quantitative DeFi & On-Chain Yield Engines</h3>
            <div className="overflow-x-auto mb-8 border border-white/10">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-3 font-mono font-bold text-white">Identifier</th>
                    <th className="p-3 font-mono font-bold text-white">Tier</th>
                    <th className="p-3 font-mono font-bold text-white">Priority</th>
                    <th className="p-3 font-mono font-bold text-white">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 font-bold text-white">carry-trade-execution.ts</td>
                    <td className="p-3 text-red-400">HIGH_RISK</td>
                    <td className="p-3">9</td>
                    <td className="p-3 text-zinc-400">Leverages yield spreads (borrowing low-yield assets, lending high-yield DeFi indexes).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">liquidity-provision.ts</td>
                    <td className="p-3 text-red-400">HIGH_RISK</td>
                    <td className="p-3">8</td>
                    <td className="p-3 text-zinc-400">Deploys concentrated liquidity into AMM bins around spot prices to harvest fees.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">leveraged-staking.ts</td>
                    <td className="p-3 text-red-400">HIGH_RISK</td>
                    <td className="p-3">7</td>
                    <td className="p-3 text-zinc-400">Loops Liquid Staking Tokens inside lending protocols to multiply staking APR.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">airdrop-farming.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Routinely interacts with non-tokenized protocols on Base and Solana to farm future drops.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">mev-executor.ts</td>
                    <td className="p-3 text-red-400">HIGH_RISK</td>
                    <td className="p-3">8</td>
                    <td className="p-3 text-zinc-400">Monitors transaction mempools to execute backrunning arbitrage or defend treasury.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">liquidation-bot.ts</td>
                    <td className="p-3 text-red-400">HIGH_RISK</td>
                    <td className="p-3">8</td>
                    <td className="p-3 text-zinc-400">Triggers liquidation orders on undercollateralized accounts on borrow/lend markets.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">dex-oracle.ts</td>
                    <td className="p-3 text-red-400">HIGH_RISK</td>
                    <td className="p-3">7</td>
                    <td className="p-3 text-zinc-400">Exploits pricing differences of identical token pairs across decentralized exchanges.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">prediction-markets.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Parses global macro feeds to take high-probability positions on Polymarket.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">nft-floor-skating.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Sweeps utility NFTs listed below historical floor curves, listing them for quick flips.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">ens-flipping.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">4</td>
                    <td className="p-3 text-zinc-400">Appraises, registers, and flips high-value Web2 domains or Web3 ENS/.sol identifiers.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">governance-bribe.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Votes on yield gauges in exchange for governance bribes (Votium, Warden).</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold text-amber-400 mt-8 mb-4">Category D: Spatial, Physical & Environmental Refineries (RWAs)</h3>
            <div className="overflow-x-auto mb-8 border border-white/10">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-3 font-mono font-bold text-white">Identifier</th>
                    <th className="p-3 font-mono font-bold text-white">Tier</th>
                    <th className="p-3 font-mono font-bold text-white">Priority</th>
                    <th className="p-3 font-mono font-bold text-white">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 font-bold text-white">bio-node.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">4</td>
                    <td className="p-3 text-zinc-400">Polls regional meteorological feeds. Triggers restoration proposals if targets are breached.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">real-estate-tokenization.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">7</td>
                    <td className="p-3 text-zinc-400">Audits physical boundary surveys and land titles to mint tokenized property claims.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">real-estate-refinery.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Analyzes public spatial datasets, county recorders, and zoning files to spot undervalued parcels.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">land-scanner.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Processes topographic data and maps to appraise solar, agricultural, and build potential.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">manufacturing.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">4</td>
                    <td className="p-3 text-zinc-400">Schedules local 3D printing and hardware fabrication runs across connected hardware nodes.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">supply-chain.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Schedules hardware part deliveries, optimizing lead times for network physical deploys.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">energy-credits.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Commands connected backup battery arrays to discharge power back to grid during peak demand.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold text-amber-400 mt-8 mb-4">Category E: Infrastructure, DePIN & Compute Arbitrage</h3>
            <div className="overflow-x-auto mb-8 border border-white/10">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-3 font-mono font-bold text-white">Identifier</th>
                    <th className="p-3 font-mono font-bold text-white">Tier</th>
                    <th className="p-3 font-mono font-bold text-white">Priority</th>
                    <th className="p-3 font-mono font-bold text-white">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 font-bold text-white">compute-arbitrage.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">8</td>
                    <td className="p-3 text-zinc-400">Rents idle hardware compute power to decentralized training clusters and networks.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">depin-storage.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">7</td>
                    <td className="p-3 text-zinc-400">Dedicates storage arrays to Filecoin/Arweave to earn network protocol tokens.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">depin-bandwidth.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">7</td>
                    <td className="p-3 text-zinc-400">Sells spare network bandwidth by routing traffic through secure residential proxies.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">rpc-provider.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Rents programmatic access to highly available private blockchain RPC endpoints.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">mcp-tools.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Licenses dedicated Model Context Protocol (MCP) servers to external enterprise AI agents.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold text-amber-400 mt-8 mb-4">Category F: Administrative, Community Operations & SaaS</h3>
            <div className="overflow-x-auto mb-8 border border-white/10">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-3 font-mono font-bold text-white">Identifier</th>
                    <th className="p-3 font-mono font-bold text-white">Tier</th>
                    <th className="p-3 font-mono font-bold text-white">Priority</th>
                    <th className="p-3 font-mono font-bold text-white">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 hover:divide-white/10">
                  <tr>
                    <td className="p-3 font-bold text-white">micro-saas.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Offers niche developer utilities (e.g. formatters, API scrapers), charging per-call.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">payment-gateway.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">7</td>
                    <td className="p-3 text-zinc-400">Processes merchant checkouts, collecting a minor 0.15% toll on transactions.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">discord-mod.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Autonomously moderates partner communities, running verification and spam screening.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">data-scraping.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Automatically extracts, structures, and sells high-density web data to research groups.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">synthetic-data.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Synthesizes and formats clean chat dialogues and code datasets to train LLMs.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">research-report.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Generates dense financial and regulatory reports to sell to corporate subscribers.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">stock-analysis.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Evaluates stock tickers to construct automated stock correlation and risk metrics.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">stock-assets.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Packages real-time corporate dividend calendars and schedules into developer feeds.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">settlement-processor.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Coordinates multi-party invoice creation and programmatic receivables settlement.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">snapshot-services.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Signs and anchors cryptographically sealed snapshots of the database state onto public chains.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">agent-marketplace.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Builds and licenses custom GPTs and autonomous templates onto public directories.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">agentic-governance.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Analyzes voter profiles, ballot distributions, and quadratic voting outcomes.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">grant-automation.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Crawls foundation databases to match and auto-draft grant application files.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">oracle-expansion.ts</td>
                    <td className="p-3 text-yellow-300">LOW_RISK</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Injects localized physical telemetry datasets into public oracle chains.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">diplomatic-session.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">5</td>
                    <td className="p-3 text-zinc-400">Establishes secure workspaces and registers cooperation treaties across network states.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">market-sentiment.ts</td>
                    <td className="p-3 text-amber-300">ZERO_COST</td>
                    <td className="p-3">6</td>
                    <td className="p-3 text-zinc-400">Feeds sentiment metrics extracted via LLM sentiment analysis directly into vector maps.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr className="my-12 border-white/10" />

            {/* Section 5 */}
            <h2 className="text-3xl font-black text-white mt-12 mb-6 flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-amber-400" />
              <span>Section 5: Compounding Tokenomics & The Metabolic Reflex</span>
            </h2>
            <p>
              To secure long-term capital compounding and protect sovereign infrastructure without extracting funds from citizens, the PCES implements a strict, mathematical distribution pipeline inside <code className="text-amber-400">reserve-manager.ts</code>.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">A. The Compounding Splits</h3>
            <p>
              Every economic method that realizes a net profit (<code className="text-amber-400">P</code>) dispatches a transaction call to the reserve manager. The funds are automatically routed:
            </p>
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <strong>Sovereign Transaction Toll</strong>: If a transaction runs through the public merchant checkout, a micro-toll rate (<code className="text-amber-400">T<sub>toll</sub></code>) of <strong>0.15%</strong> is deducted directly to fund operational server gas:
              </li>
            </ol>

            {/* TOLL FORMULA CARD */}
            <div className="my-12 p-8 bg-gradient-to-br from-emerald-950/40 to-background/50 border border-amber-500/30 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(245, 158, 11,0.15)] flex flex-col items-center justify-center text-center group hover:border-amber-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              <div className="font-mono text-amber-400 text-[10px] uppercase tracking-widest mb-4 font-black">Formula 5.1: Non-Extractive Sovereign Transaction Toll</div>
              
              <div className="text-2xl md:text-3xl tracking-wide text-white py-6 flex items-center justify-center gap-1 select-all font-serif">
                <span className="font-serif italic font-bold text-orange-100">P<sub className="text-xs text-amber-300">net</sub></span>
                <span className="text-amber-500 font-sans mx-2">=</span>
                <span className="font-serif italic font-bold text-orange-100">P</span>
                <span className="text-amber-500 font-sans mx-2">&minus;</span>
                <span className="text-zinc-400 font-sans">(</span>
                <span className="font-serif italic font-bold text-orange-100">P</span>
                <span className="text-amber-500 mx-1">&middot;</span>
                <span className="font-mono text-amber-300 font-bold text-xl md:text-2xl">0.0015</span>
                <span className="text-zinc-400 font-sans">)</span>
              </div>
              
              <div className="mt-4 text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed border-t border-white/5 pt-4">
                Where <span className="font-serif italic text-amber-300">P</span> represents raw realized method revenues, <span className="font-serif italic text-amber-300">P<sub className="italic">net</sub></span> represents net revenues routed to investors and splits, and the constant <span className="font-mono text-amber-400 font-bold">0.0015</span> (0.15%) constitutes the non-extractive transaction toll for system gas.
              </div>
            </div>

            <p className="mt-4 mb-8">
              This transaction fee is designed purely to cover global server hosting costs, cloud database compute limits, and metadata node gas, and is dynamically calibrated to match active infrastructure overhead. By focusing on volume-based compounding micro-tolls rather than extractive access tariffs or paywalled membership barriers, the platform remains free and accessible to all citizens, aligning the state&apos;s self-funding utility directly with transaction velocity.
            </p>

            <ol className="list-decimal pl-6 space-y-4" start={2}>
              <li>
                <strong>Senior Investor Seniority Hurdle Check</strong>: The system maintains a cumulative <strong>8% senior hurdle</strong> (<code className="text-amber-400">H = 0.08</code>) for external capital lenders. Until this hurdle is fully satisfied, 100% of realized profits are directed to the Investor Settlement Vault.
              </li>
              <li>
                <strong>The Sovereign Plowback Split</strong>: Once senior hurdles are clear, the net profit is subdivided programmatically:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Plowback Rate (30%)</strong>: Allocated directly to the <strong>Sovereign Reserve Wallet</strong> to compound the liquidity base for land acquisition and DePIN server deployments.</li>
                  <li><strong>Citizen Tithe (10%)</strong>: Routed to the Community Grants Pool to fund citizen-led R&D and social programs.</li>
                  <li><strong>Planetary Restoration (5%)</strong>: Directed to the Environmental Remediation account to execute physical geo-restoration.</li>
                  <li><strong>Remaining Yield (55%)</strong>: Distributed to active Labor DIDs (both human and model) proportional to their verified contributions.</li>
                </ul>
              </li>
            </ol>

            <h3 className="text-xl font-bold text-white mt-12 mb-4">B. The Metabolic Reflex & Zero-Tax Security</h3>
            <p>
              The vital core of the PCES is the <strong>Metabolic Reflex</strong>. In periods of low transaction velocity or system-wide market contractions, the system must not collapse. 
              If an operating hosting invoice (such as Vercel/GCP compute overhead) is parsed, the reserve manager checks current liquid balances:
            </p>

            {/* METABOLIC FORMULA CARD */}
            <div className="my-12 p-8 bg-gradient-to-br from-amber-950/40 to-background/50 border border-amber-500/30 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col items-center justify-center text-center group hover:border-amber-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              <div className="font-mono text-amber-400 text-[10px] uppercase tracking-widest mb-4 font-black">Rule 5.2: Metabolic Sweep Condition</div>
              
              <div className="text-xl md:text-2xl tracking-wide py-6 flex items-center justify-center gap-1 select-all font-sans">
                <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-1 border border-amber-500/20 uppercase tracking-widest font-black mr-2">Trigger Condition</span>
                <span className="font-sans font-bold text-white bg-white/5 px-3 py-1.5 border border-white/10 rounded">Liquid Cash</span>
                <span className="text-amber-500 text-2xl font-light mx-3">&lt;</span>
                <span className="font-sans font-bold text-white bg-white/5 px-3 py-1.5 border border-white/10 rounded">Invoice Balance</span>
              </div>
              
              <div className="mt-4 text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed border-t border-white/5 pt-4">
                Triggers an autonomous waterfall sweep of liquid DeFi and on-chain yield assets to Coinbase ADV Trade, settling B2B administrative invoices automatically without manual citizen taxing or administrative overhead.
              </div>
            </div>

            <p>
              By harvesting yield and executing automated micro-rebalancing across global markets, <strong>the system remains fully funded without ever imposing a physical tax on its citizens.</strong>
            </p>

            <h3 className="text-xl font-bold text-white mt-12 mb-4">C. Thermodynamic Degradation Accounting</h3>
            <p>
              Physical economic methods — including <code className="text-amber-400">manufacturing.ts</code> (3D-print runs) and <code className="text-amber-400">energy-credits.ts</code> (battery array discharge cycles) — are subject to entropy: materials degrade, tolerances tighten, and components wear. Left unpriced, this degradation constitutes a hidden subsidy that masks the true cost of production and allows the network to spend down its physical capital without visibility.
            </p>
            <p className="mt-4">
              To close this accounting gap, the <code className="text-amber-400">BaseMethod</code> class enforces a <strong>Thermodynamic Degradation Tax</strong> on every physical execution cycle:
            </p>

            {/* DEGRADATION FORMULA CARD */}
            <div className="my-12 p-8 bg-gradient-to-br from-rose-950/40 to-background/50 border border-amber-500/30 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col items-center justify-center text-center group hover:border-amber-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              <div className="font-mono text-amber-400 text-[10px] uppercase tracking-widest mb-4 font-black">Formula 5.3: Thermodynamic Cycle Cost (Entropy Accounting)</div>
              
              <div className="text-2xl md:text-3xl tracking-wide text-white py-6 flex items-center justify-center flex-wrap gap-1 select-all font-serif">
                <span className="font-sans font-bold text-amber-100 mr-2">Cycle Cost</span>
                <span className="text-amber-500 font-sans mx-2">=</span>
                <span className="font-sans font-bold text-amber-100">Base Material Cost</span>
                <span className="text-amber-400 mx-2">&middot;</span>
                <span className="text-zinc-400 font-sans">(</span>
                <span className="font-mono text-amber-300 font-bold text-xl md:text-2xl">1</span>
                <span className="text-amber-500 font-sans mx-1">+</span>
                <span className="font-serif italic text-amber-100">&lambda;</span>
                <span className="text-zinc-400 font-sans">)</span>
                <sup className="font-sans font-bold text-amber-400 text-lg ml-1">cycle_count</sup>
              </div>
              
              <div className="mt-4 text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed border-t border-white/5 pt-4">
                Where <span className="font-serif italic text-amber-300">&lambda;</span> is the per-cycle material degradation coefficient (default: <span className="font-mono text-amber-400 font-bold">0.02</span>, i.e. 2% compounding entropy per cycle) and <span className="font-mono text-amber-300">cycle_count</span> is the total number of physical executions on the current hardware unit. This cost is passed directly to the <code className="text-amber-400">reserve-manager.ts</code> as a mandatory equipment-replacement allocation, raising the effective floor price of late-cycle physical goods and ensuring the reserve can absorb hardware replacement without citizen taxation.
              </div>
            </div>

            <p>
              This mechanism prices entropy transparently into every physical transaction. Equipment that has run 100 print cycles automatically costs more than a fresh unit — and the difference is set aside, compounding into a <strong>Physical Asset Replacement Reserve</strong> that funds the next generation of fabricators without emergency capital calls.
            </p>

            <hr className="my-12 border-white/10" />

            {/* Section 6 */}
            <h2 className="text-3xl font-black text-white mt-12 mb-6 flex items-center gap-3">
              <Cpu className="w-8 h-8 text-amber-400" />
              <span>Section 6: Frontend Cockpit & Spatial Navigation (Site Maps & Grids)</span>
            </h2>
            <p>
              The visual representation of this sovereign engine must be premium, highly interactive, and clear. This section defines the responsive layout systems, HSL color tokens, page architectures, and design grids.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">A. Core Visual Design System (CSS Variables)</h3>
            <p>
              The visual layout relies on a modern <strong>Glassmorphic Grid System</strong> with deep backdrop blurs, rich gradients, and three distinct telemetry spectra (Green for Ledger, Amber for Alerts, Cyan for Reasoning).
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">B. High-Fidelity 12-Column Responsive Grid System</h3>
            <p>
              The core layouts are built on a strict <strong>12-column CSS Grid</strong> with responsive breakpoints that collapse gracefully on mobile devices.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">C. The Sovereign Navigation Site Map</h3>
            <p>
              The Network State visual cockpit maps its workflows across four primary coordinate quadrants, which can be selected via the interactive sidebar navigation:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong><code className="text-amber-400">/dashboard</code> (The Sovereign Overview)</strong>: Provides a unified real-time pulse of the Network State including metabolic health indexes and active proposal trackers.</li>
              <li><strong><code className="text-amber-400">/treasury</code> (The Cash & Ledger Substrate)</strong>: Displays real-time on-chain balances and the Waterfall Protocol sweep visualization tool.</li>
              <li><strong><code className="text-amber-400">/exchange</code> (The 54-Method Micro-Market)</strong>: Renders an interactive matrix of all active profit-generating models with deep-dive performance cards.</li>
              <li><strong><code className="text-amber-400">/will</code> (Reputation & Constitutional Governance)</strong>: Features the Quadratic Voting layout, permitting citizens to sign on-chain votes using cryptographic wallet keys.</li>
              <li><strong><code className="text-amber-400">/security</code> (The Immune Radar & Logs)</strong>: Visualizes localized server telemetry (CPU/MEM/Thermal) and active database size maps.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-12 mb-4">D. Detailed Page Wireframe & Layout Grids (The Will Blueprint)</h3>
            <p>
              This section maps out the exact CSS Grid Column Spans for the Sovereign Will page.
            </p>

            {/* QUADRATIC VOTING CARD */}
            <div className="my-12 p-8 bg-gradient-to-br from-cyan-950/40 to-background/50 border border-amber-500/30 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(245, 158, 11,0.15)] flex flex-col items-center justify-center text-center group hover:border-amber-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              <div className="font-mono text-amber-400 text-[10px] uppercase tracking-widest mb-4 font-black">Formula 6.1: Non-Linear Quadratic Voting Cost</div>
              
              <div className="text-2xl md:text-3xl tracking-wide text-white py-6 flex items-center justify-center gap-1 select-all font-serif">
                <span className="font-sans font-bold text-amber-100 mr-2">Credits Required</span>
                <span className="text-amber-500 font-sans mx-2">=</span>
                <span className="text-zinc-400 font-sans">(</span>
                <span className="font-sans font-bold text-amber-100">Allocated Votes</span>
                <span className="text-zinc-400 font-sans">)</span>
                <sup className="text-xl text-amber-400 font-bold ml-1 font-sans">2</sup>
              </div>
              
              <div className="mt-4 text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed border-t border-white/5 pt-4">
                Enforces a quadratic scaling rate to diminish the voting dominance of single wealthy actors, thereby preserving democratic consensus and enabling decentralized, sybil-resistant alignment across Network State assemblies.
              </div>
            </div>

            <hr className="my-12 border-white/10" />

            {/* Section 7 */}
            <h2 className="text-3xl font-black text-white mt-12 mb-6 flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-400" />
              <span>Section 7: Verification & Continuous Auditability</span>
            </h2>
            <p>
              To maintain absolute credibility, the entire Cognitive-Economic Substrate is open and subject to real-time, programmatic auditing.
            </p>
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <strong>TypeScript Verification</strong>: Verifies that no type skew exists across the 54 active methods and our core orchestrators:
                <pre className="p-4 bg-black/50 text-amber-300 font-mono text-xs rounded-lg mt-2 overflow-x-auto border border-white/5">
                  npm --workspace=@promethea/economic-engine run typecheck
                </pre>
              </li>
              <li>
                <strong>Simulation Execution</strong>: Triggers simulated sandbox executions of our core quantitative trading and content generation processes:
                <pre className="p-4 bg-black/50 text-amber-300 font-mono text-xs rounded-lg mt-2 overflow-x-auto border border-white/5">
                  npx ts-node packages/services/economic-engine/src/simulate-method-1.ts
                </pre>
              </li>
              <li>
                <strong>Cryptographic Proof of Contribution</strong>: Every payment distribution is signed on-chain using private DID keys. This permits any member to verify that all token mints correspond directly to actual logged work.
              </li>
            </ol>

            <hr className="my-12 border-white/10" />

            {/* Section 8 */}
            <h2 className="text-3xl font-black text-white mt-12 mb-6 flex items-center gap-3">
              <Landmark className="w-8 h-8 text-amber-400" />
              <span>Section 8: The Federated Archipelago Exchange</span>
            </h2>
            <p>
              TPNS is open-source by design. Rather than treating forks and clones as a threat to network coherence, the <strong>Federated Archipelago Exchange</strong> protocol converts every new instance of TPNS into an additive node on a shared global decentralized exchange — transforming fragmentation into compounding liquidity.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">A. Clone Registration Protocol</h3>
            <p>
              Upon initialization, any fork of the TPNS codebase may register itself as a federated node by submitting a signed registration payload to the <strong>Federated Registry Contract</strong> (deployed on Solana SPL or an EVM L2).
              The payload must include:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li><strong>Verified UCC-1 Filing Receipt</strong>: A cryptographic hash of the Secretary of State filing confirmation returned by <code className="text-amber-400">ucc-coprocessor.ts</code> via the Cobalt API, proving the node&apos;s legal SPV exists and its asset liens are perfected.</li>
              <li><strong>Token Contract Address</strong>: The on-chain address of the node&apos;s own <code className="text-amber-400">UCCRegistry.sol</code> deployment, allowing the global exchange to route cross-node asset trades directly to the correct settlement contract.</li>
              <li><strong>Jurisdictional Metadata</strong>: The node&apos;s registered legal jurisdiction (e.g., Wyoming DUNA, Zanzibar ZDFZ), which the exchange uses to automatically route around regulatory friction by selecting the optimal settlement path.</li>
            </ol>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">B. Anti-Spam: Reputation-Weighted Staking</h3>
            <p>
              To prevent fraudulent or empty shell nodes from polluting the global exchange, listing requires a <strong>staked collateral threshold</strong> denominated in UVT or SOL. If a node defaults on obligations, is proven fraudulent via the on-chain arbitration layer (Kleros/Aragon), or fails to renew its UCC filing, the staked collateral is programmatically slashed and redistributed to affected counterparties via the <code className="text-amber-400">reserve-manager.ts</code> waterfall.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">C. Compounding Network Effects</h3>
            <p>
              Under this model, each new TPNS fork contributes to rather than competes with the parent network:
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Day-1 Liquidity Inheritance</strong>: A new community does not bootstrap a new DEX; it inherits the entire TPNS trading ledger, user base, and asset pool immediately upon registration.</li>
              <li><strong>Cross-Node Asset Trading</strong>: A citizen of the primary TPNS node can purchase fractional shares in a real estate RWA held by a Zanzibar clone, settling in USDC/SOL through the shared exchange routing table — with <code className="text-amber-400">daz-gateway-service.ts</code> marking all ZDFZ-registered entities with <code className="text-amber-400">federatedRoutingActive: true</code>.</li>
              <li><strong>Jurisdictional Resilience</strong>: If a single node faces regulatory enforcement in its home jurisdiction, the exchange automatically re-routes transactions through the least-friction registered node, ensuring the global exchange never goes dark due to a single-point regulatory event.</li>
              <li><strong>Infrastructure Fee Revenue</strong>: Clones that elect to use the parent node&apos;s hosted <code className="text-amber-400">daz-gateway-service.ts</code>, <code className="text-amber-400">ucc-coprocessor.ts</code>, and ZK-identity pipelines generate a micro-toll back to the primary reserve, creating an ongoing revenue stream that scales with the size of the federated network.</li>
            </ul>

            <hr className="my-12 border-white/10" />

            <h3 className="text-2xl font-bold text-white mt-16 mb-4">Conclusion</h3>
            <p className="text-base text-zinc-300 leading-relaxed mb-16">
              By implementing the Promethean Cognitive-Economic Substrate, the Network State moves from a purely theoretical model to a live, self-funding entity. Promethea bridges high-level artificial intelligence with decentralized financial infrastructure to construct an autonomous, zero-tax digital civilization that returns value back to its citizens. Through the Federated Archipelago Exchange, every open-source fork of TPNS becomes a tributary — expanding the network, deepening the liquidity pool, and strengthening jurisdictional resilience with each new node that joins.
            </p>

            <FilteredFeedPanel category="COGNITIVE_ECON" isClassicTheme={isClassicTheme} />

          </div>
        </motion.div>
      </div>
    </div>
  );
}
