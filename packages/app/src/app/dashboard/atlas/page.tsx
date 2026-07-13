'use client';
import { motion } from 'framer-motion';
import { 
  Map as MapIcon, 
  MapPin, 
  FileCheck, 
  Layers, 
  Zap, 
  Wind, 
  Droplet, 
  ShieldCheck, 
  Building2,
  ArrowUpRight,
  Database,
  ExternalLink,
  PlusCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@promethea/ui';
import { useSovereignData, executeSovereignMethod } from '@promethea/hooks';
import { RealityBadge } from '@promethea/components';
import Link from 'next/link';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

import { SovereignCockpit } from '@/components/SovereignCockpit';
import { SovereignMap } from '@/components/SovereignMap';
import { useHUD, defaultPOI } from '@/lib/hud-store';

export default function AtlasPage() {
  const { activePOI } = useHUD();
  const poi = activePOI || defaultPOI;

  const { data: liveAssets, refetch } = useSovereignData<any[]>('/api/assets');
  const { data: atlasLayers } = useSovereignData<any[]>('/api/atlas/layers');
  const { data: intelligence } = useSovereignData<any[]>('/intelligence');

  const { toast } = (require('@promethea/ui') as any);
  const { data: refineries } = useSovereignData<any[]>('/api/refineries');
  const { data: institutionsData } = useSovereignData<any[]>('/api/institutions');

  const assets = liveAssets || [];
  const layers = atlasLayers || [];
  const institutions = institutionsData || [];

  const handleAction = async (method: string, params: any) => {
    try {
      toast({
        title: "Metabolic Handshake Initiated",
        description: `Triggering ${method.replace(/_/g, ' ')}...`,
        variant: "default",
      });
      await executeSovereignMethod(method, params);
      await refetch();
      toast({
        title: "Synthesis Complete",
        description: `${method.replace(/_/g, ' ')} actualized.`,
        variant: "default",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Substrate Error",
        description: "The autonomous handshake failed.",
        variant: "destructive",
      });
    }
  };

  const generateMiniData = (baseline: number) => {
     return Array.from({ length: 12 }, (_, i) => ({ 
       val: Math.max(0, baseline + Math.sin(i / 1.5) * 8 + (Math.random() - 0.5) * 3) 
     }));
  };

  const cockpitTabs = [
    {
      id: 'awareness',
      label: 'Territorial Awareness',
      icon: <MapIcon className="w-3 h-3" />,
      content: (
        <div className="space-y-4">
          <div className="relative h-[500px] bg-gray-900 rounded border border-gray-800 overflow-hidden group">
            <SovereignMap layers={layers} />
            <div className="absolute top-4 left-4 p-4 bg-black/80 backdrop-blur border border-gray-800 rounded shadow-2xl z-10">
               <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Active Sovereign Viewport</span>
               <span className="text-xl font-black font-mono">3-Body Synced</span>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { label: 'Solar Potential', color: '#fbbf24', value: poi.metrics.solar },
               { label: 'Wind Yield', color: '#06b6d4', value: poi.metrics.wind },
               { label: 'Water Rights', color: '#3b82f6', value: poi.metrics.water },
               { label: 'Zoning Status', color: '#10b981', value: poi.metrics.zoning }
             ].map(m => (
                <div key={m.label} className="p-3 bg-gray-900 border border-gray-800 rounded">
                   <p className="text-[9px] text-gray-600 uppercase font-bold mb-2">{m.label}</p>
                   <div className="h-10 w-full opacity-60">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={generateMiniData(m.value)}>
                            <Area type="monotone" dataKey="val" stroke={m.color} fill={m.color} fillOpacity={0.1} strokeWidth={1.5} dot={false} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="flex justify-between items-end mt-1">
                      <p className="text-[10px] font-mono text-white uppercase font-black">
                         {m.value}% Potential
                      </p>
                      <span className="text-[8px] text-gray-600 font-mono">
                         {m.label === 'Zoning Status' ? 'Completed' : 'Raw Yield'}
                      </span>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )
    },
    {
      id: 'rwa',
      label: 'RWA Registry',
      icon: <Layers className="w-3 h-3" />,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
             <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Asset Registry</h2>
             <Link href="/dashboard/assets/new">
                <Button size="sm" className="bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-[9px] h-7 uppercase font-black">
                   <PlusCircle className="w-3 h-3 mr-1" /> Propose New Asset
                </Button>
             </Link>
          </div>
          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-900/50 border border-dashed border-gray-800 rounded-lg text-center gap-4">
               <Database className="w-8 h-8 text-gray-700" />
               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">No Sovereign Assets Claimed</p>
                  <p className="text-[10px] text-gray-600 uppercase mt-1">Initiate a Zero-to-One test by underwriting a real-world proposal.</p>
               </div>
               <Link href="/dashboard/assets/new">
                  <Button className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                     Begin Asset Underwriting
                  </Button>
               </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="p-4 bg-gray-900 border border-gray-800 rounded hover:border-amber-500/50 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <span className="text-[8px] font-bold text-gray-600 uppercase">{asset.type}</span>
                        <h3 className="text-xs font-bold uppercase truncate text-white">{asset.name}</h3>
                     </div>
                     <RealityBadge state={asset.status as any} size="sm" />
                  </div>
                  <div className="space-y-2 mb-4">
                     <div className="flex justify-between text-[9px]">
                        <span className="text-gray-500 underline decoration-gray-800 decoration-dotted">Status</span>
                        <span className="text-amber-400 font-bold uppercase">{asset.status}</span>
                     </div>
                     <div className="flex justify-between text-[9px]">
                        <span className="text-gray-500">Valuation</span>
                        <span className="text-white font-mono">${asset.value || '500,000'}</span>
                     </div>
                  </div>
                  <button 
                    onClick={() => handleAction('actualize_claim', { assetId: asset.id })}
                    className="w-full py-2 bg-gray-800 hover:bg-amber-600 text-[9px] font-black uppercase tracking-widest rounded transition-colors"
                  >
                    Actualize Claim
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'institutions',
      label: 'Institutional Mapping',
      icon: <Building2 className="w-3 h-3" />,
      content: (
        <div className="space-y-4">
           <div className="flex justify-between items-center mb-2">
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mapped Entities</h2>
              <Button size="sm" className="bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-[9px] h-7 uppercase font-black">
                 <PlusCircle className="w-3 h-3 mr-1" /> Map New Organization
              </Button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {institutions.length > 0 ? institutions.map((org, i) => (
                <div key={i} className="p-4 bg-gray-900 border border-gray-800 rounded hover:border-amber-500/50 transition-all">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                         <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest">{org.type}</span>
                         <h4 className="text-[11px] font-black uppercase text-white leading-tight">{org.name}</h4>
                      </div>
                      <RealityBadge state={org.status as any} size="sm" />
                   </div>
                   <div className="flex justify-between items-end">
                      <div>
                          <span className="text-[8px] text-gray-500 uppercase block mb-1">Reputation Stake</span>
                         <span className="text-xs font-mono text-amber-400 font-bold">{org.stake}</span>
                      </div>
                      <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-[8px] font-black uppercase tracking-widest rounded transition-all text-gray-500">
                         View Charter
                      </button>
                   </div>
                </div>
              )) : (
                <div className="p-8 border border-dashed border-gray-800 rounded flex flex-col items-center justify-center text-center opacity-40 col-span-2">
                   <Building2 className="w-6 h-6 text-gray-700 mb-2" />
                   <span className="text-[8px] uppercase font-bold text-gray-600 tracking-widest">Awaiting Institutional Entry</span>
                </div>
              )}
           </div>
        </div>
      )
    },
    {
      id: 'healing',
      label: 'Healing Protocols',
      icon: <Droplet className="w-3 h-3" />,
      content: (
        <div className="space-y-6">
           <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center">
                 <Droplet className="w-3 h-3 mr-2" /> Live Planetary Telemetry [Sovereign Hub]
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {(() => {
                    const envData = intelligence?.filter(i => i.category === 'ENVIRONMENTAL').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                    const payload = envData ? JSON.parse(envData.payload) : null;
                    
                    if (!payload) return <div className="col-span-3 py-12 text-center text-[10px] text-gray-600 uppercase font-bold tracking-widest">Awaiting First Metabolic Packet...</div>;

                    return (
                       <>
                          <div className="space-y-1">
                             <span className="text-[9px] text-gray-500 uppercase font-bold">Wind Speed</span>
                             <p className="text-2xl font-black text-white font-mono">{payload.wind_speed_10m} <span className="text-xs text-gray-600">km/h</span></p>
                          </div>
                          <div className="space-y-1">
                             <span className="text-[9px] text-gray-500 uppercase font-bold">Ambient Temp</span>
                             <p className="text-2xl font-black text-white font-mono">{payload.temperature_2m}°C</p>
                          </div>
                          <div className="space-y-1">
                             <span className="text-[9px] text-gray-500 uppercase font-bold">Solar Flux</span>
                             <p className="text-2xl font-black text-white font-mono">{payload.shortwave_radiation} <span className="text-xs text-gray-600">W/m²</span></p>
                          </div>
                       </>
                    );
                 })()}
              </div>
           </div>
           <div className="h-[200px] border border-gray-800 rounded bg-black/40 p-4 flex items-center justify-center">
              <span className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.4em]">Substrate Visualization Iteration Pending</span>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-[800px] py-6 px-4">
      <SovereignCockpit 
        title="Sovereign Atlas" 
        description="Territorial Metadata, RWA Underwriting & Environmental Protocols"
        tabs={cockpitTabs}
        stats={[
           { label: 'Active POI', value: poi.name, color: 'text-amber-400' },
           { label: 'Coordinates', value: `${poi.coordinates.lat.toFixed(4)}, ${poi.coordinates.lng.toFixed(4)}` },
           { label: 'Reference Frame', value: poi.referenceFrame },
           { label: 'Owner', value: poi.ownership?.ownerName || 'None' }
        ]}
        actions={[
           { label: 'Initialize Global Scan', action: 'trigger_atlas_scan' },
           { label: 'Sync RWA Substrate', action: 'push_asset_sync' },
           { label: 'Draft Land Claim', action: 'create_claim', params: { type: 'survey' } }
        ]}
      />
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
