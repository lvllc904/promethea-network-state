'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@promethea/firebase';
import { useAuthStatus } from './use-auth-status';
import type { LocalCitizenProfile } from '@promethea/lib';

interface LocalProfileResult {
  localProfile: LocalCitizenProfile | null;
  isProfileLoading: boolean;
  setLocalProfile: (did: string, profile: LocalCitizenProfile) => void;
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

    const did = localStorage.getItem(`did-for-uid-${user.uid}`);
    if (did) {
        const profileData = localStorage.getItem(`promethea-profile-${did}`);
        if (profileData) {
            setProfile(JSON.parse(profileData));
        } else {
            // If the user is authenticated but has no local profile for this session,
            // we prompt them to create one.
            const name = prompt("To continue, please provide a display name for this session:");
            if (name) {
                const newProfile = { displayName: name };
                localStorage.setItem(`promethea-profile-${did}`, JSON.stringify(newProfile));
                setProfile(newProfile);
            } else {
                // If they cancel the prompt, we treat them as if they have no profile.
                setProfile(null);
            }
        }
    } else {
        // This case can happen briefly during the login transition.
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


  const setLocalProfile = (did: string, profile: LocalCitizenProfile) => {
    localStorage.setItem(`promethea-profile-${did}`, JSON.stringify(profile));
    setProfile(profile); // Update the state immediately
  };

  return {
    localProfile,
    isProfileLoading: isLoading || isAuthStatusLoading || isAuthUserLoading,
    setLocalProfile
  };
}
