'use client';

import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useHUD } from '@/lib/hud-store';
import { ContextChat } from './ContextChat';

export const ChatTray: React.FC = () => {
    const { activePillar, activeFocusPanel } = useHUD();
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // The chat tray appears when a pillar is active, mirroring the left tray
    const isExpanded = !!activeFocusPanel || !!activePillar;

    if (!isMounted || !isExpanded) return null;

    const defaultWidth = 400; 
    const defaultHeight = window.innerHeight - 88; // top-12 (48px) + bottom-10 (40px)
    const defaultX = window.innerWidth - defaultWidth - 16; // Right-aligned with 16px padding

    let pillarColorClass = 'rim-highlight';
    switch(activePillar) {
        case 'ATLAS': pillarColorClass = 'rim-highlight-governance'; break;
        case 'ECONOMICS': pillarColorClass = 'rim-highlight-economics'; break;
        case 'GOVERNANCE': pillarColorClass = 'rim-highlight-governance'; break;
        case 'ASGI': pillarColorClass = 'rim-highlight-governance'; break;
        case 'NARRATIVE': pillarColorClass = 'rim-highlight-narrative'; break;
        case 'DIPLOMATIC': pillarColorClass = 'rim-highlight-diplomatic'; break;
        case 'PULSE': pillarColorClass = 'rim-highlight-diplomatic'; break;
    }

    return (
        <Rnd
            default={{
                x: defaultX,
                y: 48,
                width: defaultWidth,
                height: defaultHeight,
            }}
            minWidth={300}
            minHeight={400}
            bounds="window"
            dragHandleClassName="drag-handle-chat"
            enableResizing={{
                top: false, right: false, bottom: false, left: true,
                topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
            }}
            className={`z-40 glass-panel rounded-xl flex overflow-hidden transition-colors ${pillarColorClass}`}
            style={{ position: 'fixed' }}
        >
            <div className="flex-1 flex flex-col h-full bg-black/40">
                <div className="drag-handle-chat cursor-move h-4 w-full bg-cyan-900/20 hover:bg-cyan-900/40 transition-colors flex items-center justify-center border-b border-cyan-500/20">
                    <div className="w-12 h-1 rounded-full bg-cyan-500/50" />
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <ContextChat activePillar={activePillar || 'SYSTEM'} />
                </div>
            </div>
        </Rnd>
    );
};
