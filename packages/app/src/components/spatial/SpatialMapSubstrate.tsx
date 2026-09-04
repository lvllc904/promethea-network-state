'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSpatialBus, SpatialItem, RealityBoundary } from '@/context/SpatialBusContext';
import { 
  Globe2, 
  Map as MapIcon, 
  Plus, 
  Minus, 
  Compass, 
  Zap, 
  Radio, 
  ShieldCheck, 
  Sparkles, 
  Navigation, 
  Layers, 
  Maximize2 
} from 'lucide-react';

export function SpatialMapSubstrate() {
  const { 
    items, 
    activeItemId, 
    activeCategory, 
    mapTarget, 
    selectItem, 
    triggerAgentAction 
  } = useSpatialBus();

  const [mapMode, setMapMode] = useState<'SURFACE' | 'ORBITAL' | 'TOPOLOGY'>('SURFACE');
  const [currentZoom, setCurrentZoom] = useState(mapTarget.zoom || 15);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Filter items based on active category
  const filteredItems = items.filter((item) => {
    if (activeCategory === 'ALL') return true;
    return item.category === activeCategory;
  });

  // Calculate projected relative positions for SVG/Canvas simulation
  // Centered around target lat/lng
  const getProjectedPosition = (coords: { lat: number; lng: number }) => {
    const latDelta = (coords.lat - mapTarget.lat) * 2800 * (currentZoom / 15);
    const lngDelta = (coords.lng - mapTarget.lng) * 2800 * (currentZoom / 15);
    // Center at (50%, 50%) plus delta + pan
    return {
      top: `calc(50% - ${latDelta}px + ${panOffset.y}px)`,
      left: `calc(50% + ${lngDelta}px + ${panOffset.x}px)`,
    };
  };

  // Reset pan offset smoothly when mapTarget updates
  useEffect(() => {
    setPanOffset({ x: 0, y: 0 });
    if (mapTarget.zoom) setCurrentZoom(mapTarget.zoom);
  }, [mapTarget]);

  // Pan gesture handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-pin')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getBoundaryGlow = (boundary: RealityBoundary, isSelected: boolean) => {
    if (isSelected) {
      return 'border-white ring-4 ring-cyan-400/50 shadow-[0_0_30px_rgba(0,242,254,0.6)] scale-125 z-30';
    }
    switch (boundary) {
      case 'LIVE':
        return 'border-emerald-400/80 bg-emerald-950/80 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:scale-110';
      case 'SIM':
        return 'border-amber-400/80 bg-amber-950/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-110';
      case 'AI':
        return 'border-cyan-400/80 bg-cyan-950/80 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-110';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ENERGY':
        return <Zap className="h-3.5 w-3.5" />;
      case 'TOWNHALL':
        return <Radio className="h-3.5 w-3.5 animate-pulse text-amber-400" />;
      case 'GOVERNANCE':
        return <ShieldCheck className="h-3.5 w-3.5" />;
      default:
        return <Sparkles className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div 
      className="relative w-full h-full min-h-screen overflow-hidden select-none bg-[#07090e] cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Dynamic GIS Grid Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-transform duration-300 ease-out"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, rgba(0, 242, 254, 0.15) 0%, transparent 70%),
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: `${30 * (currentZoom / 15)}px ${30 * (currentZoom / 15)}px`,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`
        }}
      />

      {/* High-Tech Vector Radar & Compass Backdrop */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div 
          className="w-[850px] h-[850px] rounded-full border border-cyan-500/10 transition-transform duration-700 ease-out flex items-center justify-center"
          style={{ transform: `scale(${currentZoom / 15}) translate(${panOffset.x * 0.2}px, ${panOffset.y * 0.2}px)` }}
        >
          <div className="w-[600px] h-[600px] rounded-full border border-dashed border-emerald-500/10 animate-spin-slow" />
          <div className="w-[350px] h-[350px] rounded-full border border-white/5" />
          <div className="absolute h-full w-px bg-cyan-500/5" />
          <div className="absolute w-full h-px bg-cyan-500/5" />
        </div>
      </div>

      {/* Simulated Spatial Topographic Land & Parcels Visual Geometry */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
      >
        <defs>
          <linearGradient id="emeraldGrid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="cyanGrid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Dynamic Topology Polygons representing sovereign lands */}
        <polygon 
          points="calc(50% - 120px),calc(50% - 60px) calc(50% + 140px),calc(50% - 90px) calc(50% + 200px),calc(50% + 80px) calc(50% - 80px),calc(50% + 110px)"
          fill="url(#emeraldGrid)"
          stroke="rgba(16, 185, 129, 0.4)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
        <polygon 
          points="calc(50% + 320px),calc(50% - 180px) calc(50% + 540px),calc(50% - 120px) calc(50% + 480px),calc(50% + 40px) calc(50% + 280px),calc(50% + 10px)"
          fill="url(#cyanGrid)"
          stroke="rgba(6, 182, 212, 0.4)"
          strokeWidth="1.5"
          strokeDasharray="6 3"
        />
      </svg>

      {/* Spatial Pins & Markers */}
      <div className="absolute inset-0 pointer-events-none">
        {filteredItems.map((item) => {
          const isSelected = item.id === activeItemId;
          const pos = getProjectedPosition(item.coordinates);

          return (
            <div
              key={item.id}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 interactive-pin cursor-pointer"
              style={{ top: pos.top, left: pos.left }}
              onClick={(e) => {
                e.stopPropagation();
                selectItem(item);
              }}
            >
              {/* Radar Pulsing Wave for Live/Active Items */}
              {item.realityBoundary === 'LIVE' && (
                <span className="absolute -inset-3 rounded-full animate-ping opacity-30 bg-emerald-400" />
              )}
              {item.category === 'TOWNHALL' && (
                <span className="absolute -inset-4 rounded-full animate-pulse opacity-40 bg-amber-400" />
              )}

              {/* Pin Bubble */}
              <div 
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all ${getBoundaryGlow(item.realityBoundary, isSelected)}`}
              >
                <div className="flex items-center justify-center">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="text-left font-mono">
                  <div className="text-xs font-bold whitespace-nowrap leading-tight text-white drop-shadow-sm">
                    {item.title}
                  </div>
                  {item.yieldRate && (
                    <div className="text-[10px] text-emerald-400 font-semibold leading-none">
                      Yield: {item.yieldRate}
                    </div>
                  )}
                </div>
              </div>

              {/* Connected Coordinate Stem */}
              <div className="w-px h-6 mx-auto bg-gradient-to-b from-white/40 to-transparent" />
            </div>
          );
        })}
      </div>

      {/* Top Floating Spatial HUD Overlay */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center space-x-3 pointer-events-auto bg-slate-950/80 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Sovereign Spatial Substrate
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">
                L1 VERIFIED
              </span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400">
              LAT: {mapTarget.lat.toFixed(4)}° • LNG: {mapTarget.lng.toFixed(4)}° • ZOOM: {currentZoom}x
            </div>
          </div>
        </div>

        {/* View Mode & Reality Filters */}
        <div className="flex items-center space-x-2 pointer-events-auto bg-slate-950/80 border border-white/10 p-1 rounded-2xl backdrop-blur-xl shadow-2xl">
          <button
            onClick={() => setMapMode('SURFACE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition ${
              mapMode === 'SURFACE'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Surface GIS
          </button>
          <button
            onClick={() => setMapMode('ORBITAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition ${
              mapMode === 'ORBITAL'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Orbital
          </button>
          <button
            onClick={() => setMapMode('TOPOLOGY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition ${
              mapMode === 'TOPOLOGY'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Topology
          </button>
        </div>
      </div>

      {/* Bottom Floating Map Zoom & Orientation Controls */}
      <div className="absolute bottom-8 left-6 flex items-center space-x-2 pointer-events-auto z-20">
        <div className="flex flex-col bg-slate-950/85 border border-white/10 rounded-2xl p-1 backdrop-blur-xl shadow-2xl">
          <button
            onClick={() => setCurrentZoom((z) => Math.min(z + 1, 20))}
            className="p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-xl transition"
            title="Zoom In"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="h-px bg-white/10 my-0.5" />
          <button
            onClick={() => setCurrentZoom((z) => Math.max(z - 1, 8))}
            className="p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-xl transition"
            title="Zoom Out"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => {
            setPanOffset({ x: 0, y: 0 });
            setCurrentZoom(15);
          }}
          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-950/85 border border-white/10 text-zinc-300 hover:text-cyan-300 rounded-2xl backdrop-blur-xl text-xs font-mono shadow-2xl transition"
          title="Recenter Map Viewport"
        >
          <Compass className="h-4 w-4 text-cyan-400" />
          <span>Recenter</span>
        </button>
      </div>
    </div>
  );
}
