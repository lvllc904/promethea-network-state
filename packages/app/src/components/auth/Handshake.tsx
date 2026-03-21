'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { syncEngine, intentLogger } from '@promethea/sovereign-store';

export function Handshake() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const did = searchParams.get('did');
        const token = searchParams.get('token');
        const uid = searchParams.get('uid');

        if (did) {
            console.log('[Handshake] Identity detected:', { did, uid });
            localStorage.setItem('authStatus', 'authenticated');
            localStorage.setItem('userDID', did);

            if (uid) {
                localStorage.setItem('userUID', uid);
            }

            if (token) {
                localStorage.setItem('authToken', token);
            }

            // Body 3 Hydration
            console.log('[Handshake] Hydrating Sovereign Datastore for', did);
            intentLogger.init().catch(err => console.error("IntentLogger failed to init", err));
            syncEngine.init(did).catch(err => console.error("SyncEngine failed to init", err));

            // Clean up the URL without triggering a full Next.js transition loop
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('did');
            newParams.delete('token');
            newParams.delete('uid'); // Also clean up uid if present

            const searchString = newParams.toString();
            const newUrl = pathname + (searchString ? '?' + searchString : '');
            
            // Use native history to avoid Next.js routing overhead/loops during hydration
            window.history.replaceState({}, '', newUrl);

            // Force a one-time synchronization of the internal auth hook state
            window.dispatchEvent(new Event('storage'));
        }
    }, [searchParams, pathname]);

    return null;
}
