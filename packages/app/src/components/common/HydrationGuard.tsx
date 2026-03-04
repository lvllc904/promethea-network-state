'use client';

import { useState, useEffect } from 'react';

interface HydrationGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Ensures that the wrapped children are only rendered on the client.
 * Prevents hydration mismatches when state is initialized differently
 * between server and client (e.g. from localStorage or Firebase).
 */
export default function HydrationGuard({ children, fallback = null }: HydrationGuardProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
