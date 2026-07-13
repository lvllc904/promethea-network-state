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

const CELESTIAL_BOUNDARIES = {
    EARTH: [
        // North America
        [
            { lat: 70, lng: -160 }, { lat: 75, lng: -140 }, { lat: 70, lng: -100 }, { lat: 75, lng: -80 },
            { lat: 60, lng: -60 }, { lat: 45, lng: -60 }, { lat: 40, lng: -74 }, { lat: 30, lng: -80 },
            { lat: 25, lng: -80 }, { lat: 25, lng: -82 }, { lat: 29, lng: -84 }, { lat: 27, lng: -90 },
            { lat: 20, lng: -97 }, { lat: 15, lng: -95 }, { lat: 8, lng: -80 }, { lat: 10, lng: -85 },
            { lat: 16, lng: -95 }, { lat: 20, lng: -105 }, { lat: 25, lng: -110 }, { lat: 34, lng: -120 },
            { lat: 45, lng: -125 }, { lat: 55, lng: -135 }, { lat: 60, lng: -145 }, { lat: 60, lng: -165 }
        ],
        // South America
        [
            { lat: 8, lng: -80 }, { lat: 10, lng: -72 }, { lat: 5, lng: -55 }, { lat: -5, lng: -35 },
            { lat: -10, lng: -35 }, { lat: -23, lng: -43 }, { lat: -35, lng: -55 }, { lat: -55, lng: -68 },
            { lat: -55, lng: -73 }, { lat: -45, lng: -74 }, { lat: -30, lng: -72 }, { lat: -15, lng: -75 },
            { lat: -5, lng: -81 }, { lat: 5, lng: -77 }
        ],
        // Eurasia
        [
            { lat: 75, lng: 10 }, { lat: 77, lng: 30 }, { lat: 75, lng: 60 }, { lat: 75, lng: 90 },
            { lat: 75, lng: 120 }, { lat: 70, lng: 160 }, { lat: 60, lng: 170 }, { lat: 50, lng: 140 },
            { lat: 35, lng: 140 }, { lat: 35, lng: 120 }, { lat: 22, lng: 115 }, { lat: 15, lng: 110 },
            { lat: 10, lng: 105 }, { lat: 5, lng: 100 }, { lat: 10, lng: 95 }, { lat: 15, lng: 90 },
            { lat: 10, lng: 80 }, { lat: 20, lng: 70 }, { lat: 25, lng: 60 }, { lat: 12, lng: 45 },
            { lat: 25, lng: 35 }, { lat: 35, lng: 35 }, { lat: 35, lng: 25 }, { lat: 30, lng: 10 },
            { lat: 35, lng: -10 }, { lat: 45, lng: -10 }, { lat: 50, lng: -5 }, { lat: 55, lng: 5 },
            { lat: 60, lng: 5 }, { lat: 65, lng: 15 }
        ],
        // Africa
        [
            { lat: 35, lng: -5 }, { lat: 37, lng: 10 }, { lat: 32, lng: 30 }, { lat: 30, lng: 32 },
            { lat: 12, lng: 43 }, { lat: 5, lng: 50 }, { lat: -15, lng: 40 }, { lat: -34, lng: 20 },
            { lat: -30, lng: 15 }, { lat: -10, lng: 12 }, { lat: 5, lng: 10 }, { lat: 5, lng: -10 },
            { lat: 15, lng: -17 }, { lat: 30, lng: -10 }
        ],
        // Australia
        [
            { lat: -12, lng: 130 }, { lat: -10, lng: 142 }, { lat: -25, lng: 153 }, { lat: -38, lng: 150 },
            { lat: -35, lng: 115 }, { lat: -22, lng: 113 }, { lat: -15, lng: 120 }
        ],
        // Greenland
        [
            { lat: 80, lng: -60 }, { lat: 83, lng: -40 }, { lat: 80, lng: -20 }, { lat: 70, lng: -20 },
            { lat: 60, lng: -45 }, { lat: 70, lng: -60 }
        ],
        // Japan
        [
            { lat: 45, lng: 142 }, { lat: 40, lng: 140 }, { lat: 35, lng: 135 }, { lat: 31, lng: 130 },
            { lat: 34, lng: 132 }, { lat: 38, lng: 138 }
        ]
    ],
    LUNA: [
        // Lunar Maria as circular/polygonal craters/regions
        [
            { lat: 20, lng: -20 }, { lat: 30, lng: -10 }, { lat: 25, lng: 10 }, { lat: 15, lng: 20 },
            { lat: 5, lng: 15 }, { lat: 0, lng: -5 }, { lat: 10, lng: -25 }
        ], // Mare Imbrium
        [
            { lat: -10, lng: -40 }, { lat: -5, lng: -30 }, { lat: -15, lng: -15 }, { lat: -25, lng: -25 },
            { lat: -20, lng: -45 }
        ], // Mare Nubium
        [
            { lat: 10, lng: 30 }, { lat: 15, lng: 45 }, { lat: 5, lng: 55 }, { lat: -5, lng: 50 },
            { lat: -2, lng: 35 }
        ], // Mare Tranquillitatis
        [
            { lat: -60, lng: -10 }, { lat: -55, lng: 10 }, { lat: -65, lng: 15 }, { lat: -70, lng: -5 }
        ] // Clavius Basin
    ],
    MARS: [
        // Martian topography: Elysium, Olympus, Hellas, Argyre
        [
            { lat: 15, lng: -135 }, { lat: 25, lng: -125 }, { lat: 20, lng: -115 }, { lat: 10, lng: -120 },
            { lat: 12, lng: -130 }
        ], // Olympus Mons
        [
            { lat: -5, lng: -80 }, { lat: 0, lng: -50 }, { lat: -15, lng: -45 }, { lat: -20, lng: -75 }
        ], // Valles Marineris
        [
            { lat: -45, lng: 70 }, { lat: -35, lng: 80 }, { lat: -40, lng: 95 }, { lat: -50, lng: 90 },
            { lat: -52, lng: 75 }
        ], // Hellas Planitia
        [
            { lat: -55, lng: -45 }, { lat: -45, lng: -35 }, { lat: -48, lng: -25 }, { lat: -58, lng: -30 }
        ] // Argyre Planitia
    ]
};

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
    const [isMapTilesLoaded, setIsMapTilesLoaded] = useState(false);

    const activePOIRef = useRef<POIDetails | null>(activePOI);
    useEffect(() => {
        activePOIRef.current = activePOI;
    }, [activePOI]);

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
    const offlineDragStartCoordsRef = useRef({ x: 0, y: 0 });
    const lastTouchDistRef = useRef<number | null>(null);

    const handleResetOfflineViewport = () => {
        setOfflinePan({ x: 0, y: 0 });
        setOfflineZoom(1);
    };

    useEffect(() => {
        const handleResetEvent = () => {
            setOfflinePan({ x: 0, y: 0 });
            setOfflineZoom(1);
        };
        window.addEventListener('reset-offline-viewport', handleResetEvent);
        return () => window.removeEventListener('reset-offline-viewport', handleResetEvent);
    }, []);

    const handleOfflineMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        if (e.button !== 0) return; // Only left click drags
        setIsOfflineDragging(true);
        setOfflineDragStart({ x: e.clientX - offlinePan.x, y: e.clientY - offlinePan.y });
        offlineDragStartCoordsRef.current = { x: e.clientX, y: e.clientY };
        offlineDragMovedRef.current = false;
    };

    const handleOfflineMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!isOfflineDragging) return;
        const newX = e.clientX - offlineDragStart.x;
        const newY = e.clientY - offlineDragStart.y;
        
        const totalDx = e.clientX - offlineDragStartCoordsRef.current.x;
        const totalDy = e.clientY - offlineDragStartCoordsRef.current.y;
        const totalDisplacement = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
        
        if (totalDisplacement > 5) {
            offlineDragMovedRef.current = true;
        }
        setOfflinePan({ x: newX, y: newY });
    };

    const handleOfflineMouseUp = () => {
        setIsOfflineDragging(false);
        // Delay resetting the drag flag to allow onClick bubble events to resolve cleanly first
        setTimeout(() => {
            offlineDragMovedRef.current = false;
        }, 50);
    };

    const handleOfflineMouseLeave = () => {
        setIsOfflineDragging(false);
        setTimeout(() => {
            offlineDragMovedRef.current = false;
        }, 50);
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
            offlineDragStartCoordsRef.current = { x: touch.clientX, y: touch.clientY };
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
            
            const totalDx = touch.clientX - offlineDragStartCoordsRef.current.x;
            const totalDy = touch.clientY - offlineDragStartCoordsRef.current.y;
            const totalDisplacement = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
            
            if (totalDisplacement > 5) {
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
        setTimeout(() => {
            offlineDragMovedRef.current = false;
        }, 50);
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

    // Detect Google Maps failure by intercepting window.gm_authFailure, custom events, and global script load errors
    useEffect(() => {
        const handleAuthFailure = (reason?: string) => {
            console.warn(`[SovereignMap] Google Maps failure detected (${reason || 'AUTH_FAILURE'}). Activating Offline Substrate fallback.`);
            setIsOfflineSubstrateMode(true);
            setError(reason === 'SCRIPT_ERROR' ? 'API ACCESS BLOCKED / SCRIPT ERROR' : 'API AUTHORIZATION FAILURE');
        };

        if (typeof window !== 'undefined') {
            // Clear any stale error state from previous hot-reload cycles or failed sessions
            // This prevents a single past failure from permanently blocking the map on refresh
            const preloadError = (window as any).__googleMapsLoadError;
            if (preloadError) {
                console.warn('[SovereignMap] Found stale __googleMapsLoadError:', preloadError, '— clearing and retrying fresh.');
                delete (window as any).__googleMapsLoadError;
                // Only activate offline mode if it's a definitive auth failure, not a stale reload artifact
                // Auth failures will be caught again by gm_authFailure if they're real
            }

            // 2. Bind to global custom event
            const onAuthFailureEvent = (e: Event) => {
                const errType = (window as any).__googleMapsLoadError || 'AUTH_FAILURE';
                handleAuthFailure(errType);
            };
            window.addEventListener('google-maps-auth-failure', onAuthFailureEvent);

            // 3. Bind to window.gm_authFailure hook in case it fires later
            const existingAuthFailure = (window as any).gm_authFailure;
            (window as any).gm_authFailure = () => {
                if (existingAuthFailure) {
                    try { existingAuthFailure(); } catch (e) {}
                }
                handleAuthFailure('AUTH_FAILURE');
            };

            // 4. Intercept network-level script loading blocks in capturing phase
            const handleGlobalError = (event: ErrorEvent) => {
                const target = event.target as any;
                if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
                    const url = target.src || target.href;
                    if (url && (url.includes('maps.googleapis.com') || url.includes('ggpht.com'))) {
                        console.warn('[SovereignMap] Intercepted network-level block/error for:', url);
                        handleAuthFailure('SCRIPT_ERROR');
                    }
                }
            };
            window.addEventListener('error', handleGlobalError, true);

            // 5. PerformanceObserver to log resource details
            let observer: PerformanceObserver | null = null;
            try {
                if (window.PerformanceObserver) {
                    observer = new PerformanceObserver((list) => {
                        list.getEntries().forEach((entry) => {
                            const res = entry as PerformanceResourceTiming;
                            if (res.name.includes('maps.googleapis.com') || res.name.includes('ggpht.com')) {
                                if (res.duration > 8000) {
                                    console.warn(`[SovereignMap] Google Maps resource took unusually long: ${res.name} (${res.duration}ms)`);
                                }
                            }
                        });
                    });
                    observer.observe({ entryTypes: ['resource'] });
                }
            } catch (e) {
                console.warn('[SovereignMap] PerformanceObserver could not start.', e);
            }

            return () => {
                window.removeEventListener('google-maps-auth-failure', onAuthFailureEvent);
                window.removeEventListener('error', handleGlobalError, true);
                if (observer) observer.disconnect();
            };
        }
    }, []);

    // Universal tile loading watchdog to catch authorization blocks or network freezes
    useEffect(() => {
        if (!isLoaded || isOfflineSubstrateMode || isMapTilesLoaded) return;

        const tileWatchdog = setTimeout(() => {
            if (!isMapTilesLoaded) {
                console.warn('[SovereignMap] Map tiles failed to load within 15s. Falling back to offline substrate.');
                setIsOfflineSubstrateMode(true);
                setError('ATLAS SYNCHRONIZATION TIMEOUT');
            }
        }, 15000);

        return () => clearTimeout(tileWatchdog);
    }, [isLoaded, isOfflineSubstrateMode, isMapTilesLoaded]);


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
                        let attempts = 0;
                        const checkInterval = setInterval(() => {
                            attempts++;
                            if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
                                clearInterval(checkInterval);
                                resolve(true);
                            } else if (attempts >= 300) { // 15 seconds timeout
                                clearInterval(checkInterval);
                                reject(new Error("Preloaded script blocked or timed out"));
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

                    // Only use mapId if it's a real Cloud Console Map ID (not the literal placeholder)
                    const rawMapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || '';
                    const isValidMapId = rawMapId && rawMapId !== 'DEMO_MAP_ID' && rawMapId.length > 4;
                    console.log('[SovereignMap] Map ID check:', { rawMapId, isValidMapId });

                    const mapOptions: any = {
                        center: { lat: startLat, lng: startLng },
                        zoom: startZoom,
                        mapTypeId: 'roadmap',
                        disableDefaultUI: false, // Keep native controls visible for users
                        backgroundColor: '#030712',
                        draggable: true,
                        scrollwheel: true,
                        gestureHandling: 'greedy', // Ensure scroll wheel and touch work
                        isFractionalZoomEnabled: true,
                        // Always apply dark styles when no valid Cloud Map ID is available
                        ...(!isValidMapId ? { styles: EARTH_STYLE } : { mapId: rawMapId }),
                    };
                    
                    hasMapIdRef.current = !!isValidMapId;
                    console.log('[SovereignMap] Creating map with options:', { center: mapOptions.center, zoom: mapOptions.zoom, hasMapId: !!mapOptions.mapId, hasStyles: !!mapOptions.styles });

                    const map = new GoogleMap(mapRef.current, mapOptions);
                    mapInstanceRef.current = map;

                    // Listen for tiles loaded to resolve loading/auth state
                    map.addListener('tilesloaded', () => {
                        console.log('[SovereignMap] ✅ 2D map tiles loaded successfully. Restoring live view.');
                        setIsMapTilesLoaded(true);
                        setIsOfflineSubstrateMode(false);
                        setError(null);
                    });

                    // Diagnostic: listen for projection_changed to confirm map init
                    map.addListener('projection_changed', () => {
                        console.log('[SovereignMap] projection_changed — map engine is alive.');
                    });


                    // Attach spatial click listeners to synchronize both trays dynamically
                    map.addListener('click', async (event: any) => {
                        isUserPanningRef.current = false;
                        lastCentered2DPOIKeyRef.current = null;
                        lastCentered3DPOIKeyRef.current = null;
                        if (event.placeId) {
                            event.stop(); // Prevent standard popup

                             try {
                                const googleObj = (window as any).google;
                                if (googleObj && googleObj.maps) {
                                    const fetchPlaceDetails = async () => {
                                        try {
                                            const { Place } = await googleObj.maps.importLibrary("places");
                                            const place = new Place({ id: event.placeId });
                                            await place.fetchFields({
                                                fields: ['displayName', 'formattedAddress', 'websiteUri', 'rating', 'photos', 'location']
                                            });

                                            if (place.location) {
                                                const lat = place.location.lat();
                                                const lng = place.location.lng();
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
                                                    name: place.displayName || 'Sovereign Point',
                                                    formattedAddress: place.formattedAddress || undefined,
                                                    website: place.websiteUri || `https://${(place.displayName || 'poi').toLowerCase().replace(/[^a-z0-9]/g, '')}.lvhllc.org`,
                                                    rating: place.rating || 4.5,
                                                    photos: place.photos && place.photos.length > 0 ? [place.photos[0].getURI({ maxWidth: 600 })] : undefined,
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
                                                setHUDStateRef.current({ activePillar: 'ATLAS', activeFocusPanel: 'ATLAS' });
                                                if (refFrame === 'EARTH') {
                                                    fetchLiveTelemetry(lat, lng, updatedPOI);
                                                }
                                            }
                                        } catch (innerErr) {
                                            console.error('[SovereignMap] Error fetching Place fields:', innerErr);
                                        }
                                    };
                                    fetchPlaceDetails();
                                }
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
                            setHUDStateRef.current({ activePillar: 'ATLAS', activeFocusPanel: 'ATLAS' });
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
                    setError(err.message || 'Initialization failed');
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

                    let isLibraryLoaded = false;

                    // 15-second library load watchdog to avoid main thread choking and fall back to 2D vector mode gracefully
                    const libraryWatchdog = setTimeout(() => {
                        if (cancelled || isLibraryLoaded) return;
                        console.warn('[SovereignMap] 3D maps3d library import timed out after 15s, falling back to 2D vector mode.');
                        setFallbackNotice('3D ENGINE TIME-OUT. FALLING BACK TO SMOOTH 2D VECTOR SUBSTRATE.');
                        setIs3DLoading(false);
                        
                        // Cancel the pending 3D setup
                        cancelled = true;
                        
                        // Disable 3D Tiles in store to immediately restore 2D responsiveness
                        setHUDState({ is3DTilesEnabled: false });

                        setTimeout(() => {
                            setFallbackNotice(null);
                        }, 4000);
                    }, 15000);

                    const { Map3DElement } = await googleObj.maps.importLibrary('maps3d');
                    isLibraryLoaded = true;
                    clearTimeout(libraryWatchdog);

                    if (cancelled || !map3DRef.current || map3DInstanceRef.current) {
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
                        if (range) {
                            if (range > 6000000 && isUserPanningRef.current) {
                                setHUDStateRef.current({ mapMode: 'INTERSTELLAR' });
                            }
                            if (mapInstanceRef.current) {
                                const map2d = mapInstanceRef.current;
                                const zoom = Math.max(1, Math.min(20, 25 - Math.log2(range)));
                                if (Math.abs(map2d.getZoom() - zoom) > 0.5) {
                                    map2d.setZoom(Math.round(zoom));
                                }
                            }
                        }
                    });

                    // 6-second failure watchdog to roll back to 2D vector mode if 3D Tiles rendering is blocked or failing
                    const failureWatchdog = setTimeout(() => {
                        if (cancelled) return;
                        console.warn('[SovereignMap] 3D tiles rendering failed to stabilize within 6s. Rolling back to 2D...');
                        setFallbackNotice('3D ENGINE NOT SUPPORTED. SEAMLESSLY ROUTING TO 2D VECTOR ENGINE...');
                        setIs3DLoading(false);
                        setIs3DReady(false);
                        setHUDState({ is3DTilesEnabled: false });

                        setTimeout(() => {
                            setFallbackNotice(null);
                        }, 4000);
                    }, 6000);

                    // Google Maps native event listener to resolve loading state once tiles are fully loaded and steady
                    map3d.addEventListener('gmp-steadychange', (event: any) => {
                        if (event.isSteady) {
                            clearTimeout(failureWatchdog);
                            setIs3DLoading(false);
                            setIsMapTilesLoaded(true);
                            setIsOfflineSubstrateMode(false);
                            setError(null);
                        }
                    });

                    map3DRef.current.appendChild(map3d);
                    map3DInstanceRef.current = map3d;
                    setIs3DReady(true);
                } catch (err) {
                    console.error('[SovereignMap] 3D map tile initialization failed:', err);
                    setFallbackNotice('3D INITIALIZATION FAILED. ROUTING TO 2D ENGINE.');
                    setIs3DLoading(false);
                    setIs3DReady(false);
                    setHUDState({ is3DTilesEnabled: false });
                    setTimeout(() => {
                        setFallbackNotice(null);
                    }, 4000);
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

                    const placeMarker = (item: any, color: string, isProposal?: boolean) => {
                        const MarkerClass = AdvancedMarkerElement || (window as any).google?.maps?.marker?.AdvancedMarkerElement;
                        if (MarkerClass) {
                            const position = item.coords || (item.lat !== undefined && item.lng !== undefined ? item : null);
                            if (!position) {
                                console.warn('[SovereignMap] placeMarker skipped: no valid coords found on item', item);
                                return;
                            }
                            const pin = document.createElement('div');
                            pin.style.cssText = `width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color};cursor:pointer;transition:transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;`;
                            
                            // Hover visual states
                            pin.addEventListener('mouseenter', () => {
                                pin.style.transform = 'scale(1.3)';
                                pin.style.boxShadow = `0 0 16px ${color}`;
                            });
                            pin.addEventListener('mouseleave', () => {
                                pin.style.transform = 'scale(1)';
                                pin.style.boxShadow = `0 0 8px ${color}`;
                            });

                            // Click interactions
                            pin.addEventListener('click', (e) => {
                                e.stopPropagation();
                                
                                const refFrame = activePOIRef.current?.referenceFrame || 'EARTH';
                                const lat = position.lat;
                                const lng = position.lng;
                                
                                const hashVal = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233)) * 43758.5453;
                                const solar = Math.floor(55 + (hashVal % 45));
                                const wind = Math.floor(15 + ((hashVal * 1.5) % 75));
                                const water = Math.floor(5 + ((hashVal * 2.3) % 90));
                                const zoning = Math.floor(20 + ((hashVal * 3.7) % 80));
                                const mockOwnerName = isProposal ? `Proposer ${Math.floor(100 + (hashVal % 900))}` : `Citizen ${Math.floor(100 + (hashVal % 900))}`;
                                const mockOwnerDid = isProposal ? `did:sovereign:proposer:0x${Math.floor(hashVal).toString(16).substring(0, 16)}` : `did:sovereign:citizen:0x${Math.floor(hashVal).toString(16).substring(0, 16)}`;
                                const stakeVal = item.stake || item.stakedSovereignUnits || Math.floor(4000 + (hashVal % 28000));
                                const name = item.name || (isProposal ? `Sovereign Proposal ${item.id || ''}` : `Sovereign Citadel ${item.id || ''}`);
                                
                                const updatedPOI: POIDetails = {
                                    name: name,
                                    formattedAddress: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
                                    coordinates: { lat, lng, alt: 100 },
                                    referenceFrame: refFrame,
                                    ownership: {
                                        ownerDid: mockOwnerDid,
                                        ownerName: mockOwnerName,
                                        stakedSovereignUnits: stakeVal
                                    },
                                    publicPlans: isProposal 
                                        ? `ACTIVE GOVERNANCE PROPOSAL: Evaluating proposed changes on structural grid layer. Current state: ${item.status || 'PENDING VOTE'}. Staked support: ${stakeVal} units.`
                                        : `Offline Substrate Secure Telemetry. Node ${name} is fully operational under local encrypted caching. Current Status: ${item.status || 'ACTIVE'}.`,
                                    metrics: { solar, wind, water, zoning }
                                };
                                setActivePOI(updatedPOI);
                                setHUDStateRef.current({ activePillar: 'ATLAS', activeFocusPanel: 'ATLAS' });

                                if (refFrame === 'EARTH') {
                                    fetchLiveTelemetry(lat, lng, updatedPOI);
                                }
                            });

                            new MarkerClass({ position, map, content: pin });
                        } else {
                            console.warn('[SovereignMap] AdvancedMarkerElement not available, skipping marker render.');
                        }
                    };

                    if (layer.type === 'INSTITUTION' && Array.isArray(layer.data)) {
                        layer.data.forEach((inst: any) => placeMarker(inst, '#f59e0b'));
                    }
                    if (layer.type === 'PROPOSAL' && Array.isArray(layer.data)) {
                        layer.data.forEach((prop: any) => placeMarker(prop, '#ea580c', true));
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

    const convertSVGToLatLng = (x: number, y: number) => {
        const lng = (x * 360 / 1000) - 180;
        const lat = 90 - (y * 180 / 500);
        return { lat, lng };
    };

    const handleCoordinateSelect = (lat: number, lng: number) => {
        lastCentered2DPOIKeyRef.current = null;
        lastCentered3DPOIKeyRef.current = null;
        const refFrame = activePOI?.referenceFrame || 'EARTH';
        
        const hashVal = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233)) * 43758.5453;
        const solar = Math.floor(55 + (hashVal % 45));
        const wind = Math.floor(15 + ((hashVal * 1.5) % 75));
        const water = Math.floor(5 + ((hashVal * 2.3) % 90));
        const zoning = Math.floor(20 + ((hashVal * 3.7) % 80));
        
        const mockOwnerName = `Citizen ${Math.floor(100 + (hashVal % 900))}`;
        const mockOwnerDid = `did:sovereign:citizen:0x${Math.floor(hashVal).toString(16).substring(0, 16)}`;
        const mockStaked = Math.floor(4000 + (hashVal % 28000));
        
        const updatedPOI: POIDetails = {
            name: `Grid Segment ${lat.toFixed(2)}N, ${lng.toFixed(2)}E`,
            formattedAddress: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
            coordinates: { lat, lng, alt: 0 },
            referenceFrame: refFrame,
            ownership: {
                ownerDid: mockOwnerDid,
                ownerName: mockOwnerName,
                stakedSovereignUnits: mockStaked
            },
            publicPlans: `Offline Substrate Secure Telemetry. Grid segment selected. Evaluating localized resource potentials under local caching.`,
            metrics: { solar, wind, water, zoning }
        };
        
        setActivePOI(updatedPOI);
        setHUDStateRef.current({ activePillar: 'ATLAS', activeFocusPanel: 'ATLAS' });
        
        if (refFrame === 'EARTH') {
            fetchLiveTelemetry(lat, lng, updatedPOI);
        }
    };

    const handleCitadelClick = (node: any) => {
        lastCentered2DPOIKeyRef.current = null;
        lastCentered3DPOIKeyRef.current = null;
        const refFrame = activePOI?.referenceFrame || 'EARTH';
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
            referenceFrame: refFrame,
            ownership: {
                ownerDid: mockOwnerDid,
                ownerName: mockOwnerName,
                stakedSovereignUnits: mockStaked
            },
            publicPlans: `Offline Substrate Secure Telemetry. Node ${node.name} is fully operational under local encrypted caching.`,
            metrics: { solar, wind, water, zoning }
        };
        setActivePOI(updatedPOI);
        setHUDStateRef.current({ activePillar: 'ATLAS', activeFocusPanel: 'ATLAS' });

        if (refFrame === 'EARTH') {
            fetchLiveTelemetry(node.lat, node.lng, updatedPOI);
        }
    };

    const renderOfflineSubstrateMap = () => {
        const refFrame = activePOI?.referenceFrame || 'EARTH';
        const activeWorldData = ON_WORLD_DATA[refFrame as keyof typeof ON_WORLD_DATA] || ON_WORLD_DATA.EARTH;

        const getScaledPolygonPoints = (poly: { lat: number; lng: number }[], scale: number) => {
            if (poly.length === 0) return '';
            
            // Simple average centroid calculation
            let sumLat = 0;
            let sumLng = 0;
            poly.forEach(p => {
                sumLat += p.lat;
                sumLng += p.lng;
            });
            const centroidLat = sumLat / poly.length;
            const centroidLng = sumLng / poly.length;
            
            return poly.map(p => {
                const scaledLat = centroidLat + (p.lat - centroidLat) * scale;
                const scaledLng = centroidLng + (p.lng - centroidLng) * scale;
                const { x, y } = convertLatLngToSVG(scaledLat, scaledLng);
                return `${x},${y}`;
            }).join(' ');
        };

        const getThemeColor = () => {
            if (themeState?.theme === 'theme-latex') return '#8c1d1d';
            if (refFrame === 'LUNA') return '#a1a1aa';
            if (refFrame === 'MARS') return '#f97316';
            return '#f59e0b';
        };

        const getBgColor = () => {
            if (themeState?.theme === 'theme-latex') return '#fdfcf7';
            if (refFrame === 'LUNA') return '#09090b';
            if (refFrame === 'MARS') return '#1c0d0a';
            return '#030712';
        };

        const themeColor = getThemeColor();
        const bgColor = getBgColor();

        const handleOfflineMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
            if (offlineDragMovedRef.current) return;
            
            const svgElement = e.currentTarget;
            const svgRect = svgElement.getBoundingClientRect();
            const clientX = e.clientX - svgRect.left;
            const clientY = e.clientY - svgRect.top;
            
            // Map client pixels to 1000x500 coordinates relative to container
            const viewBoxX = clientX * (1000 / svgRect.width);
            const viewBoxY = clientY * (500 / svgRect.height);
            
            // Revert transform: translate(panX, panY) scale(zoom)
            const x = (viewBoxX - offlinePan.x) / offlineZoom;
            const y = (viewBoxY - offlinePan.y) / offlineZoom;
            
            if (x < 0 || x > 1000 || y < 0 || y > 500) return;
            
            const { lat, lng } = convertSVGToLatLng(x, y);
            handleCoordinateSelect(lat, lng);
        };

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
            <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center font-mono overflow-hidden ${
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
                    onClick={handleOfflineMapClick}
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

                        {/* Landmass / Topographic Boundaries */}
                        {(CELESTIAL_BOUNDARIES[refFrame as keyof typeof CELESTIAL_BOUNDARIES] || CELESTIAL_BOUNDARIES.EARTH).map((poly, idx) => {
                            const basePoints = poly.map(p => {
                                const { x, y } = convertLatLngToSVG(p.lat, p.lng);
                                return `${x},${y}`;
                            }).join(' ');
                            
                            // Generate 3 nested topological contours
                            const contour1 = getScaledPolygonPoints(poly, 0.85);
                            const contour2 = getScaledPolygonPoints(poly, 0.70);
                            const contour3 = getScaledPolygonPoints(poly, 0.55);

                            return (
                                <g key={`land-group-${idx}`}>
                                    {/* Main Landmass Boundary */}
                                    <polygon 
                                        points={basePoints}
                                        fill={themeColor}
                                        fillOpacity="0.015"
                                        stroke={themeColor}
                                        strokeWidth="1"
                                        strokeOpacity="0.15"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Contour 1 (85% Scale) */}
                                    <polygon 
                                        points={contour1}
                                        fill="none"
                                        stroke={themeColor}
                                        strokeWidth="0.75"
                                        strokeOpacity="0.08"
                                        strokeDasharray="4,4"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Contour 2 (70% Scale) */}
                                    <polygon 
                                        points={contour2}
                                        fill="none"
                                        stroke={themeColor}
                                        strokeWidth="0.75"
                                        strokeOpacity="0.05"
                                        strokeDasharray="2,4"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Contour 3 (55% Scale) */}
                                    <polygon 
                                        points={contour3}
                                        fill="none"
                                        stroke={themeColor}
                                        strokeWidth="0.5"
                                        strokeOpacity="0.03"
                                        strokeDasharray="1,5"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </g>
                            );
                        })}
 
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
                                    {/* Curved Path with dynamic scrolling dash array */}
                                    <path 
                                        d={pathD} 
                                        fill="none" 
                                        stroke={themeColor} 
                                        strokeWidth="1.5" 
                                        strokeOpacity="0.4" 
                                        strokeDasharray="6,4" 
                                        vectorEffect="non-scaling-stroke"
                                    >
                                        <animate 
                                            attributeName="stroke-dashoffset" 
                                            values="40;0" 
                                            dur="3s" 
                                            repeatCount="indefinite" 
                                        />
                                    </path>
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
                                    onClick={(e) => {
                                        e.stopPropagation();
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

                {/* Offline Map Controls */}
                <div className="absolute top-6 right-6 z-20 flex flex-col gap-1.5 pointer-events-auto">
                    <button 
                        onClick={() => {
                            setOfflineZoom(z => Math.min(20, z * 1.3));
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-black/85 hover:bg-zinc-900 active:bg-zinc-800 border border-white/10 hover:border-white/25 text-white font-mono font-bold text-sm rounded transition-all shadow-xl select-none"
                        title="ZOOM IN"
                    >
                        ＋
                    </button>
                    <button 
                        onClick={() => {
                            setOfflineZoom(z => Math.max(0.5, z / 1.3));
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-black/85 hover:bg-zinc-900 active:bg-zinc-800 border border-white/10 hover:border-white/25 text-white font-mono font-bold text-sm rounded transition-all shadow-xl select-none"
                        title="ZOOM OUT"
                    >
                        －
                    </button>
                    <button 
                        onClick={handleResetOfflineViewport}
                        className="w-8 h-8 flex items-center justify-center bg-black/85 hover:bg-zinc-900 active:bg-zinc-800 border border-white/10 hover:border-white/25 text-white font-mono font-bold text-xs rounded transition-all shadow-xl select-none"
                        title="RESET VIEWPORT"
                    >
                        ⟲
                    </button>
                </div>
 
                {/* Offline Status — discreet bottom-left indicator, not a blocking overlay */}
                <div className="absolute bottom-4 left-4 z-20 pointer-events-auto flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md font-data text-[8px] uppercase tracking-wider shadow-lg border-0" style={{ boxShadow: 'inset 0 0 0 1px rgba(239,68,68,0.2)' }}>
                        <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                        <span className="text-red-400/80 font-semibold">Substrate Offline</span>
                        {error && <span className="text-red-300/50">· {error}</span>}
                    </div>
                    <button
                        onClick={() => {
                            delete (window as any).__googleMapsLoadError;
                            setIsOfflineSubstrateMode(false);
                            setError(null);
                            setIsLoaded(false);
                            setIsMapTilesLoaded(false);
                            window.location.reload();
                        }}
                        className="px-2 py-0.5 bg-transparent hover:bg-white/5 text-zinc-600 hover:text-zinc-300 font-data text-[7px] uppercase tracking-widest rounded transition-all cursor-pointer"
                    >
                        ⟳ retry
                    </button>
                </div>

 
                {geoFallbackAlert && (
                    <div className="absolute top-24 left-6 z-30 pointer-events-none transition-all duration-1000 ease-out animate-pulse">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-amber-500/20 bg-amber-500/[0.03] backdrop-blur-sm text-amber-500/60 font-mono text-[8px] uppercase tracking-widest shadow-lg">
                            <span className="w-1 h-1 rounded-full bg-amber-500/60 animate-ping" />
                            <span>{geoFallbackAlert}</span>
                        </div>
                    </div>
                )}
 
            </div>
        );
    };

    const show3D = is3DActive && is3DReady;

    return (
        <div className={`relative w-full h-full overflow-hidden ${
            themeState?.theme === 'theme-latex' ? 'bg-[#fdfcf7]' : 'bg-black'
        }`}>
            {/* Custom scoped style overrides to enforce theme inversion at the child/image/canvas element level */}
            <style dangerouslySetInnerHTML={{ __html: `
                .sovereign-map-viewport img,
                .sovereign-map-viewport canvas {
                    filter: var(--map-theme-filter) !important;
                    will-change: filter;
                }
                .sovereign-map-3d {
                    filter: var(--map-theme-filter) !important;
                    will-change: filter;
                }
                gmp-map-3d {
                    display: block !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                .sovereign-map-viewport,
                .sovereign-map-3d,
                .sovereign-map-viewport iframe,
                .sovereign-map-3d iframe {
                    background-color: ${themeState?.theme === 'theme-latex' ? '#fdfcf7' : '#000000'} !important;
                    background: ${themeState?.theme === 'theme-latex' ? '#fdfcf7' : '#000000'} !important;
                }
            `}} />

            {/* Offline Substrate Map Container with smooth cross-fade */}
            <div 
                className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                    isOfflineSubstrateMode ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                {renderOfflineSubstrateMap()}
            </div>

            {/* Live Map Substrate Container with smooth cross-fade */}
            <div 
                className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                    !isOfflineSubstrateMode ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* DEBUG BADGE — remove once map confirmed working */}
                <div className="absolute bottom-12 right-4 z-50 pointer-events-none">
                    <div className={`px-2 py-1 font-mono text-[8px] uppercase tracking-widest rounded border ${
                        isMapTilesLoaded 
                            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                            : isOfflineSubstrateMode
                                ? 'bg-red-950/80 border-red-500/40 text-red-400'
                                : 'bg-amber-950/80 border-amber-500/40 text-amber-400 animate-pulse'
                    }`}>
                        {isMapTilesLoaded ? '✓ LIVE MAP' : isOfflineSubstrateMode ? '⚠ OFFLINE MODE' : '⟳ LOADING MAP...'}
                        {error && ` — ${error}`}
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
                    className={`absolute inset-0 w-full h-full sovereign-map-viewport transition-opacity duration-500 ${show3D ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`} 
                />
                <div 
                    ref={map3DRef} 
                    style={{ 
                        ['--map-theme-filter' as any]: getThemeFilter()
                    }}
                    className={`absolute inset-0 w-full h-full sovereign-map-3d transition-opacity duration-500 ${show3D ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
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
        </div>
    );
};
