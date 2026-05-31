import { useMemo, useState, useEffect, useCallback } from 'react';

// Common Identifiers
export const firebaseApp = null;
export const auth = null;
export const firestore = {
  collection: (db: any, name?: string) => ({
    doc: (id?: string) => ({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: async (...args: any[]) => {},
      update: async (...args: any[]) => {},
      onSnapshot: () => () => {},
    }),
    add: async (...args: any[]) => ({ id: 'mock-id' }),
    where: (...args: any[]) => firestore.collection(null),
    orderBy: (...args: any[]) => firestore.collection(null),
    limit: (...args: any[]) => firestore.collection(null),
    onSnapshot: (...args: any[]) => () => {},
    get: async (...args: any[]) => ({ docs: [], empty: true })
  }),
  batch: () => ({
    set: (...args: any[]) => {},
    update: (...args: any[]) => {},
    delete: (...args: any[]) => {},
    commit: async (...args: any[]) => {},
  })
};

// Sovereign Utility Mocks (for migration)
export type DocumentReference<T = any> = { id: string, coll: string };
export type Query<T = any> = { name: string };
export type Firestore = typeof firestore;

export const doc = (db: any, coll?: string, id?: string): DocumentReference => ({ id: id || coll || 'unknown', coll: coll || 'unknown' });
export const collection = (db: any, name: string): Query => ({ name });
export const query = (coll: any, ...constraints: any[]) => coll;
export const where = (field: string, op: string, value: any) => ({ field, op, value });
export const orderBy = (field: string, direction?: string) => ({ field, direction });
export const limit = (n: number) => ({ n });
export const writeBatch = (db: any) => firestore.batch();
export const increment = (n: number) => n;
export const updateDoc = async (ref: any, data: any) => {};
export const setDoc = async (ref: any, data: any) => {};
export const addDoc = async (coll: any, data: any) => ({ id: 'mock-id' });
export const serverTimestamp = () => new Date().toISOString();

export const getDoc = async (ref: any) => {
  if (ref && typeof ref.get === 'function') {
    return await ref.get();
  }
  return { exists: false, data: () => ({}) };
};

export const getDocs = async (q: any) => {
  if (q && typeof q.get === 'function') {
    return await q.get();
  }
  return { docs: [], empty: true };
};


export const useUser = () => {
  const [user, setUser] = useState<{uid: string, isAnonymous: boolean, displayName: string | null, activeOrgId: string, did: string | null, token: string | null} | null>(null);
  
  const switchContext = useCallback((orgId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeOrganizationId', orgId);
      window.location.reload(); // Hard reload to ensure all hooks resync with new context
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('authStatus');
      const userUID = localStorage.getItem('userUID');
      const activeOrgId = localStorage.getItem('activeOrganizationId') || 'tpns_genesis'; // Default to Promethean Network State
      
      if (authStatus === 'authenticated') {
        setUser({ 
          uid: userUID || 'sovereign-0x123', 
          isAnonymous: false, 
          displayName: 'Promethea',
          activeOrgId,
          did: localStorage.getItem('userDID') || 'did:prmth:sovereign-0x123',
          token: localStorage.getItem('pns_sovereign_token') || null
        });
      } else {
        setUser({ 
          uid: 'anonymous', 
          isAnonymous: true, 
          displayName: 'Anonymous',
          activeOrgId,
          did: null,
          token: null
        });
      }
    }
  }, []);

  return { user, isUserLoading: false, userError: null, switchContext };
};

export const useFirestore = () => firestore;

export function useComputeManifest<T = any>(manifest: any) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const executeManifest = useCallback(async () => {
    setIsLoading(true);
    try {
        if (typeof window !== 'undefined' && (window as any).executeComputeManifest) {
            // First we need raw data. In reality this would be pulled from the Sovereign Ledger
            const userDID = localStorage.getItem('userDID') || 'did:prmth:sovereign-0x123';
            
            let rawDataStr = "{}";
            try {
                // Fetch the encrypted blob from the new Go Sovereign Ledger (Phase 1)
                const ledgerUrl = '';
                const syndicateId = localStorage.getItem('activeOrganizationId') || 'global';
                const token = localStorage.getItem('pns_sovereign_token') || '';
                
                const res = await fetch(`${ledgerUrl}/api/v1/blob?did=${userDID}&syndicate_id=${syndicateId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const blobBytes = await res.arrayBuffer();
                    const decoder = new TextDecoder('utf-8');
                    rawDataStr = decoder.decode(blobBytes);
                } else {
                     // If no blob exists yet, we provide fallback seed data for the gateway to decrypt
                    rawDataStr = JSON.stringify({
                        balances: { UVT: 500.0, USDC: 1500.0 },
                        docs: [
                            { id: "tx-1", timestamp: new Date(Date.now() - 3600000).toISOString(), amount: 150.0, description: "Substrate Validation Sweating Reward", citizen: "Promethea" },
                            { id: "prop-101", title: "Establish Substrate Sentinel Node", description: "Deploy local validation node for multi-tenant isolation", votesFor: 4520, votesAgainst: 18, status: "active" }
                        ]
                    });
                }
            } catch (err) {
                console.warn("[Gateway] Ledger unreachable, using local encrypted vault fallback");
                rawDataStr = JSON.stringify({
                    balances: { UVT: 500.0, USDC: 1500.0 },
                    docs: [
                        { id: "tx-1", timestamp: new Date(Date.now() - 3600000).toISOString(), amount: 150.0, description: "Substrate Validation Sweating Reward", citizen: "Promethea" },
                        { id: "prop-101", title: "Establish Substrate Sentinel Node", description: "Deploy local validation node for multi-tenant isolation", votesFor: 4520, votesAgainst: 18, status: "active" }
                    ]
                });
            }

            const manifestStr = JSON.stringify(manifest);
            // The WASM Engine receives the encrypted raw data and the JSON logic manifest
            // It decrypts the data locally, evaluates the logic, and returns just the result.
            const resultStr = (window as any).executeComputeManifest(manifestStr, rawDataStr);
            const result = JSON.parse(resultStr);
            
            if (result.error) {
                // If it's an unsupported operation in our mock WASM engine, 
                // we fall back to returning the mock docs to prevent the UI from breaking 
                // while we build out the full WASM logic.
                if (result.error === "Unsupported operation") {
                     const parsedRaw = JSON.parse(rawDataStr);
                     setData((manifest.docId ? parsedRaw.docs[0] : parsedRaw.docs) as unknown as T);
                     setError(null);
                } else {
                    throw new Error(result.error);
                }
            } else {
                setData(result as T);
                setError(null);
            }
        } else {
            console.warn("[Gateway] WASM Engine not initialized yet. Retrying in 1s...");
            setTimeout(executeManifest, 1000);
            return;
        }
    } catch (err) {
        setError(err);
    } finally {
        setIsLoading(false);
    }
  }, [JSON.stringify(manifest)]);

  useEffect(() => {
    executeManifest();
  }, [executeManifest]);

  return { data, isLoading, error, refetch: executeManifest };
}

/**
 * BODY 3: STRICT DATA BIFURCATION (CONTEXT-AWARE)
 * Re-implemented as a wrapper around the UCS-ADM WASM Compute Manifest.
 */
export function useSovereignData<T = any>(type: 'USER' | 'STATE', endpoint: string, docId?: string) {
  const manifest = useMemo(() => ({
      operation: "query",
      type,
      endpoint,
      docId
  }), [type, endpoint, docId]);

  return useComputeManifest<T>(manifest);
}

// Re-export for legacy components while they migrate
export const useCollection = <T = any>(pathOrQuery: any) => {
  const collectionName = typeof pathOrQuery === 'string' ? pathOrQuery : pathOrQuery?.name || pathOrQuery?.id || 'unknown';
  return useSovereignData<T[]>('STATE', collectionName);
};

export const useDoc = <T = any>(pathOrRef: any, id?: string) => {
  const collectionName = typeof pathOrRef === 'string' ? pathOrRef : pathOrRef?.coll || pathOrRef?.name || 'unknown';
  const docId = id || pathOrRef?.id;
  return useSovereignData<T | null>('STATE', collectionName, docId);
};

export const useSovereignMemo = (factory: () => any, deps: any[]) => {
  return useMemo(factory, deps);
};

export const updateDocNonBlocking = async () => {};
export const setDocNonBlocking = async () => {};
export const deleteDocNonBlocking = async () => {};