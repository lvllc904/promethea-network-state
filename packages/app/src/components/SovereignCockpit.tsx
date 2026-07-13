'use client';

import React, { useState, useEffect } from 'react';
import { useBodyHandshake } from '@/lib/body-handshake';
import { useSovereignLayout } from '@/lib/sovereign-layout';
import { WidgetRenderer } from './WidgetRenderer';
import { useUser } from '@promethea/sovereign-store';
import { useHardwareHandshake } from '@promethea/hooks';
import { Terminal } from 'lucide-react';
import { SovereignCommandMatrix } from './SovereignCommandMatrix';
import { useMesh } from '@/components/providers/mesh-provider';
import { motion } from 'framer-motion';

interface SovereignCockpitProps {
    title: string;
    description: string;
    stats?: { label: string; value: string; color?: string }[];
    actions?: { label: string; action: string; params?: any }[];
    tabs?: { id: string; label: string; icon: React.ReactNode; content: React.ReactNode }[];
}

export const SovereignCockpit: React.FC<SovereignCockpitProps> = ({ 
    title, 
    description, 
    stats,
    actions,
    tabs
}) => {
    const { executeIntent, isProcessing } = useBodyHandshake();
    const { layout, isLoading } = useSovereignLayout();
    const [activeTab, setActiveTab] = useState(tabs?.[0]?.id);
    const [isMatrixOpen, setIsMatrixOpen] = useState(false);
    const [renderMode, setRenderMode] = useState<'CORE' | 'NEXUS' | 'APEX'>('NEXUS');
    const { profile, isLoading: isHardwareLoading } = useHardwareHandshake();
    const { user } = useUser();
    const { themeState } = useMesh();

    const currentTheme = themeState?.theme || 'dark';
    const isLatex = currentTheme === 'theme-latex';

    // Fallback to anonymous identity if no auth is configured in this env
    useEffect(() => {
        if (!activeTab && tabs && tabs.length > 0) {
            setActiveTab(tabs[0].id);
        }
    }, [tabs, activeTab]);

    // BODY 2: ROLE-BASED ACCESS CONTROL
    const role = user?.uid === 'anonymous' ? 'PUBLIC' : 'CITIZEN';

    const handleQuickAction = async (action: string, params?: any) => {
        await executeIntent({
            body: 2,
            action,
            params,
            permissionLevel: 'CITIZEN'
        });
    };

    const currentTabContent = tabs?.find(t => t.id === activeTab)?.content;

    // Theme adaptive styles
    const cockpitBg = isLatex 
        ? "bg-[#fdfcf7]/60 border-stone-200/80 shadow-[0_8px_32px_rgba(28,25,23,0.05)] text-stone-900" 
        : "bg-zinc-950/40 border-white/5 shadow-2xl text-white";

    const headerBg = isLatex
        ? "bg-stone-50/80 border-b border-stone-200/50"
        : "bg-gradient-to-b from-white/[0.03] to-transparent border-b border-white/5";

    const titleColor = isLatex ? "text-stone-900" : "text-white";
    const descColor = isLatex ? "text-stone-500" : "text-zinc-400";
    const pipeColor = isLatex ? "text-stone-300" : "text-zinc-600";
    const roleColor = isLatex ? "text-amber-800" : "text-emerald-400";

    const contextSwitcherBg = isLatex
        ? "bg-stone-100/50 hover:bg-stone-100/80 border-stone-200/60 hover:border-stone-200"
        : "bg-white/[0.02] hover:bg-white/[0.04] border-white/5 hover:border-white/10";

    const contextSelectText = isLatex
        ? "text-amber-900 hover:text-amber-950"
        : "text-emerald-400 hover:text-emerald-300";

    const optionClass = isLatex ? "bg-[#fdfcf7] text-stone-900" : "bg-zinc-950 text-white";

    const actionBtnClass = isLatex
        ? "bg-amber-800/10 hover:bg-amber-800 text-amber-950 hover:text-white border-amber-800/20 hover:border-amber-800/40"
        : "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 hover:border-emerald-500/40";

    const statLabelColor = isLatex ? "text-stone-500" : "text-zinc-500";
    
    const getStatValueColor = (originalColor?: string) => {
        if (isLatex) {
            if (!originalColor || originalColor.includes('emerald') || originalColor.includes('text-emerald')) {
                return "text-amber-900 drop-shadow-sm";
            }
            return originalColor.replace('text-emerald-400', 'text-amber-900').replace('text-emerald-500', 'text-amber-950').replace('drop-shadow-[0_0_8px_rgba(52,211,153,0.15)]', '');
        }
        return originalColor || 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.15)]';
    };

    const tierBadgeClass = isLatex
        ? "text-stone-500 bg-stone-100/50 border-stone-200/60"
        : "text-zinc-500 bg-white/[0.02] border-white/5";

    const engineCtrlClass = isLatex
        ? "from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-stone-50 shadow-[0_4px_20px_rgba(120,53,4,0.15)] hover:shadow-[0_4px_30px_rgba(120,53,4,0.25)]"
        : "from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.4)]";

    const toggleContainerClass = isLatex
        ? "bg-stone-100/50 border-stone-200/60"
        : "bg-white/[0.02] border-white/5";

    const getToggleBtnClass = (mode: string) => {
        if (renderMode === mode) {
            return isLatex
                ? "bg-amber-800 text-white shadow-[0_2px_8px_rgba(120,53,4,0.15)]"
                : "bg-emerald-500 text-zinc-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]";
        } else {
            return isLatex
                ? "text-stone-400 hover:text-stone-700"
                : "text-zinc-500 hover:text-zinc-300";
        }
    };

    const settingsBtnClass = isLatex
        ? "bg-stone-100/50 hover:bg-stone-100/80 border-stone-200/60 hover:border-stone-200 text-stone-500 hover:text-stone-900"
        : "bg-white/[0.02] hover:bg-white/[0.05] border-white/5 hover:border-white/10 text-zinc-400 hover:text-white";

    const tabsContainerClass = isLatex
        ? "border-stone-200/50 bg-stone-100/20"
        : "border-b border-white/5 bg-white/[0.01]";

    const getTabBtnClass = (id: string) => {
        if (activeTab === id) {
            return isLatex
                ? "border-amber-800 text-amber-950 bg-amber-800/[0.02]"
                : "border-emerald-500 text-emerald-400 bg-emerald-500/[0.02]";
        } else {
            return isLatex
                ? "border-transparent text-stone-400 hover:text-stone-700"
                : "border-transparent text-zinc-500 hover:text-zinc-300";
        }
    };

    const viewportBgClass = isLatex
        ? "bg-[#fdfcf7]/30"
        : "bg-zinc-950/20";

    const widgetCardClass = isLatex
        ? "bg-stone-100/40 hover:bg-stone-100/60 border-stone-200/60 hover:border-stone-200 shadow-md"
        : "bg-white/[0.01] hover:bg-white/[0.02] border-white/5 hover:border-white/10 shadow-xl";

    const widgetLabelClass = isLatex
        ? "text-stone-400"
        : "text-zinc-500";

    const widgetSyncClass = isLatex
        ? "text-amber-800/75"
        : "text-emerald-500/75";

    const widgetBlinkerClass = isLatex
        ? "bg-amber-700"
        : "bg-emerald-500";

    return (
        <div className={`flex flex-col h-full min-h-[500px] backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 relative group/cockpit ${cockpitBg}`}>
            {/* Ultra-Minimal Header */}
            <div className={`px-6 py-4 flex flex-col lg:flex-row gap-4 justify-between items-center ${headerBg}`}>
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className={`text-xl font-black tracking-tight uppercase ${titleColor}`}>{title}</h1>
                        <p className={`text-[10px] font-bold tracking-widest mt-0.5 uppercase ${descColor}`}>
                            {description} <span className={`${pipeColor} mx-2 opacity-50`}>|</span> <span className={`${roleColor}`}>{role}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* The Omni-Matrix Trigger - Elevated to a sleek FAB-style button in the header */}
                    <button 
                        onClick={() => setIsMatrixOpen(true)}
                        className={`px-4 py-2 bg-gradient-to-r hover:opacity-95 text-[10px] font-extrabold uppercase tracking-widest rounded-full flex items-center gap-2 transition-all duration-300 ${engineCtrlClass}`}
                    >
                        <Terminal className="w-3.5 h-3.5" />
                        Command Matrix
                    </button>
                </div>
            </div>

            <SovereignCommandMatrix isOpen={isMatrixOpen} onClose={() => setIsMatrixOpen(false)} />

            {/* Tab Navigation (if provided) */}
            {tabs && (
                <div className={`flex px-4 gap-1 ${tabsContainerClass}`}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 relative ${activeTab === tab.id ? (isLatex ? 'text-amber-950' : 'text-emerald-400') : (isLatex ? 'text-stone-400 hover:text-stone-700' : 'text-zinc-500 hover:text-zinc-300')}`}
                        >
                            {tab.icon}
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeCockpitTab"
                                    className={`absolute bottom-0 left-0 right-0 h-[2px] ${isLatex ? 'bg-amber-800' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,211,153,0.8)]'}`}
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Command Viewport */}
            <div className={`flex-1 overflow-y-auto p-6 ${viewportBgClass}`}>
                {tabs ? (
                    <div className="h-full">
                        {currentTabContent || (tabs.length > 0 ? tabs[0].content : null)}
                    </div>
                ) : isLoading ? (
                    <div className={`flex items-center justify-center h-64 text-xs font-black uppercase tracking-[0.3em] animate-pulse ${isLatex ? 'text-amber-800' : 'text-emerald-500'}`}>
                        Synchronizing Sovereign Layout...
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-4">
                        {layout?.widgets.map((widget) => (
                            <div 
                                key={widget.id} 
                                className="col-span-12"
                                style={{ gridColumn: `span ${widget.position.w}` }}
                            >
                                <div className={`p-4 border rounded-2xl transition-all duration-300 ${widgetCardClass}`}>
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <span className={`text-[8px] font-mono font-bold uppercase tracking-widest ${widgetLabelClass}`}>{widget.pillar} // {widget.title}</span>
                                        <span className={`flex items-center gap-1 text-[8px] font-mono font-bold tracking-wider ${widgetSyncClass}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${widgetBlinkerClass}`} /> SYNCED
                                        </span>
                                    </div>
                                    <WidgetRenderer config={widget} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};
