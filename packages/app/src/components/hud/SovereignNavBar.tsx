'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHUD } from '@/lib/hud-store';
import { useMesh } from '@/components/providers/mesh-provider';
import {
    Globe,
    Coins,
    Landmark,
    BrainCircuit,
    BookOpen,
    Radio,
    Shield,
    Settings,
    Terminal,
    Palette,
    FileText,
    ChevronUp,
    Command,
    X
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type PillarId = 'ATLAS' | 'ECONOMICS' | 'GOVERNANCE' | 'ASGI' | 'NARRATIVE' | 'DIPLOMATIC' | 'PULSE' | 'SETTINGS';

interface NavPillar {
    id: PillarId;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    color: string; // tailwind class for accent
    description: string;
    action?: (hud: any) => void;
}

const PILLARS: NavPillar[] = [
    {
        id: 'ATLAS',
        label: 'Atlas Map',
        shortLabel: 'Atlas',
        icon: Globe,
        color: 'emerald',
        description: 'Navigate Sovereign Territories',
        action: (hud) => hud.activatePillar('ATLAS'),
    },
    {
        id: 'ECONOMICS',
        label: 'Economics',
        shortLabel: 'Economy',
        icon: Coins,
        color: 'amber',
        description: 'Treasury & Markets',
        action: (hud) => hud.activatePillar('ECONOMICS'),
    },
    {
        id: 'GOVERNANCE',
        label: 'Governance',
        shortLabel: 'Gov',
        icon: Landmark,
        color: 'sky',
        description: 'Proposals & Consensus',
        action: (hud) => hud.activatePillar('GOVERNANCE'),
    },
    {
        id: 'ASGI',
        label: 'Promethea ASGI',
        shortLabel: 'ASGI',
        icon: BrainCircuit,
        color: 'violet',
        description: 'Sovereign AI Core',
        action: (hud) => hud.activatePillar('ASGI'),
    },
    {
        id: 'NARRATIVE',
        label: 'Narrative',
        shortLabel: 'Media',
        icon: BookOpen,
        color: 'rose',
        description: 'Sovereign Media & Culture',
        action: (hud) => hud.activatePillar('NARRATIVE'),
    },
    {
        id: 'DIPLOMATIC',
        label: 'Diplomatic',
        shortLabel: 'Diplo',
        icon: Shield,
        color: 'cyan',
        description: 'Alliances & Treaties',
        action: (hud) => hud.activatePillar('DIPLOMATIC'),
    },
    {
        id: 'PULSE',
        label: 'Network Pulse',
        shortLabel: 'Pulse',
        icon: Radio,
        color: 'orange',
        description: 'Live System Telemetry',
        action: (hud) => hud.activatePillar('PULSE'),
    },
    {
        id: 'SETTINGS',
        label: 'Settings',
        shortLabel: 'Setup',
        icon: Settings,
        color: 'zinc',
        description: 'Interface & Theme',
    },
];

// Color map for tailwind JIT
const COLOR_CLASSES: Record<string, { active: string; glow: string; text: string; dot: string }> = {
    emerald: { active: 'bg-emerald-500/20 border-emerald-500/50', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]', text: 'text-emerald-400', dot: 'bg-emerald-500' },
    amber:   { active: 'bg-amber-500/20 border-amber-500/50',     glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',  text: 'text-amber-400',   dot: 'bg-amber-500'   },
    sky:     { active: 'bg-sky-500/20 border-sky-500/50',         glow: 'shadow-[0_0_20px_rgba(14,165,233,0.3)]',  text: 'text-sky-400',     dot: 'bg-sky-500'     },
    violet:  { active: 'bg-violet-500/20 border-violet-500/50',   glow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]',  text: 'text-violet-400',  dot: 'bg-violet-500'  },
    rose:    { active: 'bg-rose-500/20 border-rose-500/50',       glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',   text: 'text-rose-400',    dot: 'bg-rose-500'    },
    cyan:    { active: 'bg-cyan-500/20 border-cyan-500/50',       glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',   text: 'text-cyan-400',    dot: 'bg-cyan-500'    },
    orange:  { active: 'bg-orange-500/20 border-orange-500/50',   glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',  text: 'text-orange-400',  dot: 'bg-orange-500'  },
    zinc:    { active: 'bg-zinc-500/20 border-zinc-500/40',       glow: 'shadow-[0_0_12px_rgba(113,113,122,0.2)]', text: 'text-zinc-300',    dot: 'bg-zinc-400'    },
};

// ─────────────────────────────────────────────────────────────
// Settings Panel
// ─────────────────────────────────────────────────────────────
function SettingsPanel({ onClose, isLatex }: { onClose: () => void; isLatex: boolean }) {
    const { togglePhosphorMode, isPhosphorMode } = useHUD();
    const { themeState, setTheme } = useMesh() as any;
    const currentTheme = themeState?.theme || 'dark';

    const themes = [
        {
            id: 'dark',
            label: 'Citadel',
            description: 'Glass HUD · Dark Command Interface',
            icon: Command,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/30',
            activeBg: 'bg-emerald-500/20 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
        },
        {
            id: 'latex',
            label: 'LaTeX',
            description: 'Print Medium · Document Interface',
            icon: FileText,
            color: 'text-amber-700',
            bg: 'bg-amber-900/10 border-amber-800/20',
            activeBg: 'bg-amber-800/20 border-amber-700/60 shadow-[0_0_20px_rgba(180,120,40,0.2)]',
        },
        {
            id: 'phosphor',
            label: 'Phosphor',
            description: 'CLI Only · Red Terminal Interface',
            icon: Terminal,
            color: 'text-red-500',
            bg: 'bg-red-950/20 border-red-900/30',
            activeBg: 'bg-red-900/30 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
        },
    ];

    const handleThemeSelect = (id: string) => {
        if (id === 'phosphor') {
            togglePhosphorMode();
        } else {
            if (isPhosphorMode) togglePhosphorMode(); // exit phosphor first
            if (setTheme) setTheme(id);
        }
        onClose();
    };

    const activeTheme = isPhosphorMode ? 'phosphor' : currentTheme;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-80 rounded-2xl border p-5 shadow-2xl ${
                isLatex
                    ? 'bg-[#fdfcf7]/95 border-stone-200 backdrop-blur-2xl'
                    : 'bg-zinc-950/95 border-white/10 backdrop-blur-3xl'
            }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className={`text-xs font-mono font-black uppercase tracking-widest ${isLatex ? 'text-stone-900' : 'text-white'}`}>
                        Interface Mode
                    </p>
                    <p className={`text-[9px] font-mono uppercase tracking-wider mt-0.5 ${isLatex ? 'text-stone-400' : 'text-zinc-500'}`}>
                        Select your command interface
                    </p>
                </div>
                <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${isLatex ? 'hover:bg-stone-100 text-stone-400' : 'hover:bg-white/10 text-zinc-500'}`}>
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Theme Tiles */}
            <div className="flex flex-col gap-2">
                {themes.map((theme) => {
                    const isActive = activeTheme === theme.id;
                    const IconComp = theme.icon;
                    return (
                        <button
                            key={theme.id}
                            onClick={() => handleThemeSelect(theme.id)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 text-left cursor-pointer ${
                                isActive ? theme.activeBg : theme.bg
                            } hover:scale-[1.02] active:scale-[0.98]`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isActive ? 'border-current/40 bg-current/10' : 'border-white/10 bg-black/20'}`}>
                                <IconComp className={`w-4 h-4 ${theme.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold uppercase tracking-wider ${theme.color}`}>{theme.label}</p>
                                <p className={`text-[9px] font-mono mt-0.5 ${isLatex ? 'text-stone-400' : 'text-zinc-500'}`}>{theme.description}</p>
                            </div>
                            {isActive && (
                                <div className={`w-2 h-2 rounded-full ${theme.id === 'phosphor' ? 'bg-red-500' : theme.id === 'latex' ? 'bg-amber-600' : 'bg-emerald-500'}`} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Arrow indicator */}
            <div className={`absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r ${isLatex ? 'bg-[#fdfcf7] border-stone-200' : 'bg-zinc-950 border-white/10'}`} />
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────
// OmniBar (Cmd+K command input)
// ─────────────────────────────────────────────────────────────
function OmniBarExpanded({ onClose, isLatex }: { onClose: () => void; isLatex: boolean }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const hud = useHUD();
    const [query, setQuery] = useState('');

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const SLASH_COMMANDS = [
        { cmd: '/atlas',      label: 'Open Atlas Map',          action: () => hud.activatePillar('ATLAS') },
        { cmd: '/economics',  label: 'Open Economics',          action: () => hud.activatePillar('ECONOMICS') },
        { cmd: '/governance', label: 'Open Governance',         action: () => hud.activatePillar('GOVERNANCE') },
        { cmd: '/asgi',       label: 'Open ASGI Copilot',       action: () => hud.activatePillar('ASGI') },
        { cmd: '/narrative',  label: 'Open Narrative',          action: () => hud.activatePillar('NARRATIVE') },
        { cmd: '/diplomatic', label: 'Open Diplomatic',         action: () => hud.activatePillar('DIPLOMATIC') },
        { cmd: '/pulse',      label: 'Open Network Pulse',      action: () => hud.activatePillar('PULSE') },
        { cmd: '/orbit',      label: 'Engage Orbit Mode',       action: () => hud.setHUDState({ mapMode: 'INTERSTELLAR' }) },
        { cmd: '/phosphor',   label: 'Switch to Phosphor CLI',  action: () => hud.togglePhosphorMode() },
        { cmd: '/wallet',     label: 'Open Wallet',             action: () => hud.activateFocusPanel('WALLET') },
        { cmd: '/exchange',   label: 'Open Exchange',           action: () => hud.activateFocusPanel('EXCHANGE') },
        { cmd: '/scan',       label: 'Open Omni Scanner',       action: () => hud.activateFocusPanel('OMNI_SCANNER') },
    ];

    const filtered = query.startsWith('/')
        ? SLASH_COMMANDS.filter(c => c.cmd.startsWith(query.toLowerCase()))
        : SLASH_COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

    const handleSelect = (action: () => void) => {
        action();
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter' && filtered.length > 0) {
            filtered[0].action();
            onClose();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute bottom-full mb-3 left-1/2 -translate-x-[40%] w-[480px] max-w-[95vw] rounded-2xl border shadow-2xl overflow-hidden ${
                isLatex
                    ? 'bg-[#fdfcf7]/98 border-stone-200 backdrop-blur-2xl'
                    : 'bg-zinc-950/98 border-white/10 backdrop-blur-3xl'
            }`}
        >
            {/* Input */}
            <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${isLatex ? 'border-stone-200' : 'border-white/5'}`}>
                <Command className={`w-4 h-4 flex-shrink-0 ${isLatex ? 'text-stone-400' : 'text-zinc-500'}`} />
                <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search or type / for commands…"
                    className={`flex-1 bg-transparent text-sm font-mono border-none focus:outline-none placeholder:text-zinc-600 ${isLatex ? 'text-stone-900 placeholder:text-stone-400' : 'text-white'}`}
                />
                <button onClick={onClose} className={`text-[9px] font-mono px-2 py-1 rounded border ${isLatex ? 'border-stone-300 text-stone-400' : 'border-white/10 text-zinc-500'}`}>
                    ESC
                </button>
            </div>

            {/* Results */}
            <div className="max-h-64 overflow-y-auto">
                {filtered.length === 0 && (
                    <div className={`px-4 py-6 text-center text-xs font-mono ${isLatex ? 'text-stone-400' : 'text-zinc-600'}`}>
                        No commands found
                    </div>
                )}
                {filtered.map((item) => (
                    <button
                        key={item.cmd}
                        onClick={() => handleSelect(item.action)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                            isLatex
                                ? 'hover:bg-stone-50 text-stone-800'
                                : 'hover:bg-white/5 text-zinc-300'
                        }`}
                    >
                        <span className={`text-[10px] font-mono font-bold w-28 flex-shrink-0 ${isLatex ? 'text-amber-700' : 'text-amber-500'}`}>
                            {item.cmd}
                        </span>
                        <span className="text-xs font-mono">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Footer hint */}
            <div className={`px-4 py-2 border-t text-[9px] font-mono flex items-center gap-3 ${isLatex ? 'border-stone-100 text-stone-400' : 'border-white/5 text-zinc-600'}`}>
                <span><kbd className="font-bold">↵</kbd> Select</span>
                <span><kbd className="font-bold">↑↓</kbd> Navigate</span>
                <span><kbd className="font-bold">ESC</kbd> Close</span>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────
// Main SovereignNavBar
// ─────────────────────────────────────────────────────────────
export function SovereignNavBar() {
    const hud = useHUD();
    const { activePillar, isPhosphorMode } = hud;
    const { themeState } = useMesh();
    const isLatex = themeState?.theme === 'latex';

    const [isVisible, setIsVisible] = useState(false);
    const [activePanel, setActivePanel] = useState<'settings' | 'omni' | null>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navRef = useRef<HTMLDivElement>(null);

    // ── Auto-hide / reveal on mouse position ──────────────────
    const showNav = useCallback(() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setIsVisible(true);
    }, []);

    const scheduleHide = useCallback(() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
            // Only hide if no panel is open
            setActivePanel(prev => {
                if (!prev) setIsVisible(false);
                return prev;
            });
        }, 1200);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const threshold = window.innerHeight - 80; // reveal zone: bottom 80px
            if (e.clientY >= threshold) {
                showNav();
            } else {
                scheduleHide();
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [showNav, scheduleHide]);

    // Keep visible when any panel is open
    useEffect(() => {
        if (activePanel) {
            if (hideTimer.current) clearTimeout(hideTimer.current);
            setIsVisible(true);
        }
    }, [activePanel]);

    // Cmd+K to open OmniBar from anywhere
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsVisible(true);
                setActivePanel(p => p === 'omni' ? null : 'omni');
            }
            if (e.key === 'Escape') {
                setActivePanel(null);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setActivePanel(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Phosphor mode: minimal red bar ─────────────────────────
    if (isPhosphorMode) {
        return (
            <motion.div
                initial={{ y: 60 }}
                animate={{ y: isVisible ? 0 : 48 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={showNav}
                className="fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-between px-6 py-2 bg-black border-t border-red-900/50 font-mono"
            >
                {/* Reveal strip always visible */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-900/40" />

                <div className="flex items-center gap-6">
                    {['ATLAS', 'ECON', 'GOV', 'ASGI', 'NAR', 'DIP', 'PULSE'].map(label => (
                        <button key={label} className="text-[9px] text-red-700 hover:text-red-500 tracking-widest transition-colors cursor-pointer">
                            [ {label} ]
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => hud.togglePhosphorMode()}
                    className="text-[9px] text-red-500 hover:text-red-300 tracking-widest border border-red-900/50 px-2 py-0.5 cursor-pointer transition-colors"
                >
                    ← EXIT CLI
                </button>
            </motion.div>
        );
    }

    // ── Normal / Latex mode ────────────────────────────────────
    return (
        <>
            {/* Invisible hover-trigger strip at bottom of screen */}
            <div
                className="fixed bottom-0 left-0 right-0 h-3 z-[59] pointer-events-auto"
                onMouseEnter={showNav}
            />

            {/* Thin reveal strip — always visible so users know the nav exists */}
            <div
                className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 z-[59] rounded-full pointer-events-none transition-opacity duration-500 ${
                    isVisible ? 'opacity-0' : 'opacity-60'
                } ${isLatex ? 'bg-stone-300' : 'bg-white/20'}`}
            />

            <motion.div
                ref={navRef}
                initial={{ y: 80 }}
                animate={{ y: isVisible ? 0 : 72 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={showNav}
                onMouseLeave={scheduleHide}
                className="fixed bottom-0 left-0 right-0 z-[60] flex justify-center pb-3 px-4 pointer-events-none"
            >
                <div className={`pointer-events-auto flex items-end gap-1.5 px-3 py-3 rounded-2xl border shadow-2xl relative ${
                    isLatex
                        ? 'bg-[#fdfcf7]/95 border-stone-200/80 backdrop-blur-2xl shadow-stone-900/10'
                        : 'bg-black/80 border-white/10 backdrop-blur-3xl shadow-black'
                }`}>

                    {/* Panels anchored above */}
                    <AnimatePresence>
                        {activePanel === 'settings' && (
                            <SettingsPanel key="settings" onClose={() => setActivePanel(null)} isLatex={isLatex} />
                        )}
                        {activePanel === 'omni' && (
                            <OmniBarExpanded key="omni" onClose={() => setActivePanel(null)} isLatex={isLatex} />
                        )}
                    </AnimatePresence>

                    {/* Pillar tabs */}
                    {PILLARS.map((pillar) => {
                        const IconComp = pillar.icon;
                        const isActive = pillar.id !== 'SETTINGS' && activePillar === pillar.id;
                        const isSettingsOpen = pillar.id === 'SETTINGS' && activePanel === 'settings';
                        const colors = COLOR_CLASSES[pillar.color];

                        return (
                            <button
                                key={pillar.id}
                                title={pillar.label}
                                aria-label={pillar.label}
                                onClick={() => {
                                    if (pillar.id === 'SETTINGS') {
                                        setActivePanel(p => p === 'settings' ? null : 'settings');
                                    } else {
                                        pillar.action?.(hud);
                                        setActivePanel(null);
                                    }
                                }}
                                className={`
                                    group relative flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border 
                                    transition-all duration-300 cursor-pointer select-none
                                    min-w-[52px] md:min-w-[60px]
                                    ${(isActive || isSettingsOpen)
                                        ? `${colors.active} ${colors.glow}`
                                        : isLatex
                                            ? 'border-transparent hover:bg-stone-100 hover:border-stone-200'
                                            : 'border-transparent hover:bg-white/5 hover:border-white/10'
                                    }
                                `}
                            >
                                {/* Active dot */}
                                {(isActive || isSettingsOpen) && (
                                    <span className={`absolute top-1.5 right-1.5 w-1 h-1 rounded-full ${colors.dot}`} />
                                )}

                                {/* Icon */}
                                <IconComp className={`w-5 h-5 transition-colors duration-300 ${
                                    (isActive || isSettingsOpen)
                                        ? colors.text
                                        : isLatex
                                            ? 'text-stone-400 group-hover:text-stone-700'
                                            : 'text-zinc-500 group-hover:text-zinc-200'
                                }`} />

                                {/* Label */}
                                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider transition-colors duration-300 leading-none ${
                                    (isActive || isSettingsOpen)
                                        ? colors.text
                                        : isLatex
                                            ? 'text-stone-400 group-hover:text-stone-600'
                                            : 'text-zinc-600 group-hover:text-zinc-300'
                                }`}>
                                    {pillar.shortLabel}
                                </span>

                                {/* Tooltip on desktop */}
                                <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg text-[9px] font-mono whitespace-nowrap
                                    opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 
                                    transition-all duration-200 pointer-events-none z-50
                                    ${isLatex
                                        ? 'bg-stone-800 text-stone-100'
                                        : 'bg-zinc-900 border border-white/10 text-zinc-200'
                                    }`}
                                >
                                    {pillar.label}
                                    <br />
                                    <span className={`text-[8px] ${isLatex ? 'text-stone-400' : 'text-zinc-500'}`}>{pillar.description}</span>
                                </div>
                            </button>
                        );
                    })}

                    {/* Divider */}
                    <div className={`w-px self-stretch mx-1 ${isLatex ? 'bg-stone-200' : 'bg-white/10'}`} />

                    {/* OmniBar trigger button */}
                    <button
                        onClick={() => setActivePanel(p => p === 'omni' ? null : 'omni')}
                        title="Command Console (⌘K)"
                        aria-label="Open Command Console"
                        className={`group relative flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-300 cursor-pointer min-w-[52px]
                            ${activePanel === 'omni'
                                ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                                : isLatex
                                    ? 'border-transparent hover:bg-stone-100 hover:border-stone-200'
                                    : 'border-transparent hover:bg-white/5 hover:border-white/10'
                            }`}
                    >
                        <Command className={`w-5 h-5 transition-colors duration-300 ${
                            activePanel === 'omni'
                                ? 'text-amber-400'
                                : isLatex ? 'text-stone-400 group-hover:text-stone-700' : 'text-zinc-500 group-hover:text-zinc-200'
                        }`} />
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider leading-none transition-colors duration-300 ${
                            activePanel === 'omni' ? 'text-amber-400' : isLatex ? 'text-stone-400' : 'text-zinc-600'
                        }`}>
                            ⌘K
                        </span>
                    </button>
                </div>
            </motion.div>
        </>
    );
}
