
'use client';

import { useState, useEffect, useCallback } from 'react';

type AuthStatus = 'anonymous' | 'authenticated' | null;

interface AuthStatusResult {
  isAuthenticated: boolean;
  isAuthStatusLoading: boolean;
}

/**
 * A hook that reads the authentication status from localStorage.
 * It does NOT interact with Firebase directly. It only listens for
 * a value set by the separate authentication system.
 *
 * @returns {AuthStatusResult} An object containing the authentication state.
 */
export function useAuthStatus(): AuthStatusResult {
  const [status, setStatus] = useState<AuthStatus>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(() => {
    // This function can only run on the client where localStorage is available.
    if (typeof window !== 'undefined') {
      try {
        const storedStatus = localStorage.getItem('authStatus') as AuthStatus;
        setStatus(storedStatus);
      } catch (error) {
        console.error("Could not read auth status from localStorage", error);
        setStatus(null);
      }
    }
  }, []);

  useEffect(() => {
    // Initial check on mount
    checkAuthStatus();
    setIsLoading(false);

    // Listen for storage changes from other tabs to keep state synchronized.
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authStatus') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also set up an interval as a fallback for same-tab changes,
    // as the 'storage' event doesn't fire for the tab that made the change.
    const intervalId = setInterval(checkAuthStatus, 500);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [checkAuthStatus]);

  return {
    isAuthenticated: status === 'authenticated',
    isAuthStatusLoading: isLoading,
  };
}

    