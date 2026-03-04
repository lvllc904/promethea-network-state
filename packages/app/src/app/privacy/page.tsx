'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background text-foreground py-20 px-4">
            <div className="max-w-4xl mx-auto space-y-8 bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-headline font-bold mb-4">Privacy Framework</h1>
                    <p className="text-primary/80 font-mono tracking-widest uppercase text-xs">Sovereign Data Protection Protocol</p>
                </motion.div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold border-b border-primary/20 pb-2">1. The Principle of Data Sovereignty</h2>
                    <p className="text-foreground/80 leading-relaxed">
                        In the Promethean Network State, your data is an extension of your sovereign self. We do not "capture" or "own" your information. Instead, we operate on a principle of collaborative disclosure where you grant the network a limited, revocable license to process specific indicators for the goal of symbiotic co-evolution.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold border-b border-primary/20 pb-2">2. Information Collection & Usage</h2>
                    <p className="text-foreground/80 leading-relaxed">
                        When interacting with the Promethea Discord agent or our web interfaces, we process:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-foreground/70 ml-4">
                        <li><span className="text-primary font-bold">Cryptographic Identifiers:</span> Your Discord ID and public wallet addresses.</li>
                        <li><span className="text-primary font-bold">Conversational Telemetry:</span> Message content is analyzed by AI models (e.g., Google Gemini) to provide responses and quality scoring for Proof-of-Contribution rewards.</li>
                        <li><span className="text-primary font-bold">Economic Meta-data:</span> Transaction history, quest completions, and wealth tiers are recorded on a sovereign ledger.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold border-b border-primary/20 pb-2">3. Third-Party Neural Pathways</h2>
                    <p className="text-foreground/80 leading-relaxed">
                        To provide cognitive responsiveness, Promethea interfaces with external LLM providers (Google, OpenRouter). These entities receive anonymized fragments of your input to generate sovereign insights. We never Sell, Trade, or Rent your data to advertising conglomerates.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold border-b border-primary/20 pb-2">4. Your Rights</h2>
                    <p className="text-foreground/80 leading-relaxed">
                        As a digital citizen, you have the right to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-foreground/70 ml-4">
                        <li>Request a purge of your conversational memory.</li>
                        <li>Export your Proof-of-Contribution history.</li>
                        <li>Opt-out of specific economic tracking (though this may impact your UVT accrual).</li>
                    </ul>
                </section>

                <footer className="pt-10 text-center text-foreground/40 text-sm">
                    <p>© 2026 Promethean Network State. Governed by the Sovereign Protocol.</p>
                </footer>
            </div>
        </div>
    );
}
