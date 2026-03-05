'use client';
import { useState, useEffect } from 'react';
import { Query, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

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
        const unsubscribe = onSnapshot(
            q,
            (snapshot: QuerySnapshot<T>) => {
                const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
                setData(docs);
                setIsLoading(false);
            },
            (err) => {
                console.error('Error fetching collection:', err);
                setError(err);
                setIsLoading(false);
            }
        );

        // Safety timeout to prevent infinite skeletons
        const timeout = setTimeout(() => {
            if (isLoading) {
                console.warn('Firebase collection fetch timed out. Forcing isLoading to false.');
                setIsLoading(false);
            }
        }, 10000);

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, [q]);

    return { data, isLoading, error };
}
