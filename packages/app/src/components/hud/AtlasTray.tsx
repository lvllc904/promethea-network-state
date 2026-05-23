'use client';

import React, { useState, useEffect } from 'react';
import { 
    Map as MapIcon, 
    Layers, 
    Building2, 
    Droplet, 
    PlusCircle, 
    Database,
    Zap,
    Wind,
    ShieldCheck,
    Cpu,
    ArrowUpRight,
    Activity
} from 'lucide-react';
import { useHUD } from '@/lib/hud-store';

function useBFFData<T>(path: string, defaultValue: T): { data: T; refetch: () => void } {
    const [data, setData] = useState<T>(defaultValue);
    const fetchData = () => {
        fetch(path)
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d !== null) setData(d); })
            .catch(() => {});
    };
    useEffect(() => { fetchData(); }, [path]);
    return { data, refetch: fetchData };
}

export const AtlasTray = () => {
    const { activateFocusPanel } = useHUD();
    const { data: liveAssets, refetch: refetchAssets } = useBFFData<any[]>('/api/assets', []);
    const { data: refineries } = useBFFData<any[]>('/api/refineries', []);
    const { data: intelligence } = useBFFData<any[]>('/api/engine/intelligence', []);
    const { data: institutions } = useBFFData<any[]>('/api/institutions', []);
    
    const [extraAssets, setExtraAssets] = useState<any[]>([]);

    useEffect(() => {
        const handleOmniUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail && detail.type === 'AUTO_UNDERWRITE') {
                const newAsset = {
                    id: 'extra-' + Date.now(),
                    name: detail.title,
                    type: 'ENERGY_ZONE',
                    value: '1,250,000',
                    simulated: true
                };
                setExtraAssets(prev => [newAsset, ...prev]);
            }
        };
        window.addEventListener('sovereign-omni-update', handleOmniUpdate);
        return () => window.removeEventListener('sovereign-omni-update', handleOmniUpdate);
    }, []);

    const combinedAssets = [...extraAssets, ...liveAssets];

    const [activeTab, setActiveTab] = useState<'awareness' | 'rwa' | 'institutions' | 'healing'>('awareness');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleAction = async (actionId: string, params: any = {}) => {
        setIsProcessing(actionId);
        try {
            await fetch('/api/market/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: actionId, ...params })
            });
            refetchAssets();
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(null);
        }
    };

    const envData = intelligence
        ?.filter((i: any) => i.category === 'ENVIRONMENTAL')
        ?.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const envPayload = envData ? JSON.parse(envData.payload) : null;

    return (
        <div className="space-y-4 text-zinc-100">
            {/* Quick Actions Panel */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/40 border border-white/5 rounded-lg">
                <button
                    onClick={() => handleAction('initialize_scan')}
                    disabled={isProcessing !== null}
                    className="py-1 px-1 flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 rounded transition-all text-[8px] font-black uppercase text-zinc-400 hover:text-white disabled:opacity-50"
                >
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>Global Scan</span>
                </button>
                <button
                    onClick={() => handleAction('sync_substrate')}
                    disabled={isProcessing !== null}
                    className="py-1 px-1 flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 rounded transition-all text-[8px] font-black uppercase text-zinc-400 hover:text-white disabled:opacity-50"
                >
                    <Cpu className="w-3 h-3 text-emerald-400" />
                    <span>Sync Substrate</span>
                </button>
                <button
                    onClick={() => activateFocusPanel('SWEAT_CLAIM')}
                    className="py-1 px-1 flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 rounded transition-all text-[8px] font-black uppercase text-zinc-400 hover:text-white"
                >
                    <PlusCircle className="w-3 h-3 text-purple-400" />
                    <span>Land Claim</span>
                </button>
                <button
                    onClick={() => activateFocusPanel('BIOLOGICAL_POW')}
                    className="py-1 px-1 flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 rounded transition-all text-[8px] font-black uppercase text-teal-400 hover:text-teal-300"
                >
                    <Zap className="w-3 h-3 text-teal-400" />
                    <span>PoW Oracle</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex rounded-lg border border-white/10 p-0.5 bg-black/40">
                {(['awareness', 'rwa', 'institutions', 'healing'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-md transition-all ${
                            activeTab === tab ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-white'
                        }`}
                    >
                        {tab === 'awareness' ? 'Zoning' : tab === 'rwa' ? 'RWA' : tab === 'institutions' ? 'Entity' : 'Healing'}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'awareness' && (
                <div className="space-y-3">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <MapIcon className="w-3 h-3 text-cyan-400" /> Territorial Zoning
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'land-scanner', label: 'Solar Potential', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5', unit: 'MW/AC' },
                            { id: 'bio-node', label: 'Wind Yield', color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5', unit: 'm/s' },
                            { id: 'data-scraping', label: 'Water Rights', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5', unit: 'AC-FT' },
                            { id: 'real-estate-tokenization', label: 'Zoning Status', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', unit: 'CLASS-A' }
                        ].map(m => {
                            const ref = refineries?.find(r => r.methodId === m.id);
                            const profit = ref?.totalProfit || (m.id === 'land-scanner' ? 142.5 : m.id === 'bio-node' ? 98.2 : m.id === 'data-scraping' ? 320.0 : 88.0);
                            const status = ref?.totalProfit > 0 ? 'Active' : 'Standby';

                            return (
                                <div key={m.label} className={`p-2.5 ${m.bg} border ${m.border} rounded-lg space-y-1`}>
                                    <span className="text-[8px] text-zinc-500 font-bold uppercase block tracking-wider">{m.label}</span>
                                    <div className="flex justify-between items-baseline">
                                        <span className={`text-[12px] font-black font-mono ${m.color}`}>{profit.toFixed(1)}</span>
                                        <span className="text-[7px] text-zinc-600 font-mono uppercase">{m.unit}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500">
                                        <span>Status</span>
                                        <span className="uppercase font-bold text-zinc-300">{status}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-1.5">
                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Territorial Bounds</span>
                        <div className="flex justify-between items-baseline">
                            <span className="text-lg font-black font-mono text-white">1,240 AC</span>
                            <span className="text-[8px] text-emerald-400 font-mono font-bold">+12% Epoch Delta</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 w-[65%] rounded-full" />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'rwa' && (
                <div className="space-y-3">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-cyan-400" /> Real-World Assets
                    </p>

                    {combinedAssets.length === 0 ? (
                        <div className="p-8 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-center gap-2">
                            <Database className="w-6 h-6 text-zinc-700" />
                            <div>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase block">No Claims Underwritten</span>
                                <span className="text-[8px] text-zinc-600 uppercase block mt-0.5">Submit new real-world claims to docket.</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {combinedAssets.map((asset) => (
                                <div key={asset.id} className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-2 hover:border-cyan-500/20 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[7px] text-zinc-500 font-bold uppercase">{asset.type}</span>
                                            <h4 className="text-[10px] font-black uppercase text-white truncate max-w-[200px]">{asset.name}</h4>
                                        </div>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase font-mono ${
                                            asset.status === 'ACTUALIZED' || asset.status === 'ACTIVE' 
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                        }`}>
                                            {asset.status || 'SIMULATED'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-mono">
                                        <span className="text-zinc-500">Valuation:</span>
                                        <span className="text-zinc-300 font-bold">${asset.value || '500,000'}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleAction('actualize_claim', { assetId: asset.id })}
                                        disabled={isProcessing !== null}
                                        className="w-full py-1.5 bg-zinc-900 hover:bg-cyan-600 hover:text-black text-[8px] font-black uppercase tracking-widest rounded transition-all text-zinc-400 disabled:opacity-50"
                                    >
                                        {isProcessing === 'actualize_claim' ? 'Syncing...' : 'Actualize Claim'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'institutions' && (
                <div className="space-y-3">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-cyan-400" /> Institutional Mappings
                    </p>

                    {institutions && institutions.length > 0 ? institutions.map((org: any, idx: number) => (
                        <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[7px] text-zinc-600 font-bold uppercase">{org.type || 'ORG'}</span>
                                    <h4 className="text-[10px] font-black uppercase text-zinc-200 leading-tight">{org.name}</h4>
                                </div>
                                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase font-mono ${
                                    org.status === 'ACTUALIZED' || org.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>{org.status || 'STAKED'}</span>
                            </div>
                            <div className="flex justify-between items-end text-[8px]">
                                <div>
                                    <span className="text-zinc-500 block">Reputation Stake</span>
                                    <span className="font-mono text-emerald-400 font-bold">{org.stake || '0 UVT'}</span>
                                </div>
                                <button className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded text-[7px] font-black uppercase tracking-wider transition-colors">
                                    Charter
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="p-4 text-center text-zinc-500 text-[9px] uppercase tracking-widest border border-white/5 border-dashed rounded">
                            No Mapped Entities Found
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'healing' && (
                <div className="space-y-3">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Droplet className="w-3 h-3 text-cyan-400" /> Planetary Telemetry
                    </p>

                    {envPayload ? (
                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 bg-black/40 border border-white/5 rounded-lg text-center space-y-1">
                                <Wind className="w-3.5 h-3.5 text-zinc-500 mx-auto" />
                                <span className="text-[7px] text-zinc-500 uppercase font-bold block">Wind</span>
                                <span className="text-xs font-black font-mono text-white block">{envPayload.wind_speed_10m} <span className="text-[7px] text-zinc-600">km/h</span></span>
                            </div>
                            <div className="p-2 bg-black/40 border border-white/5 rounded-lg text-center space-y-1">
                                <Zap className="w-3.5 h-3.5 text-zinc-500 mx-auto" />
                                <span className="text-[7px] text-zinc-500 uppercase font-bold block">Temp</span>
                                <span className="text-xs font-black font-mono text-white block">{envPayload.temperature_2m}°C</span>
                            </div>
                            <div className="p-2 bg-black/40 border border-white/5 rounded-lg text-center space-y-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 mx-auto" />
                                <span className="text-[7px] text-zinc-500 uppercase font-bold block">Solar</span>
                                <span className="text-xs font-black font-mono text-white block">{envPayload.shortwave_radiation} <span className="text-[7px] text-zinc-600">W/m²</span></span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-[9px] text-zinc-600 uppercase font-bold tracking-widest">
                            Awaiting Telemetry Packet...
                        </div>
                    )}

                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-1.5">
                        <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider block">Carbon Sequestration Node</span>
                        <div className="flex justify-between items-baseline font-mono">
                            <span className="text-zinc-200 text-xs font-bold">428.4 PPM</span>
                            <span className="text-[7px] text-emerald-500">-0.2% Daily Shift</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
