
'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ShieldCheck, UserCircle } from 'lucide-react';

type AuthStatus = 'anonymous' | 'authenticated' | null;

/**
 * A floating indicator that shows authentication status.
 * It does NOT interact with Firebase directly. It only reads from localStorage.
 */
export function AuthStatusIndicator() {
  const [status, setStatus] = useState<AuthStatus>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Function to update state from localStorage
    const checkAuthStatus = () => {
      const storedStatus = localStorage.getItem('authStatus') as AuthStatus;
      setStatus(storedStatus);
    };

    // Initial check
    checkAuthStatus();
    
    // Listen for storage changes from other tabs
    window.addEventListener('storage', checkAuthStatus);

    // Also set up an interval to poll for changes, since 'storage' event doesn't
    // fire for changes in the same tab.
    const intervalId = setInterval(checkAuthStatus, 500);
    
    // Show the bar after a short delay to prevent flickering on load
    const visibilityTimeout = setTimeout(() => {
        setIsVisible(true);
    }, 500);

    // Cleanup
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      clearInterval(intervalId);
      clearTimeout(visibilityTimeout);
    };
  }, []);

  const progressValue = status === 'authenticated' ? 100 : 50;
  const isAnonymous = status === 'anonymous';

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-2 transition-opacity duration-500',
        isVisible ? 'opacity-100' : 'opacity-0',
        'bg-background/80 backdrop-blur-sm'
      )}
      style={{
        paddingLeft: 'calc(var(--sidebar-width-icon) + 1rem)',
        paddingRight: '1rem',
      }}
    >
      <div className="w-full max-w-xs flex items-center gap-3">
        <div className="flex-shrink-0">
          {isAnonymous ? (
            <UserCircle className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-green-500" />
          )}
        </div>
        <Progress
          value={progressValue}
          className={cn('h-2 transition-all', {
            '[&>div]:bg-green-500': !isAnonymous,
            '[&>div]:bg-amber-500': isAnonymous,
          })}
        />
        <span className="text-xs text-muted-foreground w-28 text-right">
          {isAnonymous ? 'Anonymous Mode' : 'Authenticated'}
        </span>
      </div>
    </div>
  );
}
