'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
    BrainCircuit, Users, Terminal, User, Send, Loader2, Sparkles, 
    Bot, Cpu, ShieldAlert, CheckCircle2, ChevronRight, Sliders, Play,
    Phone, Video, Key, Plus, X, Shield, Activity, Copy, Check, Lock, RefreshCw
} from 'lucide-react';
import { askPrometheaAction } from '@/app/actions';
import { useHUD, ChatMessage, ChatThread, getActivePath, ensureDSGStructure } from '@/lib/hud-store';
import DSGMindMapCanvas from './DSGMindMapCanvas';

export const PrometheaPanel = () => {
    const { 
        chatThreads, activeThreadId, userDid, 
        sendMessageInThread, createPeerThread, createGroupThread, 
        setActiveThread, resetChatThreads, startVideoConference, setHUDState, activateAssetCanvas,
        anchorChatThread, pivotChatStream, pauseNode, resumeNode
    } = useHUD();

    const activeThread = chatThreads.find(t => t.id === activeThreadId) || chatThreads[0];
    const [chatInput, setChatInput] = useState('');
    const [isAgentTyping, setIsAgentTyping] = useState<'none' | 'promethea' | 'antigravity' | 'both'>('none');
    const [anchorTargetNodeId, setAnchorTargetNodeId] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'chat' | 'mindmap'>('chat');
    const [wsConnected, setWsConnected] = useState(false);
    
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

    // Refs for asynchronous timeouts (to enable interruption/cancellation)
    const activeTimeoutsRef = useRef<any[]>([]);
    const chatThreadsRef = useRef(chatThreads);

    useEffect(() => {
        chatThreadsRef.current = chatThreads;
    }, [chatThreads]);

    // WebSocket Integration
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        let reconnectTimeout: NodeJS.Timeout;
        const connectWS = () => {
            console.log('[PrometheaPanel] Connecting to DepthOS Bridge ws://localhost:9999');
            const ws = new WebSocket('ws://localhost:9999');
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[PrometheaPanel] Connected to DepthOS Bridge');
                setWsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'CPP_STREAM_HALTED') {
                        const { threadId, nodeId, snapshot } = data.payload;
                        console.log(`[PrometheaPanel] Received halt acknowledgement for node: ${nodeId}`);
                        // Change state in store
                        pauseNode(threadId, nodeId, snapshot);
                        setIsAgentTyping('none');
                    } else if (data.type === 'CPP_CHUNK_EMIT') {
                        const { threadId, nodeId, parentId, contentChunk, isFirst, isLast } = data.payload;
                        console.log(`[PrometheaPanel] Received chunk for sibling node: ${nodeId}`);
                        setIsAgentTyping('promethea'); // Sibling stream is Promethea-driven

                        setHUDState({
                            chatThreads: chatThreadsRef.current.map(t => {
                                if (t.id === threadId) {
                                    const exists = t.messages.some(m => m.id === nodeId);
                                    let newMessages = [...t.messages];

                                    if (isFirst && !exists) {
                                        // Resolve parentId: if parent is being pivoted from, we use activeHead
                                        let resolvedParentId = parentId;
                                        const currentHead = t.activeHeadMessageId;
                                        if (currentHead && currentHead.includes('-pivot-usr-')) {
                                            resolvedParentId = currentHead;
                                        }

                                        // Create new message
                                        const newMsg: ChatMessage = {
                                            id: nodeId,
                                            sender: 'promethea',
                                            role: 'promethea',
                                            content: contentChunk,
                                            timestamp: new Date().toISOString(),
                                            parentId: resolvedParentId,
                                            status: 'generating',
                                            childrenIds: []
                                        };

                                        // Update parent childrenIds if parent exists
                                        newMessages = newMessages.map(m => {
                                            if (m.id === resolvedParentId) {
                                                return {
                                                    ...m,
                                                    childrenIds: Array.from(new Set([...(m.childrenIds || []), nodeId]))
                                                };
                                            }
                                            return m;
                                        });

                                        newMessages.push(newMsg);
                                    } else {
                                        // Update existing message
                                        newMessages = newMessages.map(m => {
                                            if (m.id === nodeId) {
                                                const currentContent = isFirst ? contentChunk : (m.content + contentChunk);
                                                return {
                                                    ...m,
                                                    content: currentContent,
                                                    status: isLast ? 'completed' : 'generating'
                                                };
                                            }
                                            return m;
                                        });
                                    }

                                    return {
                                        ...t,
                                        messages: newMessages,
                                        activeHeadMessageId: nodeId
                                    };
                                }
                                return t;
                            })
                        });

                        if (isLast) {
                            setIsAgentTyping('none');
                        }
                    }
                } catch (err) {
                    console.error('[PrometheaPanel] WS message error:', err);
                }
            };

            ws.onclose = () => {
                console.log('[PrometheaPanel] Disconnected from DepthOS Bridge. Retrying in 3s...');
                setWsConnected(false);
                reconnectTimeout = setTimeout(connectWS, 3000);
            };

            ws.onerror = (err) => {
                console.error('[PrometheaPanel] WS error:', err);
                setWsConnected(false);
                ws.close();
            };
        };

        connectWS();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            clearTimeout(reconnectTimeout);
        };
    }, [setHUDState, pauseNode]);

    // Keep daemon aligned with active DSG head
    useEffect(() => {
        if (activeThread?.activeHeadMessageId && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'CPP_ANCHOR_HEAD',
                payload: {
                    threadId: activeThread.id,
                    nodeId: activeThread.activeHeadMessageId
                }
            }));
        }
    }, [activeThread?.activeHeadMessageId, activeThread?.id]);

    const scheduleTimeout = (fn: () => void, delay: number) => {
        const handle = setTimeout(() => {
            activeTimeoutsRef.current = activeTimeoutsRef.current.filter(h => h !== handle);
            fn();
        }, delay);
        activeTimeoutsRef.current.push(handle);
        return handle;
    };

    const cancelAllTimeouts = () => {
        activeTimeoutsRef.current.forEach(h => clearTimeout(h));
        activeTimeoutsRef.current = [];
    };

    // Deepest Leaf Traversal for Branch Switching
    const getDeepestLeafId = (nodeId: string, messages: ChatMessage[]): string => {
        const msgMap = new Map(messages.map(msg => [msg.id, msg]));
        let currentId = nodeId;
        while (true) {
            const msg = msgMap.get(currentId);
            if (msg && msg.childrenIds && msg.childrenIds.length > 0) {
                currentId = msg.childrenIds[msg.childrenIds.length - 1];
            } else {
                break;
            }
        }
        return currentId;
    };

    // Mock Streaming simulation with Interruption Support
    const streamMessageResponse = (
        threadId: string, 
        finalContent: string, 
        role: 'promethea' | 'antigravity',
        callback?: () => void
    ) => {
        setIsAgentTyping(role);
        
        const msgId = sendMessageInThread(threadId, '▋', role);
        
        let currentText = '';
        const words = finalContent.split(' ');
        let wordIndex = 0;

        const updateNextWord = () => {
            if (wordIndex < words.length) {
                currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
                wordIndex++;
                
                const updated = chatThreadsRef.current.map(t => {
                    if (t.id === threadId) {
                        return {
                            ...t,
                            messages: t.messages.map(m => {
                                if (m.id === msgId) {
                                    return { ...m, content: currentText + ' ▋', status: 'generating' as const };
                                }
                                return m;
                            })
                        };
                    }
                    return t;
                });
                
                setHUDState({ chatThreads: updated });
                scheduleTimeout(updateNextWord, 60 + Math.random() * 40);
            } else {
                setIsAgentTyping('none');
                const updated = chatThreadsRef.current.map(t => {
                    if (t.id === threadId) {
                        return {
                            ...t,
                            messages: t.messages.map(m => {
                                if (m.id === msgId) {
                                    return { ...m, content: currentText, status: 'completed' as const };
                                }
                                return m;
                            })
                        };
                    }
                    return t;
                });
                setHUDState({ chatThreads: updated });
                if (callback) callback();
            }
        };

        scheduleTimeout(updateNextWord, 100);
    };

    // Active path for UI rendering
    const activePath = getActivePath(activeThread);

    // Auto-scroll chats
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activePath, isAgentTyping]);

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
                        const updatedThreads = ensureDSGStructure(chatThreads.map(t => {
                            if (t.id === 'general-council') {
                                return { ...t, messages: [t.messages[0], ...mapped] };
                            }
                            return t;
                        }));
                        setHUDState({ chatThreads: updatedThreads });
                    }
                }
            } catch (error) {
                // Fail silently
            }
        };

        loadMessages();
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }, [chatThreads, AI_SERVICE_URL, setHUDState]);

    const triggerAgentResponse = (msgText: string) => {
        if (activeThread.id === 'general-council') {
            // Post to team-chat server API
            fetch(`${AI_SERVICE_URL}/api/team-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: 'user',
                    timestamp: new Date().toISOString(),
                    content: msgText,
                    context: { priority: 'normal' }
                }),
            }).catch(() => {});

            // Trigger sequential multi-agent cooperative discussion
            setIsAgentTyping('antigravity');
            const antiText = `Staging Sandbox analyzed query. Proposing codebase review for block validation. Handshake signature OK.`;
            streamMessageResponse(activeThread.id, antiText, 'antigravity', () => {
                setIsAgentTyping('promethea');
                scheduleTimeout(async () => {
                    try {
                        const res = await askPrometheaAction({
                            query: msgText,
                            constitutionContent: "The Promethean Constitution holds direct post-dominion veto loops over state resources.",
                            whitePaperContent: "Decentralized distribution of the circular economy."
                        });
                        const answer = 'error' in res ? `Regulatory Block: ${res.error}` : res.response;
                        streamMessageResponse(activeThread.id, answer, 'promethea');
                    } catch (e) {
                        streamMessageResponse(activeThread.id, "Metabolic interface interrupted. Council quorum active.", 'promethea');
                    }
                }, 1000);
            });
            return;
        }

        if (activeThread.id === 'promethea-asgi') {
            setIsAgentTyping('promethea');
            scheduleTimeout(async () => {
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
                    streamMessageResponse(activeThread.id, answer, 'promethea');
                } catch (e) {
                    streamMessageResponse(activeThread.id, "Metabolic interface interrupted. Bridge active.", 'promethea');
                }
            }, 100);
            return;
        }

        if (activeThread.id === 'antigravity-pair') {
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
            streamMessageResponse(activeThread.id, response, 'antigravity');
            return;
        }

        if (activeThread.type === 'group') {
            const antiText = `Staging review completed for group thread query: "${msgText}". Target compiler: OK.`;
            streamMessageResponse(activeThread.id, antiText, 'antigravity', () => {
                const promText = `ASGI Underwriting evaluated: "${msgText}". Strategic zones verified under constitutional quorum. Consensus: NOMINAL.`;
                streamMessageResponse(activeThread.id, promText, 'promethea');
            });
            return;
        }

        if (activeThread.type === 'p2p') {
            setIsAgentTyping('promethea');
            scheduleTimeout(() => {
                const peerResponse = `Signed message verified! Decentralized Sentinel Handshake matches. Proceeding with parameters: "${msgText}". Let's establish our local validators.`;
                sendMessageInThread(activeThread.id, peerResponse, 'peer');
                setIsAgentTyping('none');
            }, 1200);
        }
    };

    const handleSend = async () => {
        if (!chatInput.trim()) return;
        const msgText = chatInput.trim();
        setChatInput('');

        // 1. Post Citizen Message to HUD store active thread
        sendMessageInThread(activeThread.id, msgText, 'user', anchorTargetNodeId || undefined);

        // Reset anchoring state
        setAnchorTargetNodeId(null);

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

        // 3. Trigger standard response sequence
        triggerAgentResponse(msgText);
    };

    const handlePivot = () => {
        if (!chatInput.trim()) return;
        const pivotText = chatInput.trim();
        setChatInput('');

        // Cancel any active timeouts
        cancelAllTimeouts();

        // Mark agent as typing none first to clear loading indicators
        setIsAgentTyping('none');

        const interruptedNodeId = activeThread?.activeHeadMessageId;

        // Trigger pivot state mutation in store
        pivotChatStream(activeThread.id, pivotText);

        // Reset target anchoring state
        setAnchorTargetNodeId(null);

        // Send CPP_PIVOT_INIT to WS server if connected, else fallback locally
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && interruptedNodeId) {
            wsRef.current.send(JSON.stringify({
                type: 'CPP_PIVOT_INIT',
                payload: {
                    threadId: activeThread.id,
                    modifier: pivotText,
                    nodeId: interruptedNodeId
                }
            }));
        } else {
            // Now trigger the new response starting from the pivot point
            triggerAgentResponse(pivotText);
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
                            className="p-1.5 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between cursor-pointer hover:border-amber-500/30 transition-all group"
                        >
                            <span className="text-[8px] font-mono text-amber-400 truncate w-32">{userDid}</span>
                            {copiedDid ? (
                                <Check className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            ) : (
                                <Copy className="w-2.5 h-2.5 text-zinc-600 group-hover:text-amber-400 shrink-0 transition-colors" />
                            )}
                        </div>
                    </div>

                    {/* Quick creation buttons */}
                    <div className="py-2.5 border-b border-white/5 space-y-1.5">
                        <p className="text-[7px] font-mono font-bold uppercase tracking-wider text-zinc-500">Registry Actions</p>
                        <div className="grid grid-cols-2 gap-1.5">
                            <button 
                                onClick={() => setShowAddPeer(true)}
                                className="py-1 px-1.5 bg-amber-950/20 border border-amber-500/20 text-amber-400 rounded text-[7px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-amber-500/20 transition-all"
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
                        <button 
                            onClick={resetChatThreads}
                            className="w-full py-1 bg-red-950/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded text-[7px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-red-500/10 transition-all"
                        >
                            <RefreshCw className="w-2.5 h-2.5" /> Clear Cache
                        </button>
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
                                            ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_10px_rgba(245, 158, 11,0.05)]' 
                                            : 'bg-black/20 border-transparent hover:bg-white/5 hover:border-white/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 justify-between">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] shrink-0">{thread.avatar || '👤'}</span>
                                            <span className={`text-[9px] font-black tracking-wide truncate max-w-[100px] uppercase ${isActive ? 'text-amber-400' : 'text-zinc-400'}`}>
                                                {thread.name}
                                            </span>
                                        </div>
                                        <span className={`w-1 h-1 rounded-full ${thread.type === 'agent' ? 'bg-amber-400' : 'bg-amber-500'}`} />
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
                            {/* View Swapper Tab Controls */}
                            <div className="flex p-0.5 bg-black/60 border border-white/5 rounded-lg mr-2 select-none">
                                <button
                                    onClick={() => setActiveView('chat')}
                                    className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
                                        activeView === 'chat'
                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10 shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                                    }`}
                                >
                                    💬 CHAT
                                </button>
                                <button
                                    onClick={() => setActiveView('mindmap')}
                                    className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
                                        activeView === 'mindmap'
                                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/10 shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                                    }`}
                                >
                                    🕸️ MINDMAP
                                </button>
                            </div>

                            <button 
                                onClick={() => startVideoConference(activeThread.id)}
                                className="p-1.5 bg-black/60 border border-white/5 hover:border-amber-500/40 text-amber-400 hover:text-white rounded-lg transition-all flex items-center gap-1 text-[8px] font-black uppercase tracking-widest"
                                title="Start live Google Meet session"
                            >
                                <Video className="w-3 h-3 text-amber-400" /> CALL (MEET)
                            </button>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-md flex items-center gap-1 select-none transition-all duration-300 ${
                                wsConnected 
                                    ? 'text-green-400 bg-green-500/10 border border-green-500/25 shadow-[0_0_10px_rgba(34,197,94,0.05)]' 
                                    : 'text-red-400 bg-red-500/10 border border-red-500/25 shadow-[0_0_10px_rgba(239,68,68,0.05)] animate-pulse'
                            }`}>
                                <Activity className={`w-2.5 h-2.5 ${wsConnected ? 'animate-pulse text-green-400' : 'text-red-400'}`} />
                                {wsConnected ? 'BRIDGE ONLINE' : 'BRIDGE OFFLINE'}
                            </span>
                        </div>
                    {activeView === 'chat' ? (
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto space-y-3 pr-2 py-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent max-h-[310px]"
                        >
                            {activePath.map((m) => {
                                const isUser = m.sender === 'user';
                                const isAgent = m.role === 'promethea' || m.role === 'antigravity';
                                const siblings = activeThread?.messages.filter(x => x.parentId === m.parentId).map(x => x.id) || [];
                                const currentBranchIndex = siblings.indexOf(m.id);
                                
                                const isSuspendedOrInterrupted = m.status === 'paused' || m.status === 'interrupted';
                                const isVerified = !!m.signature;
                                const isSpeculative = !isVerified && !isSuspendedOrInterrupted && isAgent;
                                const marginClass = isUser ? 'ml-6' : 'mr-6';

                                const getContainerStyle = () => {
                                    if (isSuspendedOrInterrupted) {
                                        return `bg-red-950/10 border-red-500/20 text-red-100 hover:border-red-500/35 shadow-[0_0_8px_rgba(239,68,68,0.08)] ${marginClass}`;
                                    }
                                    if (isVerified) {
                                        return `bg-green-950/10 border-green-500/20 text-green-100 hover:border-green-500/35 shadow-[0_0_10px_rgba(34,197,94,0.12)] ${marginClass}`;
                                    }
                                    if (isSpeculative) {
                                        return `bg-amber-950/10 border-amber-500/10 text-orange-100 hover:border-amber-500/25 ${marginClass}`;
                                    }
                                    if (isUser) {
                                        return `bg-amber-950/20 border-amber-500/15 text-amber-100 ml-6 hover:border-amber-500/30`;
                                    }
                                    return `bg-zinc-950/40 border-white/5 text-zinc-300 mr-6 hover:border-white/10`;
                                };

                                const getDotStyle = () => {
                                    if (isSuspendedOrInterrupted) return 'bg-red-500 animate-pulse';
                                    if (isVerified) return 'bg-green-500';
                                    if (isSpeculative) return 'bg-amber-400';
                                    return isUser ? 'bg-amber-400' : m.role === 'promethea' ? 'bg-amber-400' : m.role === 'antigravity' ? 'bg-purple-400' : 'bg-zinc-400';
                                };

                                return (
                                    <div 
                                        key={m.id}
                                        className={`p-2.5 rounded-lg border leading-relaxed relative group transition-all duration-200 ${getContainerStyle()}`}
                                    >
                                        <div className="text-[7px] font-mono font-bold uppercase tracking-widest mb-1 text-zinc-500 flex justify-between items-center select-none">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-1.5 h-1.5 rounded-full ${getDotStyle()}`} />
                                                <span>
                                                    {m.sender === 'user' ? 'Citizen' : m.sender === 'promethea' ? 'Promethea ASGI' : m.sender === 'antigravity' ? 'Antigravity' : activeThread.name.replace('👤 ', '')}
                                                </span>
                                                {isSuspendedOrInterrupted && (
                                                    <span className="text-[6px] text-red-400 border border-red-500/20 px-1 rounded bg-red-950/20 animate-pulse font-black shrink-0">
                                                        [🔴 STATE SUSPENDED / NEGATIVE SLOPE]
                                                    </span>
                                                )}
                                                {isVerified && !isSuspendedOrInterrupted && (
                                                    <span className="text-[6px] text-green-400 border border-green-500/20 px-1 rounded bg-green-950/20 font-black shrink-0">
                                                        [🟢 CRYPTOGRAPHICALLY SECURE & VERIFIED EVENT]
                                                    </span>
                                                )}
                                                {isSpeculative && !isSuspendedOrInterrupted && (
                                                    <span className="text-[6px] text-amber-400 border border-amber-500/20 px-1 rounded bg-amber-950/20 font-black shrink-0">
                                                        [🟡 SPECULATIVE RESOLUTION]
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5">
                                                {/* Anchor button (visible on hover) */}
                                                <button
                                                    onClick={() => setAnchorTargetNodeId(m.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[6px] font-bold text-amber-400/60 hover:text-amber-400 border border-amber-500/10 hover:border-amber-500/30 px-1.5 py-0.2 rounded bg-black/40 flex items-center gap-0.5"
                                                    title="Anchor subsequent prompts to this message node"
                                                >
                                                    <span>⚓ ANCHOR</span>
                                                </button>

                                                {/* Cryptographic signature badge */}
                                                {m.signature && (
                                                    <div className="relative shrink-0">
                                                        <button
                                                            onClick={() => setSelectedSigId(selectedSigId === m.id ? null : m.id)}
                                                            className="flex items-center gap-0.5 text-amber-400/60 hover:text-amber-400 border border-amber-500/10 hover:border-amber-500/30 px-1 py-0.2 rounded bg-black/40 transition-colors"
                                                        >
                                                            <Shield className="w-2.5 h-2.5" />
                                                            <span>SIGNED</span>
                                                        </button>

                                                        {/* Signature verification details card */}
                                                        {selectedSigId === m.id && (
                                                            <div className="absolute right-0 bottom-5 z-50 p-2.5 bg-black/95 border border-amber-500/40 rounded-lg shadow-2xl text-[8px] font-mono leading-normal w-52 text-left">
                                                                <div className="flex items-center gap-1 text-amber-400 border-b border-white/5 pb-1 mb-1 font-bold">
                                                                    <Activity className="w-3 h-3 text-amber-400" /> SECURE IDENTITY VALID
                                                                 </div>
                                                                <p className="truncate"><span className="text-zinc-500">DID:</span> {isUser ? userDid : 'did:sovereign:peer:0x8f2a...'}</p>
                                                                <p className="truncate"><span className="text-zinc-500">Proof:</span> {m.signature}</p>
                                                                <p><span className="text-zinc-500">Cipher:</span> secp256k1-double-ratchet</p>
                                                                <p className="text-amber-400 font-bold flex items-center gap-0.5 mt-0.5">
                                                                    <CheckCircle2 className="w-2.5 h-2.5" /> VALID SENTINEL PROOF
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[10px] whitespace-pre-wrap">{m.content}</p>

                                        {/* Sibling Branch Switchers (CPP Visual Branching Trails) */}
                                        {siblings.length > 1 && (
                                            <div className="flex items-center gap-1 mt-1.5 text-[7px] font-mono text-zinc-500 bg-black/30 border border-white/5 px-1.5 py-0.5 rounded w-max select-none">
                                                <button
                                                    disabled={currentBranchIndex === 0}
                                                    onClick={() => {
                                                        const prevId = siblings[currentBranchIndex - 1];
                                                        anchorChatThread(activeThread.id, getDeepestLeafId(prevId, activeThread.messages));
                                                    }}
                                                    className="hover:text-amber-400 disabled:opacity-35 disabled:hover:text-zinc-500 transition-colors"
                                                    title="Switch to previous branch"
                                                >
                                                    [←
                                                </button>
                                                <span className="text-zinc-400">
                                                    Branch <strong className="text-amber-400">{currentBranchIndex + 1}</strong> of <strong className="text-zinc-300">{siblings.length}</strong>
                                                </span>
                                                <button
                                                    disabled={currentBranchIndex === siblings.length - 1}
                                                    onClick={() => {
                                                        const nextId = siblings[currentBranchIndex + 1];
                                                        anchorChatThread(activeThread.id, getDeepestLeafId(nextId, activeThread.messages));
                                                    }}
                                                    className="hover:text-amber-400 disabled:opacity-35 disabled:hover:text-zinc-500 transition-colors"
                                                    title="Switch to next branch"
                                                >
                                                    →]
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Typing indicators */}
                            {isAgentTyping !== 'none' && (
                                <div className={`p-2.5 bg-black/40 border border-white/5 rounded-lg mr-6 flex items-center gap-2 ${
                                    isAgentTyping === 'antigravity' ? 'border-purple-500/20' : 'border-amber-500/10'
                                }`}>
                                    <Loader2 className={`w-3 h-3 animate-spin ${
                                        isAgentTyping === 'antigravity' ? 'text-purple-400' : 'text-amber-400'
                                    }`} />
                                    <span className="text-[9px] font-mono uppercase text-zinc-500 animate-pulse">
                                        {isAgentTyping === 'antigravity' 
                                            ? 'Antigravity pair compiling sandbox...' 
                                            : 'Promethea LISP ledger resolver active...'}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 pr-2 py-3 max-h-[310px] min-h-[310px]">
                            <DSGMindMapCanvas threadId={activeThread.id} />
                        </div>
                    )}

                    {/* Chat Input Controls */}
                    <div className="border-t border-white/5 pt-2.5 flex flex-col gap-1.5">
                        
                        {/* Dynamic CPP HUD Indicator Bar */}
                        {isAgentTyping !== 'none' && (
                            <div className="px-2 py-1 bg-purple-950/40 border border-purple-500/25 rounded flex items-center justify-between text-[7px] font-mono text-purple-400 select-none animate-pulse">
                                <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                                    <span>⚡ CPP ACTIVE: MID-STREAM PIPELINE GENERATING</span>
                                </div>
                                <span className="text-purple-300 font-bold">TYPE MODIFIER & PRESS ENTER TO PIVOT</span>
                            </div>
                        )}

                        {/* State Suspension Notifier */}
                        {activePath[activePath.length - 1]?.status === 'paused' && (
                            <div className="px-2 py-1 bg-red-950/40 border border-red-500/25 rounded flex items-center justify-between text-[7px] font-mono text-red-400 select-none animate-pulse">
                                <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    <span>⏸️ STATE SUSPENDED: execution snapshot serialized</span>
                                </div>
                                <span className="text-red-300 font-bold">ANCHOR ANOTHER NODE TO TRAVERSE COGNITIVE VECTOR</span>
                            </div>
                        )}

                        {/* Anchored Node Indicator Strip */}
                        {anchorTargetNodeId && (
                            <div className="px-2 py-1 bg-amber-950/40 border border-amber-500/25 rounded flex items-center justify-between text-[7px] font-mono text-amber-400 select-none">
                                <div className="flex items-center gap-1">
                                    <span>⚓ ANCHORED TO NODE:</span>
                                    <span className="bg-black/40 px-1 rounded text-zinc-400 font-bold truncate max-w-[120px]">{anchorTargetNodeId}</span>
                                </div>
                                <button 
                                    onClick={() => setAnchorTargetNodeId(null)}
                                    className="text-[6px] text-zinc-500 hover:text-white border border-white/10 hover:border-white/30 px-1 rounded transition-all font-bold"
                                    title="Clear anchor target"
                                >
                                    CLEAR [X]
                                </button>
                            </div>
                        )}

                        <div className="flex gap-1.5">
                            <label htmlFor="promethea-chat-prompt" className="sr-only">Broadcast signed packet to active channel</label>
                            <input
                                id="promethea-chat-prompt"
                                name="promethea_chat_prompt"
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        if (isAgentTyping !== 'none') {
                                            handlePivot();
                                        } else {
                                            handleSend();
                                        }
                                    }
                                }}
                                placeholder={
                                    isAgentTyping !== 'none' 
                                        ? "Enter pivot modifier (e.g. 'and make it more technical')..." 
                                        : activePath[activePath.length - 1]?.status === 'paused'
                                            ? "Cognitive state suspended. Anchor another node or type to resume..."
                                            : `Broadcast signed packet to ${activeThread?.name}...`
                                }
                                className="flex-1 bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-[9px] font-sans placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                            />
                            {isAgentTyping !== 'none' ? (
                                <button
                                    onClick={handlePivot}
                                    className="p-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded transition-colors flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20 font-black text-[7px] gap-1 px-2.5"
                                    title="Pivot current stream with modifier"
                                >
                                    <span>⚡ PIVOT</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleSend}
                                    disabled={isAgentTyping !== 'none'}
                                    className="p-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-black rounded transition-colors flex items-center justify-center shrink-0"
                                >
                                    <Send className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>  </div>
                </div>
            </div>

            {/* MODAL / OVERLAY: Add Peer */}
            {showAddPeer && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
                    <div className="bg-zinc-950 border border-amber-500/30 rounded-xl p-4 w-72 space-y-3">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-amber-400">Register Peer DID</h4>
                            <button onClick={() => setShowAddPeer(false)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <label htmlFor="peer-name-input" className="text-[7px] text-zinc-500 font-mono block mb-1">PEER NAME</label>
                                <input 
                                    id="peer-name-input"
                                    name="peer_name_input"
                                    type="text" 
                                    value={peerNameInput}
                                    onChange={e => setPeerNameInput(e.target.value)}
                                    placeholder="Citizen Sarah"
                                    className="w-full bg-black border border-white/10 rounded p-1.5 text-[9px] text-white focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="peer-did-input" className="text-[7px] text-zinc-500 font-mono block mb-1">SOVEREIGN DID KEY</label>
                                <input 
                                    id="peer-did-input"
                                    name="peer_did_input"
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
                            className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded transition-all"
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
                                <label htmlFor="group-name-input" className="text-[7px] text-zinc-500 font-mono block mb-1">COUNCIL GROUP NAME</label>
                                <input 
                                    id="group-name-input"
                                    name="group_name_input"
                                    type="text" 
                                    value={groupNameInput}
                                    onChange={e => setGroupNameInput(e.target.value)}
                                    placeholder="Alpha Zone Syndicate"
                                    className="w-full bg-black border border-white/10 rounded p-1.5 text-[9px] text-white focus:outline-none"
                                />
                            </div>
                            
                            <div>
                                <span className="text-[7px] text-zinc-500 font-mono block mb-1">PARTICIPANTS Ensemble</span>
                                <div className="space-y-1.5 max-h-24 overflow-y-auto border border-white/5 p-1.5 rounded bg-black/40">
                                    {[
                                        { id: 'promethea', label: '🧠 Promethea ASGI' },
                                        { id: 'antigravity', label: '👾 Antigravity Pair' },
                                        { id: 'did:sovereign:peer:0x8f2a', label: '👤 Citizen Joshua' }
                                    ].map((part) => {
                                        const isSel = selectedGroupParticipants.includes(part.id);
                                        const checkboxId = `participant-${part.id}`;
                                        return (
                                            <label key={part.id} htmlFor={checkboxId} className="flex items-center gap-2 cursor-pointer select-none">
                                                <input 
                                                    id={checkboxId}
                                                    name={`participant_${part.id}`}
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
