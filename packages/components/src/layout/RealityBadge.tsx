import React from 'react';
import { Badge } from '@promethea/ui';
import { RealityState } from '@promethea/lib';
import { cn } from '@promethea/lib';

interface RealityBadgeProps {
  state?: RealityState;
  className?: string;
  showLabel?: boolean;
}

export function RealityBadge({ state = 'SIMULATED', className, showLabel = true }: RealityBadgeProps) {
  const config = {
    SIMULATED: {
      color: 'bg-red-500',
      textColor: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      label: 'SIMULATED',
      tooltip: 'Database tracking only. No real money or legal weight.',
    },
    TESTNET: {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      label: 'TEST NET',
      tooltip: 'Executing on test networks (e.g., Solana Devnet).',
    },
    ACTUALIZED: {
      color: 'bg-green-500',
      textColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      label: 'ACTUALIZED',
      tooltip: 'Hard fiat settled, Mainnet cryptographic truth, or legally binding.',
    },
  };

  const currentConfig = config[state] || config.SIMULATED;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        currentConfig.bgColor, 
        currentConfig.textColor, 
        currentConfig.borderColor, 
        'py-0.5 px-2 flex items-center gap-1.5 w-fit',
        className
      )}
      title={currentConfig.tooltip}
    >
      <div className={cn('w-1.5 h-1.5 rounded-full shadow-sm', currentConfig.color)} />
      {showLabel && (
        <span className="font-mono text-[9px] font-bold tracking-widest uppercase">
          {currentConfig.label}
        </span>
      )}
    </Badge>
  );
}
