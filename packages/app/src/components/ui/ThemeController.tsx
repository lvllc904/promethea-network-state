'use client';

import React, { useEffect, useState } from 'react';
import { useMesh } from '@/components/providers/mesh-provider';
import { useHUD } from '@/lib/hud-store';
import { Monitor, BookOpen, Gamepad2, TerminalSquare, ChevronDown } from 'lucide-react';
import { AdaptiveThemeController } from './AdaptiveThemeController';

export interface ThemeControllerProps {
    variant?: 'fixed' | 'inline';
}

export function ThemeController({ variant = 'fixed' }: ThemeControllerProps) {
    const { doc, themeState, setTheme } = useMesh();
    const { activateFocusPanel } = useHUD();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        // Apply the theme to the document HTML tag
        if (themeState?.theme) {
            const html = document.documentElement;
            // Clean up existing theme classes first
            html.classList.remove('dark', 'theme-latex', 'theme-16bit', 'theme-phosphor', 'theme-promethean-citadel', 'theme-citadel');
            // If the theme is "dark", next/tailwind needs class "dark". For custom ones, add them
            if (themeState.theme === 'dark' || themeState.theme === 'theme-citadel') {
                html.classList.add('dark', 'theme-promethean-citadel');
            } else {
                html.classList.add(themeState.theme);
                if (themeState.theme === 'theme-16bit' || themeState.theme === 'theme-phosphor') {
                    html.classList.add('dark');
                }
            }
        }
    }, [themeState]);

    const changeTheme = (newTheme: string) => {
        if (setTheme) setTheme(newTheme);
        if (doc) {
            try {
                const ymap = doc.getMap('ui-theme');
                ymap.set('theme', newTheme);
                ymap.set('isAdaptive', false);
            } catch {}
        }
        
        if (newTheme === 'theme-phosphor') {
            activateFocusPanel('PHOSPHOR');
        } else if (newTheme === 'theme-16bit') {
            activateFocusPanel('16BIT');
        } else {
            activateFocusPanel(null);
        }
        setIsDropdownOpen(false);
    };

    const currentTheme = themeState?.theme || 'dark';

    const themes = [
        {
            key: 'dark',
            label: 'Citadel',
            icon: Monitor,
            title: 'Citadel Core (Dark)',
            activeStyles: 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
            dropdownActiveStyles: 'text-amber-400 bg-amber-500/10 font-bold',
        },
        {
            key: 'theme-latex',
            label: 'LaTeX',
            icon: BookOpen,
            title: 'LaTeX Light (Scholarly)',
            activeStyles: 'bg-amber-100 text-amber-900 border border-amber-200 shadow-[0_0_12px_rgba(253,252,247,0.4)]',
            dropdownActiveStyles: 'text-amber-900 dark:text-amber-200 bg-amber-500/10 font-bold',
        },
        {
            key: 'theme-16bit',
            label: '16-Bit',
            icon: Gamepad2,
            title: '16-Bit Nintendo (Retro Mario/Zelda)',
            activeStyles: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
            dropdownActiveStyles: 'text-emerald-400 bg-emerald-500/10 font-bold',
        },
        {
            key: 'theme-phosphor',
            label: 'Phosphor',
            icon: TerminalSquare,
            title: 'Phosphor Green (Monochrome)',
            activeStyles: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
            dropdownActiveStyles: 'text-emerald-400 bg-emerald-500/10 font-bold',
        },
    ];

    const activeThemeObj = themes.find(t => t.key === currentTheme) || themes[0];
    const ActiveIcon = activeThemeObj.icon;

    if (variant === 'inline') {
        return (
            <div 
                className="relative inline-block text-left"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
            >
                {/* Trigger Button showing active theme */}
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 border border-foreground/10 dark:border-white/10 bg-background/40 backdrop-blur-md hover:bg-foreground/5 dark:hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest text-foreground dark:text-white rounded-none shadow-sm min-w-[130px] justify-between h-9"
                    title={activeThemeObj.title}
                >
                    <div className="flex items-center gap-2">
                        <ActiveIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>{activeThemeObj.label}</span>
                    </div>
                    <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Card */}
                {isDropdownOpen && (
                    <div className="absolute right-0 top-full pt-1.5 z-50 w-72 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                        <div className="bg-black/95 backdrop-blur-xl border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.8)] rounded-none py-1.5 flex flex-col gap-0.5">
                            {/* Live Telemetry Block */}
                            <div className="px-1 py-1 border-b border-white/5 mb-1">
                                <AdaptiveThemeController />
                            </div>
                            
                            <div className="px-3 py-1 text-[8px] font-mono font-semibold tracking-widest text-zinc-500 uppercase border-b border-white/5 mb-1">
                                Select Interface Substrate
                            </div>
                            {themes.map((t) => {
                                const Icon = t.icon;
                                const isActive = currentTheme === t.key;
                                return (
                                    <button
                                        key={t.key}
                                        onClick={() => changeTheme(t.key)}
                                        className={`flex items-center gap-2.5 px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-left ${
                                            isActive ? t.dropdownActiveStyles : ''
                                        }`}
                                        title={t.title}
                                    >
                                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                                        <span>{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Fixed bottom bar layout (kept as is for interior pages)
    const containerClasses = "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-5";

    return (
        <div className={containerClasses}>
            {themes.map((t) => {
                const isActive = currentTheme === t.key;
                const Icon = t.icon;
                return (
                    <button
                        key={t.key}
                        onClick={() => changeTheme(t.key)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                            isActive 
                                ? t.activeStyles 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                        }`}
                        title={t.title}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
