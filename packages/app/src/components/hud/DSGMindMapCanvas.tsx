'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHUD, ChatMessage, ExecutionSnapshot, getActivePath } from '@/lib/hud-store';
import { Play, Pause, Anchor, ShieldAlert, Cpu, FileCode, Layers, Info } from 'lucide-react';

interface DSGMindMapCanvasProps {
    threadId: string;
}

export default function DSGMindMapCanvas({ threadId }: DSGMindMapCanvasProps) {
    const { chatThreads, anchorChatThread } = useHUD();
    const [hoveredNode, setHoveredNode] = useState<ChatMessage | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const thread = useMemo(() => {
        return chatThreads.find(t => t.id === threadId);
    }, [chatThreads, threadId]);

    // Active path nodes to determine which ones are highlighted
    const activePathIds = useMemo(() => {
        if (!thread) return new Set<string>();
        const path = getActivePath(thread);
        return new Set(path.map(m => m.id));
    }, [thread]);

    // Build the hierarchical layout for the Directed Semantic Graph
    const graphData = useMemo(() => {
        if (!thread || !thread.messages || thread.messages.length === 0) return null;

        const messages = thread.messages;
        const msgMap = new Map<string, ChatMessage>();
        messages.forEach(m => msgMap.set(m.id, m));

        // Find root nodes (no parent or parent not in this thread)
        const roots: string[] = [];
        messages.forEach(m => {
            if (!m.parentId || !msgMap.has(m.parentId)) {
                roots.push(m.id);
            }
        });

        // Compute depth levels & child mappings
        const childrenMap = new Map<string, string[]>();
        const nodeDepth = new Map<string, number>();

        const traverse = (nodeId: string, depth: number) => {
            nodeDepth.set(nodeId, depth);
            const msg = msgMap.get(nodeId);
            if (msg && msg.childrenIds) {
                // filter existing children to make sure they are in this thread
                const validChildren = msg.childrenIds.filter(cid => msgMap.has(cid));
                childrenMap.set(nodeId, validChildren);
                validChildren.forEach(cid => traverse(cid, depth + 1));
            } else {
                childrenMap.set(nodeId, []);
            }
        };

        roots.forEach(r => traverse(r, 0));

        // Let's position nodes based on depth and vertical index
        const depthNodesMap = new Map<number, string[]>();
        nodeDepth.forEach((depth, id) => {
            if (!depthNodesMap.has(depth)) {
                depthNodesMap.set(depth, []);
            }
            depthNodesMap.get(depth)!.push(id);
        });

        // Compute coordinate positions
        const positions = new Map<string, { x: number; y: number }>();
        const horizontalSpacing = 220;
        const verticalSpacing = 120;
        const startX = 100;
        const startY = 180;

        depthNodesMap.forEach((ids, depth) => {
            const levelX = startX + depth * horizontalSpacing;
            const totalLevelHeight = (ids.length - 1) * verticalSpacing;
            const levelStartY = startY - totalLevelHeight / 2;

            ids.forEach((id, index) => {
                const levelY = levelStartY + index * verticalSpacing;
                positions.set(id, { x: levelX, y: levelY });
            });
        });

        // Fallback positioning for disconnected nodes
        messages.forEach(m => {
            if (!positions.has(m.id)) {
                positions.set(m.id, { x: startX, y: startY });
            }
        });

        return {
            messages,
            positions,
            childrenMap,
            msgMap
        };
    }, [thread]);

    if (!thread || !graphData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 font-mono text-[11px] uppercase tracking-widest gap-2">
                <Layers className="w-8 h-8 text-zinc-700 animate-pulse" />
                <span>No active cognitive network thread detected.</span>
            </div>
        );
    }

    const { messages, positions, msgMap } = graphData;

    const getNodeColor = (msg: ChatMessage, isActive: boolean) => {
        if (!isActive) return 'rgba(113, 113, 122, 0.3)';
        if (msg.status === 'paused' || msg.status === 'interrupted') return '#ef4444';
        if (msg.signature) return '#22c55e';
        if (msg.role === 'promethea' || msg.role === 'antigravity') return '#f59e0b';
        return '#f59e0b';
    };

    const handleNodeHover = (e: React.MouseEvent, msg: ChatMessage) => {
        const svg = e.currentTarget.ownerDocument.getElementById('dsg-svg-canvas');
        if (svg) {
            const rect = svg.getBoundingClientRect();
            setTooltipPos({
                x: e.clientX - rect.left + 20,
                y: e.clientY - rect.top - 40
            });
        }
        setHoveredNode(msg);
    };

    return (
        <div className="relative w-full h-full bg-black/40 border border-white/5 backdrop-blur-xl rounded-none overflow-hidden select-none">
            {/* Background grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="absolute top-4 left-6 flex items-center gap-2 font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Directed Semantic Graph (DSG) Live Canvas</span>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-500 font-bold">Port 9999 Synced</span>
            </div>

            <div className="absolute top-4 right-6 flex items-center gap-4 font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shadow-[0_0_6px_rgba(245,158,11,0.4)]" style={{ backgroundColor: '#f59e0b' }} />
                    <span>SPECULATIVE</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.4)]" style={{ backgroundColor: '#22c55e' }} />
                    <span>VERIFIED LIVE</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.4)] animate-pulse" style={{ backgroundColor: '#ef4444' }} />
                    <span>SUSPENDED</span>
                </div>
            </div>

            {/* Main Interactive Canvas */}
            <div className="w-full h-full overflow-auto scrollbar-none flex items-center justify-center">
                <svg
                    id="dsg-svg-canvas"
                    className="min-w-[800px] min-h-[400px] w-full h-full"
                    style={{ background: 'transparent' }}
                >
                    <defs>
                        {/* Dynamic linearGradients for parent-child transitions */}
                        {messages.map((child) => {
                            if (!child.parentId) return null;
                            const parent = msgMap.get(child.parentId);
                            if (!parent) return null;

                            const isChildActive = activePathIds.has(child.id);
                            const isParentActive = activePathIds.has(parent.id);
                            const isEdgeActive = isChildActive && isParentActive;

                            const parentColor = getNodeColor(parent, isEdgeActive);
                            const childColor = getNodeColor(child, isEdgeActive);

                            const gradId = `grad-${parent.id}-${child.id}`;

                            return (
                                <linearGradient key={gradId} id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor={parentColor} stopOpacity={isEdgeActive ? 0.6 : 0.15} />
                                    <stop offset="100%" stopColor={childColor} stopOpacity={isEdgeActive ? 0.6 : 0.15} />
                                </linearGradient>
                            );
                        })}

                        <linearGradient id="inactiveLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3f3f46" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#3f3f46" stopOpacity="0.2" />
                        </linearGradient>
                        <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Bezier Connectors */}
                    <g>
                        {messages.map((child) => {
                            if (!child.parentId) return null;
                            const parent = msgMap.get(child.parentId);
                            if (!parent) return null;

                            const pPos = positions.get(parent.id);
                            const cPos = positions.get(child.id);
                            if (!pPos || !cPos) return null;

                            const isEdgeActive = activePathIds.has(child.id) && activePathIds.has(parent.id);

                            // Beautiful S-curve connector
                            const pathD = `M ${pPos.x} ${pPos.y} C ${(pPos.x + cPos.x) / 2} ${pPos.y}, ${(pPos.x + cPos.x) / 2} ${cPos.y}, ${cPos.x} ${cPos.y}`;

                            const childColor = getNodeColor(child, isEdgeActive);

                            return (
                                <g key={`connector-${child.id}`}>
                                    {/* Static base line */}
                                    <path
                                        d={pathD}
                                        fill="none"
                                        stroke={isEdgeActive ? `url(#grad-${parent.id}-${child.id})` : 'url(#inactiveLineGrad)'}
                                        strokeWidth={isEdgeActive ? 2 : 1.5}
                                        className="transition-all duration-300"
                                    />
                                    {/* Traveling animated signal pulse */}
                                    {isEdgeActive && (
                                        <path
                                            d={pathD}
                                            fill="none"
                                            stroke={childColor}
                                            strokeWidth={2}
                                            strokeDasharray="10, 20"
                                            className="opacity-80 animate-[dash_4s_linear_infinite]"
                                            style={{
                                                strokeDashoffset: 100,
                                            }}
                                        />
                                    )}
                                </g>
                            );
                        })}
                    </g>

                    {/* Nodes (Circles) */}
                    <g>
                        {messages.map((msg) => {
                            const pos = positions.get(msg.id);
                            if (!pos) return null;

                            const isActive = activePathIds.has(msg.id);
                            const nodeColor = getNodeColor(msg, isActive);
                            const activeNodeColor = getNodeColor(msg, true);
                            const isHead = thread.activeHeadMessageId === msg.id;
                            const isPaused = msg.status === 'paused' || msg.status === 'interrupted';

                            return (
                                <g
                                    key={`node-${msg.id}`}
                                    transform={`translate(${pos.x}, ${pos.y})`}
                                    className="cursor-pointer"
                                    onClick={() => anchorChatThread(threadId, msg.id)}
                                    onMouseEnter={(e) => handleNodeHover(e, msg)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                >
                                    {/* Highlight Outer Ring */}
                                    {isActive && (
                                        <circle
                                            r={16}
                                            fill="none"
                                            stroke={nodeColor}
                                            strokeWidth={1}
                                            className="animate-[spin_8s_linear_infinite]"
                                            strokeDasharray="4, 4"
                                            opacity={0.6}
                                        />
                                    )}

                                    {/* Inner glowing particle for active head */}
                                    {isHead && (
                                        <circle
                                            r={22}
                                            fill="none"
                                            stroke={activeNodeColor}
                                            strokeWidth={1.5}
                                            opacity={0.8}
                                            filter="url(#nodeGlow)"
                                        />
                                    )}

                                    {/* Core solid circle */}
                                    <circle
                                        r={isHead ? 10 : 8}
                                        fill={nodeColor}
                                        stroke="#09090b"
                                        strokeWidth={2}
                                        filter={isActive ? 'url(#nodeGlow)' : undefined}
                                        className="transition-all duration-300 hover:scale-125"
                                    />

                                    {/* Small paused symbol anchor */}
                                    {isPaused && (
                                        <g transform="translate(0, 0)">
                                            <rect x="-2.5" y="-3.5" width="1.5" height="7" fill="white" />
                                            <rect x="1" y="-3.5" width="1.5" height="7" fill="white" />
                                        </g>
                                    )}

                                    {/* Label display */}
                                    <text
                                        y={isHead ? 34 : 28}
                                        textAnchor="middle"
                                        fill={isActive ? 'white' : 'rgba(161, 161, 170, 0.4)'}
                                        className="font-mono text-[8px] font-bold uppercase tracking-wider select-none pointer-events-none"
                                    >
                                        {msg.sender.substring(0, 10)}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>

                {/* Floating CSS style animation injection */}
                <style jsx global>{`
                    @keyframes dash {
                        to {
                            stroke-dashoffset: -40;
                        }
                    }
                `}</style>
            </div>

            {/* Floating Glassmorphic Tooltip */}
            <AnimatePresence>
                {hoveredNode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute z-30 w-72 p-4 bg-zinc-950/90 border border-white/10 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.8)] font-mono flex flex-col gap-2 rounded-none"
                        style={{
                            left: `${tooltipPos.x}px`,
                            top: `${tooltipPos.y}px`,
                            pointerEvents: 'none',
                        }}
                    >
                        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: getNodeColor(hoveredNode, true) }} />
                                {hoveredNode.sender}
                            </span>
                            <span className={`text-[7px] font-black border px-1.5 py-0.5 uppercase ${
                                hoveredNode.status === 'paused' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                                hoveredNode.status === 'generating' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 animate-pulse' :
                                'text-zinc-500 border-white/5'
                            }`}>
                                {hoveredNode.status || 'completed'}
                            </span>
                        </div>

                        <p className="text-[9px] text-zinc-300 leading-relaxed font-light line-clamp-3">
                            "{hoveredNode.content}"
                        </p>

                        {/* Snapshot details if node is paused */}
                        {hoveredNode.status === 'paused' && hoveredNode.executionSnapshot && (
                            <div className="border-t border-white/5 pt-2 mt-1.5 flex flex-col gap-1.5">
                                <div className="flex items-center gap-1 text-[7px] text-red-400 uppercase tracking-widest font-bold">
                                    <ShieldAlert className="w-3 h-3 text-red-500" />
                                    <span>Suspended State Snapshot</span>
                                </div>
                                <div className="space-y-1 text-[7px] text-zinc-400">
                                    <div className="flex justify-between">
                                        <span>Suspension prefix:</span>
                                        <span className="text-white font-bold">{hoveredNode.executionSnapshot.tokenPrefix || 'N/A'}</span>
                                    </div>
                                    {hoveredNode.executionSnapshot.activeFilePointers && (
                                        <div className="flex flex-col gap-0.5">
                                            <span>Active pointers:</span>
                                            <div className="flex flex-col gap-0.5 pl-2 text-white/80">
                                                {hoveredNode.executionSnapshot.activeFilePointers.map((p, idx) => (
                                                    <span key={idx} className="truncate max-w-[240px]">↳ {p.split('/').pop()}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {hoveredNode.executionSnapshot.queuedToolCalls && (
                                        <div className="flex justify-between">
                                            <span>Queued tools:</span>
                                            <span className="text-yellow-500 font-bold">{hoveredNode.executionSnapshot.queuedToolCalls[0]?.toolName || '0'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="text-[7px] text-zinc-600 uppercase tracking-wider flex justify-between border-t border-white/5 pt-1.5 mt-1">
                            <span>Anchor Callback:</span>
                            <span className="text-amber-500 font-bold flex items-center gap-0.5">
                                <Anchor className="w-2.5 h-2.5" /> CLICK NODE TO TRAVERSE
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
