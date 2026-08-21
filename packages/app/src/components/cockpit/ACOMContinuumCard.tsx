'use client';

import React, { useState, useEffect } from 'react';
import { usePromethea } from '../ai/PrometheaProvider';

export interface RWAAsset {
  id: string;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5;
  status: 'PROPOSED' | 'RATIFIED' | 'ACTUALIZED' | 'SIMULATED';
  category: string;
  price: number;
  location: { nearestTown: string; state: string };
  description: string;
  acomTargetTier?: number;
}

const DEFAULT_ASSETS: RWAAsset[] = [
  {
    id: 'parkmerced-01',
    name: 'Park Merced Apartments (Receivership LOI)',
    tier: 3,
    status: 'PROPOSED',
    category: 'Distressed Real Estate',
    price: 125000000,
    location: { nearestTown: 'San Francisco', state: 'California' },
    description: '3,221-unit residential housing community targeted for zero-capital receivership stabilization and anti-speculation trust governance.',
    acomTargetTier: 4,
  },
  {
    id: 'forest-city-sfz',
    name: 'Forest City Special Financial Zone (SFZ)',
    tier: 4,
    status: 'PROPOSED',
    category: 'Supranational SFZ',
    price: 450000000,
    location: { nearestTown: 'Johor', state: 'Malaysia SFZ' },
    description: 'Special Financial Zone labor asset realignment and greenfield smarthood receivership under SFZ Tax Gazettes.',
    acomTargetTier: 5,
  },
  {
    id: 'ozark-ridge',
    name: 'Ozark Ridge Sanctuary',
    tier: 1,
    status: 'SIMULATED',
    category: 'Permaculture Research',
    price: 750000,
    location: { nearestTown: 'Jasper', state: 'Arkansas' },
    description: '42-acre autonomous land parcel dedicated to off-grid research and soil restoration.',
    acomTargetTier: 2,
  },
  {
    id: 'cascadia-node',
    name: 'Cascadia Agricultural Node',
    tier: 2,
    status: 'ACTUALIZED',
    category: 'Agriculture',
    price: 1250000,
    location: { nearestTown: 'Bellingham', state: 'Washington' },
    description: 'Cooperative organic farm producing high-yield heirloom crops and modular worker cabins.',
    acomTargetTier: 3,
  },
  {
    id: 'obsidian-press',
    name: 'The Obsidian Cafe & Press',
    tier: 1,
    status: 'ACTUALIZED',
    category: 'Community Hub',
    price: 340000,
    location: { nearestTown: 'Portland', state: 'Oregon' },
    description: 'Community-owned physical hub supporting sovereign gatherings and independent media.',
    acomTargetTier: 2,
  },
];

const TIER_NAMES = {
  1: 'Tier 1: Neighborhood Retail Node',
  2: 'Tier 2: Mixed-Use Urban District',
  3: 'Tier 3: Regional Economic Hub',
  4: 'Tier 4: Vertical Innovation Zone',
  5: 'Tier 5: Greenfield Sovereign Citadel',
};

export function ACOMContinuumCard() {
  const { sendMessage, toggleSurface } = usePromethea();
  const [assets, setAssets] = useState<RWAAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('parkmerced-01');

  useEffect(() => {
    // Dynamic asset loading from local storage store, merged with default proposed assets
    if (typeof window !== 'undefined') {
      const storedKey = 'promethea-local-real_world_assets';
      const storedRaw = localStorage.getItem(storedKey);
      let loaded: RWAAsset[] = [...DEFAULT_ASSETS];

      if (storedRaw) {
        try {
          const parsed = JSON.parse(storedRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // merge stored assets with default proposed assets if missing
            const existingIds = new Set(parsed.map((a: any) => a.id));
            DEFAULT_ASSETS.forEach((da) => {
              if (!existingIds.has(da.id)) {
                parsed.unshift(da);
              }
            });
            loaded = parsed;
          }
        } catch (e) {
          console.error('Failed to parse asset registry:', e);
        }
      }
      setAssets(loaded);
    }
  }, []);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0] || DEFAULT_ASSETS[0];

  const handleInitiateRatification = (asset: RWAAsset) => {
    toggleSurface();
    sendMessage(`Draft Delaware Series SPV and initiate citizen ratification vote for ${asset.name} (${asset.location.nearestTown}, ${asset.location.state})`);
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-5 backdrop-blur-xl shadow-xl text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-cyan-500/20 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-sm font-mono font-black tracking-widest text-cyan-300 uppercase">
              ACOM 5-Tier Scalability Continuum
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Dynamic Real-World Asset (RWA) Progression & Ratification Registry
          </p>
        </div>

        {/* Dynamic Asset Select */}
        <select
          value={selectedAssetId}
          aria-label="Select Asset"
          onChange={(e) => setSelectedAssetId(e.target.value)}
          className="bg-slate-900 border border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
        >
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} [{a.status}]
            </option>
          ))}
        </select>
      </div>

      {/* Selected Asset Details Card */}
      {selectedAsset && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 mb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-base font-bold text-slate-100">{selectedAsset.name}</h4>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                selectedAsset.status === 'PROPOSED'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 animate-pulse'
                  : selectedAsset.status === 'RATIFIED'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                  : selectedAsset.status === 'ACTUALIZED'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {selectedAsset.status === 'PROPOSED' ? '🟡 AWAITING RATIFICATION' : `● ${selectedAsset.status}`}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{selectedAsset.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">VALUATION</span>
              <span className="text-cyan-300 font-bold">${selectedAsset.price.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">LOCATION</span>
              <span className="text-slate-200">{selectedAsset.location.nearestTown}, {selectedAsset.location.state}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">CURRENT TIER</span>
              <span className="text-amber-400 font-bold">Tier {selectedAsset.tier}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">TARGET TIER</span>
              <span className="text-emerald-400 font-bold">Tier {selectedAsset.acomTargetTier || selectedAsset.tier + 1}</span>
            </div>
          </div>

          {/* Ratification Button for PROPOSED Assets */}
          {selectedAsset.status === 'PROPOSED' && (
            <div className="pt-2 flex items-center justify-between bg-amber-950/20 border border-amber-500/30 rounded-lg p-3">
              <div className="text-xs font-mono text-amber-200">
                <span className="font-bold block">Governance Ratification Required</span>
                <span>Initiate Delaware Series SPV formation & citizen vote.</span>
              </div>
              <button
                onClick={() => handleInitiateRatification(selectedAsset)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)]"
              >
                ⚡ Initiate Ratification
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5-Tier Continuum Slider & Status Steps */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
          Fractal Scalability Continuum Progression
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((t) => {
            const isCurrent = selectedAsset?.tier === t;
            const isTarget = selectedAsset?.acomTargetTier === t;
            const isPassed = (selectedAsset?.tier || 0) >= t;

            return (
              <div
                key={t}
                className={`p-2.5 rounded-xl border text-xs font-mono transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.3)] text-cyan-200'
                    : isTarget
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                    : isPassed
                    ? 'bg-slate-900 border-slate-700 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                  <span>TIER {t}</span>
                  {isCurrent && <span className="text-cyan-400">● ACTIVE</span>}
                  {isTarget && <span className="text-emerald-400">⚡ TARGET</span>}
                </div>
                <div className="text-[11px] leading-tight font-sans font-medium">
                  {TIER_NAMES[t as 1|2|3|4|5].split(': ')[1]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
