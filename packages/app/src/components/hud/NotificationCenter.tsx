'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useHUD } from '@/lib/hud-store';

export type Notification = {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'update';
    timestamp: number;
    read: boolean;
};

// Global event emitter for notifications
export const triggerNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const event = new CustomEvent('tpns-notification', { detail: notif });
    window.dispatchEvent(event);
};

export const NotificationCenter = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { reduceAnimations } = useHUD();

    useEffect(() => {
        const handleNewNotification = (e: Event) => {
            const customEvent = e as CustomEvent<Omit<Notification, 'id' | 'timestamp' | 'read'>>;
            const newNotif: Notification = {
                ...customEvent.detail,
                id: Math.random().toString(36).substring(7),
                timestamp: Date.now(),
                read: false,
            };
            setNotifications(prev => [newNotif, ...prev]);
            
            // Auto-show center briefly if it's an update
            if (newNotif.type === 'update') {
                setIsOpen(true);
            }
        };

        window.addEventListener('tpns-notification', handleNewNotification);
        return () => window.removeEventListener('tpns-notification', handleNewNotification);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <>
            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed top-4 right-4 z-[9000] p-2 rounded-full backdrop-blur border transition-all ${
                    unreadCount > 0 
                        ? 'bg-amber-900/40 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse' 
                        : 'bg-black/40 border-white/10 text-zinc-500 hover:text-white'
                }`}
            >
                <div className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full text-[8px] flex items-center justify-center text-black font-bold">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </button>

            {/* Notification Drawer */}
            {isOpen && (
                <div className={`fixed top-16 right-4 w-80 max-h-[70vh] z-[9000] glass-panel rounded-xl flex flex-col overflow-hidden shadow-2xl border-amber-500/20 ${reduceAnimations ? '' : 'slide-hud-right'}`}>
                    <div className="p-3 border-b border-white/10 bg-amber-950/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">TPNS Notifications</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[8px]">{notifications.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={markAllRead} className="text-[9px] text-zinc-400 hover:text-white uppercase">Mark Read</button>
                            <button onClick={clearAll} className="text-[9px] text-zinc-400 hover:text-white uppercase">Clear</button>
                            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                                No active notifications.
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`p-3 rounded-lg border ${
                                    notif.read ? 'bg-black/40 border-white/5 opacity-70' : 
                                    notif.type === 'update' ? 'bg-amber-950/30 border-amber-500/30' :
                                    notif.type === 'warning' ? 'bg-amber-950/30 border-amber-500/30' :
                                    notif.type === 'success' ? 'bg-amber-950/30 border-amber-500/30' :
                                    'bg-white/5 border-white/10'
                                }`}>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {notif.type === 'update' && <Info className="w-4 h-4 text-amber-400" />}
                                            {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                                            {notif.type === 'success' && <CheckCircle className="w-4 h-4 text-amber-400" />}
                                            {notif.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`text-xs font-bold ${notif.read ? 'text-zinc-400' : 'text-white'}`}>{notif.title}</h4>
                                            <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed font-mono">{notif.message}</p>
                                            <span className="text-[8px] text-zinc-600 mt-2 block uppercase tracking-wider">
                                                {new Date(notif.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
