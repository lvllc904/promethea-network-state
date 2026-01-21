'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from './components/FirebaseErrorListener';

// Minimal mock for a Firebase User to satisfy types if only uid is used
export interface MockUser {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
}

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Internal state for user authentication - now derived from localStorage or external signal
interface UserAuthState {
  user: MockUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: MockUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: MockUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser()
export interface UserHookResult {
  user: MockUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages core services. Identity is now strictly decoupled.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: false,
    userError: null,
  });

  // Passive identity derivation from localStorage
  useEffect(() => {
    const checkIdentity = () => {
      if (typeof window !== 'undefined') {
        const authStatus = localStorage.getItem('authStatus');
        const userUID = localStorage.getItem('userUID');
        const userDID = localStorage.getItem('userDID');

        if (authStatus === 'authenticated' && userUID) {
          setUserAuthState({
            user: {
              uid: userUID,
              isAnonymous: false,
              displayName: userDID || 'Citizen'
            },
            isUserLoading: false,
            userError: null
          });
        } else if (authStatus === 'anonymous') {
          setUserAuthState({
            user: {
              uid: 'anonymous',
              isAnonymous: true,
              displayName: 'Anonymous'
            },
            isUserLoading: false,
            userError: null
          });
        } else {
          setUserAuthState({ user: null, isUserLoading: false, userError: null });
        }
      }
    };

    checkIdentity();

    // Listen for storage changes
    window.addEventListener('storage', checkIdentity);
    const interval = setInterval(checkIdentity, 1000); // Polling for same-tab changes

    return () => {
      window.removeEventListener('storage', checkIdentity);
      clearInterval(interval);
    };
  }, []);

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const FirebaseClientProvider = FirebaseProvider;

export const useFirebase = (): FirebaseServicesAndUser | null => {
  const context = useContext(FirebaseContext);
  if (context === undefined) return null;
  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) return null;
  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useAuth = (): Auth | null => {
  const context = useContext(FirebaseContext);
  return context?.auth || null;
};

export const useFirestore = (): Firestore | null => {
  const context = useContext(FirebaseContext);
  return context?.firestore || null;
};

export const useFirebaseApp = (): FirebaseApp | null => {
  const context = useContext(FirebaseContext);
  return context?.firebaseApp || null;
};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  return useMemo(factory, deps);
}

export const useUser = (): UserHookResult => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    return { user: null, isUserLoading: false, userError: null };
  }
  return { user: context.user, isUserLoading: context.isUserLoading, userError: context.userError };
};
