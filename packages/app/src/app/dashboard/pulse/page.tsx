'use client';

import { motion } from 'framer-motion';
import { 
  Activity, 
  Terminal, 
  ShieldAlert, 
  Cpu, 
  Server, 
  Wifi, 
  Mic, 
  Zap, 
  RefreshCcw, 
  Box, 
  ShieldCheck, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@promethea/ui';

export default function PulsePage() {
  const events = [
    { time: '14:22:10', type: 'REFINERY', msg: 'mth_real_estate_refinery: Scanned 124 Wyoming Parcels. 1 High-Feasibility Stake Found.', status: 'SUCCESS' },
    { time: '14:21:42', type: 'TREASURY', msg: 'WaterfallProtocol: Successfully swept 0.12 SOL to USD Reserve.', status: 'SETTLED' },
    { time: '14:20:01', type: 'IMMUNE', msg: 'External Auth Challenge: 0xbADA... rejected. Unauthorized Origin.', status: 'SHIELD' },
    { time: '14:18:22', type: 'SENSORY', msg: 'SensoryAgent: Connected to grants.gov. Opportunity FY25-MARC identified.', status: 'SYNC' },
    { time: '14:15:05', type: 'SUBSTRATE', msg: 'Local SQLite: Performing routine atomic vacuum. DB optimized.', status: 'NOMINAL' }
  ];

  const vitals = [
    { label: 'Metabolic Velocity', value: '142 ops/s', status: 'Optimal', icon: Activity, color: 'text-cyan-400' },
    { label: 'Substrate Load', value: '1.2%', status: 'Nominal', icon: Cpu, color: 'text-green-400' },
    { label: 'Mirror Sync Deficit', value: '0.0ms', status: 'Ready', icon: RefreshCcw, color: 'text-blue-400' },
    { label: 'Sovereign Uptime', value: '99.99%', status: 'Active', icon: Clock, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      {/* Pulse Top Bar */}
      <div className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tighter text-white font-mono uppercase flex items-center gap-3">
             <Activity className="h-8 w-8 text-cyan-400" /> Sovereign Pulse
          </h1>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Real-time Metabolic Monitoring & Substrate Vitals</span>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="ghost" className="text-xs text-gray-500 font-bold tracking-widest uppercase border border-white/5"><Terminal className="h-4 w-4 mr-2" /> SSH Control</Button>
           <Button className="text-xs bg-red-900/30 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white font-bold tracking-widest uppercase py-6 px-8 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.1)]">Emergency Cut-Out</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {vitals.map((v) => (
           <Card key={v.label} className="bg-[#050510]/80 border-white/5 backdrop-blur-3xl overflow-hidden group hover:border-white/20 transition-all cursor-pointer">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2 rounded-lg bg-white/5", v.color)}>
                       <v.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[8px] uppercase tracking-widest font-black text-gray-600">{v.status}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{v.label}</span>
                    <span className="text-2xl font-black font-mono text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight leading-tight">{v.value}</span>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Section: Metabolic Audit Log (Netstat UX) */}
        <div className="col-span-1 md:col-span-8 space-y-6">
           <Card className="bg-[#020208]/80 border-white/5 backdrop-blur-3xl overflow-hidden font-mono min-h-[600px] border-l-4 border-l-cyan-500/50">
              <CardHeader className="border-b border-white/5 pt-6 px-8 flex flex-row items-center justify-between">
                 <CardTitle className="text-xs font-bold tracking-widest uppercase text-gray-500 flex items-center gap-3">
                    <Terminal className="h-4 w-4 text-cyan-400" /> AI Metabolic Stream (Omni-Lake Audit)
                 </CardTitle>
                 <div className="flex items-center gap-6">
                    <span className="text-[10px] text-green-400 animate-pulse font-bold flex items-center gap-2"><Wifi className="h-3 w-3" /> LISTENING</span>
                    <Button variant="ghost" className="text-[10px] text-gray-600 uppercase font-black tracking-widest border border-white/5 py-4 hover:text-white">Clean Logs</Button>
                 </div>
              </CardHeader>
              <div className="p-0 text-[11px] leading-relaxed select-all">
                 <div className="divide-y divide-white/[0.02]">
                    {events.map((e, idx) => (
                      <div key={idx} className="px-8 py-4 hover:bg-white/[0.02] transition-colors group flex gap-4">
                         <span className="text-gray-700 font-bold shrink-0">[{e.time}]</span>
                         <span className={cn(
                            "w-24 shrink-0 font-bold tracking-widest uppercase text-[10px]",
                            e.type === 'IMMUNE' ? 'text-red-500' : 
                            e.type === 'TREASURY' ? 'text-yellow-500' : 'text-cyan-600'
                         )}>{e.type}</span>
                         <span className="text-gray-400 group-hover:text-gray-200 transition-colors">{e.msg}</span>
                         <span className={cn(
                            "ml-auto text-[9px] font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity",
                            e.status === 'SHIELD' ? 'text-red-500' : 'text-green-500'
                         )}>{e.status}</span>
                      </div>
                    ))}
                    {/* Simulated Continuous Stream */}
                    <div className="px-8 py-4 text-gray-700 animate-pulse font-bold tracking-widest">
                       ... LISTENING FOR METABOLIC PULSE ...
                    </div>
                 </div>
              </div>
           </Card>
        </div>

        {/* Right Section: Immune Status (Visual Defense) */}
        <div className="col-span-1 md:col-span-4 space-y-6">
           <Card className="bg-[#050510]/80 border-white/5 backdrop-blur-3xl overflow-hidden p-8 border-t-4 border-t-green-500/50">
              <div className="flex flex-col gap-6">
                 <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] text-green-500 uppercase font-black font-mono tracking-widest flex items-center gap-2 animate-pulse"><ShieldCheck className="h-4 w-4" /> Defense Level 4</span>
                       <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tighter">Immune Integrity</h2>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                       <Zap className="h-6 w-6 text-green-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                          <span>Substrate Health</span>
                          <span className="text-white">SYMMETRIC</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "94%" }} className="h-full bg-green-500" />
                       </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                          <span>Identity Integrity</span>
                          <span className="text-white">ENCRYPTED</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-cyan-500" />
                       </div>
                    </div>
                 </div>

                 <Button className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-[10px] uppercase font-black py-8 mt-4 tracking-widest flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4" /> Perform Integrity Scan
                 </Button>
              </div>
           </Card>

           <Card className="bg-white/5 border-white/10 backdrop-blur-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full translate-x-12 -translate-y-12" />
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] text-yellow-500 uppercase font-black tracking-widest flex items-center gap-2"><Mic className="h-4 w-4" /> Ambient Voice Feed</span>
                    <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20 group-hover:scale-110 transition-transform">
                       <Box className="h-4 w-4 text-yellow-400" />
                    </div>
                 </div>
                 <p className="text-xs text-gray-500 font-mono leading-relaxed italic border-l-2 border-white/10 pl-4 py-2">
                   "PNS is now processing the 42.8252, -108.7513 ground truth... Standing by for Stage 3 actualization command."
                 </p>
                 <Button variant="ghost" className="text-[10px] text-gray-600 font-bold uppercase tracking-widest py-2 hover:text-white justify-start pl-4 underline decoration-white/10 underline-offset-8">Open Voice Matrix <ExternalLink className="h-3 w-3 ml-2" /></Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
