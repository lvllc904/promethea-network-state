'use client';

import React, { useEffect } from 'react';
import { Terminal } from 'lucide-react';

export const OmniButton = () => {
    // A function to artificially trigger the Command Palette
    const triggerCommandPalette = () => {
        const event = new KeyboardEvent('keydown', {
            key: 'k',
            metaKey: true, // Mac
            ctrlKey: true, // Windows/Linux fallback
            bubbles: true,
            cancelable: true
        });
        window.dispatchEvent(event);
    };

    return (
        <button
            onClick={triggerCommandPalette}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-background border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center md:hidden group"
            aria-label="Open Command Palette"
        >
            <div className="absolute inset-0 rounded-full animate-reality-ai-pulse bg-cyan-500/10 pointer-events-none" />
            <Terminal className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        </button>
    );
};
