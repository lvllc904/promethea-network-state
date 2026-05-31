'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHUD } from '@/lib/hud-store';
import { X, Send, Loader2, BrainCircuit } from 'lucide-react';
import { askPrometheaAction } from '@/app/actions';

export const ContextChat = ({ activePillar }: { activePillar: string }) => {
    const { pendingCoPilotPrompt, setHUDState, activateAssetCanvas } = useHUD();
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const handleSendRef = useRef<(customPrompt?: string) => Promise<void>>();

    // Dynamic initial message based on active pillar context
    useEffect(() => {
        let initialMsg = "Sovereign core initialized. How shall we coordinate today?";
        switch (activePillar) {
            case 'ECONOMICS':
                initialMsg = "Circular Schweizer Franc reserves and yield pools are locked. Ask me to draft sweeps, audit waterfall flows, or check asset listing parameters.";
                break;
            case 'GOVERNANCE':
                initialMsg = "Constitutional quadratic voting parameters and syndication milestones are active. Ask me to structure proposal models or check reputation requirements.";
                break;
            case 'NARRATIVE':
                initialMsg = "Broadcasting narrative syndication channels in steady-state. Ask me to compile active network newsletters or edit public broadcast text.";
                break;
            case 'DIPLOMATIC':
                initialMsg = "Sovereign passport credentials and security handshakes are authenticated. Ask me to verify citizen bounds or review external state treaties.";
                break;
            case 'PULSE':
                initialMsg = "Substrate transaction flows and active boids are operating in homeostasis. Ask me to analyze telemetry spikes or read live MCP bridge logs.";
                break;
        }
        setMessages([{ role: 'assistant', content: initialMsg }]);
    }, [activePillar]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (customPrompt?: string) => {
        const promptText = customPrompt !== undefined ? customPrompt : input;
        if (!promptText.trim() || isTyping) return;
        const userMsg = promptText.trim();
        if (customPrompt === undefined) {
            setInput('');
        }
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        try {
            const systemContext = `You are advising the citizen inside the ${activePillar} cockpit drawer on the Promethean Network State. Align all answers directly to this module context. Keep answers extremely direct, operational, and brief (2-3 sentences max).`;
            const res = await askPrometheaAction({
                query: userMsg,
                constitutionContent: systemContext,
                whitePaperContent: `Active pillar context: ${activePillar}`
            });

            if ('error' in res) {
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${res.error}` }]);
            } else {
                let responseText = res.response;
                // Parse [UI_OVERRIDE: FOCUS_ASSET: <TICKER>]
                const overrideMatch = responseText.match(/\[UI_OVERRIDE:\s*FOCUS_ASSET:\s*(.*?)\]/i);
                if (overrideMatch) {
                    const ticker = overrideMatch[1].trim();
                    if (ticker) {
                        activateAssetCanvas(ticker);
                    }
                    responseText = responseText.replace(/\[UI_OVERRIDE:\s*FOCUS_ASSET:\s*(.*?)\]/gi, '').trim();
                }
                setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Bridge link interrupted. Re-connecting..." }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Keep handleSendRef updated
    useEffect(() => {
        handleSendRef.current = handleSend;
    });

    // Automatically trigger co-pilot when pending evaluation prompt is set
    useEffect(() => {
        if (pendingCoPilotPrompt) {
            const prompt = pendingCoPilotPrompt;
            setHUDState({ pendingCoPilotPrompt: null });
            handleSendRef.current?.(prompt);
        }
    }, [pendingCoPilotPrompt, setHUDState]);

    return (
        <div className="flex-1 flex flex-col justify-end bg-teal-950/30 p-3 h-full">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-400/20 pb-1.5 shrink-0">
                <span className="text-[7.5px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                    <BrainCircuit className="w-3 h-3 text-cyan-400 animate-pulse" /> Promethea Co-Pilot // {activePillar}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            </div>

            {/* Scrollable conversation */}
            <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent mt-2"
            >
                {messages.map((m, idx) => (
                    <div key={idx} className="space-y-0.5">
                        <p className={`text-[6.5px] font-mono font-bold uppercase tracking-wider ${m.role === 'user' ? 'text-cyan-400' : 'text-zinc-500'}`}>
                            {m.role === 'user' ? 'Citizen' : 'Promethea'}
                        </p>
                        <p className="text-[9px] font-mono text-zinc-300 leading-relaxed break-words">{m.content}</p>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-center gap-1.5 py-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-cyan-400" />
                        <span className="text-[7.5px] font-mono uppercase text-zinc-500 animate-pulse">Analyzing focus...</span>
                    </div>
                )}
            </div>

            {/* Input bar */}
            <div className="flex gap-1.5 pt-2 shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                    placeholder={`Direct prompt relative to ${(activePillar || 'SYSTEM').toLowerCase()}...`}
                    className="flex-1 bg-teal-950/40 border border-cyan-400/20 rounded px-2.5 py-1.5 text-[8.5px] font-mono text-white placeholder-cyan-700/50 focus:outline-none focus:border-cyan-400/60 transition-colors"
                />
                <button
                    onClick={() => handleSend()}
                    disabled={isTyping}
                    className="px-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 text-black rounded transition-colors flex items-center justify-center"
                >
                    <Send className="w-2.5 h-2.5" />
                </button>
            </div>
        </div>
    );
};
