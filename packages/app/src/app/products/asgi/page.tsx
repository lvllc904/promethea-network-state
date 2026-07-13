'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Terminal, Brain, Shield, HelpCircle, CheckCircle2, 
  Settings, Key, AlertTriangle, Workflow, Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMesh } from '@/components/providers/mesh-provider';
import dynamic from 'next/dynamic';

const BirdsBackground = dynamic(() => import('../../../components/ui/BirdsBackground'), { ssr: false });

export default function ASGIPage() {
  const { themeState } = useMesh();
  const currentTheme = themeState?.theme || 'dark';
  const isClassicTheme = currentTheme === 'theme-latex';

  const features = [
    {
      icon: Settings,
      title: "Deterministic Execution",
      description: "ASGI runs LISP-based rulesets on specialized isolated sandboxes, ensuring macroeconomic computations and capital allocations are completely auditable and predictable."
    },
    {
      icon: Workflow,
      title: "Multi-Variable Treasury Logic",
      description: "Continuous feedback-loop loops analyze current global AUM, local community cash flow, and resource indexes to dynamically calibrate network interest rates."
    },
    {
      icon: Key,
      title: "Zero-Trust Pre-Evaluation",
      description: "Secure, sandboxed simulations test incoming community proposals against historical volatility matrices, issuing cryptographic approvals before final human veto checks."
    },
    {
      icon: Cpu,
      title: "Automated Waterfall Execution",
      description: "Direct smart contract interactions trigger automatic profit distributions (waterfalls) and liquidity releases instantly on successful consensus completion."
    }
  ];

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
          <span className="font-headline font-black tracking-[0.2em] text-xs text-foreground dark:text-white">PROMETHEAN ECOSYSTEM</span>
        </Link>
        <div className="text-[10px] font-mono text-zinc-500 hidden sm:block tracking-widest">
          PRODUCT MANUAL // VOL. 03 // COGNITIVE INTEGRATIONS
        </div>
      </header>

      <div className="relative z-10 w-full pt-40 pb-32 px-4 md:px-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md mb-8">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[9px] font-mono font-bold text-purple-300 uppercase tracking-widest">Cognitive Engine</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40">
            ASGI CONSENSUS.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed mb-12">
            Artificial Sovereign General Intelligence. A deterministic rules-based cognitive consensus engine that optimizes resource distribution, evaluates governance proposals, and guides treasury decisions autonomously.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 border border-white/5 bg-white/[0.01] backdrop-blur-md rounded hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                      <Icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <h3 className="font-headline font-black text-sm text-foreground dark:text-white uppercase tracking-wider m-0">{f.title}</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed m-0 font-light">{f.description}</p>
                </div>
              );
            })}
          </div>

          {/* Installation & Guide Container */}
          <div className="grid lg:grid-cols-5 gap-8 mb-16 items-start">
            
            <div className="lg:col-span-2 space-y-6">
              <div className="p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-lg">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
                  <Terminal className="w-4 h-4 text-amber-400" /> ASGI Integration
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">Node SDK Package</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-amber-400 select-all">
                      npm install @promethean/asgi
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">Python Interface (ML pipelines)</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-amber-400 select-all">
                      pip install promethea-asgi
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">Dockerized Sandbox Runtime</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-purple-400 select-all">
                      docker run -d -p 4001:4001 promethea/asgi-sandbox
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2 items-start text-[10px] text-zinc-500 font-mono leading-relaxed border-t border-white/5 pt-4">
                  <AlertTriangle className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                  <span>ASGI executes completely deterministically. Ensure your rulesets compile successfully before submitting as proposals.</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-lg">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
                  <Cpu className="w-4 h-4 text-amber-400" /> REST API & LISP Evaluator
                </h3>
                <pre className="bg-black/60 border border-white/10 p-4 rounded font-mono text-[11px] text-zinc-300 overflow-x-auto">
{`// Submit a proposed capital injection payload for evaluation
const res = await fetch('https://api.lvhllc.org/asgi/evaluate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${process.env.PROMETHEA_ACCESS_TOKEN}\`
  },
  body: JSON.stringify({
    proposal: {
      type: "LIQUIDITY_INJECTION",
      target: "florida-housing-trust-spv",
      amount: 75000,
      rule: "(lambda (treasury bounds) (and (> (get-liquidity treasury) 500000) (< (get-volatility bounds) 0.15)))"
    }
  })
});

const output = await res.json();

console.log('Consensus evaluation complete.');
console.log('Status:', output.consensus);       // e.g. "APPROVED"
console.log('Confidence Score:', output.confidence); // e.g. 0.985
console.log('Execution Signature:', output.signature);`}
                </pre>
              </div>
            </div>
            
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
