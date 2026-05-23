'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SovereignMapProps {
    layers: any[];
    center?: { lat: number; lng: number };
}

export const SovereignMap: React.FC<SovereignMapProps> = ({ layers, center = { lat: 42.8252, lng: -108.7513 } }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const rafRef = useRef<number | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Map initialization — runs ONCE only. Layer updates handled separately.
    useEffect(() => {
        let cancelled = false;

        const initMap = async () => {
            try {
                const { setOptions, importLibrary } = await import('@googlemaps/js-api-loader');

                try {
                    await setOptions({
                        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
                        v: 'weekly',
                        libraries: ['maps', 'marker']
                    });
                } catch (e) {
                    // Safe ignore: loader already initialized by other map instance
                }

                const { Map } = await importLibrary('maps') as any;

                if (!mapRef.current || cancelled) return;

                if (!mapInstanceRef.current) {
                    const startLat = 37.0902;
                    const startLng = -95.7129;
                    const startZoom = 3;
                    const startTilt = 0;
                    const startHeading = -35;

                    const map = new Map(mapRef.current, {
                        center: { lat: startLat, lng: startLng },
                        zoom: startZoom,
                        tilt: startTilt,
                        heading: startHeading,
                        mapTypeId: 'satellite',
                        disableDefaultUI: true,
                        backgroundColor: '#000000',
                        gestureHandling: 'greedy',
                        mapId: 'DEMO_MAP_ID'
                    });
                    mapInstanceRef.current = map;

                    // Cinematic Fly-In — ONE-SHOT, self-terminating animation
                    const isDefaultCenter = Math.abs(center.lat - 42.8252) < 0.01 && Math.abs(center.lng - -108.7513) < 0.01;
                    const targetZoom = isDefaultCenter ? 6 : 14;
                    const targetTilt = isDefaultCenter ? 30 : 45;
                    const targetHeading = 0;
                    const duration = 1800; // Snappy 1.8 seconds space descent to unlock interaction instantly
                    const startTime = performance.now();

                    const animate = (now: number) => {
                        if (cancelled) return;
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        // Ease-out quartic for terminal glide deceleration
                        const ease = 1 - (1 - progress) ** 4;

                        const currentLat = startLat + (center.lat - startLat) * ease;
                        const currentLng = startLng + (center.lng - startLng) * ease;
                        const currentZoom = startZoom + (targetZoom - startZoom) * ease;

                        try {
                            map.moveCamera({
                                center: { lat: currentLat, lng: currentLng },
                                zoom: currentZoom
                            });
                        } catch (_) {
                            // Bulletproof fallback if vector map features are restricted by API key
                            map.setCenter({ lat: currentLat, lng: currentLng });
                            map.setZoom(currentZoom);
                        }

                        if (progress < 1) {
                            rafRef.current = requestAnimationFrame(animate);
                        } else {
                            // Animation complete — lock onto target coordinates
                            try {
                                map.moveCamera({
                                    center: { lat: center.lat, lng: center.lng },
                                    zoom: targetZoom
                                });
                            } catch (_) {
                                map.setCenter({ lat: center.lat, lng: center.lng });
                                map.setZoom(targetZoom);
                            }
                            rafRef.current = null;
                        }
                    };

                    // Delay start slightly to let map tiles begin loading first
                    setTimeout(() => {
                        if (!cancelled) rafRef.current = requestAnimationFrame(animate);
                    }, 800);
                }

                if (!cancelled) setIsLoaded(true);
            } catch (err: any) {
                if (!cancelled) {
                    console.error('[SovereignMap] Initialization failed:', err);
                    setError(err.message || 'Unknown initialization error');
                }
            }
        };

        initMap();

        return () => {
            cancelled = true;
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, []); // CRITICAL: empty deps — map initializes exactly once

    // Separate effect to smoothly pan map when center changes dynamically (e.g. user selects a different asset or tab)
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isLoaded || !center) return;

        map.panTo(center);
        
        // Adjust zoom level smoothly if moving to a specific node vs home base
        const isDefaultCenter = Math.abs(center.lat - 42.8252) < 0.01 && Math.abs(center.lng - -108.7513) < 0.01;
        const currentZoom = map.getZoom();
        
        if (isDefaultCenter) {
            if (currentZoom !== 6) map.setZoom(6);
        } else {
            if (currentZoom < 12) map.setZoom(12);
        }
    }, [center, isLoaded]);

    // Separate effect for layer overlays — updates when layers change without re-creating the map
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isLoaded) return;

        const addLayers = async () => {
            try {
                const { importLibrary } = await import('@googlemaps/js-api-loader');
                const { Circle, Polyline } = await importLibrary('maps') as any;
                const SymbolPath = (window as any).google?.maps?.SymbolPath;

                // Use AdvancedMarkerElement if available, else legacy Marker
                let AdvancedMarkerElement: any = null;
                try {
                    const markerLib = await importLibrary('marker') as any;
                    AdvancedMarkerElement = markerLib.AdvancedMarkerElement;
                } catch (_) {}

                layers.forEach(layer => {
                    if (layer.type === 'COMMODITY' && layer.data?.nodes) {
                        layer.data.nodes.forEach((node: any) => {
                            new Circle({
                                strokeColor: '#FFD700', strokeOpacity: 0.8, strokeWeight: 2,
                                fillColor: '#FFD700', fillOpacity: node.intensity,
                                map, center: node.coords, radius: 100
                            });
                        });
                    }

                    if (layer.type === 'LIQUIDITY_ARC' && layer.data) {
                        new Polyline({
                            path: [layer.data.source, layer.data.target],
                            geodesic: true, strokeColor: '#00f2ff',
                            strokeOpacity: 0.6, strokeWeight: 3, map
                        });
                    }

                    const placeMarker = (position: any, color: string) => {
                        if (AdvancedMarkerElement) {
                            const pin = document.createElement('div');
                            pin.style.cssText = `width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;`;
                            new AdvancedMarkerElement({ position, map, content: pin });
                        } else if (SymbolPath) {
                            // Fallback only — suppress deprecation in console via try/catch
                            try {
                                const { Marker } = (window as any).google.maps;
                                new Marker({ position, map, icon: { path: SymbolPath.CIRCLE, scale: 8, fillColor: color, fillOpacity: 0.9, strokeWeight: 2, strokeColor: '#ffffff' } });
                            } catch (_) {}
                        }
                    };

                    if (layer.type === 'INSTITUTION' && Array.isArray(layer.data)) {
                        layer.data.forEach((inst: any) => placeMarker(inst.coords, '#10b981'));
                    }
                    if (layer.type === 'PROPOSAL' && Array.isArray(layer.data)) {
                        layer.data.forEach((prop: any) => placeMarker(prop.coords, '#0ea5e9'));
                    }
                });
            } catch (e) { /* layer render failure is non-fatal */ }
        };

        addLayers();
    }, [layers, isLoaded]); // Layer effect runs when layers update — map is already stable

    return (
        <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-800">
            <div ref={mapRef} className="w-full h-full" />
            {!isLoaded && !error && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Synchronizing Atlas...</span>
                    </div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center p-8 text-center gap-4">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                         <span className="text-red-500 text-2xl">⚠️</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2">Sovereign Substrate Offline</h4>
                        <p className="text-[10px] text-gray-500 uppercase leading-relaxed max-w-xs">
                            The external telemetry layer (Google Maps) failed to synchronize. Atlas metadata remains stored in local SQLite substrate.
                        </p>
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-900 border border-gray-800 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
                    >
                        Retry Synchronization
                    </button>
                </div>
            )}
        </div>
    );
};
