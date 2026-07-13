'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Textarea, Label } from '@promethea/ui';
import { EthicalRefinementTool } from './ethical-refinement-tool';
import { LucideShieldCheck, LucideGlobe, LucideCpu, LucideSend, LucideArrowRight, LucideArrowLeft } from 'lucide-react';

interface ProposalWizardProps {
    onComplete: (data: any) => Promise<void>;
    onRefine: (data: any) => Promise<{ refinedProposal: string }>;
    onIngest?: (file: File) => Promise<{ title: string; description: string; category?: string }>;
}


export const ProposalWizard: React.FC<ProposalWizardProps> = ({ onComplete, onRefine, onIngest }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Technology',
        description: '',
        location: null as { lat: number, lng: number } | null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isIngesting, setIsIngesting] = useState(false);

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            await onComplete(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        {
            id: 1,
            title: "Intent & Origin",
            description: "Define the core objective of your proposal.",
            icon: <LucideGlobe className="w-6 h-6 text-amber-400" />,
        },
        {
            id: 2,
            title: "Synthesis",
            description: "Refine your narrative with Promethea's ethical engine.",
            icon: <LucideCpu className="w-6 h-6 text-purple-400" />,
        },
        {
            id: 3,
            title: "Metabolic Simulation",
            description: "Predict the impact on the Sovereign Treasury.",
            icon: <LucideShieldCheck className="w-6 h-6 text-emerald-400" />,
        },
        {
            id: 4,
            title: "Actualization",
            description: "Commit your proposal to the Constitutional Ledger.",
            icon: <LucideSend className="w-6 h-6 text-blue-400" />,
        }
    ];

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Progress Header */}
            <div className="flex justify-between items-center mb-12">
                {steps.map((s) => (
                    <div key={s.id} className="flex flex-col items-center gap-2 relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                            step >= s.id ? 'bg-black border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                        }`}>
                            {step > s.id ? <LucideShieldCheck className="w-6 h-6" /> : <span>{s.id}</span>}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-white' : 'text-zinc-600'}`}>
                            {s.title}
                        </span>
                    </div>
                ))}
                {/* Connector Line */}
                <div className="absolute top-[72px] left-1/2 -translate-x-1/2 w-full max-w-2xl h-[1px] bg-zinc-800 -z-0" />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Card className="bg-black/40 backdrop-blur-xl border-zinc-800/50 overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                        
                        <CardHeader>
                            <div className="flex items-center gap-4 mb-2">
                                {steps[step - 1].icon}
                                <div>
                                    <CardTitle className="text-2xl font-headline">{steps[step - 1].title}</CardTitle>
                                    <CardDescription>{steps[step - 1].description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="min-h-[400px]">
                            {step === 1 && (
                                <div className="space-y-6">
                                    {/* Multimodal Ingestion Zone */}
                                    <div 
                                        className={`p-8 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-4 ${
                                            isIngesting ? 'border-amber-500 bg-amber-500/5 animate-pulse' : 'border-zinc-800 hover:border-amber-500/30 bg-zinc-950/20'
                                        }`}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={async e => {
                                            e.preventDefault();
                                            const file = e.dataTransfer.files[0];
                                            if (file && onIngest) {
                                                setIsIngesting(true);
                                                try {
                                                    const data = await onIngest(file);
                                                    setFormData(prev => ({ ...prev, ...data }));
                                                } finally {
                                                    setIsIngesting(false);
                                                }
                                            }
                                        }}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center">
                                            {isIngesting ? <LucideCpu className="w-6 h-6 text-amber-400 animate-spin" /> : <LucideGlobe className="w-6 h-6 text-zinc-500" />}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-white">Sovereign Ingestion</p>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                                                {isIngesting ? 'Promethea is deciphering the intent...' : 'Drag PDF, Image, or DOC here for autonomous synthesis'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800" /></div>
                                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]"><span className="bg-black px-4 text-zinc-600">OR MANUAL INPUT</span></div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Proposal Title</Label>
                                        <Input 
                                            placeholder="What is the name of this intent?" 
                                            value={formData.title}
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                            className="bg-zinc-950/50 border-zinc-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Initial Narrative</Label>
                                        <Textarea 
                                            placeholder="Describe the change you wish to see..." 
                                            className="min-h-[200px] bg-zinc-950/50 border-zinc-800"
                                            value={formData.description}
                                            onChange={e => setFormData({...formData, description: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <EthicalRefinementTool 
                                    proposalText={formData.description} 
                                    onRefine={async (d) => {
                                        const r = await onRefine(d);
                                        setFormData({...formData, description: r.refinedProposal});
                                        return r;
                                    }} 
                                />
                            )}

                            {step === 3 && (
                                <div className="space-y-8 py-8">
                                    <div className="p-6 rounded-lg bg-zinc-950/50 border border-zinc-800 space-y-4">
                                        <h3 className="font-bold text-amber-400 uppercase tracking-tighter">Treasury Impact Prediction</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-zinc-500 uppercase font-black">Reserve Delta</span>
                                                <div className="text-xl font-mono text-orange-400">+$12,400.00</div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-zinc-500 uppercase font-black">Backing Confidence</span>
                                                <div className="text-xl font-mono text-amber-400">98.2%</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-zinc-400 leading-relaxed italic">
                                        "Simulation suggests that this proposal aligns with the circular metabolic goal of revenue recirculation. Minimal inflation detected in the UVT pool."
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                                    <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 animate-pulse">
                                        <LucideShieldCheck className="w-10 h-10 text-amber-400" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-bold">Ready for Commitment</h3>
                                        <p className="text-zinc-500 text-sm max-w-md">
                                            By submitting, you are signing this intent with your Sovereign Identity. It will be propagated to the labor ledger for verification.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <div className="p-6 border-t border-zinc-800/50 flex justify-between bg-zinc-950/30">
                            <Button 
                                variant="outline" 
                                onClick={prevStep} 
                                disabled={step === 1 || isSubmitting}
                                className="border-zinc-800 hover:bg-zinc-900"
                            >
                                <LucideArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            
                            {step < 4 ? (
                                <Button 
                                    onClick={nextStep}
                                    disabled={!formData.title || !formData.description}
                                    className="bg-amber-600 hover:bg-amber-500 text-white"
                                >
                                    Continue <LucideArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleComplete}
                                    disabled={isSubmitting}
                                    className="bg-orange-600 hover:bg-orange-500 text-white px-8"
                                >
                                    {isSubmitting ? 'Committing...' : 'Finalize Proposal'}
                                </Button>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
