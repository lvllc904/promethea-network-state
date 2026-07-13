'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Terminal, Network, Shield, HelpCircle, CheckCircle2, 
  Wifi, ShieldAlert, Cpu, Share2, EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMesh } from '@/components/providers/mesh-provider';
import dynamic from 'next/dynamic';

const BirdsBackground = dynamic(() => import('../../../components/ui/BirdsBackground'), { ssr: false });

export default function MeshPage() {
  const { themeState } = useMesh();
  const currentTheme = themeState?.theme || 'dark';
  const isClassicTheme = currentTheme === 'theme-latex';

  const features = [
    {
      icon: Wifi,
      title: "Resilient WebRTC Transport",
      description: "Direct connection of browser and hardware nodes over decentralized WebRTC, completely skipping centralized middlemen and ISP bottlenecks."
    },
    {
      icon: Share2,
      title: "Conflict-Free State Sync",
      description: "Uses State-based CRDTs (Yjs protocol) to automatically resolve data merges, syncing the Network State globally even with high lag or network splits."
    },
    {
      icon: EyeOff,
      title: "Zero-Knowledge Encryption",
      description: "Noise-protocol based handshake provides end-to-end cryptographic encryption across nodes, rendering communications completely invisible to surveillance."
    },
    {
      icon: ShieldAlert,
      title: "Self-Healing P2P Routing",
      description: "If global cables cut or cities lose backbone internet, localized mesh islands bridge data automatically, maintaining civic systems locally."
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
          PRODUCT MANUAL // VOL. 02 // COMMUNICATIONS
        </div>
      </header>

      <div className="relative z-10 w-full pt-40 pb-32 px-4 md:px-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-8">
            <Network className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[9px] font-mono font-bold text-blue-300 uppercase tracking-widest">Resilient Mesh Protocol</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40">
            SOVEREIGN MESH.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed mb-12">
            Uncensorable, peer-to-peer data coordination substrate. Sovereign Mesh integrates WebRTC signaling with custom DHT (Distributed Hash Table) layers, enabling real-time, resilient communication channels across global nodes.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 border border-white/5 bg-white/[0.01] backdrop-blur-md rounded hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <Icon className="w-4 h-4 text-blue-400" />
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
                  <Terminal className="w-4 h-4 text-amber-400" /> Mesh Daemons
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">Node CLI Startup (Background service)</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-amber-400 select-all">
                      npx @promethea/mesh start --daemon
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">Install signaling client globally</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-amber-400 select-all">
                      npm install -g @promethea/mesh-daemon
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">Docker Compose Deployment</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-amber-400 select-all">
                      docker run -d -p 4002:4002 promethea/mesh
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2 items-start text-[10px] text-zinc-500 font-mono leading-relaxed border-t border-white/5 pt-4">
                  <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Sovereign Mesh supports both public WebRTC links and secure localized Wi-Fi/Bluetooth ad-hoc peer routing.</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-lg">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
                  <Cpu className="w-4 h-4 text-amber-400" /> Client State Synchronization
                </h3>
                <pre className="bg-black/60 border border-white/10 p-4 rounded font-mono text-[11px] text-zinc-300 overflow-x-auto">
{`import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { SecureNoiseEncryptor } from '@promethea/mesh-crypto';

const doc = new Y.Doc();

// Set up noise-protocol based local encryption
const encryptor = new SecureNoiseEncryptor({
  keyPair: SecureNoiseEncryptor.generateKeys()
});

console.log('Spinning up secure WebRTC sync interface...');
const provider = new WebrtcProvider(
  'promethea-sovereign-state-v2', 
  doc, 
  { 
    signaling: ['wss://mesh.lvhllc.org', 'wss://mesh-backup.promethea.org'],
    password: encryptor.deriveChannelSecret('promethea-state-room')
  }
);

// Map global citizen status to conflict-free variables
const globalState = doc.getMap('sovereign_citizenry');

globalState.observe((event) => {
  event.changes.keys.forEach((change, key) => {
    console.log(\`[Mesh Update] \${key}: \`, change.action);
  });
});

// Update personal status in conflict-free state
globalState.set('citizen_node_status_active', {
  telemetryStream: 'CONNECTED',
  timestamp: Date.now()
});`}
                </pre>
              </div>
            </div>
            
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
