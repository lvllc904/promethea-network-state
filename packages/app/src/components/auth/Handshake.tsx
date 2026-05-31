'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { syncEngine, intentLogger } from '@promethea/sovereign-store';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export function Handshake() {
    const pathname = usePathname();
    const { isLoggedIn, primaryWallet, user } = useDynamicContext();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        if (isLoggedIn && user && primaryWallet && !hydrated) {
            const did = user.userId;
            const uid = user.email || user.userId;

            console.log('[Handshake] Identity detected from Dynamic:', { did, uid, wallet: primaryWallet.address });
            
            // Still set these for backward compatibility with other parts of the app if needed
            localStorage.setItem('authStatus', 'authenticated');
            localStorage.setItem('userDID', did);
            localStorage.setItem('userUID', uid);
            localStorage.setItem('walletAddress', primaryWallet.address);

            // Body 3 Hydration
            console.log('[Handshake] Hydrating Sovereign Datastore for', did);
            intentLogger.init().catch((err: any) => console.error("IntentLogger failed to init", err));
            syncEngine.init(did).catch((err: any) => console.error("SyncEngine failed to init", err));

            setHydrated(true);

            // Force a one-time synchronization of the internal auth hook state
            window.dispatchEvent(new Event('storage'));
        } else if (!isLoggedIn && hydrated) {
            // Handle logout
            setHydrated(false);
            localStorage.removeItem('authStatus');
            localStorage.removeItem('userDID');
            localStorage.removeItem('userUID');
            localStorage.removeItem('walletAddress');
            window.dispatchEvent(new Event('storage'));
        }
    }, [isLoggedIn, user, primaryWallet, hydrated]);

    return null;
}
