'use client';
import { Suspense, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { SidebarProvider } from '@promethea/ui';

import { Skeleton } from '@promethea/ui';

import { MainNav } from '@/components/layout/main-nav';
import { SovereignHeaderTicker } from '@/components/hud/SovereignHeaderTicker';
import { SovereignFooterTicker } from '@/components/hud/SovereignFooterTicker';
import { SovereignHUD } from '@/components/hud/SovereignHUD';

function DashboardSkeleton() {
  return (
    <div className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 bg-black h-screen w-full">
      <div className="grid gap-4 md:grid-cols-2 md-gap-8 lg:grid-cols-4">
        <Skeleton className="h-28 bg-white/5" />
        <Skeleton className="h-28 bg-white/5" />
        <Skeleton className="h-28 bg-white/5" />
        <Skeleton className="h-28 bg-white/5" />
      </div>
      <div className="grid gap-4 md-gap-8 lg:grid-cols-2 mt-8">
        <Skeleton className="h-96 bg-white/5" />
        <Skeleton className="h-96 bg-white/5" />
      </div>
    </div>
  )
}

import { HUDProvider } from '@/lib/hud-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSG/SSR from executing client-only sovereign hooks found in children
  if (!mounted) return <DashboardSkeleton />;



  return (
      <SidebarProvider>

        
        <div className="w-full h-screen overflow-hidden bg-black text-white flex flex-col">
          <Suspense fallback={<DashboardSkeleton />}>
            <SovereignHUD>{children}</SovereignHUD>
          </Suspense>
        </div>
      </SidebarProvider>
  );
}
