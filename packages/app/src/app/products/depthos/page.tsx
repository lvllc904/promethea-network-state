'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Terminal, Database, HardDrive, Shield, HelpCircle, 
  CheckCircle2, Lock, Key, Cpu, Smartphone, RefreshCw, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMesh } from '@/components/providers/mesh-provider';
import dynamic from 'next/dynamic';

const BirdsBackground = dynamic(() => import('../../../components/ui/BirdsBackground'), { ssr: false });

export default function DepthOSPage() {
  const { themeState } = useMesh();
  const currentTheme = themeState?.theme || 'dark';
  const isClassicTheme = currentTheme === 'theme-latex';

  const features = [
    {
      icon: Lock,
      title: "Local-First Vault Architecture",
      description: "Keys, credentials, and SSI passport data are locked locally using AES-GCM-256 in sandboxed hardware layers, completely isolated from browser memory."
    },
    {
      icon: RefreshCw,
      title: "P2P Mesh Synchronization",
      description: "Direct, encrypted sync pipelines bridge local mutations safely with the global Sovereign Mesh, preserving absolute local data custody."
    },
    {
      icon: Key,
      title: "Zero-Knowledge SSI Auth",
      description: "Generate and present cryptographically secure verifiable credentials (VCs) without revealing underlying private keys or personal metadata."
    },
    {
      icon: Eye,
      title: "Visual-Symbolic Synthesis",
      description: "Couples continuous 2D/3D visual coordinate mathematics with symbolic DOM code, allowing local agents to mathematically 'see' client interactions, saliency maps, and rendering states."
    },
    {
      icon: Smartphone,
      title: "Cross-Device Warm Migration",
      description: "Through safe, local RPC bridges, developers can instantly share secure states and active credentials across multiple local devices without cloud storage."
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
          PRODUCT MANUAL // VOL. 05 // HARDWARE & DECENTRALIZED DATA
        </div>
      </header>

      <div className="relative z-10 w-full pt-40 pb-32 px-4 md:px-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 backdrop-blur-md mb-8">
            <HardDrive className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-[9px] font-mono font-bold text-pink-300 uppercase tracking-widest">Sovereign Data Storage Layer</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40">
            DEPTHOS BRIDGE.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed mb-12">
            The local-first hardware storage and identity bridge. DepthOS secures private keys, manages Promethean Passport credentials, and controls offline mesh replication to defend citizens against centralized data exploitation.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 border border-white/5 bg-white/[0.01] backdrop-blur-md rounded hover:border-pink-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                      <Icon className="w-4 h-4 text-pink-400" />
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
                  <Terminal className="w-4 h-4 text-amber-400" /> Storage Bridging
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">NPM Package (Client SDK)</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-amber-400 select-all">
                      npm install @promethean/depthos-bridge
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">Peer Dependencies</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-amber-400 select-all">
                      npm install @promethean/mesh-daemon
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">Isolated Vault Enclave Bridge</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-pink-400 select-all">
                      npx depthos-enclave-bridge init
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2 items-start text-[10px] text-zinc-500 font-mono leading-relaxed border-t border-white/5 pt-4">
                  <Shield className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                  <span>Always run DepthOS Bridge inside sandboxed local environments. Never stream unencrypted vault payloads onto remote backends.</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3 space-y-6">
              <div className="p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-lg">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
                  <Cpu className="w-4 h-4 text-amber-400" /> Vault Authentication Quick Start
                </h3>
                <pre className="bg-black/60 border border-white/10 p-4 rounded font-mono text-[11px] text-zinc-300 overflow-x-auto">
{`import { DepthOS } from '@promethean/depthos-bridge';

// Initialize isolated local secure storage client
const store = new DepthOS({
  mode: 'local-first',
  sync: 'mesh',
  vaultOptions: {
    enclaveSandbox: true,
    autoLockTimerMs: 300000 // 5 minutes
  }
});

async function secureCredentials() {
  try {
    console.log('Unlocking local secure hardware enclave...');
    await store.vault.unlock(process.env.PASSPORT_PIN);
    
    console.log('Retrieving dynamic cryptographic credentials...');
    const credentials = await store.vault.read('dynamic_credentials');
    
    // Decrypt credentials locally using hardware keys
    const decodedDID = await store.identity.verifyDID(credentials.didToken);
    
    console.log('Sovereign data decrypted locally inside Enclave.');
    console.log('Owner DID:', decodedDID.subject);
    
    // Automatically lock vault memory after usage
    await store.vault.lock();
  } catch (err) {
    console.error('Local-first hardware vault unlock rejected:', err.message);
  }
}

secureCredentials();`}
                </pre>
              </div>

              <div className="p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-lg">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
                  <Eye className="w-4 h-4 text-pink-400" /> SVSS Sensory Telemetry Quick Start
                </h3>
                <pre className="bg-black/60 border border-white/10 p-4 rounded font-mono text-[11px] text-zinc-300 overflow-x-auto">
{`import { SVSS } from '@promethean/depthos-bridge';

// Initialize the local-first Visual-Symbolic sensory engine
const svss = new SVSS({
  viewportMode: 'hybrid-3d', // Supports 2D DOM and 3D WebGL camera projection
  mcpServer: {
    enabled: true,
    port: 4009 // Expose Model Context Protocol endpoint for local agents
  }
});

// Stream real-time visual saliency maps and trajectory vectors
svss.on('telemetry', ({ saliencyMap, userTrajectory }) => {
  console.log('Saliency Peaks (Attention):', saliencyMap.peaks);
  console.log('Human Cursor Velocity Vector:', userTrajectory.velocity);
});

// Let local agents resolve visual collisions via Model Context Protocol
svss.on('mcp:resolve_collision', async (event) => {
  console.log('Agent requesting visual overlap mitigation...');
  const newStyles = await computeOptimalConstraints(event.box);
  await svss.applyStyles(event.targetId, newStyles);
});`}
                </pre>
              </div>
            </div>
            
          </div>

          {/* Conversational Protocols Integration */}
          <div className="p-8 border border-pink-500/20 bg-pink-500/[0.02] backdrop-blur-xl rounded-lg mb-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 backdrop-blur-md mb-4">
                  <Cpu className="w-3 h-3 text-pink-400" />
                  <span className="text-[9px] font-mono font-bold text-pink-300 uppercase tracking-widest">Standardized Protocol Support</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-foreground dark:text-white mb-2 uppercase tracking-wide">Conversational Pivot Protocol (CPP)</h3>
                <p className="text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                  DepthOS Bridge natively integrates the Conversational Pivot Protocol. Securely cache the Directed Semantic Graph (DSG) structure locally, enforce zero-knowledge authentication on conversation nodes, and manage hot-halting and splicing on client-side dialogue streams using the official CPP Integration Pack.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
                <Link 
                  href="/cpp-whitepaper" 
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white font-mono text-[10px] font-bold uppercase tracking-widest transition-all text-center rounded"
                >
                  Read CPP Whitepaper
                </Link>
                <Link 
                  href="/cpp-integration-pack" 
                  className="px-5 py-2.5 bg-pink-500/25 hover:bg-pink-500/35 border border-pink-500/45 text-pink-300 hover:text-pink-200 font-mono text-[10px] font-bold uppercase tracking-widest transition-all text-center rounded shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                >
                  CPP Integration Pack
                </Link>
              </div>
            </div>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
