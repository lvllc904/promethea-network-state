'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Terminal, Cpu, Shield, HelpCircle, CheckCircle2, 
  MapPin, Radio, Activity, Compass, Layers, FileCode2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMesh } from '@/components/providers/mesh-provider';
import dynamic from 'next/dynamic';

const BirdsBackground = dynamic(() => import('../../../components/ui/BirdsBackground'), { ssr: false });

export default function CartographerPage() {
  const { themeState } = useMesh();
  const currentTheme = themeState?.theme || 'dark';
  const isClassicTheme = currentTheme === 'theme-latex';

  const features = [
    {
      icon: MapPin,
      title: "RWA Boundary Digitization",
      description: "Precisely map physical assets, real estate, and agricultural zones with sub-centimeter GPS accuracy, producing legally binding on-chain spatial polygons."
    },
    {
      icon: Radio,
      title: "Live Spatial Oracles",
      description: "Integrate IoT telemetry data directly from solar arrays, energy grids, and water systems to verify output and automatically update token valuations."
    },
    {
      icon: Layers,
      title: "Fractionalization Protocols",
      description: "Automatically split digitized assets into multi-dimensional ERC-1155 or SPL tokens on-chain, representing fractional ownership shares."
    },
    {
      icon: FileCode2,
      title: "Legal Wrapper Auto-Generator",
      description: "Instantly compile Wyoming/Marshall Islands compliant DAO-LLC and Perpetual Purpose Trust (PPT) legal agreements matching on-chain token distributions."
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
          PRODUCT MANUAL // VOL. 01 // CORE UTILITIES
        </div>
      </header>

      <div className="relative z-10 w-full pt-40 pb-32 px-4 md:px-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-8">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest">Developer SDK & Tooling</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40">
            PROMETHEA CARTOGRAPHER.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed mb-12">
            The standard toolkit for digitizing real-world assets (RWAs). Cartographer enables developers, engineers, and community organizers to map physical boundaries, stream telemetry securely, and compile legally compliant DAO-LLC and PPT wrappers on-chain.
          </p>

          {/* Core Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 border border-white/5 bg-white/[0.01] backdrop-blur-md rounded hover:border-amber-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Icon className="w-4 h-4 text-amber-400" />
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
            
            {/* Left side instructions */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-lg">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
                  <Terminal className="w-4 h-4 text-amber-400" /> Installation Instructions
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">NPM Package (Node.js/TypeScript)</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-amber-400 select-all">
                      npm install @promethean/cartographer
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">PNPM Environment</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-amber-400 select-all">
                      pnpm add @promethean/cartographer
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">OSX Command Line Tool (Spatial Oracle)</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-amber-400 select-all">
                      brew install promethea-cartographer
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2 items-start text-[10px] text-zinc-500 font-mono leading-relaxed border-t border-white/5 pt-4">
                  <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Requires valid Self-Sovereign Identity (SSI) passport keys and hardware boundary verification nodes.</span>
                </div>
              </div>
            </div>
            
            {/* Right side code sample */}
            <div className="lg:col-span-3">
              <div className="p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-lg">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
                  <Compass className="w-4 h-4 text-amber-400" /> Developer Quick Start
                </h3>
                <pre className="bg-black/60 border border-white/10 p-4 rounded font-mono text-[11px] text-zinc-300 overflow-x-auto">
{`import { Cartographer } from '@promethean/cartographer';

// Initialize the spatial mapping client
const node = new Cartographer({
  did: process.env.PROMETHEA_DID,     // Your self-sovereign DID
  network: 'mainnet',                // Atlas mainnet or testnet
  telemetryStream: true              // Connect live telemetry feeds
});

async function mapAsset() {
  try {
    console.log('Initiating telemetry spatial sync...');
    const asset = await node.scanBounds({
      lat: 30.3322,
      lng: -81.6557,
      radius: 120, // Boundary radius (meters)
      features: ['SOLAR_YIELD', 'GRID_CAPACITY']
    });
    
    // Auto-compiles localized legal SPV parameters
    const spv = await asset.compileLegalWrapper({
      type: 'WYOMING_DAO_LLC',
      entityName: 'Promethean Solar Array SPV #12'
    });

    console.log('Committing assets & legal agreements to Substrate...');
    const receipt = await asset.commitToSubstrate();
    
    console.log('Success! RWA on-chain. TX Hash:', receipt.hash);
  } catch (err) {
    console.error('Spatial mapping verification failed:', err);
  }
}

mapAsset();`}
                </pre>
              </div>
            </div>
            
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
