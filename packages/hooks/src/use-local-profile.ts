'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@promethea/firebase';
import { useAuthStatus } from './use-auth-status';
import type { LocalCitizenProfile } from '@promethea/lib';

interface LocalProfileResult {
  localProfile: LocalCitizenProfile | null;
  isProfileLoading: boolean;
  setLocalProfile: (did: string, profile: LocalCitizenProfile) => void;
  syncFromPublic: (did: string, publicData: Partial<LocalCitizenProfile>) => void;
}

/**
 * A hook that manages the local, session-based user profile from localStorage.
 * It is the single source of truth for the user's sovereign persona data.
 * It only activates and attempts to load a profile if the user is authenticated.
 */
export function useLocalProfile(): LocalProfileResult {
  const { user, isUserLoading: isAuthUserLoading } = useUser();
  const { isAuthenticated, isAuthStatusLoading } = useAuthStatus();

  const [localProfile, setProfile] = useState<LocalCitizenProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(() => {
    if (!isAuthenticated || !user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const did = localStorage.getItem(`did-for-uid-${user.uid}`) || localStorage.getItem('userDID');
    if (did) {
      const profileData = localStorage.getItem(`promethea-profile-${did}`);
      if (profileData) {
        setProfile(JSON.parse(profileData));
      } else {
        // Smoothly hydrate a default profile from identity state if missing
        const newProfile = { displayName: 'Citizen ' + did.slice(0, 6) };
        localStorage.setItem(`promethea-profile-${did}`, JSON.stringify(newProfile));
        setProfile(newProfile);
      }
    } else {
      setProfile(null);
    }
    setIsLoading(false);
  }, [user, isAuthenticated]);


  useEffect(() => {
    setIsLoading(true);
    // The profile is only loaded if the central auth status has resolved AND shows authenticated.
    if (!isAuthStatusLoading) {
      loadProfile();
    }
  }, [isAuthStatusLoading, loadProfile]);


  const setLocalProfile = useCallback((did: string, profile: LocalCitizenProfile) => {
    localStorage.setItem(`promethea-profile-${did}`, JSON.stringify(profile));
    setProfile(profile);
  }, []);

  const syncFromPublic = useCallback((did: string, publicData: Partial<LocalCitizenProfile>) => {
    const profileData = localStorage.getItem(`promethea-profile-${did}`);
    const currentProfile = profileData ? JSON.parse(profileData) : {};

    const updatedProfile = {
      ...currentProfile,
      ...publicData,
      // Ensure we don't overwrite local-only state if sensitive
    };

    localStorage.setItem(`promethea-profile-${did}`, JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
  }, []);

  return {
    localProfile,
    isProfileLoading: isLoading || isAuthStatusLoading || isAuthUserLoading,
    setLocalProfile,
    syncFromPublic
  };
}
