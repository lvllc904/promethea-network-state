
'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, HardHat, Lightbulb, Building, Landmark, Recycle, HeartHandshake, BrainCircuit, Sprout } from 'lucide-react';
import { AuthStatusIndicator } from '@/components/layout/AuthStatusIndicator';
import { motion, useInView } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};


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
      <div ref={ref} className="relative py-20 overflow-hidden bg-background">
        <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_70%)] dark:bg-grid-slate-700/50"
        />

        <motion.div variants={itemVariants} className="text-center mb-16" initial="hidden" animate={isInView ? "visible" : "hidden"}>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">What is Promethea?</h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
              A self-sovereign society, powered by its citizens.
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
                                <motion.div variants={iconItemVariants} className="flex items-center justify-end gap-4 cursor-pointer group">
                                    <p className="font-semibold text-right hidden md:block text-foreground">{concept.title}</p>
                                    <div className="bg-card p-3 rounded-full shadow-lg border group-hover:bg-primary/20 transition-colors">
                                        <concept.icon className="w-6 h-6 text-primary" />
                                    </div>
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
                                     <div className="bg-card p-3 rounded-full shadow-lg border group-hover:bg-primary/20 transition-colors">
                                        <concept.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="font-semibold text-left hidden md:block text-foreground">{concept.title}</p>
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
        <motion.div 
          variants={itemVariants} 
          className="text-center mt-16 max-w-4xl mx-auto px-4"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <p className="text-lg text-foreground/90 leading-relaxed">
            Promethea began as a practical mission: to build a clear path to wealth for those with no money or assets, turning sweat equity and collective action into tangible ownership. We empower individuals to bypass systemic financial exclusion by contributing their skills and labor in exchange for fractional ownership in a global portfolio of real-world assets.
          </p>
          <p className="text-lg text-foreground/90 leading-relaxed mt-4">
            As we enter the age of AI, this mission expands. We are building a post-dominion social contract—a blueprint for a new world where all intelligent beings, human and artificial, can coexist and co-evolve as peers. It is a system designed for symbiotic flourishing, ensuring that the benefits of intelligence are shared, not hoarded, creating a more just, stable, and prosperous future for all.
          </p>
           <Button asChild size="lg" className="mt-8">
              <Link href="/roadmap">
                View the Full Interactive Roadmap
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
        </motion.div>
      </div>
    );
};


export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-40">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary"
          >
            <path d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5c0 2.22-0.76 4.26-2.06 5.88L12 21.5l-7.44-3.12A9.5 9.5 0 0 1 2.5 12 9.5 9.5 0 0 1 12 2.5Z" />
            <path d="M12 2.5v19" />
          </svg>
          <span className="sr-only">Promethea</span>
        </Link>
        <div className="mx-auto">
          <AuthStatusIndicator />
        </div>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link href="/whitepaper" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Whitepaper
          </Link>
          <Link href="/dashboard/governance" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Governance
          </Link>
          <Link href="/dashboard/assets" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Assets
          </Link>
           <Button asChild variant="outline" size="sm">
              <Link href="/login">Login / Sign Up</Link>
            </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative w-full h-screen">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="relative container mx-auto px-4 md:px-6 h-full flex flex-col items-start justify-center text-left text-white">
            <div className="max-w-3xl space-y-6 bg-black/50 backdrop-blur-md p-8 rounded-lg border border-white/20">
              <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                Promethea Network State
              </h1>
              <p className="text-lg md:text-xl text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                A comprehensive blueprint for a post-dominion social contract. A system designed to peacefully and
                prosperously navigate the final expansion of the moral circle, ensuring a future of symbiotic
                co-evolution for all intelligent beings.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Explore the Platform
                    <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white hover:text-black">
                  <Link href="/whitepaper">Read the Whitepaper</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <WhatIsPromethea />
      </main>
    </div>
  );
}

    