'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Shield, Cpu, Scale, Network, Lock, Zap, ArrowRight, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useMesh } from '@/components/providers/mesh-provider';

const BirdsBackground = dynamic(() => import('../../components/ui/BirdsBackground'), { ssr: false });

export default function SovereignSubstrateWhitepaperPage() {
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
          <span className="font-headline font-black tracking-[0.2em] text-xs text-foreground dark:text-white">KNOWLEDGE HUB</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 text-[10px] font-mono font-bold rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 uppercase tracking-widest">
            Substrate Spec v1.0.0
          </span>
        </div>
      </header>

      <div className="relative z-10 w-full pt-40 pb-32 px-8 md:px-16 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-8">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest">Technical Whitepaper</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40 uppercase">
            The Sovereign Substrate
          </h1>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-8 text-amber-400/90 font-mono">
            Zero-Trust P2P Holographic Chain & Verifiable Edge Sovereign Architecture
          </h2>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-10 font-mono text-xs">
            <div className="p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md">
              <div className="text-zinc-500 mb-1">State Paradigm</div>
              <div className="text-amber-300 font-bold">Merkle DAG Mesh</div>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md">
              <div className="text-zinc-500 mb-1">Identity Root</div>
              <div className="text-amber-300 font-bold">EIP-7212 Passkeys</div>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md">
              <div className="text-zinc-500 mb-1">Compute Plane</div>
              <div className="text-amber-300 font-bold">zkVM RISC-V</div>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md">
              <div className="text-zinc-500 mb-1">Settlement Yield</div>
              <div className="text-amber-300 font-bold">21 / 30 / 49 Split</div>
            </div>
          </div>
          
          <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-600 dark:text-zinc-400 leading-relaxed">
            
            <h3 className="text-2xl font-bold text-white mt-12 mb-4">Abstract</h3>
            <p className="mb-6">
              The <strong>Promethean Sovereign Substrate</strong> is a verifiable, zero-trust, peer-to-peer (P2P) computing and governance infrastructure engineered for Network States and autonomous special economic zones. By replacing centralized cloud databases with <strong>Holographic State Projections</strong>, <strong>Progressive Biometric Key Blending</strong>, <strong>Edge zkVM Thermodynamic & Labor Engines</strong>, and <strong>Dual-Class Civic-Economic Tokenomics</strong>, the Substrate guarantees institutional resilience against single points of capture.
            </p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">1. Theoretical Foundations: The Holographic Paradigm</h3>
            <p className="mb-6">
              Traditional Web2 architectures require clients to trust remote API gateways and centralized databases (PostgreSQL, MySQL). In the Holographic Chain, every participant device maintains a <strong>local projection screen</strong> (embedded SQLite or IndexedDB) that ingests cryptographically signed <strong>Basic Information Timestamps (BITs)</strong>:
            </p>
            
            <div className="bg-black/60 p-6 rounded-xl border border-amber-500/20 font-mono text-sm mb-6 text-amber-300">
              {"\\Psi = \\mathcal{M}(\\bigcup_{i=1}^{N} \\text{BIT}_i)"}
            </div>

            <p className="mb-6">
              State propagation occurs asynchronously over WebRTC data channels via probabilistic gossip using <strong>DIDComm v2</strong>, ensuring zero single points of failure and complete offline operational continuity.
            </p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">2. Progressive Biometric Key Blending</h3>
            <p className="mb-6">
              Citizens authenticate using hardware secure enclaves (EIP-7212 / WebAuthn) without seed phrases. To link heterogeneous legacy wallets into a unified sovereign personhood, keys are blended client-side into the <strong>Holographic Blended Hash (Ψ)</strong>:
            </p>

            <div className="bg-black/60 p-6 rounded-xl border border-amber-500/20 font-mono text-sm mb-6 text-amber-300">
              {"\\Psi = \\mathcal{H}(\\text{DID}_{\\text{Sovereign}} \\parallel \\mathcal{H}(\\text{Biometric Passkey}) \\parallel \\mathcal{H}(\\text{EVM Address}) \\parallel \\mathcal{H}(\\text{Solana Address}))"}
            </div>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">3. Verifiable zkVM Edge Compute Plane</h3>
            <p className="mb-6">
              Ecological sustainability and labor allocations are computed inside a RISC Zero / SP1 zero-knowledge virtual machine:
            </p>
            
            <div className="bg-black/60 p-6 rounded-xl border border-amber-500/20 font-mono text-sm mb-6 text-amber-300">
              {"\\tau = L_b \\cdot [1 + w_P \\cdot (\\text{PUE} - 1.0) + w_W \\cdot (\\text{WUE} / \\kappa) + w_C \\cdot C_{\\text{grid}}]"}
            </div>
            
            <ul className="list-disc pl-6 space-y-2 mb-6 text-sm">
              <li><strong>L_b:</strong> Base lease rate per compute module.</li>
              <li><strong>PUE:</strong> Power Usage Effectiveness (Total Facility Power / IT Equipment Power).</li>
              <li><strong>WUE / κ:</strong> Water usage relative to sustainable local replenishment rate.</li>
              <li><strong>C_grid:</strong> Real-time grid carbon intensity.</li>
            </ul>

            <h3 className="text-2xl font-bold text-white mt-12 mb-4">4. Dual-Class Tokenomics & Metabolic Waterfall</h3>
            <p className="mb-6">
              Settlement executes on an OP Stack L2 via three audited smart contracts:
            </p>

            <div className="space-y-4 my-8">
              <div className="p-6 rounded-xl border border-white/5 bg-black/40">
                <div className="flex items-center gap-3 mb-2 font-mono text-sm font-bold text-amber-400">
                  <Shield className="w-4 h-4" /> PEACEToken.sol (Soulbound Civic Veto)
                </div>
                <p className="text-sm text-zinc-400">
                  51% local voting veto power. Strictly non-transferable, minted and revoked solely by the Perpetual Purpose Trust (PPT).
                </p>
              </div>

              <div className="p-6 rounded-xl border border-white/5 bg-black/40">
                <div className="flex items-center gap-3 mb-2 font-mono text-sm font-bold text-amber-400">
                  <Lock className="w-4 h-4" /> YIELDToken.sol (SEC Reg D 506(c) Equity)
                </div>
                <p className="text-sm text-zinc-400">
                  49% Series SPV economic equity. Restricts transfers with bidirectional compliance whitelist verification on all parties.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-white/5 bg-black/40">
                <div className="flex items-center gap-3 mb-2 font-mono text-sm font-bold text-amber-400">
                  <Zap className="w-4 h-4" /> MetabolicWaterfall.sol (21/30/49 Yield Routing)
                </div>
                <p className="text-sm text-zinc-400">
                  Automates non-custodial disbursement: 21% Host Sovereign Treasury, 30% Resident Community Wealth Fund, and 49% Operational OpEx (absorbing division dust).
                </p>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between">
              <Link href="/whitepaper" className="inline-flex items-center gap-2 text-sm font-mono font-bold text-amber-400 hover:text-amber-300">
                <ArrowLeft className="w-4 h-4" /> Back to Knowledge Hub
              </Link>
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors">
                Enter Sovereign Cockpit <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
