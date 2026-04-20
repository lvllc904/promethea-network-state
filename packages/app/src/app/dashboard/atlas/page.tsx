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

import { SovereignCockpit } from '@/components/SovereignCockpit';

export default function AtlasPage() {
  const { data: liveAssets, refetch } = useSovereignData<any[]>('/api/assets');

  const assets = liveAssets || [];

  const handleAction = async (method: string, params: any) => {
    try {
      await executeSovereignMethod(method, params);
      await refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const cockpitTabs = [
    {
      id: 'awareness',
      label: 'Territorial Awareness',
      icon: <MapIcon className="w-3 h-3" />,
      content: (
        <div className="space-y-4">
          <div className="relative h-[400px] bg-gray-900 rounded border border-gray-800 overflow-hidden group">
            <iframe
              title="Sovereign Viewport"
              width="100%"
              height="100%"
              className="absolute inset-0 grayscale contrast-125 saturate-50 opacity-40 hover:opacity-80 transition-opacity"
              src={`https://www.google.com/maps/embed/v1/view?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&center=42.8252,-108.7513&zoom=15&maptype=satellite`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 p-4 bg-black/80 backdrop-blur border border-gray-800 rounded shadow-2xl">
               <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Active Viewport</span>
               <span className="text-xl font-black font-mono">42.8252° N, 108.7513° W</span>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             {['Solar Potential', 'Wind Yield', 'Water Rights', 'Zoning Status'].map(m => (
                <div key={m} className="p-3 bg-gray-900 border border-gray-800 rounded">
                   <p className="text-[9px] text-gray-600 uppercase font-bold">{m}</p>
                   <p className="text-sm font-mono text-white">OPTIMAL</p>
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
                <Button size="sm" className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 text-[9px] h-7 uppercase font-black">
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
                  <Button className="bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-wider">
                     Begin Asset Underwriting
                  </Button>
               </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="p-4 bg-gray-900 border border-gray-800 rounded hover:border-cyan-500/50 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <span className="text-[8px] font-bold text-gray-600 uppercase">{asset.type}</span>
                        <h3 className="text-xs font-bold uppercase truncate text-white">{asset.name}</h3>
                     </div>
                     <RealityBadge state="SIMULATED" size="sm" />
                  </div>
                  <div className="space-y-2 mb-4">
                     <div className="flex justify-between text-[9px]">
                        <span className="text-gray-500 underline decoration-gray-800 decoration-dotted">Status</span>
                        <span className="text-cyan-400 font-bold uppercase">{asset.status}</span>
                     </div>
                     <div className="flex justify-between text-[9px]">
                        <span className="text-gray-500">Valuation</span>
                        <span className="text-white font-mono">${asset.value || '500,000'}</span>
                     </div>
                  </div>
                  <button 
                    onClick={() => handleAction('actualize_claim', { assetId: asset.id })}
                    className="w-full py-2 bg-gray-800 hover:bg-cyan-600 text-[9px] font-black uppercase tracking-widest rounded transition-colors"
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
      id: 'healing',
      label: 'Healing Protocols',
      icon: <Droplet className="w-3 h-3" />,
      content: (
        <div className="p-8 text-center text-gray-600 uppercase font-bold tracking-[0.3em] opacity-40">
           [ Environmental Substrate Handshake Pending ]
        </div>
      )
    }
  ];

  return (
    <div className="h-screen py-6 px-4">
      <SovereignCockpit 
        title="Sovereign Atlas" 
        description="Territorial Metadata, RWA Underwriting & Environmental Protocols"
        tabs={cockpitTabs}
        stats={[
           { label: 'Territory Claimed', value: '1,240 AC', color: 'text-cyan-400' },
           { label: 'Fabrication Uptime', value: '98.4%' }
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
