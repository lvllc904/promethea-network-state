'use client';

import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, ShieldCheck, ExternalLink, Plus, ArrowDownCircle, ShieldAlert, Orbit, ChevronDown, ChevronRight, Building2, FileText, Landmark, Users } from 'lucide-react';
import { useHUD } from '@/lib/hud-store';
import { getCelestialById } from '@/lib/celestial-data';
import { AssetListingModal } from './AssetListingModal';
import { LaborValueMatrixCard } from './LaborValueMatrixCard';

// ─── Mini Delaware Series drill-down rendered per-asset ───────────────────────
function AssetDrilldown({ assetId, assetName }: { assetId: string; assetName: string }) {
    const seriesData = [
        { label: 'Series LLC Formation', status: 'Filed', icon: Building2, color: 'text-emerald-400' },
        { label: 'UCC-1 Financing Statement', status: 'Active', icon: FileText, color: 'text-emerald-400' },
        { label: 'Operating Agreement', status: 'Signed', icon: Landmark, color: 'text-sky-400' },
        { label: 'Membership Ledger', status: '3 Members', icon: Users, color: 'text-amber-400' },
    ];

    return (
        <div className="mt-2 rounded-lg overflow-hidden border border-white/[0.04] bg-black/30">
            <div className="px-2 py-1.5 border-b border-white/[0.04] flex items-center gap-1.5">
                <Building2 className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                <span className="text-[7px] font-bold uppercase tracking-[0.15em] text-sky-400 font-label">Delaware Series Structure</span>
            </div>
            <div className="p-1.5 space-y-1">
                {seriesData.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="flex items-center justify-between px-1.5 py-1 rounded bg-white/[0.02]">
                            <div className="flex items-center gap-1.5">
                                <Icon className={`w-2.5 h-2.5 shrink-0 ${item.color}`} />
                                <span className="text-[7px] text-zinc-400 font-data">{item.label}</span>
                            </div>
                            <span className={`text-[7px] font-bold font-data ${item.color}`}>{item.status}</span>
                        </div>
                    );
                })}
            </div>
            <div className="px-2 pb-2 pt-1">
                <button className="w-full py-1 text-[7px] font-bold tracking-[0.12em] text-sky-400 border border-sky-400/20 hover:border-sky-400/50 hover:bg-sky-400/5 rounded transition-all font-data">
                    VIEW COMPLIANCE DOCS
                </button>
            </div>
        </div>
    );
}

// ─── Financials sub-section with interactive sparklines ───────────────────────
function FinancialsTab() {
    const [activeMetric, setActiveMetric] = useState<string | null>(null);

    const incomeRows = [
        { label: 'Operating Revenue', value: '$2.1M', change: '+8.2%', pos: true },
        { label: 'Net FCF', value: '$380K', change: '+14.2%', pos: true },
        { label: 'EBITDA Margin', value: '18.1%', change: '+2.3%', pos: true },
        { label: 'Sovereign Eco-Tax', value: '-$42K', change: 'τ degradation', pos: false },
    ];

    const waterfallTiers = [
        { tier: 'T1', label: 'Eco-Tax Reserve', pct: 8, color: 'bg-amber-500' },
        { tier: 'T2', label: 'Infrastructure', pct: 20, color: 'bg-sky-500' },
        { tier: 'T3', label: 'Sovereignty Pool', pct: 23, color: 'bg-emerald-500' },
        { tier: 'T4', label: 'Global Yield', pct: 49, color: 'bg-violet-500' },
    ];

    return (
        <div className="space-y-2 font-data">
            {/* Income Statement */}
            <div className="bg-white/[0.02] rounded-lg border border-white/[0.04] overflow-hidden">
                <div className="px-2.5 py-1.5 border-b border-white/[0.04] text-[7px] font-bold text-zinc-400 uppercase tracking-widest">
                    Income Statement
                </div>
                <div className="p-1.5 space-y-0.5">
                    {incomeRows.map((row, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveMetric(activeMetric === row.label ? null : row.label)}
                            className={`w-full flex items-center justify-between px-1.5 py-1.5 rounded transition-all text-left ${activeMetric === row.label ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'}`}
                        >
                            <span className="text-[8px] text-zinc-400">{row.label}</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-[7px] ${row.pos ? 'text-emerald-400' : 'text-amber-400'}`}>{row.change}</span>
                                <span className="text-[8px] text-zinc-200 font-semibold">{row.value}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Metabolic Waterfall */}
            <div className="bg-white/[0.02] rounded-lg border border-white/[0.04] overflow-hidden">
                <div className="px-2.5 py-1.5 border-b border-white/[0.04] text-[7px] font-bold text-zinc-400 uppercase tracking-widest">
                    Metabolic Waterfall Distribution
                </div>
                <div className="p-2.5 space-y-2">
                    {waterfallTiers.map((t, i) => (
                        <div key={i}>
                            <div className="flex items-center justify-between text-[7px] mb-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-zinc-500 font-bold">{t.tier}</span>
                                    <span className="text-zinc-400">{t.label}</span>
                                </div>
                                <span className="text-zinc-300 font-bold">{t.pct}%</span>
                            </div>
                            <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                                <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Cap Table ($PEACE & $YIELD) ────────────────── */}
            <div className="bg-white/[0.02] rounded-lg border border-white/[0.04] overflow-hidden">
                <div className="px-2.5 py-1.5 border-b border-white/[0.04] text-[7px] font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                    <span>Cap Table — Dual-Token Structure</span>
                    <span className="text-[6px] text-zinc-600 font-normal">Reg D 506(c)</span>
                </div>
                <div className="p-2 space-y-1.5">
                    {/* $PEACE — Soulbound Voting */}
                    <div className="bg-sky-500/5 border border-sky-500/15 rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] font-bold text-sky-400 font-mono">$PEACE</span>
                            <span className="text-[7px] text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded font-mono">Soulbound · Non-Transferable</span>
                        </div>
                        <div className="flex items-center justify-between text-[7px] text-zinc-400">
                            <span>51% Voting Power</span>
                            <span className="text-sky-400 font-bold">1,000,000 tokens</span>
                        </div>
                        <div className="mt-1.5 h-1 bg-sky-500/10 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 rounded-full" style={{ width: '51%' }} />
                        </div>
                    </div>
                    {/* $YIELD — Economic Equity */}
                    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] font-bold text-emerald-400 font-mono">$YIELD</span>
                            <span className="text-[7px] text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">Reg D 506(c) · Transferable</span>
                        </div>
                        <div className="flex items-center justify-between text-[7px] text-zinc-400">
                            <span>49% Economic Equity</span>
                            <span className="text-emerald-400 font-bold">960,000 tokens</span>
                        </div>
                        <div className="mt-1.5 h-1 bg-emerald-500/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '49%' }} />
                        </div>
                    </div>
                    <div className="text-[6px] text-zinc-600 text-center pt-0.5">
                        Rev Proc 93-27 Profits Interest Safe Harbor · DRULPA § 17-218
                    </div>
                </div>
            </div>

            {/* ── Capital Call & Wire Tracker ───────────────── */}
            <div className="bg-white/[0.02] rounded-lg border border-white/[0.04] overflow-hidden">
                <div className="px-2.5 py-1.5 border-b border-white/[0.04] text-[7px] font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                    <span>Capital Call & Wire Tracker</span>
                    <span className="text-amber-400 text-[7px] font-mono">Series 01 Active</span>
                </div>
                <div className="p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-[7px] mb-0.5">
                        <span className="text-zinc-400">Funding Progress</span>
                        <span className="text-amber-400 font-bold font-mono">40% Funded</span>
                    </div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: '40%' }} />
                    </div>
                    <div className="text-[7px] text-zinc-500 flex justify-between">
                        <span>$800K raised</span><span>$2M target</span>
                    </div>
                    {/* Wire Reconciliation Matrix */}
                    <div className="mt-2 space-y-1">
                        {[
                            { step: 'LP Subscription Signed', status: '✓ Complete', color: 'text-emerald-400' },
                            { step: 'Active LP Clearance', status: '✓ Complete', color: 'text-emerald-400' },
                            { step: 'Wire Receipt Confirmed', status: '⏳ Pending', color: 'text-amber-400' },
                            { step: 'Capital Deployed to SPV', status: '—  Waiting', color: 'text-zinc-500' },
                        ].map((row, i) => (
                            <div key={i} className="flex items-center justify-between px-1.5 py-1 rounded bg-white/[0.02] text-[7px]">
                                <span className="text-zinc-400">{row.step}</span>
                                <span className={`font-bold font-mono ${row.color}`}>{row.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Sovereign Buyout Trigger Gauge ────────────── */}
            <div className="bg-white/[0.02] rounded-lg border border-white/[0.04] overflow-hidden">
                <div className="px-2.5 py-1.5 border-b border-white/[0.04] text-[7px] font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                    <span>Sovereign Buyout Trigger Gauge</span>
                    <span className="text-violet-400 text-[7px] font-mono">δ = 25% Discount</span>
                </div>
                <div className="p-2.5 space-y-2">
                    {/* EBITDA Gauge */}
                    <div>
                        <div className="flex items-center justify-between text-[7px] mb-1">
                            <span className="text-zinc-400">EBITDA Performance</span>
                            <span className="text-emerald-400 font-bold font-mono">18.1%</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: '72%' }} />
                        </div>
                        <div className="text-[6px] text-zinc-600 mt-0.5 flex justify-between">
                            <span>0%</span><span className="text-amber-500">Target: 25%</span>
                        </div>
                    </div>
                    {/* FCF Margin Gauge */}
                    <div>
                        <div className="flex items-center justify-between text-[7px] mb-1">
                            <span className="text-zinc-400">FCF Margin</span>
                            <span className="text-sky-400 font-bold font-mono">14.2%</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full" style={{ width: '57%' }} />
                        </div>
                        <div className="text-[6px] text-zinc-600 mt-0.5 flex justify-between">
                            <span>0%</span><span className="text-sky-500">Range: 12–18%</span>
                        </div>
                    </div>
                    {/* Buyout Formula */}
                    <div className="mt-1 p-2 rounded bg-violet-500/5 border border-violet-500/15 text-center">
                        <div className="text-[8px] font-mono text-violet-300">Buyout Price = NAV × (1 − δ)</div>
                        <div className="text-[7px] text-zinc-400 mt-0.5">δ = 25% Sovereign Network Discount</div>
                        <div className="text-[8px] font-bold text-violet-400 mt-1 font-mono">
                            Trigger: ≥ $3.2M EBITDA · FCF ≥ 12%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// ─── Main HoldingsPanel ────────────────────────────────────────────────────────
export function HoldingsPanel() {
    const {
        treasury, assets, mapMode, celestialMesh,
        selectedCelestialId, interstellarTransitioning,
        setHUDState, cockpitHoldingsTab, cockpitDrilldownAssetId
    } = useHUD();

    const selectedPlanet = selectedCelestialId ? getCelestialById(selectedCelestialId) ?? null : null;
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'PORTFOLIO' | 'SWEAT' | 'FINANCIALS'>('PORTFOLIO');
    const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

    // Sync with HUD-driven tab routing from CommandCenter nav chips
    useEffect(() => {
        if (cockpitHoldingsTab) {
            setActiveTab(cockpitHoldingsTab);
            setHUDState({ cockpitHoldingsTab: null }); // consume the intent
        }
    }, [cockpitHoldingsTab]);

    // Sync deep-link to expand a specific asset
    useEffect(() => {
        if (cockpitDrilldownAssetId) {
            setActiveTab('PORTFOLIO');
            setExpandedAssetId(cockpitDrilldownAssetId);
            setHUDState({ cockpitDrilldownAssetId: null });
        }
    }, [cockpitDrilldownAssetId]);

    const rwaValue = assets.reduce((sum, asset) => sum + asset.valuationUSDC, 0);
    const totalEquiv = treasury.balanceUSDC + (treasury.balanceUVT * 1) + rwaValue;

    const [stats, setStats] = useState({ change24h: 2.41, mvsIndex: 0.894, nodesOnline: 3, entropy: 14.2, netYield: 14.20 });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                entropy: parseFloat((prev.entropy + (Math.random() - 0.5) * 0.05).toFixed(2)),
                mvsIndex: parseFloat((prev.mvsIndex + (Math.random() - 0.5) * 0.001).toFixed(4))
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const tabStyle = (t: string) =>
        `flex-1 py-1 rounded text-center text-[7px] transition-all ${activeTab === t ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'}`;

    return (
        <>
            <div className="w-64 h-[calc(100vh-7.5rem)] flex flex-col gap-2 z-40 relative pointer-events-auto overflow-y-auto custom-scrollbar">

                {/* INTERSTELLAR CONTROLS MODULE */}
                {mapMode === 'INTERSTELLAR' && (
                    <div className="bg-[#090d16]/90 backdrop-blur-2xl rounded-xl p-2.5 flex flex-col shrink-0 border border-white/[0.08]" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center justify-between pb-1.5 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="flex items-center gap-1.5">
                                <Orbit className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-400 font-label">Orbital Controls</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/[0.015] mb-1.5" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-semibold text-zinc-200 font-label">Celestial Overlay</span>
                                <span className="text-[7px] text-zinc-500 font-data">COSMOS & DESI Deep Field</span>
                            </div>
                            <button
                                onClick={() => {
                                    const nextVal = !celestialMesh;
                                    setHUDState({ celestialMesh: nextVal });
                                    if (!nextVal) setHUDState({ selectedDeepFieldBody: null });
                                }}
                                className={`px-2 py-0.5 text-[7px] font-bold uppercase tracking-widest rounded transition-all cursor-pointer font-data ${
                                    celestialMesh
                                        ? 'bg-amber-500/20 border border-amber-400 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                        : 'bg-zinc-950/40 border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                                }`}
                            >
                                {celestialMesh ? 'Active' : 'Off'}
                            </button>
                        </div>

                        {selectedPlanet && (
                            selectedPlanet.details.nodesActive > 0 ? (
                                <button
                                    onClick={() => setHUDState({ interstellarTransitioning: selectedPlanet.id })}
                                    disabled={interstellarTransitioning !== null}
                                    className="w-full py-1.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-data text-[8px] font-bold tracking-[0.14em] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <ArrowDownCircle className="w-3 h-3 animate-bounce" />
                                    INITIATE SURFACE DESCENT
                                </button>
                            ) : (
                                <div className="flex items-start gap-1.5 p-1.5 rounded-lg bg-amber-950/10 border border-amber-500/15">
                                    <ShieldAlert className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[7px] font-bold text-amber-400 uppercase tracking-wider font-data">Descent Restrained</span>
                                        <span className="text-[6px] text-zinc-400 leading-normal font-data">No active mesh on this body.</span>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* TREASURY SUMMARY MODULE */}
                <div className="bg-[#090d16]/90 backdrop-blur-2xl rounded-xl p-2.5 flex flex-col shrink-0 border border-white/[0.08]" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-1.5 pb-1.5 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <Coins className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-400 font-label">Sovereign Treasury</span>
                    </div>

                    <div className="bg-white/[0.02] p-2.5 rounded-lg mb-2 relative overflow-hidden" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl -mr-4 -mt-4" />
                        <p className="text-[7px] text-zinc-500 uppercase tracking-[0.16em] mb-1 font-label">Total Assets (USD Equiv.)</p>
                        <div className="text-xl font-light text-white tracking-tight font-command">
                            ${totalEquiv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center gap-1 mt-1 font-data">
                            <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                            <span className="text-[8px] text-emerald-400">+{stats.change24h}% THIS CYCLE</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 font-data text-[8px]">
                        <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                            <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">Liquid USDC</span>
                            <span className="text-zinc-200 font-semibold">${treasury.balanceUSDC.toLocaleString()}</span>
                        </div>
                        <div className="bg-white/[0.01] p-1.5 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                            <span className="text-zinc-500 block mb-0.5 uppercase tracking-wider text-[7px]">RWA Value</span>
                            <span className="text-emerald-400 font-semibold">${rwaValue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* PORTFOLIO / SWEAT / FINANCIALS TABS */}
                <div className="flex-1 bg-[#090d16]/90 backdrop-blur-2xl rounded-xl p-2.5 flex flex-col overflow-hidden border border-white/[0.08]" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.06)' }}>
                    {/* Tab Bar */}
                    <div className="flex bg-white/5 p-0.5 rounded-lg mb-2 shrink-0">
                        <button onClick={() => setActiveTab('PORTFOLIO')} className={tabStyle('PORTFOLIO')}>PORTFOLIO</button>
                        <button onClick={() => setActiveTab('SWEAT')} className={tabStyle('SWEAT')}>SWEAT EQ</button>
                        <button onClick={() => setActiveTab('FINANCIALS')} className={tabStyle('FINANCIALS')}>FINANCIALS</button>
                    </div>

                    {/* Scrollable Tab Content */}
                    <div className="flex-1 overflow-y-auto pr-0.5 custom-scrollbar">

                        {/* ── PORTFOLIO TAB ─────────────────────── */}
                        {activeTab === 'PORTFOLIO' && (
                            <div className="space-y-1.5 font-data">
                                <div className="flex justify-between items-center text-[7px] text-zinc-500 uppercase tracking-wider mb-1.5 font-semibold">
                                    <span>RWA Portfolio ({assets.length})</span>
                                    <span>${rwaValue.toLocaleString()}</span>
                                </div>

                                {assets.map((asset) => {
                                    const isExpanded = expandedAssetId === asset.id;
                                    return (
                                        <div key={asset.id} className="rounded-lg overflow-hidden" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)' }}>
                                            {/* Asset Row — clickable to expand drill-down */}
                                            <button
                                                onClick={() => setExpandedAssetId(isExpanded ? null : asset.id)}
                                                className="w-full flex items-start justify-between p-2 text-left bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                                            >
                                                <div className="flex-1 pr-2">
                                                    <div className="text-[9px] text-zinc-200 font-semibold truncate">{asset.name}</div>
                                                    <div className="flex gap-2 mt-0.5 text-[7px] text-zinc-500 uppercase tracking-widest">
                                                        <span>{asset.ownership}</span>
                                                        <span>{asset.pricingMode.replace('_', ' ')}</span>
                                                        {asset.isUCC1Filed && <span className="text-emerald-400">UCC-1 ✓</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-[9px] text-emerald-400 font-bold">${asset.valuationUSDC.toLocaleString()}</span>
                                                    {isExpanded
                                                        ? <ChevronDown className="w-3 h-3 text-zinc-500" />
                                                        : <ChevronRight className="w-3 h-3 text-zinc-500" />
                                                    }
                                                </div>
                                            </button>

                                            {/* Delaware Series Drill-down */}
                                            {isExpanded && (
                                                <AssetDrilldown assetId={asset.id} assetName={asset.name} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── SWEAT EQUITY TAB ──────────────────── */}
                        {activeTab === 'SWEAT' && (
                            <div className="rounded-lg overflow-hidden">
                                <LaborValueMatrixCard />
                            </div>
                        )}

                        {/* ── FINANCIALS TAB ────────────────────── */}
                        {activeTab === 'FINANCIALS' && <FinancialsTab />}
                    </div>

                    {/* Pinned ONBOARD CTA — always visible at bottom of tab panel */}
                    <div className="shrink-0 pt-2 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <button
                            onClick={() => setShowOnboardModal(true)}
                            className="w-full py-1.5 mb-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-data text-[8px] font-bold tracking-[0.14em] rounded-lg transition-all flex items-center justify-center gap-1"
                        >
                            ONBOARD NEW ASSET <Plus className="w-2.5 h-2.5" />
                        </button>
                        <div className="flex items-center justify-between font-data text-[7px] text-zinc-500">
                            <span className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> UCC-1 Engine</span>
                            <a href="/dashboard/treasury" className="flex items-center gap-0.5 hover:text-zinc-300 transition-colors">
                                AUDIT LEDGER <ExternalLink className="w-2 h-2" />
                            </a>
                            <span className="text-emerald-400 flex items-center gap-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping inline-block" /> ONLINE
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {showOnboardModal && <AssetListingModal onClose={() => setShowOnboardModal(false)} />}
        </>
    );
}
