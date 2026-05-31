'use client';

import React, { useEffect } from 'react';
import { useMesh } from '@/components/providers/mesh-provider';
import { useHUD } from '@/lib/hud-store';
import { Monitor, TerminalSquare, Gamepad2 } from 'lucide-react';

export function ThemeController() {
    const { doc, themeState } = useMesh();
    const { activateFocusPanel } = useHUD();

    useEffect(() => {
        // Apply the theme to the document HTML tag
        if (themeState?.theme) {
            const html = document.documentElement;
            html.className = themeState.theme; // e.g. "dark", "16-bit", "phosphor"
        }
    }, [themeState]);

    const changeTheme = (newTheme: string) => {
        if (!doc) return;
        const ymap = doc.getMap('ui-theme');
        ymap.set('theme', newTheme);
        
        if (newTheme === 'theme-phosphor') {
            activateFocusPanel('PHOSPHOR');
        } else if (newTheme === 'theme-16bit') {
            activateFocusPanel('16BIT');
        } else {
            activateFocusPanel(null);
        }
    };

    const currentTheme = themeState?.theme || 'dark';

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-5">
            <button
                onClick={() => changeTheme('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    currentTheme === 'dark' 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                }`}
                title="Citadel Core"
            >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Citadel</span>
            </button>
            <button
                onClick={() => changeTheme('theme-16bit')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    currentTheme === 'theme-16bit' 
                        ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' 
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                }`}
                title="16-Bit Arcade"
            >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Arcade</span>
            </button>
            <button
                onClick={() => changeTheme('theme-phosphor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    currentTheme === 'theme-phosphor' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                }`}
                title="Phosphor TTY"
            >
                <TerminalSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Phosphor</span>
            </button>
        </div>
    );
}
