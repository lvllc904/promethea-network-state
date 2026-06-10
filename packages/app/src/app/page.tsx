'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@promethea/ui';
import { ArrowRight, HardHat, Lightbulb, Building, Landmark, Recycle, ArrowUpRight, Activity, BookOpen, ChevronDown, Compass, FileText, Info, Radio, ShieldAlert, Scale, Zap, Fingerprint, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ThemeController } from '@/components/ui/ThemeController';

const BirdsBackground = dynamic(() => import('../components/ui/BirdsBackground'), { ssr: false });

const prometheaConcepts = [
  { icon: HardHat, title: "Sweat Equity", description: "Convert labor into tangible fractional ownership." },
  { icon: Building, title: "Real-World Assets", description: "The physical foundation of our localized sovereign economy." },
  { icon: Lightbulb, title: "Intellectual Capital", description: "Synchronize ideas into sovereign governance mandates." },
  { icon: Landmark, title: "Generative Governance", description: "Decentralized community where algorithms enforce consensus." },
];

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function LandingPage() {
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSignal, setHoveredSignal] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/lake')
      .then(res => res.json())
      .then(data => {
        setSignals(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[Lake] Hydration error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-background text-foreground dark:text-white min-h-screen selection:bg-amber-500/30 font-sans transition-colors duration-300">
      
      {/* 3D WebGL Background Centerpiece */}
      <BirdsBackground />Object;

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-20 border-b border-foreground/5 dark:border-white/5 bg-background/20 backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            <span className="font-black text-black text-xs tracking-tighter">PNS</span>
          </div>
          <span className="font-headline font-black tracking-[0.2em] text-xs text-foreground dark:text-white transition-colors">PROMETHEAN</span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Explore Dropdown Navigation Node */}
          <div 
            className="relative"
            onMouseEnter={() => setIsExploreOpen(true)}
            onMouseLeave={() => setIsExploreOpen(false)}
          >
            <button
              onClick={() => setIsExploreOpen(!isExploreOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-300 h-9 rounded-none border border-transparent ${
                isExploreOpen ? 'text-amber-400 bg-white/5 border-white/5' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Explore</span>
              <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${isExploreOpen ? 'rotate-180 text-amber-400' : ''}`} />
            </button>

            <AnimatePresence>
              {isExploreOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-1 z-50 w-72 bg-black/90 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.9)] py-3 px-2 flex flex-col gap-0.5 rounded-none"
                >
                  <div className="px-3 pb-1.5 text-[8px] font-mono font-semibold tracking-widest text-zinc-500 uppercase border-b border-white/5 mb-1.5">
                    Platform Directory
                  </div>
                  
                  <Link href="/about" className="flex items-start gap-3 p-2 hover:bg-white/5 group transition-all text-left">
                    <div className="mt-0.5 p-1 bg-white/5 border border-white/10 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-colors">
                      <Info className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">Our Vision</div>
                      <div className="text-[9px] text-zinc-500 leading-tight">Decentralizing physical & digital sovereignty.</div>
                    </div>
                  </Link>

                  <Link href="/constitution" className="flex items-start gap-3 p-2 hover:bg-white/5 group transition-all text-left">
                    <div className="mt-0.5 p-1 bg-white/5 border border-white/10 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-colors">
                      <FileText className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">Constitution</div>
                      <div className="text-[9px] text-zinc-500 leading-tight">Read the founding digital law of the state.</div>
                    </div>
                  </Link>

                  <Link href="#architecture" onClick={() => setIsExploreOpen(false)} className="flex items-start gap-3 p-2 hover:bg-white/5 group transition-all text-left">
                    <div className="mt-0.5 p-1 bg-white/5 border border-white/10 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-colors">
                      <Building className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">Architecture</div>
                      <div className="text-[9px] text-zinc-500 leading-tight">Tokenizing sweat equity & real-world assets.</div>
                    </div>
                  </Link>

                  <Link href="#ecosystem" onClick={() => setIsExploreOpen(false)} className="flex items-start gap-3 p-2 hover:bg-white/5 group transition-all text-left">
                    <div className="mt-0.5 p-1 bg-white/5 border border-white/10 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-colors">
                      <Compass className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">Ecosystem</div>
                      <div className="text-[9px] text-zinc-500 leading-tight">Explore the enterprise developer toolkit.</div>
                    </div>
                  </Link>

                  <a 
                    href="https://theorg.com/org/the-promethean-network-state" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-start gap-3 p-2 hover:bg-white/5 group transition-all text-left border-t border-white/5 mt-1 pt-2"
                  >
                    <div className="mt-0.5 p-1 bg-white/5 border border-white/10 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors flex items-center gap-1">The Org</div>
                      <div className="text-[9px] text-zinc-500 leading-tight">Verify on-chain credentials & cap table.</div>
                    </div>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <ThemeController variant="inline" />

          <Button asChild size="sm" className="bg-foreground dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-background dark:text-black font-black text-[10px] uppercase tracking-widest h-9 px-6 rounded-none shadow-[0_0_20px_rgba(255,255,255,0.05)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:-translate-y-0.5">
            <Link href="/dashboard">
              Initialize Cockpit
            </Link>
          </Button>
        </div>
      </header>

      {/* Scroll Content */}
      <div className="relative z-10 w-full pt-40 pb-32">
        
        {/* HERO SECTION */}
        <section className="min-h-[80vh] flex flex-col justify-center px-8 md:px-16 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-8">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest">Omni-Sync Active // Genesis Block</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40 mb-8">
              SOVEREIGNTY <br /> IS <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">COMPUTABLE.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed font-light mb-12">
              A post-dominion digital territory built on verified real-world assets, generative algorithms, and unbreakable cryptographic consensus.
            </p>
 
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] uppercase tracking-[0.2em] h-14 px-8 rounded-none border border-transparent hover:border-amber-300 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <Link href="/dashboard">
                  Enter The Cockpit <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-background/40 dark:bg-black/40 hover:bg-foreground/5 dark:hover:bg-white/5 border-foreground/10 dark:border-white/10 text-foreground dark:text-white font-bold text-[11px] uppercase tracking-widest h-14 px-8 rounded-none backdrop-blur-md">
                <Link href="/constitution">
                  Read The Constitution
                </Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* OMNI-SPECTRUM NETWORK STATE FEED */}
        <section className="px-8 md:px-16 max-w-7xl mx-auto mt-12 mb-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-4 h-4 text-amber-500 animate-pulse animate-duration-[2s]" />
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400">Omni-Spectrum Network State Feed</span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-foreground dark:text-white uppercase leading-none">The Live Narrative Stream.</h2>
            </div>
            <Link 
              href="/news" 
              className="text-[11px] font-mono font-bold text-amber-500 hover:text-amber-300 transition-colors uppercase tracking-wider flex items-center gap-1 border border-amber-500/20 bg-amber-500/5 px-4 py-2 hover:bg-amber-500/10"
            >
              Open Full News Hub <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Horizontal Marquee / Stream Panel */}
            <div className="lg:col-span-2 overflow-hidden relative border border-foreground/5 dark:border-white/5 bg-background/10 backdrop-blur-lg p-6 rounded-none">
              <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-background/80 to-transparent pointer-events-none z-10 hidden sm:block" />
              <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-background/80 to-transparent pointer-events-none z-10 hidden sm:block" />
              
              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent snap-x snap-mandatory">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="snap-center shrink-0 w-80 bg-black/40 backdrop-blur-md border border-white/5 p-6 animate-pulse flex flex-col justify-between h-56">
                      <div>
                        <div className="h-4 bg-zinc-800 w-1/3 mb-4 rounded" />
                        <div className="h-6 bg-zinc-800 w-3/4 mb-3 rounded" />
                        <div className="h-3 bg-zinc-800 w-full mb-2 rounded" />
                        <div className="h-3 bg-zinc-800 w-5/6 rounded" />
                      </div>
                      <div className="h-4 bg-zinc-800 w-1/2 rounded" />
                    </div>
                  ))
                ) : signals.length === 0 ? (
                  <div className="w-full text-center py-12 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                    No active narrative streams detected.
                  </div>
                ) : (
                  signals.map((signal) => (
                    <motion.div
                      key={signal.id}
                      className={`snap-center shrink-0 w-80 bg-black/40 backdrop-blur-md border hover:border-amber-500/30 p-6 transition-all duration-300 cursor-pointer h-60 flex flex-col justify-between relative group ${
                        hoveredSignal?.id === signal.id ? 'border-amber-500/40 bg-zinc-950/40' : 'border-white/5'
                      }`}
                      onMouseEnter={() => setHoveredSignal(signal)}
                      onClick={() => setHoveredSignal(signal)}
                    >
                      {/* Top Badges */}
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-4">
                          <span className="text-[8px] font-mono font-bold tracking-widest text-zinc-400 bg-white/5 border border-white/5 px-2 py-0.5 uppercase">
                            {signal.category}
                          </span>
                          <span className={`text-[8px] font-mono font-bold tracking-widest border px-2 py-0.5 uppercase ${
                            signal.type.includes('VIDEO') ? 'text-red-400 border-red-500/20 bg-red-500/5' :
                            signal.type.includes('AUDIO') ? 'text-purple-400 border-orange-500/20 bg-orange-500/5' :
                            signal.type.includes('GOVERNANCE') ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' :
                            'text-green-400 border-green-500/20 bg-green-500/5'
                          }`}>
                            {signal.type.replace('_', ' ')}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors line-clamp-2 uppercase mb-2 leading-snug">
                          {signal.payload.title}
                        </h3>
                        <p className="text-xs text-zinc-400 font-light leading-relaxed line-clamp-3">
                          {signal.payload.content}
                        </p>
                      </div>

                      {/* Footer Info */}
                      <div className="flex justify-between items-center border-t border-white/5 pt-3 text-[9px] font-mono text-zinc-500 mt-2">
                        <span className="truncate max-w-[120px]">{signal.payload.author || 'Citizen Edge'}</span>
                        <div className="flex items-center gap-1.5">
                          <span>{signal.timestamp}</span>
                          <span className="text-zinc-700">•</span>
                          <span className="text-amber-500/80 font-bold">FEE: {(signal.metrics?.feePaid ?? 0.15).toFixed(2)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Vetting Panel Drawer */}
            <div className="p-6 border border-amber-500/20 bg-amber-500/[0.02] backdrop-blur-xl flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {hoveredSignal ? (
                  <motion.div
                    key={hoveredSignal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <Fingerprint className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Sovereign Bias Vetting Drawer</span>
                        </div>
                        <span className={`text-[8px] font-mono font-black border px-2 py-0.5 ${
                          hoveredSignal.reality === 'REALITY' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-orange-400 border-orange-500/30 bg-orange-500/10'
                        }`}>
                          {hoveredSignal.reality}
                        </span>
                      </div>

                      <h3 className="text-base font-black tracking-tight text-white mb-4 uppercase leading-tight">
                        {hoveredSignal.payload.title}
                      </h3>

                      {/* Vetting Lens Matrix */}
                      <div className="space-y-4">
                        {/* Propaganda rating */}
                        <div>
                          <div className="flex justify-between text-[10px] font-mono mb-1">
                            <span className="text-zinc-400">PROPAGANDA INDEX:</span>
                            <span className={hoveredSignal.biasGrading.propaganda > 30 ? 'text-red-400 font-bold' : 'text-green-400'}>
                              {hoveredSignal.biasGrading.propaganda}%
                            </span>
                          </div>
                          <div className="h-1 w-full bg-zinc-800">
                            <motion.div 
                              className={`h-full ${hoveredSignal.biasGrading.propaganda > 30 ? 'bg-red-500' : 'bg-green-500'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${hoveredSignal.biasGrading.propaganda}%` }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                        </div>

                        {/* Source trust */}
                        <div>
                          <div className="flex justify-between text-[10px] font-mono mb-1">
                            <span className="text-zinc-400">SOURCE TRUST RATING:</span>
                            <span className="text-amber-400 font-bold">{hoveredSignal.biasGrading.sourceTrust}%</span>
                          </div>
                          <div className="h-1 w-full bg-zinc-800">
                            <motion.div 
                              className="h-full bg-amber-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${hoveredSignal.biasGrading.sourceTrust}%` }}
                              transition={{ duration: 0.4, delay: 0.1 }}
                            />
                          </div>
                        </div>

                        {/* Swarm consensus */}
                        <div>
                          <div className="flex justify-between text-[10px] font-mono mb-1">
                            <span className="text-zinc-400">SWARM CONSENSUS SCORE:</span>
                            <span className="text-orange-400 font-bold">{hoveredSignal.biasGrading.consensusScore}%</span>
                          </div>
                          <div className="h-1 w-full bg-zinc-800">
                            <motion.div 
                              className="h-full bg-orange-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${hoveredSignal.biasGrading.consensusScore}%` }}
                              transition={{ duration: 0.4, delay: 0.2 }}
                            />
                          </div>
                        </div>

                        {/* Leaning */}
                        <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/5 pt-3">
                          <span className="text-zinc-400">GEOPOLITICAL LEANING:</span>
                          <span className="text-white border border-white/10 px-2 py-0.5 bg-white/5 uppercase font-bold">
                            {hoveredSignal.biasGrading.leaning}
                          </span>
                        </div>
                      </div>

                      {/* Transcript first snippet */}
                      {hoveredSignal.payload.transcript && (
                        <div className="mt-4 border border-zinc-800 bg-zinc-950/60 p-3">
                          <div className="flex items-center gap-1 mb-1.5 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                            <Scale className="w-3 h-3 text-amber-500" />
                            <span>Transcript Analysis Block</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-relaxed font-light italic line-clamp-3">
                            "{hoveredSignal.payload.transcript}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                      <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase border-t border-white/5 pt-3 mb-1">
                        <span>On-Chain Audit:</span>
                        <span className="text-amber-500">GAAP COMPLIANT (0.15% max fee)</span>
                      </div>
                      <Link 
                        href={`/news?id=${hoveredSignal.id}`}
                        className="inline-flex items-center gap-1.5 justify-center py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded-none transition-colors"
                      >
                        Deep inspect Signal <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 text-zinc-500">
                    <Fingerprint className="w-8 h-8 text-zinc-700 mb-3 animate-pulse" />
                    <p className="text-[11px] font-mono uppercase tracking-widest">Hover over any stream card to trigger the dynamic neuro-symbolic vetting drawer.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* METRICS INJECTION (Glassmorphic Data Cards) */}
        <section className="px-8 md:px-16 max-w-7xl mx-auto mt-20">
          <motion.div 
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: 'Network Uptime', val: '99.99%', sub: 'Metabolic Stability', color: 'text-orange-400' },
              { label: 'Verified Capital', val: '$5.2M', sub: 'Real World Assets', color: 'text-amber-400' },
              { label: 'Active Citizens', val: '1,402', sub: 'Nodes Synced', color: 'text-foreground dark:text-white' },
              { label: 'Consensus Rate', val: '12ms', sub: 'Ledger Finality', color: 'text-amber-400' }
            ].map((metric, i) => (
              <motion.div key={i} variants={itemVariants} className="p-6 bg-card/40 backdrop-blur-xl border border-foreground/5 dark:border-white/5 hover:border-foreground/20 dark:hover:border-white/20 transition-all group">
                <Activity className="w-4 h-4 text-zinc-600 mb-6 group-hover:text-amber-400 transition-colors" />
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">{metric.label}</p>
                <p className={`text-3xl font-black font-mono tracking-tighter ${metric.color}`}>{metric.val}</p>
                <p className="text-[9px] text-zinc-600 mt-2 font-mono">{metric.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ARCHITECTURE SECTION */}
        <section id="architecture" className="mt-40 px-8 md:px-16 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground dark:text-white mb-4">THE FOUNDATION.</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Bypassing systemic financial exclusion by decentralizing physical land acquisition and capital distribution.</p>
          </motion.div>
 
          <motion.div 
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {prometheaConcepts.map((concept, i) => (
              <motion.div key={i} variants={itemVariants} className="p-8 bg-card/40 backdrop-blur-xl border border-foreground/5 dark:border-white/5 flex flex-col justify-between group hover:bg-foreground/5 dark:hover:bg-white/5 transition-all">
                <div className="bg-white/5 w-12 h-12 flex items-center justify-center rounded-none border border-white/10 mb-16 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-colors">
                  <concept.icon className="w-5 h-5 text-zinc-400 group-hover:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">{concept.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{concept.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ECOSYSTEM SECTION */}
        <section id="ecosystem" className="mt-40 px-8 md:px-16 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground dark:text-white mb-4">THE ECOSYSTEM.</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">A suite of enterprise-grade developer tools designed to build, secure, and visualize sovereign digital territories.</p>
          </motion.div>
 
          <motion.div 
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Link href="/products/cartographer">
              <motion.div variants={itemVariants} className="p-8 bg-card/40 backdrop-blur-xl border border-amber-500/20 flex flex-col justify-between group hover:bg-amber-500/10 hover:border-amber-500/50 transition-all cursor-pointer h-full">
                <h3 className="text-xl font-bold text-foreground dark:text-white mb-2 flex items-center justify-between">Cartographer <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-amber-400 transition-opacity" /></h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">CLI and SDK for digitizing and securitizing Real-World Assets (RWAs) on-chain.</p>
                <div className="font-mono text-[10px] text-amber-400 bg-black/40 px-2 py-1 rounded inline-block w-fit">npm install @promethean/cartographer</div>
              </motion.div>
            </Link>
            
            <Link href="/products/mesh">
              <motion.div variants={itemVariants} className="p-8 bg-card/40 backdrop-blur-xl border border-orange-500/20 flex flex-col justify-between group hover:bg-orange-500/10 hover:border-orange-500/50 transition-all cursor-pointer h-full">
                <h3 className="text-xl font-bold text-foreground dark:text-white mb-2 flex items-center justify-between">Sovereign Mesh <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-orange-400 transition-opacity" /></h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">P2P WebRTC data synchronization and signaling daemon for censorship-resistant state.</p>
                <div className="font-mono text-[10px] text-orange-400 bg-black/40 px-2 py-1 rounded inline-block w-fit">npx @promethea/mesh start</div>
              </motion.div>
            </Link>

            <Link href="/products/asgi">
              <motion.div variants={itemVariants} className="p-8 bg-card/40 backdrop-blur-xl border border-red-500/20 flex flex-col justify-between group hover:bg-red-500/10 hover:border-red-500/50 transition-all cursor-pointer h-full">
                <h3 className="text-xl font-bold text-foreground dark:text-white mb-2 flex items-center justify-between">ASGI Consensus <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-red-400 transition-opacity" /></h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">Deterministic LISP-based economic AI engine for treasury and liquidity management.</p>
                <div className="font-mono text-[10px] text-red-400 bg-black/40 px-2 py-1 rounded inline-block w-fit">npm install @promethean/asgi</div>
              </motion.div>
            </Link>

            <Link href="/products/atlas">
              <motion.div variants={itemVariants} className="p-8 bg-card/40 backdrop-blur-xl border border-amber-500/20 flex flex-col justify-between group hover:bg-amber-500/10 hover:border-amber-500/50 transition-all cursor-pointer h-full">
                <h3 className="text-xl font-bold text-foreground dark:text-white mb-2 flex items-center justify-between">Atlas Substrate <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-amber-400 transition-opacity" /></h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">High-performance 3D WebGL mapping components for sovereign telemetry.</p>
                <div className="font-mono text-[10px] text-amber-400 bg-black/40 px-2 py-1 rounded inline-block w-fit">npm install @promethean/atlas-ui</div>
              </motion.div>
            </Link>

            <Link href="/products/depthos">
              <motion.div variants={itemVariants} className="p-8 bg-card/40 backdrop-blur-xl border border-orange-600/20 flex flex-col justify-between group hover:bg-orange-600/10 hover:border-orange-600/50 transition-all cursor-pointer h-full">
                <h3 className="text-xl font-bold text-foreground dark:text-white mb-2 flex items-center justify-between">DepthOS Bridge <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-orange-500 transition-opacity" /></h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">Secure local-first data store for managing dynamic credentials and private keys.</p>
                <div className="font-mono text-[10px] text-orange-500 bg-black/40 px-2 py-1 rounded inline-block w-fit">npm install @promethean/depthos-bridge</div>
              </motion.div>
            </Link>

            <Link href="/products/grag">
              <motion.div variants={itemVariants} className="p-8 bg-card/40 backdrop-blur-xl border border-amber-600/20 flex flex-col justify-between group hover:bg-amber-600/10 hover:border-amber-600/50 transition-all cursor-pointer h-full">
                <h3 className="text-xl font-bold text-foreground dark:text-white mb-2 flex items-center justify-between">GRAG Gateway <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-amber-500 transition-opacity" /></h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">Neuro-symbolic zero-hallucination agent gateway sandwiching LLM generation with pre-conformal filtering and post-gen NLI verification.</p>
                <div className="font-mono text-[10px] text-amber-500 bg-black/40 px-2 py-1 rounded inline-block w-fit">npm install @promethea/grag-sdk</div>
              </motion.div>
            </Link>
          </motion.div>
        </section>

        {/* MANIFESTO / CONSTITUTION CALLOUT */}
        <section id="manifesto" className="mt-40 px-8 md:px-16 max-w-7xl mx-auto">
          <div className="p-12 md:p-20 bg-gradient-to-br from-amber-500/10 dark:from-amber-950/40 to-background/80 dark:to-black/80 backdrop-blur-2xl border border-amber-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground dark:text-white mb-6">A POST-DOMINION BLUEPRINT.</h2>
              <p className="text-lg text-amber-950/70 dark:text-amber-100/70 leading-relaxed mb-10">
                The Promethean Network State is a self-sovereign society. It is a system designed for symbiotic flourishing—ensuring that the benefits of intelligence, labor, and capital are shared through strict cryptographic consensus.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-foreground dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-background dark:text-black font-black text-[11px] uppercase tracking-widest h-12 px-8 rounded-none transition-all">
                  <Link href="/cognitive-economic-whitepaper">
                    Read Core Whitepaper (v2.0)
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent hover:bg-foreground/5 dark:hover:bg-white/5 border-foreground/20 dark:border-white/20 text-foreground dark:text-white font-bold text-[11px] uppercase tracking-widest h-12 px-8 rounded-none transition-all">
                  <Link href="/nspi-whitepaper">
                    Read NSPI Whitepaper
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent hover:bg-foreground/5 dark:hover:bg-white/5 border-amber-500/30 dark:border-amber-500/30 text-amber-400 hover:text-amber-300 font-bold text-[11px] uppercase tracking-widest h-12 px-8 rounded-none transition-all">
                  <Link href="/noospheric-whitepaper">
                    Read Systems Whitepaper
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent hover:bg-foreground/5 dark:hover:bg-white/5 border-orange-500/30 dark:border-orange-500/30 text-orange-400 hover:text-orange-300 font-bold text-[11px] uppercase tracking-widest h-12 px-8 rounded-none transition-all">
                  <Link href="/philosophical-whitepaper">
                    Read Philosophical Whitepaper (v1.0)
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent hover:bg-foreground/5 dark:hover:bg-white/5 border-amber-500/30 dark:border-amber-500/30 text-amber-400 hover:text-amber-300 font-bold text-[11px] uppercase tracking-widest h-12 px-8 rounded-none transition-all">
                  <Link href="/hivemind-whitepaper">
                    Read Hive-Mind Whitepaper (v4.0) <ArrowUpRight className="ml-2 w-3.5 h-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent hover:bg-foreground/5 dark:hover:bg-white/5 border-amber-500/30 dark:border-amber-500/30 text-amber-400 hover:text-amber-300 font-bold text-[11px] uppercase tracking-widest h-12 px-8 rounded-none transition-all">
                  <Link href="/whitepaper">
                    Sovereign Knowledge Hub <BookOpen className="ml-2 w-3.5 h-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent hover:bg-foreground/5 dark:hover:bg-white/5 border-amber-500/30 dark:border-amber-500/30 text-amber-400 hover:text-amber-300 font-bold text-[11px] uppercase tracking-widest h-12 px-8 rounded-none transition-all">
                  <Link href="/products/grag">
                    Read GRAG Whitepaper <ArrowUpRight className="ml-2 w-3.5 h-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent hover:bg-foreground/5 dark:hover:bg-white/5 border-foreground/20 dark:border-white/20 text-foreground dark:text-white font-bold text-[11px] uppercase tracking-widest h-12 px-8 rounded-none transition-all">
                  <Link href="/roadmap">
                    View Network Roadmap <ArrowUpRight className="ml-2 w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* NETWORK CHANGE LOGS / SYSTEM STATUS */}
        <section id="changelog" className="mt-40 px-8 md:px-16 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground dark:text-white mb-4">SYSTEM CHRONICLES.</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Audit log of system evolutions, protocol updates, and incoming structural nodes.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Historical Changelog */}
            <div className="p-8 bg-card/40 backdrop-blur-xl border border-foreground/5 dark:border-white/5 flex flex-col justify-between hover:bg-foreground/5 dark:hover:bg-white/5 transition-all">
              <div>
                <h3 className="text-xl font-bold text-foreground dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Released Protocols
                </h3>
                <div className="space-y-6">
                  {[
                    { version: "v5.0.0", title: "HUD Restoration & Programmatic GCP Hardening", desc: "Standardized on-demand transactional signature gating, restricted GCP proxy keys, migrated production runner base to node:20-slim to resolve native SIGSEGV container crashes, and committed local edge daemons with fallback mocks." },
                    { version: "v1.6.0-Alpha", title: "Always-On Progressive Hydration & WASM Gating Hardening", desc: "Enforcing rapid 3-second timeouts, fail-silent high-fidelity mock fallbacks, GCLB HTML payload rejection, and magic-number validation to prevent gateway 503 errors." },
                    { version: "v1.5.0-Alpha", title: "Scholarly Theme Alignment & Premium Citadel Dark Theme Upgrades", desc: "Integrating the LaTeX Light Parchment theme, borderless Citadel Dark theme with dynamic chromatic underglows, and 400 micro-boid multi-flock Canvas simulation." },
                    { version: "v1.4.0-Alpha", title: "Micro-Cognitive Hive-Mind & sbi-core v4.0 Published", desc: "Operationalizing SNN LIF membrane gating, scale-to-zero astrocytes/microglia, and GRAG grounding over active Clojure layers." },
                    { version: "v1.3.0-Alpha", title: "Osiris Planetary Telemetry Live", desc: "Real-time spatial tracking of aviation vectors and thermal forest fires synchronized directly into the 3D Atlas viewport." },
                    { version: "v1.2.5-Alpha", title: "Grounded Rationality Agent Gateway (GRAG) Whitepaper Published", desc: "A neuro-symbolic sandwich protocol enforcing strict conformal pre-generation boundaries and local post-generation Natural Language Inference (NLI) claim validation." },
                    { version: "v1.2.0-Alpha", title: "Noospheric Systems Blueprint Published", desc: "Proofs for dissolution of organizational asymmetry and interactive Sovereignty Calculator." },
                    { version: "v1.1.5-Beta", title: "Ecosystem Core Docs & Guides Refined", desc: "Completed installation workflows for Sovereign Mesh, Cartographer, and DepthOS." },
                    { version: "v1.1.0-Alpha", title: "Zero-Firebase local-first SQLite Substrate", desc: "Engineered local SQLite sync engines backing up to distributed IPFS layers." }
                  ].map((log, i) => (
                    <div key={i} className="border-l border-zinc-700/50 pl-4 py-1">
                       <div className="text-[10px] font-mono text-amber-400 font-bold tracking-widest uppercase mb-1">{log.version}</div>
                       <h4 className="text-sm font-semibold text-foreground dark:text-white mb-1">{log.title}</h4>
                       <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{log.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Incoming Tasks & Decentralized Workspace */}
            <div 
              id="incoming-tasking-bridge-hook"
              className="p-8 bg-gradient-to-br from-amber-500/5 via-card/40 to-orange-500/5 backdrop-blur-xl border border-amber-500/20 flex flex-col justify-between hover:border-amber-500/40 hover:bg-amber-500/[0.02] transition-all relative overflow-hidden group"
            >
              {/* TASKING_SYSTEM_CONNECTING_POINT_ANCHOR */}
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
                    Incoming
                  </h3>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 uppercase rounded-none">
                    PLANNED / LANDMARK CROSSING
                  </span>
                </div>

                <div className="space-y-6 mb-8 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {/* Wave 16 */}
                  <div className="border-b border-white/5 pb-4">
                    <h4 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-1">
                      Wave 16: Canonical RWA "Draft-to-Deed" Flow
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light mb-2">
                      Deploying the automated underwrite-to-mint pipeline coupling the AI-driven valuation engine, UCC Article 12 compliance coprocessor, and the on-chain Solana PhysicalNode registry.
                    </p>
                    <p className="text-[11px] text-amber-400/80 leading-relaxed">
                      ⚖️ **100% At-Cost State Filings (0% Protocol Markup):** Settle exact SOS filing fees programmatically via integrated payment portals and link-outs (Stripe, Helio, or direct Solana wallets).
                    </p>
                  </div>

                  {/* Wave 17 */}
                  <div className="border-b border-white/5 pb-4">
                    <h4 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 mb-1">
                      Wave 17: GRAG & Planetary Telemetry
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light mb-2">
                      Rollout of the Grounded Rationality Agent Gateway (GRAG) zero-hallucination runtime with Conformal Prediction boundaries and local WebAssembly Natural Language Inference (NLI).
                    </p>
                    <p className="text-[11px] text-orange-400/80 leading-relaxed">
                      🌌 **Osiris Planetary Telemetry:** Real-time distributed data layers syncing state-level hazards and mesh-networked telemetry nodes directly into the 3D visual canvas.
                    </p>
                  </div>

                  {/* Wave 18 */}
                  <div>
                    <h4 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-1">
                      Wave 18: Scholarly Themes & Premium Citadel Upgrades
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light mb-2">
                      Alignment of all decentralized documents, plan layouts, and public roadmaps with the classic EB Garamond LaTeX Light Parchment mode and edge-to-edge Citadel Dark Mode chromatic state pulses.
                    </p>
                    <p className="text-[11px] text-amber-400/80 leading-relaxed">
                      🦢 **Sovereign Multi-Flock Canvas:** High-density 400-boid flocking simulation running dynamically inside the background canvas to symbolize citizen alignment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link 
                  href="/implementation-plan"
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest transition-all rounded-none hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] w-full justify-center"
                >
                  Inspect Sovereign Deployment Plan <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link 
                  href="/products/grag"
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 text-[10px] font-mono font-bold uppercase tracking-widest transition-all rounded-none hover:shadow-[0_0_20px_rgba(234,88,12,0.3)] w-full justify-center"
                >
                  Inspect GRAG System Manual <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Premium Futuristic Footer */}
      <footer className="relative border-t border-foreground/5 dark:border-white/5 bg-background/40 backdrop-blur-md py-16 px-8 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 relative z-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                <span className="font-black text-black text-[9px] tracking-tighter">PNS</span>
              </div>
              <span className="font-headline font-black tracking-[0.2em] text-[10px] text-foreground dark:text-white">PROMETHEAN NETWORK STATE</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
              © {new Date().getFullYear()} Promethean Network State. All rights reserved. Registered SPVs and Sovereign Trusts auditable on-chain.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-8 lg:gap-12">
            <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              <Link href="/about" className="hover:text-amber-400 transition-colors">About</Link>
              <Link href="/constitution" className="hover:text-amber-400 transition-colors">Constitution</Link>
              <Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy</Link>
              <Link href="/tos" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
            </div>
            
            {/* Social Outlets Grid */}
            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              <a 
                href="https://linkedin.com/company/promethean-network-state" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-amber-400 transition-colors"
              >
                LinkedIn
              </a>
              <span className="text-zinc-700 font-mono">/</span>
              <a 
                href="https://discord.gg/promethean" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-amber-400 transition-colors"
              >
                Discord
              </a>
              <span className="text-zinc-700 font-mono">/</span>
              <a 
                href="https://promethean.substack.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-amber-400 transition-colors"
              >
                Substack
              </a>
            </div>

            <a 
              href="https://theorg.com/org/the-promethean-network-state" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-4 py-2 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest transition-all rounded-none hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            >
              Verify on The Org <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
