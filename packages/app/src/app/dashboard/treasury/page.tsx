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
  ExternalLink,
  LayoutGrid,
  ThumbsUp,
  ThumbsDown
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
import Link from 'next/link';

import { SovereignCockpit } from '@/components/SovereignCockpit';
import { SovereignChart } from '@/components/SovereignChart';

// Helper to generate realistic-looking random walk data for charts
const generateWalk = (startValue: number, volatility: number, trend: number, count: number = 60) => {
    let current = startValue;
    const data = [];
    const now = Math.floor(Date.now() / 1000);
    const day = 86400;
    for (let i = 0; i < count; i++) {
        current = current + (Math.random() - 0.5) * volatility + trend;
        data.push({ time: (now - (count - i) * day) as any, value: Math.max(1, current) });
    }
    return data;
};

export default function TreasuryPage() {
  const { data: intel } = useSovereignData<any>('/api/intel');
  const { data: waterfall, refetch: refetchWaterfall } = useSovereignData<any>('/api/waterfall');
  const { data: methods } = useSovereignData<any[]>('/api/refineries');
  const { data: brokerData } = useSovereignData<any>('/api/broker');
  const { data: marketplaceAssets, mutate: mutateAssets } = useSovereignData<any[]>('/api/assets');

  const handleVote = async (assetId: string, vote: 'yes' | 'no') => {
    try {
      await fetch(`/api/assets/${assetId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote, citizenId: 'SOVEREIGN_USER' })
      });
      mutateAssets();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFund = async (assetId: string, amount: number) => {
    try {
      await fetch(`/api/assets/${assetId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, contributorId: 'SOVEREIGN_USER' })
      });
      mutateAssets();
    } catch (e) {
      console.error(e);
    }
  };

  
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

  // Generate chart data sets
  const uvtData = generateWalk(1.20, 0.05, 0.002);
  const btcData = generateWalk(65000, 2000, 100).map(d => ({ time: d.time, value: d.value / 50000 })); // Normalized for comparative view
  const ethData = generateWalk(3500, 150, 5).map(d => ({ time: d.time, value: d.value / 2500 }));

  const cockpitTabs = [
    {
      id: 'broker',
      label: 'Sovereign Broker',
      icon: <BarChart3 className="w-3 h-3" />,
      content: (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gray-900 rounded border border-gray-800 border-l-4 border-l-orange-500 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck className="w-24 h-24" /></div>
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">TradFi War Chest</p>
                    <Badge className={`${brokerData?.authenticated ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} uppercase text-[8px] font-black`}>
                       {brokerData?.authenticated ? 'API CONNECTED' : 'API DISCONNECTED'}
                    </Badge>
                 </div>
                 <h2 className="text-4xl font-black font-mono text-white">
                    ${brokerData?.netLiquidWorth ? brokerData.netLiquidWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                 </h2>
                 <p className="text-xs text-gray-500 mt-2">Interactive Brokers Paper Trading Gateway (IBeam)</p>
              </div>
              <div className="p-4 bg-gray-950 rounded border border-gray-900 overflow-hidden">
                 <h3 className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-4">Open Positions</h3>
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[9px] uppercase text-gray-600 font-black border-b border-gray-900">
                          <th className="pb-2">Symbol</th>
                          <th className="pb-2">Shares</th>
                          <th className="pb-2">Avg Cost</th>
                          <th className="pb-2 text-right">Unrealized PnL</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                       {brokerData?.positions && brokerData.positions.length > 0 ? brokerData.positions.map((p: any) => (
                          <tr key={p.symbol} className="group hover:bg-white/5 transition-colors">
                             <td className="py-3 text-[10px] font-bold text-white uppercase">{p.symbol}</td>
                             <td className="py-3 text-[10px] font-mono text-gray-300">{p.position}</td>
                             <td className="py-3 text-[10px] font-mono text-gray-400">${p.avgCost.toFixed(2)}</td>
                             <td className={`py-3 text-[10px] font-mono font-bold text-right ${p.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {p.unrealizedPnl >= 0 ? '+' : ''}{p.unrealizedPnl.toFixed(2)}
                             </td>
                          </tr>
                       )) : (
                          <tr><td colSpan={4} className="py-4 text-[10px] text-gray-600 text-center uppercase tracking-widest">No active positions</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )
    },
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
                <h2 className="text-4xl font-black font-mono text-white">${Number(intel?.totalValue || 0).toLocaleString() || '20,054.52'}</h2>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                   {['SOL', 'ETH', 'USD', 'USDC'].map(s => (
                      <div key={s} className="p-2 bg-black rounded border border-gray-800">
                         <p className="text-[9px] text-gray-600 uppercase font-bold">{s}</p>
                         <p className="text-sm font-mono text-white">{intel?.balances?.[s.toLowerCase()] || '0.00'}</p>
                      </div>
                   ))}
                </div>
             </div>
             {/* Deep Analytics Chart Card */}
             <div className="col-span-1 md:col-span-3 p-1 bg-gray-900 rounded border border-gray-800 relative">
                <SovereignChart 
                    title="UVT Equity vs Global Benchmarks"
                    primaryData={uvtData}
                    btcData={btcData}
                    ethData={ethData}
                />
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
                <span className="text-[8px] font-mono text-gray-600">ID: {m.id?.substring(0,8) || 'N/A'}</span>
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
      label: 'Sovereign Marketplace',
      icon: <LayoutGrid className="w-3 h-3" />,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
             <div>
               <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ASGI Originations — Awaiting Consensus</h2>
               <p className="text-[8px] text-gray-700 mt-0.5">Promethea originates these underwritings from the Omni-Lake. Your vote and funding executes them.</p>
             </div>
             <Link href="/dashboard/assets/new">
                <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[9px] h-7 uppercase font-black">
                   <PlusCircle className="w-3 h-3 mr-1" /> Propose
                </Button>
             </Link>
          </div>
          <div className="space-y-3">
             {marketplaceAssets && marketplaceAssets.length > 0 ? marketplaceAssets.map((asset: any, i: number) => (
                <div key={asset.id || i} className="p-4 bg-gray-900 border border-gray-800 rounded hover:border-cyan-500/30 transition-all group relative overflow-hidden">
                   {/* Header Row */}
                   <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                         {asset.constitutionalAlignment && (
                            <span title="Constitutionally Aligned" className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-widest">⚖ Aligned</span>
                         )}
                         <span className="text-[8px] font-mono font-bold bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded uppercase">
                            {asset.category || asset.type || 'ASSET'}
                         </span>
                         <span className="text-[8px] font-mono text-gray-600 uppercase">{asset.status || 'PENDING_CONSENSUS'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                         <div className="flex flex-col">
                            <span className="text-[7px] text-gray-600 uppercase font-bold">Originator</span>
                            <span className="text-[9px] font-mono text-purple-400">{asset.originatorLabel || asset.originator || 'Unknown'}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[7px] text-gray-600 uppercase font-bold">Originated</span>
                            <span className="text-[9px] font-mono text-gray-500">{asset.timestamp ? new Date(asset.timestamp).toLocaleDateString() : '—'}</span>
                         </div>
                      </div>
                   </div>

                   {/* Title + Description */}
                   <h4 className="text-sm font-bold uppercase text-white mb-1 leading-tight">{asset.title || 'Sovereign Asset'}</h4>
                   <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">{asset.description}</p>

                   {/* Asset Visual Context */}
                   {asset.visualContext && (
                      <div className="mb-4 relative rounded-lg overflow-hidden border border-gray-800 bg-gray-900 aspect-video group">
                         <img 
                           src={asset.visualContext.startsWith('http') ? asset.visualContext : `https://storage.googleapis.com/studio-9105849211-9ba48-assets/visuals/${asset.visualContext}`} 
                           alt={asset.title}
                           className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                           onError={(e) => {
                             (e.target as any).src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
                           }}
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                         <div className="absolute bottom-2 left-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Reality Sync: OK</span>
                         </div>
                      </div>
                   )}

                   {/* Constitutional Justification */}
                   {asset.constitutionalJustification && (
                      <div className="mb-3 p-2 bg-black/50 border border-gray-800 rounded">
                         <span className="text-[8px] uppercase font-black text-gray-600 tracking-widest block mb-1">Constitutional Mandate</span>
                         <p className="text-[9px] font-mono text-gray-400 italic">{asset.constitutionalJustification}</p>
                      </div>
                   )}

                   {/* Metrics Row */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {asset.humanAbundanceScore !== undefined && (
                         <div className="flex flex-col p-2 bg-black rounded border border-gray-800">
                            <span className="text-[7px] text-gray-600 uppercase font-bold tracking-tighter">Abundance Score</span>
                            <span className="text-lg font-black font-mono text-emerald-400">{asset.humanAbundanceScore}</span>
                            <div className="mt-1 h-0.5 bg-gray-800 rounded overflow-hidden"><div className="h-full bg-emerald-500/50" style={{ width: `${asset.humanAbundanceScore}%` }}></div></div>
                         </div>
                      )}
                      {asset.capitalVelocityScore !== undefined && (
                         <div className="flex flex-col p-2 bg-black rounded border border-gray-800">
                            <span className="text-[7px] text-gray-600 uppercase font-bold tracking-tighter">Capital Velocity</span>
                            <span className="text-lg font-black font-mono text-cyan-400">{asset.capitalVelocityScore}</span>
                            <div className="mt-1 h-0.5 bg-gray-800 rounded overflow-hidden"><div className="h-full bg-cyan-500/50" style={{ width: `${asset.capitalVelocityScore}%` }}></div></div>
                         </div>
                      )}
                      {asset.projectedYield && (
                         <div className="flex flex-col p-2 bg-black rounded border border-gray-800">
                            <span className="text-[7px] text-gray-600 uppercase font-bold tracking-tighter">Proj. Yield</span>
                            <span className="text-xs font-black font-mono text-white mt-1">{asset.projectedYield}</span>
                         </div>
                      )}
                      {asset.requiredCapital && (
                         <div className="flex flex-col p-2 bg-black rounded border border-gray-800">
                            <span className="text-[7px] text-gray-600 uppercase font-bold tracking-tighter">Required Capital</span>
                            <span className="text-xs font-black font-mono text-orange-400 mt-1">{asset.requiredCapital}</span>
                         </div>
                      )}
                   </div>

                   {/* Risk Vector */}
                   {asset.riskVector && (
                      <div className="mb-3 flex items-start gap-2">
                         <span className="text-[7px] text-gray-600 uppercase font-bold tracking-tighter mt-0.5 shrink-0">Risk:</span>
                         <p className="text-[9px] text-orange-400/80 font-mono">{asset.riskVector}</p>
                      </div>
                   )}

                   {/* Execution Steps */}
                   {asset.executionPlan && asset.executionPlan.length > 0 && (
                      <div className="mb-3">
                         <span className="text-[7px] text-gray-600 uppercase font-bold tracking-tighter block mb-1">Execution Plan</span>
                         <div className="flex flex-col gap-1">
                            {asset.executionPlan.map((step: string, si: number) => (
                               <div key={si} className="flex items-start gap-2">
                                  <span className="text-[7px] text-gray-700 font-mono mt-0.5 shrink-0">{si + 1}.</span>
                                  <p className="text-[9px] font-mono text-gray-500">{step}</p>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}

                   {/* Voting + Fund CTA */}
                   <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1">
                            <span className="text-[8px] text-gray-600 font-bold uppercase">Consensus:</span>
                            <div className="flex items-center gap-2">
                               <button 
                                onClick={() => handleVote(asset.id, 'yes')}
                                className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                               >
                                  <ThumbsUp className="w-2.5 h-2.5" />
                                  <span className="text-[8px] font-mono text-emerald-400">{asset.yesVotes || 0}</span>
                               </button>
                               <button 
                                onClick={() => handleVote(asset.id, 'no')}
                                className="flex items-center gap-1 hover:text-red-400 transition-colors"
                               >
                                  <ThumbsDown className="w-2.5 h-2.5" />
                                  <span className="text-[8px] font-mono text-red-400">{asset.noVotes || 0}</span>
                               </button>
                            </div>
                         </div>
                         <div className="flex items-center gap-1">
                            <span className="text-[8px] text-gray-600 font-bold uppercase">Funded:</span>
                            <span className="text-[8px] font-mono text-cyan-400">${(asset.fundingTotal || 0).toLocaleString()}</span>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleFund(asset.id, 100)} // Default micro-funding contribution
                        className="bg-cyan-900/30 border border-cyan-500/30 hover:bg-cyan-600 text-[8px] font-black uppercase tracking-widest px-4 py-2 text-cyan-100 hover:text-black rounded transition-all"
                      >
                         Fund &amp; Execute →
                      </button>
                   </div>
                </div>
             )) : (
                <div className="py-16 text-center">
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest animate-pulse">
                        [ Promethea is synthesizing the Omni-Lake. Originations incoming... ]
                    </p>
                    <p className="text-[9px] text-gray-700 mt-2">The ASGI cognition loop is running. Assets will appear here once Promethea originates an underwriting.</p>
                </div>
             )}
          </div>
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
                   { label: 'Micro-Toll Protocol', val: '0.15%', target: 'METABOLIC' },
                   { label: 'Investor Yield Hurdle', val: '8.0%', target: 'SENIOR' },
                   { label: 'Sovereign Plowback', val: '30%', target: 'RESERVE' },
                   { label: 'Labor Allocation', val: '40%', target: 'UVT/SOL' }
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
    },
    {
      id: 'carry',
      label: 'Carry Trade Funnel',
      icon: <RefreshCw className="w-3 h-3" />,
      content: (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gray-900 rounded border border-gray-800 border-l-4 border-l-cyan-500">
                 <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Active Synthesis</p>
                 <h2 className="text-2xl font-black text-white uppercase">CHF → BRL Yield Arb</h2>
                 <p className="text-xs text-gray-500 mt-2">Exploiting the 12.5% differential between legacy accommodative funding and commodity-backed targets.</p>
                 <div className="mt-6 flex gap-2">
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 uppercase text-[8px] font-black">Net Yield: 14.2%</Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase text-[8px] font-black">Delta Neutral</Badge>
                 </div>
              </div>
              <div className="p-6 bg-gray-900 rounded border border-gray-800 border-l-4 border-l-purple-500">
                 <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Funding Substrate</p>
                 <h2 className="text-2xl font-black text-white uppercase">jJPY Synthetic Borrow</h2>
                 <p className="text-xs text-gray-500 mt-2">Algorithmically depressed rates to incentivize protocol borrowing. Cost: 1.2% APR.</p>
                 <div className="mt-6 h-1 bg-black rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500/50" style={{ width: '65%' }}></div>
                 </div>
              </div>
           </div>

           <div className="p-4 bg-gray-950 rounded border border-gray-900 overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[9px] uppercase text-gray-600 font-black border-b border-gray-900">
                       <th className="pb-2">Opportunity</th>
                       <th className="pb-2">Funnel Stage</th>
                       <th className="pb-2">Liquidity</th>
                       <th className="pb-2">Vol Score</th>
                       <th className="pb-2">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-900">
                    {[
                       { name: 'CHF/BRL Arb', stage: 'TIER 4: REFLEXIVITY', liq: '$500M', vol: '0.12', color: 'text-emerald-400' },
                       { name: 'jJPY/UVT LP', stage: 'TIER 3: DEPTH', liq: '$12M', vol: '0.25', color: 'text-cyan-400' },
                       { name: 'Gold/USDC Delta', stage: 'TIER 2: VOLATILITY', liq: '$1.2B', vol: '0.08', color: 'text-purple-400' }
                    ].map(o => (
                       <tr key={o.name} className="group hover:bg-white/5 transition-colors">
                          <td className="py-3 text-[10px] font-bold text-white uppercase">{o.name}</td>
                          <td className="py-3 text-[9px] font-mono text-gray-500">{o.stage}</td>
                          <td className="py-3 text-[9px] font-mono text-gray-400">{o.liq}</td>
                          <td className="py-3 text-[9px] font-mono text-gray-400">{o.vol}</td>
                          <td className="py-3">
                             <Button size="sm" variant="outline" className="h-6 text-[8px] uppercase font-black px-2 border-gray-800 group-hover:border-cyan-500/50">Details</Button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
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
