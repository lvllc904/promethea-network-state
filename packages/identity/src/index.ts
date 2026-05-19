import { useMemo, useState, useEffect, useCallback } from 'react';

// Common Identifiers
export const firebaseApp = null;
export const auth = null;
export const firestore = {
  collection: (db: any, name?: string) => ({
    doc: (id?: string) => ({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: async () => {},
      update: async () => {},
      onSnapshot: () => () => {},
    }),
    add: async () => ({ id: 'mock-id' }),
    where: () => firestore.collection(null),
    orderBy: () => firestore.collection(null),
    limit: () => firestore.collection(null),
    onSnapshot: () => () => {},
    get: async () => ({ docs: [], empty: true })
  }),
  batch: () => ({
    set: () => {},
    update: () => {},
    delete: () => {},
    commit: async () => {},
  })
};

// Sovereign Utility Mocks (for migration)
export type DocumentReference<T = any> = { id: string, coll: string };
export type Query<T = any> = { name: string };

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
  const [user, setUser] = useState<{uid: string, isAnonymous: boolean, displayName: string | null, activeOrgId: string, did: string | null} | null>(null);
  
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
          did: localStorage.getItem('userDID') || 'did:prmth:sovereign-0x123'
        });
      } else {
        setUser({ 
          uid: 'anonymous', 
          isAnonymous: true, 
          displayName: 'Anonymous',
          activeOrgId,
          did: null
        });
      }
    }
  }, []);

  return { user, isUserLoading: false, userError: null, switchContext };
};

export const useFirestore = () => firestore;

const STATE_LAKE_URL = 'https://economic-engine-385120524005.us-central1.run.app';

/**
 * BODY 3: STRICT DATA BIFURCATION (CONTEXT-AWARE)
 */
export function useSovereignData<T = any>(type: 'USER' | 'STATE', endpoint: string, docId?: string) {
  const [data, setData] = useState<T | null>( (type === 'USER' || docId) ? null : ([] as unknown as T));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user } = useUser();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const orgId = user.activeOrgId;

    // 3.1: Private User Store
    if (type === 'USER') {
      try {
        const localData = localStorage.getItem(`sovereign_vault_${orgId}_${endpoint}_${docId || 'list'}`);
        setData(localData ? JSON.parse(localData) : (docId ? null : [] as unknown as T));
      } catch (e) {
        setData(docId ? null : [] as unknown as T);
      }
      setIsLoading(false);
      return;
    }

    // 3.2: Public Omni-Lake (Normalization & Rewriting)
    let finalPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Auto-rewrite raw collections or /api/collection to /api/state/:orgId/...
    if (!finalPath.startsWith('/api/state/')) {
        const parts = finalPath.split('/').filter(Boolean); // ['api', 'collection'] or ['collection']
        
        if (parts[0] === 'api' && parts[1] && !['state', 'shadow', 'execute', 'ai', 'asgi', 'lake'].includes(parts[1])) {
            const collection = parts[1];
            const remaining = parts.slice(2).join('/');
            finalPath = `/api/state/${orgId}/${collection}${remaining ? '/' + remaining : ''}`;
        } else if (parts[0] !== 'api') {
            // Raw collection name passed
            finalPath = `/api/state/${orgId}/${parts.join('/')}`;
        }
    }

    // Map remote paths to local BFF endpoints to avoid CORS and handle fallbacks robustly
    let bffPath: string | null = null;
    const normalized = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const cleanEndpoint = normalized.split('?')[0];
    const queryStr = normalized.includes('?') ? normalized.slice(normalized.indexOf('?')) : '';

    if (cleanEndpoint === 'ledger/uvt_history' || cleanEndpoint === 'ledger/uvt-history') {
      bffPath = '/api/ledger/uvt-history' + queryStr;
    } else if (cleanEndpoint === 'ledger/summary') {
      bffPath = '/api/ledger/summary' + queryStr;
    } else if (cleanEndpoint === 'governance/proposals') {
      bffPath = '/api/governance/proposals' + queryStr;
    } else if (cleanEndpoint === 'governance/cap_table' || cleanEndpoint === 'governance/cap-table') {
      bffPath = '/api/governance/cap-table' + queryStr;
    } else if (cleanEndpoint === 'lake') {
      bffPath = '/api/lake' + queryStr;
    } else if (cleanEndpoint === 'substrate/status') {
      bffPath = '/api/security_telemetry/pulse' + queryStr;
    } else if (cleanEndpoint === 'atlas/layers' || cleanEndpoint === 'atlas') {
      bffPath = '/api/atlas/layers' + queryStr;
    } else if (cleanEndpoint.startsWith('api/')) {
      bffPath = '/' + normalized;
    }

    // Attempt BFF fetch first
    if (bffPath) {
      try {
        const url = docId ? `${bffPath}/${docId}` : bffPath;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const rawData = json.docs ? json.docs.map((d: any) => typeof d.data === 'function' ? d.data() : d.data) : json;
          const validatedData = docId 
            ? (rawData && !rawData.error ? rawData : null) 
            : (Array.isArray(rawData) ? rawData : []);
          
          setData(validatedData);
          setError(null);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn(`[Identity] BFF fetch failed for ${bffPath}, trying remote or falling back...`, err);
      }
    }

    // Remote fallback (original logic)
    const baseUrl = STATE_LAKE_URL.endsWith('/') ? STATE_LAKE_URL.slice(0, -1) : STATE_LAKE_URL;
    const path = finalPath.startsWith('/') ? finalPath : `/${finalPath}`;
    const url = docId ? `${baseUrl}${path}/${docId}` : `${baseUrl}${path}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`State Engine Error: ${res.status}`);
        const json = await res.json();
        
        const rawData = json.docs ? json.docs.map((d: any) => typeof d.data === 'function' ? d.data() : d.data) : json;
        const validatedData = docId 
          ? (rawData && !rawData.error ? rawData : null) 
          : (Array.isArray(rawData) ? rawData : []);
          
        setData(validatedData);
        setError(null);
    } catch (err) {
        console.error(`[Identity] Omni-Lake fetch failed for ${finalPath}, using local mock fallbacks:`, err);
        setError(err);

        // High-fidelity fallback/synthetic generator to guarantee zero 500 error disruptions
        let fallbackData: any = docId ? null : [];
        if (!docId) {
          if (cleanEndpoint.includes('ledger/uvt')) {
            fallbackData = [
              { id: "tx-1", timestamp: new Date(Date.now() - 3600000).toISOString(), amount: 150.0, description: "Substrate Validation Sweating Reward", citizen: "Promethea" },
              { id: "tx-2", timestamp: new Date(Date.now() - 7200000).toISOString(), amount: 450.0, description: "Value Recirculation Protocol distribution", citizen: "Citizen-0x7a8" }
            ];
          } else if (cleanEndpoint.includes('ledger/summary')) {
            fallbackData = { totalSupply: 12500000, circulatingSupply: 9820450, burnRate: 0.85, recirculationRate: 91.2, activeWallets: 240 };
          } else if (cleanEndpoint.includes('governance/proposals')) {
            fallbackData = [
              { id: "prop-101", title: "Establish Substrate Sentinel Node", description: "Deploy local validation node for multi-tenant isolation", votesFor: 4520, votesAgainst: 18, status: "active" },
              { id: "prop-102", title: "Allocate RWA Liquidity Pool Cap", description: "Cap real-world asset exposure to prevent treasury contagion", votesFor: 8900, votesAgainst: 245, status: "passed" }
            ];
          } else if (cleanEndpoint.includes('governance/cap')) {
            fallbackData = [
              { citizen: "Promethea", stake: 4500000, percentage: 45 },
              { citizen: "Founders Pool", stake: 3000000, percentage: 30 },
              { citizen: "Public Stakeholders", stake: 2500000, percentage: 25 }
            ];
          } else if (cleanEndpoint.includes('lake')) {
            fallbackData = [
              { id: "sig-hud", title: "Sovereign Command HUD Initialized", content: "HUD shell is active and secure.", timestamp: new Date().toISOString(), type: "NARRATIVE_SIGNAL" }
            ];
          } else if (cleanEndpoint.includes('substrate') || cleanEndpoint.includes('status')) {
            fallbackData = { status: "healthy", peers: 12, blockHeight: 124508, latency: 28 };
          }
        } else {
          // Individual doc mock
          fallbackData = { id: docId, name: `Mock Doc ${docId}`, status: "active", updated: new Date().toISOString() };
        }
        setData(fallbackData as T);
    } finally {
        setIsLoading(false);
    }
  }, [type, endpoint, docId, user?.activeOrgId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
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