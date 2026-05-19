"use client";

import { useSovereignData as useIdentitySovereignData } from '@promethea/identity';
import { useState, useEffect, useCallback, useRef } from 'react';
export { executeSovereignMethod, addSovereignData } from './sovereign-api';

/**
 * BFF-aware wrapper around useSovereignData.
 * 
 * If the endpoint starts with '/api/', it is fetched directly from the
 * same-origin Next.js BFF proxy — bypassing the Economic Engine entirely.
 * This eliminates CORS errors and 500s from engine endpoints.
 * 
 * All other endpoints are forwarded to the identity layer as before.
 */
export function useSovereignData<T>(endpoint: string, interval: number = 30000) {
  const isBFF = endpoint.startsWith('/api/') || endpoint.startsWith('/intelligence');

  // ── BFF path: plain fetch, no engine involvement ──────────────────────────
  const [bffData, setBffData] = useState<T | null>(null);
  const [bffLoading, setBffLoading] = useState(isBFF);
  const [bffError, setBffError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBFF = useCallback(async () => {
    if (!isBFF) return;
    try {
      const r = await fetch(endpoint, { cache: 'no-store' });
      if (!r.ok) throw new Error(`BFF ${r.status}`);
      const d = await r.json();
      setBffData(d as T);
      setBffError(null);
    } catch (e: any) {
      setBffError(e);
    } finally {
      setBffLoading(false);
    }
  }, [endpoint, isBFF]);

  useEffect(() => {
    if (!isBFF) return;
    fetchBFF();
    if (interval > 0) {
      intervalRef.current = setInterval(fetchBFF, interval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchBFF, interval, isBFF]);

  // ── Engine path: delegate to identity hook (non-BFF only) ─────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const identity = useIdentitySovereignData('STATE', isBFF ? '__noop__' : endpoint);

  if (isBFF) {
    return {
      data: bffData,
      loading: bffLoading,
      isLoading: bffLoading,
      error: bffError,
      refetch: fetchBFF,
      mutate: fetchBFF,
    };
  }

  return {
    data: identity.data as T | null,
    loading: identity.isLoading,
    isLoading: identity.isLoading,
    error: identity.error as Error | null,
    refetch: identity.refetch,
    mutate: identity.refetch,
  };
}
