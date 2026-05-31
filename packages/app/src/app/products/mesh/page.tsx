'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Terminal, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const BirdsBackground = dynamic(() => import('../../../components/ui/BirdsBackground'), { ssr: false });

export default function MeshPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-8">
            <Network className="w-3 h-3 text-blue-400" />
            <span className="text-[9px] font-mono font-bold text-blue-300 uppercase tracking-widest">Network Protocol</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40">
            SOVEREIGN MESH
          </h1>
          
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-12">
            Uncensorable peer-to-peer data synchronization. The Sovereign Mesh uses WebRTC and CRDTs to maintain global state consensus without relying on centralized backbone servers.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-lg">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" /> Initialization
              </h3>
              <div className="bg-black/60 border border-white/10 p-4 rounded font-mono text-sm text-cyan-400 mb-4">
                $ npx @promethea/mesh start --daemon
              </div>
              <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
                Spins up a local signaling node. Connects your device to the global Sovereign DHT (Distributed Hash Table), establishing you as an active peer in the network.
              </p>
            </div>
            
            <div className="p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-lg">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Client Sync</h3>
              <pre className="bg-black/60 border border-white/10 p-4 rounded font-mono text-[11px] text-zinc-300 overflow-x-auto">
{`import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

const doc = new Y.Doc();

// Join the Sovereign State room
const provider = new WebrtcProvider(
  'promethea-state-v1', 
  doc, 
  { signaling: ['wss://mesh.lvhllc.org'] }
);

const state = doc.getMap('sovereignty');

state.observe(event => {
  console.log('Global State Update:', event);
});`}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
