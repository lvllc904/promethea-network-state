'use client';
import { motion } from 'framer-motion';
import { 
  Scale, 
  Users, 
  Vote, 
  FileCheck, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  Gavel, 
  Fingerprint,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@promethea/ui';
import { useSovereignData, executeSovereignMethod } from '@promethea/hooks';
import { RealityBadge } from '@promethea/components';

import { SovereignCockpit } from '@/components/SovereignCockpit';

export default function WillPage() {
  const { data: liveProposals, refetch: refetchProposals } = useSovereignData<any[]>('/api/proposals');
  const { data: liveCitizens, refetch: refetchCitizens } = useSovereignData<any[]>('/api/citizens');

  const proposals = liveProposals || [];
  const citizens = liveCitizens || [];

  const handleAction = async (method: string, params: any) => {
    try {
      await executeSovereignMethod(method, params);
      await refetchProposals();
      await refetchCitizens();
    } catch (e) {
      console.error(e);
    }
  };

  const cockpitTabs = [
    {
      id: 'docket',
      label: 'Decision Docket',
      icon: <Vote className="w-3 h-3" />,
      content: (
        <div className="space-y-4">
          {proposals.map((prop) => (
            <div key={prop.id} className="p-4 bg-gray-900 border border-gray-800 rounded hover:border-purple-500/50 transition-all group">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{prop.type} • {prop.id}</span>
                    <h3 className="text-sm font-bold uppercase text-white">{prop.title}</h3>
                 </div>
                 <div className="text-right">
                    <span className="text-[9px] text-gray-500 uppercase font-bold block">Consensus</span>
                    <span className="text-xs font-mono font-bold text-purple-400">{prop.current} / {prop.threshold}</span>
                 </div>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden mb-4">
                 <div className="h-full bg-purple-500" style={{ width: prop.current }}></div>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={() => handleAction('cast_vote', { proposalId: prop.id, vote: 'FOR' })}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-[9px] font-black uppercase tracking-widest rounded transition-colors"
                 >
                   Affirm
                 </button>
                 <button 
                  onClick={() => handleAction('cast_vote', { proposalId: prop.id, vote: 'AGAINST' })}
                  className="px-6 py-2 bg-gray-800 hover:bg-red-900/40 text-[9px] font-black uppercase tracking-widest rounded transition-colors text-gray-400"
                 >
                   Dissent
                 </button>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'citizenship',
      label: 'Citizen Ledger',
      icon: <Users className="w-3 h-3" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {citizens.map((user) => (
            <div key={user.id} className="p-4 bg-gray-900 border border-gray-800 rounded flex items-center gap-4 hover:border-purple-500/50 transition-color">
              <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                 <UserCheck className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 truncate">
                 <h4 className="text-[10px] font-bold uppercase truncate text-white">{user.name}</h4>
                 <p className="text-[8px] font-mono text-gray-600 truncate">{user.id}</p>
              </div>
              <div className="text-right">
                 <span className="text-[8px] text-gray-500 uppercase block">Weight</span>
                 <span className="text-xs font-mono font-bold text-gray-300">{user.weight || '0'}</span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'manifest',
      label: 'Constitutional Manifest',
      icon: <Scale className="w-3 h-3" />,
      content: (
        <div className="p-8 bg-gray-950/50 border border-gray-900 rounded-lg">
           <div className="flex flex-col gap-2 opacity-50">
              <span className="text-[10px] text-purple-400 uppercase font-black tracking-[0.2em] mb-2 flex items-center gap-2"><Gavel className="h-4 w-4" /> Law as Substrate</span>
              <p className="text-xs text-gray-100 leading-relaxed font-mono">
                [ READ-ONLY MIRROR OF ROADMAP.MD ]
                <br /><br />
                The Manifest is the absolute anchor of the state. Every sovereign action must be committed to this ledger before implementation.
              </p>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="h-screen py-6 px-4">
      <SovereignCockpit 
        title="Sovereign Will" 
        description="Legislative Docket, Citizen Reputation & Constitutional Mandates"
        tabs={cockpitTabs}
        stats={[
           { label: 'Active Inhabitants', value: citizens.length.toString() },
           { label: 'Pending Consensus', value: proposals.length.toString(), color: 'text-purple-400' }
        ]}
        actions={[
           { label: 'Draft Emergency Veto', action: 'trigger_veto_override' },
           { label: 'Broadcast Manifesto', action: 'sync_roadmap_to_ledger' },
           { label: 'Issue DID Package', action: 'issue_citizen_did', params: { type: 'inhabitant' } }
        ]}
      />
    </div>
  );
}

function History({ className, ...props }: any) {
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
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="m12 7 0 5 3 3" />
    </svg>
  );
}
