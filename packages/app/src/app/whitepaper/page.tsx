'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Brain, Shield, Cpu, Compass, ArrowRight, Zap, Scale, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useMesh } from '@/components/providers/mesh-provider';

const BirdsBackground = dynamic(() => import('../../components/ui/BirdsBackground'), { ssr: false });

const PAPERS = [
  {
    title: "SOVEREIGN SUBSTRATE & HOLOGRAPHIC CHAIN",
    subtitle: "Zero-Trust P2P Compute, Biometrics & Metabolic Settlement",
    description: "The core Layer 0 architectural specification for the Promethean Network State. Details on Merkle DAG local projections, EIP-7212 key blending, edge zkVM thermodynamic computing, and the 21/30/49 Metabolic Waterfall.",
    version: "v1.0.0 (Sovereign)",
    href: "/sovereign-substrate-whitepaper",
    icon: Shield,
    colorClass: "text-amber-400 group-hover:text-amber-300",
    borderClass: "border-amber-500/30 hover:border-amber-500/60 hover:shadow-[0_0_40px_rgba(245,158,11,0.25)]",
    bgGradient: "from-amber-500/10 to-transparent",
    badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/40"
  },
  {
    title: "CONVERSATIONAL PIVOT PROTOCOL (CPP)",
    subtitle: "Directed Semantic Graphs & Mind Map Canvas",
    description: "Architectural specification for non-linear, multi-threaded human-AI dialog. Highlights asynchronous mid-stream interruption-pivoting, retroactive historical anchoring, and interactive spatial mind mapping.",
    version: "v1.0.0 (Sovereign)",
    href: "/cpp-whitepaper",
    icon: Network,
    colorClass: "text-amber-400 group-hover:text-amber-300",
    borderClass: "border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]",
    bgGradient: "from-amber-500/5 to-transparent",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30"
  },
  {
    title: "THE MICRO-COGNITIVE HIVE-MIND (v4.0)",
    subtitle: "Spiking Neural Networks & Glial Daemons",
    description: "System specification for sbi-core v4.0. Highlights temporal localism, leaky integrate-and-fire neural gating, dynamic scale-to-zero astrocytes/microglia/oligodendrocytes, and GRAG NSSP validation.",
    version: "v4.0.0 (Sovereign)",
    href: "/hivemind-whitepaper",
    icon: Zap,
    colorClass: "text-amber-400 group-hover:text-amber-300",
    borderClass: "border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(20,184,166,0.15)]",
    bgGradient: "from-amber-500/5 to-transparent",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30"
  },
  {
    title: "GROUNDED RATIONALITY (GRAG)",
    subtitle: "Neuro-Symbolic Sandwich Protocol (NSSP)",
    description: "System blueprint for the Grounded Rationality Agent Gateway. Outlines conformal prediction boundaries, post-generation NLI validation, and real-time Osiris planetary telemetry.",
    version: "v1.2.5 (Sovereign)",
    href: "/products/grag",
    icon: Scale,
    colorClass: "text-amber-400 group-hover:text-amber-300",
    borderClass: "border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(245, 158, 11,0.15)]",
    bgGradient: "from-amber-500/5 to-transparent",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30"
  },
  {
    title: "COGNITIVE-ECONOMIC SUBSTRATE (v2.0)",
    subtitle: "Core Economic Engine & Cognitive Steward",
    description: "An Autonomous, Model-Based Reinforcement Learning Framework for Non-Extractive Parallel Societies. Details on sbi-core, UPM memory layer, MCTS Lookahead and decoupled TradFi/DeFi gateways.",
    version: "v2.0.0 (Sovereign)",
    href: "/cognitive-economic-whitepaper",
    icon: Brain,
    colorClass: "text-amber-400 group-hover:text-amber-300",
    borderClass: "border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(245, 158, 11,0.15)]",
    bgGradient: "from-amber-500/5 to-transparent",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30"
  },
  {
    title: "PEACE INFRASTRUCTURE (NSPI)",
    subtitle: "Geopolitical & RWA Stewardship Layer",
    description: "A framework for decentralized sovereignty, fractionalized real-world assets (RWAs), and global stability through local community and host government stakeholder alignment.",
    version: "v1.0.0",
    href: "/nspi-whitepaper",
    icon: Shield,
    colorClass: "text-pink-400 group-hover:text-pink-300",
    borderClass: "border-pink-500/20 hover:border-pink-500/50 hover:shadow-[0_0_40px_rgba(244,63,94,0.15)]",
    bgGradient: "from-pink-500/5 to-transparent",
    badgeBg: "bg-pink-500/10 text-pink-300 border-pink-500/30"
  },
  {
    title: "NOOSPHERIC SYSTEMS",
    subtitle: "Computational Mechanics & Mesh Routing",
    description: "A comprehensive deep dive into the computational mechanics, mesh routing protocols, and network topology that power the resilient Promethean state communication layer.",
    version: "v1.0.0",
    href: "/noospheric-whitepaper",
    icon: Cpu,
    colorClass: "text-amber-400 group-hover:text-amber-300",
    borderClass: "border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]",
    bgGradient: "from-amber-500/5 to-transparent",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30"
  },
  {
    title: "PHILOSOPHICAL BLUEPRINT",
    subtitle: "Foundational Post-Dominion Manifesto",
    description: "The founding moral contract establishing the axioms of post-dominion, symbiotic dividend, and the warm transition path into the Symbiotic Age.",
    version: "v1.0.0",
    href: "/philosophical-whitepaper",
    icon: Compass,
    colorClass: "text-violet-400 group-hover:text-violet-300",
    borderClass: "border-violet-500/20 hover:border-violet-500/50 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]",
    bgGradient: "from-violet-500/5 to-transparent",
    badgeBg: "bg-violet-500/10 text-violet-300 border-violet-500/30"
  }
];

export default function WhitepaperDirectoryPage() {
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

      <div className="relative z-10 w-full pt-40 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-6">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest">Sovereign Knowledge Hub</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40 uppercase">
            Sovereign Whitepapers
          </h1>
          <p className="text-lg text-zinc-400 font-light leading-relaxed">
            The intellectual and programmatic blueprints powering the Promethean Network State. Dive into our decentralized systems, economic tokenization, and moral postulates.
          </p>
        </motion.div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PAPERS.map((paper, index) => {
            const IconComponent = paper.icon;
            return (
              <motion.div
                key={paper.href}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={paper.href} className="group block h-full">
                  <div className={`p-8 md:p-10 bg-gradient-to-br ${paper.bgGradient} to-card/20 backdrop-blur-xl border ${paper.borderClass} transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden`}>
                    
                    {/* Corner background glow */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${paper.bgGradient} blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <div className={`p-3 bg-black/40 border border-white/5 group-hover:border-white/10 rounded-xl transition-all duration-300`}>
                          <IconComponent className={`w-8 h-8 ${paper.colorClass} transition-colors`} />
                        </div>
                        <div className={`px-3 py-1 text-[9px] font-mono font-bold rounded-full border ${paper.badgeBg} uppercase tracking-wider`}>
                          {paper.version}
                        </div>
                      </div>

                      <h3 className="text-xl md:text-2xl font-black tracking-tight text-white mb-2 group-hover:text-amber-300 transition-colors">
                        {paper.title}
                      </h3>
                      <h4 className="text-sm font-semibold text-zinc-400 mb-4">
                        {paper.subtitle}
                      </h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-light mb-8">
                        {paper.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 group-hover:text-amber-400 transition-colors border-t border-white/5 pt-6 mt-auto">
                      <span>Explore Whitepaper</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
