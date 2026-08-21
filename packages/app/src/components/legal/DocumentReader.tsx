import type { ReactNode } from 'react';
import { FileText } from 'lucide-react';
import { DocumentControls } from './DocumentControls';
import { GuildhallPanel } from '@/components/guildhall/GuildhallPanel';

export function DocumentReader({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-guildhall-bg px-5 py-5 text-guildhall-text sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl"><DocumentControls /><GuildhallPanel as="main" className="mt-8" padded={false}><div className="mx-auto max-w-[65ch] px-5 py-8 sm:px-10 sm:py-12"><div className="flex items-start justify-between gap-6"><div><div className="flex flex-wrap items-center gap-2"><span className="guildhall-status-tag border-guildhall-danger/40 bg-guildhall-danger/10 text-guildhall-danger">Confidential</span><span className="guildhall-status-tag border-guildhall-consensus/40 bg-guildhall-consensus/10 text-guildhall-consensus">Legal document</span></div><h1 className="mt-6 font-command text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Limited Partnership Agreement</h1><p className="mt-4 font-code text-xs leading-6 text-guildhall-muted">Document ID: TPNS-LPA-2026-V1.0.4<br className="sm:hidden" /> · Classification: Master Fund Covenant</p></div><FileText className="hidden h-12 w-12 shrink-0 text-guildhall-subtle sm:block" aria-hidden="true" /></div>{children}</div></GuildhallPanel></div>
    </div>
  );
}
