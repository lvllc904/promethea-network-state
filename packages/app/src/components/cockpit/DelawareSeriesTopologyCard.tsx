'use client';

import React from 'react';

interface SeriesSPVItem {
  id: string;
  name: string;
  type: string;
  status: 'Isolated' | 'Pending' | 'Active';
}

interface DelawareSeriesTopologyCardProps {
  parentMasterName?: string;
  seriesList?: SeriesSPVItem[];
}

export const DelawareSeriesTopologyCard: React.FC<DelawareSeriesTopologyCardProps> = ({
  parentMasterName = 'TPNS Master LLC',
  seriesList = [
    { id: '01', name: 'Series 01: Chester County Land', type: 'Protected Series', status: 'Isolated' },
    { id: '02', name: 'Series 02: NY Workforce Housing', type: 'Registered Series', status: 'Isolated' },
    { id: '03', name: 'Series 03: Off-Grid Utilities', type: 'Protected Series', status: 'Isolated' },
  ],
}) => {
  return (
    <div className="relative w-full rounded-xl bg-slate-900/40 p-4 backdrop-blur-md shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
            <span className="text-sky-400">🛡️</span> Delaware Master-Series Infrastructure (DRULPA § 17-218)
          </h3>
          <p className="text-[10px] text-slate-400">
            Statutory Ring-Fencing & Cryptographic Isolation between Master LP & Child SPVs
          </p>
        </div>
        <div className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[9px] font-mono">
          Shield Active
        </div>
      </div>

      {/* Topology Diagram */}
      <div className="flex flex-col items-center py-3 bg-slate-950/40 rounded mb-3 p-3">
        {/* Parent Master */}
        <div className="flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-r from-sky-900/40 to-slate-800 shadow-lg mb-4">
          <div className="text-sm text-sky-300">🏛️</div>
          <div>
            <div className="text-xs font-bold text-slate-100">{parentMasterName}</div>
            <div className="text-[9px] text-sky-400 font-mono">Parent Master Series LP</div>
          </div>
        </div>

        {/* Connecting Lines */}
        <div className="w-4/5 h-2 border-t border-x border-dashed border-sky-500/20 rounded-t mb-2"></div>

        {/* Child SPVs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          {seriesList.map((series) => (
            <div
              key={series.id}
              className="relative p-3 rounded bg-slate-900/90 hover:bg-slate-800/80 transition-colors flex flex-col items-center text-center shadow-md group"
            >
              <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 text-sm mb-1.5 group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <div className="text-[10px] font-bold text-slate-200 mb-0.5">{series.name}</div>
              <div className="text-[8px] text-slate-400 mb-2">{series.type}</div>
              
              <div className="mt-auto px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-[8px] font-mono flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                {series.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory & Chain of Custody Checklist Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[9px]">
        <div className="bg-slate-800/20 p-2 rounded">
          <div className="font-semibold text-slate-300">1. Entity ID (EIN)</div>
          <div className="text-slate-400 text-[8px]">Child SPVs 01-03 mapped with active EIN.</div>
        </div>
        <div className="bg-slate-800/20 p-2 rounded">
          <div className="font-semibold text-slate-300">2. SEC Form D</div>
          <div className="text-emerald-400 text-[8px] font-mono">✓ Filed within 15 days</div>
        </div>
        <div className="bg-slate-800/20 p-2 rounded">
          <div className="font-semibold text-slate-300">3. Registered Series</div>
          <div className="text-emerald-400 text-[8px] font-mono">✓ Franchise Tax Paid</div>
        </div>
      </div>
    </div>
  );
};
