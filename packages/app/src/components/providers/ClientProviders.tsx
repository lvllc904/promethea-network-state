'use client';


import { Toaster } from "@promethea/ui";
import { PrometheaProvider } from "@/components/ai/PrometheaProvider";
import { PrometheaSurface } from "@/components/ai/PrometheaSurface";
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
        if (typeof window !== 'undefined') {
            // Seed real_world_assets
            const rwaKey = 'promethea-local-real_world_assets';
            const storedRwa = localStorage.getItem(rwaKey);
            if (!storedRwa || JSON.parse(storedRwa).length === 0) {
                const initialRwas = [
                    {
                        id: "1",
                        name: "Ozark Ridge Sanctuary",
                        realityState: "SIMULATED",
                        location: { nearestTown: "Jasper", region: "Newton County", state: "Arkansas", coordinates: { latitude: 36.0084, longitude: -93.1864 } },
                        description: "A 42-acre autonomous land parcel dedicated to permaculture, off-grid research, and soil restoration.",
                        price: 750000,
                        status: "Active",
                        category: "Real Estate"
                    },
                    {
                        id: "2",
                        name: "Cascadia Agricultural Node",
                        realityState: "ACTUALIZED",
                        location: { nearestTown: "Bellingham", region: "Whatcom County", state: "Washington", coordinates: { latitude: 48.7519, longitude: -122.4787 } },
                        description: "A cooperative organic farm producing high-yield heirloom crops and hosting modular worker cabins.",
                        price: 1250000,
                        status: "Active",
                        category: "Agriculture"
                    },
                    {
                        id: "3",
                        name: "The Obsidian Cafe & Press",
                        realityState: "ACTUALIZED",
                        location: { nearestTown: "Portland", region: "Multnomah County", state: "Oregon", coordinates: { latitude: 45.5152, longitude: -122.6784 } },
                        description: "A community-owned physical hub and coffeehouse supporting local sovereign gatherings and independent media.",
                        price: 340000,
                        status: "Active",
                        category: "Small Business"
                    },
                    {
                        id: "4",
                        name: "Promethean Solar Array Node",
                        realityState: "SIMULATED",
                        location: { nearestTown: "Taos", region: "Taos County", state: "New Mexico", coordinates: { latitude: 36.4072, longitude: -105.5731 } },
                        description: "A 150kW grid-tied solar farm providing localized, clean power and mining substrate token yields.",
                        price: 580000,
                        status: "Active",
                        category: "Infrastructure"
                    }
                ];
                localStorage.setItem(rwaKey, JSON.stringify(initialRwas));
            }

            // Seed proposals
            const proposalsKey = 'promethea-local-proposals';
            const storedProp = localStorage.getItem(proposalsKey);
            if (!storedProp || JSON.parse(storedProp).length === 0) {
                const initialProposals = [
                    {
                        id: "prop-rwa-1",
                        title: "Acquire Ozark Ridge Sanctuary",
                        description: "A proposed vote to pool community capital to acquire the 42-acre Ozark Ridge Sanctuary for cooperative development and ecological preservation.",
                        category: "Real Estate",
                        realityState: "SIMULATED",
                        status: "Active",
                        targetEquity: 750000,
                        votingEndTime: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
                        proposerId: "did:sovereign:0x123",
                        votes: [{ id: "v1", support: true }, { id: "v2", support: true }, { id: "v3", support: false }]
                    },
                    {
                        id: "prop-rwa-2",
                        title: "Fund Cascadia Farm Cabins",
                        description: "Proposing the expansion of modular living cabins on the Bellingham agricultural tract to house rotating citizen researchers.",
                        category: "Agriculture",
                        realityState: "SIMULATED",
                        status: "Active",
                        targetEquity: 150000,
                        votingEndTime: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
                        proposerId: "did:sovereign:0x456",
                        votes: [{ id: "v4", support: true }]
                    }
                ];
                localStorage.setItem(proposalsKey, JSON.stringify(initialProposals));
            }

            // Seed omni_intel_lake
            const intelKey = 'promethea-local-omni_intel_lake';
            const storedIntel = localStorage.getItem(intelKey);
            if (!storedIntel || JSON.parse(storedIntel).length === 0) {
                const initialIntel = [
                    {
                        id: "intel-1",
                        type: "PHYSICAL_ANCHOR_SIGNAL",
                        name: "BLM Mineral Claim #48A",
                        location: "Esmeralda County, NV",
                        priority: "High",
                        status: "IDENTIFIED",
                        realityState: "SIMULATED",
                        payload: { strategy: "Acquire adjacent parcel to secure water rights", estimatedValuation: "$45,000" }
                    },
                    {
                        id: "intel-2",
                        type: "PHYSICAL_ANCHOR_SIGNAL",
                        name: "Zombie Asset: Abandoned Telecom Tower",
                        location: "Plumas County, CA",
                        priority: "Medium",
                        status: "RECONNAISSANCE",
                        realityState: "SIMULATED",
                        payload: { strategy: "Establish low-power mesh node on structure", quietnessCoefficient: 0.85, estimatedValuation: "$12,000" }
                    }
                ];
                localStorage.setItem(intelKey, JSON.stringify(initialIntel));
            }

            // Seed grants
            const grantsKey = 'promethea-local-grants';
            const storedGrants = localStorage.getItem(grantsKey);
            if (!storedGrants || JSON.parse(storedGrants).length === 0) {
                const initialGrants = [
                    {
                        id: "grant-1",
                        agency: "USDA Rural Energy",
                        title: "Rural Energy for America Program (REAP)",
                        amount: 25000,
                        description: "Guaranteed loan funding and grant funding to agricultural producers and rural small businesses for renewable energy systems.",
                        status: "Open",
                        realityState: "SIMULATED"
                    },
                    {
                        id: "grant-2",
                        agency: "Wyoming SOS",
                        title: "Wyoming Micro-Grid Initiative",
                        amount: 50000,
                        description: "State grants for building resilient off-grid energy storage systems in rural and unincorporated communities.",
                        status: "Open",
                        realityState: "SIMULATED"
                    }
                ];
                localStorage.setItem(grantsKey, JSON.stringify(initialGrants));
            }

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (let registration of registrations) {
                        registration.unregister().then(
                            (boolean) => console.log('Unregistered SW to clear bad cache: ', boolean)
                        );
                    }
                });
            }
        }
    }, []);

    // Preload Google Maps SDK script in the background
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Register early global auth failure handler to capture key verification issues immediately
            (window as any).gm_authFailure = () => {
                console.warn('[ClientProviders] Google Maps auth failure detected globally.');
                (window as any).__googleMapsLoadError = 'AUTH_FAILURE';
                window.dispatchEvent(new CustomEvent('google-maps-auth-failure'));
            };

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
                        (window as any).__googleMapsLoadError = 'SCRIPT_ERROR';
                        window.dispatchEvent(new CustomEvent('google-maps-auth-failure'));
                    };
                    document.head.appendChild(script);
                }
            }
        }
    }, []);

    return (
        <HUDProvider>
            {/* <HUDStateSync /> Disabled to prevent BroadcastChannel looping and extension crashes */}
            <MeshProvider>
                <PrometheaProvider>
                    <TelemetryNode>
                        {children}
                    </TelemetryNode>
                    {pathname && !pathname.startsWith('/dashboard') && !pathname.startsWith('/cockpit') && <PrometheaSurface />}
                    <Toaster />
                    {pathname && pathname !== '/' && !pathname.startsWith('/dashboard') && pathname !== '/lpa' && <ThemeController />}
                </PrometheaProvider>
            </MeshProvider>
        </HUDProvider>
    );
}
