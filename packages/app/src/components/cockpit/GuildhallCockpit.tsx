'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, SlidersHorizontal, Bot, Map } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@promethea/ui';
import { useHUD } from '@/lib/hud-store';
import { GuildhallThemeMenu } from '@/components/guildhall/GuildhallThemeMenu';
import { UiVersionToggle } from '@/components/layout/UiVersionToggle';
import { OneClickLister } from '@promethea/components';

// 3-Pillar Spatial Cockpit Components
import { SpatialBusProvider, useSpatialBus } from '@/context/SpatialBusContext';
import { SpatialMapSubstrate } from '@/components/spatial/SpatialMapSubstrate';
import { TownhallMarketplaceDrawer } from '@/components/marketplace/TownhallMarketplaceDrawer';
import { PrometheaCockpitDock } from '@/components/ai/PrometheaCockpitDock';

function CockpitViewInner({ children }: { children?: ReactNode }) {
  const { assets, setHUDState } = useHUD();
  const [showAssetModal, setShowAssetModal] = useState(false);
  const { isMarketplaceOpen, isCockpitOpen, setIsMarketplaceOpen, setIsCockpitOpen } = useSpatialBus();

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] w-full bg-[#07090e] text-white overflow-hidden flex flex-col select-none">
      {/* Top Sovereign Bar */}
      <header className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.6)] shrink-0">
        <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link 
              href="/" 
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 group"
              title="Return to Landing Page"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 font-command text-xs font-black text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)] group-hover:scale-105 transition-transform">
                PNS
              </span>
              <div className="hidden sm:block stat-lockup">
                <span className="font-command text-sm font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  Promethean Sovereign Cockpit
                </span>
                <span className="data-kicker text-cyan-400">
                  3-BODY SPATIAL OS
                </span>
              </div>
            </Link>
          </div>

          {/* Center Quick Toggles for View Panels */}
          <div className="flex items-center space-x-1.5 glass-panel-specular p-1 rounded-2xl">
            <button
              onClick={() => setIsMarketplaceOpen(!isMarketplaceOpen)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                isMarketplaceOpen
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_2px_10px_rgba(16,185,129,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
              title="Toggle Marketplace Feed Drawer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Marketplace</span>
            </button>

            <button
              onClick={() => setIsCockpitOpen(!isCockpitOpen)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                isCockpitOpen
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_2px_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
              title="Toggle Promethea AI Dock"
            >
              <Bot className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Promethea</span>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAssetModal(true)}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 text-xs font-mono font-bold transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>+ Onboard Asset</span>
            </button>

            <GuildhallThemeMenu className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 shadow-sm transition" />
            <UiVersionToggle />

            <Button asChild variant="outline" size="sm" className="border-white/10 bg-white/[0.05] text-zinc-200 hover:text-white hover:bg-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold shadow-sm">
              <Link href="/">
                <ArrowRight className="h-3.5 w-3.5 rotate-180 mr-1.5 text-cyan-400" />
                <span>Exit to Landing</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Full-Viewport Spatial Stage */}
      <main className="relative flex-1 w-full h-[calc(100dvh-4rem)] overflow-hidden">
        {/* Pillar 1: Spatial Map Substrate (The Canvas Background) */}
        <SpatialMapSubstrate />

        {/* Pillar 2: Townhall / Marketplace Overlay Feed (Left Drawer) */}
        <TownhallMarketplaceDrawer />

        {/* Pillar 3: Promethea Sovereign Concierge Cockpit (Right Dock) */}
        <PrometheaCockpitDock />

        {/* Route Workspace Overlay (if sub-routes are opened) */}
        {children && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 max-w-4xl w-[90%] pointer-events-none">
            <div className="pointer-events-auto bg-slate-950/90 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-2xl">
              {children}
            </div>
          </div>
        )}
      </main>

      {/* Sovereign 1-Click Asset Ingress Modal */}
      {showAssetModal && (
        <Dialog open={showAssetModal} onOpenChange={setShowAssetModal}>
          <DialogContent hiddenTitle="One-Click Asset Ingress" className="max-w-2xl border-white/10 bg-slate-950 text-white">
            <DialogHeader>
              <DialogTitle className="font-command text-2xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                Sovereign 1-Click Asset Ingress
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Upload your asset deeds, software blueprints, or financial balance sheets. The Promethea Ingress Agent will underwrite and onboard the asset automatically.
              </DialogDescription>
            </DialogHeader>
            <OneClickLister
              onComplete={(data) => {
                setHUDState({
                  assets: [
                    ...(assets || []),
                    {
                      id: String(Date.now()),
                      name: data.assetName,
                      category: data.assetType,
                      valuationUSDC: data.enterpriseValue,
                      location: data.location
                    } as any
                  ]
                });
                setShowAssetModal(false);
              }}
              onAutoList={async () => {
                return { error: 'fallback_active' };
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function GuildhallCockpit({ children }: { children?: ReactNode }) {
  return (
    <SpatialBusProvider>
      <CockpitViewInner>{children}</CockpitViewInner>
    </SpatialBusProvider>
  );
}
