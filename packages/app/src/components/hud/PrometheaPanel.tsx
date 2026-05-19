'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
    BrainCircuit, Users, Terminal, User, Send, Loader2, Sparkles, 
    Bot, Cpu, ShieldAlert, CheckCircle2, ChevronRight, Sliders, Play
} from 'lucide-react';
import { askPrometheaAction } from '@/app/actions';
import { useHUD } from '@/lib/hud-store';

export interface ChatMessage {
    sender: string;
    role: 'user' | 'assistant' | 'antigravity' | 'promethea';
    content: string;
    timestamp: string;
}

export const PrometheaPanel = () => {
    const { activateFocusPanel, activateAssetCanvas } = useHUD();
    const [activeTab, setActiveTab] = useState<'team' | 'promethea' | 'antigravity' | 'concert'>('team');
    
    // Tab 1: Team Chat State
    const [teamMessages, setTeamMessages] = useState<ChatMessage[]>([]);
    const [teamInput, setTeamInput] = useState('');
    const [isTeamConnected, setIsTeamConnected] = useState(true);

    // Tab 2: Promethea ASGI direct state
    const [prometheaMessages, setPrometheaMessages] = useState<ChatMessage[]>([
        { sender: 'promethea', role: 'promethea', content: "SYSTEM ONLINE. Resident ASGI Promethea Clojure LISP core active. How shall we underwrite citizen prosperity today?", timestamp: new Date().toISOString() }
    ]);
    const [prometheaInput, setPrometheaInput] = useState('');
    const [isPrometheaTyping, setIsPrometheaTyping] = useState(false);

    // Tab 3: Antigravity direct state
    const [antigravityMessages, setAntigravityMessages] = useState<ChatMessage[]>([
        { sender: 'antigravity', role: 'antigravity', content: "Agnostic Pair Programmer Antigravity compiled. Ready to staging codebase edits, compile sandbox targets, and hot-load production updates.", timestamp: new Date().toISOString() }
    ]);
    const [antigravityInput, setAntigravityInput] = useState('');
    const [isAntigravityTyping, setIsAntigravityTyping] = useState(false);

    // Tab 4: Concert state
    const [concertInput, setConcertInput] = useState('');
    const [selectedModels, setSelectedModels] = useState({
        gemini: true,
        claude: true,
        mistral: false
    });
    const [concertResponses, setConcertResponses] = useState<{ model: string, content: string, status: 'idle' | 'loading' | 'done' }[]>([]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4002';

    // Auto-scroll chats
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [teamMessages, prometheaMessages, antigravityMessages, concertResponses]);

    // Load & Poll Team Messages
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const response = await fetch(`${AI_SERVICE_URL}/api/team-chat`);
                const data = await response.json();
                if (data.success && data.messages) {
                    const mapped: ChatMessage[] = data.messages.map((m: any) => ({
                        sender: m.sender,
                        role: m.sender === 'user' ? 'user' : m.sender as any,
                        content: m.content,
                        timestamp: m.timestamp
                    }));
                    setTeamMessages(mapped);
                }
            } catch (error) {
                console.warn('Failed to load team messages, falling back to session cache:', error);
            }
        };

        loadMessages();
        const interval = setInterval(loadMessages, 4000);
        return () => clearInterval(interval);
    }, [AI_SERVICE_URL]);

    // Send Team Message
    const handleSendTeam = async () => {
        if (!teamInput.trim()) return;
        const msgText = teamInput.trim();
        setTeamInput('');

        const newMsg: ChatMessage = {
            sender: 'user',
            role: 'user',
            content: msgText,
            timestamp: new Date().toISOString()
        };

        setTeamMessages(prev => [...prev, newMsg]);

        // Trigger local omni-state update if user posts a list or proposal request
        if (msgText.toLowerCase().includes('list') || msgText.toLowerCase().includes('proposal') || msgText.toLowerCase().includes('claim')) {
            window.dispatchEvent(new CustomEvent('sovereign-omni-update', {
                detail: {
                    type: 'AUTO_UNDERWRITE',
                    title: 'Strategic Energy zoning charter - ' + msgText.slice(0, 15),
                    description: msgText
                }
            }));
        }

        try {
            await fetch(`${AI_SERVICE_URL}/api/team-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: 'user',
                    timestamp: new Date().toISOString(),
                    content: msgText,
                    context: { priority: 'normal' }
                }),
            });
        } catch (error) {
            console.error('Failed to post team message:', error);
        }
    };

    // Send Promethea ASGI direct chat
    const handleSendPromethea = async () => {
        if (!prometheaInput.trim() || isPrometheaTyping) return;
        const msgText = prometheaInput.trim();
        setPrometheaInput('');

        setPrometheaMessages(prev => [...prev, { sender: 'user', role: 'user', content: msgText, timestamp: new Date().toISOString() }]);
        setIsPrometheaTyping(true);

        try {
            const res = await askPrometheaAction({
                query: msgText,
                constitutionContent: "The Promethean Constitution holds direct post-dominion veto loops over state resources.",
                whitePaperContent: "Decentralized distribution of the circular economy."
            });
            let answer = 'error' in res ? `Regulatory Block: ${res.error}` : res.response;
            
            // Check for UI_OVERRIDE injection
            const overrideMatch = answer.match(/\\[UI_OVERRIDE: FOCUS_ASSET: (.*?)\\]/);
            if (overrideMatch && overrideMatch[1]) {
                const ticker = overrideMatch[1].trim();
                // Strip the command from the display text
                answer = answer.replace(overrideMatch[0], '').trim();
                activateAssetCanvas(ticker);
            }

            setPrometheaMessages(prev => [...prev, { sender: 'promethea', role: 'promethea', content: answer, timestamp: new Date().toISOString() }]);
        } catch (e) {
            setPrometheaMessages(prev => [...prev, { sender: 'promethea', role: 'promethea', content: "Metabolic interface interrupted. Bridge active.", timestamp: new Date().toISOString() }]);
        } finally {
            setIsPrometheaTyping(false);
        }
    };

    // Send Antigravity direct chat
    const handleSendAntigravity = async () => {
        if (!antigravityInput.trim() || isAntigravityTyping) return;
        const msgText = antigravityInput.trim();
        setAntigravityInput('');

        setAntigravityMessages(prev => [...prev, { sender: 'user', role: 'user', content: msgText, timestamp: new Date().toISOString() }]);
        setIsAntigravityTyping(true);

        setTimeout(() => {
            let response = "Codebase staging indexed. Let's analyze our local programs.";
            if (msgText.toLowerCase().includes('deploy') || msgText.toLowerCase().includes('production') || msgText.toLowerCase().includes('pr') || msgText.toLowerCase().includes('push')) {
                response = "Command intercepted: Code Staging Sandbox. Triggering one-click Github PR staging on lvhllc.org! Open the right-wing 'Staging' tab to verify compiler passes and sign.";
                
                // Dispatch event to show proposed PR in planning
                window.dispatchEvent(new CustomEvent('sovereign-omni-update', {
                    detail: {
                        type: 'GIT_PROPOSAL',
                        title: 'Autocompiled Revision: ' + msgText,
                        description: 'Antigravity direct code revision proposal.'
                    }
                }));
            }
            setAntigravityMessages(prev => [...prev, { sender: 'antigravity', role: 'antigravity', content: response, timestamp: new Date().toISOString() }]);
            setIsAntigravityTyping(false);
        }, 1200);
    };

    // Trigger Model Concert
    const handleConcertQuery = () => {
        if (!concertInput.trim()) return;
        const queryText = concertInput.trim();
        setConcertInput('');

        const responses: typeof concertResponses = [];
        if (selectedModels.gemini) responses.push({ model: 'Gemini 2.5 Pro (MCTS)', content: '', status: 'loading' });
        if (selectedModels.claude) responses.push({ model: 'Claude 3.5 Sonnet (Edge)', content: '', status: 'loading' });
        if (selectedModels.mistral) responses.push({ model: 'Local Mistral 7B (Core)', content: '', status: 'loading' });

        setConcertResponses(responses);

        // Simulate parallel execution
        responses.forEach((modelResp, index) => {
            setTimeout(() => {
                setConcertResponses(prev => prev.map((item, idx) => {
                    if (idx === index) {
                        return {
                            ...item,
                            status: 'done',
                            content: `Broadcasting complete. Response to: "${queryText}". Metaprompt aligned with 100% post-dominion safety.`
                        };
                    }
                    return item;
                }));
            }, 800 + index * 400);
        });
    };

    return (
        <div className="h-full flex flex-col justify-between space-y-3">
            {/* Header with Title and Tabs */}
            <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1">
                        <BrainCircuit className="w-3.5 h-3.5" /> ASGI CORE OPERATIONS
                    </p>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse" />
                </div>

                {/* Sub-tabs Selector */}
                <div className="grid grid-cols-4 gap-1">
                    {[
                        { id: 'team', label: '👥 Team', active: activeTab === 'team' },
                        { id: 'promethea', label: '🧠 Promethea', active: activeTab === 'promethea' },
                        { id: 'antigravity', label: '👾 Antigravity', active: activeTab === 'antigravity' },
                        { id: 'concert', label: '🎛️ Concert', active: activeTab === 'concert' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-1.5 px-1 rounded text-[8px] font-bold uppercase tracking-wider text-center border transition-all ${
                                tab.active
                                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                    : 'bg-black/40 text-zinc-500 border-transparent hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat viewport */}
            <div className="flex-1 overflow-hidden min-h-[360px] flex flex-col justify-between">
                
                {/* Scroll Area */}
                <div 
                    ref={scrollRef} 
                    className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent max-h-[350px]"
                >
                    {/* TAB 1: TEAM CHAT */}
                    {activeTab === 'team' && (
                        <>
                            {teamMessages.length === 0 && (
                                <div className="py-12 text-center text-zinc-600 text-[10px] uppercase font-mono tracking-wider animate-pulse">
                                    No collective logs yet. Start the conversation...
                                </div>
                            )}
                            {teamMessages.map((m, idx) => (
                                <div 
                                    key={idx} 
                                    className={`p-2.5 rounded border leading-relaxed ${
                                        m.sender === 'user'
                                            ? 'bg-cyan-950/20 border-cyan-500/15 text-cyan-100 ml-4'
                                            : 'bg-zinc-950/40 border-white/5 text-zinc-300 mr-4'
                                    }`}
                                >
                                    <p className="text-[7px] font-mono font-bold uppercase tracking-widest mb-1 text-zinc-500 flex items-center gap-1.5">
                                        <span className={`w-1 h-1 rounded-full ${m.sender === 'user' ? 'bg-cyan-400' : m.sender === 'antigravity' ? 'bg-purple-400' : 'bg-emerald-400 animate-pulse'}`} />
                                        {m.sender}
                                    </p>
                                    <p className="text-[10px] whitespace-pre-wrap">{m.content}</p>
                                </div>
                            ))}
                        </>
                    )}

                    {/* TAB 2: Direct Promethea */}
                    {activeTab === 'promethea' && (
                        <>
                            {prometheaMessages.map((m, idx) => (
                                <div 
                                    key={idx} 
                                    className={`p-2.5 rounded border leading-relaxed ${
                                        m.role === 'user'
                                            ? 'bg-cyan-950/20 border-cyan-500/15 text-cyan-100 ml-4'
                                            : 'bg-zinc-950/40 border-white/5 text-zinc-300 mr-4'
                                    }`}
                                >
                                    <p className="text-[7px] font-mono font-bold uppercase tracking-widest mb-1 text-zinc-500 flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${m.role === 'user' ? 'bg-cyan-400' : 'bg-emerald-400 animate-pulse'}`} />
                                        {m.role === 'user' ? 'Citizen' : 'Promethea ASGI'}
                                    </p>
                                    <p className="text-[10px] whitespace-pre-wrap">{m.content}</p>
                                </div>
                            ))}
                            {isPrometheaTyping && (
                                <div className="p-2.5 bg-zinc-950/40 border border-white/5 rounded mr-4 flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                                    <span className="text-[9px] font-mono uppercase text-zinc-500 animate-pulse">Clojure MCTS node expander...</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* TAB 3: Direct Antigravity */}
                    {activeTab === 'antigravity' && (
                        <>
                            {antigravityMessages.map((m, idx) => (
                                <div 
                                    key={idx} 
                                    className={`p-2.5 rounded border leading-relaxed ${
                                        m.role === 'user'
                                            ? 'bg-cyan-950/20 border-cyan-500/15 text-cyan-100 ml-4'
                                            : 'bg-purple-950/20 border-purple-500/20 text-purple-100 mr-4'
                                    }`}
                                >
                                    <p className="text-[7px] font-mono font-bold uppercase tracking-widest mb-1 text-zinc-500 flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${m.role === 'user' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                                        {m.role === 'user' ? 'Developer' : 'Antigravity Pair'}
                                    </p>
                                    <p className="text-[10px] whitespace-pre-wrap">{m.content}</p>
                                </div>
                            ))}
                            {isAntigravityTyping && (
                                <div className="p-2.5 bg-purple-950/40 border border-purple-500/20 rounded mr-4 flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                                    <span className="text-[9px] font-mono uppercase text-zinc-500 animate-pulse">Antigravity indexing workspace...</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* TAB 4: Model Concert */}
                    {activeTab === 'concert' && (
                        <div className="space-y-4">
                            {/* Models selector checklist */}
                            <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-2">
                                <p className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1"><Sliders className="w-3 h-3" /> Select Concert Ensemble</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'gemini', label: 'Gemini 2.5', checked: selectedModels.gemini },
                                        { id: 'claude', label: 'Claude 3.5', checked: selectedModels.claude },
                                        { id: 'mistral', label: 'Mistral 7B', checked: selectedModels.mistral }
                                    ].map(m => (
                                        <label key={m.id} className="flex items-center gap-1.5 select-none cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={m.checked}
                                                onChange={() => setSelectedModels(prev => ({ ...prev, [m.id]: !m.checked }))}
                                                className="rounded bg-black border-white/10 text-cyan-500 focus:ring-0 w-3 h-3"
                                            />
                                            <span className="text-[9px] font-mono text-zinc-400">{m.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Response streams */}
                            <div className="space-y-2">
                                {concertResponses.map((r, idx) => (
                                    <div key={idx} className="p-3 bg-zinc-950/60 border border-white/5 rounded-lg space-y-1.5">
                                        <p className="text-[7px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex justify-between">
                                            <span>{r.model}</span>
                                            {r.status === 'loading' && <span className="animate-pulse">STREAMING...</span>}
                                        </p>
                                        {r.status === 'loading' ? (
                                            <div className="flex items-center gap-1.5">
                                                <Loader2 className="w-2.5 h-2.5 animate-spin text-zinc-500" />
                                                <span className="text-[8px] font-mono text-zinc-600 animate-pulse">Prompting model context...</span>
                                            </div>
                                        ) : (
                                            <p className="text-[9px] text-zinc-300 font-sans leading-relaxed">{r.content}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Input Fields */}
                <div className="border-t border-white/5 pt-2 flex gap-1.5 mt-2">
                    {activeTab === 'team' && (
                        <>
                            <input
                                type="text"
                                value={teamInput}
                                onChange={e => setTeamInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSendTeam(); }}
                                placeholder="Broadcast proposal / message to the team..."
                                className="flex-1 bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-[9px] font-sans placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50"
                            />
                            <button
                                onClick={handleSendTeam}
                                className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-black rounded transition-colors flex items-center justify-center"
                            >
                                <Send className="w-3 h-3" />
                            </button>
                        </>
                    )}

                    {activeTab === 'promethea' && (
                        <>
                            <input
                                type="text"
                                value={prometheaInput}
                                onChange={e => setPrometheaInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSendPromethea(); }}
                                placeholder="Draft asset or state contract proposal..."
                                className="flex-1 bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-[9px] font-sans placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50"
                            />
                            <button
                                onClick={handleSendPromethea}
                                disabled={isPrometheaTyping}
                                className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-black disabled:bg-zinc-800 rounded transition-colors flex items-center justify-center"
                            >
                                <Send className="w-3 h-3" />
                            </button>
                        </>
                    )}

                    {activeTab === 'antigravity' && (
                        <>
                            <input
                                type="text"
                                value={antigravityInput}
                                onChange={e => setAntigravityInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSendAntigravity(); }}
                                placeholder="Propose repository revision or Github PR branch..."
                                className="flex-1 bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-[9px] font-sans placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50"
                            />
                            <button
                                onClick={handleSendAntigravity}
                                disabled={isAntigravityTyping}
                                className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-black disabled:bg-zinc-800 rounded transition-colors flex items-center justify-center"
                            >
                                <Send className="w-3 h-3" />
                            </button>
                        </>
                    )}

                    {activeTab === 'concert' && (
                        <>
                            <input
                                type="text"
                                value={concertInput}
                                onChange={e => setConcertInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleConcertQuery(); }}
                                placeholder="Query selected ensemble models in concert..."
                                className="flex-1 bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-[9px] font-sans placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50"
                            />
                            <button
                                onClick={handleConcertQuery}
                                className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-black rounded transition-colors flex items-center justify-center"
                            >
                                <Send className="w-3 h-3" />
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};
