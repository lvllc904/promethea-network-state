'use client';

import Link from 'next/link';
import { ArrowLeft, Menu } from 'lucide-react';
import { GuildhallThemeMenu } from '@/components/guildhall/GuildhallThemeMenu';

export function DocumentControls() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-guildhall-line py-4">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-guildhall-muted hover:text-guildhall-text"><ArrowLeft className="h-4 w-4" />Return to platform</Link>
      <div className="flex items-center gap-2"><span className="hidden items-center gap-2 text-xs text-guildhall-subtle sm:inline-flex"><Menu className="h-4 w-4" />Document controls</span><GuildhallThemeMenu /></div>
    </header>
  );
}
