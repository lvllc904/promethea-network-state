'use client';
import { Suspense, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { SidebarProvider } from '@promethea/ui';
import { useDynamicContext, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { Skeleton } from '@promethea/ui';
import { Handshake } from '@/components/auth/Handshake';
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
  const { isLoggedIn, setShowAuthFlow } = useDynamicContext();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSG/SSR from executing client-only sovereign hooks found in children
  if (!mounted) return <DashboardSkeleton />;



  return (
      <SidebarProvider>
        <Suspense fallback={null}>
          <Handshake />
        </Suspense>
        
        <div className="w-full h-screen overflow-hidden bg-black text-white flex flex-col">
          {!isLoggedIn ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-8 relative z-10">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
                <h1 className="text-2xl md:text-4xl font-black font-mono tracking-widest text-center">INITIALIZE<br/>SOVEREIGN VAULT</h1>
                <p className="text-zinc-500 font-mono text-sm max-w-md text-center mb-4">Authenticate to provision your non-custodial wallet and generate your Decentralized Identifier.</p>
                <div className="scale-125">
                  <DynamicWidget />
                </div>
            </div>
          ) : (
            <SovereignHUD>{children}</SovereignHUD>
          )}
        </div>
      </SidebarProvider>
  );
}
