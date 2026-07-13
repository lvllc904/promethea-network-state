'use client';

import React, { useEffect, useState } from 'react';
import { useMesh } from '@/components/providers/mesh-provider';
import { useHUD } from '@/lib/hud-store';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

export function AdaptiveThemeController() {
    const { doc, themeState } = useMesh();
    const { activateFocusPanel } = useHUD();
    const [bandwidth, setBandwidth] = useState<number>(1500); // Default 1.5 Mbps
    const [latency, setLatency] = useState<number>(45); // Default 45ms
    const isAdaptive = themeState?.isAdaptive ?? false;
    const theme = themeState?.theme;
    const [meshStatus, setMeshStatus] = useState<string>('ONLINE');

    const toggleAdaptive = () => {
        if (!doc) return;
        const ymap = doc.getMap('ui-theme');
        ymap.set('isAdaptive', !isAdaptive);
    };

    // 1. Ingest bandwidth telemetry from mesh-daemon
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const checkMeshDaemonTelemetry = async () => {
            try {
                const startTime = Date.now();
                const res = await fetch('http://localhost:4005/api/mesh/status', {
                    cache: 'no-store',
                    signal: AbortSignal.timeout(2000)
                });
                const rtt = Date.now() - startTime;
                
                if (res.ok) {
                    const data = await res.json();
                    setMeshStatus('ONLINE');
                    
                    // Hardware IO Speed or network metrics used to derive synthetic bandwidth
                    const speed = data.hardwareProfile?.storage?.writeSpeedMbS || 100;
                    // Scale write speed to synthetic bandwidth
                    const derivedBandwidth = Math.round(speed * 15); 
                    setBandwidth(derivedBandwidth);
                    setLatency(rtt);
                }
            } catch (e) {
                // Standalone / offline fallback
                setMeshStatus('OFFLINE');
                setBandwidth(2); // Deep offgrid mode (< 5 Kbps)
                setLatency(600); // 600ms latency
            }
        };

        checkMeshDaemonTelemetry();
        interval = setInterval(checkMeshDaemonTelemetry, 8000);

        return () => clearInterval(interval);
    }, []);

    // 2. Dynamic Theme Routing based on Telemetry
    useEffect(() => {
        if (!isAdaptive || !doc) return;

        const ymap = doc.getMap('ui-theme');
        let targetTheme = 'dark'; // High fidelity

        if (bandwidth < 5) {
            targetTheme = 'theme-phosphor'; // Phosphor terminal
        } else if (bandwidth < 100) {
            targetTheme = 'theme-16bit'; // 16-bit arcade
        } else {
            targetTheme = 'dark'; // Glassmorphic Citadel
        }

        // Apply if changed
        if (theme !== targetTheme) {
            if (ymap.get('theme') !== targetTheme) {
                ymap.set('theme', targetTheme);
            }
            
            if (targetTheme === 'theme-phosphor') {
                activateFocusPanel('PHOSPHOR');
            } else if (targetTheme === 'theme-16bit') {
                activateFocusPanel('16BIT');
            } else {
                activateFocusPanel(null);
            }
            console.log(`[Adaptive Theme] Telemetry shifted UI Substrate. Bandwidth: ${bandwidth} Kbps | Selected: ${targetTheme}`);
        }
    }, [bandwidth, isAdaptive, doc, theme, activateFocusPanel]);

    return (
        <div className="flex items-center gap-3 px-3 py-1.5 border border-white/10 bg-black/60 backdrop-blur-md rounded-none text-[9px] font-mono tracking-widest uppercase">
            <div className="flex items-center gap-1.5">
                {meshStatus === 'ONLINE' ? (
                    <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                ) : (
                    <WifiOff className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                )}
                <span className="text-zinc-400">Mesh:</span>
                <span className={meshStatus === 'ONLINE' ? 'text-emerald-400' : 'text-red-400'}>
                    {meshStatus}
                </span>
            </div>

            <div className="w-[1px] h-3 bg-white/10" />

            <div className="flex items-center gap-1.5">
                <span className="text-zinc-400">RTT:</span>
                <span className="text-amber-400 font-bold">{latency}ms</span>
            </div>

            <div className="w-[1px] h-3 bg-white/10" />

            <div className="flex items-center gap-1.5">
                <span className="text-zinc-400">BW:</span>
                <span className="text-blue-400 font-bold">
                    {bandwidth >= 1000 ? `${(bandwidth / 1000).toFixed(1)}M` : `${bandwidth}K`}
                </span>
            </div>

            <div className="w-[1px] h-3 bg-white/10" />

            <button
                onClick={toggleAdaptive}
                className={`flex items-center gap-1 px-1.5 py-0.5 border ${
                    isAdaptive 
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                        : 'border-white/10 hover:border-white/20 text-zinc-500'
                } transition-all duration-300`}
            >
                <span>Adaptive:</span>
                <span className="font-bold">{isAdaptive ? 'ON' : 'OFF'}</span>
            </button>
        </div>
    );
}
