import { useMemo, useState, useEffect } from 'react';

// Common Identifiers
export const firebaseApp = null;
export const auth = null;
export const firestore = {
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: async () => {},
      update: async () => {},
      onSnapshot: () => () => {},
    }),
    add: async () => ({ id: 'mock-id' }),
    where: () => firestore.collection(),
    orderBy: () => firestore.collection(),
    limit: () => firestore.collection(),
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

export const getClientFirebase = () => ({ app: null, auth: null, firestore: null });

export const useUser = () => {
  const [user, setUser] = useState<{uid: string, isAnonymous: boolean, displayName: string | null} | null>(null);
  
  useEffect(() => {
    // Web2-to-Web3 Progressive Ramp Mock
    // Replace with Web3Auth / Privy in the future
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('authStatus');
      const userUID = localStorage.getItem('userUID');
      if (authStatus === 'authenticated') {
        setUser({ uid: userUID || 'sovereign-0x123', isAnonymous: false, displayName: 'Citizen' });
      } else if (authStatus === 'anonymous') {
        setUser({ uid: 'anonymous', isAnonymous: true, displayName: 'Anonymous' });
      }
    }
  }, []);

  return { user, isUserLoading: false, userError: null };
};

export const useAuth = () => null;
export const useFirestore = () => firestore;

export const useDoc = (collectionPath: string, docId: string) => {
  return { data: null, isLoading: false, error: null };
};

export const useCollection = (collectionPath: string, ...queryArgs: any[]) => {
  return { data: [], isLoading: false, error: null };
};

export const useMemoFirebase = (factory: () => any, deps: any[]) => {
  return useMemo(factory, deps);
};

export const updateDocNonBlocking = async () => {};
export const setDocNonBlocking = async () => {};
export const deleteDocNonBlocking = async () => {};

export const FirebaseErrorListener = () => null;