'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, ShieldCheck, Activity, Server, Cpu, Database, RefreshCw } from 'lucide-react';
import { SovereignPulseChart } from '@/components/SovereignPulseChart';

// Generate realistic telemetry sparklines
const generateTelemetry = (base: number, volatility: number, count = 60, spikeIdx?: number) => {
    let current = base;
    const now = Math.floor(Date.now() / 1000);
    return Array.from({ length: count }, (_, i) => {
        current = base + (Math.random() - 0.5) * volatility;
        if (spikeIdx && i === spikeIdx) current += volatility * 3;
        return { time: (now - (count - i) * 60) as any, value: Math.max(0, current) };
    });
};

import { useHUD } from '@/lib/hud-store';

export const PulseTray = () => {
    const { activateFocusPanel } = useHUD();
    const [pulse, setPulse] = useState<any>(null);
    const [substrate, setSubstrate] = useState<any>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [activeSection, setActiveSection] = useState<'security' | 'substrate'>('security');

    const fetchPulse = useCallback(async () => {
        try {
            const r = await fetch('/api/security_telemetry/pulse', { cache: 'no-store' });
            if (r.ok) { const d = await r.json(); setPulse(d); }
        } catch (_) {}
    }, []);

    const fetchSubstrate = useCallback(async () => {
        try {
            const r = await fetch('/api/security_telemetry/pulse', { cache: 'no-store' });
            if (r.ok) { const d = await r.json(); setSubstrate(d); }
        } catch (_) {}
    }, []);

    useEffect(() => {
        fetchPulse();
        fetchSubstrate();
    }, [fetchPulse, fetchSubstrate]);

    const refetch = fetchPulse;

    const velocityData = generateTelemetry(45, 15, 60, 45);
    const immuneData = generateTelemetry(10, 5, 60, 45).map(d => ({ ...d, value: d.value * 2 }));

    const quarantinedIPs = pulse?.quarantinedIPs ?? ['192.168.1.14', '192.168.1.28', '192.168.1.42'];
    const defenseLevel = pulse?.defenseLevel ?? 4;
    const immuneIntegrity = pulse?.immuneIntegrity ?? 94;

    const substrateNodes = substrate?.nodes ?? [
        { label: 'Economic Engine', status: 'NOMINAL', load: 23, icon: 'cpu' },
        { label: 'AI Service', status: 'NOMINAL', load: 67, icon: 'brain' },
        { label: 'Guardian Module', status: 'NOMINAL', load: 12, icon: 'shield' },
        { label: 'Omni-Lake DB', status: 'NOMINAL', load: 45, icon: 'database' },
    ];

    const handleScan = async () => {
        setIsScanning(true);
        try {
            await fetchPulse();
            await fetchSubstrate();
        } catch (e) {
            console.error(e);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Section Switcher */}
            <div className="flex rounded-lg border border-white/10 p-0.5 bg-black/40">
                <button
                    onClick={() => setActiveSection('security')}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${activeSection === 'security' ? 'bg-red-500/20 text-red-400' : 'text-zinc-500 hover:text-white'}`}
                >
                    Security Radar
                </button>
                <button
                    onClick={() => setActiveSection('substrate')}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${activeSection === 'substrate' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-white'}`}
                >
                    Substrate Health
                </button>
            </div>

            {activeSection === 'security' && (
                <>
                    {/* NOC Telemetry Chart */}
                    <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Activity className="w-3 h-3 text-red-500" /> NOC Telemetry Stream
                        </p>
                        <div className="rounded-lg border border-white/5 overflow-hidden">
                            <SovereignPulseChart velocityData={velocityData} immuneData={immuneData} />
                        </div>
                    </div>

                    {/* Defense Status */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-black/40 border border-white/5 rounded-lg">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Defense Level</p>
                            <p className="text-2xl font-black font-mono text-red-400">{defenseLevel}</p>
                        </div>
                        <div className="p-3 bg-black/40 border border-white/5 rounded-lg">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Immune Integrity</p>
                            <p className="text-2xl font-black font-mono text-amber-400">{immuneIntegrity}%</p>
                        </div>
                    </div>

                    {/* IP Quarantine Log */}
                    <div className="space-y-2">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <ShieldAlert className="w-3 h-3 text-red-500" /> IP Quarantine Log
                        </p>
                        <div className="space-y-1.5">
                            {quarantinedIPs.map((ip: string) => (
                                <div key={ip} className="flex justify-between items-center px-3 py-2 bg-black/40 border border-red-500/10 rounded">
                                    <span className="text-[10px] font-mono text-zinc-400">{ip}</span>
                                    <span className="text-[9px] font-bold text-red-500 uppercase">Blocked</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Integrity Scan Button */}
                    <button
                        onClick={handleScan}
                        disabled={isScanning}
                        className="w-full py-2.5 flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 rounded-lg transition-all disabled:opacity-50 group"
                    >
                        <ShieldCheck className={`w-3 h-3 text-amber-400 ${isScanning ? 'animate-spin' : ''}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                            {isScanning ? 'Scanning Substrate...' : 'Run Integrity Scan'}
                        </span>
                    </button>
                </>
            )}

            {activeSection === 'substrate' && (
                <>
                    {/* Substrate KPIs */}
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Metabolic Velocity', val: `${pulse?.metabolicVelocity ?? 41} ops/s`, color: 'text-amber-400' },
                            { label: 'Substrate Load', val: `${((pulse?.substrateLoad ?? 0.23) * 100).toFixed(1)}%`, color: 'text-amber-400' },
                            { label: 'Sync Deficit', val: `${pulse?.mirrorSyncDeficit ?? 0}ms`, color: 'text-blue-400' },
                            { label: 'Sovereign Uptime', val: `${((pulse?.uptime ?? 86400) / 3600).toFixed(1)}h`, color: 'text-purple-400' },
                        ].map(v => (
                            <div 
                                key={v.label} 
                                onClick={() => activateFocusPanel('SQL_EXPLORER')}
                                className="p-3 bg-black/40 border border-white/5 rounded-lg hover:border-amber-500/20 cursor-pointer transition-colors"
                            >
                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">{v.label}</p>
                                <p className={`text-lg font-black font-mono ${v.color}`}>{v.val}</p>
                            </div>
                        ))}
                    </div>

                    {/* Service Nodes */}
                    <div className="space-y-2">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <Server className="w-3 h-3" /> Service Nodes
                        </p>
                        {substrateNodes.map((node: any) => (
                            <div 
                                key={node.label} 
                                onClick={() => activateFocusPanel('SQL_EXPLORER')}
                                className="flex items-center justify-between px-3 py-2.5 bg-black/40 border border-white/5 rounded-lg group hover:border-amber-500/20 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'NOMINAL' ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />
                                    <span className="text-[10px] font-mono text-zinc-300">{node.label}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${node.load > 80 ? 'bg-red-500' : node.load > 60 ? 'bg-amber-500' : 'bg-amber-500'}`}
                                            style={{ width: `${node.load}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] font-mono text-zinc-500 w-6 text-right">{node.load}%</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={() => refetch()}
                        className="w-full py-2.5 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all"
                    >
                        <RefreshCw className="w-3 h-3 text-zinc-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Re-sync Substrate</span>
                    </button>
                </>
            )}
        </div>
    );
};
