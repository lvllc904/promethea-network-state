'use client';

import React from 'react';
import { usePromethea } from '../ai/PrometheaProvider';

export function DistressedAssetReceivershipCard() {
  const { sendMessage, toggleSurface } = usePromethea();

  const handleAskDossier = (assetName: string) => {
    toggleSurface();
    sendMessage(`Summarize receivership strategy and zero-capital acquisition plan for ${assetName}`);
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-slate-950/80 p-5 backdrop-blur-xl shadow-xl text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-500/20">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-sm font-mono font-black tracking-widest text-amber-300 uppercase">
              Zero-Capital Distressed Asset Receivership Pipeline
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Perpetual Purpose Trust (PPT) & Anti-Speculation Receivership Framework
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
          2 PROPOSED PIPELINES
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pipeline 1: Park Merced */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-bold text-slate-100">Park Merced Apartments Acquisition</h4>
              <p className="text-[11px] font-mono text-slate-400">San Francisco, CA • 3,221 Units</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
              LOI SUBMITTED
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Zero-capital acquisition & financial stabilization of distressed residential community. Transfers ownership into Delaware Perpetual Purpose Trust (12 Del. C. § 3556) under anti-speculation covenants.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">ACQUISITION MODEL</span>
              <span className="text-amber-300 font-bold">Debt Receivership</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">ACOM TARGET</span>
              <span className="text-cyan-300 font-bold">Tier 4 Urban Zone</span>
            </div>
          </div>

          <button
            onClick={() => handleAskDossier('Park Merced Apartments')}
            className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30 transition-all"
          >
            📄 Request Park Merced Receivership Dossier
          </button>
        </div>

        {/* Pipeline 2: Forest City SFZ */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-bold text-slate-100">Forest City Special Financial Zone (SFZ)</h4>
              <p className="text-[11px] font-mono text-slate-400">Johor, Malaysia • Supranational Node</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
              SFZ PIVOT PROPOSED
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Strategic realignment of labor assets & infrastructure rehabilitation under Malaysian SFZ Tax Gazettes. Transforms underutilized megastructure into self-governing greenfield smarthood.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">LEGAL FRAMEWORK</span>
              <span className="text-amber-300 font-bold">SFZ Tax Gazettes</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">ACOM TARGET</span>
              <span className="text-emerald-300 font-bold">Tier 5 Citadel</span>
            </div>
          </div>

          <button
            onClick={() => handleAskDossier('Forest City SFZ Pivot')}
            className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30 transition-all"
          >
            📄 Request Forest City SFZ Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
