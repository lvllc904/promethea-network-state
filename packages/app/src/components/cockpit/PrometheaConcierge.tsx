'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, UploadCloud, FileText, Coins, Users, CheckCircle2, ChevronRight, ShieldCheck, Send, Loader2, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { useHUD } from '@/lib/hud-store';
import { askPrometheaAction, textToSpeechAction } from '@/app/actions';

interface PrometheaConciergeProps {
    onLaunchAssetModal: () => void;
}

type Message = { role: 'user' | 'assistant'; content: string };

export function PrometheaConcierge({ onLaunchAssetModal }: PrometheaConciergeProps) {
    const { setHUDState, competencyLevel } = useHUD();

    // ── Document Drop ────────────────────────────────────────
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);

    // ── Chat (wired to real askPrometheaAction) ──────────────
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [chatExpanded, setChatExpanded] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // ── Intent Action Cards ──────────────────────────────────
    const intentCards = [
        {
            title: 'Onboard RWA Property / Hardware',
            desc: 'Attach title deed PDF & auto-file UCC-1 financing statement',
            icon: UploadCloud,
            color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-400',
            prompt: 'I want to onboard a real-world asset. Walk me through the process.',
            action: () => onLaunchAssetModal()
        },
        {
            title: 'Form Delaware Series LLC & Fund Package',
            desc: 'Generate SEC Rule 506(c) PPM, LPA & Operating Agreements',
            icon: FileText,
            color: 'from-sky-500/20 to-indigo-500/10 border-sky-500/30 text-sky-400 hover:border-sky-400',
            prompt: 'Help me form a Delaware Series LLC and generate the fund documents.',
            action: () => setHUDState({ activePillar: 'ECONOMICS' as any, cockpitHoldingsTab: 'FINANCIALS' })
        },
        {
            title: 'Audit Sovereign Treasury & FCF Yield',
            desc: 'Inspect metabolic waterfalls & liquid USDC balance',
            icon: Coins,
            color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400 hover:border-amber-400',
            prompt: 'Give me a full audit of my sovereign treasury and current FCF yield.',
            action: () => setHUDState({ cockpitHoldingsTab: 'FINANCIALS' })
        },
        {
            title: 'Disburse Sweat Equity to Syndicate',
            desc: 'Calculate risk multipliers & assign yield equity shares',
            icon: Users,
            color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400 hover:border-purple-400',
            prompt: 'Help me calculate and disburse sweat equity shares to my syndicate members.',
            action: () => setHUDState({ cockpitHoldingsTab: 'SWEAT' })
        }
    ];

    // ── Handlers ─────────────────────────────────────────────
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            const file = e.dataTransfer.files[0];
            setUploadedFile(file.name);
            setIsParsing(true);
            // Auto-inject a Promethea message about the doc
            setTimeout(() => {
                setIsParsing(false);
                setChatExpanded(true);
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: `📄 I've received **${file.name}**. I'm parsing the legal bounds, extracting ownership metadata, and preparing your Delaware Series filing and UCC-1 statement. One moment...` }
                ]);
                onLaunchAssetModal();
            }, 1200);
        }
    };

    const handleSend = async (overrideText?: string) => {
        const text = (overrideText ?? chatInput).trim();
        if (!text) return;
        setChatInput('');
        setChatExpanded(true);
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setIsTyping(true);

        try {
            const result = await askPrometheaAction({
                query: text,
                constitutionContent: 'The Promethean Constitution defines a post-dominion social contract where all intelligent beings coexist as peers.',
                whitePaperContent: 'The Promethean White Paper outlines the vision for a decentralized network state built on sweat equity, AI integration, and sovereign identity.'
            });

            if ('error' in result) {
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${result.error}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
                if (isVoiceEnabled) {
                    try {
                        const voiceResult = await textToSpeechAction(result.response);
                        if ('audio' in voiceResult) {
                            if (audioRef.current) audioRef.current.pause();
                            const audio = new Audio(voiceResult.audio);
                            audioRef.current = audio;
                            audio.play();
                        }
                    } catch { /* voice optional */ }
                }
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'An unexpected error occurred. Please try again.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleCardClick = (card: typeof intentCards[0]) => {
        // Trigger the nav action AND inject the prompt into the chat
        card.action();
        handleSend(card.prompt);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-[#090d16]/90 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl shadow-2xl z-40 relative pointer-events-auto overflow-hidden flex flex-col"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(255,255,255,0.06)' }}
        >
            {/* Ambient glows */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center animate-pulse">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-[11px] font-bold text-white tracking-wide font-data">PROMETHEA SOVEREIGN AGENT</h2>
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[7px] font-mono font-bold tracking-widest border border-emerald-500/30">
                                Frictionless Concierge
                            </span>
                        </div>
                        <p className="text-[9.5px] text-zinc-400 font-label mt-0.5">
                            Your sovereign AI steward — guiding assets, legal structuring &amp; syndicate ops
                        </p>
                    </div>
                </div>

                {/* Competency Switcher + Voice toggle */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={() => setIsVoiceEnabled(v => !v)}
                        className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
                        title={isVoiceEnabled ? 'Disable Voice' : 'Enable Voice'}
                    >
                        {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                    <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-xl border border-white/5">
                        {(['NOVICE', 'OPERATOR', 'ARCHITECT'] as const).map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => setHUDState({ competencyLevel: lvl })}
                                className={`px-1.5 py-0.5 rounded-lg text-[7px] font-mono font-bold transition-all ${
                                    competencyLevel === lvl ? 'bg-emerald-500 text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                {lvl === 'NOVICE' ? 'Guided' : lvl === 'OPERATOR' ? 'Operator' : 'Full Matrix'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Integrated Chat Thread ─────────────────────── */}
            <AnimatePresence>
                {chatExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 200, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-b border-white/5"
                    >
                        <div ref={chatScrollRef} className="h-full overflow-y-auto custom-scrollbar px-4 py-3 flex flex-col gap-2">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[10px] leading-relaxed font-label ${
                                        msg.role === 'user'
                                            ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30'
                                            : 'bg-white/5 text-zinc-300 border border-white/5'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/5 rounded-xl px-3 py-2">
                                        <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Document Dropzone ──────────────────────────── */}
            <div className="px-5 pt-3 pb-2">
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-2.5 transition-all flex items-center gap-3 cursor-pointer ${
                        dragActive
                            ? 'border-emerald-400 bg-emerald-500/10'
                            : 'border-white/10 hover:border-emerald-500/40 bg-white/[0.015]'
                    }`}
                    onClick={onLaunchAssetModal}
                >
                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <UploadCloud className={`w-3.5 h-3.5 ${dragActive ? 'text-emerald-400 animate-bounce' : 'text-zinc-400'}`} />
                    </div>
                    {isParsing ? (
                        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            PROMETHEA PARSING LEGAL DEED & UCC-1 METADATA...
                        </div>
                    ) : uploadedFile ? (
                        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Attached: {uploadedFile}
                        </div>
                    ) : (
                        <div>
                            <p className="text-[10px] font-semibold text-zinc-200 font-data">Drag & drop legal deeds, title certificates or UCC-1 docs</p>
                            <p className="text-[8.5px] text-zinc-500 font-label">Promethea auto-parses & pre-fills your Delaware Series filing</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Guided Action Cards ────────────────────────── */}
            <div className="px-5 pb-3 space-y-1.5">
                <div className="flex items-center justify-between text-[8.5px] font-mono text-zinc-400 uppercase tracking-widest px-0.5">
                    <span>Guided Action Wheel</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Promethea Ready
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {intentCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleCardClick(card)}
                                className={`p-2.5 rounded-xl border bg-gradient-to-br ${card.color} text-left transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between group`}
                            >
                                <div className="flex items-start justify-between mb-1.5">
                                    <div className="p-1 rounded-lg bg-black/40 border border-white/10">
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                </div>
                                <div>
                                    <h4 className="text-[10.5px] font-bold text-white font-data mb-0.5 leading-tight">{card.title}</h4>
                                    <p className="text-[8.5px] text-zinc-400 font-label leading-tight">{card.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Integrated Chat Input (bottom of card) ──────── */}
            <div className="border-t border-white/5 px-4 py-3 flex items-center gap-2">
                <button
                    onClick={() => setChatExpanded(v => !v)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-400 transition-colors shrink-0"
                    title="Toggle chat history"
                >
                    <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask Promethea anything... (list an asset, form an LLC, audit treasury)"
                    className="flex-1 bg-transparent text-[10.5px] text-white placeholder:text-zinc-600 border-none focus:outline-none font-label"
                />
                <button
                    onClick={() => handleSend()}
                    disabled={!chatInput.trim() || isTyping}
                    className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30 transition-all shrink-0"
                >
                    {isTyping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 px-4 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[8.5px] font-data text-zinc-500">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    <span>Level: <strong className="text-zinc-300 uppercase">{competencyLevel}</strong></span>
                </div>
                <span className="text-zinc-600 font-mono text-[7.5px]">Sidebars unlock as competency scales →</span>
            </div>
        </motion.div>
    );
}
