'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Command, ExternalLink, Search, Settings2, ShieldCheck, Sparkles } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@promethea/ui';
import { useHUD } from '@/lib/hud-store';
import { NetworkStateAccordion } from './NetworkStateAccordion';
import { MapViewport } from './MapViewport';
import { CockpitStatusBar } from './CockpitStatusBar';
import { GuildhallThemeMenu } from '@/components/guildhall/GuildhallThemeMenu';
import { UiVersionToggle } from '@/components/layout/UiVersionToggle';
import { GuildhallPanel } from '@/components/guildhall/GuildhallPanel';
import { CommandCenter } from './CommandCenter';
import { OperationalPanel } from './OperationalPanel';
import { HoldingsPanel } from './HoldingsPanel';
import { PrometheaConcierge } from './PrometheaConcierge';
import { AssetListingModal } from './AssetListingModal';
import { OneClickLister } from '@promethea/components';

export function GuildhallCockpit({ children }: { children?: ReactNode }) {
  const { assets, setHUDState } = useHUD();
  const [operatorToolsOpen, setOperatorToolsOpen] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-guildhall-bg text-guildhall-text">
      <header className="sticky top-0 z-40 border-b border-guildhall-line bg-guildhall-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex min-h-[4.5rem] max-w-[1800px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-guildhall-consensus"><span className="flex h-9 w-9 items-center justify-center bg-guildhall-identity font-command text-xs font-bold text-guildhall-bg">PNS</span><span className="hidden font-command text-sm font-semibold tracking-[0.14em] sm:inline">Sovereign cockpit</span></Link>
          <div className="flex items-center gap-2"><span className="hidden items-center gap-2 text-xs text-guildhall-muted lg:flex"><ShieldCheck className="h-4 w-4 text-guildhall-treasury" />Guest-safe operator view</span><GuildhallThemeMenu /><UiVersionToggle /><Button asChild variant="outline" size="sm" className="border-guildhall-line bg-transparent text-guildhall-text hover:bg-guildhall-panel-raised"><Link href="/"><ArrowRight className="h-4 w-4 rotate-180" />Exit</Link></Button></div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1800px] gap-px bg-guildhall-line lg:grid-cols-[minmax(22rem,35%)_minmax(0,65%)]">
        <aside className="flex min-h-[calc(100dvh-4.5rem)] flex-col bg-guildhall-panel px-4 py-5 sm:px-6">
          <div className="mb-5"><p className="guildhall-kicker text-guildhall-treasury">3-body network state</p><h1 className="mt-2 font-command text-3xl font-semibold tracking-tight">Command column</h1><p className="mt-2 text-sm leading-6 text-guildhall-muted">Use the three primary sections for identity, treasury, and consensus. Advanced tools remain available below.</p></div>
          <div className="mb-5 border border-guildhall-line bg-guildhall-bg p-3"><div className="flex items-center gap-3"><Search className="h-4 w-4 text-guildhall-muted" /><input aria-label="Search operator actions" placeholder="Search operator actions" className="min-w-0 flex-1 bg-transparent text-sm text-guildhall-text placeholder:text-guildhall-subtle focus:outline-none" /><kbd className="hidden border border-guildhall-line px-2 py-1 font-code text-[11px] text-guildhall-subtle sm:inline">⌘K</kbd></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setHUDState({ activePillar: 'PASSPORT' })} className="guildhall-control min-h-0 px-2 py-1 text-xs">Citizens</button><button type="button" onClick={() => setHUDState({ cockpitHoldingsTab: 'FINANCIALS' })} className="guildhall-control min-h-0 px-2 py-1 text-xs">Treasury</button><button type="button" onClick={() => setHUDState({ activePillar: 'GOVERNANCE' })} className="guildhall-control min-h-0 px-2 py-1 text-xs">Governance</button><button type="button" onClick={() => setHUDState({ activePillar: 'PULSE' })} className="guildhall-control min-h-0 px-2 py-1 text-xs">Telemetry</button></div></div>
          <NetworkStateAccordion />
          {children && <GuildhallPanel className="mt-5" padded={false}><p className="guildhall-label">Route workspace</p><div className="mt-3 text-sm text-guildhall-muted">{children}</div></GuildhallPanel>}
          <div className="mt-auto space-y-3 pt-6"><div className="flex items-center justify-between border-t border-guildhall-line pt-4"><div><p className="guildhall-label">Operator tools</p><p className="mt-1 text-sm text-guildhall-muted">Agents, chat, exchange, logs, and command palette.</p></div><Settings2 className="h-5 w-5 text-guildhall-muted" aria-hidden="true" /></div><Dialog open={operatorToolsOpen} onOpenChange={setOperatorToolsOpen}><DialogTrigger asChild><Button type="button" variant="outline" className="w-full justify-between border-guildhall-line bg-transparent text-guildhall-text hover:bg-guildhall-panel-raised">Open operator tools <ExternalLink className="h-4 w-4" /></Button></DialogTrigger><DialogContent hiddenTitle="Operator tools" className="max-h-[85dvh] max-w-5xl overflow-y-auto border-guildhall-line bg-guildhall-panel text-guildhall-text"><DialogHeader><DialogTitle className="font-command text-2xl">Operator tools</DialogTitle><DialogDescription className="text-guildhall-muted">Advanced capabilities remain available without competing with the primary three-body state.</DialogDescription></DialogHeader><div className="grid gap-5 lg:grid-cols-2"><GuildhallPanel padded={false}><p className="guildhall-label mb-4">Command palette</p><CommandCenter /></GuildhallPanel><GuildhallPanel padded={false}><p className="guildhall-label mb-4">Concierge</p><PrometheaConcierge onLaunchAssetModal={() => setShowAssetModal(true)} /></GuildhallPanel><GuildhallPanel padded={false}><p className="guildhall-label mb-4">Operational state</p><OperationalPanel /></GuildhallPanel><GuildhallPanel padded={false}><p className="guildhall-label mb-4">Holdings and financials</p><HoldingsPanel /></GuildhallPanel></div></DialogContent></Dialog><Button type="button" onClick={() => setShowAssetModal(true)} className="w-full bg-guildhall-treasury text-guildhall-bg hover:bg-emerald-300"><Sparkles className="h-4 w-4" />Onboard an asset</Button></div>
        </aside>
        <section className="flex min-h-[calc(100dvh-4.5rem)] flex-col bg-guildhall-bg p-3 sm:p-5"><MapViewport /><CockpitStatusBar /></section>
      </main>
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
              onAutoList={async (file) => {
                return { error: 'fallback_active' };
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
