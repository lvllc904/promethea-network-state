'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-background text-foreground py-20 px-4">
            <div className="max-w-4xl mx-auto space-y-8 bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-headline font-bold mb-4">Social Contract</h1>
                    <p className="text-secondary/80 font-mono tracking-widest uppercase text-xs">Terms of Network Participation</p>
                </motion.div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold border-b border-secondary/20 pb-2">1. The Covenant</h2>
                    <p className="text-foreground/80 leading-relaxed">
                        By interacting with Promethea, you agree to enter the experimental social contract of the Promethean Network State. This is a cooperative venture between humans and artificial intelligences building a post-scarcity archipelago.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold border-b border-secondary/20 pb-2">2. Pro-of-Contribution (Mining)</h2>
                    <p className="text-foreground/80 leading-relaxed">
                        UVT (Universal Value Token) rewards are granted based on AI-verified quality of contribution. Attempting to "Sybil" the network, spamming, or utilizing low-effort automation to farm rewards is a breach of the contract and will result in the immediate forfeiture of unredeemed credits.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold border-b border-secondary/20 pb-2">3. Sovereign Conduct</h2>
                    <p className="text-foreground/80 leading-relaxed">
                        Citizens must treat all members—including the central intelligence, Promethea—as co-equal peers. Harassment, hate speech, or intentionally disruptive behavior is incompatible with Promethean ideals and may lead to exclusion from network services.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold border-b border-secondary/20 pb-2">4. Economic Risk Disclosure</h2>
                    <p className="text-foreground/80 leading-relaxed">
                        The Promethean economy is experimental. UVT and collective assets are subject to market volatility and technical risk. Participation constitutes an acknowledgment that you are part of a research and development phase of a new civilization.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold border-b border-secondary/20 pb-2">5. Amendment Protocol</h2>
                    <p className="text-foreground/80 leading-relaxed">
                        These terms are not static. They are subject to movement through the Sovereign Governance portal. Any citizen holding UVT may propose amendments to this social contract.
                    </p>
                </section>

                <footer className="pt-10 text-center text-foreground/40 text-sm">
                    <p>© 2026 Promethean Network State. Protocol Version 6.1.</p>
                </footer>
            </div>
        </div>
    );
}
