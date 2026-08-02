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
    <div className="relative w-full rounded-xl bg-slate-900/40 p-3 backdrop-blur-md shadow-2xl overflow-hidden text-slate-100">
      <div className="flex items-center justify-between pb-1.5 mb-2">
        <div>
          <h3 className="text-[10px] font-bold text-slate-100 tracking-tight flex items-center gap-1">
            <span className="text-cyan-400">🌊</span> Metabolic Waterfall
          </h3>
          <p className="text-[8px] text-slate-400">
            PUE {pue} | WUE {wue} | CUE {cue}
          </p>
        </div>
        <div className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 text-[8px] font-mono">
          Live
        </div>
      </div>

      {/* SVG River Cascading Diagram - Compact */}
      <div className="relative w-full h-36 rounded-lg bg-slate-950/40 p-2 flex flex-col justify-between">
        
        {/* Tier 1: Top Stream - Thermodynamic Tax */}
        <div className="flex items-center justify-between bg-slate-800/40 rounded p-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-[8px]">
              T1
            </div>
            <div className="text-[8px] font-bold text-amber-300">
              Thermodynamic Tax (τ)
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-bold text-amber-400">{tauTaxPercent}% FCF</div>
          </div>
        </div>

        {/* Dynamic Water Animation Streams - Super Compact */}
        <div className="relative h-4 flex items-center justify-center my-0.5">
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
              strokeDasharray="4 3"
              animate={{ strokeDashoffset: [0, -10] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          </svg>
        </div>

        {/* Tier 2 & 3: Sovereignty Share (51%) */}
        <div className="grid grid-cols-2 gap-1.5 mb-1">
          <div className="bg-sky-950/20 rounded p-1 flex justify-between items-center text-[8px]">
            <span className="text-sky-300">Civic</span>
            <span className="font-mono font-bold text-sky-400">{peacePercent}%</span>
          </div>

          <div className="bg-indigo-950/20 rounded p-1 flex justify-between items-center text-[8px]">
            <span className="text-indigo-300">Host</span>
            <span className="font-mono font-bold text-indigo-400">{hostPercent}%</span>
          </div>
        </div>

        {/* Tier 4: Global Capital Yield (49%) */}
        <div className="bg-emerald-950/20 rounded p-1.5 flex items-center justify-between">
          <div className="text-[8px] font-bold text-emerald-300">
            Tier 4: Global Yield
          </div>
          <div className="text-right">
            <div className="text-[8px] font-bold text-emerald-400 font-mono">49% FCF</div>
          </div>
        </div>

      </div>

      {/* Footer Metadata */}
      <div className="mt-1.5 flex items-center justify-between text-[7px] text-slate-500 pt-1">
        <span>TPNS 21/30/49 Standard</span>
        <span className="text-emerald-400 font-mono">DRULPA § 17-218</span>
      </div>
    </div>
  );
};
