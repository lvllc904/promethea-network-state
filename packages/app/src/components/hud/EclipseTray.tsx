'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHUD } from '@/lib/hud-store';
import { X, Send, Loader2, BrainCircuit } from 'lucide-react';
import { askPrometheaAction } from '@/app/actions';
import { TacticalRibbon } from './TacticalRibbon';
import { RightFocusTray } from './RightFocusTray';

import { Rnd } from 'react-rnd';

export const EclipseTray: React.FC = () => {
    const { activePillar, activeFocusPanel, activatePillar, activateFocusPanel } = useHUD();
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // The tray remains "open" (expanded) when there's an active focus panel.
    const isExpanded = !!activeFocusPanel || !!activePillar;

    let pillarColorClass = 'rim-highlight';
    switch(activePillar) {
        case 'ATLAS': pillarColorClass = 'rim-highlight-governance'; break; // Cyan highlight for Atlas
        case 'ECONOMICS': pillarColorClass = 'rim-highlight-economics'; break;
        case 'GOVERNANCE': pillarColorClass = 'rim-highlight-governance'; break;
        case 'ASGI': pillarColorClass = 'rim-highlight-governance'; break;
        case 'NARRATIVE': pillarColorClass = 'rim-highlight-narrative'; break;
        case 'DIPLOMATIC': pillarColorClass = 'rim-highlight-diplomatic'; break;
        case 'PULSE': pillarColorClass = 'rim-highlight-diplomatic'; break;
    }

    if (!isMounted) return null;

    const defaultWidth = isExpanded ? 640 : 64; // 64px = w-16
    const defaultHeight = window.innerHeight - 88; // top-12 (48px) + bottom-10 (40px)

    return (
        <Rnd
            default={{
                x: 16, // left-4
                y: 48, // top-12
                width: defaultWidth,
                height: defaultHeight,
            }}
            minWidth={isExpanded ? 400 : 64}
            minHeight={400}
            bounds="window"
            dragHandleClassName="drag-handle-ribbon"
            enableResizing={{
                top: false, right: isExpanded, bottom: false, left: false,
                topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
            }}
            className={`z-40 glass-panel rounded-xl flex overflow-hidden transition-colors ${pillarColorClass}`}
            style={{ position: 'fixed' }}
        >
            {/* The persistent left column: the Tactical Ribbon */}
            <div className="w-16 flex flex-col justify-center items-center h-full border-r border-cyan-400/20 bg-black/40 drag-handle-ribbon cursor-move select-none">
                <TacticalRibbon />
            </div>

            {/* The expanding pillar content */}
            <div className={`flex-1 flex flex-col min-w-0 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {isExpanded && (
                    <RightFocusTray />
                )}
            </div>
        </Rnd>
    );
};
