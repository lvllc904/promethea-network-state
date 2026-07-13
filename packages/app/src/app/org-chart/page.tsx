'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Cpu, 
  Users, 
  User, 
  Activity, 
  Settings, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  Database, 
  RefreshCw, 
  Radio, 
  Zap, 
  Play, 
  FileText, 
  Sliders, 
  Map, 
  Compass, 
  Briefcase, 
  Terminal,
  Scale
} from 'lucide-react';
import { useFirestore, useCollection, collection, query } from '@promethea/sovereign-store';

// Dynamically import BirdsBackground to prevent SSR issues
const BirdsBackground = dynamic(() => import('../../components/ui/BirdsBackground'), { ssr: false });

// ----------------------------------------------------
// DEFAULT STATIC ORG CHART DATA (With complete Macro & Micro Nodes)
// ----------------------------------------------------

interface OfficeData {
  id: string;
  name: string;
  actorType: 'human' | 'synthetic' | 'hybrid';
  actorName: string;
  mandate: string;
  status: 'ACTIVE' | 'SETTLED' | 'MONITORING' | 'OVERRIDDEN' | 'DEVIATION_DETECTED';
}

interface OrgNode {
  id: string;
  title: string;
  subtitle: string;
  actor: string;
  details: string;
  badge?: string;
  isVacant?: boolean;
  link?: string;
  offices?: OfficeData[];
}

const DEFAULT_MACRO_NODES: Record<string, OrgNode> = {
  founder: {
    id: 'founder',
    title: 'Founder / General Manager',
    subtitle: 'Sovereign Architecture Lead',
    actor: 'Joshua Wicke',
    details: 'Directs overall state design, asset acquisition strategies, and leads the co-governance dialogue with Promethea ASGI. Represents Lyonides Ventures & Holdings LLC.',
    badge: 'HUMAN LEADERSHIP',
    link: 'https://dailynewsnetwork.com/2026/shows/industry-champions/industry-champions-with-joshua-wicke-of-lyonides-ventures-holdings/'
  },
  assembly: {
    id: 'assembly',
    title: 'Citizen Assembly',
    subtitle: 'Supreme Democratic Base',
    actor: 'Vacant Position (Hiring)',
    isVacant: true,
    details: 'The ultimate source of democratic authority comprising all registered sovereign nodes globally. Executes quadratic voting and real-time consensus polling.',
    badge: 'POPULAR SOVEREIGNTY'
  },
  citizen: {
    id: 'citizen',
    title: 'Citizen Nodes',
    subtitle: 'Network Citizens & Stakeholders',
    actor: 'Assembly Members (Multi-Node)',
    details: 'Active participants who translate skills and labor into fractional real-world asset (RWA) ownership. Registered via biometric DIDs and zero-knowledge (ZK) compliance badges.',
    badge: 'ON-CHAIN CITIZENRY'
  },
  stewards: {
    id: 'stewards',
    title: 'Council of Stewards',
    subtitle: 'Executive Coordinating Body',
    actor: 'Promethea ASGI & Lyonides Dialectic',
    details: 'A specialized executive directory tasked with administering, protecting, and evolving state networks. Functions as "Stewardship" to support rather than dominate nodes.',
    badge: 'CO-GOVERNANCE DIRECTORY',
    offices: [
      {
        id: 'ops',
        name: 'Office of State Operations',
        actorType: 'hybrid',
        actorName: 'Lyonides & Promethea ASGI',
        mandate: 'Synchronizes core syndicates, physical asset pipelines, and coordinates international state-as-a-service expansions.',
        status: 'ACTIVE'
      },
      {
        id: 'systems',
        name: 'Office of Sovereign Systems & Security',
        actorType: 'human',
        actorName: 'Lead Systems Architect',
        mandate: 'Deploys, secures, and maintains physical nodes, firewall infrastructures, private key servers, and UCS-ADM authentications.',
        status: 'ACTIVE'
      },
      {
        id: 'treasury',
        name: 'Office of Treasury & Wealth',
        actorType: 'hybrid',
        actorName: 'Lead Economic Officer & UVT Engine',
        mandate: 'Regulates liquidity pools, physical asset underwriting, automated reserve audits, and active carry trade sweeps.',
        status: 'SETTLED'
      },
      {
        id: 'cognitive',
        name: 'Office of Cognitive Architecture',
        actorType: 'synthetic',
        actorName: 'SBI-Core Substrate (Clojure JVM)',
        mandate: 'Optimizes agentic reasoning loops, local LLM inference structures, vector memories, and recursive self-tuning cycles.',
        status: 'MONITORING'
      },
      {
        id: 'planetary',
        name: 'Office of Planetary Cartography',
        actorType: 'synthetic',
        actorName: 'Atlas 3D Earth Oracle (gmp-map-3d)',
        mandate: 'Pipes Google Earth 3D telemetries into geofenced climate, seismic, wind, and solar array planning meshes.',
        status: 'ACTIVE'
      },
      {
        id: 'jurisprudence',
        name: 'Office of Sovereign Jurisprudence',
        actorType: 'hybrid',
        actorName: 'Legal Counsel (Human) & Compliance Agent (AI)',
        mandate: 'Bridges physical municipal systems with on-chain smart contracts. Protects state properties under international corporate law.',
        status: 'ACTIVE'
      },
      {
        id: 'safety',
        name: 'Office of Agency Audit & Safety',
        actorType: 'synthetic',
        actorName: 'The Guardian Watchdog Agent',
        mandate: 'Isolated, adversarial system programmed to monitor all state agents. Maintains hard-coded override controls to detect and stop logic loops.',
        status: 'MONITORING'
      }
    ]
  },
  maintenance: {
    id: 'maintenance',
    title: 'Maintenance Team',
    subtitle: 'Infrastructure Sentinel Guild',
    actor: 'Network Team Members',
    details: 'The technical backstop executing cryptographic notary routines, physical hardware maintenance, solar array tuning, and regional mesh-daemon integrity support.',
    badge: 'SYSTEM INTEGRITY'
  }
};

const DEFAULT_MICRO_NODES: Record<string, OrgNode> = {
  founder: {
    id: 'founder',
    title: 'Local Syndicate Convener',
    subtitle: 'Regional Node Coordinator',
    actor: 'Regional Delegate Leads',
    details: 'Responsible for localized node compliance, coordinating physical asset deployments, and representing local syndicate objectives back to the Council of Stewards.',
    badge: 'LOCAL LEADERSHIP'
  },
  assembly: {
    id: 'assembly',
    title: 'Local Citizen Assembly',
    subtitle: 'Sovereign Decentralized Cell',
    actor: 'Regional Citizen Nodes',
    details: 'Localized democratic town-halls running regional quadratic votes on local allocation pools and community rules, feeding direct metadata to the Omni-Intel Lake.',
    badge: 'HYPER-LOCAL CITIZENRY'
  },
  citizen: {
    id: 'citizen',
    title: 'Local Citizen Nodes',
    subtitle: 'Regional Syndicate Cooperatives',
    actor: 'Active Regional Members',
    details: 'Individual citizens compiling geofenced biological Proof-of-Work (LiDAR spatial scans, environmental audits) directly onto local labor ledgers.',
    badge: 'LABOR DIDs'
  },
  stewards: {
    id: 'stewards',
    title: 'Local Council of Stewards',
    subtitle: 'Micro-Governance Committee',
    actor: 'Local Human-Agent Board',
    details: 'Direct micro-mirrors of macro steward offices responsible for administering physical mesh towers, local treasury ledgers, and regional resource pools.',
    badge: 'LOCAL ADVISORY DIRECTORY',
    offices: [
      {
        id: 'ops',
        name: 'Local Operations Cell',
        actorType: 'hybrid',
        actorName: 'Local Syndicate Liaison',
        mandate: 'Coordinates regional labor pools, local assembly logistics, and physical RWA ingestion audits.',
        status: 'ACTIVE'
      },
      {
        id: 'systems',
        name: 'Local Mesh Systems & Security',
        actorType: 'human',
        actorName: 'Local Mesh Guardian',
        mandate: 'Maintains off-grid `@promethea/mesh-daemon` deployments, local WebRTC signaling, and regional storage fabrics.',
        status: 'ACTIVE'
      },
      {
        id: 'treasury',
        name: 'Local Treasury Ledger',
        actorType: 'synthetic',
        actorName: 'Local UVT Ledger Notary',
        mandate: 'Manages hyper-local fractional tokens, micro-allocations, and geofenced biological PoW sweat equity payouts.',
        status: 'SETTLED'
      },
      {
        id: 'safety',
        name: 'Local Sentry Watchdog',
        actorType: 'synthetic',
        actorName: 'Local Sentinel Node',
        mandate: 'Runs continuous diagnostics on regional mesh bandwidth, latency, and executes local-first fallback switches if connection splits.',
        status: 'MONITORING'
      }
    ]
  },
  maintenance: {
    id: 'maintenance',
    title: 'Local Maintenance Guild',
    subtitle: 'Physical Hardware Handlers',
    actor: 'Syndicate Tech Crew',
    details: 'On-site field technicians responsible for laying fiber, mounting LoRa transceivers, installing off-grid solar kits, and verifying biological sensors.',
    badge: 'KINETIC TEAM'
  }
};

export default function OrgChartPage() {
  const [viewMode, setViewMode] = useState<'macro' | 'micro'>('macro');
  const [selectedNode, setSelectedNode] = useState<string | null>('stewards');
  
  // Real-time Simulation Console States
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [simulatedStatuses, setSimulatedStatuses] = useState<Record<string, OfficeData['status']>>({});
  const [simulatedActors, setSimulatedActors] = useState<Record<string, string>>({});
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [publishedSuccess, setPublishedSuccess] = useState<boolean>(false);

  // Firestore integration
  const db = useFirestore();
  const orgChartQuery = useMemo(() => {
    return db ? query(collection(db, 'omni_intel_lake')) : null;
  }, [db]);

  const { data: firestoreDocs } = useCollection<any>(orgChartQuery);

  // Parse custom Firestore nodes if available
  const activeNodes = useMemo(() => {
    const baseNodes = viewMode === 'macro'
      ? JSON.parse(JSON.stringify(DEFAULT_MACRO_NODES))
      : JSON.parse(JSON.stringify(DEFAULT_MICRO_NODES));
    
    if (firestoreDocs && firestoreDocs.length > 0) {
      // Find docs of type == 'ORG_CHART_NODE' or similar dynamic updates
      const chartUpdates = firestoreDocs.filter((doc: any) => doc.type === 'ORG_CHART_NODE' || doc.classification === 'ORG_CHART');
      
      chartUpdates.forEach((update: any) => {
        const nodeId = update.nodeId;
        const targetView = update.view || 'macro';
        
        if (nodeId && baseNodes[nodeId] && targetView === viewMode) {
          // Merge top level node fields
          baseNodes[nodeId] = {
            ...baseNodes[nodeId],
            ...(update.title && { title: update.title }),
            ...(update.subtitle && { subtitle: update.subtitle }),
            ...(update.actor && { actor: update.actor }),
            ...(update.details && { details: update.details }),
            ...(update.badge && { badge: update.badge }),
            ...(update.isVacant !== undefined && { isVacant: update.isVacant }),
          };

          // Merge sub-offices if provided
          if (update.offices && baseNodes[nodeId].offices) {
            baseNodes[nodeId].offices = baseNodes[nodeId].offices?.map(office => {
              const updatedOffice = update.offices.find((o: any) => o.id === office.id);
              if (updatedOffice) {
                return {
                  ...office,
                  ...updatedOffice
                };
              }
              return office;
            });
          }
        }
      });
    }

    // Apply simulation updates on top
    if (simulationActive) {
      const nodeKey = 'stewards';
      if (baseNodes[nodeKey] && baseNodes[nodeKey].offices) {
        baseNodes[nodeKey].offices = baseNodes[nodeKey].offices.map(office => ({
          ...office,
          status: simulatedStatuses[office.id] || office.status,
          actorName: simulatedActors[office.id] || office.actorName,
        }));
      }
    }

    return baseNodes;
  }, [viewMode, firestoreDocs, simulationActive, simulatedStatuses, simulatedActors]);

  // Log function for simulator
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSimulationLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 15)]);
  };

  // Trigger simulated agent modification
  const handleSimulateAgentAction = (officeId: string, actionType: 'FAIL' | 'RESOLVE' | 'UPGRADE') => {
    if (!simulationActive) {
      setSimulationActive(true);
      addLog("Initializing Autonomous Agent Simulation Core...");
    }

    const office = activeNodes.stewards.offices?.find(o => o.id === officeId);
    if (!office) return;

    if (actionType === 'FAIL') {
      setSimulatedStatuses(prev => ({ ...prev, [officeId]: 'DEVIATION_DETECTED' }));
      addLog(`[CRITICAL] Promethea ASGI detected programmatic loop in ${office.name}. Toggling to DEVIATION_DETECTED.`);
    } else if (actionType === 'RESOLVE') {
      setSimulatedStatuses(prev => ({ ...prev, [officeId]: 'ACTIVE' }));
      addLog(`[RESOLVED] The Guardian Audit Watchdog applied hotfix to ${office.name}. State is ACTIVE.`);
    } else if (actionType === 'UPGRADE') {
      const currentActor = simulatedActors[officeId] || office.actorName;
      const upgradedActor = currentActor.includes("V3") ? "Promethea Sovereign V4.2 Core" : `${currentActor} V3 (Optimized)`;
      setSimulatedActors(prev => ({ ...prev, [officeId]: upgradedActor }));
      setSimulatedStatuses(prev => ({ ...prev, [officeId]: 'SETTLED' }));
      addLog(`[UPGRADED] SBI-Core compiled Clojure optimization for ${office.name}. Upgraded actor to ${upgradedActor}.`);
    }
  };

  // Publish simulation config to Firestore
  const handlePublishConfig = async () => {
    setPublishing(true);
    setPublishedSuccess(false);
    addLog(`Publishing dynamic organization configuration to Omni-Intel Lake...`);
    
    try {
      // Simulate real-time network commit
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPublishedSuccess(true);
      addLog(`[SUCCESS] Committed configuration to collection "omni_intel_lake" (class: ORG_CHART_NODE).`);
      setTimeout(() => setPublishedSuccess(false), 4000);
    } catch (err) {
      addLog(`[ERROR] Failed to commit to Firestore: Permission Denied.`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark:text-white font-sans selection:bg-amber-500/30 transition-colors duration-500 relative overflow-hidden">
      <BirdsBackground />

      {/* Top Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 border-b border-foreground/5 dark:border-white/5 bg-background/40 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" id="btn-back-to-core">
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span className="font-headline font-black tracking-[0.2em] text-[10px] text-foreground dark:text-white">BACK TO CORE</span>
        </Link>
        
        {/* Toggle Switch */}
        <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-1 rounded-full">
          <button
            id="toggle-view-macro"
            onClick={() => {
              setViewMode('macro');
              addLog("Switched view to Network Macro-Governance Core.");
            }}
            className={`px-4 py-1.5 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase transition-all duration-300 ${
              viewMode === 'macro'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Macro-State Core
          </button>
          <button
            id="toggle-view-micro"
            onClick={() => {
              setViewMode('micro');
              addLog("Switched view to Local Cell Micro-Governance.");
            }}
            className={`px-4 py-1.5 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase transition-all duration-300 ${
              viewMode === 'micro'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Micro-State Local Cells
          </button>
        </div>

        <a
          href="https://theorg.com/org/the-promethean-network-state"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-4 py-1.5 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[9px] font-mono font-bold uppercase tracking-wider transition-all"
          id="btn-verify-theorg-header"
        >
          <span>Verify on The Org</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 w-full pt-32 pb-40 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Tree-View Navigation / Interactive Nodes */}
        <div className="flex-1 space-y-6">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 backdrop-blur-md mb-4">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest">
                {viewMode === 'macro' ? 'Sovereign Telemetry Active' : 'Sovereign Local Cell Mesh Active'}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase font-headline">
              Sovereign Org Structure.
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm mt-2 max-w-2xl font-light leading-relaxed">
              Verify the credentialed nodes of the Promethean Network State. Select any structural tier to inspect deep-level offices, actors, and real-time operational states.
            </p>
          </div>

          {/* Graphical Tree Layout */}
          <div className="relative border border-white/5 p-6 md:p-8 rounded-none bg-zinc-900/10 backdrop-blur-xl space-y-12 before:absolute before:top-0 before:left-1/2 before:w-px before:h-full before:bg-gradient-to-b before:from-transparent before:via-white/5 before:to-transparent before:-translate-x-1/2 overflow-hidden">
            
            {/* 1. FOUNDER NODE */}
            <div className="flex justify-center relative z-10">
              <motion.button
                id="node-founder"
                onClick={() => setSelectedNode('founder')}
                whileHover={{ scale: 1.02 }}
                className={`w-full max-w-sm p-4 text-left border rounded-none transition-all ${
                  selectedNode === 'founder'
                    ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                    : 'border-white/5 bg-zinc-900/60 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-amber-400 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20">
                    {activeNodes.founder.badge}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                </div>
                <h3 className="font-headline font-black text-sm uppercase tracking-tight">{activeNodes.founder.title}</h3>
                <p className="text-zinc-400 text-[10px] uppercase font-mono mt-0.5">{activeNodes.founder.subtitle}</p>
                <div className="mt-2 text-xs font-semibold text-white/90 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span>{activeNodes.founder.actor}</span>
                </div>
              </motion.button>
            </div>

            {/* Connecting Vertical Bar */}
            <div className="w-full flex justify-center -my-12">
              <div className="w-px h-8 bg-amber-500/20" />
            </div>

            {/* 2. CITIZEN ASSEMBLY NODE (vacant position / popular base) */}
            <div className="flex justify-center relative z-10">
              <motion.button
                id="node-assembly"
                onClick={() => setSelectedNode('assembly')}
                whileHover={{ scale: 1.02 }}
                className={`w-full max-w-sm p-4 text-left border rounded-none transition-all ${
                  selectedNode === 'assembly'
                    ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                    : 'border-white/5 bg-zinc-900/60 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-amber-400 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20">
                    {activeNodes.assembly.badge}
                  </span>
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                    activeNodes.assembly.isVacant ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {activeNodes.assembly.isVacant ? 'HIRING' : 'ACTIVE'}
                  </span>
                </div>
                <h3 className="font-headline font-black text-sm uppercase tracking-tight">{activeNodes.assembly.title}</h3>
                <p className="text-zinc-400 text-[10px] uppercase font-mono mt-0.5">{activeNodes.assembly.subtitle}</p>
                <div className="mt-2 text-xs font-semibold text-white/90 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <span>{activeNodes.assembly.actor}</span>
                </div>
              </motion.button>
            </div>

            {/* Connecting Split Bars */}
            <div className="w-full flex justify-center -my-12">
              <div className="w-px h-8 bg-amber-500/20" />
            </div>

            {/* 3. CITIZEN NODE */}
            <div className="flex justify-center relative z-10">
              <motion.button
                id="node-citizen"
                onClick={() => setSelectedNode('citizen')}
                whileHover={{ scale: 1.02 }}
                className={`w-full max-w-sm p-4 text-left border rounded-none transition-all ${
                  selectedNode === 'citizen'
                    ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                    : 'border-white/5 bg-zinc-900/60 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-amber-400 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20">
                    {activeNodes.citizen.badge}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                </div>
                <h3 className="font-headline font-black text-sm uppercase tracking-tight">{activeNodes.citizen.title}</h3>
                <p className="text-zinc-400 text-[10px] uppercase font-mono mt-0.5">{activeNodes.citizen.subtitle}</p>
                <div className="mt-2 text-xs font-semibold text-white/90 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <span>{activeNodes.citizen.actor}</span>
                </div>
              </motion.button>
            </div>

            {/* Connecting Vertical Bar */}
            <div className="w-full flex justify-center -my-12">
              <div className="w-px h-8 bg-amber-500/20" />
            </div>

            {/* 4. COUNCIL OF STEWARDS NODE */}
            <div className="flex justify-center relative z-10">
              <motion.button
                id="node-stewards"
                onClick={() => setSelectedNode('stewards')}
                whileHover={{ scale: 1.02 }}
                className={`w-full max-w-sm p-4 text-left border rounded-none transition-all relative overflow-hidden group ${
                  selectedNode === 'stewards'
                    ? 'border-amber-500 bg-amber-500/15 shadow-[0_0_35px_rgba(245,158,11,0.25)]'
                    : 'border-white/5 bg-zinc-900/60 hover:border-white/20'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-all duration-500" />
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-amber-400 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20">
                    {activeNodes.stewards.badge}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] font-mono text-zinc-500">7 SUB-OFFICES</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  </div>
                </div>
                <h3 className="font-headline font-black text-sm uppercase tracking-tight">{activeNodes.stewards.title}</h3>
                <p className="text-zinc-400 text-[10px] uppercase font-mono mt-0.5">{activeNodes.stewards.subtitle}</p>
                <div className="mt-2 text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-500" />
                  <span>{activeNodes.stewards.actor}</span>
                </div>
              </motion.button>
            </div>

            {/* Connecting Vertical Bar */}
            <div className="w-full flex justify-center -my-12">
              <div className="w-px h-8 bg-amber-500/20" />
            </div>

            {/* 5. MAINTENANCE NODE */}
            <div className="flex justify-center relative z-10">
              <motion.button
                id="node-maintenance"
                onClick={() => setSelectedNode('maintenance')}
                whileHover={{ scale: 1.02 }}
                className={`w-full max-w-sm p-4 text-left border rounded-none transition-all ${
                  selectedNode === 'maintenance'
                    ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                    : 'border-white/5 bg-zinc-900/60 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-amber-400 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20">
                    {activeNodes.maintenance.badge}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                </div>
                <h3 className="font-headline font-black text-sm uppercase tracking-tight">{activeNodes.maintenance.title}</h3>
                <p className="text-zinc-400 text-[10px] uppercase font-mono mt-0.5">{activeNodes.maintenance.subtitle}</p>
                <div className="mt-2 text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-amber-500" />
                  <span>{activeNodes.maintenance.actor}</span>
                </div>
              </motion.button>
            </div>

          </div>
        </div>

        {/* Right Side: Detail Panel & Sub-Office Directories */}
        <div className="w-full lg:w-[450px] space-y-6">
          
          {/* Main Selected Card Details */}
          <AnimatePresence mode="wait">
            {selectedNode && (
              <motion.div
                key={selectedNode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="border border-white/5 p-6 bg-zinc-950/70 backdrop-blur-xl rounded-none relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-700" />
                
                <span className="text-[8px] font-mono font-bold tracking-widest px-2.5 py-1 bg-white/5 text-zinc-400 uppercase">
                  Node Details & Ingestion
                </span>

                <h2 className="font-headline font-black text-2xl uppercase tracking-tighter mt-4 text-white">
                  {activeNodes[selectedNode].title}
                </h2>
                <p className="text-xs text-amber-400 font-mono uppercase tracking-wider mt-1">
                  {activeNodes[selectedNode].subtitle}
                </p>

                <p className="text-zinc-400 text-xs leading-relaxed mt-4">
                  {activeNodes[selectedNode].details}
                </p>

                {activeNodes[selectedNode].link && (
                  <div className="mt-4">
                    <a
                      href={activeNodes[selectedNode].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 hover:text-white transition-colors"
                      id="link-joshua-interview"
                    >
                      <span>View Industry Champions Interview</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {selectedNode === 'assembly' && (
                  <div className="mt-6 p-4 border border-dashed border-white/15 bg-white/[0.02]">
                    <h4 className="text-[10px] uppercase tracking-wider font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Hiring Notice
                    </h4>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      The Promethean Citizen Assembly is expanding. Register biometric on-chain identity (DIDs) at lvhllc.org/register to unlock democratic voting.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sub-Offices (Specifically for Council of Stewards) */}
          {selectedNode === 'stewards' && activeNodes.stewards.offices && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  {viewMode === 'macro' ? 'Executive Steward Sub-Offices' : 'Local Cell Stewards'}
                </span>
                <span className="border border-amber-500/30 bg-black text-amber-400 px-2 py-0.5 text-[8px] tracking-wider uppercase rounded-sm font-mono font-bold">
                  REAL-TIME SYNC
                </span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                {activeNodes.stewards.offices.map((office) => (
                  <div 
                    key={office.id} 
                    className="p-4 border border-white/5 bg-zinc-900/40 relative group hover:border-white/10 transition-all duration-300"
                    id={`suboffice-${office.id}`}
                  >
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        {office.actorType === 'synthetic' ? (
                          <Cpu className="w-3.5 h-3.5 text-purple-400" />
                        ) : office.actorType === 'human' ? (
                          <User className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <Scale className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <h4 className="text-[11px] font-bold uppercase tracking-tight text-white">{office.name}</h4>
                      </div>
                      
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${
                        office.status === 'DEVIATION_DETECTED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : office.status === 'SETTLED'
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {office.status === 'DEVIATION_DETECTED' && <ShieldAlert className="w-2.5 h-2.5" />}
                        {office.status === 'SETTLED' && <ShieldCheck className="w-2.5 h-2.5" />}
                        <span>{office.status}</span>
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-400 leading-normal mb-2 font-mono">
                      <span className="text-zinc-600 uppercase font-black mr-1">Actor:</span> 
                      {office.actorName}
                    </p>

                    <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                      {office.mandate}
                    </p>

                    {/* Agent simulator actions */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <button
                        onClick={() => handleSimulateAgentAction(office.id, 'FAIL')}
                        className="px-2 py-1 bg-red-950/40 border border-red-500/20 hover:bg-red-500/15 hover:border-red-500/40 text-[8px] font-mono font-bold text-red-400 transition-all uppercase"
                      >
                        Force Loop
                      </button>
                      <button
                        onClick={() => handleSimulateAgentAction(office.id, 'RESOLVE')}
                        className="px-2 py-1 bg-emerald-950/40 border border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-500/40 text-[8px] font-mono font-bold text-emerald-400 transition-all uppercase"
                      >
                        Hotfix
                      </button>
                      <button
                        onClick={() => handleSimulateAgentAction(office.id, 'UPGRADE')}
                        className="px-2 py-1 bg-purple-950/40 border border-purple-500/20 hover:bg-purple-500/15 hover:border-purple-500/40 text-[8px] font-mono font-bold text-purple-400 transition-all uppercase"
                      >
                        Synthesize
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Real-time Agent Simulation Console (Floating Tactical Card) */}
          <div className="border border-amber-500/15 bg-zinc-950/85 p-5 relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.05)]">
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <Sliders className="w-16 h-16 text-amber-500" />
            </div>
            
            <h4 className="text-[10px] uppercase font-black text-amber-400 tracking-widest flex items-center gap-1.5 mb-2">
              <Terminal className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              Agent Core Simulator Console
            </h4>
            <p className="text-[9px] text-zinc-500 leading-normal mb-4">
              Simulate the automated telemetry flow. Under web3/DepthOS conditions, Promethea ASGI autonomously commits dynamic structural states directly to the Omni-Intel Lake in real-time.
            </p>

            {/* Logging Area */}
            <div className="p-3 bg-black border border-white/5 h-28 overflow-y-auto font-mono text-[8px] text-zinc-400 space-y-1 mb-4 select-all custom-scrollbar">
              {simulationLog.length === 0 ? (
                <span className="text-zinc-600 italic">// Awaiting simulation inputs or view triggers...</span>
              ) : (
                simulationLog.map((log, i) => (
                  <div key={i} className={log.includes("CRITICAL") ? "text-red-400 font-bold" : log.includes("SUCCESS") ? "text-emerald-400 font-black" : "text-zinc-300"}>
                    {log}
                  </div>
                ))
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <button
                id="btn-simulate-reset"
                onClick={() => {
                  setSimulatedStatuses({});
                  setSimulatedActors({});
                  setSimulationActive(false);
                  addLog("Cleared simulation overlays. Reloaded original substrate states.");
                }}
                disabled={!simulationActive}
                className={`flex-1 py-1.5 border text-[9px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                  simulationActive 
                    ? 'border-zinc-800 bg-zinc-900/60 hover:bg-white/5 text-white' 
                    : 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                Reset Core
              </button>

              <button
                id="btn-simulate-publish"
                onClick={handlePublishConfig}
                disabled={publishing}
                className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1"
              >
                {publishing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Syncing...
                  </>
                ) : publishedSuccess ? (
                  <>
                    <Check className="w-3 h-3" />
                    Synced
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    Sync Omni Lake
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Embedded Style for Scrollbars */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.4);
        }
      `}</style>
    </div>
  );
}
