'use client';
import { useState, useEffect } from 'react';
import { Query, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8080';
const IS_SOVEREIGN = process.env.NEXT_PUBLIC_DISABLE_FIREBASE === 'true';

export function useCollection<T = DocumentData>(q: Query<T> | null) {
    const [data, setData] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!q) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        let completed = false;

        if (IS_SOVEREIGN) {
            // SOVEREIGN REDIRECT: Bypass Firestore Billing
            const collectionPath = (q as any)._query?.path?.segments?.[0] || 'unknown';
            console.log(`[Sovereign] Redirecting collection ${collectionPath} to Engine API...`);
            
            fetch(`${ENGINE_URL}/api/${collectionPath}`)
                .then(res => res.json())
                .then(docs => {
                    setData(docs);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error('Sovereign Fetch Error:', err);
                    setError(err);
                    setIsLoading(false);
                });
            return;
        }
        
        const unsubscribe = onSnapshot(
            q,
            (snapshot: QuerySnapshot<T>) => {
                completed = true;
                const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
                setData(docs);
                setIsLoading(false);
            },
            (err) => {
                completed = true;
                console.error('Error fetching collection:', err);
                setError(err);
                setIsLoading(false);
            }
        );

        // Safety timeout to prevent infinite skeletons (increased to 30s for cold starts)
        const timeout = setTimeout(() => {
            if (!completed) {
                console.warn('Firebase collection fetch timed out (30s). Forcing isLoading to false.');
                setIsLoading(false);
            }
        }, 30000);

        return () => {
            if (unsubscribe) unsubscribe();
            clearTimeout(timeout);
        };
    }, [q]);

    return { data, isLoading, error };
}
