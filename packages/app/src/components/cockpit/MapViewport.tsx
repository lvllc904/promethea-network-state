'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Globe2, LoaderCircle, Map, RefreshCw, WifiOff, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@promethea/ui';
import { SovereignMap } from '@/components/SovereignMap';
import { useHUD } from '@/lib/hud-store';
import { fetchAtlasLayers } from '@/lib/guildhall-data';
import type { RequestStatus } from '@/lib/guildhall-types';

const InterstellarMap = dynamic(() => import('@/components/InterstellarMap').then((module) => module.InterstellarMap), { ssr: false });

export function MapViewport() {
  const { mapMode, setHUDState, isMapInteractive } = useHUD();
  const [layers, setLayers] = useState<any[]>([]);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [isCachedMode, setIsCachedMode] = useState(false);
  const backoffTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadLayers = useCallback(async (isManualRetry = false) => {
    if (isManualRetry) {
      setRetryCount(0);
    }
    setStatus('loading');
    try {
      const data = await fetchAtlasLayers();
      setLayers(data);
      setStatus('success');
      setIsCachedMode(false);
      setRetryCount(0);
    } catch (error) {
      console.warn('[Guildhall] Atlas live layers unavailable, engaging local cache fallback', error);
      setStatus('error');
      setIsCachedMode(true);

      // Exponential backoff up to 3 automatic attempts, max 10s
      if (retryCount < 3 && !isManualRetry) {
        const nextAttempt = retryCount + 1;
        setRetryCount(nextAttempt);
        const delay = Math.min(1000 * Math.pow(2, nextAttempt), 10000);
        if (backoffTimerRef.current) clearTimeout(backoffTimerRef.current);
        backoffTimerRef.current = setTimeout(() => {
          void loadLayers(false);
        }, delay);
      }
    }
  }, [retryCount]);

  useEffect(() => {
    void loadLayers(true);
    return () => {
      if (backoffTimerRef.current) clearTimeout(backoffTimerRef.current);
    };
  }, []);

  return (
    <section className="relative min-h-[26rem] flex-1 overflow-hidden border border-guildhall-line bg-guildhall-bg rounded-xl" aria-label="Sovereign Atlas map">
      <div className="absolute inset-0 opacity-70 grayscale-[0.35] contrast-[1.05]">
        {mapMode === 'SURFACE' ? <SovereignMap layers={layers} /> : <InterstellarMap />}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(11,13,16,0.8),transparent_35%,transparent_65%,rgba(11,13,16,0.45)),linear-gradient(0deg,rgba(11,13,16,0.55),transparent_30%)]" />

      {/* Top Map Context & Mode Toggles */}
      <div className="absolute left-4 right-4 top-4 flex flex-wrap items-start justify-between gap-3 z-10">
        <div className="border border-guildhall-line bg-guildhall-bg/95 p-3 rounded-lg backdrop-blur-md">
          <div className="flex items-center gap-2">
            <p className="guildhall-kicker text-guildhall-treasury">Sovereign Atlas</p>
            {isCachedMode && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-semibold">
                Cached Atlas (Amber)
              </span>
            )}
          </div>
          <p className="mt-1 font-command text-lg font-semibold">{mapMode === 'SURFACE' ? 'Surface Map' : 'Orbital View'}</p>
          <p className="mt-1 text-xs text-guildhall-muted">The map is the spatial context layer. The command column drives state action.</p>
        </div>

        <div className="flex border border-guildhall-line bg-guildhall-bg/95 p-1 rounded-lg backdrop-blur-md" role="group" aria-label="Map mode">
          <button
            type="button"
            onClick={() => setHUDState({ mapMode: 'SURFACE' })}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
              mapMode === 'SURFACE' ? 'bg-guildhall-treasury text-guildhall-bg font-bold' : 'text-guildhall-muted hover:bg-guildhall-panel-raised hover:text-zinc-200'
            }`}
            aria-pressed={mapMode === 'SURFACE'}
          >
            <Map className="h-3.5 w-3.5" />
            Surface
          </button>
          <button
            type="button"
            onClick={() => setHUDState({ mapMode: 'INTERSTELLAR' })}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
              mapMode === 'INTERSTELLAR' ? 'bg-guildhall-identity text-guildhall-bg font-bold' : 'text-guildhall-muted hover:bg-guildhall-panel-raised hover:text-zinc-200'
            }`}
            aria-pressed={mapMode === 'INTERSTELLAR'}
          >
            <Globe2 className="h-3.5 w-3.5" />
            Orbital
          </button>
        </div>
      </div>

      {/* Layer Status & Fallback Notification */}
      {(status === 'loading' || status === 'error') && (
        <div className="absolute bottom-4 left-4 max-w-md border border-guildhall-line bg-guildhall-bg/95 p-4 rounded-xl backdrop-blur-md z-10 shadow-xl">
          <div className="flex items-start gap-3">
            {status === 'loading' ? (
              <LoaderCircle className="mt-0.5 h-4 w-4 animate-spin text-guildhall-consensus shrink-0" />
            ) : (
              <WifiOff className="mt-0.5 h-4 w-4 text-amber-400 shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-zinc-100 font-command">
                  {status === 'loading' ? 'Loading Live Atlas Layers' : 'Offline / Cached Atlas Mode (Amber Spectrum)'}
                </p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-guildhall-muted">
                {status === 'loading'
                  ? 'Requesting mesh telemetry from the Omni-Lake...'
                  : 'Live Omni-Lake telemetry feed is unreachable. Spatial Atlas has engaged the local cached pod (Body 3 Sovereign Data Store).'}
              </p>
              {status === 'error' && (
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void loadLayers(true)}
                    className="border-guildhall-line bg-white/5 text-guildhall-text hover:bg-guildhall-panel-raised text-xs px-3 py-1 h-auto flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Manual Live Reconnect
                  </Button>
                  {retryCount > 0 && retryCount < 3 && (
                    <span className="text-xs text-amber-400 font-mono">
                      Auto-retry {retryCount}/3...
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Interactive Toggle */}
      <button
        type="button"
        onClick={() => setHUDState({ isMapInteractive: !isMapInteractive })}
        className="absolute bottom-4 right-4 border border-guildhall-line bg-guildhall-bg/95 px-3 py-2 text-xs font-medium rounded-lg text-guildhall-muted hover:bg-guildhall-panel-raised hover:text-zinc-100 z-10 transition-all cursor-pointer backdrop-blur-md"
        aria-pressed={isMapInteractive}
      >
        {isMapInteractive ? 'Map controls unlocked' : 'Unlock map controls'}
      </button>
    </section>
  );
}
