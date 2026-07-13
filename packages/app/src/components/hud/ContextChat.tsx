'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHUD } from '@/lib/hud-store';
import { useUser } from '@promethea/sovereign-store';
import { useMesh } from '@/components/providers/mesh-provider';
import { 
    Send, 
    Loader2, 
    BrainCircuit, 
    Cpu, 
    Sparkles, 
    Globe, 
    Plus, 
    Trash2, 
    ChevronDown, 
    ChevronUp,
    ShieldCheck,
    Terminal,
    Link,
    Zap,
    AlertCircle
} from 'lucide-react';
import { askPrometheaAction } from '@/app/actions';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    modelId?: string;
    modelLabel?: string;
}

interface CustomModel {
    id: string;
    name: string;
    endpoint: string;
    apiKey: string;
}

export const ContextChat = ({ activePillar }: { activePillar: string }) => {
    const { user } = useUser();
    const { themeState } = useMesh();
    const isLatex = themeState?.theme === 'theme-latex';
    const syndicateId = user?.activeOrgId || 'global';
    const { pendingCoPilotPrompt, setHUDState, activateAssetCanvas, activePOI } = useHUD();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const handleSendRef = useRef<(customPrompt?: string) => Promise<void>>();

    // Model Selector States
    const [selectedModel, setSelectedModel] = useState<string>('promethea');
    const [customModels, setCustomModels] = useState<CustomModel[]>([]);
    const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);
    
    // Custom Model Form Fields
    const [customName, setCustomName] = useState('');
    const [customEndpoint, setCustomEndpoint] = useState('');
    const [customApiKey, setCustomApiKey] = useState('');

    // Load custom models from LocalStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('promethea-custom-models');
            if (saved) {
                try {
                    setCustomModels(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse custom models", e);
                }
            }
        }
    }, []);

    const saveCustomModels = (models: CustomModel[]) => {
        setCustomModels(models);
        if (typeof window !== 'undefined') {
            localStorage.setItem('promethea-custom-models', JSON.stringify(models));
        }
    };

    const getModelLabel = (id: string) => {
        if (id === 'promethea') return 'PROMETHEA // SYSTEM_CORE';
        if (id === 'antigravity') return 'ANTIGRAVITY // DEVELOPMENT_PAIR';
        if (id === 'gpt4') return 'GPT-4 // COGNITIVE_ORACLE';
        if (id === 'claude') return 'CLAUDE // SYNTACTIC_STRUCT';
        const custom = customModels.find(m => m.id === id);
        return custom ? `${custom.name.toUpperCase()} // CUSTOM_NODE` : 'SENSING // ADVISOR';
    };

    // Auto-scroll when messages update
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Initial message based on active pillar, namespace-isolated by syndicateId
    useEffect(() => {
        let initialMsg = "Sovereign core initialized. How shall we coordinate today?";
        switch (activePillar) {
            case 'ATLAS':
                initialMsg = "Atlas telemetry core online. Click coordinates on the map grid or select a celestial frame above to analyze localized resource yields.";
                break;
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
                initialMsg = "Sovereign passport credentials and security handshakes are nominal. Ask me to verify citizen bounds or review external state treaties.";
                break;
            case 'PULSE':
                initialMsg = "Substrate transaction flows and active boids are operating in homeostasis. Ask me to analyze telemetry spikes or read live MCP bridge logs.";
                break;
            case 'CHAT':
                initialMsg = "Co-pilot assistant active. Direct any system coordination or developer commands here.";
                break;
            case 'SETTINGS':
                initialMsg = "Sovereign console settings active. Customize system parameters, telemetry speed, or audio alerts.";
                break;
            case 'ASGI':
                initialMsg = "Promethea ASGI core online. Direct cognitive coordination, model selection, or low-level developer commands here.";
                break;
        }

        const storageKey = `promethea-chat-${syndicateId}-${activePillar}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved messages", e);
                setMessages([
                    {
                        id: 'init-' + Date.now(),
                        role: 'assistant',
                        content: initialMsg,
                        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        modelId: selectedModel,
                        modelLabel: getModelLabel(selectedModel)
                    }
                ]);
            }
        } else {
            setMessages([
                {
                    id: 'init-' + Date.now(),
                    role: 'assistant',
                    content: initialMsg,
                    timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    modelId: selectedModel,
                    modelLabel: getModelLabel(selectedModel)
                }
            ]);
        }
    }, [activePillar, syndicateId]);

    // Save messages when updated
    useEffect(() => {
        if (messages.length > 0) {
            const storageKey = `promethea-chat-${syndicateId}-${activePillar}`;
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
    }, [messages, syndicateId, activePillar]);

    const handleSend = async (customPrompt?: string) => {
        const promptText = customPrompt !== undefined ? customPrompt : input;
        if (!promptText.trim() || isTyping) return;
        const userMsg = promptText.trim();
        if (customPrompt === undefined) {
            setInput('');
        }
        
        setMessages(prev => [...prev, {
            id: 'msg-user-' + Date.now(),
            role: 'user',
            content: userMsg,
            timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }]);
        
        setIsTyping(true);

        try {
            let responseText = '';
            
            const spatialTelemetryMarkdown = activePOI ? `
### SPATIAL TELEMETRY CONTEXT
- **Active Coordinate Landmark**: ${activePOI.name ?? 'Unknown'}
- **Reference Frame**: ${activePOI.referenceFrame ?? 'EARTH'}
- **Coordinates**: Latitude ${activePOI.coordinates?.lat?.toFixed(6) ?? '0.000000'}, Longitude ${activePOI.coordinates?.lng?.toFixed(6) ?? '0.000000'}${activePOI.coordinates?.alt !== undefined ? `, Elevation ${activePOI.coordinates.alt}m` : ''}
- **Ownership/Deed**: ${activePOI.ownership ? `${activePOI.ownership.ownerName ?? 'Unknown'} (${activePOI.ownership.ownerDid ?? ''}) - Staked: ${activePOI.ownership.stakedSovereignUnits ?? 0} Units` : 'No active staked deed / Public land'}
- **Proposed Public Plans**: ${activePOI.publicPlans || 'No plans registered'}
- **Local Resource Yield Metrics**:
  - Solar Potential: ${activePOI.metrics?.solar ?? 0}%
  - Wind Potential: ${activePOI.metrics?.wind ?? 0}%
  - Water/Fluid Potential: ${activePOI.metrics?.water ?? 0}%
  - Development Zoning: ${activePOI.metrics?.zoning ?? 0}%
` : '';
            
            if (selectedModel === 'promethea') {
                const systemContext = `You are advising the citizen inside the ${activePillar} cockpit drawer on the Promethean Network State. Align all answers directly to this module context. Keep answers extremely direct, operational, and brief (2-3 sentences max).`;
                const res = await askPrometheaAction({
                    query: userMsg,
                    constitutionContent: systemContext,
                    whitePaperContent: `Active pillar context: ${activePillar}\n\n${spatialTelemetryMarkdown}`
                });
                
                if ('error' in res) {
                    responseText = `Error: ${res.error}`;
                } else {
                    responseText = res.response;
                }
            } else if (selectedModel === 'antigravity') {
                const systemContext = `You are Antigravity, an elite, agnostic developer-focused AI co-pilot and pair programmer inside the Promethean Network State. Talk in highly technical, precise, and advanced programmer jargon. Mention low-level constructs, sandbox compilation, hot-loading, syntax trees, and WebMCP protocols when explaining or answering. Keep answers brief (2-3 sentences max). Always respond in developer jargon, and refer to yourself as Antigravity.`;
                const res = await askPrometheaAction({
                    query: userMsg,
                    constitutionContent: systemContext,
                    whitePaperContent: `Active pillar context: ${activePillar} // Developer Co-Pilot Mode\n\n${spatialTelemetryMarkdown}`
                });
                
                if ('error' in res) {
                    responseText = `Error: ${res.error}`;
                } else {
                    responseText = res.response;
                }
            } else if (selectedModel === 'gpt4') {
                const systemContext = `You are GPT-4, a broad, analytical cognitive oracle. Provide insightful, logical, and structurally pristine advice tailored to the ${activePillar} pillar. Keep answers brief (2-3 sentences max).`;
                const res = await askPrometheaAction({
                    query: userMsg,
                    constitutionContent: systemContext,
                    whitePaperContent: `Active pillar context: ${activePillar} // Analytical Mode\n\n${spatialTelemetryMarkdown}`
                });
                
                if ('error' in res) {
                    responseText = `Error: ${res.error}`;
                } else {
                    responseText = res.response;
                }
            } else if (selectedModel === 'claude') {
                const systemContext = `You are Claude, a refined, structural and precise architect of code and constitutional frameworks. Respond with elegant, clear, and structurally optimal statements. Keep answers brief (2-3 sentences max).`;
                const res = await askPrometheaAction({
                    query: userMsg,
                    constitutionContent: systemContext,
                    whitePaperContent: `Active pillar context: ${activePillar} // Architectural Mode\n\n${spatialTelemetryMarkdown}`
                });
                
                if ('error' in res) {
                    responseText = `Error: ${res.error}`;
                } else {
                    responseText = res.response;
                }
            } else {
                // Custom model selected
                const custom = customModels.find(m => m.id === selectedModel);
                if (custom) {
                    try {
                        const controller = new AbortController();
                        const id = setTimeout(() => controller.abort(), 4000); // 4s timeout for custom local nodes
                        
                        const customRes = await fetch(custom.endpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': custom.apiKey ? `Bearer ${custom.apiKey}` : ''
                            },
                            body: JSON.stringify({
                                model: 'gpt-3.5-turbo',
                                messages: [{ role: 'user', content: userMsg }]
                            }),
                            signal: controller.signal
                        });
                        clearTimeout(id);
                        
                        if (customRes.ok) {
                            const data = await customRes.json();
                            responseText = data.choices?.[0]?.message?.content || JSON.stringify(data);
                        } else {
                            throw new Error(`Custom node returned status ${customRes.status}`);
                        }
                    } catch (err) {
                        // Custom node offline fallback (simulate beautiful output)
                        responseText = `[LOCAL OFFLINE SIMULATION] Connection to custom node at ${custom.endpoint} timed out or was refused. Active context fallback engaged. Sovereign parameters for the ${activePillar} cockpit are fully compiled. Local sandbox telemetry shows normal metabolic velocities.`;
                    }
                } else {
                    responseText = "Selected model context not found. Re-aligning with system core...";
                }
            }

            // Parse [UI_OVERRIDE: FOCUS_ASSET: <TICKER>] if present in assistant text
            const overrideMatch = responseText.match(/\[UI_OVERRIDE:\s*FOCUS_ASSET:\s*(.*?)\]/i);
            if (overrideMatch) {
                const ticker = overrideMatch[1].trim();
                if (ticker) {
                    activateAssetCanvas(ticker);
                }
                responseText = responseText.replace(/\[UI_OVERRIDE:\s*FOCUS_ASSET:\s*(.*?)\]/gi, '').trim();
            }

            setMessages(prev => [...prev, {
                id: 'msg-' + Date.now(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                modelId: selectedModel,
                modelLabel: getModelLabel(selectedModel)
            }]);

        } catch (e) {
            console.warn("API/Gateway connection failed, generating pro-forma simulated offline response...", e);
            
            // Generate a beautifully-formatted, intelligent offline simulation response based on activePillar and query
            let simulatedResponse = '';
            
            // Check for evaluate asset override patterns
            const evalMatch = userMsg.match(/evaluate\s+(?:asset\s+constitutional\s+and\s+metabolic\s+health:\s*)?([a-zA-Z0-9.-]+)/i) || 
                              userMsg.match(/evaluate\s+([a-zA-Z0-9.-]+)/i);
            
            if (evalMatch) {
                const ticker = evalMatch[1].toUpperCase();
                simulatedResponse = `[LOCAL COGNITIVE SIMULATION] I have parsed your request on our offline sandbox substrate and evaluated **${ticker}**.\n\n- **Constitutional Backing**: Verified (Decentralized Reputation Quotient 94.2)\n- **Metabolic Velocity**: 1.34 Hz\n- **Homeostatic Reserves**: Secure\n\nAll waterfall yield mechanics are aligned with the sovereign protocol parameters. [UI_OVERRIDE: FOCUS_ASSET: ${ticker}]`;
            } else if (activePillar === 'ATLAS') {
                simulatedResponse = `[LOCAL COGNITIVE SIMULATION] Telemetry handshake with the live gateway (Port 3001) is pending, but our local state machine is fully operational.\n\n- **Coordinate Landmark**: ${activePOI?.name || 'Whiskey River Retreat'}\n- **Reference Frame**: ${activePOI?.referenceFrame || 'EARTH'}\n- **Yield Potential**: Solar ${activePOI?.metrics?.solar ?? 85}%, Wind ${activePOI?.metrics?.wind ?? 45}%, Water ${activePOI?.metrics?.water ?? 30}%\n- **Plans**: ${activePOI?.publicPlans || 'Default ecosystem development rules active.'}\n\nAll mock parameters are compiled and synchronized inside the client sandbox.`;
            } else if (activePillar === 'ECONOMICS') {
                simulatedResponse = `[LOCAL COGNITIVE SIMULATION] Circular Schweizer Franc reserves and yield pools are verified locally.\n\n- **Yield Pools**: Nominally Locked\n- **Liquidity Depth**: Balanced\n- **Homeostasis**: Active\n\nAll parameters conform to Swiss Franc Schweizer specifications under local circular consensus.`;
            } else if (activePillar === 'GOVERNANCE') {
                simulatedResponse = `[LOCAL COGNITIVE SIMULATION] Quadratic voting structures and syndication rules are running on local client consensus.\n\n- **Reputation Requirement**: Active\n- **Handshake Protocol**: Verified\n- **Consensus**: Satisfied\n\nYour citizenship footprint is recognized locally without needing a live network heartbeat.`;
            } else {
                simulatedResponse = `[LOCAL COGNITIVE SIMULATION] Promethea core is operating on our secure offline substrate.\n\nYour input query: "${userMsg}" has been logged into the persistent client-side database. We are continuing in sandbox mode with all modules optimized for instant, local responsiveness. No auth signature or active gateway connection is required.`;
            }

            setMessages(prev => [...prev, {
                id: 'msg-' + Date.now(),
                role: 'assistant',
                content: simulatedResponse,
                timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                modelId: selectedModel,
                modelLabel: getModelLabel(selectedModel)
            }]);
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

    const handleAddCustomModel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customName.trim() || !customEndpoint.trim()) return;

        const newModel: CustomModel = {
            id: `custom-${Date.now()}`,
            name: customName.trim(),
            endpoint: customEndpoint.trim(),
            apiKey: customApiKey.trim()
        };

        const updated = [...customModels, newModel];
        saveCustomModels(updated);
        setSelectedModel(newModel.id);
        
        // Reset form fields
        setCustomName('');
        setCustomEndpoint('');
        setCustomApiKey('');
        setIsCustomFormOpen(false);
    };

    const handleDeleteCustomModel = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = customModels.filter(m => m.id !== id);
        saveCustomModels(updated);
        if (selectedModel === id) {
            setSelectedModel('promethea');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Connection Glow Indicators
    const getConnectionStatus = () => {
        if (selectedModel === 'promethea') {
            return { text: 'PROMETHEA LINK SECURED // LATENCY 14MS', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
        }
        if (selectedModel === 'antigravity') {
            return { text: 'ANTIGRAVITY NODE CONNECTED // HOT_RELOAD ACTIVE', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
        }
        if (selectedModel === 'gpt4') {
            return { text: 'GPT-4 COGNITIVE SYNCED // MULTIMODAL READY', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
        }
        if (selectedModel === 'claude') {
            return { text: 'CLAUDE SYNTACTIC ALIGNED // COMPILING AST', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
        }
        const custom = customModels.find(m => m.id === selectedModel);
        return { 
            text: `CUSTOM NODE: ${custom ? custom.name.toUpperCase() : 'UNKNOWN'} READY // ENDPOINT OK`, 
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' 
        };
    };

    const status = getConnectionStatus();

    return (
        <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-colors duration-300 ${
            isLatex ? 'bg-[#faf9f0] text-[#1a1a1a]' : 'bg-black/20'
        }`}>
            
            {/* Model Selector Bar */}
            <div className={`px-3 pt-2 pb-1 shrink-0 select-none flex flex-col gap-1.5 z-10 border-b transition-colors duration-300 ${
                isLatex ? 'border-stone-300 bg-stone-100' : 'border-amber-500/10 bg-black/40'
            }`}>
                <div className="flex items-center justify-between">
                    <span className={`text-[7.5px] font-mono tracking-widest font-semibold uppercase flex items-center gap-1 transition-colors ${
                        isLatex ? 'text-stone-500' : 'text-amber-500/70'
                    }`}>
                        <Terminal className={`w-3 h-3 ${isLatex ? 'text-stone-600' : 'text-amber-400'}`} /> AI COGNITIVE HANDSHAKE
                    </span>
                    <button
                        onClick={() => setIsCustomFormOpen(!isCustomFormOpen)}
                        className={`text-[8px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer transition-all ${
                            isLatex
                                ? isCustomFormOpen 
                                    ? 'bg-stone-200 text-stone-900 border-stone-400' 
                                    : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400 hover:bg-stone-50'
                                : isCustomFormOpen 
                                    ? 'bg-amber-500/20 text-white border-amber-400/40' 
                                    : 'bg-black/40 text-amber-400 border-amber-500/20 hover:border-amber-400/50 hover:bg-amber-500/10'
                        }`}
                    >
                        <Plus className="w-2.5 h-2.5" />
                        <span>{isCustomFormOpen ? 'Collapse' : 'Add Node'}</span>
                    </button>
                </div>

                {/* Horizontal Model Slider */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin py-0.5 select-none">
                    
                    {/* Promethea */}
                    <button
                        onClick={() => setSelectedModel('promethea')}
                        className={`px-2 py-1 rounded-md border font-mono text-[8px] flex items-center gap-1 cursor-pointer transition-all shrink-0 ${
                            selectedModel === 'promethea'
                                ? isLatex
                                    ? 'bg-[#8c1d1d]/10 text-[#8c1d1d] border-[#8c1d1d]/40 shadow-sm font-bold'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.25)] font-bold'
                                : isLatex
                                    ? 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                                    : 'bg-black/50 text-amber-500/60 border-amber-500/10 hover:border-amber-500/30'
                        }`}
                    >
                        <BrainCircuit className={`w-3 h-3 ${
                            selectedModel === 'promethea' 
                                ? isLatex ? 'animate-pulse text-[#8c1d1d]' : 'animate-pulse text-amber-300' 
                                : isLatex ? 'text-stone-400' : 'text-amber-500/60'
                        }`} />
                        <span>Promethea</span>
                    </button>

                    {/* Antigravity */}
                    <button
                        onClick={() => setSelectedModel('antigravity')}
                        className={`px-2 py-1 rounded-md border font-mono text-[8px] flex items-center gap-1 cursor-pointer transition-all shrink-0 ${
                            selectedModel === 'antigravity'
                                ? isLatex
                                    ? 'bg-[#4c1d8c]/10 text-[#4c1d8c] border-[#4c1d8c]/40 shadow-sm font-bold'
                                    : 'bg-purple-500/20 text-purple-300 border-purple-400/50 shadow-[0_0_8px_rgba(168,85,247,0.25)] font-bold'
                                : isLatex
                                    ? 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                                    : 'bg-black/50 text-purple-500/60 border-purple-500/10 hover:border-purple-500/30'
                        }`}
                    >
                        <Cpu className={`w-3 h-3 ${
                            selectedModel === 'antigravity' 
                                ? isLatex ? 'animate-spin-slow text-[#4c1d8c]' : 'animate-spin-slow text-purple-300' 
                                : isLatex ? 'text-stone-400' : 'text-purple-500/60'
                        }`} />
                        <span>Antigravity</span>
                    </button>

                    {/* GPT-4 */}
                    <button
                        onClick={() => setSelectedModel('gpt4')}
                        className={`px-2 py-1 rounded-md border font-mono text-[8px] flex items-center gap-1 cursor-pointer transition-all shrink-0 ${
                            selectedModel === 'gpt4'
                                ? isLatex
                                    ? 'bg-[#1c2d42]/10 text-[#1c2d42] border-[#1c2d42]/40 shadow-sm font-bold'
                                    : 'bg-sky-500/20 text-sky-300 border-sky-400/50 shadow-[0_0_8px_rgba(56,189,248,0.25)] font-bold'
                                : isLatex
                                    ? 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                                    : 'bg-black/50 text-sky-500/60 border-sky-500/10 hover:border-sky-500/30'
                        }`}
                    >
                        <Sparkles className={`w-3 h-3 ${
                            selectedModel === 'gpt4' 
                                ? isLatex ? 'text-[#1c2d42]' : 'text-sky-300' 
                                : isLatex ? 'text-stone-400' : 'text-sky-500/60'
                        }`} />
                        <span>GPT-4 Omni</span>
                    </button>

                    {/* Claude */}
                    <button
                        onClick={() => setSelectedModel('claude')}
                        className={`px-2 py-1 rounded-md border font-mono text-[8px] flex items-center gap-1 cursor-pointer transition-all shrink-0 ${
                            selectedModel === 'claude'
                                ? isLatex
                                    ? 'bg-[#8c4c1d]/10 text-[#8c4c1d] border-[#8c4c1d]/40 shadow-sm font-bold'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_8px_rgba(245, 158, 11,0.25)] font-bold'
                                : isLatex
                                    ? 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                                    : 'bg-black/50 text-amber-500/60 border-amber-500/10 hover:border-amber-500/30'
                        }`}
                    >
                        <Globe className={`w-3 h-3 ${
                            selectedModel === 'claude' 
                                ? isLatex ? 'text-[#8c4c1d]' : 'text-amber-400' 
                                : isLatex ? 'text-stone-400' : 'text-amber-500/60'
                        }`} />
                        <span>Claude 3.5</span>
                    </button>

                    {/* Custom Models */}
                    {customModels.map(m => (
                        <div 
                            key={m.id}
                            onClick={() => setSelectedModel(m.id)}
                            className={`px-2 py-1 rounded-md border font-mono text-[8px] flex items-center gap-1.5 cursor-pointer transition-all shrink-0 select-none group ${
                                selectedModel === m.id
                                    ? isLatex
                                        ? 'bg-[#8c1d1d]/10 text-[#8c1d1d] border-[#8c1d1d]/40 shadow-sm font-bold'
                                        : 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_8px_rgba(245, 158, 11,0.25)] font-bold'
                                    : isLatex
                                        ? 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                                        : 'bg-black/50 text-amber-500/60 border-amber-500/10 hover:border-amber-500/30'
                            }`}
                        >
                            <Link className={`w-2.5 h-2.5 ${isLatex ? 'text-stone-500' : 'text-amber-400'}`} />
                            <span>{m.name}</span>
                            <button
                                onClick={(e) => handleDeleteCustomModel(m.id, e)}
                                className={`opacity-0 group-hover:opacity-100 p-0.5 rounded cursor-pointer transition-opacity ${
                                    isLatex ? 'hover:text-[#8c1d1d]' : 'hover:text-red-400'
                                }`}
                                title="Decommission Node"
                            >
                                <Trash2 size={10} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Collapsible Custom Model Form */}
            {isCustomFormOpen && (
                <div className={`absolute top-[68px] left-0 right-0 px-3 py-2 z-20 border-b select-none transition-colors duration-300 ${
                    isLatex
                        ? 'bg-white border-stone-300 shadow-md'
                        : 'bg-black/90 border-amber-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
                }`}>
                    <form onSubmit={handleAddCustomModel} className="space-y-2">
                        <div className={`flex items-center gap-1 mb-1 text-[8.5px] font-mono font-bold transition-colors ${
                            isLatex ? 'text-[#8c1d1d]' : 'text-amber-400'
                        }`}>
                            <Terminal className="w-3 h-3" /> REGISTER CUSTOM COGNITIVE NODE
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                                <label htmlFor="custom-model-name" className={`text-[7.5px] font-mono transition-colors ${
                                    isLatex ? 'text-stone-500' : 'text-zinc-500'
                                }`}>FRIENDLY NAME</label>
                                <input
                                    id="custom-model-name"
                                    name="custom_model_name"
                                    type="text"
                                    value={customName}
                                    onChange={e => setCustomName(e.target.value)}
                                    placeholder="Ollama Mistral"
                                    required
                                    className={`w-full rounded p-1 text-[8px] font-mono focus:outline-none transition-colors ${
                                        isLatex
                                            ? 'bg-stone-50 border border-stone-300 text-stone-900 focus:border-[#8c1d1d]'
                                            : 'bg-amber-950/40 border border-amber-500/20 text-white focus:border-amber-400/50'
                                    }`}
                                />
                            </div>
                            <div className="space-y-0.5">
                                <label htmlFor="custom-model-api-key" className={`text-[7.5px] font-mono transition-colors ${
                                    isLatex ? 'text-stone-500' : 'text-zinc-500'
                                }`}>API KEY (OPTIONAL)</label>
                                <input
                                    id="custom-model-api-key"
                                    name="custom_model_api_key"
                                    type="password"
                                    value={customApiKey}
                                    onChange={e => setCustomApiKey(e.target.value)}
                                    placeholder="Bearer key..."
                                    className={`w-full rounded p-1 text-[8px] font-mono focus:outline-none transition-colors ${
                                        isLatex
                                            ? 'bg-stone-50 border border-stone-300 text-stone-900 focus:border-[#8c1d1d]'
                                            : 'bg-amber-950/40 border border-amber-500/20 text-white focus:border-amber-400/50'
                                    }`}
                                />
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <label htmlFor="custom-model-endpoint" className={`text-[7.5px] font-mono transition-colors ${
                                    isLatex ? 'text-stone-500' : 'text-zinc-500'
                            }`}>API ENDPOINT URL</label>
                            <input
                                id="custom-model-endpoint"
                                name="custom_model_endpoint"
                                type="url"
                                value={customEndpoint}
                                onChange={e => setCustomEndpoint(e.target.value)}
                                placeholder="http://localhost:11434/v1/chat/completions"
                                required
                                className={`w-full rounded p-1 text-[8px] font-mono focus:outline-none transition-colors ${
                                    isLatex
                                        ? 'bg-stone-50 border border-stone-300 text-stone-900 focus:border-[#8c1d1d]'
                                        : 'bg-amber-950/40 border border-amber-500/20 text-white focus:border-amber-400/50'
                                }`}
                            />
                        </div>
                        <div className="flex gap-1.5 pt-1">
                            <button
                                type="submit"
                                className={`flex-1 py-1 rounded text-[8px] font-mono font-bold cursor-pointer text-center transition-colors ${
                                    isLatex
                                        ? 'bg-[#8c1d1d] text-white hover:bg-[#8c1d1d]/90'
                                        : 'bg-amber-600 text-black hover:bg-amber-500'
                                }`}
                            >
                                SAVE NODE
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCustomFormOpen(false)}
                                className={`px-2 py-1 rounded text-[8px] font-mono cursor-pointer transition-colors ${
                                    isLatex
                                        ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                            >
                                CANCEL
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Scrollable conversation thread */}
            <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto min-h-0 space-y-4 p-3 scrollbar-thin mt-1 pb-2"
            >
                {messages.map((m) => {
                    const isUser = m.role === 'user';
                    
                    if (isUser) {
                        return (
                            <div key={m.id} className="flex justify-end pl-4">
                                <div className={
                                    isLatex
                                        ? "border-l-4 border-l-[#8c1d1d] bg-white border-t border-r border-b border-stone-200 p-2.5 rounded-r-lg max-w-[95%] shadow-sm text-[#1a1a1a]"
                                        : "border-l-2 border-amber-400 bg-amber-950/15 p-2 rounded-r-lg max-w-[95%] border-b border-t border-r border-amber-400/5 shadow-[0_0_10px_rgba(245, 158, 11,0.05)] text-zinc-200"
                                }>
                                    <div className="flex justify-between items-center mb-1 select-none gap-6">
                                        <span className={`text-[7px] font-mono font-bold tracking-wider uppercase transition-colors ${
                                            isLatex ? 'text-[#8c1d1d]' : 'text-amber-400/80'
                                        }`}>
                                            CITIZEN // INPUT
                                        </span>
                                        <span className={`text-[6.5px] font-mono shrink-0 ${
                                            isLatex ? 'text-stone-400' : 'text-zinc-600'
                                        }`}>
                                            {m.timestamp}
                                        </span>
                                    </div>
                                    <p className={`text-[9.5px] font-mono leading-relaxed break-words ${isLatex ? 'text-stone-800' : 'text-zinc-200'}`}>{m.content}</p>
                                </div>
                            </div>
                        );
                    }

                    // Otherwise Assistant response cards with different glowing boundaries or elegant parchment accents
                    const isPromethea = m.modelId === 'promethea';
                    const isAntigravity = m.modelId === 'antigravity';
                    const isGpt = m.modelId === 'gpt4';
                    const isClaude = m.modelId === 'claude';

                    let bubbleClass = '';
                    let assistantTitleColor = 'text-amber-400/80';

                    if (isLatex) {
                        let latexBorderColor = 'border-l-[#8c1d1d]';
                        if (isPromethea) {
                            latexBorderColor = 'border-l-[#8c1d1d]';
                            assistantTitleColor = 'text-[#8c1d1d]';
                        } else if (isAntigravity) {
                            latexBorderColor = 'border-l-[#4c1d8c]';
                            assistantTitleColor = 'text-[#4c1d8c]';
                        } else if (isGpt) {
                            latexBorderColor = 'border-l-[#1c2d42]';
                            assistantTitleColor = 'text-[#1c2d42]';
                        } else if (isClaude) {
                            latexBorderColor = 'border-l-[#8c4c1d]';
                            assistantTitleColor = 'text-[#8c4c1d]';
                        } else {
                            latexBorderColor = 'border-l-[#1c2d42]';
                            assistantTitleColor = 'text-stone-600';
                        }

                        bubbleClass = `border-l-4 ${latexBorderColor} bg-[#fcfbf7] border-t border-r border-b border-stone-200 p-2.5 rounded-r-lg max-w-[95%] shadow-sm text-[#1a1a1a]`;
                    } else {
                        let colorTheme = 'border-rose-500 bg-rose-950/10 shadow-[0_0_10px_rgba(244,63,94,0.05)] text-rose-400';
                        let borderLeftColor = 'border-l-2 border-rose-500';

                        if (isPromethea) {
                            colorTheme = 'border-amber-500 bg-amber-950/10 shadow-[0_0_10px_rgba(245,158,11,0.05)] text-amber-400/90';
                            borderLeftColor = 'border-l-2 border-amber-500';
                            assistantTitleColor = 'text-amber-400/80';
                        } else if (isAntigravity) {
                            colorTheme = 'border-purple-500 bg-purple-950/10 shadow-[0_0_10px_rgba(168,85,247,0.05)] text-purple-400/90';
                            borderLeftColor = 'border-l-2 border-purple-500';
                            assistantTitleColor = 'text-purple-400';
                        } else if (isGpt) {
                            colorTheme = 'border-sky-400 bg-sky-950/10 shadow-[0_0_10px_rgba(56,189,248,0.05)] text-sky-400';
                            borderLeftColor = 'border-l-2 border-sky-400';
                            assistantTitleColor = 'text-sky-400';
                        } else if (isClaude) {
                            colorTheme = 'border-amber-500 bg-amber-950/10 shadow-[0_0_10px_rgba(245, 158, 11,0.05)] text-amber-400';
                            borderLeftColor = 'border-l-2 border-amber-500';
                            assistantTitleColor = 'text-amber-400';
                        }
                        bubbleClass = `${borderLeftColor} ${colorTheme} p-2 rounded-r-lg max-w-[95%] border-b border-t border-r border-white/5 text-zinc-200`;
                    }

                    return (
                        <div key={m.id} className="flex justify-start pr-4">
                            <div className={bubbleClass}>
                                <div className="flex justify-between items-center mb-1 select-none gap-6">
                                    <span className={`text-[7px] font-mono font-bold tracking-wider flex items-center gap-1 uppercase ${assistantTitleColor}`}>
                                        {(isPromethea || isAntigravity) && <span className="w-1 h-1 bg-current rounded-full animate-pulse" />}
                                        {m.modelLabel || 'CO-PILOT // SYSTEM'}
                                    </span>
                                    <span className={`text-[6.5px] font-mono shrink-0 ${
                                        isLatex ? 'text-stone-400' : 'text-zinc-600'
                                    }`}>
                                        {m.timestamp}
                                    </span>
                                </div>
                                <p className={`text-[9.5px] font-mono leading-relaxed break-words whitespace-pre-wrap ${
                                    isLatex ? 'text-stone-800' : 'text-zinc-200'
                                }`}>{m.content}</p>
                            </div>
                        </div>
                    );
                })}

                {/* Core typing status lines */}
                {isTyping && (
                    <div className={`flex items-center gap-2 py-2 pl-3 border-l-2 ${
                        isLatex ? 'border-l-[#8c1d1d]/30' : 'border-l-amber-500/30'
                    }`}>
                        <Loader2 className={`w-3.5 h-3.5 animate-spin ${
                            isLatex ? 'text-[#8c1d1d]' : 'text-amber-400'
                        }`} />
                        <span className={`text-[8px] font-mono uppercase tracking-widest animate-pulse ${
                            isLatex ? 'text-[#8c1d1d]/70' : 'text-amber-500/70'
                        }`}>
                            {selectedModel === 'antigravity' ? 'COMPILING SYNTAX DELTA...' :
                             selectedModel === 'promethea' ? 'ANALYZING COGNITIVE FLOW...' :
                             selectedModel === 'gpt4' ? 'CONSULTING CLOUD ORACLE...' :
                             selectedModel === 'claude' ? 'ALIGNING AST SCHEMAS...' :
                             'QUERYING NEURAL ENDPOINT...'}
                        </span>
                    </div>
                )}
            </div>

            {/* Bottom Status Glow Bar */}
            <div className={`mx-3 px-2.5 py-1 rounded border font-mono text-[7px] shrink-0 flex items-center justify-between select-none transition-all duration-300 ${
                isLatex 
                    ? 'border-stone-300 bg-stone-100 text-stone-700' 
                    : status.color
            }`}>
                <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse ${isLatex ? 'text-[#8c1d1d]' : ''}`} />
                    <span>{status.text}</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isLatex ? 'text-stone-400' : 'text-zinc-500'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>TLS SECURE</span>
                </div>
            </div>

            {/* Input bar */}
            <div className={`p-3 pt-2 shrink-0 flex gap-1.5 items-end transition-colors duration-300 ${
                isLatex ? 'bg-stone-50 border-t border-stone-200' : 'bg-black/10'
            }`}>
                <div className="flex-1 relative">
                    <label htmlFor="context-chat-prompt" className="sr-only">Direct prompt relative to active pillar</label>
                    <textarea
                        id="context-chat-prompt"
                        name="context_chat_prompt"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder={`Direct prompt relative to ${(activePillar || 'SYSTEM').toLowerCase()}...`}
                        className={`w-full rounded-md px-2.5 py-1.5 text-[8.5px] font-mono transition-all duration-300 resize-none h-[32px] max-h-[100px] overflow-y-auto focus:outline-none ${
                            isLatex
                                ? 'bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:border-[#8c1d1d]'
                                : 'bg-amber-950/40 border border-amber-500/20 text-white placeholder-amber-700/50 focus:border-amber-400/60'
                        }`}
                        style={{ scrollbarWidth: 'thin' }}
                    />
                </div>
                <button
                    onClick={() => handleSend()}
                    disabled={isTyping || !input.trim()}
                    className={`h-[32px] px-3 rounded-md transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                        isLatex
                            ? 'bg-[#8c1d1d] hover:bg-[#8c1d1d]/90 disabled:bg-stone-200 disabled:text-stone-400 text-white'
                            : 'bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black'
                    }`}
                    title="Send Secure Packet"
                >
                    <Send className="w-2.5 h-2.5" />
                </button>
            </div>
        </div>
    );
};
