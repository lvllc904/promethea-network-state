'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Terminal, Map, Shield, HelpCircle, CheckCircle2, 
  Layers, Globe2, Eye, Compass, Cpu, Palette
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMesh } from '@/components/providers/mesh-provider';
import dynamic from 'next/dynamic';

const BirdsBackground = dynamic(() => import('../../../components/ui/BirdsBackground'), { ssr: false });

export default function AtlasPage() {
  const { themeState } = useMesh();
  const currentTheme = themeState?.theme || 'dark';
  const isClassicTheme = currentTheme === 'theme-latex';

  const features = [
    {
      icon: Globe2,
      title: "Cinematic 3D WebGL Globe",
      description: "Render global assets, properties, energy distribution, and mesh connectivity in real-time on a high-fidelity vector-based spherical overlay."
    },
    {
      icon: Layers,
      title: "Dynamic Layer Stack",
      description: "Toggle contextual data channels instantly: property borders, real-time power production, mesh packet signals, and regional sovereignty metrics."
    },
    {
      icon: Palette,
      title: "Tailored Map Styling",
      description: "Out-of-the-box support for premium dark-mode vectors, customized typography, and ambient pulsing highlights that blend perfectly with custom layouts."
    },
    {
      icon: Compass,
      title: "Continuous Telemetry Camera",
      description: "Programmatic camera controllers smoothly pan, tilt, zoom, and rotate to track high-value physical assets as live sensor state alterations occur."
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
          PRODUCT MANUAL // VOL. 04 // VISUAL SUBSTRATES
        </div>
      </header>

      <div className="relative z-10 w-full pt-40 pb-32 px-4 md:px-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-8">
            <Map className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest">Geospatial UI Engine</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40">
            ATLAS SUBSTRATE.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed mb-12">
            The sovereign geographic interface framework. Atlas translates multi-dimensional smart-contract properties and real-world asset coordinates into elegant, responsive, and interactive 3D browser maps.
          </p>

          {/* Features Grid */}
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
            
            <div className="lg:col-span-2 space-y-6">
              <div className="p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-lg">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
                  <Terminal className="w-4 h-4 text-amber-400" /> Map Integration
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">Install UI library (NextJS / React)</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-amber-400 select-all">
                      npm install @promethean/atlas-ui
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">Install peer dependencies</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-amber-400 select-all">
                      npm install lucide-react framer-motion
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">Global CSS Styling Hook</span>
                    <div className="bg-black/60 border border-white/10 p-3 rounded font-mono text-xs text-amber-400 select-all">
                      import &apos;@promethean/atlas-ui/dist/style.css&apos;;
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2 items-start text-[10px] text-zinc-500 font-mono leading-relaxed border-t border-white/5 pt-4">
                  <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Atlas maps require an active Google Maps API key loaded with full Vector and 3D Tilt capabilities.</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-lg">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
                  <Cpu className="w-4 h-4 text-amber-400" /> Embedded Component Usage
                </h3>
                <pre className="bg-black/60 border border-white/10 p-4 rounded font-mono text-[11px] text-zinc-300 overflow-x-auto">
{`import React from 'react';
import { SovereignMap } from '@promethean/atlas-ui';

export default function GeospatialCockpit() {
  const handleNodeClick = (assetId: string) => {
    console.log(\`Displaying detailed telemetry for asset: \${assetId}\`);
  };

  return (
    <div className="w-full h-[500px] border border-white/5 rounded-lg overflow-hidden">
      <SovereignMap 
        theme="cinematic-dark"
        center={{ lat: 30.3322, lng: -81.6557 }}
        zoom={14}
        tilt={45}
        heading={90}
        showPulseNetwork={true}
        enableInteractiveBubbles={true}
        onSelectNode={handleNodeClick}
      />
    </div>
  );
}`}
                </pre>
              </div>
            </div>
            
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
