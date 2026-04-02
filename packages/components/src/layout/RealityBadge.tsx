import React from 'react';
import { cn, RealityState } from '@promethea/lib';
import { Badge } from '@promethea/ui';

interface RealityBadgeProps {
  state: RealityState;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RealityBadge({ state, showLabel = true, className = "", size = 'md' }: RealityBadgeProps) {
  const isSimulated = state === 'SIMULATED' || state === 'TESTNET';
  
  const sizeClasses = {
    sm: 'py-0 px-1 text-[8px]',
    md: 'py-0.5 px-2 text-[9px]',
    lg: 'py-1 px-3 text-[10px]'
  };

  const label = state === 'ACTUALIZED' || state === 'SETTLED' ? 'VERIFIED' : state;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-mono font-bold uppercase tracking-widest border transition-all",
        isSimulated 
          ? "bg-amber-500/10 text-amber-500 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.1)] hover:bg-amber-500/20" 
          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.1)] hover:bg-emerald-500/20",
        isSimulated && "animate-pulse border-dashed",
        sizeClasses[size],
        className
      )}
      title={isSimulated ? "Database tracking only. Architectural simulation." : "Verified on-chain or CEX liquidity."}
    >
      <div className={cn(
        "w-1 h-1 rounded-full",
        isSimulated ? "bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.8)]" : "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]"
      )} />
      {showLabel && (
        <span className="ml-1.5">{label}</span>
      )}
    </Badge>
  );
}
