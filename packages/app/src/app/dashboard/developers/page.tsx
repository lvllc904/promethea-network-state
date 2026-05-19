'use client';

import React, { useState } from 'react';
import { 
  Code2, 
  Key, 
  Terminal, 
  Cpu, 
  Globe, 
  Database, 
  Zap, 
  Copy, 
  CheckCircle, 
  ExternalLink,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@promethea/ui';
import { useHardwareHandshake } from '@promethea/hooks';
import { SovereignCockpit } from '@/components/SovereignCockpit';

export default function DeveloperPortalPage() {
  const [apiKey, setApiKey] = useState('PROMETHEA_SK_live_8a9c3f4e2b...e0a7');
  const [copied, setCopied] = useState(false);
  const { profile } = useHardwareHandshake();

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cockpitTabs = [
    {
      id: 'credentials',
      label: 'Sovereign Credentials',
      icon: <Key className="w-3 h-3" />,
      content: (
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-500" />
                    API Access Keys
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">Use these keys to authenticate your agents with the Promethean Substrate.</p>
                </div>
                <Button variant="outline" size="sm" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] font-black uppercase">Rotate Key</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-black rounded border border-gray-800">
                <div className="flex-1 font-mono text-sm text-gray-300 break-all">
                  {apiKey}
                </div>
                <Button onClick={handleCopy} size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]">Verified Citizen</Badge>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[9px]">Full Write Access</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                   <CardTitle className="text-sm text-gray-300 uppercase font-black tracking-widest flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-500" />
                      Cartographer SDK
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <pre className="bg-black p-3 rounded font-mono text-[10px] text-cyan-400 overflow-x-auto border border-gray-800">
                      <code>npm install @promethea/cartographer-react</code>
                   </pre>
                   <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                      Enable adaptive agentic interfaces in your application. Automatically sense hardware telemetry and optimize rendering dimensionality.
                   </p>
                </CardContent>
             </Card>

             <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                   <CardTitle className="text-sm text-gray-300 uppercase font-black tracking-widest flex items-center gap-2">
                      <Database className="w-4 h-4 text-purple-500" />
                      Omni-Lake Query
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <pre className="bg-black p-3 rounded font-mono text-[10px] text-purple-400 overflow-x-auto border border-gray-800">
                      <code>GET /api/intelligence/lake?q=RWA</code>
                   </pre>
                   <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                      Query the collective intelligence of the Network State. Access curated RWA signals, macro-trends, and environmental telemetry.
                   </p>
                </CardContent>
             </Card>
          </div>
        </div>
      )
    },
    {
      id: 'adaptive-ui',
      label: 'Adaptive UI Explorer',
      icon: <Cpu className="w-3 h-3" />,
      content: (
        <div className="space-y-4">
           <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Hardware Identity Probe</h2>
                    <p className="text-xs text-gray-500">Real-time metabolic telemetry from your current vessel.</p>
                 </div>
                 <Badge className="bg-emerald-500 text-black font-black text-[10px] px-3 py-1">Nexus Protocol Active</Badge>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                   { label: 'GPU Substrate', value: profile?.gpu || 'Scanning...', icon: Zap, color: 'text-cyan-400' },
                   { label: 'Metabolic Score', value: `${(profile?.score || 0).toFixed(2)} / 1.00`, icon: Activity, color: 'text-emerald-400' },
                   { label: 'Assigned Tier', value: profile?.tier || 'Calculating...', icon: Cpu, color: 'text-purple-400' },
                   { label: 'Memory Availability', value: `${profile?.memory || 0}GB RAM`, icon: Database, color: 'text-blue-400' }
                 ].map(stat => (
                   <div key={stat.label} className="p-4 bg-black/40 border border-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                         <stat.icon className={`w-3 h-3 ${stat.color}`} />
                         <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <p className={`text-sm font-mono font-bold ${stat.color} truncate`}>{stat.value}</p>
                   </div>
                 ))}
              </div>

              <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                 <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Promethean Suggestion
                 </h3>
                 <p className="text-xs text-gray-400 leading-relaxed italic">
                    "Based on your current GPU substrate ({profile?.gpu}), I recommend the <span className="text-white font-bold">Apex Tier</span> for this session. Your system possesses the necessary metabolic capacity for real-time WebGL topography."
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-900 border border-gray-800 rounded group cursor-pointer hover:border-cyan-500/50 transition-all">
                 <h4 className="text-[10px] font-black text-white uppercase mb-1">Reality Map SDK</h4>
                 <p className="text-[9px] text-gray-500">Inject 3D reality layers into your own dashboard.</p>
                 <ArrowUpRight className="w-3 h-3 text-cyan-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4 bg-gray-900 border border-gray-800 rounded group cursor-pointer hover:border-purple-500/50 transition-all">
                 <h4 className="text-[10px] font-black text-white uppercase mb-1">Vessel Sentinel</h4>
                 <p className="text-[9px] text-gray-500">Protect your agents from substrate thermal limits.</p>
                 <ArrowUpRight className="w-3 h-3 text-purple-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4 bg-gray-900 border border-gray-800 rounded group cursor-pointer hover:border-amber-500/50 transition-all">
                 <h4 className="text-[10px] font-black text-white uppercase mb-1">Auth Bridge</h4>
                 <p className="text-[9px] text-gray-500">Universal login for the Promethean Archipelago.</p>
                 <ArrowUpRight className="w-3 h-3 text-amber-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'docs',
      label: 'Documentation',
      icon: <BookOpen className="w-3 h-3" />,
      content: (
        <div className="p-8 text-center bg-gray-900 border border-gray-800 rounded-lg">
           <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-cyan-400" />
           </div>
           <h3 className="text-xl font-black text-white uppercase tracking-tighter">Sovereign Knowledge Base</h3>
           <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
             The full Cartographer SDK specification and API reference are available on the Sovereign Git substrate.
           </p>
           <Button variant="outline" className="mt-6 gap-2 text-[10px] font-black uppercase border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black">
              View External Docs <ExternalLink className="w-3 h-3" />
           </Button>
        </div>
      )
    }
  ];

  return (
    <div className="h-full">
      <SovereignCockpit 
        title="Developer Portal"
        description="Build the Future of the Network State"
        stats={[
          { label: 'Active Keys', value: '1', color: 'text-amber-500' },
          { label: 'API Health', value: '99.9%', color: 'text-emerald-500' },
          { label: 'Requests (24h)', value: '1,204', color: 'text-cyan-500' }
        ]}
        tabs={cockpitTabs}
      />
    </div>
  );
}

function ArrowUpRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17L17 7" />
    </svg>
  );
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
