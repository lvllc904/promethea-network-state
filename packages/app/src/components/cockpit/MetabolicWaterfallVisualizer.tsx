'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MetabolicWaterfallVisualizerProps {
  pue?: number;
  wue?: number;
  cue?: number;
  tauTaxPercent?: number;
  peacePercent?: number;
  hostPercent?: number;
  yieldPercent?: number;
  eotPercent?: number;
}

export const MetabolicWaterfallVisualizer: React.FC<MetabolicWaterfallVisualizerProps> = ({
  pue = 1.15,
  wue = 0.45,
  cue = 0.12,
  tauTaxPercent = 30,
  peacePercent = 30,
  hostPercent = 21,
  yieldPercent = 29,
  eotPercent = 20,
}) => {
  return (
    <div className="relative w-full rounded-xl bg-slate-900/60 p-3.5 backdrop-blur-md shadow-2xl overflow-hidden text-slate-100 border border-white/10">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div>
          <h3 className="text-xs font-bold text-slate-100 tracking-tight flex items-center gap-1.5 font-command">
            <span className="text-cyan-400">🌊</span> Metabolic Waterfall
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            PUE {pue} | WUE {wue} | CUE {cue}
          </p>
        </div>
        <div className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
          Live Telemetry
        </div>
      </div>

      {/* SVG River Cascading Diagram - Compact */}
      <div className="relative w-full rounded-lg bg-slate-950/60 p-2.5 flex flex-col justify-between border border-white/5 space-y-2">
        
        {/* Tier 1: Top Stream - Thermodynamic Tax (Amber Spectrum) */}
        <div className="flex items-center justify-between bg-amber-950/20 border border-amber-500/25 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-xs font-mono">
              T1
            </div>
            <div className="text-xs font-bold text-amber-300">
              Thermodynamic Tax (τ)
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-amber-400 font-mono tabular-nums">{tauTaxPercent}% FCF</div>
          </div>
        </div>

        {/* Dynamic Water Animation Streams - Calmed */}
        <div className="relative h-4 flex items-center justify-center my-0.5 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#34d399" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <motion.path
              d="M 200 0 Q 150 10 100 20 M 200 0 Q 250 10 300 20"
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="2"
              strokeDasharray="6 4"
              animate={{ strokeDashoffset: [0, -20] }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            />
          </svg>
        </div>

        {/* Tier 2 & 3: Sovereignty Share (51%) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-sky-950/30 border border-sky-500/20 rounded-lg p-2 flex justify-between items-center text-xs">
            <span className="text-sky-300">Civic Pool</span>
            <span className="font-mono font-bold text-sky-400 tabular-nums">{peacePercent}%</span>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-2 flex justify-between items-center text-xs">
            <span className="text-indigo-300">Host Reserve</span>
            <span className="font-mono font-bold text-indigo-400 tabular-nums">{hostPercent}%</span>
          </div>
        </div>

        {/* Tier 4: Global Capital Yield (49% - Green Spectrum) */}
        <div className="bg-emerald-950/30 border border-emerald-500/25 rounded-lg p-2 flex items-center justify-between">
          <div className="text-xs font-bold text-emerald-300">
            Tier 4: Global Yield
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-emerald-400 font-mono tabular-nums">49% FCF</div>
          </div>
        </div>

      </div>

      {/* Footer Metadata */}
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5 font-data">
        <span>TPNS 21/30/49 Standard</span>
        <span className="text-emerald-400 font-mono font-semibold">DRULPA § 17-218</span>
      </div>
    </div>
  );
};
