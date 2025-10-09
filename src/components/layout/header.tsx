
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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from 'next/image';
import { Skeleton } from "../ui/skeleton";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { AuthStatusIndicator } from "./AuthStatusIndicator";

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

  const userEmail = "citizen@promethea.network"; 
  const userAvatar = PlaceHolderImages.find(p => p.id === `user1`);


  if (isAuthStatusLoading) {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-2xl font-headline font-semibold">{title}</h1>
            <div className="ml-auto flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <h1 className="text-2xl font-headline font-semibold">{title}</h1>
      
      <div className="mx-auto">
        <AuthStatusIndicator />
      </div>

      <div className="ml-auto flex items-center gap-4">
       {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <Avatar>
                  {userAvatar && <Image src={userAvatar.imageUrl} alt={"user avatar"} width={36} height={36} data-ai-hint={userAvatar.imageHint} />}
                  <AvatarFallback>{userEmail?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = '/login'}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
       ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
       )}
      </div>
    </header>
  );
}
