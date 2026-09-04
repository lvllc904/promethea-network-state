'use client';

import React, { useRef, useEffect } from 'react';
import { useSpatialBus, SpatialCategory, SpatialItem } from '@/context/SpatialBusContext';
import { 
  Building2, 
  Zap, 
  Radio, 
  PlaySquare, 
  Vote, 
  Search, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  MapPin,
  FileText
} from 'lucide-react';
import { AudioTownSquare } from '@/components/landing/AudioTownSquare';
import { LandingVideoShowcase } from '@/components/landing/LandingVideoShowcase';
import { LandingMediaGrid } from '@/components/landing/LandingMediaGrid';

export function TownhallMarketplaceDrawer() {
  const { 
    items, 
    activeItemId, 
    activeCategory, 
    searchQuery, 
    isMarketplaceOpen, 
    selectItem, 
    setActiveCategory, 
    setSearchQuery, 
    setIsMarketplaceOpen, 
    triggerAgentAction 
  } = useSpatialBus();

  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to selected item when activeItemId changes externally (e.g., via Map click)
  useEffect(() => {
    if (activeItemId && itemRefs.current[activeItemId]) {
      itemRefs.current[activeItemId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeItemId]);

  // Categories config
  const categories: { id: SpatialCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'ALL', label: 'All Listings', icon: <SlidersHorizontal className="h-3.5 w-3.5" /> },
    { id: 'PARCELS', label: 'Real Estate & Land', icon: <Building2 className="h-3.5 w-3.5" /> },
    { id: 'ENERGY', label: 'Microgrids & Energy', icon: <Zap className="h-3.5 w-3.5" /> },
    { id: 'TOWNHALL', label: 'Audio Commons', icon: <Radio className="h-3.5 w-3.5" /> },
    { id: 'MEDIA', label: 'Broadcasts & Media', icon: <PlaySquare className="h-3.5 w-3.5" /> },
    { id: 'GOVERNANCE', label: 'Governance Dockets', icon: <Vote className="h-3.5 w-3.5" /> },
  ];

  // Filter items based on active category and search query
  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesQuery = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  if (!isMarketplaceOpen) {
    return (
      <button
        onClick={() => setIsMarketplaceOpen(true)}
        className="fixed top-24 left-6 z-30 flex items-center space-x-2 bg-slate-950/90 border border-cyan-500/30 text-white px-4 py-3 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:border-cyan-400 hover:text-cyan-300 transition"
      >
        <Building2 className="h-4 w-4 text-emerald-400" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider">
          Open Marketplace Feed ({items.length})
        </span>
        <ChevronRight className="h-4 w-4" />
      </button>
    );
  }

  return (
    <aside 
      className="fixed top-20 left-6 bottom-8 w-[420px] max-w-[calc(100vw-3rem)] z-30 flex flex-col bg-slate-950/90 border border-white/10 rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden transition-all duration-300"
      aria-label="Townhall and Marketplace Overlay Feed"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-xs">
              MKT
            </span>
            <div>
              <h2 className="text-sm font-command font-bold text-white tracking-wide">
                Townhall & Marketplace
              </h2>
              <p className="text-[10px] font-mono text-zinc-400">
                Sovereign Discovery Layer • {filteredItems.length} Available
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMarketplaceOpen(false)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
            title="Minimize Marketplace"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs">
          <Search className="h-3.5 w-3.5 text-zinc-400 mr-2" />
          <input
            type="text"
            placeholder="Search parcels, yields, townhalls, or media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none font-sans text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-zinc-500 hover:text-white text-xs ml-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Feed List */}
      <div 
        ref={listContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-white/5"
      >
        {/* Special Embedded Sub-Views when in dedicated categories */}
        {activeCategory === 'TOWNHALL' && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-slate-900/60 p-3 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 animate-pulse text-amber-400" />
                Live Spatial Commons
              </span>
              <span className="text-[10px] font-mono text-zinc-400">WebRTC Mesh</span>
            </div>
            <AudioTownSquare />
          </div>
        )}

        {activeCategory === 'MEDIA' && (
          <div className="mb-4 space-y-4">
            <LandingVideoShowcase />
            <LandingMediaGrid />
          </div>
        )}

        {/* Standard Card List (CBRE / Realtor.com style) */}
        {filteredItems.map((item) => {
          const isSelected = item.id === activeItemId;

          return (
            <div
              key={item.id}
              ref={(el) => { itemRefs.current[item.id] = el; }}
              onClick={() => selectItem(item)}
              className={`pt-3 first:pt-0 group cursor-pointer transition-all duration-200 rounded-2xl p-3.5 border ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_30px_rgba(0,242,254,0.15)] ring-1 ring-cyan-400/50'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              {/* Card Header & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span 
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                        item.realityBoundary === 'LIVE'
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                          : item.realityBoundary === 'SIM'
                          ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                          : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                      }`}
                    >
                      {item.realityBoundary}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                </div>

                {item.yieldRate && (
                  <div className="text-right">
                    <div className="text-[9px] font-mono text-zinc-400 uppercase">Yield</div>
                    <div className="text-sm font-mono font-bold text-emerald-400 flex items-center justify-end">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {item.yieldRate}
                    </div>
                  </div>
                )}
              </div>

              {item.subtitle && (
                <p className="mt-1 text-xs text-zinc-400 flex items-center gap-1 font-sans">
                  <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
                  <span>{item.subtitle}</span>
                </p>
              )}

              {item.description && (
                <p className="mt-2 text-xs text-zinc-300 line-clamp-2 leading-relaxed font-sans">
                  {item.description}
                </p>
              )}

              {/* Stats Grid */}
              {item.stats && item.stats.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-2.5">
                  {item.stats.map((stat, idx) => (
                    <div key={idx} className="bg-slate-950/50 rounded-lg p-1.5 border border-white/5 text-center">
                      <div className="text-[9px] font-mono text-zinc-500 truncate">{stat.label}</div>
                      <div className={`text-xs font-mono font-bold ${stat.color || 'text-white'}`}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectItem(item);
                    triggerAgentAction(item.actionType || 'INSPECT', item);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 text-xs font-mono font-bold transition"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Execute with Promethea</span>
                </button>

                <div className="flex items-center text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  <span>Pan Map</span>
                  <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-zinc-500 font-mono text-xs">
            No matching items found for "{searchQuery}".
          </div>
        )}
      </div>
    </aside>
  );
}
