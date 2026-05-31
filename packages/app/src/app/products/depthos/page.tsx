'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Database, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const BirdsBackground = dynamic(() => import('../../../components/ui/BirdsBackground'), { ssr: false });

export default function DepthOSPage() {
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
          <span className="font-headline font-black tracking-[0.2em] text-xs text-foreground dark:text-white">PROMETHEAN ECOSYSTEM</span>
        </Link>
      </header>

      <div className="relative z-10 w-full pt-40 pb-32 px-8 md:px-16 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 backdrop-blur-md mb-8">
            <HardDrive className="w-3 h-3 text-pink-400" />
            <span className="text-[9px] font-mono font-bold text-pink-300 uppercase tracking-widest">Sovereign Data Layer</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40">
            DEPTHOS BRIDGE
          </h1>
          
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-12">
            The decentralized data store interface. DepthOS securely anchors the Promethean Passport, managing private keys and dynamic credentials completely locally.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-lg">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <Database className="w-4 h-4 text-pink-400" /> Integration
              </h3>
              <div className="bg-black/60 border border-white/10 p-4 rounded font-mono text-sm text-pink-400 mb-4">
                $ npm install @promethean/depthos-bridge
              </div>
              <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
                DepthOS provides local-first data storage linked to the Sovereign Mesh, preventing centralized data exploitation and Digital Harm.
              </p>
            </div>
            
            <div className="p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-lg">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Quick Start</h3>
              <pre className="bg-black/60 border border-white/10 p-4 rounded font-mono text-[11px] text-zinc-300 overflow-x-auto">
{`import { DepthOS } from '@promethean/depthos-bridge';

const store = new DepthOS({
  mode: 'local-first',
  sync: 'mesh'
});

async function secureCredentials() {
  await store.vault.unlock(process.env.PASSPORT_PIN);
  
  const credentials = await store.vault.read('dynamic_credentials');
  console.log('Sovereign data synced.');
}

secureCredentials();`}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
