'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  BarChart3, 
  PieChart, 
  ShieldCheck,
  TrendingUp,
  History as HistoryIcon,
  Zap,
  ShoppingCart,
  Search,
  Tag,
  PlusCircle,
  Filter,
  ExternalLink
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Badge,
  Input
} from '@promethea/ui';
import { useSovereignData, executeSovereignMethod } from '@promethea/hooks';
import { RealityBadge, LedgerValue } from '@promethea/components';

import { SovereignCockpit } from '@/components/SovereignCockpit';

export default function TreasuryPage() {
  const { data: intel } = useSovereignData<any>('/api/intel');
  const { data: waterfall, refetch: refetchWaterfall } = useSovereignData<any>('/api/waterfall');
  const { data: methods } = useSovereignData<any[]>('/api/refineries');
  
  const [isSweeping, setIsSweeping] = useState(false);
  
  const handleSweep = async () => {
    setIsSweeping(true);
    try {
      await executeSovereignMethod('trigger_waterfall_sweep');
      await refetchWaterfall();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSweeping(false);
    }
  };

  const cockpitTabs = [
    {
      id: 'reserve',
      label: 'Reserve Hub',
      icon: <Wallet className="w-3 h-3" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Main Capital Card */}
             <div className="col-span-2 p-6 bg-gray-900 rounded border border-gray-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 className="w-24 h-24" /></div>
                <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Total Capital Account</p>
                <h2 className="text-4xl font-black font-mono text-white">${intel?.totalValue?.toLocaleString() || '20,054.52'}</h2>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                   {['SOL', 'ETH', 'USD', 'USDC'].map(s => (
                      <div key={s} className="p-2 bg-black rounded border border-gray-800">
                         <p className="text-[9px] text-gray-600 uppercase font-bold">{s}</p>
                         <p className="text-sm font-mono text-white">{intel?.balances?.[s.toLowerCase()] || '0.00'}</p>
                      </div>
                   ))}
                </div>
             </div>
             {/* Allocation Card */}
             <div className="p-6 bg-gray-900 rounded border border-gray-800">
                <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-4 text-center">Allocation Stability</p>
                <div className="relative h-32 w-32 mx-auto">
                   <div className="absolute inset-0 border-8 border-gray-800 rounded-full" />
                   <div className="absolute inset-0 border-8 border-cyan-500 rounded-full" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)' }} />
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold font-mono">52%</span>
                   </div>
                </div>
             </div>
          </div>
          
          {/* Metabolic Index */}
          <div className="p-4 bg-gray-950 rounded border border-gray-900 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                  { label: 'Inflow', val: `$${intel?.totalInflow || '0.00'}`, color: 'text-emerald-400' },
                  { label: 'API Burn', val: `$${intel?.apiBurn || '0.00'}`, color: 'text-orange-400' },
                  { label: 'Sovereign ROI', val: `${intel?.roi || '1.0'}x`, color: 'text-cyan-400' },
                  { label: 'UVT Equity', val: intel?.uvtEquity || '0', color: 'text-white' }
              ].map(i => (
                  <div key={i.label} className="flex flex-col">
                      <span className="text-[9px] text-gray-600 uppercase font-bold tracking-tighter">{i.label}</span>
                      <span className={`text-xl font-mono font-bold ${i.color}`}>{i.val}</span>
                  </div>
              ))}
          </div>
        </div>
      )
    },
    {
      id: 'engine',
      label: 'Economic Methods',
      icon: <Zap className="w-3 h-3" />,
      content: (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {methods?.map((m) => (
            <div key={m.id} className="p-3 bg-gray-900 border border-gray-800 rounded hover:border-emerald-500/50 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[8px] font-mono text-gray-600">ID: {m.id.substring(0,8)}</span>
              </div>
              <h3 className="text-[10px] font-bold uppercase truncate mb-1">{m.name}</h3>
              
              {/* Interactive Density: Parametric Sliders */}
              <div className="mt-4 space-y-2">
                 <div className="flex justify-between items-center text-[7px] text-gray-500 font-bold uppercase">
                    <span>Performance</span>
                    <span className="text-white">94%</span>
                 </div>
                 <div className="h-1 bg-black rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/50" style={{ width: '94%' }}></div>
                 </div>
              </div>

              <div className="flex justify-between items-end mt-4">
                 <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-gray-500 font-mono">Profit: ${m.totalProfit || '0.00'}</span>
                    <span className="text-[8px] text-emerald-400 font-mono">ROI: {m.roi || '1.2'}x</span>
                 </div>
                 <select className="bg-black border border-gray-800 text-[8px] font-bold uppercase p-1 rounded cursor-pointer hover:border-emerald-500/50 transition-colors">
                    <option>PRO</option>
                    <option>FLASH</option>
                    <option>CONSERVE</option>
                 </select>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: <LayoutGrid className="w-3 h-3" />,
      content: (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
           {/* High-density Asset Grid */}
           {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-3 bg-gray-900 border border-gray-800 rounded hover:border-cyan-500/50 transition-all group">
                 <div className="aspect-square bg-black/40 rounded mb-2 flex items-center justify-center border border-gray-800 group-hover:border-cyan-500/30 transition-all">
                    <RealityBadge state="SIMULATED" size="sm" />
                 </div>
                 <h4 className="text-[10px] font-bold uppercase truncate mb-1 text-white">Sovereign Asset #{i}</h4>
                 <div className="flex justify-between items-end">
                    <span className="text-[9px] font-mono text-cyan-400 font-bold">$12,400</span>
                    <button className="bg-white/5 border border-white/10 hover:bg-cyan-600 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded transition-all">Buy</button>
                 </div>
              </div>
           ))}
        </div>
      )
    },
    {
      id: 'waterfall',
      label: 'Waterfall Protocol',
      icon: <TrendingUp className="w-3 h-3" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-6 bg-gray-900 rounded border border-gray-800">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                 <RefreshCw className={`w-4 h-4 text-cyan-400 ${isSweeping ? 'animate-spin' : ''}`} /> 
                 Protocol Distribution Matrix
              </h3>
              <div className="space-y-4">
                 {[
                   { label: 'Plowback Reserve', val: '30%', target: '$1,000' },
                   { label: 'Labor Allocation', val: '40%', target: 'UVT/SOL' },
                   { label: 'Proprietary R&D', val: '20%', target: 'Body-2' },
                   { label: 'Sustainability', val: '10%', target: 'Cleanup' }
                 ].map(p => (
                   <div key={p.label} className="flex items-center justify-between p-2 bg-black rounded border border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">{p.label}</span>
                      <div className="flex items-center gap-4">
                         <span className="text-xs font-mono text-white">{p.val}</span>
                         <span className="text-[10px] font-mono text-gray-600">{p.target}</span>
                      </div>
                   </div>
                 ))}
                 <button 
                  onClick={handleSweep}
                  disabled={isSweeping}
                  className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-black uppercase rounded tracking-widest transition-all"
                 >
                   Trigger Manual Sweep
                 </button>
              </div>
           </div>
           
           <div className="p-6 bg-gray-900 rounded border border-gray-800 overflow-hidden">
               <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Sovereign Audit Ledger</h3>
               <div className="divide-y divide-gray-800">
                  {intel?.transactions?.slice(0, 6).map((tx: any) => (
                    <div key={tx.id} className="py-3 flex justify-between items-center group cursor-pointer hover:bg-black/40 px-2 -mx-2">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-200 uppercase">{tx.method}</span>
                          <span className="text-[8px] font-mono text-gray-600">{tx.id}</span>
                       </div>
                       <span className={`text-xs font-mono font-bold ${tx.type === 'in' ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {tx.amount}
                       </span>
                    </div>
                  ))}
               </div>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="h-screen py-6 px-4">
      <SovereignCockpit 
        title="Sovereign Treasury" 
        description="Public Reserve, Waterfall Protocols & Economic Method Matrix"
        tabs={cockpitTabs}
        stats={[
           { label: 'Net Liquidity', value: `$${intel?.totalValue || '0.00'}` },
           { label: 'UVT Backing', value: '1.20x', color: 'text-cyan-400' }
        ]}
        actions={[
           { label: 'Emergency Freeze', action: 'emergency_lock_treasury' },
           { label: 'Mint UVT Payload', action: 'trigger_uvt_mint' },
           { label: 'Push Settlement', action: 'push_solana_settlement' }
        ]}
      />
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
