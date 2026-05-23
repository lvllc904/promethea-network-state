'use client';
import { useState } from 'react';
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
  ExternalLink,
  Search,
  Database
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@promethea/ui';
import { useSovereignData, executeSovereignMethod } from '@promethea/hooks';
import { RealityBadge } from '@promethea/components';

import { SovereignCockpit } from '@/components/SovereignCockpit';
import { SovereignPulseChart } from '@/components/SovereignPulseChart';

// Helper to generate NOC telemetry data
const generateTelemetry = (base: number, volatility: number, count: number = 60, spikeIdx?: number) => {
    let current = base;
    const data = [];
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < count; i++) {
        current = base + (Math.random() - 0.5) * volatility;
        if (spikeIdx && i === spikeIdx) current += volatility * 3; // Simulate a spike
        data.push({ time: (now - (count - i) * 60) as any, value: Math.max(0, current) });
    }
    return data;
};

export default function PulsePage() {
  const { data: pulse, refetch: refetchPulse } = useSovereignData<any>('/api/security_telemetry/pulse');
  const [isScanning, setIsScanning] = useState(false);

  const velocityData = generateTelemetry(45, 15, 60, 45); // Spike at index 45
  const immuneData = generateTelemetry(10, 5, 60, 45).map(d => ({ ...d, value: d.value * 2 })); // Correlated spike

  const handleAction = async (method: string, params?: any) => {
    if (method === 'perform_integrity_scan') setIsScanning(true);
    try {
      await executeSovereignMethod(method, params);
      await refetchPulse();
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const cockpitTabs = [
    {
      id: 'intel',
      label: 'Intelligence Feed',
      icon: <Database className="w-3 h-3" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* High-density Intel Cards */}
           {[
             { title: 'Wyoming Ground Truth Established', body: 'Refinery #124 has confirmed soil pH and zoning symmetry...', time: '2m ago', level: 'VISIONARY' },
             { title: 'Consensus Achieved: UVT-24', body: 'The Sovereign Will has actualized the new minting threshold...', time: '14m ago', level: 'LEGISLATIVE' }
           ].map((post, i) => (
              <div key={i} className="p-4 bg-gray-900 border border-gray-800 rounded hover:border-cyan-500/50 transition-all group relative">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest">{post.time} • {post.level}</span>
                    <button className="text-gray-700 hover:text-cyan-400"><ExternalLink className="w-3 h-3" /></button>
                 </div>
                 <h4 className="text-[11px] font-black uppercase text-white mb-2 leading-tight">{post.title}</h4>
                 <p className="text-[9px] text-gray-500 line-clamp-2 mb-4 leading-relaxed font-mono">{post.body}</p>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction('trigger_narrative_blast', { post })}
                      className="flex-1 py-2 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-400 hover:text-black text-[8px] font-black uppercase tracking-widest rounded transition-all border border-cyan-500/20"
                    >
                      Syndicate
                    </button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-[8px] font-black uppercase tracking-widest rounded transition-all text-gray-500">
                      Audit
                    </button>
                 </div>
              </div>
           ))}
        </div>
      )
    },
    {
      id: 'vitality',
      label: 'Metabolic Vitality',
      icon: <Activity className="w-3 h-3" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { label: 'Metabolic Velocity', val: `${pulse?.metabolicVelocity || '0'} ops/s`, col: 'text-cyan-400' },
               { label: 'Substrate Load', val: `${((pulse?.substrateLoad || 0) * 100).toFixed(1)}%`, col: 'text-emerald-400' },
               { label: 'Sync Deficit', val: `${pulse?.mirrorSyncDeficit || 0}ms`, col: 'text-blue-400' },
               { label: 'Sovereign Uptime', val: `${((pulse?.uptime || 0) / 3600).toFixed(1)}h`, col: 'text-purple-400' }
             ].map(v => (
               <div key={v.label} className="p-3 bg-gray-900 border border-gray-800 rounded hover:bg-black/40 cursor-help transition-colors">
                  <span className="text-[9px] text-gray-600 uppercase font-bold">{v.label}</span>
                  <p className={`text-xl font-mono font-bold ${v.col}`}>{v.val}</p>
               </div>
             ))}
          </div>
          
          <div className="bg-gray-950 p-4 border border-gray-900 rounded font-mono text-[10px] h-64 overflow-y-auto no-scrollbar">
             <div className="text-gray-600 mb-2 underline decoration-gray-800 underline-offset-4 uppercase font-bold tracking-widest flex items-center gap-2">
                <Database className="w-3 h-3" /> Metabolic Stream (Omni-Lake Audit)
             </div>
             {(pulse?.events || []).map((e: any, i: number) => (
                <div key={i} className="py-1 flex gap-4 hover:bg-gray-900/40 cursor-pointer group">
                   <span className="text-gray-800">[{e.time}]</span>
                   <span className={e.type === 'IMMUNE' ? 'text-red-500' : 'text-cyan-700'}>{e.type}</span>
                   <span className="text-gray-500 truncate group-hover:text-white transition-colors">{e.msg}</span>
                </div>
             ))}
             <div className="text-gray-800 animate-pulse mt-1">... LISTENING ...</div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      label: 'Security Radar',
      icon: <ShieldCheck className="w-3 h-3" />,
      content: (
        <div className="space-y-4">
           {/* NOC Dual-Axis Area Chart */}
           <div className="w-full">
              <SovereignPulseChart velocityData={velocityData} immuneData={immuneData} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gray-900 border border-gray-800 rounded">
                 <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-500" /> IP Quarantine Log
                 </h3>
                 <div className="space-y-2 opacity-40">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-2 bg-black border border-gray-800 rounded flex justify-between">
                         <span className="text-[10px] font-mono">192.168.1.{i * 14}</span>
                         <span className="text-[10px] text-red-500 uppercase font-bold">Blocked</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="p-6 bg-gray-900 border border-gray-800 rounded flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] text-emerald-500 uppercase font-black tracking-widest mb-2 animate-pulse">Defense Level 4</span>
                 <h4 className="text-xl font-black font-mono text-white mb-4">Immune Integrity</h4>
                 <div className="w-full h-1 bg-gray-800 rounded-full mb-6">
                    <div className="h-full bg-emerald-500" style={{ width: '94%' }}></div>
                 </div>
                 <button 
                   onClick={() => handleAction('perform_integrity_scan')}
                   disabled={isScanning}
                   className="w-full py-3 bg-gray-800 hover:bg-emerald-600 text-[10px] font-black uppercase tracking-widest rounded transition-all"
                 >
                   {isScanning ? 'Scanning Substrate...' : 'Run Integrity Scan'}
                 </button>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'syndication',
      label: 'Syndication Matrix',
      icon: <RefreshCcw className="w-3 h-3" />,
      content: (
        <div className="space-y-4">
           {(() => {
              const { data: intel } = useSovereignData<any[]>('/api/lake');
              const syndicationLogs = intel?.filter(i => i.type === 'NARRATIVE_SIGNAL' || i.category === 'GOVERNANCE').slice(0, 5);
              
              if (!syndicationLogs || syndicationLogs.length === 0) {
                 return <div className="p-8 text-center text-gray-600 uppercase font-bold tracking-[0.3em] opacity-40">[ Narrative Broadcast Substrate Linked ]</div>;
              }

              return (
                 <div className="grid grid-cols-1 gap-2">
                    {syndicationLogs.map((log, i) => (
                       <div key={i} className="p-3 bg-gray-900 border border-gray-800 rounded flex justify-between items-center group hover:border-cyan-500/30 transition-all">
                          <div className="flex gap-4 items-center">
                             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                             <div className="space-y-0.5">
                                <span className="text-[7px] text-gray-600 font-bold uppercase">{log.source || 'Sovereign_Node'} // {log.timestamp}</span>
                                <p className="text-[10px] text-gray-300 font-mono group-hover:text-cyan-400 transition-colors">{(log.payload?.observation || log.payload?.title || 'Relaying Sovereign Narrative...').substring(0, 80)}...</p>
                             </div>
                          </div>
                          <span className="bg-cyan-900/20 text-cyan-500 text-[7px] border border-cyan-500/20 px-1.5 py-0.5 rounded-md font-mono">LIVE</span>
                       </div>
                    ))}
                 </div>
              );
           })()}
        </div>
      )
    }
  ];

  return (
    <div className="h-screen py-6 px-4">
      <SovereignCockpit 
        title="Sovereign Pulse" 
        description="Metabolic Vitals, Security Radar & Substrate Integrity"
        tabs={cockpitTabs}
        stats={[
           { label: 'System Health', value: '98%', color: 'text-emerald-400' },
           { label: 'Omni-Sync', value: 'Live' }
        ]}
        actions={[
           { label: 'Emergency Cut-Out', action: 'trigger_state_freeze' },
           { label: 'Re-sync Substrate', action: 'force_substrate_sync' },
           { label: 'Broadcast Narrative', action: 'trigger_narrative_blast' }
        ]}
      />
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
