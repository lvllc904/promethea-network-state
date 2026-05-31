'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const BirdsBackground = dynamic(() => import('../../components/ui/BirdsBackground'), { ssr: false });

export default function WhitepaperPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md mb-8">
            <BookOpen className="w-3 h-3 text-cyan-400" />
            <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-widest">Version 1.0.0</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40">
            THE PROMETHEAN WHITEPAPER.
          </h1>
          <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-600 dark:text-zinc-400">
            <p className="lead text-xl mb-8 font-light text-zinc-300">The Promethean Network State (PNS) is a sovereign economic substrate designed to bypass traditional financial monopolies by digitizing physical assets and automating resource distribution.</p>
            
            <h3 className="text-2xl font-bold text-white mt-12 mb-4">1. The Cartographer Protocol</h3>
            <p className="mb-6">A decentralized pipeline for mapping, tokenizing, and securitizing Real World Assets (RWAs). Land, energy, and infrastructure are brought on-chain via high-fidelity data feeds.</p>
            
            <h3 className="text-2xl font-bold text-white mt-12 mb-4">2. Sovereign Mesh Networking</h3>
            <p className="mb-6">Peer-to-peer WebRTC topology ensures the network remains resilient, even in the event of major backbone outages. Data is synced globally via CRDT protocols.</p>
            
            <h3 className="text-2xl font-bold text-white mt-12 mb-4">3. ASGI Consensus</h3>
            <p className="mb-6">The Artificial Sovereign General Intelligence (ASGI) dynamically adjusts interest rates, allocates capital, and manages the treasury waterfall using deterministic algorithms.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
