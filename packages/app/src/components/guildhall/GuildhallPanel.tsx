'use client';

import React from 'react';

const accentClasses = {
  neutral: 'border-guildhall-line',
  identity: 'border-guildhall-identity/50',
  treasury: 'border-guildhall-treasury/50',
  consensus: 'border-guildhall-consensus/50',
} as const;

export interface GuildhallPanelProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  accent?: keyof typeof accentClasses;
  padded?: boolean;
}

export function GuildhallPanel({
  as: Component = 'section',
  accent = 'neutral',
  padded = true,
  className = '',
  ...props
}: GuildhallPanelProps) {
  return (
    <Component
      className={`guildhall-panel ${accentClasses[accent]} ${padded ? 'p-5 md:p-6' : ''} ${className}`}
      {...props}
    />
  );
}
