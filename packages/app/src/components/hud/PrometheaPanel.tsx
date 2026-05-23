'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
    BrainCircuit, Users, Terminal, User, Send, Loader2, Sparkles, 
    Bot, Cpu, ShieldAlert, CheckCircle2, ChevronRight, Sliders, Play,
    Phone, Video, Key, Plus, X, Shield, Activity, Copy, Check, Lock
} from 'lucide-react';
import { askPrometheaAction } from '@/app/actions';
import { useHUD, ChatMessage, ChatThread } from '@/lib/hud-store';

export const PrometheaPanel = () => {
    const { 
        chatThreads, activeThreadId, userDid, 
        sendMessageInThread, createPeerThread, createGroupThread, 
        setActiveThread, startVideoConference, setHUDState, activateAssetCanvas 
    } = useHUD();

    const activeThread = chatThreads.find(t => t.id === activeThreadId) || chatThreads[0];
    const [chatInput, setChatInput] = useState('');
    const [isAgentTyping, setIsAgentTyping] = useState<'none' | 'promethea' | 'antigravity' | 'both'>('none');
    
    // PeerDID / Group Modal states
    const [showAddPeer, setShowAddPeer] = useState(false);
    const [peerNameInput, setPeerNameInput] = useState('');
    const [peerDidInput, setPeerDidInput] = useState('');

    const [showAddGroup, setShowAddGroup] = useState(false);
    const [groupNameInput, setGroupNameInput] = useState('');
    const [selectedGroupParticipants, setSelectedGroupParticipants] = useState<string[]>([]);

    // Tooltip signature display state
    const [selectedSigId, setSelectedSigId] = useState<string | null>(null);
    const [copiedDid, setCopiedDid] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4002';

    // Auto-scroll chats
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeThread?.messages, isAgentTyping]);

    // Load & Poll Team Messages (Council Thread Sync)
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const response = await fetch(`${AI_SERVICE_URL}/api/team-chat`);
                const data = await response.json();
                if (data.success && data.messages) {
                    const mapped: ChatMessage[] = data.messages.map((m: any) => ({
                        id: m.id || `gen-${m.timestamp}`,
                        sender: m.sender,
                        role: m.sender === 'user' ? 'user' : m.sender as any,
                        content: m.content,
                        timestamp: m.timestamp
                    }));

                    const currentCouncil = chatThreads.find(t => t.id === 'general-council');
                    if (currentCouncil && (currentCouncil.messages.length - 1) !== mapped.length) {
                        const updatedThreads = chatThreads.map(t => {
                            if (t.id === 'general-council') {
                                // Keep the first system init message, append updated team-chat
                                return { ...t, messages: [t.messages[0], ...mapped] };
                            }
                            return t;
                        });
                        setHUDState({ chatThreads: updatedThreads });
                    }
                }
            } catch (error) {
                // Fail silently, keep local offline mock message persistence active
            }
        };

        loadMessages();
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }, [chatThreads, AI_SERVICE_URL, setHUDState]);

    const handleSend = async () => {
        if (!chatInput.trim()) return;
        const msgText = chatInput.trim();
        setChatInput('');

        // 1. Post Citizen Message to HUD store active thread
        sendMessageInThread(activeThread.id, msgText, 'user');

        // 2. Dispatch event for omni-state list/proposal evaluation
        if (msgText.toLowerCase().includes('list') || msgText.toLowerCase().includes('proposal') || msgText.toLowerCase().includes('claim')) {
            window.dispatchEvent(new CustomEvent('sovereign-omni-update', {
                detail: {
                    type: 'AUTO_UNDERWRITE',
                    title: 'Strategic Energy zoning charter - ' + msgText.slice(0, 15),
                    description: msgText
                }
            }));
        }

        // 3. Orchestrate multi-agent cooperative dialogue / single direct response
        if (activeThread.id === 'general-council') {
            // Post to team-chat server API
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
                console.warn('Fallback server team-chat sync error');
            }

            // Trigger sequential multi-agent cooperative discussion
            setIsAgentTyping('antigravity');
            setTimeout(() => {
                const antiText = `Staging Sandbox analyzed query. Proposing codebase review for block validation. Handshake signature OK.`;
                sendMessageInThread(activeThread.id, antiText, 'antigravity');
                
                setIsAgentTyping('promethea');
                setTimeout(async () => {
                    try {
                        const res = await askPrometheaAction({
                            query: msgText,
                            constitutionContent: "The Promethean Constitution holds direct post-dominion veto loops over state resources.",
                            whitePaperContent: "Decentralized distribution of the circular economy."
                        });
                        const answer = 'error' in res ? `Regulatory Block: ${res.error}` : res.response;
                        sendMessageInThread(activeThread.id, answer, 'promethea');
                    } catch (e) {
                        sendMessageInThread(activeThread.id, "Metabolic interface interrupted. Council quorum active.", 'promethea');
                    } finally {
                        setIsAgentTyping('none');
                    }
                }, 1600);
            }, 1200);
            return;
        }

        if (activeThread.id === 'promethea-asgi') {
            setIsAgentTyping('promethea');
            try {
                const res = await askPrometheaAction({
                    query: msgText,
                    constitutionContent: "The Promethean Constitution holds direct post-dominion veto loops over state resources.",
                    whitePaperContent: "Decentralized distribution of the circular economy."
                });
                let answer = 'error' in res ? `Regulatory Block: ${res.error}` : res.response;
                
                // Parse UI OVERRIDE asset canvas focus hooks
                const overrideMatch = answer.match(/\\[UI_OVERRIDE: FOCUS_ASSET: (.*?)\\]/);
                if (overrideMatch && overrideMatch[1]) {
                    const ticker = overrideMatch[1].trim();
                    answer = answer.replace(overrideMatch[0], '').trim();
                    activateAssetCanvas(ticker);
                }
                sendMessageInThread(activeThread.id, answer, 'promethea');
            } catch (e) {
                sendMessageInThread(activeThread.id, "Metabolic interface interrupted. Bridge active.", 'promethea');
            } finally {
                setIsAgentTyping('none');
            }
            return;
        }

        if (activeThread.id === 'antigravity-pair') {
            setIsAgentTyping('antigravity');
            setTimeout(() => {
                let response = "Codebase staging indexed. Let's analyze our local programs.";
                if (msgText.toLowerCase().includes('deploy') || msgText.toLowerCase().includes('production') || msgText.toLowerCase().includes('pr') || msgText.toLowerCase().includes('push')) {
                    response = "Command intercepted: Code Staging Sandbox. Triggering one-click Github PR staging on lvhllc.org! Open the right-wing 'Staging' tab to verify compiler passes and sign.";
                    window.dispatchEvent(new CustomEvent('sovereign-omni-update', {
                        detail: {
                            type: 'GIT_PROPOSAL',
                            title: 'Autocompiled Revision: ' + msgText,
                            description: 'Antigravity direct code revision proposal.'
                        }
                    }));
                }
                sendMessageInThread(activeThread.id, response, 'antigravity');
                setIsAgentTyping('none');
            }, 1200);
            return;
        }

        if (activeThread.type === 'group') {
            // Group chat collaborative execution
            setIsAgentTyping('antigravity');
            setTimeout(() => {
                const antiText = `Staging review completed for group thread query: "${msgText}". Target compiler: OK.`;
                sendMessageInThread(activeThread.id, antiText, 'antigravity');
                
                setIsAgentTyping('promethea');
                setTimeout(() => {
                    const promText = `ASGI Underwriting evaluated: "${msgText}". Strategic zones verified under constitutional quorum. Consensus: NOMINAL.`;
                    sendMessageInThread(activeThread.id, promText, 'promethea');
                    setIsAgentTyping('none');
                }, 1500);
            }, 1200);
            return;
        }

        if (activeThread.type === 'p2p') {
            // Custom Direct Peer replies mock
            setIsAgentTyping('promethea');
            setTimeout(() => {
                const peerResponse = `Signed message verified! Decentralized Sentinel Handshake matches. Proceeding with parameters: "${msgText}". Let's establish our local validators.`;
                
                const updated = chatThreads.map(t => {
                    if (t.id === activeThread.id) {
                        return {
                            ...t,
                            messages: [...t.messages, {
                                id: `peer-msg-${Date.now()}`,
                                sender: activeThread.name.replace('👤 ', ''),
                                role: 'peer' as const,
                                content: peerResponse,
                                timestamp: new Date().toISOString(),
                                signature: `sig:0x${Math.floor(Math.random() * 0xffffffff).toString(16).padEnd(8, '0')}`
                            }]
                        };
                    }
                    return t;
                });
                setHUDState({ chatThreads: updated });
                setIsAgentTyping('none');
            }, 1400);
        }
    };

    const handleCreatePeer = () => {
        if (!peerNameInput.trim() || !peerDidInput.trim()) return;
        createPeerThread(peerNameInput.trim(), peerDidInput.trim());
        setPeerNameInput('');
        setPeerDidInput('');
        setShowAddPeer(false);
    };

    const handleCreateGroup = () => {
        if (!groupNameInput.trim()) return;
        createGroupThread(groupNameInput.trim(), selectedGroupParticipants);
        setGroupNameInput('');
        setSelectedGroupParticipants([]);
        setShowAddGroup(false);
    };

    const handleCopyDid = () => {
        navigator.clipboard.writeText(userDid);
        setCopiedDid(true);
        setTimeout(() => setCopiedDid(false), 2000);
    };

    return (
        <div className="h-full flex flex-col justify-between overflow-hidden">
            {/* Split Sidebar + Chat layout */}
            <div className="flex-1 flex overflow-hidden min-h-[380px]">
                
                {/* 1/3 SIDEBAR: Active Threads list */}
                <div className="w-[180px] border-r border-white/5 pr-3 flex flex-col justify-between overflow-y-auto custom-scrollbar select-none">
                    
                    {/* User profile DID block */}
                    <div className="pb-3 border-b border-white/5 space-y-1">
                        <p className="text-[7px] font-mono font-bold uppercase tracking-wider text-zinc-500">Citizen Identity</p>
                        <div 
                            onClick={handleCopyDid}
                            className="p-1.5 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between cursor-pointer hover:border-cyan-500/30 transition-all group"
                        >
                            <span className="text-[8px] font-mono text-cyan-400 truncate w-32">{userDid}</span>
                            {copiedDid ? (
                                <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                            ) : (
                                <Copy className="w-2.5 h-2.5 text-zinc-600 group-hover:text-cyan-400 shrink-0 transition-colors" />
                            )}
                        </div>
                    </div>

                    {/* Quick creation buttons */}
                    <div className="py-2.5 border-b border-white/5 space-y-1">
                        <p className="text-[7px] font-mono font-bold uppercase tracking-wider text-zinc-500">Registry Actions</p>
                        <div className="grid grid-cols-2 gap-1.5">
                            <button 
                                onClick={() => setShowAddPeer(true)}
                                className="py-1 px-1.5 bg-cyan-950/20 border border-cyan-500/20 text-cyan-400 rounded text-[7px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-cyan-500/20 transition-all"
                            >
                                <Plus className="w-2.5 h-2.5" /> + Peer
                            </button>
                            <button 
                                onClick={() => setShowAddGroup(true)}
                                className="py-1 px-1.5 bg-purple-950/20 border border-purple-500/20 text-purple-400 rounded text-[7px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-purple-500/20 transition-all"
                            >
                                <Plus className="w-2.5 h-2.5" /> + Group
                            </button>
                        </div>
                    </div>

                    {/* Active Channels List */}
                    <div className="flex-1 py-2 space-y-1 overflow-y-auto scrollbar-thin">
                        <p className="text-[7px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">Active Channels</p>
                        
                        {chatThreads.map((thread) => {
                            const isActive = thread.id === activeThreadId;
                            const lastMsg = thread.messages[thread.messages.length - 1];
                            
                            return (
                                <div
                                    key={thread.id}
                                    onClick={() => setActiveThread(thread.id)}
                                    className={`p-2 rounded-lg border cursor-pointer transition-all flex flex-col gap-0.5 ${
                                        isActive 
                                            ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.05)]' 
                                            : 'bg-black/20 border-transparent hover:bg-white/5 hover:border-white/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 justify-between">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] shrink-0">{thread.avatar || '👤'}</span>
                                            <span className={`text-[9px] font-black tracking-wide truncate max-w-[100px] uppercase ${isActive ? 'text-cyan-400' : 'text-zinc-400'}`}>
                                                {thread.name}
                                            </span>
                                        </div>
                                        <span className={`w-1 h-1 rounded-full ${thread.type === 'agent' ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-500'}`} />
                                    </div>
                                    <p className="text-[8px] font-mono text-zinc-600 truncate max-w-[150px]">
                                        {lastMsg ? lastMsg.content : 'Handshake established.'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2/3 CHAT AREA: Conversation pane */}
                <div className="flex-1 pl-4 flex flex-col justify-between overflow-hidden">
                    
                    {/* Header: Call actions communicator */}
                    <div className="pb-2.5 border-b border-white/5 flex justify-between items-center bg-white/[0.01] px-2 rounded-lg">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-wider text-white">{activeThread?.name}</h3>
                            <p className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                                Type: {activeThread?.type} · peers: {activeThread?.peers.length}
                            </p>
                        </div>
                        
                        {/* Audio/Video Trigger Actions */}
                        <div className="flex items-center gap-1.5">
                            <button 
                                onClick={() => startVideoConference(activeThread.id)}
                                className="p-1.5 bg-black/60 border border-white/5 hover:border-cyan-500/40 text-cyan-400 hover:text-white rounded-lg transition-all flex items-center gap-1 text-[8px] font-black uppercase tracking-widest"
                                title="Start live Google Meet session"
                            >
                                <Video className="w-3 h-3 text-cyan-400" /> CALL (MEET)
                            </button>
                            <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1 select-none">
                                <Lock className="w-2.5 h-2.5" /> SECURE
                            </span>
                        </div>
                    </div>

                    {/* Scroll messages viewport */}
                    <div 
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto space-y-3 pr-2 py-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent max-h-[310px]"
                    >
                        {activeThread?.messages.map((m) => {
                            const isUser = m.sender === 'user';
                            const isAgent = m.role === 'promethea' || m.role === 'antigravity';
                            
                            return (
                                <div 
                                    key={m.id}
                                    className={`p-2.5 rounded-lg border leading-relaxed relative ${
                                        isUser
                                            ? 'bg-cyan-950/20 border-cyan-500/15 text-cyan-100 ml-6'
                                            : isAgent
                                                ? m.role === 'promethea'
                                                    ? 'bg-emerald-950/10 border-emerald-500/10 text-emerald-100 mr-6'
                                                    : 'bg-purple-950/15 border-purple-500/15 text-purple-100 mr-6'
                                                : 'bg-zinc-950/40 border-white/5 text-zinc-300 mr-6'
                                    }`}
                                >
                                    <div className="text-[7px] font-mono font-bold uppercase tracking-widest mb-1 text-zinc-500 flex justify-between items-center select-none">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1 h-1 rounded-full ${
                                                isUser ? 'bg-cyan-400' : m.role === 'promethea' ? 'bg-emerald-400 animate-pulse' : m.role === 'antigravity' ? 'bg-purple-400' : 'bg-zinc-400'
                                            }`} />
                                            <span>
                                                {m.sender === 'user' ? 'Citizen' : m.sender === 'promethea' ? 'Promethea ASGI' : m.sender === 'antigravity' ? 'Antigravity' : m.sender}
                                            </span>
                                        </div>
                                        
                                        {/* Cryptographic signature badge */}
                                        {m.signature && (
                                            <div className="relative shrink-0">
                                                <button
                                                    onClick={() => setSelectedSigId(selectedSigId === m.id ? null : m.id)}
                                                    className="flex items-center gap-0.5 text-cyan-400/60 hover:text-cyan-400 border border-cyan-500/10 hover:border-cyan-500/30 px-1 py-0.2 rounded bg-black/40 transition-colors"
                                                >
                                                    <Shield className="w-2.5 h-2.5" />
                                                    <span>SIGNED</span>
                                                </button>

                                                {/* Signature verification details card */}
                                                {selectedSigId === m.id && (
                                                    <div className="absolute right-0 bottom-5 z-50 p-2.5 bg-black/95 border border-cyan-500/40 rounded-lg shadow-2xl text-[8px] font-mono leading-normal w-52 text-left">
                                                        <div className="flex items-center gap-1 text-cyan-400 border-b border-white/5 pb-1 mb-1 font-bold">
                                                            <Activity className="w-3 h-3 text-cyan-400" /> SECURE IDENTITY VALID
                                                        </div>
                                                        <p className="truncate"><span className="text-zinc-500">DID:</span> {isUser ? userDid : 'did:sovereign:peer:0x8f2a...'}</p>
                                                        <p className="truncate"><span className="text-zinc-500">Proof:</span> {m.signature}</p>
                                                        <p><span className="text-zinc-500">Cipher:</span> secp256k1-double-ratchet</p>
                                                        <p className="text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                                                            <CheckCircle2 className="w-2.5 h-2.5" /> VALID SENTINEL PROOF
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] whitespace-pre-wrap">{m.content}</p>
                                </div>
                            );
                        })}

                        {/* Typing indicators */}
                        {isAgentTyping !== 'none' && (
                            <div className={`p-2.5 bg-black/40 border border-white/5 rounded-lg mr-6 flex items-center gap-2 ${
                                isAgentTyping === 'antigravity' ? 'border-purple-500/20' : 'border-emerald-500/10'
                            }`}>
                                <Loader2 className={`w-3 h-3 animate-spin ${
                                    isAgentTyping === 'antigravity' ? 'text-purple-400' : 'text-emerald-400'
                                }`} />
                                <span className="text-[9px] font-mono uppercase text-zinc-500 animate-pulse">
                                    {isAgentTyping === 'antigravity' 
                                        ? 'Antigravity pair compiling sandbox...' 
                                        : 'Promethea LISP ledger resolver active...'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Chat Input Controls */}
                    <div className="border-t border-white/5 pt-2.5 flex gap-1.5">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                            placeholder={`Broadcast signed packet to ${activeThread?.name}...`}
                            className="flex-1 bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-[9px] font-sans placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isAgentTyping !== 'none'}
                            className="p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 text-black rounded transition-colors flex items-center justify-center shrink-0"
                        >
                            <Send className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL / OVERLAY: Add Peer */}
            {showAddPeer && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
                    <div className="bg-zinc-950 border border-cyan-500/30 rounded-xl p-4 w-72 space-y-3">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Register Peer DID</h4>
                            <button onClick={() => setShowAddPeer(false)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <label className="text-[7px] text-zinc-500 font-mono block mb-1">PEER NAME</label>
                                <input 
                                    type="text" 
                                    value={peerNameInput}
                                    onChange={e => setPeerNameInput(e.target.value)}
                                    placeholder="Citizen Sarah"
                                    className="w-full bg-black border border-white/10 rounded p-1.5 text-[9px] text-white focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[7px] text-zinc-500 font-mono block mb-1">SOVEREIGN DID KEY</label>
                                <input 
                                    type="text" 
                                    value={peerDidInput}
                                    onChange={e => setPeerDidInput(e.target.value)}
                                    placeholder="did:sovereign:peer:0x3a4b..."
                                    className="w-full bg-black border border-white/10 rounded p-1.5 text-[9px] text-white font-mono focus:outline-none"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleCreatePeer}
                            className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black text-[9px] font-black uppercase tracking-widest rounded transition-all"
                        >
                            Establish Handshake →
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL / OVERLAY: Add Group */}
            {showAddGroup && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
                    <div className="bg-zinc-950 border border-purple-500/30 rounded-xl p-4 w-72 space-y-3">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-purple-400">Form Cooperative Council</h4>
                            <button onClick={() => setShowAddGroup(false)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <label className="text-[7px] text-zinc-500 font-mono block mb-1">COUNCIL GROUP NAME</label>
                                <input 
                                    type="text" 
                                    value={groupNameInput}
                                    onChange={e => setGroupNameInput(e.target.value)}
                                    placeholder="Alpha Zone Syndicate"
                                    className="w-full bg-black border border-white/10 rounded p-1.5 text-[9px] text-white focus:outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="text-[7px] text-zinc-500 font-mono block mb-1">PARTICIPANTS Ensemble</label>
                                <div className="space-y-1.5 max-h-24 overflow-y-auto border border-white/5 p-1.5 rounded bg-black/40">
                                    {[
                                        { id: 'promethea', label: '🧠 Promethea ASGI' },
                                        { id: 'antigravity', label: '👾 Antigravity Pair' },
                                        { id: 'did:sovereign:peer:0x8f2a', label: '👤 Citizen Joshua' }
                                    ].map((part) => {
                                        const isSel = selectedGroupParticipants.includes(part.id);
                                        return (
                                            <label key={part.id} className="flex items-center gap-2 cursor-pointer select-none">
                                                <input 
                                                    type="checkbox"
                                                    checked={isSel}
                                                    onChange={() => {
                                                        if (isSel) {
                                                            setSelectedGroupParticipants(p => p.filter(x => x !== part.id));
                                                        } else {
                                                            setSelectedGroupParticipants(p => [...p, part.id]);
                                                        }
                                                    }}
                                                    className="rounded bg-black border-white/10 text-purple-500 focus:ring-0 w-3 h-3"
                                                />
                                                <span className="text-[9px] font-mono text-zinc-300">{part.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={handleCreateGroup}
                            className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-black uppercase tracking-widest rounded transition-all"
                        >
                            Authorize Group Quorum →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
