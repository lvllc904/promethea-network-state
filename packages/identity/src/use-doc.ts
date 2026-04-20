'use client';
import { useState, useEffect } from 'react';
import { DocumentReference, onSnapshot } from 'firebase/firestore';

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8080';
const IS_SOVEREIGN = process.env.NEXT_PUBLIC_DISABLE_FIREBASE === 'true';

export function useDoc<T>(ref: DocumentReference | null) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const docPathStr = ref ? (ref as any)._path?.segments?.join('/') || (ref as any).path || 'unknown' : '';

    useEffect(() => {
        if (!ref) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        if (IS_SOVEREIGN) {
            const collectionPath = (ref as any)._path?.segments?.[0] || 'unknown';
            const docId = (ref as any)._path?.segments?.[1] || 'unknown';
            console.log(`[Sovereign] Redirecting doc ${collectionPath}/${docId} to Engine API...`);
            
            fetch(`${ENGINE_URL}/api/${collectionPath}/${docId}`)
                .then(res => res.json())
                .then(docData => {
                    setData(docData ? { ...docData, id: docId } as T : null);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error('Sovereign Doc Fetch Error:', err);
                    setError(err);
                    setIsLoading(false);
                });
            return;
        }

        const unsubscribe = onSnapshot(
            ref,
            (doc) => {
                if (doc.exists()) {
                    setData({ ...doc.data() as any, id: doc.id } as T);
                } else {
                    setData(null);
                }
                setIsLoading(false);
            },
            (err) => {
                console.error('Error fetching document:', err);
                setError(err);
                setIsLoading(false);
            }
        );

        return () => {
            if (unsubscribe) unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [docPathStr]);

    return { data, isLoading, error };
}
