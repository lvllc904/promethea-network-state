'use client';
import { Suspense } from 'react';

import { Header } from '@promethea/components';
import { MainNav } from '@promethea/components';
import { SidebarProvider } from '@promethea/ui';
import { useAuthStatus } from '@promethea/hooks';
import { Skeleton } from '@promethea/ui';
import { Handshake } from '@/components/auth/Handshake';
import { LiveTicker } from '@/components/layout/LiveTicker';

function DashboardSkeleton() {
  return (
    <div className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 md-gap-8 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid gap-4 md-gap-8 lg:grid-cols-2 mt-8">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthStatusLoading } = useAuthStatus();

  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <Handshake />
      </Suspense>
      <div className="flex min-h-screen w-full bg-muted/40">
        <MainNav />
        <div className="flex flex-col sm:pl-14 w-full">
          <Header />
          <LiveTicker />
          <main className="flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-8 overflow-y-auto">
            {isAuthStatusLoading ? <DashboardSkeleton /> : children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
