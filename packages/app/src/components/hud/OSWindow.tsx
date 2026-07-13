'use client';

import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useHUD } from '@/lib/hud-store';
import { X, Minus, Maximize, ExternalLink, Minimize } from 'lucide-react';

interface OSWindowProps {
    id: string;
    type: string;
    title: string;
    children: React.ReactNode;
}

export const OSWindow = ({ id, type, title, children }: OSWindowProps) => {
    const { osWindows, updateOSWindow, closeOSWindow, focusOSWindow, popOutOSWindow } = useHUD();
    const winData = osWindows.find(w => w.id === id);
    
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Prevent rendering until hydration is complete to avoid mismatch, or just return null if no window data
    if (!winData || winData.isMinimized || winData.isPoppedOut) return null;

    const handleDragStop = (e: any, d: any) => {
        updateOSWindow(id, { x: d.x, y: d.y });
    };

    const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
        updateOSWindow(id, {
            width: ref.style.width,
            height: ref.style.height,
            x: position.x,
            y: position.y
        });
    };

    const toggleMaximize = () => {
        updateOSWindow(id, { isMaximized: !winData.isMaximized });
    };

    const minimize = () => {
        updateOSWindow(id, { isMinimized: true });
    };

    const close = () => {
        closeOSWindow(id);
    };

    const popOut = () => {
        popOutOSWindow(id);
    };

    let pillarColorClass = 'rim-highlight-focus';
    switch(type) {
        case 'ATLAS': pillarColorClass = 'rim-highlight-governance'; break;
        case 'ECONOMICS': pillarColorClass = 'rim-highlight-economics'; break;
        case 'GOVERNANCE': pillarColorClass = 'rim-highlight-governance'; break;
        case 'NARRATIVE': pillarColorClass = 'rim-highlight-narrative'; break;
        case 'DIPLOMATIC': pillarColorClass = 'rim-highlight-diplomatic'; break;
        case 'PULSE': pillarColorClass = 'rim-highlight-diplomatic'; break;
    }

    if (isMobile || winData.isMaximized) {
        return (
            <div 
                className={`fixed inset-0 z-[9999] glass-panel flex flex-col overflow-hidden ${pillarColorClass} shadow-[0_0_50px_rgba(0,0,0,0.8)]`}
                onMouseDown={() => focusOSWindow(id)}
            >
                {/* Title Bar */}
                <div className="p-2 border-b border-amber-400/20 flex justify-between items-center bg-amber-950/80 cursor-default select-none">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 ml-2">
                        {title}
                    </h2>
                    <div className="flex items-center gap-2 mr-1">
                        {!isMobile && (
                            <button 
                                onClick={toggleMaximize} 
                                onMouseDown={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-white transition-colors" 
                                title="Restore Down"
                            >
                                <Minimize size={12} />
                            </button>
                        )}
                        <button 
                            onClick={close} 
                            onMouseDown={(e) => e.stopPropagation()}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
                {/* Content */}
                <div className="flex-1 overflow-hidden relative bg-black/40">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <Rnd
            size={{ width: winData.width, height: winData.height }}
            position={{ x: winData.x, y: winData.y }}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            minWidth={300}
            minHeight={200}
            bounds="window"
            dragHandleClassName="os-titlebar"
            style={{ zIndex: winData.zIndex, position: 'absolute' }}
            onMouseDown={() => focusOSWindow(id)}
            className={`glass-panel rounded-xl flex flex-col overflow-hidden ${pillarColorClass} shadow-[0_0_30px_rgba(0,0,0,0.6)]`}
        >
            {/* Title Bar */}
            <div className="os-titlebar p-2 border-b border-amber-400/20 flex justify-between items-center bg-amber-950/80 cursor-move select-none">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 ml-2 pointer-events-none">
                    {title}
                </h2>
                <div className="flex items-center gap-3 mr-1">
                    <button 
                        onClick={popOut} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-amber-400 transition-colors" 
                        title="Pop Out"
                    >
                        <ExternalLink size={12} />
                    </button>
                    <button 
                        onClick={minimize} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-white transition-colors" 
                        title="Minimize"
                    >
                        <Minus size={12} />
                    </button>
                    <button 
                        onClick={toggleMaximize} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-white transition-colors" 
                        title="Maximize"
                    >
                        <Maximize size={12} />
                    </button>
                    <button 
                        onClick={close} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-red-400 transition-colors" 
                        title="Close"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-hidden relative bg-black/40">
                {children}
            </div>
        </Rnd>
    );
};
