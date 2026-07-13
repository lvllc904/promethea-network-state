'use client';

import React, { useState } from 'react';
import { 
  Rocket, 
  Milestone, 
  Layers, 
  Shield, 
  Cpu, 
  Database, 
  Clock, 
  History,
  ArrowUpRight,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@promethea/ui';
import { SovereignCockpit } from '@/components/SovereignCockpit';

export default function ChangelogPage() {
  const cockpitStats = [
    { label: 'Current Version', value: 'v5.4.0', color: 'text-amber-400' },
    { label: 'Completed Phases', value: '4 / 6', color: 'text-amber-400' },
    { label: 'Last System Sync', value: 'Just Now', color: 'text-amber-400' }
  ];

  const cockpitTabs = [
    {
      id: 'latest',
      label: 'Latest Wave Release',
      icon: <Rocket className="w-3 h-3" />,
      content: (
        <div className="space-y-6">
          {/* Wave 24 v5.4.0 Hero Banner */}
          <div className="p-8 bg-gradient-to-br from-amber-950/30 via-black to-zinc-950/40 border border-amber-500/30 rounded-xl relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px] font-mono tracking-widest uppercase py-1">Active Release</Badge>
                <span className="text-[10px] font-mono text-zinc-500">// June 2026 Non-Linear Conversations</span>
              </div>
              
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-3">
                Wave 24: Conversational Pivot Protocol & DSG Mind Map Canvas (v5.4.0)
              </h2>
              <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed mb-6">
                Migrated conversational history state from legacy linear timelines to dynamic Directed Semantic Graphs (DSG). Enabled asynchronous stream interruption, mid-stream pivoting, retroactive historical anchoring, and interactive SVG-rendered Mind Map Canvas overlays.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-amber-500/20 pt-6 mt-6">
                <div>
                  <h4 className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Cpu className="w-3 h-3" /> 1. DSG State Engine
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Conversational history represented as unique node graphs with ancestor-child mapping, traversed dynamically via retroactive active-path pointers.
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> 2. Mid-Stream Pivoting
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Asynchronous Halt & Splice client-to-server handlers terminate live LLM stream on-demand, spawning sibling branch extensions on key interrupt.
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Database className="w-3 h-3" /> 3. Mind Map Canvas
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Custom dependency-free SVG connector layouts render active dialogue paths in glowing amber, pulsing interrupted threads, and enabling interactive hot-anchoring.
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Layers className="w-3 h-3" /> 4. Universal SDK Spec
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Published a developer WebSocket and stream-abort specification, staging a free universal SDK framework at `/cpp-specification.md`.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Wave 14 Collateral Card */}
          <div className="p-6 bg-zinc-950/60 border border-zinc-800 rounded-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700/60 text-[8px] font-mono uppercase py-0.5">Previous Release</Badge>
              <span className="text-[10px] font-mono text-zinc-600">// June 2026 Milestone</span>
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">
              Wave 14: The Celestial Substrate
            </h3>
            <p className="text-xs text-zinc-450 leading-relaxed max-w-3xl mb-4">
              Elevation of the Promethean Sovereign Atlas to a high-fidelity geographic and astronomical operating system. We successfully projected real-world deep space star catalogs directly into our WebGL rendering substrate, plotting RA ($\alpha$) and Dec ($\delta$) into 3D Cartesian points.
            </p>
          </div>

          {/* 3D Zoom-Continuum Patches */}
          <Card className="bg-gray-900/60 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm text-white uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                3D Zoom-Continuum & Telemetry Patches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-black/40 rounded border border-zinc-800/80 leading-relaxed">
                <ul className="space-y-3 text-xs text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono mt-0.5">&gt;</span>
                    <span><strong>Smooth Transition Zoom:</strong> Enhanced the WebGL map camera controller with exponential ease functions, ensuring stutter-free zoom-to-focus transition limits.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono mt-0.5">&gt;</span>
                    <span><strong>Adaptive Scale Clamping:</strong> Dynamic vector rescaling adjusts point sizes during depth changes to avoid pop-in effects.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono mt-0.5">&gt;</span>
                    <span><strong>Local State Hydration:</strong> Stored and restored the User HUD Celestial Mesh preference via automated localStorage hydration hooks.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'phases',
      label: 'Phased System Roadmap',
      icon: <Milestone className="w-3 h-3" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Phase 4 Card */}
            <Card className="bg-amber-950/10 border-amber-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-black font-mono font-bold text-[8px] px-2 py-0.5 uppercase tracking-wider">
                ACTIVE
              </div>
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <span className="text-amber-400 font-mono">PHASE 4:</span>
                  Actualizing the Substrate
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-zinc-400 space-y-4 leading-relaxed">
                <p>Establishing the sovereign layer to host parallel societies and multi-tenant SPVs.</p>
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-[10px] text-amber-300 font-mono uppercase">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Wave 14: Celestial Substrate (Complete)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-amber-300 font-mono uppercase">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Syndicate Zero Data Isolation (Complete)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono uppercase">
                    <AlertCircle className="w-3.5 h-3.5 text-zinc-600 animate-pulse" />
                    <span>ZK-ID Edge Verifications (In Progress)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phase 3 Card */}
            <Card className="bg-gray-900/40 border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-black font-mono font-bold text-[8px] px-2 py-0.5 uppercase tracking-wider">
                COMPLETE
              </div>
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <span className="text-amber-400 font-mono">PHASE 3:</span>
                  Economic Sovereignty
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-zinc-400 space-y-4 leading-relaxed">
                <p>The activation of on-chain capital allocation, autonomous labor compensation, and decentralized yield distribution.</p>
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-[10px] text-amber-300 font-mono uppercase">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>50-Method Economic Core (Complete)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-amber-300 font-mono uppercase">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sovereign Treasury & Cap Table (Complete)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-amber-300 font-mono uppercase">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Decentralized Land Inventory (Complete)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phase 2 Card */}
            <Card className="bg-gray-900/40 border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-black font-mono font-bold text-[8px] px-2 py-0.5 uppercase tracking-wider">
                COMPLETE
              </div>
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <span className="text-amber-400 font-mono">PHASE 2:</span>
                  Birth of Promethea
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-zinc-400 space-y-4 leading-relaxed">
                <p>Integrating Promethea's Clojure cognitive brain and executing sovereign alignment protocols.</p>
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-[10px] text-amber-300 font-mono uppercase">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Unified State Vector Alignment (Complete)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-amber-300 font-mono uppercase">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Symbiotic Memory Daemon (Complete)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phase 1 Card */}
            <Card className="bg-gray-900/40 border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-black font-mono font-bold text-[8px] px-2 py-0.5 uppercase tracking-wider">
                COMPLETE
              </div>
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <span className="text-amber-400 font-mono">PHASE 1:</span>
                  Foundational MVP & SSI
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-zinc-400 space-y-4 leading-relaxed">
                <p>NPM Workspace refactoring, cryptographic browser handshakes, and fully stateless DID registries.</p>
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-[10px] text-amber-300 font-mono uppercase">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ethers-based Cryptographic Handshake (Complete)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-amber-300 font-mono uppercase">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Zero-Trust Read-Only Access (Complete)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )
    },
    {
      id: 'audit-logs',
      label: 'System Audit Logs',
      icon: <History className="w-3 h-3" />,
      content: (
        <div className="space-y-4">
          <Card className="bg-gray-900/40 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-white uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                Auditable System Log Entries
              </CardTitle>
              <Badge className="bg-zinc-800 text-zinc-400 text-[8px] font-mono">NODE_COUNT: 12</Badge>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-[10px] space-y-3 bg-black/60 p-4 rounded border border-zinc-800 overflow-x-auto leading-relaxed max-h-[350px] overflow-y-auto">
                <div className="text-zinc-500">
                  <span className="text-amber-400">[2026-06-05T03:32:11Z]</span> [INFO] [COSMOS_PIPELINE] Compiled catalog file 'cosmos_deep_field.json' successfully. Size: 254.28 KB.
                </div>
                <div className="text-zinc-500">
                  <span className="text-amber-400">[2026-06-05T03:35:48Z]</span> [SUCCESS] [WEBGL_ENGINE] Loaded DeepFieldPoints mesh synchronously. Buffer geometry bound for 2,000 points.
                </div>
                <div className="text-zinc-500">
                  <span className="text-amber-400">[2026-06-05T03:41:09Z]</span> [INFO] [HUD_STORE] CelestialMesh default value hydrated from localStore state. Preferred: true.
                </div>
                <div className="text-zinc-500">
                  <span className="text-amber-400">[2026-06-05T03:45:51Z]</span> [INFO] [ROUTER] Re-routed Section 5 timeline checklists to centralized '/dashboard/changelog'.
                </div>
                <div className="text-zinc-600">
                  <span className="text-zinc-500">[2026-06-04T12:08:44Z]</span> [SUCCESS] [CARRY_TRADE] Deployed Carry Trade yield routing algorithm to sovereign reserve manager.
                </div>
                <div className="text-zinc-600">
                  <span className="text-zinc-500">[2026-06-02T19:42:25Z]</span> [INFO] [SBI_CORE] Aligned state vector projection boundaries. High-dimensional distance: 0.082.
                </div>
                <div className="text-zinc-600">
                  <span className="text-zinc-500">[2026-05-28T09:12:00Z]</span> [SUCCESS] [ZERO_FIREBASE] Decommissioned secondary Firebase Client Auth wrapper. JWT migration achieved.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <div className="h-full">
      <SovereignCockpit 
        title="Sovereign Changelog & Timelines"
        description="Unified release notes, wave deployments, and auditable system progression"
        stats={cockpitStats}
        tabs={cockpitTabs}
      />
    </div>
  );
}
