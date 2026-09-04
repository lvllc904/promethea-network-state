'use client';

import { useState } from 'react';
import { ChevronDown, RefreshCw, Activity, AlertCircle, Radio } from 'lucide-react';
import { Button, Skeleton } from '@promethea/ui';
import type { NetworkSignal, RequestStatus } from '@/lib/guildhall-types';
import { formatTimestamp } from '@/lib/guildhall-formatters';
import { GuildhallStatusBadge } from '@/components/guildhall/GuildhallStatusBadge';

function signalFreshness(signal: NetworkSignal) {
  return signal.reality === 'SIMULATED' ? ('demo' as const) : ('live' as const);
}

/** Tiny inline bar with label */
function BiasBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 shrink-0 text-guildhall-muted">{label}</span>
      <div className="h-1 flex-1 rounded-full bg-guildhall-line" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className={`h-full rounded-full ${color} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right font-code text-guildhall-subtle">{pct}%</span>
    </div>
  );
}

function SignalRow({ signal }: { signal: NetworkSignal }) {
  const [open, setOpen] = useState(false);
  const freshness = signalFreshness(signal);
  const bias = signal.bias;

  return (
    <li className="group border-b border-guildhall-line last:border-0">
      {/* ── Main row ─────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-5 py-4 transition-colors duration-150 hover:bg-guildhall-panel-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-guildhall-consensus focus-visible:ring-inset"
      >
        <div className="flex items-start gap-3">
          {/* Left: timestamp + category */}
          <div className="hidden sm:flex flex-col items-end gap-1.5 pt-0.5 shrink-0 w-28">
            <span className="font-code text-[10px] text-guildhall-subtle leading-none">{formatTimestamp(signal.timestamp)}</span>
            <span className="px-1.5 py-0.5 rounded bg-guildhall-panel text-[9px] font-bold uppercase tracking-widest text-guildhall-muted truncate max-w-full">
              {signal.category.replaceAll('_', ' ')}
            </span>
          </div>

          {/* Center: title + excerpt */}
          <div className="flex-1 min-w-0">
            {/* mobile: category above title */}
            <div className="flex items-center gap-2 mb-1 sm:hidden">
              <span className="px-1.5 py-0.5 rounded bg-guildhall-panel text-[9px] font-bold uppercase tracking-widest text-guildhall-muted">
                {signal.category.replaceAll('_', ' ')}
              </span>
              <span className="font-code text-[10px] text-guildhall-subtle">{formatTimestamp(signal.timestamp)}</span>
            </div>
            <p className="font-medium text-guildhall-text leading-snug text-sm group-hover:text-guildhall-identity transition-colors">{signal.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-guildhall-muted line-clamp-2">{signal.content}</p>
            {signal.author && (
              <p className="mt-1.5 text-[10px] font-code text-guildhall-subtle">
                ↳ {signal.author}
              </p>
            )}
          </div>

          {/* Right: badges + chevron */}
          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            <GuildhallStatusBadge freshness={freshness} />
            <ChevronDown
              className={`h-3.5 w-3.5 text-guildhall-subtle transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </div>
        </div>
      </button>

      {/* ── Expanded detail ───────────────────────────── */}
      {open && (
        <div className="px-5 pb-5 pt-1 bg-guildhall-panel-raised border-t border-guildhall-line animate-in slide-in-from-top-1 duration-200">
          {bias ? (
            <div className="space-y-2">
              <p className="guildhall-label mb-3 text-guildhall-consensus">Signal provenance</p>
              <BiasBar label="Propaganda index" value={bias.propaganda} color="bg-guildhall-identity" />
              <BiasBar label="Source trust" value={bias.sourceTrust} color="bg-guildhall-treasury" />
              <BiasBar label="Consensus score" value={bias.consensusScore} color="bg-guildhall-consensus" />
              {bias.leaning && (
                <p className="pt-1 text-xs text-guildhall-subtle">
                  Ideological leaning: <span className="text-guildhall-muted">{bias.leaning}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-guildhall-muted">No provenance grading available for this signal.</p>
          )}
          {signal.transcript && (
            <blockquote className="mt-4 border-l-2 border-guildhall-consensus pl-3 text-xs leading-6 text-guildhall-muted italic">
              {signal.transcript}
            </blockquote>
          )}
        </div>
      )}
    </li>
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
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}
    >
      {/* ── Header bar ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-guildhall-line">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-guildhall-consensus" aria-hidden />
          <span className="font-code text-xs text-guildhall-muted uppercase tracking-widest">Live signal feed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-guildhall-consensus animate-pulse" aria-hidden />
          <span className="font-code text-[10px] text-guildhall-subtle">REAL-TIME</span>
        </div>
      </div>

      {/* ── Column header (visible ≥sm) ──────────────────── */}
      <div className="hidden sm:grid grid-cols-[7.5rem_1fr_7rem] items-center gap-3 px-5 py-2 border-b border-guildhall-line">
        <span className="font-code text-[10px] text-guildhall-subtle uppercase tracking-widest text-right">Observed / Cat.</span>
        <span className="font-code text-[10px] text-guildhall-subtle uppercase tracking-widest">Signal</span>
        <span className="font-code text-[10px] text-guildhall-subtle uppercase tracking-widest text-right">State</span>
      </div>

      {/* ── Loading skeleton ─────────────────────────────── */}
      {status === 'loading' && (
        <ul aria-label="Loading network signals" className="divide-y divide-guildhall-line">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-start gap-3 px-5 py-4">
              <div className="hidden sm:flex flex-col gap-2 w-28 items-end pt-1">
                <Skeleton className="h-2.5 w-16 animate-none rounded-none bg-guildhall-line" />
                <Skeleton className="h-2.5 w-20 animate-none rounded-none bg-guildhall-line" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4 animate-none rounded-none bg-guildhall-line" />
                <Skeleton className="h-3 w-full animate-none rounded-none bg-guildhall-line" />
                <Skeleton className="h-3 w-2/3 animate-none rounded-none bg-guildhall-line" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── Error state ──────────────────────────────────── */}
      {status === 'error' && (
        <div className="flex flex-col items-start gap-4 px-5 py-8">
          <div className="flex items-center gap-2 text-guildhall-muted">
            <AlertCircle className="h-4 w-4" />
            <p className="font-command font-semibold">The network feed is unavailable.</p>
          </div>
          <p className="text-sm text-guildhall-muted">The rest of the platform remains available. Try again or continue with the demo dataset.</p>
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            className="border-guildhall-line bg-transparent text-guildhall-text hover:bg-guildhall-panel-raised"
          >
            <RefreshCw className="h-4 w-4" />
            Retry feed
          </Button>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────── */}
      {status === 'success' && signals.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
          <Radio className="h-6 w-6 text-guildhall-subtle" />
          <p className="text-sm text-guildhall-muted">No verified signals available yet.</p>
        </div>
      )}

      {/* ── Signal list ──────────────────────────────────── */}
      {status === 'success' && signals.length > 0 && (
        <ul aria-label="Network signals" className="divide-y divide-guildhall-line">
          {signals.slice(0, 8).map((signal) => (
            <SignalRow key={signal.id} signal={signal} />
          ))}
        </ul>
      )}
    </div>
  );
}
