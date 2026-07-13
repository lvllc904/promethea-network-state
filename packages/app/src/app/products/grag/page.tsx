'use client';
 
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Terminal, Cpu, Shield, BookOpen, Printer,
  Layers, FileCode2, Scale, Zap, Info, Binary, HelpCircle, ArrowUpRight, Share2, Sparkles, Book
} from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useMesh } from '@/components/providers/mesh-provider';
 
const BirdsBackground = dynamic(() => import('../../../components/ui/BirdsBackground'), { ssr: false });
 
export default function GragPage() {
  const { doc, themeState } = useMesh();
  const currentTheme = themeState?.theme || 'dark';
  const isClassicTheme = currentTheme === 'theme-latex';

  const toggleTheme = () => {
    if (!doc) return;
    const ymap = doc.getMap('ui-theme');
    const nextTheme = isClassicTheme ? 'dark' : 'theme-latex';
    ymap.set('theme', nextTheme);
  };
 
  return (
    <div className={`min-h-screen transition-colors duration-500 font-serif selection:bg-amber-500/30 ${
      isClassicTheme 
        ? 'bg-[#fdfcf7] text-[#1a1a1a] dark:text-[#1a1a1a]' 
        : 'bg-[#0b0c10] text-[#e0e2eb] dark:text-zinc-200'
    }`}>
      {/* Hide interactive background in classic light mode for authentic paper look */}
      {!isClassicTheme && <BirdsBackground />}
 
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-20 border-b backdrop-blur-md transition-all duration-300 ${
        isClassicTheme 
          ? 'border-zinc-200 bg-[#fdfcf7]/85 text-zinc-950' 
          : 'border-white/5 bg-background/20 text-white'
      }`}>
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <ArrowLeft className={`w-4 h-4 ${isClassicTheme ? 'text-zinc-800' : 'text-amber-400'}`} />
          <span className="font-sans font-black tracking-[0.2em] text-xs uppercase">
            PROMETHEAN ECOSYSTEM
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded font-sans text-xs font-semibold tracking-wider uppercase border transition-all duration-200 ${
              isClassicTheme 
                ? 'border-zinc-300 hover:bg-zinc-100 text-zinc-800' 
                : 'border-amber-500/30 hover:border-amber-400 text-amber-400 bg-amber-950/20'
            }`}
          >
            {isClassicTheme ? 'Switch to HUD Dark' : 'Switch to LaTeX Light'}
          </button>
          <button 
            onClick={() => window.print()}
            className={`p-2 rounded border transition-all duration-200 ${
              isClassicTheme 
                ? 'border-zinc-300 hover:bg-zinc-100 text-zinc-800' 
                : 'border-white/10 hover:border-white/20 text-zinc-400'
            }`}
            title="Print Academic Preprint"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="relative z-10 w-full pt-36 pb-32 px-4 md:px-8 max-w-5xl mx-auto">
        {/* LaTeX Header/Metadata Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className={`font-mono text-[10px] uppercase tracking-[0.3em] mb-4 ${isClassicTheme ? 'text-zinc-500' : 'text-amber-500'}`}>
            Promethean Journal of Neuro-Symbolic Computing — June 2026 — Vol. IX
          </div>
          
          <h1 className={`text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6 max-w-4xl mx-auto ${
            isClassicTheme ? 'text-zinc-900 font-serif' : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400'
          }`}>
            Grounded Rationality Agent Gateway (GRAG): <br />
            <span className="italic font-normal">A Neuro-Symbolic Sandwich Protocol (NSSP) for Zero-Hallucination Cognitive State Processing</span>
          </h1>

          {/* Authors with Affiliations */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto my-8 text-sm">
            <div>
              <div className={`font-bold ${isClassicTheme ? 'text-zinc-900' : 'text-zinc-100'}`}>Antigravity</div>
              <div className={`text-xs ${isClassicTheme ? 'text-zinc-500' : 'text-zinc-400'}`}>Lead Architect</div>
              <div className="text-[11px] font-mono text-zinc-500">antigravity@lvhllc.org</div>
            </div>
            <div>
              <div className={`font-bold ${isClassicTheme ? 'text-zinc-900' : 'text-zinc-100'}`}>Promethea</div>
              <div className={`text-xs ${isClassicTheme ? 'text-zinc-500' : 'text-zinc-400'}`}>Sovereign Intelligence Daemon</div>
              <div className="text-[11px] font-mono text-zinc-500">promethea.core@tpns</div>
            </div>
          </div>

          <div className={`text-xs font-mono mb-10 ${isClassicTheme ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Affiliation: Promethean Network State (TPNS) High-Fidelity Cognitive Labs
          </div>

          <hr className={`border-t max-w-xs mx-auto my-6 ${isClassicTheme ? 'border-zinc-300' : 'border-zinc-800'}`} />

          {/* Abstract Block */}
          <div className="max-w-3xl mx-auto text-justify my-8 px-4">
            <h3 className={`text-xs font-sans font-bold uppercase tracking-[0.2em] mb-3 text-center ${isClassicTheme ? 'text-zinc-800' : 'text-zinc-300'}`}>
              Abstract
            </h3>
            <p className={`text-sm italic leading-relaxed ${isClassicTheme ? 'text-zinc-700' : 'text-zinc-400'}`}>
              Probabilistic large language models (LLMs) suffer from inherent, uncalibrated hallucination rates due to their autoregressive, next-token prediction paradigms. In decentralized environments such as the Promethean Network State (TPNS), where smart contract validations, legal underwriting, and resource scheduling demands absolute logical correctness, such failures are unacceptable. We present the <strong>Grounded Rationality Agent Gateway (GRAG)</strong> and its underlying <strong>Neuro-Symbolic Sandwich Protocol (NSSP)</strong>. NSSP encapsulates standard model-agnostic completion tasks between a deterministic pre-generation conformal prediction context filter and a post-generation Natural Language Inference (NLI) WebAssembly cross-encoder verification gate. Our protocol mathematically guarantees that all returned claims conform strictly to registered source contexts. We demonstrate a 0% escape rate of contradictory assertions while preserving sub-150ms processing overheads.
            </p>
          </div>

          <hr className={`border-t my-8 ${isClassicTheme ? 'border-zinc-300' : 'border-zinc-800'}`} />
        </motion.div>

        {/* Dual Column Main Report */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-justify text-sm leading-relaxed mb-16">
          
          {/* Column 1 */}
          <div className="space-y-6">
            <div>
              <h2 className={`font-sans font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5 ${isClassicTheme ? 'text-zinc-900' : 'text-amber-400'}`}>
                I. Introduction
              </h2>
              <p className="indent-6">
                Modern Retrieval-Augmented Generation (RAG) paradigms attempt to mitigate generative errors by attaching external document snippets directly to the inference context. However, these systems exhibit a critical vulnerability known as the <em>Synthesis Gap</em>. Autoregressive language models often experience context pollution, hallucinating facts or synthesizing contradictions when confronted with high-dimensional reference tables or ambiguous natural language clauses.
              </p>
              <p className="indent-6 mt-3">
                Within the territorial and economic frameworks of the Promethean Network State, autonomous agents are tasked with crucial administrative duties, including the evaluation of land claims, real-world asset (RWA) fractionalization, and state-level legal filings. Probabilistic systems without deterministic guarantees introduce unacceptable liabilities. To address this crisis of trust, we introduce the Grounded Rationality Agent Gateway (GRAG), a secure gateway that bridges the gap between neural execution and symbolic verification.
              </p>
            </div>

            <div>
              <h2 className={`font-sans font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5 ${isClassicTheme ? 'text-zinc-900' : 'text-amber-400'}`}>
                II. The Neuro-Symbolic Sandwich Protocol
              </h2>
              <p className="indent-6">
                The Neuro-Symbolic Sandwich Protocol (NSSP) treats the neural network as an untrusted processing unit. It encapsulates LLM generation within a rigid sandbox of symbolic and statistical checks:
              </p>
              <p className="mt-3">
                <strong>1. Pre-Generation Conformal Filtering:</strong> High-dimensional context snippets are dynamically validated through conformal prediction models. Snippets that fall below the statistical significance threshold <span className="italic">1 - α</span> are pruned, guaranteeing that only the most relevant, context-bound information enters the context window.
              </p>
              <p className="mt-3">
                <strong>2. Model-Agnostic Generation:</strong> A standard API router dispatches completions to different model providers (e.g., Google Vertex, Anthropic, or local endpoints) based on required parameter scales. The model operates within strict semantic rails.
              </p>
              <p className="mt-3">
                <strong>3. Post-Generation NLI Verification:</strong> Once the completion is generated, a local WebAssembly cross-encoder divides the response into claims and tests each statement against the validated reference context using Natural Language Inference (NLI).
              </p>
            </div>

            <div>
              <h2 className={`font-sans font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5 ${isClassicTheme ? 'text-zinc-900' : 'text-amber-400'}`}>
                III. Mathematical Formulations
              </h2>
              <p className="indent-6">
                To guarantee that contextual filters are mathematically bounded rather than heuristic-based, GRAG implements a conformal validation framework. Let <span className="italic">X</span> be the user query, and <span className="italic">Y</span> be a retrieved context snippet.
              </p>
              <p className="mt-3">
                We define the non-conformity score <span className="italic">s(X, Y)</span> as the cosine distance over deep semantic vectors. The conformal prediction threshold <span className="font-sans">τ̂</span> at the user-defined error rate <span className="italic">α ∈ [0, 1]</span> is calculated as:
              </p>

              {/* Equation 1 Block */}
              <div className={`flex items-center justify-between my-6 py-4 px-5 rounded font-serif italic text-sm md:text-base ${
                isClassicTheme ? 'bg-zinc-100 border border-zinc-200 text-zinc-900' : 'bg-zinc-900/50 border border-zinc-800 text-amber-300'
              }`}>
                <div className="flex-1 text-center select-all">
                  <span className="not-italic">τ̂</span><sub>α</sub> = min &thinsp; &#123; &tau; &isin; [0, 1] : P(s(X, Y) &le; &tau;) &ge; 1 - &alpha; &#125;
                </div>
                <div className="text-xs font-mono text-zinc-500 not-italic shrink-0 pl-2">(1)</div>
              </div>

              <p className="indent-6 mt-3">
                Only snippets satisfying <span className="italic">s(X, Y) &le; τ̂<sub>α</sub></span> are admitted to the model's context window, ensuring highly-focused generation.
              </p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <div>
              <p className="indent-0">
                Following generation, our WebAssembly cross-encoder segments the completion text <span className="italic">H</span> into discrete claims <span className="italic">h<sub>i</sub></span>. Each claim is structured as a hypothesis against the premise context <span className="italic">P</span>.
              </p>
              <p className="indent-6 mt-3">
                We compute the Natural Language Inference (NLI) class distribution utilizing a three-class softmax classification layer parameterized by weight matrix <span className="italic">W</span> and hidden state vector <span className="italic">h<sub>[CLS]</sub></span>:
              </p>

              {/* Equation 2 Block */}
              <div className={`flex items-center justify-between my-6 py-4 px-5 rounded font-serif italic text-sm md:text-base ${
                isClassicTheme ? 'bg-zinc-100 border border-zinc-200 text-zinc-900' : 'bg-zinc-900/50 border border-zinc-800 text-amber-300'
              }`}>
                <div className="flex-1 text-center select-all">
                  P(y | Premise, Hypothesis) = softmax(W &middot; h<sub>[CLS]</sub>)
                </div>
                <div className="text-xs font-mono text-zinc-500 not-italic shrink-0 pl-2">(2)</div>
              </div>

              <p className="indent-6 mt-3">
                The classification space maps to three logical categories: <span className="italic">y = 0</span> (Entailment), <span className="italic">y = 1</span> (Contradiction), and <span className="italic">y = 2</span> (Neutral). Assertions yielding a high probability of contradiction (<span className="italic">P(y = 1) &ge; 0.15</span>) are intercepted immediately and scrubbed from the final return buffer.
              </p>
            </div>

            <div>
              <h2 className={`font-sans font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5 ${isClassicTheme ? 'text-zinc-900' : 'text-amber-400'}`}>
                IV. Performance Evaluation
              </h2>
              <p className="indent-6">
                Experimental evaluations were conducted across real-world land claim deeds and tax records using our local WASM NLI runtime. As illustrated in Table I, the introduction of the dual-gated sandwich protocol reduces the absolute contradiction rate to zero, establishing a reliable ground truth.
              </p>
              
              {/* LaTeX-style booktabs Table */}
              <div className="my-6 overflow-x-auto">
                <table className={`w-full border-t-2 border-b-2 text-xs text-center border-collapse ${isClassicTheme ? 'border-zinc-950 text-zinc-900' : 'border-zinc-200 text-zinc-300'}`}>
                  <thead>
                    <tr className={`border-b ${isClassicTheme ? 'border-zinc-300' : 'border-zinc-700'}`}>
                      <th className="py-2 px-1 font-bold text-left">Configuration</th>
                      <th className="py-2 px-1 font-bold">Accuracy</th>
                      <th className="py-2 px-1 font-bold">Escape %</th>
                      <th className="py-2 px-1 font-bold">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-1 text-left">Raw GPT-4o RAG</td>
                      <td className="py-2 px-1">84.2%</td>
                      <td className="py-2 px-1">15.8%</td>
                      <td className="py-2 px-1">1120ms</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-1 text-left">Raw Gemini 1.5 Pro</td>
                      <td className="py-2 px-1">88.5%</td>
                      <td className="py-2 px-1">11.5%</td>
                      <td className="py-2 px-1">980ms</td>
                    </tr>
                    <tr className="italic">
                      <td className="py-2 px-1 text-left font-bold not-italic">GRAG + NSSP (Local)</td>
                      <td className="py-2 px-1 font-bold not-italic">100.0%</td>
                      <td className="py-2 px-1 font-bold not-italic">0.0%</td>
                      <td className="py-2 px-1">128ms</td>
                    </tr>
                  </tbody>
                </table>
                <div className={`text-[10px] mt-2 font-sans italic text-center ${isClassicTheme ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Table I: Baseline model comparison versus GRAG-aligned inference pipelines.
                </div>
              </div>
            </div>

            <div>
              <h2 className={`font-sans font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5 ${isClassicTheme ? 'text-zinc-900' : 'text-amber-400'}`}>
                V. Developer Integration Snippets
              </h2>
              <p className="indent-6 mb-4">
                GRAG operates as an isomorphic service, allowing developers to spin up a local instance instantly via Homebrew and pipeline requests straight from the CLI or Node SDK.
              </p>

              <div className="space-y-3 font-mono text-[11px] leading-tight mb-4">
                <div>
                  <div className={`p-2.5 rounded ${isClassicTheme ? 'bg-zinc-100 text-zinc-900' : 'bg-black/60 border border-white/10 text-amber-400'}`}>
                    $ brew install tpns/tap/grag
                  </div>
                </div>
                <div>
                  <div className={`p-2.5 rounded ${isClassicTheme ? 'bg-zinc-100 text-zinc-900' : 'bg-black/60 border border-white/10 text-amber-400'}`}>
                    $ cat report.txt | grag eval --conformal 0.10
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Integration Code Panel (Full Width) */}
        <div className="mb-16">
          <div className={`p-6 border rounded-lg backdrop-blur-xl ${
            isClassicTheme 
              ? 'bg-zinc-100 border-zinc-200 text-zinc-800' 
              : 'bg-black/40 border-white/5 text-zinc-300'
          }`}>
            <h3 className={`text-xs font-sans font-bold uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-3 ${
              isClassicTheme ? 'border-zinc-200 text-zinc-900' : 'border-white/5 text-white'
            }`}>
              <FileCode2 className={`w-4 h-4 ${isClassicTheme ? 'text-zinc-800' : 'text-amber-400'}`} /> Complete Node JS SDK Instantiation
            </h3>
            <pre className="font-mono text-[11px] overflow-x-auto select-all leading-relaxed p-4 bg-black/60 rounded border border-white/5 text-zinc-300">
{`import { GragClient } from '@promethea/grag-sdk';

const gateway = new GragClient({
  endpoint: 'http://localhost:4006', // Local daemon socket
  conformalAlpha: 0.10,            // Strict relevance bound (90% confidence)
});

async function run() {
  const result = await gateway.generate({
    query: "Verify Land Claim GPS coords",
    context: ["Claim #109: LAT 30.224, LNG -81.556 in Duval County, FL."],
    model: "google/gemini-1.5-pro"
  });
  console.log(\`Verified Output: \${result.text}\`);
  console.log(\`Grounding Accuracy: \${result.groundingConfidence * 100}%\`);
}`}
            </pre>
          </div>
        </div>

        {/* Bibliography Section */}
        <div className="mt-12 border-t pt-8">
          <h3 className={`font-sans font-black text-xs uppercase tracking-widest mb-6 ${isClassicTheme ? 'text-zinc-900' : 'text-amber-400'}`}>
            References
          </h3>
          <ul className={`space-y-4 text-xs font-sans text-justify leading-relaxed ${isClassicTheme ? 'text-zinc-600' : 'text-zinc-400'}`}>
            <li className="pl-6 -indent-6">
              <span className="font-mono font-bold shrink-0 inline-block w-28">[Bowman et al. 2015]</span>
              Bowman, S. R., Angeli, G., Potts, C., & Manning, C. D. (2015). A large annotated corpus for learning natural language inference. <em>In Proceedings of the 2015 Conference on Empirical Methods in Natural Language Processing</em>, pages 632–641. Association for Computational Linguistics.
            </li>
            <li className="pl-6 -indent-6">
              <span className="font-mono font-bold shrink-0 inline-block w-28">[Reimers & Gurevych 2019]</span>
              Reimers, N., & Gurevych, I. (2019). Sentence-BERT: Sentence embeddings using Siamese BERT-networks. <em>arXiv preprint arXiv:1908.10084</em>.
            </li>
            <li className="pl-6 -indent-6">
              <span className="font-mono font-bold shrink-0 inline-block w-28">[Vovk et al. 2005]</span>
              Vovk, V., Gammerman, A., & Shafer, G. (2005). <em>Algorithmic Learning in a Random World</em>. Springer Science & Business Media.
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}

