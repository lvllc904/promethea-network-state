'use client';

import React from 'react';

interface SOPDomain {
  code: string;
  name: string;
  score: number;
  status: 'OPTIMAL' | 'STABILIZING' | 'ATTENTION';
  metrics: string[];
}

const SOP_DOMAINS: SOPDomain[] = [
  {
    code: 'DOMAIN A',
    name: 'Foundation & Establishing Concerns',
    score: 98,
    status: 'OPTIMAL',
    metrics: ['Constitution Ratified', 'PPT Bylaws Active', 'Perpetual Trust Verified'],
  },
  {
    code: 'DOMAIN B',
    name: 'Control Concerns & Receivership',
    score: 94,
    status: 'STABILIZING',
    metrics: ['Park Merced LOI Active', 'DRULPA Series SPV Ready', 'Anti-Speculation Covenants'],
  },
  {
    code: 'DOMAIN C',
    name: 'Thermodynamic Engineering',
    score: 91,
    status: 'OPTIMAL',
    metrics: ['PUE Ratio: 1.12', 'WUE Metric: 0.85 L/kWh', 'Thermal Recycling Synced'],
  },
  {
    code: 'DOMAIN D',
    name: 'Autonomous Logistics',
    score: 88,
    status: 'STABILIZING',
    metrics: ['Supply Chain Decentralized', 'Agricultural Nodes Active', 'Mesh Telemetry Operational'],
  },
  {
    code: 'DOMAIN E',
    name: 'Tokenomics & Sovereign Exit',
    score: 95,
    status: 'OPTIMAL',
    metrics: ['UVT Smart Contracts Verified', '$PEACE / $YIELD Split Active', 'Wealth Attenuation Enforced'],
  },
  {
    code: 'DOMAIN F',
    name: 'Support Apparatus',
    score: 96,
    status: 'OPTIMAL',
    metrics: ['Promethea Matrix Unified', 'Vertex RAG Grounding Active', 'Zero-Trust Sandboxed'],
  },
];

export function SOPHealthMatrix() {
  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-5 backdrop-blur-xl shadow-xl text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-mono font-black tracking-widest text-emerald-300 uppercase">
              SOP Governance & Operational Matrix (Domains A–F)
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Standard Operating Procedure Compliance & Telemetry Engine
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
          HEALTH SCORE: 93.6%
        </span>
      </div>

      {/* Grid of 6 Domains */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SOP_DOMAINS.map((domain) => (
          <div
            key={domain.code}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2 hover:border-cyan-500/40 transition-all"
          >
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-cyan-400 font-bold">{domain.code}</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  domain.status === 'OPTIMAL'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}
              >
                {domain.status}
              </span>
            </div>

            <div className="text-xs font-bold text-slate-100 leading-snug">{domain.name}</div>

            {/* Score Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Compliance Score</span>
                <span className="text-cyan-300 font-bold">{domain.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                  style={{ width: `${domain.score}%` }}
                />
              </div>
            </div>

            {/* Bullet Metrics */}
            <ul className="text-[11px] font-mono text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
              {domain.metrics.map((m, i) => (
                <li key={i} className="flex items-center space-x-1.5">
                  <span className="text-cyan-400">›</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
