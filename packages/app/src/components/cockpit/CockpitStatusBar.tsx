'use client';

import Link from 'next/link';
import { ArrowUpRight, Radio, ShieldCheck } from 'lucide-react';
import { useHUD } from '@/lib/hud-store';

export function CockpitStatusBar() {
  const { competencyLevel } = useHUD();
  return (
    <footer className="grid shrink-0 gap-px border-x border-b border-guildhall-line bg-guildhall-line sm:grid-cols-3">
      <div className="bg-guildhall-panel px-4 py-3"><p className="guildhall-label">Operator mode</p><p className="mt-1 font-code text-sm text-guildhall-text">{competencyLevel.toLowerCase()}</p></div>
      <div className="bg-guildhall-panel px-4 py-3"><p className="guildhall-label">Mesh posture</p><p className="mt-1 flex items-center gap-2 text-sm text-guildhall-treasury"><Radio className="h-4 w-4" />Cached fallback ready</p></div>
      <div className="bg-guildhall-panel px-4 py-3"><p className="guildhall-label">Advanced tools</p><Link href="/cockpit" className="mt-1 inline-flex items-center gap-2 text-sm text-guildhall-consensus hover:text-guildhall-text">Open command console <ArrowUpRight className="h-4 w-4" /></Link></div>
    </footer>
  );
}
