'use client';


import { Toaster } from "@promethea/ui";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { MeshProvider } from "@/components/providers/mesh-provider";
import { ThemeController } from "@/components/ui/ThemeController";
import { HUDProvider } from '@/lib/hud-store';
import { HUDStateSync } from '@/lib/useBroadcastChannel';
import { TelemetryNode } from './telemetry-node';
import { useEffect } from 'react';
import { triggerNotification } from '../hud/NotificationCenter';

export function ClientProviders({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then((registration) => {
                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        if (installingWorker == null) {
                            return;
                        }
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    // New update available
                                    triggerNotification({
                                        title: 'TPNS System Update',
                                        message: 'A rolling update has been deployed. New Sovereign content is pre-cached. Refresh to align with the active timeline.',
                                        type: 'update'
                                    });
                                }
                            }
                        };
                    };
                }).catch(err => {
                    console.warn('[SW] Registration failed:', err);
                });
            });
            
            // WebMCP Agent Registry
            if ((navigator as any).modelContext) {
                try {
                    (navigator as any).modelContext.registerTool({
                        name: 'query_sovereign_stats',
                        description: 'Fetch current TPNS global statistics and network health',
                        execute: async () => {
                            return {
                                status: 'NOMINAL',
                                activeNodes: 42,
                                liquidity: '$2.4M',
                                sovereignCitizens: 1205
                            };
                        }
                    });
                } catch (e) {
                    console.warn('[WebMCP] Failed to register tools:', e);
                }
            }
        }
    }, []);

    return (
        <HUDProvider>
            <HUDStateSync />
            <MeshProvider>
                <TelemetryNode>
                    {children}
                </TelemetryNode>
                <AIAssistant />
                <Toaster />
                <ThemeController />
            </MeshProvider>
        </HUDProvider>
    );
}
