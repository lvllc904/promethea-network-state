'use client';

import React, { useRef, useEffect, useState } from 'react';
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
  FileText,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';

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

  // Auto-scroll to selected item when activeItemId changes externally (e.g., via Map click) without scrolling window
  useEffect(() => {
    if (activeItemId && itemRefs.current[activeItemId] && listContainerRef.current) {
      const element = itemRefs.current[activeItemId];
      const container = listContainerRef.current;
      if (element && container) {
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
          container.scrollTo({
            top: container.scrollTop + (elementRect.top - containerRect.top) - 20,
            behavior: 'smooth'
          });
        }
      }
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
      className="fixed top-20 left-6 bottom-8 w-[420px] max-w-[calc(100vw-3rem)] z-30 flex flex-col glass-panel-specular rounded-3xl overflow-hidden transition-all duration-300"
      aria-label="Townhall and Marketplace Overlay Feed"
    >
      {/* Drawer Header */}
      <div className="p-4 bg-white/[0.02] flex flex-col gap-3 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs shadow-[inset_0_1px_0_rgba(52,211,153,0.4)]">
              MKT
            </span>
            <div className="stat-lockup">
              <h2 className="text-sm font-command font-bold text-white tracking-tight">
                Townhall & Marketplace
              </h2>
              <p className="text-[10px] font-mono text-slate-400">
                Sovereign Discovery Layer • {filteredItems.length} Available
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMarketplaceOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Minimize Marketplace"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center bg-black/40 rounded-xl px-3 py-2 text-xs shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
          <Search className="h-3.5 w-3.5 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search parcels, yields, townhalls, or media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none font-sans text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-white text-xs ml-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_2px_10px_rgba(16,185,129,0.3)]'
                    : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]'
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
        className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar"
      >
        {/* Special Embedded Sub-Views when in dedicated categories */}
        {activeCategory === 'TOWNHALL' && (
          <CompactTownSquareAudio 
            onSpeak={() => {
              const townhallItem = items.find(i => i.category === 'TOWNHALL') || filteredItems[0];
              if (townhallItem) {
                selectItem(townhallItem);
                triggerAgentAction('TOWNHALL_SPEAK', townhallItem);
              }
            }} 
          />
        )}

        {activeCategory === 'MEDIA' && (
          <CompactMediaShowcase 
            onQueryPromethea={() => {
              const mediaItem = items.find(i => i.category === 'MEDIA') || filteredItems[0];
              if (mediaItem) {
                selectItem(mediaItem);
                triggerAgentAction('VAULT_VIEW', mediaItem);
              }
            }} 
          />
        )}

        {/* Standard Card List (CBRE / Realtor.com style) */}
        {filteredItems.map((item) => {
          const isSelected = item.id === activeItemId;

          return (
            <div
              key={item.id}
              ref={(el) => { itemRefs.current[item.id] = el; }}
              onClick={() => selectItem(item)}
              className={`group cursor-pointer rounded-2xl p-4 transition-all duration-200 glass-card-hover ${
                isSelected
                  ? 'bg-white/[0.08] shadow-[inset_0_1px_0_0_rgba(6,182,212,0.4),0_0_30px_rgba(0,242,254,0.18)] ring-1 ring-cyan-400/40'
                  : 'bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_10px_25px_-5px_rgba(0,0,0,0.5)] hover:bg-white/[0.06]'
              }`}
            >
              {/* Card Header & Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="stat-lockup">
                  <div className="flex items-center space-x-2">
                    <span 
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase ${
                        item.realityBoundary === 'LIVE'
                          ? 'bg-emerald-950/90 text-emerald-300 shadow-[inset_0_1px_0_rgba(52,211,153,0.3)]'
                          : item.realityBoundary === 'SIM'
                          ? 'bg-amber-950/90 text-amber-300 shadow-[inset_0_1px_0_rgba(251,191,36,0.3)]'
                          : 'bg-cyan-950/90 text-cyan-300 shadow-[inset_0_1px_0_rgba(56,189,248,0.3)]'
                      }`}
                    >
                      {item.realityBoundary}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-slate-400">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-command font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                </div>

                {item.yieldRate && (
                  <div className="text-right stat-lockup">
                    <div className="data-kicker text-slate-400">Yield</div>
                    <div className="text-sm font-mono font-bold text-emerald-400 flex items-center justify-end">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {item.yieldRate}
                    </div>
                  </div>
                )}
              </div>

              {item.subtitle && (
                <p className="mt-1 text-xs text-slate-300 flex items-center gap-1 font-sans">
                  <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                  <span>{item.subtitle}</span>
                </p>
              )}

              {item.description && (
                <p className="mt-2 text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                  {item.description}
                </p>
              )}

              {/* Stats Grid with strict Gestalt proximity */}
              {item.stats && item.stats.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] pt-3">
                  {item.stats.map((stat, idx) => (
                    <div key={idx} className="bg-black/30 rounded-xl p-2 text-center stat-lockup shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 truncate">{stat.label}</div>
                      <div className={`text-xs font-mono font-bold ${stat.color || 'text-white'}`}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3 flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] pt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectItem(item);
                    triggerAgentAction(item.actionType || 'INSPECT', item);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 shadow-[inset_0_1px_0_rgba(6,182,212,0.4)] text-xs font-mono font-bold transition-all"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Execute with Promethea</span>
                </button>

                <div className="flex items-center text-[10px] font-mono text-slate-400 group-hover:text-white transition-colors">
                  <span>Pan Map</span>
                  <ArrowUpRight className="h-3.5 w-3.5 ml-0.5 text-slate-400 group-hover:text-cyan-400" />
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

function CompactTownSquareAudio({ onSpeak }: { onSpeak: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [levels, setLevels] = useState([20, 45, 70, 35, 60, 85, 40, 25]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setLevels(prev => prev.map(() => Math.floor(Math.random() * 70) + 20));
      }, 150);
    } else {
      setLevels([15, 20, 15, 25, 20, 15, 20, 15]);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="mb-4 rounded-2xl p-4 glass-panel-specular shadow-lg border border-amber-500/20 bg-amber-950/20 space-y-3">
      <audio
        ref={audioRef}
        src="/media/How_Sovereign_Smarthoods_reclaim_community_wealth.m4a"
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </div>
          <span className="text-xs font-command font-bold text-amber-300">
            Live Sovereign Commons
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
          42 Connected
        </span>
      </div>

      <div className="bg-black/40 rounded-xl p-3 border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-command font-bold text-white text-xs truncate">
            Sovereign Smarthoods &amp; Wealth
          </span>
          <span className="text-[10px] font-mono text-amber-300 ml-2 shrink-0">WebRTC Mesh</span>
        </div>

        {/* Audio Visualizer Equalizer */}
        <div className="flex items-end justify-center space-x-1.5 h-9 py-1 bg-black/60 rounded-lg px-2">
          {levels.map((lvl, idx) => (
            <div
              key={idx}
              className="w-2 rounded-t bg-gradient-to-t from-amber-500 to-emerald-400 transition-all duration-150"
              style={{ height: `${lvl}%` }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Citizen #402 (Speaking)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-slate-300" />}
            </button>
            <button
              onClick={togglePlay}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Listen Live'}</span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={onSpeak}
        className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-mono font-bold transition"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Request Mic with Promethea</span>
      </button>
    </div>
  );
}

function CompactMediaShowcase({ onQueryPromethea }: { onQueryPromethea: () => void }) {
  const [selectedStream, setSelectedStream] = useState<'KEYNOTE' | 'RECON'>('KEYNOTE');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className="mb-4 rounded-2xl p-4 glass-panel-specular shadow-lg border border-cyan-500/20 bg-slate-950/40 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-command font-bold text-cyan-300 flex items-center gap-1.5">
          <PlaySquare className="h-3.5 w-3.5 text-cyan-400" />
          Sovereign Media Stream
        </span>
        <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
          IPFS P2P
        </span>
      </div>

      {/* Stream Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-xl">
        <button
          onClick={() => {
            setSelectedStream('KEYNOTE');
            setIsPlaying(false);
          }}
          className={`py-1 text-[11px] font-mono rounded-lg font-bold transition ${
            selectedStream === 'KEYNOTE'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Master Keynote (4K)
        </button>
        <button
          onClick={() => {
            setSelectedStream('RECON');
            setIsPlaying(false);
          }}
          className={`py-1 text-[11px] font-mono rounded-lg font-bold transition ${
            selectedStream === 'RECON'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Drone Recon (GIS)
        </button>
      </div>

      {/* Video Viewport */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 group">
        <video
          ref={videoRef}
          src="/media/Promethean_Sovereign_Substrate.mp4"
          poster={selectedStream === 'KEYNOTE' ? '/media/Local_Wealth_Sovereignty_Pillars.png' : '/media/tripartite_capital_stack_leverage.jpg'}
          controls
          className="w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <div className="stat-lockup">
          <div className="text-xs font-command font-bold text-white truncate max-w-[280px]">
            {selectedStream === 'KEYNOTE' ? 'The Sovereign Substrate Master Keynote' : 'Cascadia Drone Aerial GIS Recon'}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {selectedStream === 'KEYNOTE' ? 'Duration: 22:15 • 1080p MP4' : 'Duration: 14:02 • Real-time Orthomosaic'}
          </div>
        </div>
      </div>

      <button
        onClick={onQueryPromethea}
        className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 hover:text-white text-xs font-mono font-semibold transition"
      >
        <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
        <span>Analyze Footage with Promethea</span>
      </button>
    </div>
  );
}

