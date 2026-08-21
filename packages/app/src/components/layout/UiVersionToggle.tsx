'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Layers, Radio } from 'lucide-react';
import { useUiVersionStore } from '@/lib/ui-version-store';

export function UiVersionToggle({ className = '' }: { className?: string }) {
  const { uiVersion, toggleUiVersion } = useUiVersionStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-8 w-36 animate-pulse rounded-full bg-white/5 border border-white/10 ${className}`} />
    );
  }

  const isNextGen = uiVersion === 'NEXTGEN';

  return (
    <button
      type="button"
      onClick={toggleUiVersion}
      title={isNextGen ? 'Switch to Classic 3D HUD View' : 'Switch to NextGen Guildhall View'}
      className={`group relative inline-flex h-8 items-center gap-1.5 rounded-full p-1 text-xs font-medium transition-all duration-300 border backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
        isNextGen
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30 text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
          : 'bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent border-cyan-500/30 text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-500/15 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
      } ${className}`}
    >
      <div className="flex items-center gap-1.5 px-2">
        {isNextGen ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Sparkles className="h-3.5 w-3.5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-command font-bold tracking-wider text-[11px] uppercase">
              UI: <span className="text-white">NextGen</span>
            </span>
          </>
        ) : (
          <>
            <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="font-command font-bold tracking-wider text-[11px] uppercase">
              UI: <span className="text-white">Classic</span>
            </span>
          </>
        )}
      </div>

      <div
        className={`flex h-6 items-center gap-1 rounded-full px-2 text-[10px] font-semibold tracking-tight transition-all duration-300 ${
          isNextGen
            ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
            : 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
        }`}
      >
        <Layers className="h-3 w-3" />
        <span>{isNextGen ? 'Switch to Classic' : 'Switch to NextGen'}</span>
      </div>
    </button>
  );
}
