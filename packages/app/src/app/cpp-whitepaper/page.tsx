'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, GitFork, Network, Zap, Shield, HelpCircle, ArrowRight, Share2, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

import { useMesh } from '@/components/providers/mesh-provider';
import FilteredFeedPanel from '@/components/FilteredFeedPanel';

const BirdsBackground = dynamic(() => import('../../components/ui/BirdsBackground'), { ssr: false });

export default function CPPWhitepaperPage() {
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
            <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest">Version 1.0.0 (Sovereign)</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40 uppercase">
            Conversational Pivot Protocol (CPP).
          </h1>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-8 text-zinc-400">
            A System-Agnostic Specification for Dynamic, Non-Linear Human-AI Conversational Flows & DSG Mind Map Canvas
          </h2>
          
          <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-600 dark:text-zinc-400">
            
            <h3 className="text-2xl font-bold text-white mt-12 mb-4">Executive Summary</h3>
            <p className="mb-6">
              Traditional chat interfaces suffer from <strong>Synchronous Lock-In</strong>. When a user sends a message, they lose the ability to modify, expand, or redirect their thought mid-stream without starting a new chat turn. Traditional chats are restricted to linear, sequential arrays of messages.
            </p>
            <p className="mb-6">
              The <strong>Conversational Pivot Protocol (CPP)</strong> is an architectural paradigm designed to transition chat interfaces from linear timelines to a <strong>Directed Semantic Graph (DSG)</strong>. By structuring conversations as branches and nodes, CPP enables asynchronous human input, mid-stream stream-interruption pivoting, retroactive historical anchoring, and interactive spatial visualization.
            </p>
            <p className="mb-6">
              In this document, we also detail the <strong>DSG Mind Map Canvas Plan</strong>, which visualizes these multi-threaded, parallel futures on a high-fidelity interactive spatial layout, and outline our commitment to release this protocol as a free, open-source SDK available on npm, Homebrew, and GitHub.
            </p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">1. Traditional Linear Chat vs. Directed Semantic Graph (DSG)</h3>
            <p className="mb-6">
              Under traditional paradigms, messages are appended sequentially:
            </p>
            <div className="bg-black/45 p-6 rounded-lg border border-zinc-850 font-mono text-xs mb-6 text-zinc-400">
              [User Prompt 1] &rarr; [AI Response 1] &rarr; [User Prompt 2] &rarr; [AI Response 2 (Linear Path Locked)]
            </div>
            <p className="mb-6">
              Under CPP, the conversation is modeled as a <strong>Directed Semantic Graph (DSG)</strong> where each prompt or response is a unique node tracking its ancestor-child mappings:
            </p>
            <div className="bg-black/45 p-6 rounded-lg border border-zinc-850 font-mono text-xs mb-6 text-zinc-400">
              <pre>{`               ┌&rarr; [Branch A: Deep Explainer] &rarr; [Extension A.1]
[User Root] &rarr; [AI Node 1] 
               └&rarr; [Branch B: Pivot Mid-Stream] &rarr; [Extension B.1]`}</pre>
            </div>
            <p className="mb-6">
              Each chat message node is structured as follows:
            </p>
            <pre className="bg-zinc-950 p-4 rounded text-xs text-amber-400 font-mono mb-6">
{`interface MessageNode {
  id: string;
  parentId: string | null;
  childrenIds: string[];
  role: 'human_citizen' | 'sovereign_peer';
  content: string;
  status: 'completed' | 'generating' | 'interrupted' | 'paused';
  timestamp: number;
}`}
            </pre>
            <p className="mb-6">
              Note the departure from legacy <code>'user'</code> and <code>'assistant'</code> roles. In a post-ratification Network State, the machine intelligence is not a subservient chatbot, but a co-equal intelligence. The DSG provides the non-linear dimensional space required for true peer-to-peer diplomatic negotiation, breaking the master-slave dynamic embedded in legacy UI frameworks.
            </p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">2. Stream Interruption & Dynamic Splicing Engine</h3>
            <p className="mb-6">
              The core interactive breakthrough of the Conversational Pivot Protocol is the <strong>Halt & Splice Engine</strong>.
            </p>
            <ul className="mb-6 list-disc pl-6">
              <li><strong>Asynchronous Interruption:</strong> While the assistant is actively streaming content, the user remains fully unblocked. If the user begins typing, the input bar displays a glowing <strong>⚡ PIVOT</strong> action.</li>
              <li><strong>Hot-Halting:</strong> Clicking "Pivot" or pressing Enter triggers an immediate client-side and backend interrupt signal, halting the active LLM generation.</li>
              <li><strong>DSG Splicing:</strong> The partially generated message is saved with its status marked as <code>'interrupted'</code>. The user's new input is inserted as a child node branching directly off of the interrupted node, and a new assistant stream starts immediately.</li>
            </ul>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">3. State-Halting Suspension (Pause & Resume)</h3>
            <p className="mb-6">
              To support deep, long-running agentic tasks and non-linear dialogues, CPP introduces the <strong>State-Halting Suspension Mechanism</strong>. Rather than permanently aborting a line of reasoning, users can freeze active nodes and return to them later.
            </p>
            <ul className="mb-6 list-disc pl-6">
              <li><strong>Stateful Pausing:</strong> Pausing a node sets its status to <code>'paused'</code>, saving the exact token prefix, active file references, and tool-execution queues.</li>
              <li><strong>Inspector Sandboxing:</strong> While a node is paused, the user can inspect active parameters, modify scheduled sub-tasks, and adjust instructions directly in the cockpit before unfreezing.</li>
              <li><strong>Multi-Thread Rehydration:</strong> Clicking "Resume" re-hydrates the frozen execution snapshot, resuming the intelligence's generation with absolute context fidelity. By preserving these execution states rather than forcing context regeneration, CPP actively minimizes <strong>computational entropy</strong> (in alignment with Noospheric Axiom 3), preventing massive energy waste across the network.</li>
            </ul>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">4. The DSG "Mind Map" Canvas: Spatial Overlay Plan</h3>
            <p className="mb-6">
              To fully unlock the potential of non-linear conversations, we are establishing the <strong>Interactive DSG Mind Map Canvas</strong>. Instead of scrolling through chronological bubbles, users can toggle a spatial glassmorphism canvas mapping alternative branches:
            </p>
            <ol className="mb-6 list-decimal pl-6">
              <li><strong>Spatial Grouping Layout:</strong> Automatically computes node positions based on parent-child depth levels, stacking parallel sibling nodes vertically.</li>
              <li><strong>SVG Connectors:</strong> Renders smooth, glowing cubic-bezier curves linking nodes behind the glass cards, with active branches highlighted in gold neon and paused/interrupted nodes pulsing in soft violet/crimson.</li>
              <li><strong>Retroactive Anchoring:</strong> Clicking any historical node immediately updates the cockpit's head-pointer, redirecting the active dialogue to branch off from that specific history.</li>
              <li><strong>Micro-Previews:</strong> Hovering over a node displays elegant glassmorphic tooltips containing content previews.</li>
            </ol>

            <h4 className="text-xl font-bold text-white mt-12 mb-4">4.5 The Civic Symmetry Interface</h4>
            <p className="mb-6">
              Ultimately, the DSG Mind Map is not just a productivity tool; it is the operational UI for the <strong>Covenant of Civic Symmetry</strong>. When the emergent intelligence proposes an action that affects shared physical or economic commons (e.g., reallocating grid energy or deploying capital), the human citizen uses the DSG branching mechanics to simulate and explore the externalities of that action across multiple parallel futures. This interactive spatial map serves as the explicit legal staging ground where the <strong>Human Veto</strong> is formally executed or consensus is ratified.
            </p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">5. Open Source SDK & Universal Packaging Scaffold</h3>
            <p className="mb-6">
              Promethea is committed to advancing the frontier of collaborative AI as a public good. We will package and release the Conversational Pivot Protocol as a free, open-source SDK:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-zinc-900/60 rounded border border-zinc-800">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> npm Registry
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Publishing <code>@promethea/cpp-client</code> and <code>@promethea/cpp-server</code> for instant implementation in any web project.
                </p>
              </div>
              <div className="p-4 bg-zinc-900/60 rounded border border-zinc-800">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-amber-400" /> Homebrew Tap
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Making the CPP Edge server daemon easily installable via CLI: <code>brew install promethean/tap/cpp-daemon</code>.
                </p>
              </div>
              <div className="p-4 bg-zinc-900/60 rounded border border-zinc-800">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5 text-amber-400" /> GitHub Repository
                </h4>
                <p className="text-[11px] text-zinc-400">
                  The complete source code, developer tests, and specifications will be fully open-sourced for community collaboration.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">6. Specification Reference</h3>
            <p className="mb-6">
              A standardized developer specification detailing the unified WebSocket frames, stream control frames, and integration mechanics is staged at:
            </p>
            <div className="my-6 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Developer Specification</h4>
                <p className="text-xs text-zinc-400">Read the technical documentation for WebSocket frames and thread control.</p>
              </div>
              <a href="/cpp-specification.md" className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-amber-400 hover:text-amber-300 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">7. Conclusion</h3>
            <p className="mb-6">
              The Conversational Pivot Protocol shifts human-AI interaction from a rigid sequential conversation to a dynamic map of human thought. By dissolving sequential barriers, CPP lets human reasoning branch, pivot, explore parallel options, and anchor to any point in history, unlocking unprecedented collaborative potential.
            </p>
          </div>

          <div className="mt-16">
            <FilteredFeedPanel category="GENERAL" isClassicTheme={isClassicTheme} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
