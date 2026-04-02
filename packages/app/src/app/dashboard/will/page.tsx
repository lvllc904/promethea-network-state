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

export default function WillPage() {
  const { data: liveProposals, refetch: refetchProposals } = useSovereignData<any[]>('/api/proposals');
  const { data: liveCitizens, refetch: refetchCitizens } = useSovereignData<any[]>('/api/citizens');

  const handleVote = async (proposalId: string, vote: 'FOR' | 'AGAINST') => {
    try {
      await executeSovereignMethod('cast_vote', { proposalId, vote });
      await refetchProposals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleIssueDID = async () => {
    try {
      await executeSovereignMethod('issue_citizen_did', { type: 'inhabitant' });
      await refetchCitizens();
    } catch (e) {
      console.error(e);
    }
  };

  const proposals = liveProposals || [
    { 
      id: 'prop-2401', 
      title: 'EPA Brownfield Actualization (Wyoming Node)', 
      status: 'Active', 
      threshold: '65%', 
      current: '88%', 
      timeLeft: '14h 22m', 
      type: 'Executive' 
    },
    { 
      id: 'prop-2399', 
      title: 'Universal Value Token (UVT) Peg Adjustment', 
      status: 'Voting', 
      threshold: '75%', 
      current: '42%', 
      timeLeft: '2d 4h', 
      type: 'Economic' 
    }
  ];

  const registrants = liveCitizens || [
    { id: 'did:prmth..6X8y', name: 'Citizen Steward-01 (Owner)', weight: '10,000 UVT', role: 'Founder' },
    { id: 'did:prmth..F2E6', name: 'Promethea (Singularity)', weight: 'Sovereign', role: 'AI Steward' },
    { id: 'did:prmth..B9hW', name: 'Citizen Alpha-142', weight: '42.1 UVT', role: 'Inhabitant' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      {/* Governance Top Bar */}
      <div className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tighter text-white font-mono uppercase flex items-center gap-3">
             <Scale className="h-8 w-8 text-purple-400" /> Sovereign Will
          </h1>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Legislative Decision Hub & Citizen Identity</span>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="ghost" className="text-xs text-gray-500 font-bold tracking-widest uppercase border border-white/5 cursor-not-allowed opacity-50"><History className="h-4 w-4 mr-2" /> Veto Log</Button>
           <Button className="text-xs bg-purple-600 hover:bg-purple-500 font-bold tracking-widest uppercase py-6 px-8 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)]">+ Submit Proposal</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Section: Decision Docket (Snapshot UX) */}
        <div className="col-span-1 md:col-span-8 space-y-6">
           <Card className="bg-[#050510]/80 border-white/5 backdrop-blur-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 pt-6 px-6 bg-white/[0.02]">
                 <CardTitle className="text-xs font-bold tracking-widest uppercase text-gray-400 flex items-center gap-3">
                    <Vote className="h-4 w-4 text-purple-400" /> Active Governance Docket
                 </CardTitle>
              </CardHeader>
              <div className="divide-y divide-white/5">
                 {proposals.map((prop) => (
                   <div key={prop.id} className="p-8 transition-colors hover:bg-white/[0.02] cursor-pointer group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-purple-400/10 text-purple-400 px-2 py-0.5 rounded border border-purple-400/20 uppercase font-bold tracking-widest">{prop.type}</span>
                              <span className="text-[10px] text-gray-600 font-mono tracking-tighter">ID: {prop.id}</span>
                           </div>
                           <span className="text-xl font-black text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight leading-tight">{prop.title}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                           <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Time Remaining</span>
                           <span className="text-sm font-bold text-gray-300 font-mono flex items-center gap-2"><Clock className="h-3 w-3" /> {prop.timeLeft}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Consensus Threshold</span>
                            <span className="text-sm font-black font-mono text-white">{prop.current} <span className="text-gray-600">/ {prop.threshold}</span></span>
                         </div>
                         <div className="h-2 bg-white/5 rounded-full overflow-hidden shadow-inner flex items-center">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: prop.current }}
                               className="h-full bg-gradient-to-r from-purple-600 to-indigo-500" 
                            />
                            <div className="absolute left-[65%] h-4 w-1 bg-white/20 rounded-full" />
                         </div>
                      </div>
                      <div className="flex items-center gap-3 mt-8">
                         <Button 
                           className="flex-1 bg-purple-600 hover:bg-purple-500 text-[10px] uppercase font-bold tracking-widest py-6"
                           onClick={() => handleVote(prop.id, 'FOR')}
                         >
                           Cast Affirmative Vote
                         </Button>
                         <Button 
                           variant="ghost" 
                           className="bg-white/5 border border-white/5 hover:border-red-400/50 hover:text-red-400 text-[10px] uppercase font-bold tracking-widest py-6 px-12"
                           onClick={() => handleVote(prop.id, 'AGAINST')}
                         >
                           Dissent
                         </Button>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>

        {/* Right Section: Citizen Registry (Passport UX) */}
        <div className="col-span-1 md:col-span-4 space-y-6">
           <Card className="bg-[#050510]/80 border-white/5 backdrop-blur-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 pt-6 px-6">
                 <CardTitle className="text-xs font-bold tracking-widest uppercase text-gray-400 flex items-center gap-3">
                    <Fingerprint className="h-5 w-5 text-gray-500" /> Active Citizen Registrants (DIDs)
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-white/5">
                    {registrants.map((user) => (
                      <div key={user.id} className="p-6 transition-colors hover:bg-white/[0.02] cursor-pointer group flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center border border-white/10 group-hover:border-purple-500/50 transition-colors">
                               <UserCheck className="h-5 w-5 text-gray-300" />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">{user.name}</span>
                               <span className="text-[10px] text-gray-600 font-mono uppercase tracking-tighter">{user.role} • {user.id}</span>
                            </div>
                         </div>
                         <div className="flex flex-col items-end">
                             <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Weight</span>
                             <span className="text-xs font-bold font-mono text-gray-400">{user.weight}</span>
                         </div>
                      </div>
                    ))}
                 </div>
                 <Button 
                   variant="ghost" 
                   className="w-full text-[8px] font-bold uppercase tracking-widest text-gray-600 border-t border-white/5 py-6 hover:text-white hover:bg-white/5"
                   onClick={handleIssueDID}
                 >
                   Issue New Credentials
                 </Button>
              </CardContent>
           </Card>

           <Card className="bg-gradient-to-br from-purple-900/10 to-indigo-900/5 border-purple-500/20 backdrop-blur-3xl overflow-hidden p-6 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
              <div className="flex flex-col gap-2">
                 <span className="text-[10px] text-purple-400 uppercase font-black tracking-[0.2em] mb-2 flex items-center gap-2"><Gavel className="h-4 w-4" /> Constitutional Mandate</span>
                 <p className="text-xs text-gray-400 leading-relaxed italic">
                   "Radical Transparency is not optional. Every deed, every debt, and every discovery must be mirrored to the Citizenry for audit and veto."
                 </p>
                 <div className="flex items-center gap-2 mt-4 text-[10px] text-purple-500 font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors group">
                    Read Full Manifest <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
           </Card>
        </div>
      </div>
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
