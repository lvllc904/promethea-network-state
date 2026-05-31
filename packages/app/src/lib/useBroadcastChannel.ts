'use client';

import { useEffect, useRef } from 'react';
import { useHUD } from './hud-store';

export function useBroadcastChannel() {
    const { 
        watchlists, activeWatchlistName, chatThreads, activeThreadId, osWindows,
        syncHUDState
    } = useHUD();
    
    const isSyncingRef = useRef(false);
    const bcRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const bc = new BroadcastChannel('promethea-hud-sync');
        bcRef.current = bc;

        bc.onmessage = (event) => {
            if (event.data.type === 'SYNC_STATE') {
                isSyncingRef.current = true;
                syncHUDState(event.data.state);
                setTimeout(() => {
                    isSyncingRef.current = false;
                }, 100);
            }
        };

        return () => {
            bc.close();
        };
    }, [syncHUDState]);

    // Broadcast state changes, but don't broadcast if we are currently syncing from another window's broadcast
    useEffect(() => {
        if (isSyncingRef.current || !bcRef.current) return;
        
        bcRef.current.postMessage({
            type: 'SYNC_STATE',
            state: {
                watchlists,
                activeWatchlistName,
                chatThreads,
                activeThreadId,
                osWindows
            }
        });
    }, [watchlists, activeWatchlistName, chatThreads, activeThreadId, osWindows]);
}

export function HUDStateSync() {
    useBroadcastChannel();
    return null;
}
