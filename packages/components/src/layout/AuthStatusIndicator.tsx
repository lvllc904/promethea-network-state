
'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@promethea/ui';
import { cn } from '@promethea/lib';
import { ShieldCheck, UserCircle } from 'lucide-react';
import { useAuthStatus } from '@promethea/hooks';

/**
 * A floating indicator that shows authentication status.
 * It does NOT interact with Firebase directly. It only reads from localStorage.
 */
export function AuthStatusIndicator() {
  const { isAuthenticated, isAuthStatusLoading } = useAuthStatus();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the bar after a short delay to prevent flickering on load
    const visibilityTimeout = setTimeout(() => {
        setIsVisible(true);
    }, 500);

    // Cleanup
    return () => {
      clearTimeout(visibilityTimeout);
    };
  }, []);
  
  if (isAuthStatusLoading) {
      return null;
  }

  const progressValue = isAuthenticated ? 100 : 50;
  
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-background p-2 transition-opacity duration-500',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
        <div className="flex-shrink-0">
          {!isAuthenticated ? (
            <UserCircle className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-green-500" />
          )}
        </div>
        <Progress
          value={progressValue}
          className={cn('h-2 w-24 transition-all', {
            '[&>div]:bg-green-500': isAuthenticated,
            '[&>div]:bg-amber-500': !isAuthenticated,
          })}
        />
        <span className="text-xs text-muted-foreground w-28 text-left">
          {!isAuthenticated ? 'Anonymous Mode' : 'Authenticated'}
        </span>
    </div>
  );
}
