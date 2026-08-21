'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, CircleDot, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@promethea/ui';
import { GroupedExploreMenu } from './GroupedExploreMenu';
import { HeroTelemetryBackdrop } from './HeroTelemetryBackdrop';
import { NetworkFeedTable } from './NetworkFeedTable';
import { ProtocolBento } from './ProtocolBento';
import { TruthfulMetrics } from './TruthfulMetrics';
import { LandingMediaGrid } from './LandingMediaGrid';
import { LandingVideoShowcase } from './LandingVideoShowcase';
import { LandingInfographic } from './LandingInfographic';
import { GuildhallThemeMenu } from '@/components/guildhall/GuildhallThemeMenu';
import { UiVersionToggle } from '@/components/layout/UiVersionToggle';
import { fetchNetworkSignals } from '@/lib/guildhall-data';
import type { NetworkSignal, RequestStatus } from '@/lib/guildhall-types';

const releases = [
  ['v5.4.0', 'Conversational pivot protocol', 'Directed semantic graph state now supports branchable dialogue and visual context switching.'],
  ['v5.0.0', 'HUD restoration and GCP hardening', 'Transactional signature gates, restricted proxy keys, and local fallbacks were standardized.'],
  ['v1.6.0', 'Progressive hydration and WASM gating', 'Gateway payload validation keeps failed edge responses from reaching the runtime.'],
];

const guidance = [
  ['01', 'Secure your identity', 'Protect keys locally, connect a wallet only when you are ready, and never share a seed phrase.', ShieldCheck],
  ['02', 'Verify the feed', 'Read the source, freshness, and consensus context before acting on a network signal.', CircleDot],
  ['03', 'Start with one asset', 'Use Cartographer to understand how a documented physical asset becomes a network position.', CheckCircle2],
] as const;

export function GuildhallLanding() {
  const [signals, setSignals] = useState<NetworkSignal[]>([]);
  const [feedStatus, setFeedStatus] = useState<RequestStatus>('loading');

  const loadSignals = useCallback(async () => {
    setFeedStatus('loading');
    try {
      setSignals(await fetchNetworkSignals());
      setFeedStatus('success');
    } catch (error) {
      console.warn('[Guildhall] Network feed unavailable', error);
      setFeedStatus('error');
    }
  }, []);

  useEffect(() => {
    void loadSignals();
  }, [loadSignals]);

  return (
    <div className="min-h-[100dvh] bg-guildhall-bg text-guildhall-text">
      {/* Sticky nav - borderless, shadow-only */}
      <header className="sticky top-0 z-50 bg-guildhall-bg/90 backdrop-blur-md" style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.04)' }}>
        <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-guildhall-identity/50 rounded-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-guildhall-identity font-command text-xs font-bold text-guildhall-bg" style={{ boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}>PNS</span>
            <span className="hidden font-command text-sm font-semibold tracking-[0.16em] sm:inline">Promethean</span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Primary navigation">
            <GroupedExploreMenu />
            <GuildhallThemeMenu className="hidden md:inline-flex" />
            <UiVersionToggle />
            <Button asChild size="sm" className="rounded-xl bg-guildhall-text text-guildhall-bg hover:bg-white shadow-md"><Link href="/dashboard">Enter the cockpit <ArrowRight className="h-4 w-4" /></Link></Button>
          </nav>
        </div>
      </header>

      <main className="space-y-0">
        {/* Hero - rounded card, shadow-only separation */}
        <section className="mx-auto max-w-[1440px] px-5 pt-12 pb-16 sm:px-8 sm:pt-16 sm:pb-20 lg:px-12">
          <div className="grid gap-6 lg:grid-cols-2 rounded-3xl overflow-hidden" style={{ boxShadow: '0 8px 64px rgba(0,0,0,0.5)' }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="bg-guildhall-bg px-8 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24">
              <p className="guildhall-kicker">Network state platform</p>
              <h1 className="mt-6 max-w-2xl font-command text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-guildhall-text sm:text-7xl">Sovereignty is <span className="text-guildhall-identity">computable.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-guildhall-muted">A verifiable operating surface for identity, real-world assets, treasury, and governance.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-xl bg-guildhall-identity text-guildhall-bg hover:bg-amber-300" style={{ boxShadow: '0 0 24px rgba(245,158,11,0.25)' }}><Link href="/dashboard">Enter the cockpit <ArrowRight className="h-4 w-4" /></Link></Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl bg-transparent text-guildhall-text hover:bg-guildhall-panel/60 backdrop-blur-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }}><Link href="/constitution">Read the constitution</Link></Button>
              </div>
              <div className="mt-14 grid max-w-xl grid-cols-1 sm:grid-cols-3 gap-3">
                {[['Identity', 'Keys and proof'], ['Treasury', 'Assets and yield'], ['Consensus', 'Proposals and votes']].map(([label, detail]) => (
                  <div key={label} className="rounded-2xl p-4 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <p className="guildhall-label">{label}</p>
                    <p className="mt-2 text-sm text-guildhall-muted">{detail}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="relative min-h-[30rem] overflow-hidden bg-guildhall-panel lg:min-h-0">
              <HeroTelemetryBackdrop />
              <div className="relative flex h-full min-h-[30rem] flex-col justify-between p-6 sm:p-8">
                <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <p className="guildhall-kicker text-guildhall-consensus">Telemetry window</p>
                    <p className="mt-1 text-sm text-guildhall-muted">A restrained view of the network signal layer.</p>
                  </div>
                  <span className="font-code text-xs text-guildhall-subtle">PNS / 001</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[['Signal layer', 'Network feed'], ['Data posture', 'Source-labelled'], ['Map substrate', 'Atlas / orbital'], ['Access mode', 'Guest preview']].map(([label, value]) => (
                    <div key={label} className="rounded-xl p-4 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <p className="guildhall-label">{label}</p>
                      <p className="mt-2 font-code text-sm text-guildhall-text">{value}</p>
                    </div>
                  ))}
                </div>
                <p className="max-w-md pl-4 text-sm leading-6 text-guildhall-muted" style={{ borderLeft: '2px solid var(--guildhall-consensus)', opacity: 0.75 }}>The visual layer is decorative. The evidence lives in the structured feed below.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Network feed */}
        <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12" aria-labelledby="feed-title">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="guildhall-kicker text-guildhall-consensus">Network state feed</p>
              <h2 id="feed-title" className="mt-3 font-command text-3xl font-semibold tracking-tight sm:text-4xl">Read the signal, then inspect the source.</h2>
            </div>
            <Link href="/news" className="guildhall-text-link">Open full news hub <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <NetworkFeedTable signals={signals} status={feedStatus} onRetry={() => void loadSignals()} />
        </section>

        {/* Soft divider */}
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)' }} />
        </div>

        {/* News media grid */}
        <section className="mx-auto max-w-[1440px] px-2 sm:px-4 py-4 sm:py-6">
          <LandingMediaGrid />
        </section>

        {/* Soft divider */}
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)' }} />
        </div>

        {/* Video showcase */}
        <section className="mx-auto max-w-[1440px] px-2 sm:px-4 py-4 sm:py-6">
          <LandingVideoShowcase />
        </section>

        {/* Foundation / protocol bento */}
        <section id="architecture" className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12" aria-labelledby="foundation-title">
          <div className="mb-10 max-w-2xl">
            <p className="guildhall-kicker text-guildhall-identity">Foundation</p>
            <h2 id="foundation-title" className="mt-3 font-command text-3xl font-semibold tracking-tight sm:text-4xl">The network is built around three accountable bodies.</h2>
            <p className="mt-4 text-base leading-7 text-guildhall-muted">Each surface has a role, a state, and a clear path to inspect what sits behind the number.</p>
          </div>
          <ProtocolBento />
        </section>

        {/* Soft divider */}
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)' }} />
        </div>

        {/* Infographic */}
        <section className="mx-auto max-w-[1440px] px-2 sm:px-4 py-4 sm:py-6">
          <LandingInfographic />
        </section>

        {/* Guidance */}
        <section id="guidance" className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12" aria-labelledby="guidance-title">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="guildhall-kicker text-guildhall-treasury">Start here</p>
              <h2 id="guidance-title" className="mt-3 font-command text-3xl font-semibold tracking-tight sm:text-4xl">A clear first route for every participant.</h2>
              <div className="mt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {guidance.map(([number, title, detail, Icon]) => (
                  <div key={number} className="grid gap-4 py-6 sm:grid-cols-[3rem_1fr_auto] sm:items-start" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="font-code text-sm text-guildhall-subtle">{number}</span>
                    <div>
                      <h3 className="font-command text-xl font-semibold">{title}</h3>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-guildhall-muted">{detail}</p>
                    </div>
                    <Icon className="h-5 w-5 text-guildhall-treasury" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-6 sm:p-8 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
              <BookOpen className="h-6 w-6 text-guildhall-consensus" aria-hidden="true" />
              <p className="guildhall-kicker mt-8 text-guildhall-consensus">Reference library</p>
              <h3 className="mt-3 font-command text-2xl font-semibold">Read the mechanics, not just the promise.</h3>
              <p className="mt-3 text-sm leading-6 text-guildhall-muted">Browse the legal and technical documents that define the network's ownership, governance, and operating constraints.</p>
              <div className="mt-8 grid gap-2">
                <Link href="/lpa" className="guildhall-link-row">Limited Partnership Agreement <ArrowUpRight className="h-4 w-4" /></Link>
                <Link href="/ppm" className="guildhall-link-row">Private Placement Memorandum <ArrowUpRight className="h-4 w-4" /></Link>
                <Link href="/whitepaper" className="guildhall-link-row">Sovereign knowledge hub <ArrowUpRight className="h-4 w-4" /></Link>
                <Link href="/roadmap" className="guildhall-link-row">Network roadmap <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </div>
        </section>

        {/* Evidence posture / metrics */}
        <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12" aria-labelledby="metrics-title">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="guildhall-kicker">Evidence posture</p>
              <h2 id="metrics-title" className="mt-3 font-command text-3xl font-semibold tracking-tight">Numbers need a source.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-guildhall-muted">These values remain visible for product continuity, but are explicitly marked until their provenance is connected.</p>
          </div>
          <TruthfulMetrics />
        </section>

        {/* Release record */}
        <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12" aria-labelledby="chronicles-title">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="guildhall-kicker text-guildhall-identity">Release record</p>
              <h2 id="chronicles-title" className="mt-3 font-command text-3xl font-semibold tracking-tight">System chronicles.</h2>
              <p className="mt-4 text-base leading-7 text-guildhall-muted">A compact record of what changed and why it matters.</p>
            </div>
            <div>
              {releases.map(([version, title, detail]) => (
                <div key={version} className="grid gap-3 py-5 sm:grid-cols-[6rem_1fr]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="font-code text-xs text-guildhall-identity">{version}</span>
                  <div>
                    <h3 className="font-medium text-guildhall-text">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-guildhall-muted">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <Link href="/" className="font-command font-semibold tracking-[0.14em]">Promethean Network State</Link>
          <p className="mt-2 text-xs text-guildhall-subtle">An institutional interface for identity, assets, treasury, and governance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-guildhall-muted">
          <Link href="/privacy" className="hover:text-guildhall-text transition-colors">Privacy</Link>
          <Link href="/tos" className="hover:text-guildhall-text transition-colors">Terms</Link>
          <a href="https://linkedin.com/company/promethean-network-state" target="_blank" rel="noreferrer" className="hover:text-guildhall-text transition-colors">LinkedIn</a>
          <GuildhallThemeMenu />
        </div>
      </footer>
    </div>
  );
}
