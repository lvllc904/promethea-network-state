'use client';

import React, { useState } from 'react';
import { Layers, Network, ShieldCheck, Zap, ArrowRight, Database, Building2, Coins, CheckCircle, Cpu } from 'lucide-react';

type GraphicMode = 'DELAWARE_SPV' | 'THREE_BODY' | 'ACOM_FLOW';

export function LandingInfographic() {
  const [activeGraphic, setActiveGraphic] = useState<GraphicMode>('DELAWARE_SPV');

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Accent */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-500/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-widest mb-4">
          <Network className="w-3.5 h-3.5" />
          <span>Interactive System Infographics</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Visual Architecture Diagrams
        </h2>
        <p className="mt-3 text-base sm:text-lg text-zinc-400 max-w-2xl font-light">
          Explore the underlying legal, corporate, and cryptographic topologies powering the Promethean Network State.
        </p>
      </div>

      {/* Tab Controls */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex p-1.5 gap-1.5 overflow-x-auto max-w-full" style={{ borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 16px rgba(0,0,0,0.4)' }}>
          <button
            onClick={() => setActiveGraphic('DELAWARE_SPV')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
              activeGraphic === 'DELAWARE_SPV'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-4 h-4" /> Delaware Series SPV
          </button>
          <button
            onClick={() => setActiveGraphic('THREE_BODY')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
              activeGraphic === 'THREE_BODY'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" /> 3-Body Network State
          </button>
          <button
            onClick={() => setActiveGraphic('ACOM_FLOW')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
              activeGraphic === 'ACOM_FLOW'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-4 h-4" /> ACOM Autonomous Flow
          </button>
        </div>
      </div>

      {/* Main Infographic Canvas Card */}
      <div className="relative overflow-hidden backdrop-blur-xl" style={{ background: 'rgba(5,7,10,0.9)', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 8px 64px rgba(0,0,0,0.6)' }}>
        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* 1. Delaware Series SPV Infographic */}
        {activeGraphic === 'DELAWARE_SPV' && (
          <div className="relative z-10 space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">
                STATUTORY ISOLATED LIABILITIES (6 DEL. C. § 18-215)
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">Master Delaware LLC & Series SPV Topology</h3>
            </div>

            {/* SVG Visual Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Box 1: Master LLC */}
              <div className="p-6 flex flex-col items-center text-center space-y-3 relative group" style={{ background: 'rgba(16,185,129,0.04)', borderRadius: '1.25rem', boxShadow: '0 0 0 1px rgba(16,185,129,0.12)' }}>
                <div className="w-12 h-12 flex items-center justify-center text-emerald-400 font-bold" style={{ borderRadius: '0.75rem', background: 'rgba(16,185,129,0.15)' }}>
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Master Delaware LLC</h4>
                <p className="text-xs text-zinc-400 font-light">Root legal entity registered under Delaware Secretary of State. Manages master operating agreement.</p>
                <span className="px-2.5 py-1 text-[10px] font-mono text-emerald-400 font-bold" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.4rem' }}>
                  State File #7492-DE
                </span>
              </div>

              {/* Arrow 1 */}
              <div className="hidden md:flex items-center justify-center">
                <div className="flex flex-col items-center gap-1 text-emerald-400">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500">ISOLATED SERIES</span>
                  <ArrowRight className="w-8 h-8 animate-pulse text-emerald-400" />
                </div>
              </div>

              {/* Box 2: Series A-1 Asset SPV */}
              <div className="p-6 flex flex-col items-center text-center space-y-3 relative group" style={{ background: 'rgba(245,158,11,0.04)', borderRadius: '1.25rem', boxShadow: '0 0 0 1px rgba(245,158,11,0.12)' }}>
                <div className="w-12 h-12 flex items-center justify-center text-amber-400 font-bold" style={{ borderRadius: '0.75rem', background: 'rgba(245,158,11,0.15)' }}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Series Asset SPV (A-1)</h4>
                <p className="text-xs text-zinc-400 font-light">Protected Series holding title deeds, compute node title, or IP contracts. Liabilities isolated strictly to Series A-1.</p>
                <span className="px-2.5 py-1 text-[10px] font-mono text-amber-400 font-bold" style={{ background: 'rgba(245,158,11,0.08)', borderRadius: '0.4rem' }}>
                  Firewalled Debt Liability
                </span>
              </div>

              {/* Arrow 2 */}
              <div className="hidden md:flex items-center justify-center">
                <div className="flex flex-col items-center gap-1 text-cyan-400">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500">ON-CHAIN MINT</span>
                  <ArrowRight className="w-8 h-8 animate-pulse text-cyan-400" />
                </div>
              </div>

              {/* Box 3: Smart Contract Escrow */}
              <div className="p-6 flex flex-col items-center text-center space-y-3 relative group" style={{ background: 'rgba(6,182,212,0.04)', borderRadius: '1.25rem', boxShadow: '0 0 0 1px rgba(6,182,212,0.12)' }}>
                <div className="w-12 h-12 flex items-center justify-center text-cyan-400 font-bold" style={{ borderRadius: '0.75rem', background: 'rgba(6,182,212,0.15)' }}>
                  <Database className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">On-Chain Cap Table</h4>
                <p className="text-xs text-zinc-400 font-light">Smart contract escrow mapping tokenized shares directly to authenticated member DIDs with automated distribution.</p>
                <span className="px-2.5 py-1 text-[10px] font-mono text-cyan-400 font-bold" style={{ background: 'rgba(6,182,212,0.08)', borderRadius: '0.4rem' }}>
                  Automated UCC-1 Escrow
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Three-Body Model Infographic */}
        {activeGraphic === 'THREE_BODY' && (
          <div className="relative z-10 space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">
                CONSTITUTIONAL SEPARATION OF CONCERNS
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">Three-Body Network State Model</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Body 1: Passport */}
              <div className="p-6 text-center space-y-3" style={{ background: 'rgba(56,189,248,0.04)', borderRadius: '1.25rem', boxShadow: '0 0 0 1px rgba(56,189,248,0.12)' }}>
                <div className="w-12 h-12 text-sky-400 flex items-center justify-center mx-auto" style={{ borderRadius: '0.75rem', background: 'rgba(56,189,248,0.15)' }}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">1. Sovereign Passport</h4>
                <p className="text-xs text-zinc-400 font-light">Zero-knowledge citizen identity, biometric DID cryptographic proof, and diplomat badge access.</p>
                <ul className="text-[11px] font-mono text-sky-400 space-y-1 pt-2">
                  <li>• ZK Citizen Credential</li>
                  <li>• Cross-Border Reciprocity</li>
                </ul>
              </div>

              {/* Body 2: Treasury */}
              <div className="p-6 text-center space-y-3" style={{ background: 'rgba(16,185,129,0.04)', borderRadius: '1.25rem', boxShadow: '0 0 0 1px rgba(16,185,129,0.12)' }}>
                <div className="w-12 h-12 text-emerald-400 flex items-center justify-center mx-auto" style={{ borderRadius: '0.75rem', background: 'rgba(16,185,129,0.15)' }}>
                  <Coins className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">2. Sovereign Treasury</h4>
                <p className="text-xs text-zinc-400 font-light">Audited real-world asset cap tables, yield distribution engine, and multi-sig vault reserves.</p>
                <ul className="text-[11px] font-mono text-emerald-400 space-y-1 pt-2">
                  <li>• $14.2M Real Estate Collateral</li>
                  <li>• Automated USDC Dividend Clearing</li>
                </ul>
              </div>

              {/* Body 3: Consensus */}
              <div className="p-6 text-center space-y-3" style={{ background: 'rgba(168,85,247,0.04)', borderRadius: '1.25rem', boxShadow: '0 0 0 1px rgba(168,85,247,0.12)' }}>
                <div className="w-12 h-12 text-purple-400 flex items-center justify-center mx-auto" style={{ borderRadius: '0.75rem', background: 'rgba(168,85,247,0.15)' }}>
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">3. Sovereign Governance</h4>
                <p className="text-xs text-zinc-400 font-light">Quadratic voting, constitutional referendum execution, and veto sentinel monitoring.</p>
                <ul className="text-[11px] font-mono text-purple-400 space-y-1 pt-2">
                  <li>• Quadratic Veto System</li>
                  <li>• On-Chain Executive Will</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 3. ACOM Flow Infographic */}
        {activeGraphic === 'ACOM_FLOW' && (
          <div className="relative z-10 space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
                AUTONOMOUS COGNITIVE ECONOMIC ENGINE
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">ACOM Agent Execution & Settlement Loop</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 text-center space-y-2" style={{ background: 'rgba(6,182,212,0.04)', borderRadius: '1.25rem', boxShadow: '0 0 0 1px rgba(6,182,212,0.1)' }}>
                <div className="text-xs font-mono text-cyan-400 font-bold">STEP 1</div>
                <h4 className="text-sm font-bold text-white">AI Agent Intent</h4>
                <p className="text-[11px] text-zinc-400 font-light">AI agent evaluates yield telemetry and formulates asset allocation intent.</p>
              </div>

              <div className="p-5 text-center space-y-2" style={{ background: 'rgba(16,185,129,0.04)', borderRadius: '1.25rem', boxShadow: '0 0 0 1px rgba(16,185,129,0.1)' }}>
                <div className="text-xs font-mono text-emerald-400 font-bold">STEP 2</div>
                <h4 className="text-sm font-bold text-white">Risk Sentinel Audit</h4>
                <p className="text-[11px] text-zinc-400 font-light">Immune system verifies compliance with Delaware SPV legal boundaries.</p>
              </div>

              <div className="p-5 text-center space-y-2" style={{ background: 'rgba(245,158,11,0.04)', borderRadius: '1.25rem', boxShadow: '0 0 0 1px rgba(245,158,11,0.1)' }}>
                <div className="text-xs font-mono text-amber-400 font-bold">STEP 3</div>
                <h4 className="text-sm font-bold text-white">Escrow Clearing</h4>
                <p className="text-[11px] text-zinc-400 font-light">Escrow smart contract locks liquidity and executes atomic swap.</p>
              </div>

              <div className="p-5 text-center space-y-2" style={{ background: 'rgba(168,85,247,0.04)', borderRadius: '1.25rem', boxShadow: '0 0 0 1px rgba(168,85,247,0.1)' }}>
                <div className="text-xs font-mono text-purple-400 font-bold">STEP 4</div>
                <h4 className="text-sm font-bold text-white">State Settlement</h4>
                <p className="text-[11px] text-zinc-400 font-light">Title updated on Sovereign Ledger with immutable cryptographic proof.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
