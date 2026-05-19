'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@promethea/ui';
import { ArrowRight, HardHat, Lightbulb, Building, Landmark, Recycle, ArrowUpRight, Activity, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

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
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (!root.classList.contains('dark') && !root.classList.contains('light')) {
      root.classList.add('dark');
    }
    setTheme(root.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.remove('dark');
      root.classList.add('light');
      setTheme('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      setTheme('dark');
    }
  };

  return (
    <div className="bg-background text-foreground dark:text-white min-h-screen selection:bg-cyan-500/30 font-sans transition-colors duration-300">
      
      {/* 3D WebGL Background Centerpiece */}
      <BirdsBackground />

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-20 border-b border-foreground/5 dark:border-white/5 bg-background/20 backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <span className="font-black text-black text-xs tracking-tighter">PNS</span>
          </div>
          <span className="font-headline font-black tracking-[0.2em] text-xs text-foreground dark:text-white transition-colors">PROMETHEAN</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            <Link href="#manifesto" className="hover:text-cyan-400 transition-colors">Manifesto</Link>
            <Link href="/roadmap" className="hover:text-cyan-400 transition-colors">Roadmap</Link>
            <Link href="#architecture" className="hover:text-cyan-400 transition-colors">Architecture</Link>
          </div>
          
          <button 
            onClick={toggleTheme} 
            className="p-2 border border-foreground/10 dark:border-white/10 hover:bg-foreground/5 dark:hover:bg-white/5 rounded-none transition-all flex items-center justify-center text-foreground dark:text-white"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-widest">Omni-Sync Active // Genesis Block</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40 mb-8">
              SOVEREIGNTY <br /> IS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">COMPUTABLE.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed font-light mb-12">
              A post-dominion digital territory built on verified real-world assets, generative algorithms, and unbreakable cryptographic consensus.
            </p>
 
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[11px] uppercase tracking-[0.2em] h-14 px-8 rounded-none border border-transparent hover:border-cyan-300 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <Link href="/dashboard">
                  Enter The Cockpit <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-background/40 dark:bg-black/40 hover:bg-foreground/5 dark:hover:bg-white/5 border-foreground/10 dark:border-white/10 text-foreground dark:text-white font-bold text-[11px] uppercase tracking-widest h-14 px-8 rounded-none backdrop-blur-md">
                <Link href="#manifesto">
                  Read The Constitution
                </Link>
              </Button>
            </div>
          </motion.div>
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
              { label: 'Network Uptime', val: '99.99%', sub: 'Metabolic Stability', color: 'text-emerald-400' },
              { label: 'Verified Capital', val: '$5.2M', sub: 'Real World Assets', color: 'text-cyan-400' },
              { label: 'Active Citizens', val: '1,402', sub: 'Nodes Synced', color: 'text-foreground dark:text-white' },
              { label: 'Consensus Rate', val: '12ms', sub: 'Ledger Finality', color: 'text-amber-400' }
            ].map((metric, i) => (
              <motion.div key={i} variants={itemVariants} className="p-6 bg-card/40 backdrop-blur-xl border border-foreground/5 dark:border-white/5 hover:border-foreground/20 dark:hover:border-white/20 transition-all group">
                <Activity className="w-4 h-4 text-zinc-600 mb-6 group-hover:text-cyan-400 transition-colors" />
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
                <div className="bg-white/5 w-12 h-12 flex items-center justify-center rounded-none border border-white/10 mb-16 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-colors">
                  <concept.icon className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">{concept.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{concept.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* MANIFESTO / CONSTITUTION CALLOUT */}
        <section id="manifesto" className="mt-40 px-8 md:px-16 max-w-7xl mx-auto">
          <div className="p-12 md:p-20 bg-gradient-to-br from-cyan-500/10 dark:from-cyan-950/40 to-background/80 dark:to-black/80 backdrop-blur-2xl border border-cyan-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground dark:text-white mb-6">A POST-DOMINION BLUEPRINT.</h2>
              <p className="text-lg text-cyan-950/70 dark:text-cyan-100/70 leading-relaxed mb-10">
                The Promethean Network State is a self-sovereign society. It is a system designed for symbiotic flourishing—ensuring that the benefits of intelligence, labor, and capital are shared through strict cryptographic consensus.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-foreground dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-background dark:text-black font-black text-[11px] uppercase tracking-widest h-12 px-8 rounded-none transition-all">
                  <Link href="/whitepaper">
                    Read Whitepaper
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
      </div>
      
    </div>
  );
}
