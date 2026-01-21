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
                const docs = snapshot.docs.map(doc => doc.data());
                setData(docs);
                setIsLoading(false);
            },
            (err) => {
                console.error('Error fetching collection:', err);
                setError(err);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [q]);

    return { data, isLoading, error };
}
