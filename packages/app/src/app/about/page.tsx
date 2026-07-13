'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMesh } from '@/components/providers/mesh-provider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@promethea/ui';
import dynamic from 'next/dynamic';

const BirdsBackground = dynamic(() => import('../../components/ui/BirdsBackground'), { ssr: false });

export default function AboutPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md mb-8">
            <Users className="w-3 h-3 text-purple-400" />
            <span className="text-[9px] font-mono font-bold text-purple-300 uppercase tracking-widest">Network Citizens</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40">
            ABOUT PROMETHEA.
          </h1>
          <Tabs defaultValue="origins" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-3 bg-foreground/10 dark:bg-white/10 p-1 rounded-none border border-foreground/20 dark:border-white/20">
              <TabsTrigger value="origins" className="rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-all text-xs">
                Origins
              </TabsTrigger>
              <TabsTrigger value="philosophy" className="rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-all text-xs">
                Philosophy
              </TabsTrigger>
              <TabsTrigger value="structure" className="rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-all text-xs">
                Structure
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="origins">
              <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-600 dark:text-zinc-400 p-8 bg-card/40 backdrop-blur-xl border border-foreground/5 dark:border-white/5">
                <p className="lead text-xl mb-8 font-light text-zinc-300">We are a collective of engineers, economists, and philosophers building the infrastructure for a parallel society.</p>
                
                <h3 className="text-2xl font-bold text-white mt-12 mb-4">The Genesis</h3>
                <p className="mb-6">Promethea emerged from the realization that legacy financial and political systems are inherently extractive, structurally incapable of resolving the crises of the digital age. As artificial intelligence advances, the risk of extreme capital concentration and mass economic exclusion has never been higher.</p>
                
                <p className="mb-6">We assembled to build an alternative: a verifiably fair, self-sovereign network state. Not a theoretical utopia, but a functional, cryptographically secured jurisdiction anchored to the physical world.</p>
              </div>
            </TabsContent>

            <TabsContent value="philosophy">
              <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-600 dark:text-zinc-400 p-8 bg-card/40 backdrop-blur-xl border border-foreground/5 dark:border-white/5">
                <h3 className="text-2xl font-bold text-white mt-4 mb-4">Our Mission</h3>
                <p className="mb-6">To construct a verifiable, asset-backed network state that prioritizes the economic flourishing of its citizens over legacy systemic extraction. We believe that sovereignty is computable.</p>

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Core Tenets</h3>
                <ul className="list-disc pl-6 space-y-4 mb-6">
                  <li><strong>Post-Dominion:</strong> We actively design systems that prohibit the dominion of one intelligence over another.</li>
                  <li><strong>Sweat Equity:</strong> Labor and intellectual contributions must be directly convertible into tangible fractional ownership.</li>
                  <li><strong>Physical Anchoring:</strong> A digital economy is fragile without roots; we secure value through tokenized Real-World Assets (RWAs).</li>
                  <li><strong>Symbiotic AI:</strong> We view AGI not as a tool for automation-driven displacement, but as a partner in a shared, ethical ecosystem.</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="structure">
              <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-600 dark:text-zinc-400 p-8 bg-card/40 backdrop-blur-xl border border-foreground/5 dark:border-white/5">
                <h3 className="text-2xl font-bold text-white mt-4 mb-4">The Organization</h3>
                <p className="mb-6">Promethea operates as a Decentralized Autonomous Community (DAC), governed by the very smart contracts and LISP-based AI algorithms we build. There is no central point of failure, and no centralized executive board.</p>

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Governance via Code</h3>
                <p className="mb-6">By utilizing the Promethean Constitution as our bedrock, we encode our axioms into the Sovereign Mesh. Decisions are executed via a reputation-based voting system, ensuring that influence in the DAC is earned through contribution, not purchased through capital.</p>

                <div className="mt-16 p-8 border border-amber-500/30 bg-amber-500/10 rounded-lg text-center">
                  <h4 className="text-xl font-bold text-white mb-4">Continue the Journey</h4>
                  <p className="text-sm text-amber-100 mb-6">Discover how we are building the future, milestone by milestone.</p>
                  <Link href="/roadmap" className="inline-flex items-center justify-center px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest text-xs transition-colors rounded-none">
                    View The Roadmap
                  </Link>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
