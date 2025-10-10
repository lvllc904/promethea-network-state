
'use client';
import { motion, useInView } from 'framer-motion';
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
  HardHat,
  Lightbulb,
  Building,
  Coins,
  Recycle,
  Sprout,
  HeartHandshake
} from 'lucide-react';
import React, { useRef } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';


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
    title: 'Sovereign Data Store',
    description: "Your device, running DepthOS, where you and only you hold your private keys and personal data.",
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

const prometheaConcepts = [
    { icon: HardHat, title: "Sweat Equity", description: "Your labor and skills are converted into tangible ownership." },
    { icon: Lightbulb, title: "Intellectual Capital", description: "Your ideas and knowledge are valuable assets." },
    { icon: Building, title: "Real-World Assets", description: "The foundation of our economy, from real estate to businesses." },
    { icon: Landmark, title: "Governance", description: "A decentralized community where every voice matters." },
    { icon: Recycle, title: "UVT Economy", description: "A circular economy powered by Universal Value Tokens." },
    { icon: HeartHandshake, title: "Community", description: "A global network of aligned individuals building a new world." },
    { icon: BrainCircuit, title: "Technology", description: "Advanced, ethical AI and decentralized systems for liberation." },
    { icon: Sprout, title: "Growth", description: "Expanding our sovereign archipelago of assets and citizens." },
]


// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const lineVariants = {
    hidden: { pathLength: 0 },
    visible: { pathLength: 1, transition: { duration: 1, ease: "easeInOut" } }
}

// --- Components ---
const AnimatedSection = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

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

const WhatIsPromethea = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const visualImage = PlaceHolderImages.find(p => p.id === 'roadmap-visual');

    const iconColumnVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.2, delay: 0.5 }
        },
    };
    
    const iconItemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { 
            x: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        },
    };

    const conceptsLeft = prometheaConcepts.slice(0, 4);
    const conceptsRight = prometheaConcepts.slice(4);

    return (
      <div ref={ref} className="relative py-20 overflow-hidden">
        <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_70%)] dark:bg-grid-slate-700/50"
        />

        <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">What is Promethea?</h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
              A visual story of a self-sovereign society, powered by its citizens.
            </p>
        </motion.div>
        
        <div className="flex items-center justify-center gap-8 md:gap-16">
            <TooltipProvider>
                <motion.div 
                    className="flex flex-col gap-8"
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={iconColumnVariants}
                >
                    {conceptsLeft.map((concept) => (
                         <Tooltip key={concept.title}>
                            <TooltipTrigger asChild>
                                <motion.div variants={iconItemVariants} className="flex items-center gap-4 cursor-pointer group">
                                    <div className="bg-card p-3 rounded-full shadow-lg border group-hover:bg-primary/20 transition-colors">
                                        <concept.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="font-semibold text-right hidden md:block">{concept.title}</p>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p className="font-bold">{concept.title}</p>
                                <p>{concept.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </motion.div>
            </TooltipProvider>

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.8, ease: "backOut" }}
                className="relative w-[250px] h-[250px] md:w-[350px] md:h-[350px] flex-shrink-0"
            >
                {visualImage && (
                    <Image 
                        src={visualImage.imageUrl} 
                        alt={visualImage.description} 
                        fill
                        className="rounded-full shadow-2xl object-cover"
                        data-ai-hint={visualImage.imageHint}
                    />
                )}
            </motion.div>
            
            <TooltipProvider>
                <motion.div 
                    className="flex flex-col gap-8"
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={iconColumnVariants}
                >
                    {conceptsRight.map((concept) => (
                         <Tooltip key={concept.title}>
                            <TooltipTrigger asChild>
                                <motion.div variants={iconItemVariants} className="flex items-center gap-4 cursor-pointer group">
                                     <p className="font-semibold text-left hidden md:block">{concept.title}</p>
                                    <div className="bg-card p-3 rounded-full shadow-lg border group-hover:bg-primary/20 transition-colors">
                                        <concept.icon className="w-6 h-6 text-primary" />
                                    </div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p className="font-bold">{concept.title}</p>
                                <p>{concept.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </motion.div>
            </TooltipProvider>
        </div>
      </div>
    );
};
  

// --- Page ---
export default function RoadmapPage() {
  return (
    <div className="container mx-auto px-4 md:px-6">
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
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-xl text-muted-foreground max-w-4xl mx-auto"
        >
          An interactive journey through the phases of building Promethea, from a decentralized identity system to a globally recognized sovereign entity.
        </motion.p>
      </header>

      <WhatIsPromethea />

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
              <Card className="text-center shadow-lg hover:shadow-primary/20 transition-shadow h-full">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                    <body.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">
                    {body.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{body.description}</p>
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
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline"><BrainCircuit /> Ethical Proposal Refinement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Connect the "Create Proposal" form to the `refineProposal` AI tool to allow real-time refinement before submission.</p>
                            <Badge className="mt-4">Status: UI Complete</Badge>
                        </CardContent>
                    </Card>
                </motion.div>
                 <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline"><Users /> AI Labor Allocation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Enhance the `allocateRWATasks` flow to query the Ledger of Record for citizens' verifiable skills to make better task suggestions.</p>
                             <Badge className="mt-4">Status: UI Complete</Badge>
                        </CardContent>
                    </Card>
                </motion.div>
                 <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline"><ShieldCheck /> Community Immune System</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Create a live dashboard that feeds real-time data from the action ledger into the `detectNetworkThreats` tool for continuous monitoring.</p>
                             <Badge className="mt-4">Status: UI Complete</Badge>
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
                 <h3 className="font-headline text-2xl mb-6 text-center">The 7 Steps to a Network State</h3>
                 <div className="relative">
                     <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-0.5 h-full bg-border" aria-hidden="true"></div>
                     <ul className="space-y-8">
                         {sevenSteps.map((item, index) => (
                              <li key={index} className="flex items-start gap-4">
                                 <div className="relative flex-shrink-0">
                                      <div className="absolute -inset-2 bg-background z-0"></div>
                                      <TooltipProvider>
                                         <Tooltip>
                                             <TooltipTrigger asChild>
                                                 <div className="relative z-10 w-12 h-12 rounded-full bg-card border-2 flex items-center justify-center cursor-pointer group">
                                                     <item.icon className="w-6 h-6 text-primary transition-transform group-hover:scale-110" />
                                                     {item.status === 'Completed' && <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-green-500 bg-background rounded-full" />}
                                                 </div>
                                             </TooltipTrigger>
                                             <TooltipContent side="right">
                                                 <p className="font-bold">{item.title}</p>
                                                 <p>KPI: {item.kpi}</p>
                                                 <p>Status: <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'} className={item.status === 'In Progress' ? 'bg-amber-500/20 text-amber-700' : ''}>{item.status}</Badge></p>
                                             </TooltipContent>
                                         </Tooltip>
                                     </TooltipProvider>
                                 </div>
                                  <div>
                                      <h4 className="font-headline font-semibold">Step {item.step}: {item.title}</h4>
                                      <p className="text-muted-foreground text-sm">{item.kpi}</p>
                                  </div>
                              </li>
                         ))}
                     </ul>
                 </div>
            </motion.div>
            
            {/* Chart & Final Vision */}
            <div className="space-y-8">
                 <motion.div variants={itemVariants}>
                     <Card>
                         <CardHeader>
                             <CardTitle className="font-headline">Projected Asset Growth</CardTitle>
                             <CardDescription>AUM forecast for the first three years of operation.</CardDescription>
                         </CardHeader>
                         <CardContent>
                             <ResponsiveContainer width="100%" height={250}>
                                 <BarChart data={aumData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                     <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                     <YAxis unit="M" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                     <RechartsTooltip cursor={{fill: 'hsl(var(--accent) / 0.1)'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                                     <Bar dataKey="aum" name="AUM ($M)" radius={[4, 4, 0, 0]}>
                                        {aumData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                     </Bar>
                                 </BarChart>
                             </ResponsiveContainer>
                         </CardContent>
                     </Card>
                 </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-gradient-to-br from-primary/10 to-transparent">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><Milestone /> The End State: Sovereignty</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">The ultimate objective is the establishment of a sovereign, digitally-native polity with a global archipelago of productive, co-owned assets, governed by a transparent DAC, and recognized as a peer on the world stage.</p>
                            <Button asChild variant="outline">
                                <Link href="/whitepaper">Read the Full Vision <ArrowRight className="ml-2" /></Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
       </AnimatedSection>
    </div>
  );
}
