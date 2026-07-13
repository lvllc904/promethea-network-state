'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { WhitepaperContent } from '../whitepaper/content';

import { useMesh } from '@/components/providers/mesh-provider';
import FilteredFeedPanel from '@/components/FilteredFeedPanel';

const BirdsBackground = dynamic(() => import('../../components/ui/BirdsBackground'), { ssr: false });

export default function PhilosophicalWhitepaperPage() {
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
        <Link href="/whitepaper" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span className="font-headline font-black tracking-[0.2em] text-xs text-foreground dark:text-white">BACK TO PORTAL</span>
        </Link>
      </header>

      <div className="relative z-10 w-full pt-40 pb-32 px-8 md:px-16 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-8">
            <BookOpen className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest">Version 1.0.0</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40">
            THE PROMETHEAN WHITEPAPER.
          </h1>
          <div className="text-zinc-600 dark:text-zinc-400">
            <WhitepaperContent />
          </div>

          {/* Dynamic Network Consensus Feed */}
          <div className="mt-16">
            <FilteredFeedPanel category="PHILOSOPHICAL" isClassicTheme={isClassicTheme} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
