
"use client";

import { usePathname } from "next/navigation";
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@promethea/ui";
import { Button } from "@promethea/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@promethea/ui";
import { SidebarTrigger } from "@promethea/ui";
import { PlaceHolderImages } from "@promethea/lib";
import Image from 'next/image';
import { Skeleton } from "@promethea/ui";
import { useAuthStatus } from "@promethea/hooks";
import { AuthStatusIndicator } from "./AuthStatusIndicator";
import { useUser } from "@promethea/firebase";
import { useState, useEffect } from "react";
import type { LocalCitizenProfile } from "@promethea/lib";

import { syncEngine } from '@promethea/sovereign-store';

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 1) return "Dashboard";
  if (segments.length > 1) {
    const title = segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
    return title.split('-').join(' ');
  }
  return "Promethea";
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const { isAuthenticated, isAuthStatusLoading } = useAuthStatus();
  const { user } = useUser();

  const [localProfile, setLocalProfile] = useState<LocalCitizenProfile | null>(null);

  useEffect(() => {
    if (user) {
      const did = localStorage.getItem(`did-for-uid-${user.uid}`);
      if (did) {
        const profileData = localStorage.getItem(`promethea-profile-${did}`);
        if (profileData) {
          setLocalProfile(JSON.parse(profileData));
        }
      }
    } else {
      setLocalProfile(null);
    }
  }, [user, pathname]); // Rerun on user change or navigation

  const userDisplayName = localProfile?.displayName || "Citizen";
  const userAvatar = PlaceHolderImages.find(p => p.id === `user1`);

  if (isAuthStatusLoading) {
    return (
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <SidebarTrigger className="sm:hidden" />
        <div className="ml-auto flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>
    );
  }

  const handleLogout = () => {
    console.log('[Header] De-hydrating Sovereign Datastore...');
    syncEngine.disable();
    localStorage.removeItem('authStatus');
    localStorage.removeItem('userDID');
    localStorage.removeItem('userUID');
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="sm:hidden" />

      <div className="w-full flex items-center gap-4">
        <h1 className="text-2xl font-headline font-semibold hidden md:block">{title}</h1>

        <div className="flex-grow flex justify-center">
          <AuthStatusIndicator />
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                  <Avatar>
                    {userAvatar && <Image src={userAvatar.imageUrl} alt={userDisplayName} width={36} height={36} data-ai-hint={userAvatar.imageHint} />}
                    <AvatarFallback>{userDisplayName?.charAt(0).toUpperCase() || 'C'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{userDisplayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/security/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/security/detect">Support (Shield)</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/dashboard">
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

