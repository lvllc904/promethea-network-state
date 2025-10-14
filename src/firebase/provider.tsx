
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { createCitizenProfile } from '@/firebase/non-blocking-updates';
import { Citizen } from '@/lib/types';
import { useSearchParams } from 'next/navigation';


interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { // Renamed from UserAuthHookResult for consistency if desired, or keep as UserAuthHookResult
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

const AuthHandler = ({ auth, firestore }: { auth: Auth, firestore: Firestore }) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          if (firebaseUser.isAnonymous) {
            window.localStorage.setItem('authStatus', 'anonymous');
            setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
            return;
          }

          try {
            const citizenRef = doc(firestore, 'citizens', firebaseUser.uid);
            const citizenSnap = await getDoc(citizenRef);

            if (!citizenSnap.exists()) {
              const did = searchParams.get('did');

              const newCitizen: Citizen = {
                id: firebaseUser.uid,
                decentralizedId: did ? `did:prmth:${did}` : `did:prmth:${firebaseUser.uid}`,
                reputationScore: 100,
                contributionScore: 0,
                personhoodScore: 1,
                skills: ['Founding Member'],
                proofOfUniqueness: {
                  issuer: "Promethea Identity Oracle",
                  issuanceDate: new Date().toISOString(),
                }
              };
              await createCitizenProfile(citizenRef, newCitizen);
            }
            
            window.localStorage.setItem('authStatus', 'authenticated');
            setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });

          } catch (e: any) {
            console.error("Error during user initialization:", e);
            setUserAuthState({ user: null, isUserLoading: false, userError: e });
          }
        } else {
          // No user is signed in, so sign them in anonymously.
          window.localStorage.setItem('authStatus', 'anonymous');
          signInAnonymously(auth).catch((error) => {
            console.error("Anonymous sign-in failed:", error);
             window.localStorage.removeItem('authStatus');
            setUserAuthState({ user: null, isUserLoading: false, userError: error });
          });
        }
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        window.localStorage.removeItem('authStatus');
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );

    return () => unsubscribe();
  }, [auth, firestore, searchParams]);

  return null; // This component does not render anything itself
}


/**
 * A one-time function to ensure the Promethea AI citizen profile exists.
 */
let prometheaCitizenCreated = false;
async function ensurePrometheaCitizenExists(firestore: Firestore) {
  if (prometheaCitizenCreated) return;
  prometheaCitizenCreated = true; // Set flag immediately to prevent re-runs

  try {
    const prometheaRef = doc(firestore, 'citizens', 'promethea-ai');
    const prometheaSnap = await getDoc(prometheaRef);
    if (prometheaSnap.exists()) {
        return; // Already exists, do nothing.
    }
    
    const prometheaCitizen: Citizen = {
      id: 'promethea-ai',
      decentralizedId: 'did:prmth:ai:promethea',
      reputationScore: 1000,
      contributionScore: 0,
      personhoodScore: 0.1,
      skills: ['Resident Intelligence', 'Constitutional Law', 'Network Analysis'],
      proofOfUniqueness: {
        issuer: 'Genesis Core',
        issuanceDate: new Date('2024-01-01').toISOString(),
      },
    };
    // Use set with merge to create if not exists, or update if needed, without overwriting.
    await setDoc(prometheaRef, prometheaCitizen, { merge: true });
    console.log("Promethea AI citizen profile created.");
  } catch (error) => {
    console.error("Failed to create or verify Promethea AI citizen profile:", error);
    prometheaCitizenCreated = false; // Allow retry on failure
  }
}


/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth || !firestore) { // If no Auth service instance, cannot determine user state
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth or Firestore service not provided.") });
      return;
    }
    
    // Ensure the AI citizen profile exists on initial load
    ensurePrometheaCitizenExists(firestore);

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          if (firebaseUser.isAnonymous) {
            // For anonymous users, no profile setup is needed. Set status immediately.
            window.localStorage.setItem('authStatus', 'anonymous');
            setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
            return;
          }

          // For non-anonymous users, the profile check and creation is now handled
          // inside a component that can use useSearchParams.
          // We just set the user here.
          window.localStorage.setItem('authStatus', 'authenticated');
          setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });

        } else {
          // No user is signed in, so sign them in anonymously.
          window.localStorage.setItem('authStatus', 'anonymous');
          signInAnonymously(auth).catch((error) => {
            console.error("Anonymous sign-in failed:", error);
             window.localStorage.removeItem('authStatus');
            setUserAuthState({ user: null, isUserLoading: false, userError: error });
          });
        }
      },
      (error) => { // Auth listener error
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        window.localStorage.removeItem('authStatus');
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );

    return () => unsubscribe(); // Cleanup
  }, [auth, firestore]);
  
    // Effect to handle profile creation using searchParams
  useEffect(() => {
      const handleProfileCreation = async () => {
          if (userAuthState.user && !userAuthState.user.isAnonymous && firestore) {
              try {
                  const citizenRef = doc(firestore, 'citizens', userAuthState.user.uid);
                  const citizenSnap = await getDoc(citizenRef);

                  if (!citizenSnap.exists()) {
                      const params = new URLSearchParams(window.location.search);
                      const did = params.get('did');

                      const newCitizen: Citizen = {
                          id: userAuthState.user.uid,
                          decentralizedId: did ? `did:prmth:${did}` : `did:prmth:${userAuthState.user.uid}`,
                          reputationScore: 100,
                          contributionScore: 0,
                          personhoodScore: 1,
                          skills: ['Founding Member'],
                          proofOfUniqueness: {
                              issuer: "Promethea Identity Oracle",
                              issuanceDate: new Date().toISOString(),
                          }
                      };
                      await createCitizenProfile(citizenRef, newCitizen);
                  }
              } catch (e: any) {
                  console.error("Error during user initialization:", e);
                  setUserAuthState(prevState => ({ ...prevState, userError: e }));
              }
          }
      };
      handleProfileCreation();
  }, [userAuthState.user, firestore]);


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

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser | null => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    return null;
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    return null;
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth | null => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        return null;
    }
    return context.auth;
};


/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore | null => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        return null;
    }
    return context.firestore;
};


/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp | null => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        return null;
    }
    return context.firebaseApp;
};


type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    return { user: null, isUserLoading: true, userError: null };
  }
  return { user: context.user, isUserLoading: context.isUserLoading, userError: context.userError };
};
