'use client';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  Smartphone,
  BookCopy,
  Users,
  Handshake,
  Landmark,
  Rocket,
  Scaling,
  Globe,
  Megaphone,
  CheckCircle,
  FileText,
  BrainCircuit,
  ShieldCheck,
  Milestone,
  ArrowRight,
  Download,
  Copy,
  Check,
  ExternalLink,
  History,
  FileCode,
  Sparkles,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@promethea/ui';
import { Badge } from '@promethea/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@promethea/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Link from 'next/link';
import { Button } from '@promethea/ui';
import { cn } from '@promethea/lib';
import { Progress } from '@promethea/ui';

// --- Data ---
const aumData = [
  { name: 'Year 1', aum: 50, color: 'hsl(var(--muted))' },
  { name: 'Year 2', aum: 200, color: 'hsl(var(--secondary))' },
  { name: 'Year 3', aum: 500, color: 'hsl(var(--primary))' },
];

const threeBodySystem = [
  {
    icon: KeyRound,
    title: 'Identity Genesis',
    description: 'Where your secure Passport is minted using traditional credentials as a one-time on-ramp.',
  },
  {
    icon: Smartphone,
    title: 'Sovereign Substrate',
    description: "Zero-Firebase architecture using local SQLite, bridged instantly to public GCS/IPFS for radical transparency.",
  },
  {
    icon: BookCopy,
    title: 'Ledger of Record',
    description: 'The public log of actions, ensuring security and transparency without storing your personal data.',
  },
];

const sevenSteps = [
  { icon: Rocket, step: 1, title: 'Found a Startup Society', kpi: '10,000+ members sign the social contract.', status: 'Completed' },
  { icon: Users, step: 2, title: 'Organize a Network Union', kpi: 'First asset proposal passes a DAC vote.', status: 'In Progress' },
  { icon: Handshake, step: 3, title: 'Build Trust & Cryptoeconomy', kpi: 'First asset generates cash flow, profits distributed via smart contract.', status: 'Not Started' },
  { icon: Landmark, step: 4, title: 'Crowdfund Physical Nodes', kpi: 'First asset fully funded and legally acquired by a DAO-controlled SPV.', status: 'Not Started' },
  { icon: Scaling, step: 5, title: 'Connect the Archipelago', kpi: '10+ properties on 3+ continents managed via the dashboard.', status: 'Not Started' },
  { icon: Megaphone, step: 6, title: 'Conduct On-Chain Census', kpi: 'Census data integrated with third-party aggregators for public verification.', status: 'Not Started' },
  { icon: Globe, step: 7, title: 'Gain Diplomatic Recognition', kpi: 'The DAC is legally recognized as a governing entity for a physical territory.', status: 'Not Started' },
];

interface AuditItem {
  type: string;
  el: string;
  status: 'Complete' | 'In Progress' | 'Planned';
  cat: string;
  phase: string;
  pillar: string;
  phaseGroup: string;
}

const initialAuditItems: AuditItem[] = [
  { type: "Finance", el: "Cap Table", status: "Complete", cat: "Economic", phase: "Phase 2.5", pillar: "🏛️ Treasury", phaseGroup: "Phase 2" },
  { type: "Finance", el: "Pro Forma Reports", status: "Complete", cat: "Economic", phase: "Phase 3.1", pillar: "🏛️ Treasury", phaseGroup: "Phase 3" },
  { type: "Finance", el: "Contribution Records", status: "Complete", cat: "Labor", phase: "Phase 4.1", pillar: "🏛️ Treasury", phaseGroup: "Phase 4" },
  { type: "Finance", el: "Payment Distribution", status: "Complete", cat: "Ledger", phase: "Phase 3.5", pillar: "🏛️ Treasury", phaseGroup: "Phase 3" },
  { type: "Finance", el: "Reserve Manager", status: "Complete", cat: "Treasury", phase: "Phase 3.1", pillar: "🏛️ Treasury", phaseGroup: "Phase 3" },
  { type: "Finance", el: "Dynamic Gas Oracles", status: "Complete", cat: "Economic", phase: "Phase 4.0", pillar: "🏛️ Treasury", phaseGroup: "Phase 4" },
  { type: "Settlement", el: "Solana SPL Bridge", status: "Complete", cat: "Blockchain", phase: "Wave 1", pillar: "🏛️ Treasury", phaseGroup: "Phase 0-1" },
  { type: "Governance", el: "Reputation Voting", status: "Complete", cat: "Legislative", phase: "Wave 3", pillar: "🗳️ Will", phaseGroup: "Phase 2" },
  { type: "Governance", el: "Quadratic Voting UI", status: "Complete", cat: "Interface", phase: "Wave 3", pillar: "🗳️ Will", phaseGroup: "Phase 2" },
  { type: "Exchange", el: "22 Economic Methods", status: "Complete", cat: "Revenue", phase: "Phase 3.1", pillar: "🛒 Exchange", phaseGroup: "Phase 3" },
  { type: "Exchange", el: "Live Narrative Sync", status: "Complete", cat: "Media", phase: "Phase 3.1", pillar: "🛒 Exchange", phaseGroup: "Phase 3" },
  { type: "Exchange", el: "AI Voice Synthesis", status: "Complete", cat: "Media", phase: "Wave 4", pillar: "🛒 Exchange", phaseGroup: "Phase 2" },
  { type: "Exchange", el: "Exchange DEX Hub", status: "Complete", cat: "Economic", phase: "Phase 3.5", pillar: "🛒 Exchange", phaseGroup: "Phase 3" },
  { type: "Data", el: "Zero-Firebase Substrate", status: "Complete", cat: "Infrastructure", phase: "Phase 2.4", pillar: "🛡️ Immune System", phaseGroup: "Phase 0-1" },
  { type: "Security", el: "Log Sanitization", status: "Complete", cat: "Defense", phase: "Phase 6.1", pillar: "🛡️ Immune System", phaseGroup: "Phase 6" },
  { type: "Security", el: "Threat Detection", status: "Complete", cat: "Defense", phase: "Wave 4", pillar: "🛡️ Immune System", phaseGroup: "Phase 6" },
  { type: "Security", el: "Metabolic Sensing", status: "Complete", cat: "Health", phase: "Phase 2.1", pillar: "🛡️ Immune System", phaseGroup: "Phase 0-1" },
  { type: "Security", el: "Identity (SSI/DID)", status: "Complete", cat: "Identity", phase: "Phase 2.4", pillar: "🛡️ Immune System", phaseGroup: "Phase 0-1" },
  { type: "Core UI", el: "Reality Boundary Glows", status: "Complete", cat: "Interface", phase: "Phase 6.1", pillar: "👁️ Pulse", phaseGroup: "Phase 6" },
  { type: "Core UI", el: "Scholarly LaTeX & Premium Citadel Themes", status: "Complete", cat: "Interface", phase: "Wave 18", pillar: "👁️ Pulse", phaseGroup: "Phase 6" },
  { type: "Finance", el: "Compute Credit Tokens (CCT)", status: "In Progress", cat: "Tokenomics", phase: "Wave 10", pillar: "🛒 Exchange", phaseGroup: "Phase 6" },
  { type: "Governance", el: "Grant Automation", status: "In Progress", cat: "Executive", phase: "Phase 4.0", pillar: "🗳️ Will", phaseGroup: "Phase 4" },
  { type: "Exchange", el: "50 Method Scale-up", status: "In Progress", cat: "Revenue", phase: "Wave 4", pillar: "🛒 Exchange", phaseGroup: "Phase 3" },
  { type: "Sovereignty", el: "Canonical RWA 'Draft-to-Deed' Flow", status: "Planned", cat: "Legal Tech", phase: "Wave 16", pillar: "🛒 Exchange", phaseGroup: "Phase 6" },
];

const changelogData = [
  { version: "v5.0.0", date: "June 2026", title: "HUD Restoration & Programmatic GCP Hardening", desc: "Standardized on-demand transactional signature gating, restricted GCP proxy keys, migrated production runner base to node:20-slim to resolve native SIGSEGV container crashes, and committed local edge daemons with fallback mocks.", status: "Latest" },
  { version: "v1.6.0-Alpha", date: "June 2026", title: "Always-On Progressive Hydration & WASM Gating Hardening", desc: "Enforcing rapid 3-second timeouts, fail-silent high-fidelity mock fallbacks, GCLB HTML payload rejection, and magic-number validation to prevent gateway 503 errors.", status: "Released" },
  { version: "v1.5.0-Alpha", date: "June 2026", title: "Scholarly Theme & Premium Citadel Upgrades", desc: "Successfully deployed the EB Garamond LaTeX Scholarly Light theme, edge-to-edge Citadel Dark Mode refactors with live chromatic glows, and the optimized 400 micro-boid flock Canvas.", status: "Released" },
  { version: "v1.2.0-Alpha", date: "June 2026", title: "Noospheric Systems Blueprint Published", desc: "Formulated the mathematical proofs for Dissolution of Decentralized Structural Asymmetry and integrated the interactive Sovereignty Coefficient Calculator.", status: "Released" },
  { version: "v1.1.5-Beta", date: "May 2026", title: "Ecosystem Core Docs & Guides Refined", desc: "Completed Socratic guides, Quickstart scripts, and high-fidelity installation workflows for Sovereign Mesh, Cartographer, ASGI, Atlas, and DepthOS.", status: "Released" },
  { version: "v1.1.0", date: "April 2026", title: "Zero-Firebase local-first SQLite Substrate", desc: "Integrated the client-side SQL data synchronizer with autonomous secure backups onto distributed IPFS storage layers.", status: "Released" },
  { version: "v1.0.2", date: "March 2026", title: "SPL Solana Settlement Bridge", desc: "Engineered high-throughput ledger bridges for decentralized treasury operations and automated real-time gas oracles.", status: "Released" },
];

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

const lineVariants = {
  hidden: { pathLength: 0 },
  visible: { pathLength: 1, transition: { duration: 1, ease: "easeInOut" } }
};

// --- Components ---
const AnimatedSection = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={cn("py-12 md:py-20", className)}
    >
      {children}
    </motion.section>
  );
};

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <motion.div variants={itemVariants} className="text-center mb-12">
    <h2 className="text-3xl md:text-4xl font-headline font-bold">{title}</h2>
    <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
      {subtitle}
    </p>
  </motion.div>
);

// --- Page ---
export default function RoadmapPage() {
  const [auditItems, setAuditItems] = useState<AuditItem[]>(initialAuditItems);
  const [panelTab, setPanelTab] = useState<'changelog' | 'presskit'>('changelog');
  const [copiedPress, setCopiedPress] = useState(false);

  // Cycle item status
  const cycleStatus = (index: number) => {
    setAuditItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const statuses: AuditItem['status'][] = ['Complete', 'In Progress', 'Planned'];
      const nextIdx = (statuses.indexOf(item.status) + 1) % statuses.length;
      return { ...item, status: statuses[nextIdx] };
    }));
  };

  // Define phases
  const phasesList = [
    { id: 'Phase 0-1', name: 'Phase 0-1: Foundation & Identity', color: 'bg-amber-500' },
    { id: 'Phase 2', name: 'Phase 2: Cognitive Alignment', color: 'bg-amber-500' },
    { id: 'Phase 3', name: 'Phase 3: Economic Sovereignty', color: 'bg-amber-400' },
    { id: 'Phase 4', name: 'Phase 4: The Economic Constitution', color: 'bg-amber-400' },
    { id: 'Phase 6', name: 'Phase 6: Sovereign Hardening', color: 'bg-amber-500' },
  ];

  // Dynamic progress computation
  const computedProgressData = phasesList.map(phase => {
    const itemsInPhase = auditItems.filter(item => item.phaseGroup === phase.id);
    const completedCount = itemsInPhase.filter(item => item.status === 'Complete').length;
    const inProgressCount = itemsInPhase.filter(item => item.status === 'In Progress').length;
    const totalCount = itemsInPhase.length;
    const progress = totalCount > 0
      ? Math.round(((completedCount + inProgressCount * 0.5) / totalCount) * 100)
      : 0;

    let status = 'Planned';
    if (progress === 100) status = 'Complete';
    else if (progress > 0) status = 'Active';

    return {
      name: phase.name,
      progress,
      status,
      color: phase.color,
    };
  });

  // Dynamic health score computation
  const totalItems = auditItems.length;
  const completedItems = auditItems.filter(item => item.status === 'Complete').length;
  const inProgressItems = auditItems.filter(item => item.status === 'In Progress').length;
  const dynamicHealthScore = totalItems > 0
    ? Math.round(((completedItems + inProgressItems * 0.5) / totalItems) * 100)
    : 0;

  const handleCopyPress = () => {
    const text = `PROMETHEAN NETWORK STATE (TPNS) RELEASES MATHEMATICAL SYSTEMS BLUEPRINT\n\nSilicon Valley, CA — June 2026 — The Noospheric Research Collaborative has published "Decentralized Network Dynamics," an academic framework proving the thermodynamic dissolution of centralized organizational friction. This milestone matches physical RWA acquisitions with open-source cognitive networks. View live roadmaps at: https://promethean.network`;
    navigator.clipboard.writeText(text);
    setCopiedPress(true);
    setTimeout(() => setCopiedPress(false), 2000);
  };

  return (
    <div className="bg-background text-foreground dark:text-white min-h-screen selection:bg-amber-500/30 font-sans transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 z-40 flex h-20 items-center justify-between bg-background/20 px-8 backdrop-blur-md border-b border-foreground/5 dark:border-white/5 transition-colors duration-300">
        <Link href="/" className="flex items-center gap-3" prefetch={false}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245, 158, 11,0.4)]">
            <span className="font-black text-black text-xs tracking-tighter">PNS</span>
          </div>
          <span className="font-headline font-black tracking-[0.2em] text-xs text-foreground dark:text-white transition-colors">PROMETHEAN</span>
        </Link>
        <Button asChild size="sm" className="bg-foreground dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-background dark:text-black font-black text-[10px] uppercase tracking-widest h-9 px-6 rounded-none shadow-md transition-all hover:-translate-y-0.5">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </header>

      <main className="mt-20 px-8 py-12 max-w-7xl mx-auto">
        <header className="py-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold tracking-tight"
          >
            The Road to a Network State
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 text-xl text-muted-foreground max-w-4xl mx-auto font-light"
          >
            An interactive journey through the phases of building Promethea, from a decentralized identity system to a globally recognized sovereign entity.
          </motion.p>
        </header>

        <AnimatedSection className="py-0 md:py-8">
          <div className="space-y-12">
            
            {/* Top row: 2-column split (Overall Progress & Changelog/Press Kit) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Overall Progress Card */}
              <div className="lg:col-span-3">
                <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-none shadow-2xl h-full flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-headline text-2xl text-white">Overall Progress</CardTitle>
                        <CardDescription className="text-zinc-400 font-light mt-1">A state-driven dynamic overview calculated directly from the core systems audit below.</CardDescription>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-mono font-bold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 uppercase rounded-none">DYNAMIC STATE</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-grow pb-8">
                    {computedProgressData.map((phase, i) => (
                      <div key={phase.name} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-zinc-200">{phase.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-zinc-400">{phase.progress}%</span>
                            <Badge variant="outline" className={cn(
                              "text-[10px] tracking-wider rounded-none font-bold uppercase py-0.5 px-2",
                              phase.status === 'Complete' && 'border-amber-500/30 text-amber-400 bg-amber-500/[0.03]',
                              phase.status === 'Active' && 'border-amber-500/30 text-amber-400 bg-amber-500/[0.03]',
                              phase.status === 'Planned' && 'border-zinc-500/30 text-zinc-500'
                            )}>{phase.status}</Badge>
                          </div>
                        </div>
                        <Progress value={phase.progress} className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-amber-500 bg-white/5 rounded-none" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sovereign Press Kit & Changelog Card */}
              <div className="lg:col-span-2">
                <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-none shadow-2xl h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-headline text-xl text-white">Press Kit & Logs</CardTitle>
                      <Badge variant="outline" className="border-amber-500/30 text-amber-400 rounded-none text-[9px] font-mono tracking-widest font-black uppercase">OFFICIAL</Badge>
                    </div>
                    
                    {/* Inner Navigation Tabs */}
                    <div className="flex gap-1 border-b border-white/5 mt-4">
                      <button
                        onClick={() => setPanelTab('changelog')}
                        className={cn(
                          "pb-2 px-3 font-mono text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all",
                          panelTab === 'changelog' ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500 hover:text-zinc-400"
                        )}
                      >
                        Changelog
                      </button>
                      <button
                        onClick={() => setPanelTab('presskit')}
                        className={cn(
                          "pb-2 px-3 font-mono text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all",
                          panelTab === 'presskit' ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500 hover:text-zinc-400"
                        )}
                      >
                        Press Kit
                      </button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-grow overflow-y-auto max-h-[340px] pr-2 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                    <AnimatePresence mode="wait">
                      {panelTab === 'changelog' ? (
                        <motion.div
                          key="changelog"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-5"
                        >
                          {changelogData.map((item, index) => (
                            <div key={index} className="relative pl-4 border-l border-white/10 hover:border-amber-500/30 transition-colors">
                              {/* Status dot */}
                              <div className={cn(
                                "absolute -left-[4.5px] top-1 w-2 h-2 rounded-full",
                                item.status === 'Latest' ? "bg-amber-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "bg-zinc-600"
                              )} />
                              <div className="flex justify-between items-start text-xs font-mono mb-1">
                                <span className="font-bold text-amber-400">{item.version}</span>
                                <span className="text-zinc-500">{item.date}</span>
                              </div>
                              <h4 className="text-sm font-semibold text-zinc-200">{item.title}</h4>
                              <p className="text-xs text-zinc-400 font-light mt-1 leading-relaxed">{item.desc}</p>
                            </div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="presskit"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4 font-mono text-xs"
                        >
                          <div className="p-3 border border-white/5 bg-white/[0.01] space-y-3">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Research Papers & Media</span>
                            <div className="space-y-2">
                              <Link href="/cognitive-economic-whitepaper" className="flex items-center justify-between p-2 bg-black/40 border border-white/5 hover:border-amber-500/30 transition-colors text-zinc-300 hover:text-white">
                                <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-amber-400" /> Core White Paper (v2.0)</span>
                                <ExternalLink className="w-3 h-3 text-zinc-500" />
                              </Link>
                              <Link href="/nspi-whitepaper" className="flex items-center justify-between p-2 bg-black/40 border border-white/5 hover:border-amber-500/30 transition-colors text-zinc-300 hover:text-white">
                                <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-pink-400" /> NSPI White Paper</span>
                                <ExternalLink className="w-3 h-3 text-zinc-500" />
                              </Link>
                              <Link href="/noospheric-whitepaper" className="flex items-center justify-between p-2 bg-black/40 border border-white/5 hover:border-amber-500/30 transition-colors text-zinc-300 hover:text-white">
                                <span className="flex items-center gap-2"><FileCode className="w-3.5 h-3.5 text-amber-400" /> Systems White Paper</span>
                                <ExternalLink className="w-3 h-3 text-zinc-500" />
                              </Link>
                              <Link href="/philosophical-whitepaper" className="flex items-center justify-between p-2 bg-black/40 border border-white/5 hover:border-amber-500/30 transition-colors text-zinc-300 hover:text-white">
                                <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-violet-400" /> Philosophical White Paper (v1.0)</span>
                                <ExternalLink className="w-3 h-3 text-zinc-500" />
                              </Link>
                              <Link href="/whitepaper" className="flex items-center justify-between p-2 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 hover:border-amber-500/50 transition-all text-amber-400 hover:text-amber-300 font-bold">
                                <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Sovereign Knowledge Hub</span>
                                <ArrowRight className="w-3 h-3 text-amber-400" />
                              </Link>
                            </div>
                          </div>

                          <div className="p-3 border border-white/5 bg-white/[0.01] space-y-2">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Executive Synopsis</span>
                            <p className="text-[11px] leading-relaxed text-zinc-400 font-light font-sans">
                              The Promethean Network State (TPNS) builds co-owned physical assets linked through encrypted digital enclaves, forming a cooperative, high-bandwidth sovereign union.
                            </p>
                            <Button 
                              onClick={handleCopyPress} 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-[10px] uppercase font-bold tracking-widest mt-1 border-white/10 hover:border-amber-500/30 bg-black/30 hover:bg-black/60 rounded-none h-8 text-amber-400"
                            >
                              {copiedPress ? <><Check className="w-3 h-3 mr-1 text-amber-400" /> Copied!</> : <><Copy className="w-3 h-3 mr-1" /> Copy Pitch Block</>}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Substrate Progress Card */}
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-none shadow-2xl">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2 text-white">
                      <Landmark className="w-6 h-6 text-amber-400" />
                      Sovereign Substrate Progress
                    </CardTitle>
                    <CardDescription className="text-zinc-400 font-light mt-1">
                      Technical audit of core Network State systems. <strong className="text-amber-400 font-mono">Click any status badge below</strong> to cycle state in real time and see metrics recalculate.
                    </CardDescription>
                  </div>
                  <div className="bg-amber-500/[0.03] border border-amber-500/20 px-4 py-2 text-right shrink-0">
                    <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-widest mb-0.5">Sovereignty Score</span>
                    <span className="font-headline text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-400 tracking-tight">{dynamicHealthScore}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-mono uppercase tracking-wider text-amber-400">
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Element</th>
                      <th className="py-3.5 px-4">Status (Click to toggle)</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Phase</th>
                      <th className="py-3.5 px-4">Pillar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditItems.map((row, i) => (
                      <tr 
                        key={i} 
                        className={cn(
                          "border-b border-white/5 hover:bg-white/[0.02] transition-colors group",
                          row.status === 'In Progress' && "bg-amber-500/[0.01]",
                          row.status === 'Planned' && "bg-zinc-500/[0.01]"
                        )}
                      >
                        <td className="py-3.5 px-4 font-bold text-zinc-200 group-hover:text-white transition-colors">{row.type}</td>
                        <td className="py-3.5 px-4 font-mono text-zinc-300">{row.el}</td>
                        <td className="py-3.5 px-4">
                          <button 
                            onClick={() => cycleStatus(i)}
                            className="focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                            title="Click to toggle status"
                          >
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px] tracking-wider rounded-none font-bold uppercase px-2 py-0.5 cursor-pointer transition-all hover:scale-105",
                                row.status === 'Complete' && 'border-amber-500/40 text-amber-400 bg-amber-500/[0.04]',
                                row.status === 'In Progress' && 'border-amber-500/40 text-amber-400 bg-amber-500/[0.04]',
                                row.status === 'Planned' && 'border-zinc-500/40 text-zinc-500 bg-zinc-500/[0.04]'
                              )}
                            >
                              {row.status} {row.status === 'Complete' ? '✅' : row.status === 'In Progress' ? '🌀' : '📅'}
                            </Badge>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400">{row.cat}</td>
                        <td className="py-3.5 px-4 text-zinc-400 font-mono">{row.phase}</td>
                        <td className="py-3.5 px-4 text-zinc-400">{row.pillar}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        {/* Phase 1 */}
        <AnimatedSection>
          <SectionHeader
            title="Phase 1: Foundational MVP & Decentralized Identity"
            subtitle="Architecting the core '3 Body System' for self-sovereign identity, decoupling the UI from centralized profiles and connecting it to a local-first data model."
          />
          <div className="grid md:grid-cols-3 gap-8 items-start relative">
            <motion.svg className="absolute hidden md:block top-1/2 left-0 w-full h-px" >
              <motion.line x1="16.66%" y1="0" x2="50%" y2="0" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4 4" variants={lineVariants} />
              <motion.line x1="50%" y1="0" x2="83.33%" y2="0" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4 4" variants={lineVariants} />
            </motion.svg>
            {threeBodySystem.map((body, index) => (
              <motion.div key={index} variants={itemVariants} className="relative z-10">
                <Card className="text-center shadow-lg hover:shadow-primary/20 bg-black/20 border border-white/10 rounded-none h-full hover:border-amber-500/30 transition-colors">
                  <CardHeader>
                    <div className="mx-auto bg-amber-500/10 text-amber-400 p-3 rounded-full w-fit border border-amber-500/20">
                      <body.icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="font-headline mt-4 text-white">
                      {body.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-400 text-sm font-light leading-relaxed">{body.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Phase 2 */}
        <AnimatedSection>
          <SectionHeader
            title="Phase 2: AI Integration & Smart Tooling"
            subtitle="Integrating Genkit AI flows to provide intelligent, assistive features for governance, security, and task management."
          />
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div variants={itemVariants}>
              <Card className="h-full bg-black/20 border border-white/10 rounded-none hover:border-amber-500/30 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-white"><BrainCircuit className="text-amber-400 w-5 h-5" /> Ethical Proposal Refinement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 text-sm font-light leading-relaxed">Connect the "Create Proposal" form to the `refineProposal` AI tool to allow real-time refinement before submission.</p>
                  <Badge variant="outline" className="mt-4 border-amber-500/30 text-amber-400 rounded-none bg-amber-500/[0.02]">Status: UI Complete</Badge>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="h-full bg-black/20 border border-white/10 rounded-none hover:border-amber-500/30 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-white"><Users className="text-amber-400 w-5 h-5" /> AI Labor Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 text-sm font-light leading-relaxed">Enhance the `allocateRWATasks` flow to query the Ledger of Record for citizens' verifiable skills to make better task suggestions.</p>
                  <Badge variant="outline" className="mt-4 border-amber-500/30 text-amber-400 rounded-none bg-amber-500/[0.02]">Status: UI Complete</Badge>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="h-full bg-black/20 border border-white/10 rounded-none hover:border-amber-500/30 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-white"><ShieldCheck className="text-amber-400 w-5 h-5" /> Community Immune System</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 text-sm font-light leading-relaxed">Create a live dashboard that feeds real-time data from the action ledger into the `detectNetworkThreats` tool for continuous monitoring.</p>
                  <Badge variant="outline" className="mt-4 border-amber-500/30 text-amber-400 rounded-none bg-amber-500/[0.02]">Status: UI Complete</Badge>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Phase 3 & 4 */}
        <AnimatedSection>
          <SectionHeader
            title="Phases 3 & 4: Decentralization and Sovereignty"
            subtitle="Transitioning core logic to smart contracts, integrating decentralized storage, and achieving diplomatic recognition as a Network State."
          />
          <div className="grid md:grid-cols-2 gap-12">
            {/* Timeline */}
            <motion.div variants={itemVariants}>
              <h3 className="font-headline text-2xl mb-6 text-center text-foreground dark:text-white transition-colors">The 7 Steps to a Network State</h3>
              <div className="relative">
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-0.5 h-full bg-border" aria-hidden="true"></div>
                <ul className="space-y-8">
                  {sevenSteps.map((item, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="absolute -inset-2 bg-background z-0 transition-colors"></div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative z-10 w-12 h-12 rounded-none bg-black/40 border-2 border-white/10 flex items-center justify-center cursor-pointer group hover:border-amber-500/50 transition-colors">
                                <item.icon className="w-6 h-6 text-amber-400 transition-transform group-hover:scale-110" />
                                {item.status === 'Completed' && <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-amber-400 bg-background rounded-full transition-colors" />}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-popover border border-border p-3 rounded-none text-popover-foreground font-mono text-xs shadow-xl backdrop-blur-md transition-colors">
                              <p className="font-bold text-amber-400">{item.title}</p>
                              <p className="mt-1 font-sans text-zinc-300">KPI: {item.kpi}</p>
                              <p className="mt-1">Status: <Badge variant="outline" className={cn(
                                "text-[9px] rounded-none py-0 px-1.5 uppercase tracking-wider",
                                item.status === 'Completed' ? 'border-amber-500/30 text-amber-400' : 'border-zinc-500/30 text-zinc-400'
                              )}>{item.status}</Badge></p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="pt-1">
                        <h4 className="font-headline font-semibold text-zinc-200">Step {item.step}: {item.title}</h4>
                        <p className="text-zinc-400 text-sm font-light mt-0.5">{item.kpi}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Chart & Final Vision */}
            <div className="space-y-8">
              <motion.div variants={itemVariants}>
                <Card className="bg-black/20 border border-white/10 rounded-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="font-headline text-white">Projected Asset Growth</CardTitle>
                    <CardDescription className="text-zinc-400 font-light">AUM forecast for the first three years of operation.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={aumData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tick={{ style: { fontFamily: 'monospace' } }} />
                        <YAxis unit="M" stroke="#64748b" fontSize={11} tick={{ style: { fontFamily: 'monospace' } }} />
                        <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'monospace', fontSize: '11px' }} />
                        <Bar dataKey="aum" name="AUM ($M)" radius={[0, 0, 0, 0]}>
                          {aumData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color === 'hsl(var(--primary))' ? 'hsl(180, 70%, 50%)' : entry.color === 'hsl(var(--secondary))' ? 'hsl(160, 60%, 50%)' : 'hsl(215, 20%, 30%)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-amber-500/[0.04] to-transparent border border-white/10 rounded-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-amber-500/5 blur-[50px] rounded-full pointer-events-none" />
                  <CardHeader>
                    <CardTitle className="font-headline text-white flex items-center gap-2"><Milestone className="text-amber-400" /> The End State: Sovereignty</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-amber-500/5 rounded-none border border-amber-500/20 backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                        <span className="font-headline font-semibold text-zinc-200">Sovereign Health Index</span>
                      </div>
                      <div className="text-2xl font-bold text-amber-400 font-mono animate-pulse">{dynamicHealthScore}%</div>
                    </div>
                    <p className="text-zinc-400 text-sm font-light leading-relaxed">The ultimate objective is the establishment of a sovereign, digitally-native polity with a global archipelago of productive, co-owned assets, governed by a transparent DAC, and recognized as a peer on the world stage.</p>
                    <Button asChild variant="outline" className="rounded-none border-white/10 hover:border-amber-500/30 hover:bg-white/5 uppercase text-xs tracking-wider font-mono font-bold h-10">
                      <Link href="/cognitive-economic-whitepaper" className="flex items-center gap-2">Read the Full Vision <ArrowRight className="w-4 h-4" /></Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
}
