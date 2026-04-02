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

export default function TreasuryPage() {
  const { data: intel } = useSovereignData<any>('/api/intel');
  const { data: waterfall, refetch: refetchWaterfall } = useSovereignData<any>('/api/waterfall');
  const { data: market } = useSovereignData<any[]>('/api/market/items');
  const [isSweeping, setIsSweeping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const holdings = [
    { name: 'Solana', symbol: 'SOL', balance: intel?.balances?.solana || '0.00', value: intel?.fiatValues?.solana ? `$${intel.fiatValues.solana}` : '$0.00', change: '+5.2%', logo: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
    { name: 'Ethereum', symbol: 'ETH', balance: intel?.balances?.ethereum || '0.00', value: intel?.fiatValues?.ethereum ? `$${intel.fiatValues.ethereum}` : '$0.00', change: '-1.4%', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { name: 'USD Reserve', symbol: 'USD', balance: intel?.balances?.usd || '0.00', value: intel?.balances?.usd ? `$${intel.balances.usd}` : '$0.00', change: '0%', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/87/U.S._one_dollar_bill%2C_reverse%2C_series_2009.jpg' },
    { name: 'Stablecoins', symbol: 'USDC/T', balance: intel?.balances?.stables || '0.00', value: intel?.balances?.stables ? `$${intel.balances.stables}` : '$0.00', change: '0%', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  ];

  const filteredMarket = market?.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <Tabs defaultValue="reserve" className="space-y-8">
      {/* Institutional Top Bar */}
      <div className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tighter text-white font-mono uppercase flex items-center gap-3">
             <Wallet className="h-8 w-8 text-cyan-400" /> Sovereign Treasury
          </h1>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Reserves, Marketplace & Waterfall Distribution</span>
        </div>
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="reserve" className="text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-cyan-500 data-[state=active]:text-black">Reserve</TabsTrigger>
          <TabsTrigger value="market" className="text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-cyan-500 data-[state=active]:text-black">Marketplace</TabsTrigger>
          <TabsTrigger value="waterfall" className="text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-cyan-500 data-[state=active]:text-black">Waterfall</TabsTrigger>
        </TabsList>
      </div>


        <TabsContent value="reserve" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 md:col-span-2 bg-[#050510]/80 border-white/5 backdrop-blur-3xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
              <CardHeader className="relative flex flex-row items-center justify-between pb-2 border-b border-white/5 pt-6 px-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-cyan-400" />
                  </div>
                  <CardTitle className="text-sm font-bold tracking-widest uppercase text-gray-400">Total Capital Account</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-xs text-green-400 font-mono flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {intel?.mtdGrowth || '+5.2'}% MTD</span>
                   <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5"><RefreshCw className="h-4 w-4 text-gray-500" /></Button>
                </div>
              </CardHeader>
              <CardContent className="relative p-8">
                <div className="flex flex-col gap-1">
                   <span className="text-5xl font-black tracking-tighter text-white font-mono">${intel?.totalValue?.toLocaleString() || '20,054.52'}</span>
                   <span className="text-xs text-gray-500 font-mono tracking-widest uppercase mt-4 flex items-center gap-2">
                     <ShieldCheck className="h-4 w-4 text-cyan-400" /> Backed by Sovereign Assets & State Reserve
                   </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
                    {holdings.map((h) => (
                      <div key={h.symbol} className="flex flex-col gap-1 group/item cursor-pointer">
                        <div className="flex items-center gap-2">
                          <img src={h.logo} className="w-4 h-4 rounded-full grayscale group-hover/item:grayscale-0 transition-all" />
                          <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{h.name}</span>
                        </div>
                        <span className="text-lg font-bold text-white group-hover/item:text-cyan-400 transition-colors font-mono">{h.balance} <span className="text-[10px] text-gray-500">{h.symbol}</span></span>
                        <span className="text-[10px] text-gray-600 font-mono">{h.value}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#050510]/80 border-white/5 backdrop-blur-3xl overflow-hidden">
               <CardHeader className="border-b border-white/5 pt-6 px-6">
                  <CardTitle className="text-sm font-bold tracking-widest uppercase text-gray-400 flex items-center gap-3">
                     <PieChart className="h-5 w-5 text-purple-400" /> Asset Allocation
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 flex flex-col gap-6">
                  <div className="relative h-48 w-48 mx-auto">
                     <div className="absolute inset-0 border-[16px] border-white/5 rounded-full" />
                     <div className="absolute inset-0 border-[16px] border-cyan-500 rounded-full" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)' }} />
                     <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-black font-mono">52.8%</span>
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest">In Stables</span>
                     </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] items-center">
                       <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500" /> Stablecoins</div>
                       <span className="font-mono">${intel?.balances?.stables?.toLocaleString() || '10,634.52'}</span>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </div>
          
          <Card className="bg-[#050510]/80 border-white/5 backdrop-blur-3xl overflow-hidden pb-8">
              <CardHeader className="border-b border-white/5 py-4 px-6 mb-4">
                 <CardTitle className="text-xs font-bold tracking-widest uppercase text-gray-400 flex items-center gap-3">
                    <BarChart3 className="h-4 w-4 text-green-400" /> Metabolic Efficiency Index (MEI)
                 </CardTitle>
              </CardHeader>
              <div className="px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-1">Total Sovereign Inflow</span>
                    <span className="text-2xl font-black font-mono">${intel?.totalInflow?.toLocaleString() || '18,422.00'} <span className="text-xs text-green-400">+4%</span></span>
                 </div>
                 <div className="flex flex-col border-l border-white/5 pl-8">
                    <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-1">Metabolic Burn (API)</span>
                    <span className="text-2xl font-black font-mono text-orange-400">${intel?.apiBurn?.toLocaleString() || '122.45'}</span>
                 </div>
                 <div className="flex flex-col border-l border-white/5 pl-8">
                    <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-1">Sovereign ROI</span>
                    <span className="text-2xl font-black font-mono text-cyan-400">{intel?.roi || '150.4'}x</span>
                 </div>
                 <div className="flex flex-col border-l border-white/5 pl-8">
                    <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-1">State Equity (UVT)</span>
                    <span className="text-2xl font-black font-mono">{intel?.uvtEquity?.toLocaleString() || '942,000'}</span>
                 </div>
              </div>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search Sovereign Assets..." 
                    className="pl-10 bg-white/5 border-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <Button className="bg-cyan-500 text-black font-bold uppercase text-[10px] px-6"><PlusCircle className="w-4 h-4 mr-2" /> List Asset</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredMarket.map((item) => (
              <Card key={item.id} className="bg-white/5 border-white/10 overflow-hidden group hover:border-cyan-500/50 transition-all">
                <div className="aspect-video bg-black/40 flex items-center justify-center relative">
                  <RealityBadge state="SIMULATED" size="sm" className="absolute top-2 right-2" />
                  <Zap className="h-10 w-10 text-cyan-500/20" />
                </div>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-bold uppercase">{item.title}</CardTitle>
                    <Badge variant="outline" className="text-[8px]">{item.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-[10px] text-gray-500 line-clamp-2">{item.description}</p>
                  <div className="mt-4 flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase text-gray-600 font-bold">Valuation</span>
                      <LedgerValue value={item.price} isSimulated className="text-lg font-mono font-bold text-cyan-400" />
                    </div>
                    <Button size="sm" className="bg-white/5 border border-white/10 text-[8px] uppercase font-bold tracking-widest px-4">Buy Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="waterfall" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#050510]/80 border-white/5 backdrop-blur-3xl">
               <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 py-4 px-6">
                  <CardTitle className="text-xs font-bold tracking-widest uppercase text-gray-400 flex items-center gap-3">
                     <Zap className="h-4 w-4 text-yellow-400" /> Waterfall Sweep Status
                  </CardTitle>
                  <span className="text-[10px] font-mono bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded border border-yellow-400/20">Active Cycle</span>
               </CardHeader>
               <CardContent className="p-6">
                 <div className="relative pt-4 pb-8">
                   <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-yellow-400/50 via-white/5 to-transparent" />
                   <div className="space-y-8">
                      <div className="relative pl-10">
                         <div className="absolute left-[13px] top-1 w-2 h-2 rounded-full bg-yellow-400 ring-4 ring-yellow-400/20" />
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Input Layer: Method Revenue</span>
                            <span className="text-lg font-bold font-mono">${waterfall?.pending || '12.45'} <span className="text-xs font-normal text-gray-600">Pending</span></span>
                         </div>
                      </div>
                      <div className="relative pl-10">
                         <div className="absolute left-[13px] top-1 w-2 h-2 rounded-full bg-gray-600" />
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Refinery Layer: Plowback (30%)</span>
                            <span className="text-sm font-bold text-gray-400 font-mono">${waterfall?.plowback || '0.00'}</span>
                         </div>
                      </div>
                   </div>
                 </div>
                 <Button 
                   className="w-full bg-[#111] border border-white/10 hover:bg-white/5 text-[10px] uppercase font-bold tracking-widest py-6"
                   onClick={handleSweep}
                   disabled={isSweeping}
                 >
                   {isSweeping ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                   Trigger Manual Sweep
                 </Button>
               </CardContent>
            </Card>

            <Card className="bg-[#050510]/80 border-white/5 backdrop-blur-3xl">
               <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 py-4 px-6">
                  <CardTitle className="text-xs font-bold tracking-widest uppercase text-gray-400 flex items-center gap-3">
                     <HistoryIcon className="h-4 w-4 text-blue-400" /> Sovereign Audit Ledger
                  </CardTitle>
                  <Button variant="ghost" className="text-[10px] text-blue-400 hover:text-white uppercase font-bold tracking-tighter">View All Txns</Button>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    {(intel?.transactions || [
                      { id: 'tx..492', method: 'SEO Blog Sales', amount: '+$142.20', status: 'Settled', type: 'in' },
                      { id: 'tx..881', method: 'Google API Burn', amount: '-$12.45', status: 'Paid', type: 'out' },
                    ]).map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-2 rounded-lg",
                            tx.type === 'in' ? "bg-green-400/5 text-green-400" : "bg-red-400/5 text-red-400"
                          )}>
                            {tx.type === 'in' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{tx.method}</span>
                             <span className="text-[10px] text-gray-600 font-mono">{tx.id} • {tx.status}</span>
                          </div>
                        </div>
                        <span className={cn(
                           "font-mono text-sm font-bold",
                           tx.type === 'in' ? "text-green-400" : "text-gray-400"
                        )}>{tx.amount}</span>
                      </div>
                    ))}
                  </div>
               </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
