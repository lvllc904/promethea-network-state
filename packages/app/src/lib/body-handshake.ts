import { useState, useCallback } from 'react';

/**
 * The 3-Body Handshake Hook
 * Strictly maintains the separation of DAC (UI), Gateway (Auth), and Store (Device).
 */
export function useBodyHandshake() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const executeIntent = useCallback(async (intent: {
        body: 1 | 2 | 3;
        action: string;
        params?: any;
        permissionLevel?: 'GUEST' | 'CITIZEN' | 'ADMIN' | 'ROOT';
    }) => {
        setIsProcessing(true);
        setError(null);

        try {
            console.log(`[3-Body Handshake] Intent captured from Body 1: ${intent.action}`);

            // 1. Body 3 Check: Passive Identity consumption from local storage
            const token = typeof window !== 'undefined' ? localStorage.getItem('pns_sovereign_token') : null;
            
            // 2. Body 2 Validation: Push intent to Authentication Application (Gateway)
            const response = await fetch('/api/guardian/handshake', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(intent)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Handshake rejected by Body 2');
            }

            const result = await response.json();
            console.log(`[3-Body Handshake] Intent successfully executed:`, result);
            return result;

        } catch (e: any) {
            console.error(`[3-Body Handshake] Protocol Violation:`, e);
            setError(e.message);
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, []);

    return { executeIntent, isProcessing, error };
}
