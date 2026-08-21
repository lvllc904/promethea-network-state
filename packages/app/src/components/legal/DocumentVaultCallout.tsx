'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, LockKeyhole, ShieldAlert } from 'lucide-react';
import { Button } from '@promethea/ui';
import { useSolanaCitizen } from '@promethea/hooks';
import { useSovereignStore } from '@promethea/hooks';
import { GuildhallPanel } from '@/components/guildhall/GuildhallPanel';
import type { DocumentAccessState } from '@/lib/guildhall-types';

export function DocumentVaultCallout() {
  const { isUnlocked } = useSovereignStore();
  const { walletAddress, signMessage } = useSolanaCitizen();
  const [access, setAccess] = useState<DocumentAccessState>({ status: 'idle' });

  const authenticate = async () => {
    if (!isUnlocked || !walletAddress || !signMessage) {
      setAccess({ status: 'error', error: 'Unlock a wallet in the cockpit before requesting a signed document session.' });
      return;
    }
    setAccess({ status: 'loading' });
    try {
      const signature = await signMessage('Request access to TPNS-LPA-2026-V1.0.4');
      if (!signature) throw new Error('No signature was returned.');
      setAccess({ status: 'success', signature });
    } catch (error) {
      setAccess({ status: 'error', error: error instanceof Error ? error.message : 'Authentication was declined.' });
    }
  };

  return (
    <GuildhallPanel accent="treasury" className="mt-14" padded={false}><div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-start gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center border border-guildhall-treasury/40 bg-guildhall-treasury/10 text-guildhall-treasury">{access.status === 'success' ? <CheckCircle2 className="h-5 w-5" /> : access.status === 'error' ? <ShieldAlert className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}</div><div><h2 className="font-command text-xl font-semibold">Request full document access</h2><p className="mt-2 text-sm leading-6 text-guildhall-muted">The public preview summarizes the covenants. The execution copy requires a signed identity session.</p>{access.status === 'error' && <p className="mt-3 text-sm text-guildhall-danger">{access.error}</p>}{access.status === 'success' && <p className="mt-3 text-sm text-guildhall-treasury">Access granted for this session. Signature: <code className="font-code">{access.signature?.slice(0, 18)}…</code></p>}</div></div><div className="flex shrink-0 flex-col gap-2"><Button type="button" onClick={() => void authenticate()} disabled={access.status === 'loading' || access.status === 'success'} className="bg-guildhall-treasury text-guildhall-bg hover:bg-emerald-300">{access.status === 'loading' ? 'Authenticating…' : access.status === 'success' ? 'Access granted' : 'Authenticate'}</Button>{access.status === 'error' && <Link href="/dashboard" className="text-center text-xs text-guildhall-consensus hover:text-guildhall-text">Open cockpit to unlock identity</Link>}</div></div></GuildhallPanel>
  );
}
