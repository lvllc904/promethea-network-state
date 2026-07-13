'use client';

import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useHUD } from '@/lib/hud-store';
import dynamic from 'next/dynamic';
import { X, Minus, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const RightFocusTray = dynamic(
    () => import('./RightFocusTray').then(m => m.RightFocusTray),
    { ssr: false }
);

export const ChatTray: React.FC = () => {
    const { activePillar, activeFocusPanel, activateFocusPanel, setHUDState } = useHUD();
    const [isMounted, setIsMounted] = useState(false);
    
    // The chat tray appears when a pillar other than ATLAS is active, mirroring the left tray
    const isExpanded = !!activeFocusPanel || !!activePillar;

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [storedWidth, setStoredWidth] = useState(360);
    const [rightOffset, setRightOffset] = useState(16);
    const [preCollapseRightOffset, setPreCollapseRightOffset] = useState(16);
    const [isDraggingOrResizing, setIsDraggingOrResizing] = useState(false);

    const [size, setSize] = useState({ width: 0, height: 800 });
    const [position, setPosition] = useState({ x: 1000, y: 48 });

    const isExpandedRef = React.useRef(isExpanded);
    const isCollapsedRef = React.useRef(isCollapsed);
    const rightOffsetRef = React.useRef(16);
    const sizeRef = React.useRef(size);
    const storedWidthRef = React.useRef(storedWidth);

    useEffect(() => { isExpandedRef.current = isExpanded; }, [isExpanded]);
    useEffect(() => { isCollapsedRef.current = isCollapsed; }, [isCollapsed]);
    useEffect(() => { sizeRef.current = size; }, [size]);
    useEffect(() => { storedWidthRef.current = storedWidth; }, [storedWidth]);

    const updateRightOffset = (val: number) => {
        setRightOffset(val);
        rightOffsetRef.current = val;
    };

    const getLeftTrayRightEdge = (expanded: boolean) => {
        if (typeof window === 'undefined') return 120;
        if (!expanded) return 16;
        const leftCollapsed = localStorage.getItem('promethea-left-tray-collapsed') === 'true';
        if (leftCollapsed) return 104;
        const leftWidth = Number(localStorage.getItem('promethea-left-tray-width') || '440');
        const leftX = Number(localStorage.getItem('promethea-left-tray-x') || '120');
        return leftX + leftWidth;
    };

    useEffect(() => {
        setIsMounted(true);
        
        const localCollapsed = localStorage.getItem('promethea-right-tray-collapsed') === 'true';
        const localWidth = Number(localStorage.getItem('promethea-right-tray-width') || '360');
        const defaultX = window.innerWidth - localWidth - 16;
        const localX = Number(localStorage.getItem('promethea-right-tray-x') || String(defaultX));
        const localY = Number(localStorage.getItem('promethea-right-tray-y') || '48');
        const localPreCollapseX = Number(localStorage.getItem('promethea-right-precollapse-x') || String(defaultX));

        setIsCollapsed(localCollapsed);
        setStoredWidth(localWidth);

        const leftEdge = getLeftTrayRightEdge(isExpanded) + 16;
        const clampedLocalX = Math.max(leftEdge, Math.min(localX, window.innerWidth - localWidth - 16));
        const computedRightOffset = window.innerWidth - clampedLocalX - localWidth;
        
        const clampedPreCollapseX = Math.max(leftEdge, Math.min(localPreCollapseX, window.innerWidth - localWidth - 16));
        const computedPreCollapseRightOffset = window.innerWidth - clampedPreCollapseX - localWidth;

        updateRightOffset(computedRightOffset);
        setPreCollapseRightOffset(computedPreCollapseRightOffset);

        const currentWidth = isExpanded ? (localCollapsed ? 0 : localWidth) : 0;
        const currentX = isExpanded ? (localCollapsed ? window.innerWidth - 20 : clampedLocalX) : window.innerWidth - 16;

        setSize({ width: currentWidth, height: window.innerHeight - 88 });
        setPosition({ x: currentX, y: localY });

        const handleResize = () => {
            const h = window.innerHeight - 88;
            setSize(s => ({ ...s, height: h }));
            
            if (!isExpandedRef.current) {
                setPosition(p => ({ ...p, x: window.innerWidth - 16 }));
                return;
            }

            if (isCollapsedRef.current) {
                setPosition(p => ({ ...p, x: window.innerWidth - 20 }));
                return;
            }

            const w = sizeRef.current.width || storedWidthRef.current || 360;
            const leftBoundary = getLeftTrayRightEdge(isExpandedRef.current) + 16;
            const targetX = window.innerWidth - w - rightOffsetRef.current;
            const clampedX = Math.max(leftBoundary, targetX);
            
            setPosition(p => ({ ...p, x: clampedX }));
            localStorage.setItem('promethea-right-tray-x', String(clampedX));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        const localCollapsed = localStorage.getItem('promethea-right-tray-collapsed') === 'true';
        const localWidth = Number(localStorage.getItem('promethea-right-tray-width') || '360');
        const defaultX = window.innerWidth - localWidth - 16;
        const localX = Number(localStorage.getItem('promethea-right-tray-x') || String(defaultX));

        const leftEdge = getLeftTrayRightEdge(isExpanded) + 16;
        const clampedLocalX = Math.max(leftEdge, Math.min(localX, window.innerWidth - localWidth - 16));

        const currentWidth = isExpanded ? (localCollapsed ? 0 : localWidth) : 0;
        const currentX = isExpanded ? (localCollapsed ? window.innerWidth - 20 : clampedLocalX) : window.innerWidth - 16;

        if (isExpanded && !localCollapsed) {
            const computedRightOffset = window.innerWidth - clampedLocalX - localWidth;
            updateRightOffset(computedRightOffset);
        }

        setSize(s => ({ ...s, width: currentWidth }));
        setPosition(p => ({ ...p, x: currentX }));
    }, [isExpanded, isMounted]);

    const handleToggleCollapse = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (isCollapsed) {
            setIsCollapsed(false);
            localStorage.setItem('promethea-right-tray-collapsed', 'false');
            
            const leftEdge = getLeftTrayRightEdge(isExpanded) + 16;
            const targetX = window.innerWidth - storedWidth - preCollapseRightOffset;
            const clampedX = Math.max(leftEdge, targetX);

            setSize(s => ({ ...s, width: storedWidth }));
            setPosition(p => ({ ...p, x: clampedX }));
            localStorage.setItem('promethea-right-tray-x', String(clampedX));
        } else {
            setStoredWidth(size.width);
            const leftEdge = getLeftTrayRightEdge(isExpanded) + 16;
            const clampedX = Math.max(leftEdge, position.x);
            const offset = window.innerWidth - clampedX - size.width;
            
            setPreCollapseRightOffset(offset);
            localStorage.setItem('promethea-right-tray-width', String(size.width));
            localStorage.setItem('promethea-right-precollapse-x', String(clampedX));

            setIsCollapsed(true);
            localStorage.setItem('promethea-right-tray-collapsed', 'true');

            setSize(s => ({ ...s, width: 0 }));
            setPosition(p => ({ ...p, x: window.innerWidth - 20 }));
        }
    };

    let pillarColorClass = 'rim-highlight';
    switch(activePillar) {
        case 'ATLAS': pillarColorClass = 'rim-highlight-governance'; break;
        case 'ECONOMICS': pillarColorClass = 'rim-highlight-economics'; break;
        case 'GOVERNANCE': pillarColorClass = 'rim-highlight-governance'; break;
        case 'ASGI': pillarColorClass = 'rim-highlight-governance'; break;
        case 'NARRATIVE': pillarColorClass = 'rim-highlight-narrative'; break;
        case 'DIPLOMATIC': pillarColorClass = 'rim-highlight-diplomatic'; break;
        case 'PULSE': pillarColorClass = 'rim-highlight-diplomatic'; break;
        case 'SETTINGS': pillarColorClass = 'rim-highlight'; break;
        case 'CHAT': pillarColorClass = 'rim-highlight-governance'; break;
    }

    if (!isMounted || !isExpanded) return null;

    return (
        <Rnd
            size={size}
            position={position}
            disableDragging={isCollapsed || !isExpanded}
            onDragStart={() => setIsDraggingOrResizing(true)}
            onDrag={(e, d) => {
                const leftEdge = getLeftTrayRightEdge(isExpanded) + 16;
                const clampedX = Math.max(leftEdge, d.x);
                setPosition({ x: clampedX, y: d.y });
            }}
            onDragStop={(e, d) => {
                setIsDraggingOrResizing(false);
                const leftEdge = getLeftTrayRightEdge(isExpanded) + 16;
                const clampedX = Math.max(leftEdge, d.x);
                setPosition({ x: clampedX, y: d.y });
                if (!isCollapsed && isExpanded) {
                    const offset = window.innerWidth - clampedX - size.width;
                    updateRightOffset(offset);
                    localStorage.setItem('promethea-right-tray-x', String(clampedX));
                    localStorage.setItem('promethea-right-tray-y', String(d.y));
                }
            }}
            onResizeStart={() => setIsDraggingOrResizing(true)}
            onResize={(e, direction, ref, delta, pos) => {
                const w = parseInt(ref.style.width);
                const h = parseInt(ref.style.height);
                const leftEdge = getLeftTrayRightEdge(isExpanded) + 16;
                const clampedX = Math.max(leftEdge, pos.x);
                setSize({ width: w, height: h });
                setPosition({ x: clampedX, y: pos.y });
            }}
            onResizeStop={(e, direction, ref, delta, pos) => {
                setIsDraggingOrResizing(false);
                const w = parseInt(ref.style.width);
                const h = parseInt(ref.style.height);
                const leftEdge = getLeftTrayRightEdge(isExpanded) + 16;
                const clampedX = Math.max(leftEdge, pos.x);
                setSize({ width: w, height: h });
                setPosition({ x: clampedX, y: pos.y });
                if (!isCollapsed && isExpanded) {
                    const offset = window.innerWidth - clampedX - w;
                    updateRightOffset(offset);
                    localStorage.setItem('promethea-right-tray-width', String(w));
                    localStorage.setItem('promethea-right-tray-x', String(clampedX));
                    localStorage.setItem('promethea-right-tray-y', String(pos.y));
                }
            }}
            minWidth={isExpanded && !isCollapsed ? 300 : 0}
            minHeight={400}
            bounds="window"
            dragHandleClassName="drag-handle-chat"
            enableResizing={{
                top: false, right: false, bottom: false, 
                left: isExpanded && !isCollapsed,
                topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
            }}
            className={`z-[51] ${isDraggingOrResizing ? '' : 'transition-all duration-300 ease-in-out'} overflow-visible border-none bg-transparent shadow-none pointer-events-none`}
            style={{ position: 'fixed', zIndex: 51, pointerEvents: 'none' }}
        >
            <div className="relative w-full h-full overflow-visible pointer-events-none">
                {/* Visual Card Wrapper */}
                <div 
                    className={`w-full h-full flex flex-col overflow-hidden pointer-events-auto rounded-xl border transition-all duration-300 ease-in-out ${
                        isExpanded && !isCollapsed
                            ? `glass-panel ${pillarColorClass} opacity-100` 
                            : 'opacity-0 scale-95 pointer-events-none border-transparent bg-transparent shadow-none'
                    }`}
                    style={{
                        width: isExpanded && !isCollapsed ? '100%' : '0px',
                    }}
                >
                    <div className="flex-1 flex flex-col h-full bg-black/40 pointer-events-auto">
                        {/* Header bar acting as drag handle */}
                        <div className="drag-handle-chat cursor-move flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-amber-500/20 select-none shrink-0">
                            <div className="flex items-center gap-2">
                                {activeFocusPanel && activeFocusPanel !== activePillar ? (
                                    <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase select-none">
                                        <button
                                            onClick={() => activateFocusPanel(null)}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1 text-amber-400 hover:text-white transition-colors cursor-pointer font-black"
                                            title={`Back to ${activePillar}`}
                                        >
                                            <ArrowLeft size={11} strokeWidth={2.5} /> {activePillar}
                                        </button>
                                        <span className="text-zinc-600">/</span>
                                        <span className="text-zinc-300 font-bold">
                                            {activeFocusPanel === 'EXCHANGE' ? 'RWA EXCHANGE' :
                                             activeFocusPanel === 'SQL_EXPLORER' ? 'SQL EXPLORER' :
                                             activeFocusPanel === 'CLI_GUIDE' ? 'CLI GUIDE' :
                                             activeFocusPanel === 'SWEAT_CLAIM' ? 'SWEAT CLAIMS' :
                                             activeFocusPanel === 'FINANCIALS' ? 'FINANCIALS' :
                                             activeFocusPanel === 'PROMETHEA_ASGI' ? 'ASGI MONITORS' :
                                             activeFocusPanel === 'WALLET' ? 'SOVEREIGN WALLET' :
                                             activeFocusPanel === 'OMNI_SCANNER' ? 'OMNI-SCANNER' :
                                             activeFocusPanel === 'ASSET_CANVAS' ? 'ASSET CANVAS' :
                                             activeFocusPanel === 'CONFERENCE' ? 'LIVE CONFERENCE' :
                                             activeFocusPanel === 'MINER_NODE' ? 'MINER NODE' :
                                             activeFocusPanel === 'MARKETPLACE' ? 'MARKETPLACE' :
                                             activeFocusPanel}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-[9px] font-mono font-bold text-amber-400/80 uppercase tracking-widest">
                                        {activePillar || 'TELEMETRY'}
                                    </span>
                                )}
                            </div>
                            
                            {/* Draggable center pill */}
                            <div className="w-10 h-1 rounded-full bg-amber-500/25 hover:bg-amber-500/50 transition-colors" />

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setHUDState({ activePillar: null as any, activeFocusPanel: null })}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    title="Minimize Tray"
                                    className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-white transition-all cursor-pointer"
                                >
                                    <Minus size={12} />
                                </button>
                                <button 
                                    onClick={() => setHUDState({ activePillar: null as any, activeFocusPanel: null })}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    title="Close Tray"
                                    className="p-1 hover:bg-red-950/30 rounded text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                            <RightFocusTray />
                        </div>
                    </div>
                </div>

                {/* Symmetrical Tactile Grab-and-Toggle Slide Handle Tab */}
                {isExpanded && (
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={handleToggleCollapse}
                        className="absolute right-full top-1/2 -translate-y-1/2 z-[52] w-6 h-20 bg-zinc-950/95 hover:bg-zinc-900 border border-amber-500/30 hover:border-amber-400/70 text-amber-500 rounded-l-lg flex flex-col items-center justify-center cursor-pointer pointer-events-auto transition-all shadow-[-4px_0_15px_rgba(0,0,0,0.5)] gap-1 group"
                        title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
                    >
                        {isCollapsed ? <ChevronLeft size={14} className="group-hover:scale-110 transition-transform" /> : <ChevronRight size={14} className="group-hover:scale-110 transition-transform" />}
                        {/* Tactile Grab Texture */}
                        <div className="flex flex-col gap-0.5 justify-center items-center opacity-40 group-hover:opacity-75 transition-opacity">
                            <div className="w-1.5 h-0.5 bg-amber-500 rounded-full"></div>
                            <div className="w-1.5 h-0.5 bg-amber-500 rounded-full"></div>
                            <div className="w-1.5 h-0.5 bg-amber-500 rounded-full"></div>
                        </div>
                    </button>
                )}
            </div>
        </Rnd>
    );
};
