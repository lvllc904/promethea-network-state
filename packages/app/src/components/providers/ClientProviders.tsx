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
import { usePathname } from 'next/navigation';

export function ClientProviders({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (let registration of registrations) {
                    registration.unregister().then(
                        (boolean) => console.log('Unregistered SW to clear bad cache: ', boolean)
                    );
                }
            });
            
            // WebMCP Agent Registry (Migrated to Edge Discovery & CustomEvents)
            // Tools are now declared statically in /public/.well-known/agent-skills.json
            // and advertised to crawling agents via the WebMCP Server Card.
        }
    }, []);

    // Preload Google Maps SDK script in the background
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (apiKey) {
                const SCRIPT_ID = 'sovereign-map-proxy-script';
                if (!document.getElementById(SCRIPT_ID)) {
                    (window as any).__googleMapsProxyCallback = () => {
                        console.log('[ClientProviders] Google Maps SDK preloaded.');
                    };
                    const script = document.createElement('script');
                    script.id = SCRIPT_ID;
                    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&v=weekly&libraries=maps,marker,places&callback=__googleMapsProxyCallback`;
                    script.async = true;
                    script.defer = true;
                    script.onerror = () => {
                        console.warn('[ClientProviders] Google Maps SDK preloading failed.');
                    };
                    document.head.appendChild(script);
                }
            }
        }
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <HUDProvider>
            {/* <HUDStateSync /> Disabled to prevent BroadcastChannel looping and extension crashes */}
            <MeshProvider>
                <TelemetryNode>
                    {children}
                </TelemetryNode>
                <AIAssistant />
                <Toaster />
                {pathname !== '/' && !pathname.startsWith('/dashboard') && <ThemeController />}
            </MeshProvider>
        </HUDProvider>
    );
}
