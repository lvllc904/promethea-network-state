'use client';

import React, { useEffect, useRef, useState } from 'react';
import { StateBroadcastOverlay } from './ui/StateBroadcastOverlay';

interface SovereignMapProps {
    layers: any[];
    center?: { lat: number; lng: number };
}

export const SovereignMap: React.FC<SovereignMapProps> = ({ layers, center = { lat: 30.3322, lng: -81.6557 } }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const rafRef = useRef<number | null>(null);
    const particleRafRef = useRef<number | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

    // Fetch user geolocation on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => {
                    console.warn('[SovereignMap] Geolocation access denied or unavailable.', err.message);
                },
                { timeout: 10000, maximumAge: 60000 }
            );
        }
    }, []);

    // Map initialization — runs ONCE only. Layer updates handled separately.
    useEffect(() => {
        let cancelled = false;

        const initMap = async () => {
            try {
                // We manually inject the maps script tag because the latest googlemaps/js-api-loader 
                // removed the Loader class and doesn't easily support overriding the base URL.
                await new Promise((resolve, reject) => {
                    if ((window as any).google && (window as any).google.maps) {
                        resolve(true);
                        return;
                    }
                    
                    const SCRIPT_ID = 'sovereign-map-proxy-script';
                    if (document.getElementById(SCRIPT_ID)) {
                        // Already injecting, wait for it
                        const checkInterval = setInterval(() => {
                            if ((window as any).google && (window as any).google.maps) {
                                clearInterval(checkInterval);
                                resolve(true);
                            }
                        }, 50);
                        return;
                    }

                    // Define a global callback for Google Maps JSONP
                    (window as any).__googleMapsProxyCallback = () => {
                        resolve(true);
                    };

                    const script = document.createElement('script');
                    script.id = SCRIPT_ID;
                    // Load natively from Cloud Gateway using our unrestricted key
                    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&loading=async&v=weekly&libraries=maps,marker&callback=__googleMapsProxyCallback`;
                    script.async = true;
                    script.defer = true;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });

                const { Map } = await (window as any).google.maps.importLibrary('maps');

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
                        mapTypeId: 'terrain',
                        disableDefaultUI: false, // Turn controls back on for the user
                        backgroundColor: '#000000',
                        gestureHandling: 'greedy', // Ensure scroll wheel works
                        // mapId is required for advanced markers and tilt/rotation vector maps
                        mapId: 'aa43c9e9e082ca1d8d1fc65d',
                        isFractionalZoomEnabled: true,
                    });
                    mapInstanceRef.current = map;

                    // Cinematic Fly-In — ONE-SHOT, self-terminating animation
                    const targetCenter = userLocation || center;
                    const isDefaultCenter = Math.abs(targetCenter.lat - 30.3322) < 0.01 && Math.abs(targetCenter.lng - -81.6557) < 0.01;
                    const targetZoom = isDefaultCenter && !userLocation ? 6 : 14;
                    const targetTilt = isDefaultCenter && !userLocation ? 30 : 45;
                    const targetHeading = 0;
                    const duration = 1800; // Snappy 1.8 seconds space descent to unlock interaction instantly
                    const startTime = performance.now();

                    const animate = (now: number) => {
                        if (cancelled) return;
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        // Ease-out quartic for terminal glide deceleration
                        const ease = 1 - (1 - progress) ** 4;

                        const currentLat = startLat + (targetCenter.lat - startLat) * ease;
                        const currentLng = startLng + (targetCenter.lng - startLng) * ease;
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
                                    center: { lat: targetCenter.lat, lng: targetCenter.lng },
                                    zoom: targetZoom
                                });
                            } catch (_) {
                                map.setCenter({ lat: targetCenter.lat, lng: targetCenter.lng });
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

    // Map center updates removed to allow free panning

    // Ambient Particle Data Streams
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        const particles: {x: number, y: number, speed: number, length: number, opacity: number}[] = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                speed: 1 + Math.random() * 3,
                length: 10 + Math.random() * 40,
                opacity: 0.1 + Math.random() * 0.4
            });
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(p => {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(6, 182, 212, ${p.opacity})`;
                ctx.lineWidth = 1;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x, p.y + p.length);
                ctx.stroke();

                p.y += p.speed;
                if (p.y > height) {
                    p.y = -p.length;
                    p.x = Math.random() * width;
                }
            });

            particleRafRef.current = requestAnimationFrame(animateParticles);
        };

        animateParticles();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (particleRafRef.current !== null) {
                cancelAnimationFrame(particleRafRef.current);
            }
        };
    }, []);

    // Separate effect for layer overlays — updates when layers change without re-creating the map
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isLoaded) return;

        const addLayers = async () => {
            try {
                // Use the globally injected google object to ensure we use the proxy-loaded library
                const { Circle, Polyline } = await (window as any).google.maps.importLibrary('maps');
                const SymbolPath = (window as any).google?.maps?.SymbolPath;

                // Use AdvancedMarkerElement if available, else legacy Marker
                let AdvancedMarkerElement: any = null;
                try {
                    const markerLib = await (window as any).google.maps.importLibrary('marker');
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
        <div className="relative w-full h-full overflow-hidden">
            {/* Map Substrate */}
            <div ref={mapRef} className="w-full h-full" />
            
            {/* Ambient Data Stream Overlay */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-60" 
            />

            {!isLoaded && !error && (
                <StateBroadcastOverlay label="SYNCHRONIZING ATLAS..." />
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
