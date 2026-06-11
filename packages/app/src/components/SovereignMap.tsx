'use client';

import React, { useEffect, useRef, useState } from 'react';
import { StateBroadcastOverlay } from './ui/StateBroadcastOverlay';
import { useHUD, POIDetails } from '../lib/hud-store';
import { useMesh } from '@/components/providers/mesh-provider';

const EARTH_STYLE = [
    { "elementType": "geometry", "stylers": [{ "color": "#030712" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#030712" }, { "weight": 2 }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#f59e0b" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#1c0d02" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#ea580c" }] },
    { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#334155" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
    { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#334155" }] }
];

const LUNA_STYLE = [
    { "elementType": "geometry", "stylers": [{ "color": "#09090b" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#09090b" }, { "weight": 2 }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#a1a1aa" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#18181b" }] },
    { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#1c1917" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#27272a" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#3f3f46" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#71717a" }] }
];

const MARS_STYLE = [
    { "elementType": "geometry", "stylers": [{ "color": "#1c0d0a" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1c0d0a" }, { "weight": 2 }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#f97316" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#451a03" }] },
    { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#2d1610" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#431407" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#7c2d12" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#ea580c" }] }
];

const ON_WORLD_DATA = {
    EARTH: {
        arcs: [
            { from: { lat: 35.6762, lng: 139.6503 }, to: { lat: 42.8252, lng: -108.7513 }, label: "SOL/ORCA" },
            { from: { lat: 37.7749, lng: -122.4194 }, to: { lat: 40.7128, lng: -74.0060 }, label: "BASE/UNISWAP" },
            { from: { lat: 30.3322, lng: -81.6557 }, to: { lat: 51.5074, lng: -0.1278 }, label: "TPNS-NET" }
        ],
        nodes: [
            { lat: 35.6762, lng: 139.6503, name: "Neo-Tokyo Citadel" },
            { lat: 42.8252, lng: -108.7513, name: "Wyoming Citadel" },
            { lat: 30.3322, lng: -81.6557, name: "Jacksonville Core" }
        ],
        heatmaps: [
            { lat: 35.1983, lng: -115.4801, intensity: 0.9, val: "$82.4/oz", name: "Rare Earths" },
            { lat: 42.8252, lng: -108.7513, intensity: 0.75, val: "$42.1/lb", name: "Uranium Deposits" }
        ]
    },
    LUNA: {
        arcs: [
            { from: { lat: -58.4, lng: -14.4 }, to: { lat: -89.9, lng: 0.0 }, label: "LUNA-LINK-ALPHA" },
            { from: { lat: 9.7, lng: -20.0 }, to: { lat: 22.1, lng: 17.5 }, label: "LUNA-LINK-BETA" }
        ],
        nodes: [
            { lat: -58.4, lng: -14.4, name: "Clavius Research Dome" },
            { lat: -89.9, lng: 0.0, name: "Shackleton Quantum Hub" },
            { lat: 32.8, lng: -15.6, name: "Mare Imbrium Station" }
        ],
        heatmaps: [
            { lat: 22.1, lng: 17.5, intensity: 0.95, val: "$1,250/g", name: "Helium-3" },
            { lat: 9.7, lng: -20.0, intensity: 0.8, val: "$84.2/ton", name: "Titanium Regolith" }
        ]
    },
    MARS: {
        arcs: [
            { from: { lat: -8.4, lng: -120.0 }, to: { lat: 18.65, lng: -134.0 }, label: "MARS-NET-OLYMPUS" },
            { from: { lat: -5.4, lng: 137.8 }, to: { lat: 26.7, lng: -32.0 }, label: "MARS-NET-GALE" }
        ],
        nodes: [
            { lat: -8.4, lng: -120.0, name: "Arsia Agricultural Biosphere" },
            { lat: 18.65, lng: -134.0, name: "Olympus Research Complex" },
            { lat: -5.4, lng: 137.8, name: "Gale Comm Relay" }
        ],
        heatmaps: [
            { lat: 26.7, lng: -32.0, intensity: 0.9, val: "$12.4/ton", name: "Iron Oxide Concentrates" },
            { lat: -5.4, lng: 137.8, intensity: 0.85, val: "$45.2/kl", name: "Subsurface Hydrology" }
        ]
    }
};

interface SovereignMapProps {
    layers: any[];
    center?: { lat: number; lng: number };
}

export const SovereignMap: React.FC<SovereignMapProps> = ({ layers, center = { lat: 42.8252, lng: -108.7513 } }) => {
    const { themeState } = useMesh();
    const { 
        activePOI, 
        setActivePOI, 
        setHUDState,
        is3DTilesEnabled,
        isGhostArchitectureEnabled,
        isLiquidityArcsEnabled,
        isHeatmapEnabled,
        isOsirisTelemetryEnabled
    } = useHUD();
    const mapRef = useRef<HTMLDivElement>(null);
    const map3DRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const map3DInstanceRef = useRef<any>(null);
    const rafRef = useRef<number | null>(null);
    const particleRafRef = useRef<number | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
    const [isOfflineSubstrateMode, setIsOfflineSubstrateMode] = useState(false);

    const [is3DReady, setIs3DReady] = useState(false);
    const [is3DLoading, setIs3DLoading] = useState(false);
    const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
    const [geoFallbackAlert, setGeoFallbackAlert] = useState<string | null>(null);

    const hasMapIdRef = useRef(false);

    const lastCentered2DPOIKeyRef = useRef<string | null>(null);
    const lastCentered3DPOIKeyRef = useRef<string | null>(null);

    // Interaction lock and Offline Substrate controls
    const isUserPanningRef = useRef(false);

    const [offlinePan, setOfflinePan] = useState({ x: 0, y: 0 });
    const [offlineZoom, setOfflineZoom] = useState(1);
    const [isOfflineDragging, setIsOfflineDragging] = useState(false);
    const [offlineDragStart, setOfflineDragStart] = useState({ x: 0, y: 0 });
    
    const offlineDragMovedRef = useRef(false);
    const lastTouchDistRef = useRef<number | null>(null);

    const handleResetOfflineViewport = () => {
        setOfflinePan({ x: 0, y: 0 });
        setOfflineZoom(1);
    };

    const handleOfflineMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        if (e.button !== 0) return; // Only left click drags
        setIsOfflineDragging(true);
        setOfflineDragStart({ x: e.clientX - offlinePan.x, y: e.clientY - offlinePan.y });
        offlineDragMovedRef.current = false;
    };

    const handleOfflineMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!isOfflineDragging) return;
        const newX = e.clientX - offlineDragStart.x;
        const newY = e.clientY - offlineDragStart.y;
        const dx = newX - offlinePan.x;
        const dy = newY - offlinePan.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            offlineDragMovedRef.current = true;
        }
        setOfflinePan({ x: newX, y: newY });
    };

    const handleOfflineMouseUp = () => {
        setIsOfflineDragging(false);
    };

    const handleOfflineMouseLeave = () => {
        setIsOfflineDragging(false);
    };

    const handleOfflineWheel = (e: React.WheelEvent<SVGSVGElement>) => {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const scale = e.deltaY < 0 ? 1 + zoomIntensity : 1 - zoomIntensity;
        const newZoom = Math.min(20, Math.max(0.5, offlineZoom * scale));
        
        const svgRect = e.currentTarget.getBoundingClientRect();
        const clientX = e.clientX - svgRect.left;
        const clientY = e.clientY - svgRect.top;
        
        const newPanX = clientX - (clientX - offlinePan.x) * (newZoom / offlineZoom);
        const newPanY = clientY - (clientY - offlinePan.y) * (newZoom / offlineZoom);
        
        setOfflineZoom(newZoom);
        setOfflinePan({ x: newPanX, y: newPanY });
    };

    const handleOfflineTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            setIsOfflineDragging(true);
            setOfflineDragStart({ x: touch.clientX - offlinePan.x, y: touch.clientY - offlinePan.y });
            offlineDragMovedRef.current = false;
            lastTouchDistRef.current = null;
        } else if (e.touches.length === 2) {
            setIsOfflineDragging(false);
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            lastTouchDistRef.current = dist;
        }
    };

    const handleOfflineTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
        if (isOfflineDragging && e.touches.length === 1) {
            const touch = e.touches[0];
            const newX = touch.clientX - offlineDragStart.x;
            const newY = touch.clientY - offlineDragStart.y;
            const dx = newX - offlinePan.x;
            const dy = newY - offlinePan.y;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                offlineDragMovedRef.current = true;
            }
            setOfflinePan({ x: newX, y: newY });
        } else if (e.touches.length === 2 && lastTouchDistRef.current !== null) {
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            const lastDist = lastTouchDistRef.current;
            lastTouchDistRef.current = dist;

            const scaleFactor = dist / lastDist;
            if (scaleFactor > 0.9 && scaleFactor < 1.1) {
                const newZoom = Math.min(20, Math.max(0.5, offlineZoom * scaleFactor));
                
                const svgRect = e.currentTarget.getBoundingClientRect();
                const midX = (t1.clientX + t2.clientX) / 2;
                const midY = (t1.clientY + t2.clientY) / 2;
                const clientX = midX - svgRect.left;
                const clientY = midY - svgRect.top;

                const newPanX = clientX - (clientX - offlinePan.x) * (newZoom / offlineZoom);
                const newPanY = clientY - (clientY - offlinePan.y) * (newZoom / offlineZoom);

                setOfflineZoom(newZoom);
                setOfflinePan({ x: newPanX, y: newPanY });
            }
        }
    };

    const handleOfflineTouchEnd = () => {
        setIsOfflineDragging(false);
        lastTouchDistRef.current = null;
    };

    const getPOIKey = (poi: any) => {
        if (!poi || !poi.coordinates) return 'none';
        return `${poi.name || ''}_${poi.coordinates.lat}_${poi.coordinates.lng}_${poi.referenceFrame || 'EARTH'}`;
    };

    const [telemetryFeatures, setTelemetryFeatures] = useState<any[]>([]);

    const getThemeFilter = () => {
        if (themeState?.theme === 'theme-latex') {
            return 'sepia(35%) saturate(0.9) contrast(1.02)';
        }
        const refFrame = activePOI?.referenceFrame || 'EARTH';
        if (refFrame === 'LUNA') {
            return 'invert(100%) grayscale(100%) brightness(0.55) contrast(1.4)';
        } else if (refFrame === 'MARS') {
            return 'invert(100%) sepia(100%) hue-rotate(-30deg) saturate(1.6) brightness(0.45) contrast(1.3)';
        } else {
            return 'invert(100%) hue-rotate(180deg) brightness(0.65) contrast(1.25) saturate(0.85)';
        }
    };

    const setHUDStateRef = useRef(setHUDState);
    useEffect(() => {
        setHUDStateRef.current = setHUDState;
    }, [setHUDState]);

    const overlayStatesRef = useRef({
        isGhostArchitectureEnabled,
        isLiquidityArcsEnabled,
        isHeatmapEnabled,
        isOsirisTelemetryEnabled,
        telemetryFeatures,
        theme: themeState?.theme
    });

    useEffect(() => {
        overlayStatesRef.current = {
            isGhostArchitectureEnabled,
            isLiquidityArcsEnabled,
            isHeatmapEnabled,
            isOsirisTelemetryEnabled,
            telemetryFeatures,
            theme: themeState?.theme
        };
    }, [isGhostArchitectureEnabled, isLiquidityArcsEnabled, isHeatmapEnabled, isOsirisTelemetryEnabled, telemetryFeatures, themeState?.theme]);

    // Poll Osiris telemetry from local depthos-bridge daemon
    useEffect(() => {
        let active = true;
        const fetchTelemetry = async () => {
            if (!isOsirisTelemetryEnabled) {
                setTelemetryFeatures([]);
                return;
            }
            try {
                const response = await fetch('/api/telemetry/geojson');
                if (!response.ok) throw new Error(`HTTP status ${response.status}`);
                const data = await response.json();
                if (active && data && Array.isArray(data.features)) {
                    setTelemetryFeatures(data.features);
                }
            } catch (err) {
                console.warn('[SovereignMap] Osiris telemetry fetch failed:', err);
            }
        };

        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 10000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [isOsirisTelemetryEnabled]);

    const fetchLiveTelemetry = async (latitude: number, longitude: number, currentPOI: POIDetails) => {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,shortwave_radiation`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                const current = data.current;
                if (current) {
                    const solarPotential = Math.min(100, Math.max(5, Math.round((current.shortwave_radiation || 0) / 8)));
                    const windPotential = Math.min(100, Math.max(10, Math.round((current.wind_speed_10m || 0) * 2)));
                    const waterPotential = Math.min(100, Math.max(5, Math.round(current.relative_humidity_2m || 30)));
                    
                    const updatedPOI: POIDetails = {
                        ...currentPOI,
                        publicPlans: `ACTIVE EARTH ORACLE FEED: Real-time environmental coordinates verified via Open-Meteo API. Temperature is ${current.temperature_2m}°C, Wind Speed ${current.wind_speed_10m} km/h, Solar Radiation ${current.shortwave_radiation || 0} W/m². Dynamic resource captures calculated as: Solar ${solarPotential}%, Wind ${windPotential}%, Water ${waterPotential}%.`,
                        metrics: {
                            solar: solarPotential,
                            wind: windPotential,
                            water: waterPotential,
                            zoning: currentPOI.metrics?.zoning || 50
                        }
                    };
                    setActivePOI(updatedPOI);
                }
            }
        } catch (err) {
            console.warn('[SovereignMap] Live Telemetry Oracle fetch failed:', err);
        }
    };

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
                    setGeoFallbackAlert('SECURE GEOLOCATION RESTRICTED. INITIALIZING LOCAL DUAL-SUBSTRATE AT WYOMING CITADEL COORDS.');
                    setTimeout(() => {
                        setGeoFallbackAlert(null);
                    }, 5000);
                },
                { timeout: 10000, maximumAge: 60000 }
            );
        }
    }, []);

    // Detect Google Maps failure by intercepting window.gm_authFailure
    useEffect(() => {
        const handleAuthFailure = () => {
            console.warn('[SovereignMap] Google Maps auth failure detected. Activating Offline Substrate fallback.');
            setIsOfflineSubstrateMode(true);
        };
        (window as any).gm_authFailure = handleAuthFailure;
        return () => {
            if ((window as any).gm_authFailure === handleAuthFailure) {
                delete (window as any).gm_authFailure;
            }
        };
    }, []);


    // Map initialization — runs ONCE only. Layer updates handled separately.
    useEffect(() => {
        let cancelled = false;

        const initMap = async () => {
            try {
                if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
                    throw new Error('Google Maps API key not found. Atlas is running in offline substrate mode.');
                }
                
                // We manually inject the maps script tag because the latest googlemaps/js-api-loader 
                // removed the Loader class and doesn't easily support overriding the base URL.
                await new Promise((resolve, reject) => {
                    if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
                        resolve(true);
                        return;
                    }
                    
                    const SCRIPT_ID = 'sovereign-map-proxy-script';
                    if (document.getElementById(SCRIPT_ID)) {
                        // Already injecting, wait for it
                        const checkInterval = setInterval(() => {
                            if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
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
                    // Load natively from Cloud Gateway with maps, marker, places libraries
                    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&loading=async&v=weekly&libraries=maps,marker,places&callback=__googleMapsProxyCallback`;
                    script.async = true;
                    script.defer = true;
                    script.onerror = (e) => {
                        console.error('[SovereignMap] Script load error, falling back.');
                        setIsOfflineSubstrateMode(true);
                        reject(e);
                    };
                    document.head.appendChild(script);
                });

                let GoogleMap: any = null;
                if ((window as any).google && (window as any).google.maps) {
                    if ((window as any).google.maps.importLibrary) {
                        try {
                            const lib = await (window as any).google.maps.importLibrary('maps');
                            GoogleMap = lib?.Map || (window as any).google.maps.Map;
                        } catch (e) {
                            console.warn('[SovereignMap] importLibrary failed, falling back to window.google.maps.Map', e);
                            GoogleMap = (window as any).google.maps.Map;
                        }
                    } else {
                        GoogleMap = (window as any).google.maps.Map;
                    }
                }

                if (!GoogleMap) {
                    throw new Error('Google Maps class (Map) could not be loaded.');
                }

                if (!mapRef.current || cancelled) return;

                if (!mapInstanceRef.current) {
                    const startLat = activePOI?.coordinates?.lat || 37.0902;
                    const startLng = activePOI?.coordinates?.lng || -95.7129;
                    const startZoom = activePOI?.coordinates?.lat ? 14 : 3;

                    const mapIdValue = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
                    const mapOptions: any = {
                        center: { lat: startLat, lng: startLng },
                        zoom: startZoom,
                        mapTypeId: 'roadmap',
                        disableDefaultUI: false, // Turn controls back on for the user
                        backgroundColor: '#000000',
                        gestureHandling: 'greedy', // Ensure scroll wheel works
                        isFractionalZoomEnabled: true
                    };
                    if (mapIdValue) {
                        mapOptions.mapId = mapIdValue;
                        hasMapIdRef.current = true;
                    } else {
                        mapOptions.styles = EARTH_STYLE;
                        hasMapIdRef.current = false;
                    }

                    const map = new GoogleMap(mapRef.current, mapOptions);
                    mapInstanceRef.current = map;

                    // Attach spatial click listeners to synchronize both trays dynamically
                    map.addListener('click', async (event: any) => {
                        isUserPanningRef.current = false;
                        lastCentered2DPOIKeyRef.current = null;
                        lastCentered3DPOIKeyRef.current = null;
                        if (event.placeId) {
                            event.stop(); // Prevent standard popup

                            try {
                                const googleObj = (window as any).google;
                                const service = new googleObj.maps.places.PlacesService(map);
                                service.getDetails({
                                    placeId: event.placeId,
                                    fields: ['name', 'formatted_address', 'website', 'rating', 'photos', 'geometry']
                                }, (place: any, status: any) => {
                                    if (status === googleObj.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
                                        const lat = place.geometry.location.lat();
                                        const lng = place.geometry.location.lng();
                                        const hashVal = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233)) * 43758.5453;
                                        
                                        const solar = Math.floor(55 + (hashVal % 45));
                                        const wind = Math.floor(15 + ((hashVal * 1.5) % 75));
                                        const water = Math.floor(5 + ((hashVal * 2.3) % 90));
                                        const zoning = Math.floor(20 + ((hashVal * 3.7) % 80));

                                        const refFrame = (window as any).__sovereignPlanetFrame || 'EARTH';
                                        const mockOwnerName = `Citizen ${Math.floor(100 + (hashVal % 900))}`;
                                        const mockOwnerDid = `did:sovereign:citizen:0x${Math.floor(hashVal).toString(16).substring(0, 16)}`;
                                        const mockStaked = Math.floor(4000 + (hashVal % 28000));
                                        const mockPlan = `Verified ${refFrame} Node location. Proposed zoning details outline a clean-resource capture node harvesting ${solar}% Solar, ${wind}% Wind, and ${water}% Water potential. Staked balance underwrites mesh node connectivity.`;

                                        const updatedPOI: POIDetails = {
                                            placeId: event.placeId,
                                            name: place.name || 'Sovereign Point',
                                            formattedAddress: place.formatted_address,
                                            website: place.website || `https://${(place.name || 'poi').toLowerCase().replace(/[^a-z0-9]/g, '')}.lvhllc.org`,
                                            rating: place.rating || 4.5,
                                            photos: place.photos && place.photos.length > 0 ? [place.photos[0].getUrl({ maxWidth: 600 })] : undefined,
                                            coordinates: { lat, lng, alt: Math.floor(30 + (hashVal % 400)) },
                                            referenceFrame: refFrame,
                                            ownership: {
                                                ownerDid: mockOwnerDid,
                                                ownerName: mockOwnerName,
                                                stakedSovereignUnits: mockStaked
                                            },
                                            publicPlans: mockPlan,
                                            metrics: { solar, wind, water, zoning }
                                        };

                                        setActivePOI(updatedPOI);
                                        if (refFrame === 'EARTH') {
                                            fetchLiveTelemetry(lat, lng, updatedPOI);
                                        }
                                    }
                                });
                            } catch (err) {
                                console.error('[SovereignMap] Error in Places details querying:', err);
                            }
                        } else if (event.latLng) {
                            const lat = event.latLng.lat();
                            const lng = event.latLng.lng();
                            const hashVal = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233)) * 43758.5453;

                            const solar = Math.floor(55 + (hashVal % 45));
                            const wind = Math.floor(15 + ((hashVal * 1.5) % 75));
                            const water = Math.floor(5 + ((hashVal * 2.3) % 90));
                            const zoning = Math.floor(20 + ((hashVal * 3.7) % 80));

                            const refFrame = (window as any).__sovereignPlanetFrame || 'EARTH';
                            const mockOwnerName = `Citizen ${Math.floor(100 + (hashVal % 900))}`;
                            const mockOwnerDid = `did:sovereign:citizen:0x${Math.floor(hashVal).toString(16).substring(0, 16)}`;
                            const mockStaked = Math.floor(4000 + (hashVal % 28000));
                            const mockPlan = `Unclaimed ${refFrame} raw coordinates. Proposed zoning details outline a clean-resource capture node harvesting ${solar}% Solar, ${wind}% Wind, and ${water}% Water potential. Staked balance underwrites mesh node connectivity.`;

                            const updatedPOI: POIDetails = {
                                name: `${refFrame} Landmark Point`,
                                formattedAddress: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
                                website: `https://coordinate-${Math.floor(hashVal % 100000)}.lvhllc.org`,
                                rating: 4.2,
                                coordinates: { lat, lng, alt: Math.floor(30 + (hashVal % 400)) },
                                referenceFrame: refFrame,
                                ownership: {
                                    ownerDid: mockOwnerDid,
                                    ownerName: mockOwnerName,
                                    stakedSovereignUnits: mockStaked
                                },
                                publicPlans: mockPlan,
                                metrics: { solar, wind, water, zoning }
                            };

                            setActivePOI(updatedPOI);
                            if (refFrame === 'EARTH') {
                                fetchLiveTelemetry(lat, lng, updatedPOI);
                            }
                        }
                    });

                    map.addListener('zoom_changed', () => {
                        if (map.getZoom() < 3) {
                            setHUDStateRef.current({ mapMode: 'INTERSTELLAR' });
                        }
                    });

                    // Cinematic Fly-In — ONE-SHOT, self-terminating animation
                    const targetCenter = userLocation || center;
                    const isDefaultCenter = Math.abs(targetCenter.lat - 42.8252) < 0.01 && Math.abs(targetCenter.lng - -108.7513) < 0.01;
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
                    console.error('[SovereignMap] Initialization failed, falling back to offline substrate:', err);
                    setIsOfflineSubstrateMode(true);
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

    const is3DActive = is3DTilesEnabled && activePOI?.referenceFrame === 'EARTH';

    // Track direct user physical inputs on container elements to activate interaction guards
    useEffect(() => {
        const handleUserInteraction = () => {
            isUserPanningRef.current = true;
        };

        const options = { passive: true };
        const el2d = mapRef.current;
        const el3d = map3DRef.current;

        if (el2d) {
            el2d.addEventListener('mousedown', handleUserInteraction, options);
            el2d.addEventListener('wheel', handleUserInteraction, options);
            el2d.addEventListener('touchstart', handleUserInteraction, options);
        }

        if (el3d) {
            el3d.addEventListener('mousedown', handleUserInteraction, options);
            el3d.addEventListener('wheel', handleUserInteraction, options);
            el3d.addEventListener('touchstart', handleUserInteraction, options);
        }

        return () => {
            if (el2d) {
                el2d.removeEventListener('mousedown', handleUserInteraction);
                el2d.removeEventListener('wheel', handleUserInteraction);
                el2d.removeEventListener('touchstart', handleUserInteraction);
            }
            if (el3d) {
                el3d.removeEventListener('mousedown', handleUserInteraction);
                el3d.removeEventListener('wheel', handleUserInteraction);
                el3d.removeEventListener('touchstart', handleUserInteraction);
            }
        };
    }, []);

    // Center map on user location once fetched
    useEffect(() => {
        if (!userLocation) return;
        if (isUserPanningRef.current) return;
        const map = mapInstanceRef.current;
        if (map && isLoaded) {
            try {
                map.moveCamera({
                    center: userLocation,
                    zoom: 14
                });
            } catch (_) {
                map.setCenter(userLocation);
                map.setZoom(14);
            }
            lastCentered2DPOIKeyRef.current = 'user_location';
        }
        if (map3DInstanceRef.current && is3DActive) {
            const map3d = map3DInstanceRef.current;
            map3d.center = { lat: userLocation.lat, lng: userLocation.lng, altitude: 0 };
            map3d.range = 20000;
            lastCentered3DPOIKeyRef.current = 'user_location';
        }
    }, [userLocation, isLoaded, is3DActive]);

    // Track loading and readiness states based on active 3D status
    useEffect(() => {
        if (!is3DActive) {
            setIs3DLoading(false);
            setIs3DReady(false);
        } else if (map3DInstanceRef.current) {
            // If the element has already been successfully loaded/initialized, mark it ready
            setIs3DReady(true);
        }
    }, [is3DActive]);

    // 3D Map initialization and synchronization
    useEffect(() => {
        if (!isLoaded) return;
        
        let cancelled = false;

        const init3DMap = async () => {
            if (is3DActive && !map3DInstanceRef.current && map3DRef.current) {
                try {
                    const googleObj = (window as any).google;
                    if (!googleObj || !googleObj.maps || !googleObj.maps.importLibrary) return;

                    setIs3DLoading(true);
                    setIs3DReady(false);

                    // 8-second watchdog timer to fade out loading spinner but keep 3D progressive tiles loading
                    const watchdogTimeout = setTimeout(() => {
                        if (cancelled) return;
                        console.warn('[SovereignMap] 3D map loading took longer than 8s, hiding spinner.');
                        setFallbackNotice('STREAMING OPTIMIZED TILESETS...');
                        setIs3DLoading(false);

                        // Clear fallback notice after 4 seconds
                        setTimeout(() => {
                            if (!cancelled) setFallbackNotice(null);
                        }, 4000);
                    }, 8000);

                    const { Map3DElement } = await googleObj.maps.importLibrary('maps3d');
                    if (cancelled || !map3DRef.current || map3DInstanceRef.current) {
                        clearTimeout(watchdogTimeout);
                        return;
                    }

                    const startLat = activePOI?.coordinates?.lat || 42.8252;
                    const startLng = activePOI?.coordinates?.lng || -108.7513;
                    const isDefault = Math.abs(startLat - 42.8252) < 0.01 && Math.abs(startLng - -108.7513) < 0.01;
                    const rangeVal = isDefault ? 12000000 : 20000;

                    const map3d = new Map3DElement({
                        center: { lat: startLat, lng: startLng, altitude: 0 },
                        range: rangeVal,
                        tilt: 45,
                        heading: 0
                    });

                    // Synchronize 3D map changes back to the 2D map for projection alignment
                    map3d.addEventListener('gmp-centerchange', () => {
                        const center = map3d.center;
                        if (center && mapInstanceRef.current) {
                            const map2d = mapInstanceRef.current;
                            const c2d = map2d.getCenter();
                            if (c2d) {
                                const dist = Math.abs(c2d.lat() - center.lat) + Math.abs(c2d.lng() - center.lng);
                                if (dist > 0.0001) {
                                    map2d.setCenter({ lat: center.lat, lng: center.lng });
                                }
                            }
                        }
                    });

                    map3d.addEventListener('gmp-rangechange', () => {
                        const range = map3d.range;
                        if (range && mapInstanceRef.current) {
                            const map2d = mapInstanceRef.current;
                            const zoom = Math.max(1, Math.min(20, 25 - Math.log2(range)));
                            if (Math.abs(map2d.getZoom() - zoom) > 0.5) {
                                map2d.setZoom(Math.round(zoom));
                            }
                        }
                    });

                    // Google Maps native event listener to resolve loading state once tiles are fully loaded and steady
                    map3d.addEventListener('gmp-steadychange', (event: any) => {
                        if (event.isSteady) {
                            clearTimeout(watchdogTimeout);
                            setIs3DLoading(false);
                        }
                    });

                    map3DRef.current.appendChild(map3d);
                    map3DInstanceRef.current = map3d;
                    setIs3DReady(true);
                } catch (err) {
                    console.error('[SovereignMap] 3D map tile initialization failed:', err);
                    setIs3DLoading(false);
                    setIs3DReady(false);
                    setHUDState({ is3DTilesEnabled: false });
                }
            }
        };

        init3DMap();

        return () => {
            cancelled = true;
        };
    }, [is3DActive, isLoaded]);

    // Coordinate 3D map center and range when activePOI coordinates change
    useEffect(() => {
        if (!map3DInstanceRef.current || !is3DActive || !activePOI?.coordinates) return;

        const poiKey = getPOIKey(activePOI);
        if (lastCentered3DPOIKeyRef.current !== poiKey) {
            isUserPanningRef.current = false; // Reset lock on explicit change
        }

        if (isUserPanningRef.current) return; // Guard flight centering!

        if (lastCentered3DPOIKeyRef.current === poiKey) return;

        const coords = activePOI.coordinates;
        const isDefault = Math.abs(coords.lat - 42.8252) < 0.01 && Math.abs(coords.lng - -108.7513) < 0.01;
        const rangeVal = isDefault ? 12000000 : (activePOI.placeId ? 5000 : 20000);

        const map3d = map3DInstanceRef.current;
        const currentCenter = map3d.center;
        if (currentCenter) {
            const dist = Math.abs(currentCenter.lat - coords.lat) + Math.abs(currentCenter.lng - coords.lng);
            if (dist > 0.0001 || Math.abs(map3d.range - rangeVal) > 100) {
                map3d.center = { lat: coords.lat, lng: coords.lng, altitude: 0 };
                map3d.range = rangeVal;
                map3d.tilt = 45;
            }
        } else {
            map3d.center = { lat: coords.lat, lng: coords.lng, altitude: 0 };
            map3d.range = rangeVal;
            map3d.tilt = 45;
        }

        lastCentered3DPOIKeyRef.current = poiKey;
    }, [activePOI?.coordinates?.lat, activePOI?.coordinates?.lng, is3DActive]);

    // Dynamically update map style and coordinate focus whenever activePOI or is3DTilesEnabled changes
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isLoaded || !activePOI || !activePOI.coordinates) return;

        // Set styled colors dynamically for off-world demonstration aesthetics
        let styles = EARTH_STYLE;
        if (activePOI.referenceFrame === 'LUNA') {
            styles = LUNA_STYLE;
        } else if (activePOI.referenceFrame === 'MARS') {
            styles = MARS_STYLE;
        }

        if (!hasMapIdRef.current) {
            map.setOptions({ styles });
        }

        if (is3DTilesEnabled && activePOI.referenceFrame === 'EARTH') {
            map.setMapTypeId('hybrid');
        } else {
            map.setMapTypeId('roadmap');
        }

        // Keep global helper updated
        (window as any).__sovereignPlanetFrame = activePOI.referenceFrame;

        // Smooth flight centering action
        const poiKey = getPOIKey(activePOI);
        if (lastCentered2DPOIKeyRef.current !== poiKey) {
            isUserPanningRef.current = false; // Reset lock on explicit change
        }

        if (isUserPanningRef.current) return; // Guard flight centering!

        if (lastCentered2DPOIKeyRef.current !== poiKey) {
            const coords = activePOI.coordinates;
            try {
                const cameraOptions: any = {
                    center: coords,
                    zoom: activePOI.placeId ? 16 : 14
                };
                // Only apply 3D camera angles if the map supports vector rendering at runtime
                const currentMapTypeId = map.getMapTypeId();
                const currentRenderingType = typeof map.getRenderingType === 'function' ? map.getRenderingType() : null;
                const isVectorMap = currentRenderingType === 'VECTOR' || ((window as any).google?.maps?.RenderingType?.VECTOR && currentRenderingType === (window as any).google.maps.RenderingType.VECTOR);
                
                const isVectorRoadmap = currentMapTypeId === 'roadmap' && isVectorMap;
                if (isVectorRoadmap) {
                    cameraOptions.tilt = 45;
                    cameraOptions.heading = 45;
                }
                map.moveCamera(cameraOptions);
            } catch (_) {
                map.panTo(coords);
                map.setZoom(14);
            }
            lastCentered2DPOIKeyRef.current = poiKey;
        }
    }, [activePOI?.coordinates?.lat, activePOI?.coordinates?.lng, activePOI?.referenceFrame, isLoaded, is3DTilesEnabled]);

    // Ambient Particle Data Streams & Custom HUD Projections
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

        const getScreenCoords = (lat: number, lng: number) => {
            const map = mapInstanceRef.current;
            if (!map) return null;
            const proj = map.getProjection();
            if (!proj) return null;
            
            const googleObj = (window as any).google;
            if (!googleObj || !googleObj.maps) return null;
            
            const latLngObj = new googleObj.maps.LatLng(lat, lng);
            const worldPoint = proj.fromLatLngToPoint(latLngObj);
            const centerLatLng = map.getCenter();
            if (!centerLatLng) return null;
            const centerWorld = proj.fromLatLngToPoint(centerLatLng);
            if (!worldPoint || !centerWorld) return null;
            
            const zoom = map.getZoom();
            const scale = Math.pow(2, zoom);
            
            const x = (worldPoint.x - centerWorld.x) * scale + width / 2;
            const y = (worldPoint.y - centerWorld.y) * scale + height / 2;
            return { x, y };
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, width, height);
            
            const { 
                isGhostArchitectureEnabled, 
                isLiquidityArcsEnabled, 
                isHeatmapEnabled, 
                isOsirisTelemetryEnabled, 
                telemetryFeatures,
                theme 
            } = overlayStatesRef.current;
            
            const isLatex = theme === 'theme-latex';

            // Draw ambient particles
            particles.forEach(p => {
                ctx.beginPath();
                ctx.strokeStyle = isLatex ? `rgba(140, 29, 29, ${p.opacity * 1.5})` : `rgba(245, 158, 11, ${p.opacity})`;
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

            // Projection Overlays
            if (isLoaded) {
                const refFrame = (window as any).__sovereignPlanetFrame || 'EARTH';
                const frameData = ON_WORLD_DATA[refFrame as 'EARTH' | 'LUNA' | 'MARS'] || ON_WORLD_DATA.EARTH;

                // 1. DEX Liquidity Arcs (Glowing curves)
                if (isLiquidityArcsEnabled && frameData.arcs) {
                    frameData.arcs.forEach(arc => {
                        const src = getScreenCoords(arc.from.lat, arc.from.lng);
                        const dst = getScreenCoords(arc.to.lat, arc.to.lng);
                        if (src && dst) {
                            const midX = (src.x + dst.x) / 2;
                            const midY = (src.y + dst.y) / 2 - Math.min(200, Math.abs(src.x - dst.x) * 0.25);

                            ctx.beginPath();
                            ctx.moveTo(src.x, src.y);
                            ctx.quadraticCurveTo(midX, midY, dst.x, dst.y);
                            
                            const gradient = ctx.createLinearGradient(src.x, src.y, dst.x, dst.y);
                            if (isLatex) {
                                gradient.addColorStop(0, 'rgba(140, 29, 29, 0.6)');
                                gradient.addColorStop(0.5, 'rgba(26, 37, 85, 0.7)');
                                gradient.addColorStop(1, 'rgba(140, 29, 29, 0.6)');
                            } else {
                                gradient.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
                                gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.6)');
                                gradient.addColorStop(1, 'rgba(245, 158, 11, 0.4)');
                            }
                            ctx.strokeStyle = gradient;
                            ctx.lineWidth = 1.5;
                            ctx.shadowColor = isLatex ? 'rgba(140, 29, 29, 0.15)' : 'rgba(245, 158, 11, 0.5)';
                            ctx.shadowBlur = isLatex ? 1 : 4;
                            ctx.stroke();
                            ctx.shadowBlur = 0;

                            // Pulse particle packet
                            const t = (Date.now() % 3000) / 3000;
                            const pX = (1 - t) * (1 - t) * src.x + 2 * (1 - t) * t * midX + t * t * dst.x;
                            const pY = (1 - t) * (1 - t) * src.y + 2 * (1 - t) * t * midY + t * t * dst.y;

                            ctx.beginPath();
                            ctx.arc(pX, pY, 3, 0, Math.PI * 2);
                            ctx.fillStyle = isLatex ? '#8c1d1d' : '#ffffff';
                            ctx.shadowColor = isLatex ? 'rgba(140, 29, 29, 0.3)' : '#f59e0b';
                            ctx.shadowBlur = isLatex ? 2 : 8;
                            ctx.fill();
                            ctx.shadowBlur = 0;

                            ctx.fillStyle = isLatex ? 'rgba(26, 37, 85, 0.85)' : 'rgba(255, 255, 255, 0.55)';
                            ctx.font = 'bold 7px monospace';
                            ctx.fillText(arc.label, midX - 25, midY - 5);
                        }
                    });
                }

                // 2. Commodity-to-Soil Heatmaps (Concentric Pulsing Mineral Rings)
                if (isHeatmapEnabled && frameData.heatmaps) {
                    frameData.heatmaps.forEach(item => {
                        const pt = getScreenCoords(item.lat, item.lng);
                        if (pt) {
                            const pulse = 1 + 0.1 * Math.sin(Date.now() / 400);
                            const rad = 40 * pulse * item.intensity;
                            const color = isLatex 
                                ? (refFrame === 'EARTH' ? '196, 114, 10' : refFrame === 'LUNA' ? '80, 80, 85' : '166, 45, 23')
                                : (refFrame === 'EARTH' ? '245, 158, 11' : refFrame === 'LUNA' ? '228, 228, 231' : '234, 88, 12');
                            
                            const radGrad = ctx.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, rad);
                            radGrad.addColorStop(0, `rgba(${color}, ${isLatex ? 0.45 : 0.5})`);
                            radGrad.addColorStop(0.3, `rgba(${color}, ${isLatex ? 0.18 : 0.2})`);
                            radGrad.addColorStop(1, `rgba(${color}, 0)`);
                            
                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
                            ctx.fillStyle = radGrad;
                            ctx.fill();

                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, rad * 0.8, 0, Math.PI * 2);
                            ctx.strokeStyle = `rgba(${color}, ${isLatex ? 0.22 : 0.15})`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();

                            ctx.fillStyle = isLatex ? `rgba(${color}, 0.95)` : `rgba(${color}, 0.85)`;
                            ctx.font = 'bold 6.5px monospace';
                            ctx.fillText(`${item.name.toUpperCase()} : ${item.val}`, pt.x + 8, pt.y + 3);
                        }
                    });
                }

                // 3. Volumetric "Ghost Architecture" (Translucent wireframes)
                if (isGhostArchitectureEnabled && frameData.nodes) {
                    frameData.nodes.forEach(node => {
                        const pt = getScreenCoords(node.lat, node.lng);
                        if (pt) {
                            const r = 14;
                            const pillarHeight = 35;

                            const drawHexagon = (cx: number, cy: number, radius: number) => {
                                ctx.beginPath();
                                for (let s = 0; s < 6; s++) {
                                    const angle = (s * Math.PI) / 3;
                                    const hx = cx + Math.cos(angle) * radius;
                                    const hy = cy + Math.sin(angle) * radius;
                                    if (s === 0) ctx.moveTo(hx, hy);
                                    else ctx.lineTo(hx, hy);
                                }
                                ctx.closePath();
                            };

                            ctx.strokeStyle = isLatex ? 'rgba(140, 29, 29, 0.65)' : 'rgba(245, 158, 11, 0.5)';
                            ctx.lineWidth = 1;
                            drawHexagon(pt.x, pt.y, r);
                            ctx.stroke();

                            drawHexagon(pt.x, pt.y, r * 0.7);
                            ctx.strokeStyle = isLatex ? 'rgba(140, 29, 29, 0.35)' : 'rgba(245, 158, 11, 0.25)';
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(pt.x, pt.y);
                            ctx.lineTo(pt.x, pt.y - pillarHeight);
                            const grad = ctx.createLinearGradient(pt.x, pt.y, pt.x, pt.y - pillarHeight);
                            if (isLatex) {
                                grad.addColorStop(0, 'rgba(140, 29, 29, 0.7)');
                                grad.addColorStop(1, 'rgba(140, 29, 29, 0.0)');
                            } else {
                                grad.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
                                grad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
                            }
                            ctx.strokeStyle = grad;
                            ctx.lineWidth = 1.5;
                            ctx.stroke();

                            const pulseRadius = r * (1 + 0.3 * Math.sin(Date.now() / 300));
                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, pulseRadius, 0, Math.PI * 2);
                            ctx.strokeStyle = isLatex ? 'rgba(140, 29, 29, 0.2)' : 'rgba(245, 158, 11, 0.15)';
                            ctx.stroke();

                            ctx.fillStyle = isLatex ? '#1a1a1a' : '#ffffff';
                            ctx.font = 'black 6.5px monospace';
                            ctx.fillText(node.name.toUpperCase(), pt.x - 30, pt.y - pillarHeight - 4);
                        }
                    });
                }

                // 4. Osiris Planetary Real-Time Telemetry & Risk Overlays
                if (isOsirisTelemetryEnabled && Array.isArray(telemetryFeatures)) {
                    telemetryFeatures.forEach(feat => {
                        const [lng, lat] = feat.geometry.coordinates as number[];
                        const pt = getScreenCoords(lat, lng);
                        if (!pt) return;

                        const category = feat.properties.category;
                        const severity = feat.properties.severity;
                        const title = feat.properties.title;
                        const metadata = feat.properties.metadata || {};

                        if (category === 'sdk_air') {
                            // Dynamic rotated aircraft chevron & trails
                            const heading = metadata.heading !== undefined ? metadata.heading : 90;
                            const angleRad = (heading - 90) * Math.PI / 180;
                            const dx = Math.cos(angleRad);
                            const dy = Math.sin(angleRad);
                            const tx = pt.x - dx * 24;
                            const ty = pt.y - dy * 24;

                            const grad = ctx.createLinearGradient(pt.x, pt.y, tx, ty);
                            if (isLatex) {
                                grad.addColorStop(0, 'rgba(26, 37, 85, 0.75)');
                                grad.addColorStop(1, 'rgba(26, 37, 85, 0)');
                            } else {
                                grad.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
                                grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
                            }
                            ctx.beginPath();
                            ctx.moveTo(pt.x, pt.y);
                            ctx.lineTo(tx, ty);
                            ctx.strokeStyle = grad;
                            ctx.lineWidth = 1.75;
                            ctx.stroke();

                            ctx.save();
                            ctx.translate(pt.x, pt.y);
                            ctx.rotate(angleRad);
                            ctx.beginPath();
                            ctx.moveTo(5, 0);
                            ctx.lineTo(-5, -3.5);
                            ctx.lineTo(-2.5, 0);
                            ctx.lineTo(-5, 3.5);
                            ctx.closePath();
                            ctx.fillStyle = isLatex ? '#1a2555' : '#f59e0b';
                            if (!isLatex) {
                                ctx.shadowColor = '#f59e0b';
                                        ctx.shadowBlur = 5;
                            }
                            ctx.fill();
                            ctx.strokeStyle = isLatex ? '#faf9f0' : '#ffffff';
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                            ctx.restore();

                            ctx.fillStyle = isLatex ? 'rgba(26, 37, 85, 0.95)' : 'rgba(245, 158, 11, 0.9)';
                            ctx.font = 'bold 6.5px monospace';
                            ctx.fillText(`${metadata.callsign || 'FLIGHT'} | ${metadata.altitude || 30000}FT`, pt.x + 8, pt.y - 3);
                        } else if (category === 'sdk_sea' || category === 'sdk_naval') {
                            // Indigo/purple vessel vectors & slow dynamic halo
                            const isNaval = category === 'sdk_naval';
                            const pulse = (Date.now() % 2200) / 2200;
                            const color = isLatex
                                ? (isNaval ? '76, 29, 149' : '30, 58, 138')
                                : (isNaval ? '168, 85, 247' : '99, 102, 241');
                            
                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, 4 + pulse * 12, 0, Math.PI * 2);
                            ctx.strokeStyle = `rgba(${color}, ${1 - pulse})`;
                            ctx.lineWidth = 0.75;
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(pt.x, pt.y - 4);
                            ctx.lineTo(pt.x + 3, pt.y + 3);
                            ctx.lineTo(pt.x - 3, pt.y + 3);
                            ctx.closePath();
                            ctx.fillStyle = isLatex 
                                ? (isNaval ? '#4c1d95' : '#1e3a8a') 
                                : (isNaval ? '#a855f7' : '#6366f1');
                            if (!isLatex) {
                                ctx.shadowColor = isNaval ? '#a855f7' : '#6366f1';
                                ctx.shadowBlur = 4;
                            }
                            ctx.fill();
                            ctx.strokeStyle = isLatex ? '#faf9f0' : '#ffffff';
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                            ctx.shadowBlur = 0;

                            ctx.fillStyle = isLatex ? '#48443c' : 'rgba(156, 163, 175, 0.85)';
                            ctx.font = '6px monospace';
                            ctx.fillText(metadata.vesselName || title, pt.x + 6, pt.y + 6);
                        } else if (category === 'wildfire') {
                            // Pulsing glassmorphic red wildfire halo with radial blur and dual dashed bounds
                            const pulse = 1 + 0.12 * Math.sin(Date.now() / 250);
                            const rad = 22 * pulse;
                            const rColor = isLatex ? '140, 29, 29' : '239, 68, 68';

                            const radGrad = ctx.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, rad);
                            radGrad.addColorStop(0, `rgba(${rColor}, 0.45)`);
                            radGrad.addColorStop(0.5, `rgba(${rColor}, 0.15)`);
                            radGrad.addColorStop(1, `rgba(${rColor}, 0)`);

                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
                            ctx.fillStyle = radGrad;
                            ctx.fill();

                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
                            ctx.strokeStyle = `rgba(${rColor}, 0.75)`;
                            ctx.lineWidth = 1.25;
                            ctx.stroke();
                            ctx.fillStyle = `rgba(${rColor}, 0.15)`;
                            ctx.fill();

                            ctx.save();
                            ctx.setLineDash([3, 3]);
                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, rad * 0.75, 0, Math.PI * 2);
                            ctx.strokeStyle = `rgba(${rColor}, 0.3)`;
                            ctx.lineWidth = 0.75;
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, rad * 1.1, 0, Math.PI * 2);
                            ctx.strokeStyle = `rgba(${rColor}, 0.12)`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                            ctx.restore();

                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
                            ctx.fillStyle = isLatex ? '#8c1d1d' : '#ffffff';
                            if (!isLatex) {
                                ctx.shadowColor = '#ef4444';
                                ctx.shadowBlur = 6;
                            }
                            ctx.fill();
                            ctx.shadowBlur = 0;

                            ctx.fillStyle = isLatex ? '#8c1d1d' : '#ef4444';
                            ctx.font = 'bold 6.5px monospace';
                            ctx.fillText(`WILDFIRE: ${metadata.fireRadiativePowerMw || 25}MW`, pt.x + 9, pt.y - 3);
                        } else if (category === 'earthquakes') {
                            // Amber concentric seismic ripples scaling with magnitude
                            const mag = metadata.magnitude || feat.properties.intensity || 3.5;
                            const maxRadius = mag * 11;
                            const numRings = 3;
                            const cycle = (Date.now() % 1400) / 1400;
                            const eColor = isLatex ? '194, 114, 10' : '245, 158, 11';

                            for (let i = 0; i < numRings; i++) {
                                const ringProgress = (cycle + i / numRings) % 1;
                                const r = maxRadius * ringProgress;
                                const alpha = 1 - ringProgress;

                                ctx.beginPath();
                                ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
                                ctx.strokeStyle = `rgba(${eColor}, ${alpha * 0.65})`;
                                ctx.lineWidth = 0.75;
                                ctx.stroke();
                            }

                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
                            ctx.fillStyle = isLatex ? '#c2720a' : '#f59e0b';
                            if (!isLatex) {
                                ctx.shadowColor = '#f59e0b';
                                ctx.shadowBlur = 4;
                            }
                            ctx.fill();
                            ctx.shadowBlur = 0;

                            ctx.fillStyle = isLatex ? '#c2720a' : '#f59e0b';
                            ctx.font = 'bold 6.5px monospace';
                            ctx.fillText(`M ${mag} EARTHQUAKE`, pt.x + 8, pt.y - 3);
                        } else if (category === 'satellites') {
                            // Gold-amber crosshairs and orbital altitude metadata tag
                            const size = 5;
                            const sColor = isLatex ? '194, 114, 10' : '245, 158, 11';
                            ctx.beginPath();
                            ctx.moveTo(pt.x - size, pt.y);
                            ctx.lineTo(pt.x + size, pt.y);
                            ctx.moveTo(pt.x, pt.y - size);
                            ctx.lineTo(pt.x, pt.y + size);
                            ctx.strokeStyle = `rgba(${sColor}, 0.75)`;
                            ctx.lineWidth = 0.75;
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, size * 0.6, 0, Math.PI * 2);
                            ctx.strokeStyle = `rgba(${sColor}, 0.45)`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();

                            ctx.fillStyle = isLatex ? 'rgba(194, 114, 10, 0.95)' : 'rgba(245, 158, 11, 0.9)';
                            ctx.font = 'bold 6px monospace';
                            ctx.fillText(`${title} [${metadata.altitudeKm || 400}KM]`, pt.x + 7, pt.y + 2);
                        } else if (category === 'cctv') {
                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
                            ctx.fillStyle = isLatex ? '#c2720a' : '#ea580c';
                            if (!isLatex) {
                                ctx.shadowColor = '#ea580c';
                                ctx.shadowBlur = 3;
                            }
                            ctx.fill();
                            ctx.shadowBlur = 0;

                            ctx.fillStyle = isLatex ? 'rgba(194, 114, 10, 0.95)' : 'rgba(234, 88, 12, 0.85)';
                            ctx.font = '6px monospace';
                            ctx.fillText(`CCTV: ${title}`, pt.x + 5, pt.y + 2);
                        } else if (category === 'news_intel' || category === 'live_news' || category === 'global_incidents') {
                            const color = severity === 'CRITICAL' || severity === 'HIGH' 
                                ? (isLatex ? '#8c1d1d' : '#ef4444') 
                                : (isLatex ? '#c2720a' : '#f59e0b');
                            ctx.beginPath();
                            ctx.moveTo(pt.x, pt.y - 3.5);
                            ctx.lineTo(pt.x + 3.5, pt.y + 3);
                            ctx.lineTo(pt.x - 3.5, pt.y + 3);
                            ctx.closePath();
                            ctx.fillStyle = color;
                            if (!isLatex) {
                                ctx.shadowColor = color;
                                ctx.shadowBlur = 4;
                            }
                            ctx.fill();
                            ctx.shadowBlur = 0;

                            ctx.fillStyle = color;
                            ctx.font = 'bold 6px monospace';
                            ctx.fillText(`WARN: ${title}`, pt.x + 6, pt.y + 2);
                        }
                    });
                }
            }

            particleRafRef.current = requestAnimationFrame(animateParticles);
        };

        animateParticles();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (particleRafRef.current !== null) {
                cancelAnimationFrame(particleRafRef.current);
            }
        };
    }, [isLoaded]);

    // Separate effect for layer overlays — updates when layers change without re-creating the map
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isLoaded) return;

        const addLayers = async () => {
            try {
                // Use the globally injected google object to ensure we use the proxy-loaded library
                let Circle, Polyline;
                if ((window as any).google.maps.importLibrary) {
                    const mapsLib = await (window as any).google.maps.importLibrary('maps');
                    Circle = mapsLib.Circle;
                    Polyline = mapsLib.Polyline;
                } else {
                    Circle = (window as any).google.maps.Circle;
                    Polyline = (window as any).google.maps.Polyline;
                }
                const SymbolPath = (window as any).google?.maps?.SymbolPath;

                // Use AdvancedMarkerElement if available, else legacy Marker
                let AdvancedMarkerElement: any = null;
                try {
                    if ((window as any).google.maps.importLibrary) {
                        const markerLib = await (window as any).google.maps.importLibrary('marker');
                        AdvancedMarkerElement = markerLib.AdvancedMarkerElement;
                    }
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
                            geodesic: true, strokeColor: '#f59e0b',
                            strokeOpacity: 0.6, strokeWeight: 3, map
                        });
                    }

                    const placeMarker = (position: any, color: string) => {
                        const MarkerClass = AdvancedMarkerElement || (window as any).google?.maps?.marker?.AdvancedMarkerElement;
                        if (MarkerClass) {
                            const pin = document.createElement('div');
                            pin.style.cssText = `width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color};`;
                            new MarkerClass({ position, map, content: pin });
                        } else {
                            console.warn('[SovereignMap] AdvancedMarkerElement not available, skipping marker render.');
                        }
                    };

                    if (layer.type === 'INSTITUTION' && Array.isArray(layer.data)) {
                        layer.data.forEach((inst: any) => placeMarker(inst.coords, '#f59e0b'));
                    }
                    if (layer.type === 'PROPOSAL' && Array.isArray(layer.data)) {
                        layer.data.forEach((prop: any) => placeMarker(prop.coords, '#ea580c'));
                    }
                });
            } catch (e) { /* layer render failure is non-fatal */ }
        };

        addLayers();
    }, [layers, isLoaded]); // Layer effect runs when layers update — map is already stable

    const convertLatLngToSVG = (lat: number, lng: number) => {
        const x = (lng + 180) * (1000 / 360);
        const y = (90 - lat) * (500 / 180);
        return { x, y };
    };

    const getThemeColor = () => {
        if (themeState?.theme === 'theme-latex') return '#8c1d1d';
        const refFrame = activePOI?.referenceFrame || 'EARTH';
        if (refFrame === 'LUNA') return '#a1a1aa';
        if (refFrame === 'MARS') return '#f97316';
        return '#f59e0b';
    };

    const getBgColor = () => {
        if (themeState?.theme === 'theme-latex') return '#fdfcf7';
        const refFrame = activePOI?.referenceFrame || 'EARTH';
        if (refFrame === 'LUNA') return '#09090b';
        if (refFrame === 'MARS') return '#1c0d0a';
        return '#030712';
    };

    const handleCitadelClick = (node: any) => {
        lastCentered2DPOIKeyRef.current = null;
        lastCentered3DPOIKeyRef.current = null;
        const hashVal = Math.abs(Math.sin(node.lat * 12.9898 + node.lng * 78.233)) * 43758.5453;
        const solar = Math.floor(55 + (hashVal % 45));
        const wind = Math.floor(15 + ((hashVal * 1.5) % 75));
        const water = Math.floor(5 + ((hashVal * 2.3) % 90));
        const zoning = Math.floor(20 + ((hashVal * 3.7) % 80));
        const mockOwnerName = `Citizen ${Math.floor(100 + (hashVal % 900))}`;
        const mockOwnerDid = `did:sovereign:citizen:0x${Math.floor(hashVal).toString(16).substring(0, 16)}`;
        const mockStaked = Math.floor(4000 + (hashVal % 28000));
        
        const updatedPOI: POIDetails = {
            name: node.name,
            formattedAddress: `Lat: ${node.lat.toFixed(4)}, Lng: ${node.lng.toFixed(4)}`,
            coordinates: { lat: node.lat, lng: node.lng, alt: 100 },
            referenceFrame: activePOI?.referenceFrame || 'EARTH',
            ownership: {
                ownerDid: mockOwnerDid,
                ownerName: mockOwnerName,
                stakedSovereignUnits: mockStaked
            },
            publicPlans: `Offline Substrate Secure Telemetry. Node ${node.name} is fully operational under local encrypted caching.`,
            metrics: { solar, wind, water, zoning }
        };
        setActivePOI(updatedPOI);
    };

    const renderOfflineSubstrateMap = () => {
        const refFrame = activePOI?.referenceFrame || 'EARTH';
        const activeWorldData = ON_WORLD_DATA[refFrame as keyof typeof ON_WORLD_DATA] || ON_WORLD_DATA.EARTH;
        const themeColor = getThemeColor();
        const bgColor = getBgColor();

        // Coordinate grids
        const gridLines: React.ReactNode[] = [];
        // Horizontal lines (Latitude)
        for (let lat = -60; lat <= 60; lat += 30) {
            const { y } = convertLatLngToSVG(lat, 0);
            gridLines.push(
                <g key={`lat-${lat}`}>
                    <line x1="0" y1={y} x2="1000" y2={y} stroke={themeColor} strokeOpacity={0.15} strokeDasharray="5,5" vectorEffect="non-scaling-stroke" />
                    <text x="10" y={y - 4} fill={themeColor} fillOpacity="0.4" className="font-mono text-[8px]">{lat}°</text>
                </g>
            );
        }
        // Vertical lines (Longitude)
        for (let lng = -135; lng <= 135; lng += 45) {
            const { x } = convertLatLngToSVG(0, lng);
            gridLines.push(
                <g key={`lng-${lng}`}>
                    <line x1={x} y1="0" x2={x} y2="500" stroke={themeColor} strokeOpacity={0.15} strokeDasharray="5,5" vectorEffect="non-scaling-stroke" />
                    <text x={x + 4} y="490" fill={themeColor} fillOpacity="0.4" className="font-mono text-[8px]">{lng}°</text>
                </g>
            );
        }

        return (
            <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center font-mono ${
                themeState?.theme === 'theme-latex' ? 'bg-[#fdfcf7]' : 'bg-black'
            }`}>
                {/* SVG viewbox */}
                <svg 
                    viewBox="0 0 1000 500" 
                    className={`w-full h-full select-none ${isOfflineDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    style={{ backgroundColor: bgColor }}
                    onMouseDown={handleOfflineMouseDown}
                    onMouseMove={handleOfflineMouseMove}
                    onMouseUp={handleOfflineMouseUp}
                    onMouseLeave={handleOfflineMouseLeave}
                    onWheel={handleOfflineWheel}
                    onTouchStart={handleOfflineTouchStart}
                    onTouchMove={handleOfflineTouchMove}
                    onTouchEnd={handleOfflineTouchEnd}
                >
                    <defs>
                        <filter id="glow-offline" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <radialGradient id="heatmap-grad-earth" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="heatmap-grad-luna" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#a1a1aa" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#a1a1aa" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#a1a1aa" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="heatmap-grad-mars" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#f97316" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Transform Group wrapping all inner map elements */}
                    <g transform={`translate(${offlinePan.x}, ${offlinePan.y}) scale(${offlineZoom})`}>
                        {/* Background Grids */}
                        {gridLines}

                        {/* Heatmaps */}
                        {activeWorldData.heatmaps.map((hm, idx) => {
                            const { x, y } = convertLatLngToSVG(hm.lat, hm.lng);
                            const gradId = `heatmap-grad-${refFrame.toLowerCase()}`;
                            return (
                                <g key={`hm-${idx}`} className="opacity-70">
                                    <circle 
                                        cx={x} 
                                        cy={y} 
                                        r={60 * hm.intensity} 
                                        fill={`url(#${gradId})`} 
                                    />
                                    <circle 
                                        cx={x} 
                                        cy={y} 
                                        r="2" 
                                        fill={themeColor} 
                                        opacity="0.6" 
                                    />
                                    <text 
                                        x={x + 6} 
                                        y={y + 3} 
                                        fill={themeColor} 
                                        fillOpacity="0.6" 
                                        className="text-[7px] font-mono font-bold"
                                    >
                                        {hm.name} ({hm.val})
                                    </text>
                                </g>
                            );
                        })}

                        {/* Arcs (Curved Bezier Paths) */}
                        {activeWorldData.arcs.map((arc, idx) => {
                            const p1 = convertLatLngToSVG(arc.from.lat, arc.from.lng);
                            const p2 = convertLatLngToSVG(arc.to.lat, arc.to.lng);
                            const cx = (p1.x + p2.x) / 2;
                            const cy = Math.min(p1.y, p2.y) - 60; // Curve upward

                            const pathD = `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`;

                            return (
                                <g key={`arc-${idx}`}>
                                    {/* The curved path */}
                                    <path 
                                        d={pathD} 
                                        fill="none" 
                                        stroke={themeColor} 
                                        strokeWidth="1.5" 
                                        strokeOpacity="0.3" 
                                        strokeDasharray="4,4" 
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Packet Animating along path */}
                                    <circle r="3" fill={themeColor} filter="url(#glow-offline)">
                                        <animateMotion 
                                            dur="4s" 
                                            repeatCount="indefinite" 
                                            path={pathD} 
                                        />
                                    </circle>
                                    {/* Text label at midpoint */}
                                    <text 
                                        x={cx} 
                                        y={cy + 15} 
                                        textAnchor="middle" 
                                        fill={themeColor} 
                                        fillOpacity="0.5" 
                                        className="text-[7px]"
                                    >
                                        {arc.label}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Citadel Nodes */}
                        {activeWorldData.nodes.map((node, idx) => {
                            const { x, y } = convertLatLngToSVG(node.lat, node.lng);
                            const isActive = activePOI?.name === node.name;

                            return (
                                <g 
                                    key={`node-${idx}`} 
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (!offlineDragMovedRef.current) {
                                            handleCitadelClick(node);
                                        }
                                    }}
                                >
                                    {/* Pulsing outer circle */}
                                    <circle 
                                        cx={x} 
                                        cy={y} 
                                        r={isActive ? 14 : 9} 
                                        fill="none" 
                                        stroke={themeColor} 
                                        strokeWidth={isActive ? 2 : 1} 
                                        strokeOpacity={isActive ? 0.9 : 0.5}
                                        vectorEffect="non-scaling-stroke"
                                    >
                                        <animate 
                                            attributeName="r" 
                                            values={isActive ? "10;18;10" : "6;12;6"} 
                                            dur="3s" 
                                            repeatCount="indefinite" 
                                        />
                                    </circle>
                                    {/* Core circle */}
                                    <circle 
                                        cx={x} 
                                        cy={y} 
                                        r="4" 
                                        fill={themeColor} 
                                        filter="url(#glow-offline)" 
                                    />
                                    {/* Label */}
                                    <text 
                                        x={x} 
                                        y={y - 14} 
                                        textAnchor="middle" 
                                        fill={isActive ? "#ffffff" : themeColor} 
                                        fontWeight={isActive ? "bold" : "normal"}
                                        className="text-[8px]"
                                    >
                                        {node.name.toUpperCase()}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>

                {/* Top Overlay Badge */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-500">
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border bg-red-500/10 border-red-500/30 text-red-400 backdrop-blur-md font-mono text-[9px] uppercase tracking-wider shadow-2xl animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span className="font-bold">OFFLINE SUBSTRATE FALLBACK (SECURE CACHE SECURED)</span>
                    </div>
                </div>

                {geoFallbackAlert && (
                    <div className="absolute top-24 left-6 z-30 pointer-events-none transition-all duration-1000 ease-out animate-pulse">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-amber-500/20 bg-amber-500/[0.03] backdrop-blur-sm text-amber-500/60 font-mono text-[8px] uppercase tracking-widest shadow-lg">
                            <span className="w-1 h-1 rounded-full bg-amber-500/60 animate-ping" />
                            <span>{geoFallbackAlert}</span>
                        </div>
                    </div>
                )}

                {/* Info HUD */}
                <div className="absolute bottom-6 left-6 z-10 bg-black/90 border border-white/10 rounded-lg p-3 font-mono text-[9px] text-zinc-400 select-none w-56 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
                    <div className="text-[8px] font-black text-red-400 tracking-widest uppercase pb-1.5 border-b border-white/5 flex items-center justify-between">
                        <span>LOCAL CACHED TELEMETRY</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    </div>
                    <div className="space-y-1.5 pt-1.5">
                        <div className="flex justify-between">
                            <span>CELESTIAL</span>
                            <span className="text-white font-bold">{refFrame}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>ACTIVE POI</span>
                            <span className="text-white truncate max-w-[120px]" title={activePOI?.name || 'NONE'}>
                                {activePOI?.name?.toUpperCase() || 'NONE'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>LATITUDE</span>
                            <span className="text-white">{activePOI?.coordinates?.lat.toFixed(4) || '0.0000'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>LONGITUDE</span>
                            <span className="text-white">{activePOI?.coordinates?.lng.toFixed(4) || '0.0000'}</span>
                        </div>
                        <button 
                            onClick={handleResetOfflineViewport}
                            className="mt-3 w-full py-1.5 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded text-red-400 font-bold transition-all text-center tracking-wider text-[8px]"
                        >
                            RESET VIEWPORT
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (isOfflineSubstrateMode) {
        return renderOfflineSubstrateMap();
    }

    const show3D = is3DActive && is3DReady;

    return (
        <div className={`relative w-full h-full overflow-hidden ${
            themeState?.theme === 'theme-latex' ? 'bg-[#fdfcf7]' : 'bg-black'
        }`}>
            {/* Custom scoped style overrides to enforce theme inversion at the child/image/canvas element level */}
            <style dangerouslySetInnerHTML={{ __html: `
                .sovereign-map-viewport img,
                .sovereign-map-viewport canvas,
                .sovereign-map-3d img,
                .sovereign-map-3d canvas {
                    filter: var(--map-theme-filter) !important;
                    will-change: filter;
                }
                .sovereign-map-viewport,
                .sovereign-map-3d,
                .sovereign-map-viewport iframe,
                .sovereign-map-3d iframe,
                .sovereign-map-viewport [class*="gm-style"],
                .sovereign-map-3d [class*="gm-style"],
                .gm-style,
                .gm-style-cc,
                .gm-style > div,
                gmp-map-3d {
                    background-color: ${themeState?.theme === 'theme-latex' ? '#fdfcf7' : '#000000'} !important;
                    background: ${themeState?.theme === 'theme-latex' ? '#fdfcf7' : '#000000'} !important;
                }
            `}} />

            {geoFallbackAlert && (
                <div className="absolute top-24 left-6 z-30 pointer-events-none transition-all duration-1000 ease-out animate-pulse">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-amber-500/20 bg-amber-500/[0.03] backdrop-blur-sm text-amber-500/60 font-mono text-[8px] uppercase tracking-widest shadow-lg">
                        <span className="w-1 h-1 rounded-full bg-amber-500/60 animate-ping" />
                        <span>{geoFallbackAlert}</span>
                    </div>
                </div>
            )}

            {/* Centered Glassmorphic Loading / Fallback Badge */}
            {(is3DLoading || fallbackNotice) && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-500 ease-out">
                    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-full border backdrop-blur-md font-mono text-[9px] uppercase tracking-wider shadow-2xl transition-all duration-300 ${
                        fallbackNotice ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}>
                        {is3DLoading ? (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                <span className="font-bold text-amber-400">INITIALIZING PHOTOREALISTIC 3D TILES...</span>
                            </>
                        ) : (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                <span className="font-bold text-red-400">{fallbackNotice}</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Dual Substrate Map Viewports */}
            <div 
                ref={mapRef} 
                style={{ 
                    ['--map-theme-filter' as any]: getThemeFilter()
                }}
                className={`absolute inset-0 w-full h-full sovereign-map-viewport transition-opacity duration-500 ${show3D ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
            />
            <div 
                ref={map3DRef} 
                style={{ 
                    ['--map-theme-filter' as any]: getThemeFilter()
                }}
                className={`absolute inset-0 w-full h-full sovereign-map-3d transition-opacity duration-500 ${show3D ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
            />
            
            {/* Ambient Data Stream Overlay */}
            <canvas 
                ref={canvasRef} 
                className={`absolute inset-0 w-full h-full pointer-events-none opacity-60 z-10 transition-all duration-500 ${
                    themeState?.theme === 'theme-latex' ? 'mix-blend-multiply' : 'mix-blend-screen'
                }`} 
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
