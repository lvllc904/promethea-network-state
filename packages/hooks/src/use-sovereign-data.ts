"use client";

import { useSovereignData as useIdentitySovereignData } from '@promethea/sovereign-store';
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
      let d = await r.json();

      if (typeof window !== 'undefined') {
        if (endpoint === '/api/proposals') {
          const localProposalsStr = localStorage.getItem('promethea-local-proposals');
          if (localProposalsStr) {
            try {
              const localProposals = JSON.parse(localProposalsStr);
              if (Array.isArray(localProposals)) {
                const apiIds = new Set((d as any[]).map(p => p.id));
                const uniqueLocal = localProposals.filter(p => !apiIds.has(p.id));
                d = [...uniqueLocal, ...(d as any[])];
              }
            } catch (err) {
              console.error("Failed to parse local proposals:", err);
            }
          }
        } else if (endpoint === '/api/votes') {
          const localVotesStr = localStorage.getItem('promethea-local-votes');
          if (localVotesStr) {
            try {
              const localVotes = JSON.parse(localVotesStr);
              if (Array.isArray(localVotes)) {
                const apiIds = new Set((d as any[]).map(v => v.id));
                const uniqueLocal = localVotes.filter(v => !apiIds.has(v.id));
                d = [...uniqueLocal, ...(d as any[])];
              }
            } catch (err) {
              console.error("Failed to parse local votes:", err);
            }
          }
        } else if (endpoint === '/api/citizens') {
          const localCitizensStr = localStorage.getItem('promethea-local-citizens');
          if (localCitizensStr) {
            try {
              const localCitizens = JSON.parse(localCitizensStr);
              if (Array.isArray(localCitizens)) {
                const apiIds = new Set((d as any[]).map(c => c.id));
                const uniqueLocal = localCitizens.filter(c => !apiIds.has(c.id));
                d = [...uniqueLocal, ...(d as any[])];
              }
            } catch (err) {
              console.error("Failed to parse local citizens:", err);
            }
          }
        }
      }

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

    const handleStoreUpdate = () => {
      fetchBFF();
    };
    window.addEventListener('promethea-store-updated', handleStoreUpdate);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('promethea-store-updated', handleStoreUpdate);
    };
  }, [fetchBFF, interval, isBFF]);

  // ── Engine path: delegate to identity hook (non-BFF only) ─────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const identity = useIdentitySovereignData();

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
    error: null,
    refetch: () => {},
    mutate: () => {},
  };
}
