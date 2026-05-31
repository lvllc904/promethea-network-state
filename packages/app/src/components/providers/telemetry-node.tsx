'use client';

import React, { useEffect } from 'react';

export const TelemetryNode = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const sendTelemetry = (type: string, data: any) => {
            fetch('/api/telemetry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, data, url: window.location.href, userAgent: navigator.userAgent })
            }).catch(e => console.error("Telemetry failed to send:", e));
        };

        const handleWindowError = (event: ErrorEvent) => {
            sendTelemetry('WINDOW_ERROR', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
            // Let the user know Promethea caught it
            showSubtleToast("⚠️ System Fault Detected. Promethea is analyzing.");
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            sendTelemetry('UNHANDLED_REJECTION', {
                reason: event.reason?.message || String(event.reason),
                stack: event.reason?.stack
            });
            showSubtleToast("⚠️ Network Rejection. Promethea is analyzing.");
        };

        window.addEventListener('error', handleWindowError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleWindowError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    // Simple subtle toast using DOM manipulation to avoid heavy React state dependencies here
    const showSubtleToast = (message: string) => {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-950/80 border border-red-500/50 text-red-200 px-4 py-2 rounded text-[10px] font-mono tracking-widest z-[10000] shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse transition-opacity duration-500';
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 500);
        }, 4000);
    };

    return <>{children}</>;
};
