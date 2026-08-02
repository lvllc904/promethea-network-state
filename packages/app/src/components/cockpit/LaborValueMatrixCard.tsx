'use client';

import React from 'react';

interface LaborValueMatrixCardProps {
  laborValueUsd?: number;
  riskMultiplier?: number;
  peaceVotingPower?: number;
  yieldEquityShare?: number;
  capitalCallTarget?: number;
  capitalCallFunded?: number;
  fcfMarginAvg?: number;
}

export const LaborValueMatrixCard: React.FC<LaborValueMatrixCardProps> = ({
  laborValueUsd = 4200,
  riskMultiplier = 2.0,
  peaceVotingPower = 51,
  yieldEquityShare = 49,
  capitalCallTarget = 500000,
  capitalCallFunded = 40,
  fcfMarginAvg = 15,
}) => {
  const sweatEquityValuation = laborValueUsd * riskMultiplier;

  return (
    <div className="relative w-full bg-slate-900/40 p-3 backdrop-blur-md shadow-2xl text-slate-100 space-y-2">
      {/* 1. Labor Value Matrix Header */}
      <div>
        <h3 className="text-[10px] font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
          <span className="text-amber-400">⚡</span> Labor Value Matrix
        </h3>
        <p className="text-[8px] text-slate-400">
          Sweat Equity Valuation = $M × R_p
        </p>
      </div>

      {/* Formula & Valuation Box */}
      <div className="bg-slate-950/40 p-2 rounded flex justify-between items-center text-[8px]">
        <div className="space-y-0.5">
          <div className="text-[7px] text-slate-400">Sweat Equity Value</div>
          <div className="text-sm font-extrabold text-amber-400 font-mono">
            ${sweatEquityValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[6px] text-slate-400">
            $M: ${laborValueUsd.toLocaleString()} | R_p: {riskMultiplier}x
          </div>
        </div>

        <div className="flex flex-col space-y-0.5 pl-2 border-l border-slate-800 text-[7px] text-slate-300">
          <div>Vested: <span className="font-mono text-emerald-400">Class B</span></div>
          <div>Profits: <span className="font-mono text-cyan-400">93-27</span></div>
          <div>83(b): <span className="font-mono text-emerald-400">Filed</span></div>
        </div>
      </div>

      {/* 2. Dual-Token Cap Table ($PEACE & $YIELD) */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-sky-950/20 p-2 rounded">
          <div className="text-[8px] font-bold text-sky-300">$PEACE (Soulbound)</div>
          <div className="text-xs font-extrabold text-sky-400 font-mono">{peaceVotingPower}% Voting</div>
        </div>

        <div className="bg-emerald-950/20 p-2 rounded">
          <div className="text-[8px] font-bold text-emerald-300">$YIELD (Reg D)</div>
          <div className="text-xs font-extrabold text-emerald-400 font-mono">{yieldEquityShare}% Equity</div>
        </div>
      </div>

      {/* 3. Capital Call & Wire Tracker & Exit Buyout Trigger */}
      <div className="space-y-1.5 pt-1.5 border-t border-slate-800">
        {/* Capital Call Progress */}
        <div className="bg-slate-800/20 p-1.5 rounded">
          <div className="flex justify-between items-center text-[7px] mb-1">
            <span className="text-slate-300">Capital Call Tracker</span>
            <span className="font-mono text-emerald-400 font-bold">{capitalCallFunded}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${capitalCallFunded}%` }}></div>
          </div>
        </div>

        {/* Buyout Trigger */}
        <div className="bg-slate-800/20 p-1.5 rounded text-[7px] flex justify-between items-center">
          <span className="text-slate-300">Buyout Discount (δ)</span>
          <span className="font-mono text-amber-400 font-bold">25% (FCF {fcfMarginAvg}%)</span>
        </div>
      </div>
    </div>
  );
};
