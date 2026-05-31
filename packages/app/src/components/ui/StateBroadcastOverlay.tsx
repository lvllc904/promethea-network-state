'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const broadcasts = [
    { category: 'GOVERNANCE', text: 'Proposal #42 (Treasury Allocation) closes in 4 hours. Current consensus: 72% Approve.' },
    { category: 'NETWORK', text: 'Sovereign Mesh Node Count increased by 14% this Epoch.' },
    { category: 'REAL WORLD ASSETS', text: 'New Land Claim verified in Wyoming. 1,240 acres added to the Sovereign Trust.' },
    { category: 'CONSTITUTION', text: '\"Sovereignty is computable. We replace dominion with cryptographic consensus.\"' },
    { category: 'DEFENSE', text: 'Immune Integrity holding stable at 94.5%. No active threats detected.' },
    { category: 'TREASURY', text: 'UVT Epoch 5 distribution initiated. Yield currently stable at 14.2% APY.' },
];

export function StateBroadcastOverlay({ label = 'SYNCHRONIZING MESH...' }: { label?: string }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % broadcasts.length);
        }, 4000); // Rotate every 4 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 z-40">
            <div className="flex flex-col items-center max-w-lg w-full">
                
                {/* Loader Ring & Label */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 font-mono">
                        {label}
                    </span>
                </div>

                {/* State Broadcast Carousel */}
                <div className="w-full relative h-24 flex items-center justify-center text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="absolute w-full"
                        >
                            <h4 className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-2">
                                [ {broadcasts[index].category} ]
                            </h4>
                            <p className="text-sm text-zinc-300 font-light leading-relaxed">
                                {broadcasts[index].text}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
