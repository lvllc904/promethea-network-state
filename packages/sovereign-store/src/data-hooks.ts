import { useMemo, useState, useEffect, useCallback } from 'react';
import { intentLogger } from './intent-logger';
import { syncEngine } from './sync-engine';

// Local-first hook replacements for Firebase/Identity

export interface SovereignUser {
    uid: string;
    isAnonymous: boolean;
    did?: string;
    displayName?: string;
    activeOrgId?: string;
    token?: string;
}

let globalUser: SovereignUser = {
    uid: 'sovereign-citizen',
    isAnonymous: false,
    activeOrgId: 'global',
    displayName: 'Sovereign Citizen',
    did: 'did:sovereign:local:0xsovereigncitizen'
};

const userListeners = new Set<(u: SovereignUser) => void>();

function notifyUserChange() {
    userListeners.forEach(cb => cb({ ...globalUser }));
}

// In client-side/hydration check:
if (typeof window !== 'undefined') {
    const savedOrg = localStorage.getItem('promethea-active-org');
    if (savedOrg) {
        globalUser.activeOrgId = savedOrg;
    }
}

export const useUser = () => {
    const [user, setUser] = useState<SovereignUser | null>(null);

    useEffect(() => {
        // Hydrate on mount to avoid server/client mismatch
        setUser({
            ...globalUser,
            switchContext: (orgId: string) => {
                globalUser.activeOrgId = orgId;
                if (typeof window !== 'undefined') {
                    localStorage.setItem('promethea-active-org', orgId);
                    window.dispatchEvent(new CustomEvent('syndicate-context-changed', { detail: orgId }));
                }
                notifyUserChange();
            }
        } as any);

        const handleGlobalChange = (u: SovereignUser) => {
            setUser({
                ...u,
                switchContext: (orgId: string) => {
                    globalUser.activeOrgId = orgId;
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('promethea-active-org', orgId);
                        window.dispatchEvent(new CustomEvent('syndicate-context-changed', { detail: orgId }));
                    }
                    notifyUserChange();
                }
            } as any);
        };

        userListeners.add(handleGlobalChange);
        
        const handleWindowEvent = (e: Event) => {
            const orgId = (e as CustomEvent).detail;
            if (globalUser.activeOrgId !== orgId) {
                globalUser.activeOrgId = orgId;
                notifyUserChange();
            }
        };
        window.addEventListener('syndicate-context-changed', handleWindowEvent);

        return () => {
            userListeners.delete(handleGlobalChange);
            window.removeEventListener('syndicate-context-changed', handleWindowEvent);
        };
    }, []);

    return { user, isUserLoading: false, userError: null };
};


export const useFirestore = () => {
    // Return a dummy object to represent the "local db" connection
    return { isLocal: true };
};

export const useCollection = <T = any>(queryObj: any) => {
    const [data, setData] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadData = useCallback(() => {
        if (!queryObj) return;
        setIsLoading(true);
        
        const collectionName = queryObj.collectionRef?.path || queryObj.path;
        if (!collectionName) {
            setData([]);
            setIsLoading(false);
            return;
        }

        const storageKey = `promethea-local-${collectionName}`;
        const stored = localStorage.getItem(storageKey);
        let items = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(items)) items = [];

        if (queryObj.constraints && Array.isArray(queryObj.constraints)) {
            for (const c of queryObj.constraints) {
                if (c && c.field && c.op) {
                    const { field, op, value } = c;
                    items = items.filter((item: any) => {
                        const itemVal = item[field];
                        if (op === '==') return itemVal === value;
                        if (op === '!=') return itemVal !== value;
                        if (op === '>') return itemVal > value;
                        if (op === '>=') return itemVal >= value;
                        if (op === '<') return itemVal < value;
                        if (op === '<=') return itemVal <= value;
                        return true;
                    });
                }
            }
        }

        setData(items as T[]);
        setIsLoading(false);
    }, [queryObj]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        loadData();

        const handleStoreUpdate = () => {
            loadData();
        };
        window.addEventListener('promethea-store-updated', handleStoreUpdate);
        return () => {
            window.removeEventListener('promethea-store-updated', handleStoreUpdate);
        };
    }, [loadData]);

    return { data, isLoading, error: null };
};

export const useDoc = <T = any>(docRef: any) => {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadData = useCallback(() => {
        if (!docRef) return;
        setIsLoading(true);
        const { collectionName, id } = docRef;
        if (!collectionName || !id) {
            setData(null);
            setIsLoading(false);
            return;
        }

        const storageKey = `promethea-local-${collectionName}`;
        const stored = localStorage.getItem(storageKey);
        const items = stored ? JSON.parse(stored) : [];
        if (Array.isArray(items)) {
            const found = items.find((item: any) => item.id === id);
            setData((found || null) as T | null);
        } else {
            setData(null);
        }
        setIsLoading(false);
    }, [docRef]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        loadData();

        const handleStoreUpdate = () => {
            loadData();
        };
        window.addEventListener('promethea-store-updated', handleStoreUpdate);
        return () => {
            window.removeEventListener('promethea-store-updated', handleStoreUpdate);
        };
    }, [loadData]);

    return { data, isLoading, error: null };
};

export function useSovereignMemo<T>(factory: () => T, deps: any[]): T {
    return useMemo(factory, deps);
}

// Dummy query builders that now just return objects representing local intents
export const collection = (db: any, path: string) => ({ path });
export const doc: {
    (collectionRef: any): any;
    (db: any, collectionName: string, id?: string): any;
} = (dbOrCollectionRef: any, collectionName?: string, id?: string) => {
    if (typeof collectionName === 'string') {
        const docId = id || crypto.randomUUID();
        return {
            collectionName,
            id: docId,
            path: `${collectionName}/${docId}`
        };
    } else {
        const path = dbOrCollectionRef?.path || '';
        const docId = crypto.randomUUID();
        return {
            collectionName: path,
            id: docId,
            path: `${path}/${docId}`
        };
    }
};
export const query = (collectionRef: any, ...constraints: any[]) => ({ collectionRef, constraints });
export const where = (field: string, op: string, value: any) => ({ field, op, value });
export const orderBy = (field: string, direction?: string) => ({ field, direction });
export const getDocs = async (queryRef: any) => {
    if (typeof window === 'undefined') return { docs: [] };
    const collectionName = queryRef.collectionRef?.path || queryRef.path;
    if (!collectionName) return { docs: [] };
    
    const storageKey = `promethea-local-${collectionName}`;
    const stored = localStorage.getItem(storageKey);
    let items = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(items)) items = [];
    
    if (queryRef.constraints && Array.isArray(queryRef.constraints)) {
        for (const c of queryRef.constraints) {
            if (c && c.field && c.op) {
                const { field, op, value } = c;
                items = items.filter((item: any) => {
                    const itemVal = item[field];
                    if (op === '==') return itemVal === value;
                    if (op === '!=') return itemVal !== value;
                    if (op === '>') return itemVal > value;
                    if (op === '>=') return itemVal >= value;
                    if (op === '<') return itemVal < value;
                    if (op === '<=') return itemVal <= value;
                    return true;
                });
            }
        }
    }
    
    return {
        docs: items.map((item: any) => ({
            id: item.id,
            data: () => item,
            exists: () => true
        }))
    };
};

export const getDoc = async (docRef: any) => {
    if (typeof window === 'undefined') return { exists: () => false, data: () => null, id: docRef?.id };
    const { collectionName, id } = docRef;
    if (!collectionName || !id) return { exists: () => false, data: () => null, id };
    
    const storageKey = `promethea-local-${collectionName}`;
    const stored = localStorage.getItem(storageKey);
    const items = stored ? JSON.parse(stored) : [];
    if (Array.isArray(items)) {
        const found = items.find((item: any) => item.id === id);
        if (found) {
            return {
                exists: () => true,
                data: () => found,
                id
            };
        }
    }
    return { exists: () => false, data: () => null, id };
};

export const addDoc = async (collectionRef: any, data: any) => {
    await intentLogger.log('add_doc', { collection: collectionRef.path, data });
    const id = crypto.randomUUID();
    if (typeof window !== 'undefined') {
        const collectionName = collectionRef.path;
        const storageKey = `promethea-local-${collectionName}`;
        let items = JSON.parse(localStorage.getItem(storageKey) || '[]');
        items.push({ ...data, id });
        localStorage.setItem(storageKey, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('promethea-store-updated'));
    }
    return { id };
};

export const setDoc = async (docRef: any, data: any) => {
    await intentLogger.log('set_doc', { doc: docRef, data });
    if (typeof window !== 'undefined') {
        const { collectionName, id } = docRef;
        const storageKey = `promethea-local-${collectionName}`;
        let items = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const idx = items.findIndex((item: any) => item.id === id);
        if (idx >= 0) {
            items[idx] = { ...items[idx], ...data, id };
        } else {
            items.push({ ...data, id });
        }
        localStorage.setItem(storageKey, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('promethea-store-updated'));
    }
};

export const updateDoc = async (docRef: any, data: any) => {
    await intentLogger.log('update_doc', { doc: docRef, data });
    if (typeof window !== 'undefined') {
        const { collectionName, id } = docRef;
        const storageKey = `promethea-local-${collectionName}`;
        let items = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const idx = items.findIndex((item: any) => item.id === id);
        if (idx >= 0) {
            items[idx] = { ...items[idx], ...data, id };
        } else {
            items.push({ ...data, id });
        }
        localStorage.setItem(storageKey, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('promethea-store-updated'));
    }
};

export const writeBatch = (db?: any) => {
    const operations: { type: 'set' | 'update' | 'delete', docRef: any, data?: any }[] = [];
    return {
        commit: async () => {
            await intentLogger.log('batch_commit', { operations });
            if (typeof window !== 'undefined') {
                for (const op of operations) {
                    const { type, docRef, data } = op;
                    const { collectionName, id } = docRef;
                    if (!collectionName || !id) continue;
                    
                    const storageKey = `promethea-local-${collectionName}`;
                    const currentDataStr = localStorage.getItem(storageKey);
                    let items = currentDataStr ? JSON.parse(currentDataStr) : [];
                    if (!Array.isArray(items)) {
                        items = [];
                    }
                    
                    if (type === 'set') {
                        const idx = items.findIndex((item: any) => item.id === id);
                        if (idx >= 0) {
                            items[idx] = { ...items[idx], ...data, id };
                        } else {
                            items.push({ ...data, id });
                        }
                    } else if (type === 'update') {
                        const idx = items.findIndex((item: any) => item.id === id);
                        if (idx >= 0) {
                            items[idx] = { ...items[idx], ...data, id };
                        } else {
                            items.push({ ...data, id });
                        }
                    } else if (type === 'delete') {
                        items = items.filter((item: any) => item.id !== id);
                    }
                    
                    localStorage.setItem(storageKey, JSON.stringify(items));
                    console.log(`[LocalStore] Committed ${type} to ${collectionName}:`, data);
                }
                window.dispatchEvent(new CustomEvent('promethea-store-updated'));
            }
        },
        update: (docRef: any, data: any) => {
            operations.push({ type: 'update', docRef, data });
        },
        set: (docRef: any, data: any) => {
            operations.push({ type: 'set', docRef, data });
        },
        delete: (docRef: any) => {
            operations.push({ type: 'delete', docRef });
        }
    };
};

export const serverTimestamp = () => Date.now();
export const increment = (val: number) => val;

export const useSovereignData = <T = any>(...args: any[]) => {
    return { data: null as any, isLoading: false, error: null as any };
};

// Types
export type Query<T = any> = any;
export type DocumentReference<T = any> = any;
export type Firestore = any;
