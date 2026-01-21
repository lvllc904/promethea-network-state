'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

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

            // Clean up the URL by removing the did/token params
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('did');
            newParams.delete('token');

            const newUrl = pathname + (newParams.toString() ? '?' + newParams.toString() : '');
            router.replace(newUrl);
        }
    }, [searchParams, router, pathname]);

    return null;
}
