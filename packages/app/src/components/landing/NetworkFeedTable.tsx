'use client';

import { Fragment, useState } from 'react';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { Button, Skeleton } from '@promethea/ui';
import type { NetworkSignal, RequestStatus } from '@/lib/guildhall-types';
import { formatTimestamp } from '@/lib/guildhall-formatters';
import { GuildhallPanel } from '@/components/guildhall/GuildhallPanel';
import { GuildhallStatusBadge } from '@/components/guildhall/GuildhallStatusBadge';

function signalFreshness(signal: NetworkSignal) {
  return signal.reality === 'SIMULATED' ? 'demo' as const : 'live' as const;
}

function SignalDetails({ signal }: { signal: NetworkSignal }) {
  const bias = signal.bias;
  return (
    <div className="grid gap-5 border-t border-guildhall-line bg-guildhall-panel-raised px-4 py-5 md:grid-cols-[1fr_1fr]">
      <div>
        <p className="guildhall-label mb-3">Provenance</p>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-guildhall-muted">Source</dt><dd className="text-right text-guildhall-text">{signal.author || 'Unattributed signal'}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-guildhall-muted">Reality state</dt><dd className="text-right text-guildhall-text">{signal.reality || 'Not supplied'}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-guildhall-muted">Observed</dt><dd className="font-code text-right text-guildhall-text">{formatTimestamp(signal.timestamp)}</dd></div>
        </dl>
      </div>
      <div>
        <p className="guildhall-label mb-3">Bias and consensus</p>
        {bias ? (
          <div className="grid gap-3 text-sm">
            {[
              ['Propaganda index', bias.propaganda, 'bg-guildhall-identity'],
              ['Source trust', bias.sourceTrust, 'bg-guildhall-treasury'],
              ['Consensus score', bias.consensusScore, 'bg-guildhall-consensus'],
            ].map(([label, value, color]) => (
              <div key={String(label)}>
                <div className="mb-1 flex justify-between gap-3"><span className="text-guildhall-muted">{label}</span><span className="font-code text-guildhall-text">{value}%</span></div>
                <div className="h-1.5 bg-guildhall-line" role="progressbar" aria-label={String(label)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(value)}>
                  <div className={`h-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, Number(value)))}%` }} />
                </div>
              </div>
            ))}
            {bias.leaning && <p className="text-xs text-guildhall-muted">Leaning: <span className="text-guildhall-text">{bias.leaning}</span></p>}
          </div>
        ) : <p className="text-sm text-guildhall-muted">No provenance grading was supplied.</p>}
        {signal.transcript && <p className="mt-4 border-l-2 border-guildhall-consensus pl-3 text-sm leading-6 text-guildhall-muted">{signal.transcript}</p>}
      </div>
    </div>
  );
}

export function NetworkFeedTable({
  signals,
  status,
  onRetry,
}: {
  signals: NetworkSignal[];
  status: RequestStatus;
  onRetry: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <GuildhallPanel className="overflow-hidden" padded={false}>
      {status === 'loading' && (
        <div className="divide-y divide-guildhall-line" aria-label="Loading network signals">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="grid gap-3 px-5 py-5 md:grid-cols-[7rem_8rem_1fr_7rem] md:items-center"><Skeleton className="h-4 w-20 animate-none rounded-none bg-guildhall-line" /><Skeleton className="h-4 w-24 animate-none rounded-none bg-guildhall-line" /><Skeleton className="h-4 w-full animate-none rounded-none bg-guildhall-line" /><Skeleton className="h-4 w-16 animate-none rounded-none bg-guildhall-line" /></div>)}
        </div>
      )}
      {status === 'error' && (
        <div className="flex flex-col items-start gap-4 px-5 py-8">
          <div><p className="font-command text-lg font-semibold">The network feed is unavailable.</p><p className="mt-1 text-sm text-guildhall-muted">The rest of the platform remains available. Try again or continue with the demo dataset.</p></div>
          <Button type="button" variant="outline" onClick={onRetry} className="border-guildhall-line bg-transparent text-guildhall-text hover:bg-guildhall-panel-raised"><RefreshCw className="h-4 w-4" />Retry feed</Button>
        </div>
      )}
      {status === 'success' && signals.length === 0 && <div className="px-5 py-10 text-sm text-guildhall-muted">No verified signals are available yet.</div>}
      {status === 'success' && signals.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <caption className="sr-only">Recent network signals with freshness and provenance</caption>
            <thead className="border-b border-guildhall-line bg-guildhall-panel-raised">
              <tr>
                <th scope="col" className="guildhall-table-head">Observed</th>
                <th scope="col" className="guildhall-table-head">Category</th>
                <th scope="col" className="guildhall-table-head">Signal</th>
                <th scope="col" className="guildhall-table-head">Source</th>
                <th scope="col" className="guildhall-table-head">State</th>
                <th scope="col" className="guildhall-table-head"><span className="sr-only">Details</span></th>
              </tr>
            </thead>
            <tbody>
              {signals.slice(0, 8).map((signal) => {
                const isExpanded = expandedId === signal.id;
                return (
                  <Fragment key={signal.id}>
                    <tr className="border-b border-guildhall-line align-top hover:bg-guildhall-panel-raised">
                      <td className="guildhall-table-cell font-code text-xs text-guildhall-muted">{formatTimestamp(signal.timestamp)}</td>
                      <td className="guildhall-table-cell text-sm text-guildhall-muted">{signal.category.replaceAll('_', ' ')}</td>
                      <td className="guildhall-table-cell">
                        <button type="button" className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-guildhall-consensus" onClick={() => setExpandedId(isExpanded ? null : signal.id)} aria-expanded={isExpanded}>
                          <span className="block font-medium text-guildhall-text">{signal.title}</span>
                          <span className="mt-1 block max-w-xl text-sm leading-6 text-guildhall-muted">{signal.content}</span>
                        </button>
                      </td>
                      <td className="guildhall-table-cell text-sm text-guildhall-muted">{signal.author || 'Unattributed'}</td>
                      <td className="guildhall-table-cell"><GuildhallStatusBadge freshness={signalFreshness(signal)} /></td>
                      <td className="guildhall-table-cell"><button type="button" className="guildhall-icon-button" aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${signal.title}`} aria-expanded={isExpanded} onClick={() => setExpandedId(isExpanded ? null : signal.id)}>{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button></td>
                    </tr>
                    {isExpanded && <tr><td colSpan={6}><SignalDetails signal={signal} /></td></tr>}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </GuildhallPanel>
  );
}
