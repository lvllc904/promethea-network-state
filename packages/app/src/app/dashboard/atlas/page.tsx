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
  LayoutGrid,
  ArrowUpRight,
  Database,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@promethea/ui';

export default function AtlasPage() {
  const assets = [
    { 
      id: 'wy-node-001', 
      name: 'Wyoming Data Hub (Claim 44092-W)', 
      location: '42.8252, -108.7513', 
      status: 'Claim Staked', 
      type: 'Data/Fabrication', 
      feasibility: '0.93',
      funding: '$500,000 (EPA-MARC-24)',
      metrics: { solar: 'Optimal', wind: 'High', water: 'Unrestricted' }
    },
    { 
      id: 'ny-mfg-012', 
      name: 'Rochester Fabrication Cell', 
      location: '43.1566, -77.6088', 
      status: 'Active', 
      type: 'Manufacturing', 
      feasibility: '1.0',
      funding: 'Self-Funded',
      metrics: { solar: 'N/A', wind: 'N/A', electricity: 'Grid-Connected' }
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      {/* Co-Star Style Top Bar */}
      <div className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tighter text-white font-mono uppercase flex items-center gap-3">
             <MapIcon className="h-8 w-8 text-cyan-400" /> Sovereign Atlas
          </h1>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Territorial Metadata & Asset Underwriting</span>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="ghost" className="text-xs text-gray-500 font-bold tracking-widest uppercase border border-white/5 hover:border-cyan-500/50"><LayoutGrid className="h-4 w-4 mr-2" /> Grid View</Button>
           <Button className="text-xs bg-cyan-600 hover:bg-cyan-500 font-bold tracking-widest uppercase py-6 px-8 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.3)]">+ New Claim</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Section: Map & Prospect Discovery (Co-Star Format) */}
        <div className="col-span-1 md:col-span-8 space-y-6">
           <Card className="bg-[#050510]/80 border-white/5 backdrop-blur-3xl overflow-hidden min-h-[500px] relative">
              <div className="absolute inset-0 bg-map-placeholder bg-cover bg-center opacity-30 grayscale saturate-0 pointer-events-none" />
              {/* Symbolic Map Representation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="relative">
                    <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
                    <MapPin className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                 </div>
              </div>
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                 <div className="bg-[#020208]/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl">
                    <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2 block">Active Viewport</span>
                    <span className="text-lg font-black font-mono text-white">42.8252° N, 108.7513° W</span>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[10px] bg-green-400/10 text-green-400 px-2 py-0.5 rounded border border-green-400/20 uppercase font-bold tracking-widest">Sovereign Vacancy</span>
                       <span className="text-[10px] text-gray-500 font-mono tracking-tighter">Lander, Wyoming</span>
                    </div>
                 </div>
              </div>
              <div className="absolute bottom-6 right-6 flex items-center gap-3">
                 <Button variant="ghost" className="bg-[#020208]/80 backdrop-blur-xl border border-white/5 h-12 w-12 text-gray-400 hover:text-white"><Layers className="h-6 w-6" /></Button>
                 <Button variant="ghost" className="bg-[#020208]/80 backdrop-blur-xl border border-white/5 h-12 w-12 text-gray-400 hover:text-white"><Database className="h-6 w-6" /></Button>
              </div>
           </Card>

           {/* Underwriting Card (The High-Density Data) */}
           <Card className="bg-[#050510]/80 border-white/5 backdrop-blur-3xl p-8">
              <div className="flex flex-row items-start justify-between border-b border-white/5 pb-8 mb-8">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Detailed Underwriting for Claim:</span>
                    <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tighter">1364 Squaw Creek Rd / BLM-44092-W</h2>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase flex items-center gap-2 border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 rounded"><ShieldCheck className="h-3 w-3" /> Claim Verified via IPFS CID QmWYf...</span>
                       <span className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">Pillar of the Atlas</span>
                    </div>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Metabolic Feasibility</span>
                    <span className="text-4xl font-black font-mono text-cyan-400">93%</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest flex items-center gap-2"><Zap className="h-3 w-3 text-yellow-400" /> Energy Potential</span>
                       <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                          <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><Zap className="h-4 w-4" /> Solar (Peak UV)</span>
                          <span className="text-xs font-black font-mono text-white">OPTIMAL</span>
                       </div>
                       <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><Wind className="h-4 w-4" /> Wind (Avg Yield)</span>
                          <span className="text-xs font-black font-mono text-white">HIGH</span>
                       </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest flex items-center gap-2"><Droplet className="h-3 w-3 text-blue-400" /> Resources</span>
                       <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><Droplet className="h-4 w-4" /> Water Rights</span>
                          <span className="text-xs font-black font-mono text-white">UNRESTRICTED</span>
                       </div>
                    </div>
                 </div>

                 <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest flex items-center gap-2"><FileCheck className="h-3 w-3 text-green-400" /> Sovereign Funding & Zoning</span>
                       <div className="bg-white/5 p-6 rounded-2xl space-y-4 border border-white/5">
                          <div className="flex justify-between items-center">
                             <div className="flex flex-col">
                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Primary Funding Engine</span>
                                <span className="text-sm font-bold text-white font-mono uppercase tracking-tight">EPA Brownfield Restoration Grant (MARC)</span>
                             </div>
                             <span className="text-lg font-black font-mono text-green-400">$500,000</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                             <div className="flex flex-col">
                                <span className="text-[8px] text-gray-500 uppercase tracking-widest">Zoning Category</span>
                                <span className="text-xs font-bold text-white uppercase tracking-widest">Industrial / Reclamation</span>
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[8px] text-gray-500 uppercase tracking-widest">Filing Status</span>
                                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Awaiting Actualization</span>
                             </div>
                          </div>
                       </div>
                       <Button className="w-full bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 mt-4 font-mono font-bold py-6">Actualize Claim (Sign Filing)</Button>
                    </div>
                 </div>
              </div>
           </Card>
        </div>

        {/* Right Section: Asset Inventory (Crexi Format) */}
        <div className="col-span-1 md:col-span-4 space-y-6">
           <Card className="bg-[#050510]/80 border-white/5 backdrop-blur-3xl overflow-hidden h-full">
              <CardHeader className="border-b border-white/5 pt-6 px-6">
                 <CardTitle className="text-xs font-bold tracking-widest uppercase text-gray-400 flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-500" /> Active Inventory List
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-white/5">
                    {assets.map((asset) => (
                      <div key={asset.id} className="p-6 transition-colors hover:bg-white/[0.02] cursor-pointer group">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col gap-1">
                               <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{asset.type}</span>
                               <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight leading-tight">{asset.name}</span>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-gray-700 group-hover:text-cyan-400 transition-colors" />
                         </div>
                         <div className="space-y-3">
                            <div className="flex justify-between text-[10px] items-center text-gray-500">
                               <span>Status</span>
                               <span className={asset.status === 'Active' ? 'text-green-400' : 'text-cyan-400'}>{asset.status}</span>
                            </div>
                            <div className="flex justify-between text-[10px] items-center text-gray-500">
                               <span>Funding</span>
                               <span className="font-mono text-gray-400">{asset.funding}</span>
                            </div>
                            <div className="flex justify-between text-[10px] items-center text-gray-500">
                               <span>Location</span>
                               <span className="font-mono text-gray-400">{asset.location}</span>
                            </div>
                         </div>
                         <Button variant="ghost" className="w-full mt-6 text-[8px] font-bold uppercase tracking-widest text-gray-600 border border-white/5 hover:border-cyan-500/50 hover:text-white transition-all">View Property Data Room</Button>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
