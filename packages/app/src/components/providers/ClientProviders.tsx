'use client';


import { Toaster } from "@promethea/ui";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { MeshProvider } from "@/components/providers/mesh-provider";
import { ThemeController } from "@/components/ui/ThemeController";
import { HUDProvider } from '@/lib/hud-store';
import { HUDStateSync } from '@/lib/useBroadcastChannel';
import { TelemetryNode } from './telemetry-node';
import { useEffect, useState } from 'react';
import { triggerNotification } from '../hud/NotificationCenter';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';
import { BitcoinWalletConnectors } from '@dynamic-labs/bitcoin';

export function ClientProviders({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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
            
            // WebMCP Agent Registry (Migrated to Edge Discovery & CustomEvents)
            // Tools are now declared statically in /public/.well-known/agent-skills.json
            // and advertised to crawling agents via the WebMCP Server Card.
        }
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <DynamicContextProvider
            settings={{
                environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || 'DYNAMIC_ENVIRONMENT_ID_PLACEHOLDER',
                walletConnectors: [SolanaWalletConnectors, BitcoinWalletConnectors],
            }}
        >
            <HUDProvider>
                {/* <HUDStateSync /> Disabled to prevent BroadcastChannel looping and extension crashes */}
                <MeshProvider>
                    <TelemetryNode>
                        {children}
                    </TelemetryNode>
                    <AIAssistant />
                    <Toaster />
                    <ThemeController />
                </MeshProvider>
            </HUDProvider>
        </DynamicContextProvider>
    );
}
