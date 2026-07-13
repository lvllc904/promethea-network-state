'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useHUD, POIDetails, defaultPOI } from '@/lib/hud-store';
import { useMesh } from '@/components/providers/mesh-provider';
import { 
    Activity, 
    Database, 
    Shield, 
    BrainCircuit, 
    Globe, 
    Coins, 
    Sliders, 
    ChevronUp, 
    ChevronDown, 
    ArrowLeft,
    Layers,
    Compass,
    Radio,
    Landmark,
    BookOpen,
    Fingerprint,
    Monitor,
    MessageSquare,
    Zap,
    Palette,
    LogOut
} from 'lucide-react';

export interface BeltItem {
    id: string;
    title: string;
    subtitle: string;
    meta: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    icon?: any;
    action: (hud: any) => void;
}

export interface Pillar {
    id: 'ATLAS' | 'ECONOMICS' | 'GOVERNANCE' | 'ASGI' | 'NARRATIVE' | 'DIPLOMATIC' | 'PULSE';
    name: string;
    icon: any;
    items: BeltItem[];
}

const LUNA_POI: POIDetails = {
    name: "Clavius Crater Hub",
    formattedAddress: "Clavius Crater, Selenographic Coord Frame, Luna",
    website: "https://clavius.luna.lvhllc.org",
    rating: 4.9,
    photos: ["https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=600&q=80"],
    coordinates: { lat: -58.4, lng: -14.4, alt: -1200 },
    referenceFrame: 'LUNA',
    ownership: {
        ownerDid: "did:sovereign:luna:0x7c4e2b8a3e1c0d3a",
        ownerName: "Luna Transport Logistics",
        stakedSovereignUnits: 32000
    },
    publicPlans: "Phase 1: Excavate sub-surface lava tubes for atmospheric sealing. Phase 2: Deploy solar collectors on crater rim (Peak of Eternal Light) and establish water ice mining infrastructure.",
    metrics: { solar: 95, wind: 0, water: 30, zoning: 40 }
};

const MARS_POI: POIDetails = {
    name: "Arsia Mons Outpost",
    formattedAddress: "Arsia Mons Caldera, Areocentric Coord Frame, Mars",
    website: "https://arsia-mons.mars.lvhllc.org",
    rating: 4.7,
    photos: ["https://images.unsplash.com/photo-1612892483236-42d68a57623d?auto=format&fit=crop&w=600&q=80"],
    coordinates: { lat: -8.4, lng: -120.0, alt: 16000 },
    referenceFrame: 'MARS',
    ownership: {
        ownerDid: "did:sovereign:mars:0x3a8e2b8f1c0d4f5e",
        ownerName: "Areocentre Mining Corp",
        stakedSovereignUnits: 45000
    },
    publicPlans: "Phase 1: Erect localized aerostat weather beacons and low-pressure CO2 extraction dome. Phase 2: Expand geothermal water reservoirs and calibrate deep-space high-bandwidth telemetry array.",
    metrics: { solar: 40, wind: 65, water: 15, zoning: 55 }
};

const PILLARS_DATA: Pillar[] = [
    {
        id: 'ATLAS',
        name: 'Atlas Map',
        icon: Globe,
        items: [
            { 
                id: 'map-earth', 
                title: 'Warp to Earth', 
                subtitle: 'Surface Google Maps', 
                meta: '3D Terrain Enabled',
                action: (hud) => {
                    hud.setHUDState({ mapMode: 'SURFACE' });
                    hud.setActivePOI(defaultPOI);
                }
            },
            { 
                id: 'map-luna', 
                title: 'Link Clavius Crater', 
                subtitle: 'Lunar Reference Frame', 
                meta: 'Warp Target: Luna',
                action: (hud) => {
                    hud.setHUDState({ mapMode: 'SURFACE' });
                    hud.setActivePOI(LUNA_POI);
                }
            },
            { 
                id: 'map-mars', 
                title: 'Link Arsia Mons', 
                subtitle: 'Areocentric Reference Frame', 
                meta: 'Warp Target: Mars',
                action: (hud) => {
                    hud.setHUDState({ mapMode: 'SURFACE' });
                    hud.setActivePOI(MARS_POI);
                }
            },
            { 
                id: 'map-orbit', 
                title: 'Engage Orbit Mode', 
                subtitle: 'Interstellar Space Map', 
                meta: 'ThreeJS WebGL Active',
                action: (hud) => {
                    hud.setHUDState({ mapMode: 'INTERSTELLAR' });
                }
            }
        ]
    },
    {
        id: 'ECONOMICS',
        name: 'Economics',
        icon: Coins,
        items: [
            { 
                id: 'econ-markets', 
                title: 'Marketplace Module', 
                subtitle: 'Live Asset Trading Feed', 
                meta: 'BFF Proxy Nominal',
                severity: 'LOW',
                action: (hud) => {
                    hud.activateFocusPanel('MARKETPLACE');
                }
            },
            { 
                id: 'econ-treasury', 
                title: 'Sovereign Router', 
                subtitle: 'Treasury Cashflow Waterfall', 
                meta: 'Secured by Solana',
                severity: 'MEDIUM',
                action: (hud) => {
                    hud.activateFocusPanel('FINANCIALS');
                }
            },
            { 
                id: 'econ-ledgers', 
                title: 'Labor Ledger', 
                subtitle: 'Proof of Sweat Claims', 
                meta: 'Epoch Sync Active',
                severity: 'HIGH',
                action: (hud) => {
                    hud.activateFocusPanel('SWEAT_CLAIM');
                }
            }
        ]
    },
    {
        id: 'GOVERNANCE',
        name: 'Governance',
        icon: Landmark,
        items: [
            { 
                id: 'gov-proposals', 
                title: 'Active Gas proposals', 
                subtitle: 'Abstractions Framework', 
                meta: 'Voting Phase 1',
                severity: 'MEDIUM',
                action: (hud) => {
                    hud.activateFocusPanel('CLI_GUIDE');
                }
            },
            { 
                id: 'gov-consensus', 
                title: 'Consensus Explorer', 
                subtitle: 'Live Validator Nodes', 
                meta: '99.9% Sync Multi-Region',
                severity: 'LOW',
                action: (hud) => {
                    hud.activateFocusPanel('SQL_EXPLORER');
                }
            }
        ]
    },
    {
        id: 'ASGI',
        name: 'Promethea ASGI',
        icon: BrainCircuit,
        items: [
            { 
                id: 'asgi-copilot', 
                title: 'ASGI Copilot Bridge', 
                subtitle: 'Clojure Lisp Core Agent', 
                meta: 'AI Stream online',
                severity: 'CRITICAL',
                action: (hud) => {
                    hud.activateFocusPanel('PROMETHEA_ASGI');
                }
            },
            { 
                id: 'asgi-omniscan', 
                title: 'Omni-Scanner Core', 
                subtitle: 'DID Transaction Audit', 
                meta: 'Awaiting target packet',
                severity: 'MEDIUM',
                action: (hud) => {
                    hud.activateFocusPanel('OMNI_SCANNER');
                }
            }
        ]
    },
    {
        id: 'NARRATIVE',
        name: 'Narrative',
        icon: BookOpen,
        items: [
            {
                id: 'narrative-manifesto',
                title: 'Sovereign Manifesto',
                subtitle: 'The Promethean Constitution',
                meta: 'Harms Framework v2',
                action: (hud) => {
                    hud.activateFocusPanel('CLI_GUIDE');
                }
            },
            {
                id: 'narrative-lore',
                title: 'Interstellar Lore',
                subtitle: 'Wave 19-20 Space Archive',
                meta: 'Read Only Feed',
                action: (hud) => {
                    hud.activateFocusPanel('PROMETHEA_ASGI');
                }
            }
        ]
    },
    {
        id: 'DIPLOMATIC',
        name: 'Passport',
        icon: Fingerprint,
        items: [
            {
                id: 'passport-hub',
                title: 'DID Passport Hub',
                subtitle: 'Sovereign Identity Ledger',
                meta: 'Solana ZK-Proofs',
                action: (hud) => {
                    hud.activateFocusPanel('OMNI_SCANNER');
                }
            },
            {
                id: 'passport-visa',
                title: 'Consensus Visa',
                subtitle: 'Interstellar Crossing Permit',
                meta: 'Zero-Trust Protocol',
                action: (hud) => {
                    hud.activateFocusPanel('PROMETHEA_ASGI');
                }
            }
        ]
    },
    {
        id: 'PULSE',
        name: 'Pulse',
        icon: Activity,
        items: [
            {
                id: 'pulse-vix',
                title: 'Volatile VIX Matrix',
                subtitle: 'Global Volatility Index',
                meta: 'BFF Proxy Nominal',
                action: (hud) => {
                    hud.activateFocusPanel('FINANCIALS');
                }
            },
            {
                id: 'pulse-telemetry',
                title: 'Substrate Telemetry',
                subtitle: '99.9% Node Sync Map',
                meta: 'Epoch 4909 Syncing',
                action: (hud) => {
                    hud.activateFocusPanel('OMNI_SCANNER');
                }
            }
        ]
    }
];

export function OblongMenuBelt() {
    const hud = useHUD();
    const { doc, themeState } = useMesh();
    const [localActivePillar, setLocalActivePillar] = useState<string | null>(null);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [rotation, setRotation] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const dragStartY = useRef<number>(0);
    const dragStartRotation = useRef<number>(0);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isScrolling, setIsScrolling] = useState<boolean>(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Dimension coefficients for the oblong vertical ellipse
    const a = 190; // Vertical stretch (height)
    const b = 55;  // Depth squeeze (depth)

    const activePillarData = useMemo(() => {
        return PILLARS_DATA.find(p => p.id === localActivePillar) || null;
    }, [localActivePillar]);

    // Active items on the belt: either the pillars or sub-items of the selected pillar
    const activeBeltItems = useMemo(() => {
        if (!localActivePillar) {
            return [
                {
                    id: 'ATLAS',
                    title: 'Atlas Map',
                    subtitle: 'SYSTEM PILLAR',
                    meta: '4 Modules Available',
                    icon: Globe,
                    action: (h: any) => {
                        setLocalActivePillar('ATLAS');
                        h.activatePillar('ATLAS');
                        setRotation(0);
                    }
                },
                {
                    id: 'ECONOMICS',
                    title: 'Economics',
                    subtitle: 'SYSTEM PILLAR',
                    meta: '3 Modules Available',
                    icon: Coins,
                    action: (h: any) => {
                        setLocalActivePillar('ECONOMICS');
                        h.activatePillar('ECONOMICS');
                        setRotation(0);
                    }
                },
                {
                    id: 'GOVERNANCE',
                    title: 'Governance',
                    subtitle: 'SYSTEM PILLAR',
                    meta: '2 Modules Available',
                    icon: Landmark,
                    action: (h: any) => {
                        setLocalActivePillar('GOVERNANCE');
                        h.activatePillar('GOVERNANCE');
                        setRotation(0);
                    }
                },
                {
                    id: 'ASGI',
                    title: 'Promethea ASGI',
                    subtitle: 'SYSTEM PILLAR',
                    meta: '2 Modules Available',
                    icon: BrainCircuit,
                    action: (h: any) => {
                        setLocalActivePillar('ASGI');
                        h.activatePillar('ASGI');
                        setRotation(0);
                    }
                },
                {
                    id: 'NARRATIVE',
                    title: 'Narrative',
                    subtitle: 'SYSTEM PILLAR',
                    meta: '2 Modules Available',
                    icon: BookOpen,
                    action: (h: any) => {
                        setLocalActivePillar('NARRATIVE');
                        h.activatePillar('NARRATIVE');
                        setRotation(0);
                    }
                },
                {
                    id: 'DIPLOMATIC',
                    title: 'Passport',
                    subtitle: 'SYSTEM PILLAR',
                    meta: '2 Modules Available',
                    icon: Fingerprint,
                    action: (h: any) => {
                        setLocalActivePillar('DIPLOMATIC');
                        h.activatePillar('DIPLOMATIC');
                        setRotation(0);
                    }
                },
                {
                    id: 'PULSE',
                    title: 'Pulse',
                    subtitle: 'SYSTEM PILLAR',
                    meta: '2 Modules Available',
                    icon: Activity,
                    action: (h: any) => {
                        setLocalActivePillar('PULSE');
                        h.activatePillar('PULSE');
                        setRotation(0);
                    }
                },
                {
                    id: 'WORKSPACES',
                    title: 'Workspaces',
                    subtitle: 'HUD UTILITY',
                    meta: 'Toggle Control Deck',
                    icon: Monitor,
                    action: (h: any) => {
                        h.activateFocusPanel(h.activeFocusPanel === 'WORKSPACES' ? null : 'WORKSPACES');
                    }
                },
                {
                    id: 'CHAT',
                    title: 'Co-pilot Chat',
                    subtitle: 'AI COMPANION',
                    meta: 'Open Stream Panel',
                    icon: MessageSquare,
                    action: (h: any) => {
                        h.activatePillar('CHAT');
                    }
                },
                {
                    id: 'ANIMATIONS',
                    title: 'Aesthetics',
                    subtitle: 'UX CONFIGURATION',
                    meta: hud.reduceAnimations ? 'Animations: OFF' : 'Animations: ON',
                    icon: Zap,
                    action: (h: any) => {
                        h.toggleAnimations();
                    }
                },
                {
                    id: 'THEME',
                    title: 'Theme Switcher',
                    subtitle: 'VISUAL SCHEME',
                    meta: themeState?.theme === 'theme-latex' ? 'LaTeX Light' : 'Citadel Dark',
                    icon: Palette,
                    action: () => {
                        if (doc) {
                            const ymap = doc.getMap('ui-theme');
                            const nextTheme = themeState?.theme === 'theme-latex' ? 'dark' : 'theme-latex';
                            ymap.set('theme', nextTheme);
                        }
                    }
                },
                {
                    id: 'EXIT',
                    title: 'Exit HUD',
                    subtitle: 'SECURE LOGOUT',
                    meta: 'Terminate Session',
                    icon: LogOut,
                    action: () => {
                        window.dispatchEvent(new CustomEvent('hud-exit'));
                    }
                }
            ];
        } else {
            const items = activePillarData ? [...activePillarData.items] : [];
            items.push({
                id: 'back-button',
                title: 'Back',
                subtitle: 'Return to Pillars',
                meta: 'System Navigation',
                icon: ArrowLeft,
                action: () => {
                    handleBack();
                }
            });
            return items;
        }
    }, [localActivePillar, activePillarData, hud, themeState, doc]);

    // Handle external activePillar state changes
    useEffect(() => {
        if (hud.activePillar === null) {
            setLocalActivePillar(null);
            setSelectedItemId(null);
        } else if (hud.activePillar !== localActivePillar && PILLARS_DATA.some(p => p.id === hud.activePillar)) {
            setLocalActivePillar(hud.activePillar);
            setSelectedItemId(null);
        }
    }, [hud.activePillar]);

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        const sensitivity = 0.08;
        setRotation(prev => prev - e.deltaY * sensitivity);
        setIsScrolling(true);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 150);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDragging(true);
        dragStartY.current = e.clientY;
        dragStartRotation.current = rotation;
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaY = e.clientY - dragStartY.current;
            const sensitivity = 0.4;
            setRotation(dragStartRotation.current + deltaY * sensitivity);
        };
        const handleMouseUp = () => setIsDragging(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, rotation]);

    const handleCardClick = (item: any) => {
        if (!localActivePillar) {
            item.action(hud);
        } else {
            setSelectedItemId(item.id);
            item.action(hud);
        }
    };

    const handleBack = () => {
        setLocalActivePillar(null);
        setSelectedItemId(null);
        setRotation(0);
        hud.activatePillar('ATLAS'); // Reset to Atlas map pillar
    };

    // Calculate maxZIndex once to identify the physical front-most center card
    const maxZIndex = useMemo(() => {
        const zValues = activeBeltItems.map((_, idx) => {
            const itemTheta = (360 / activeBeltItems.length) * idx + rotation;
            const itemThetaRad = (itemTheta * Math.PI) / 180;
            return Math.cos(itemThetaRad) * b;
        });
        return zValues.indexOf(Math.max(...zValues));
    }, [activeBeltItems, rotation, b]);

    return (
        <div 
            className="absolute inset-0 flex items-center justify-center z-40 select-none pointer-events-none bg-transparent border-none shadow-none"
        >
            {/* Elliptical 3D Viewport */}
            <div className="w-full h-full flex items-center justify-center relative" style={{ perspective: '1000px' }}>
                
                {/* Tech Grid Lines */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.5)_100%)] pointer-events-none z-0 opacity-40 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-dashed border-zinc-800 rounded-full animate-spin" style={{ animationDuration: '45s' }} />
                </div>

                {/* Ellipse Container */}
                <div 
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    className={`w-full max-w-[64px] h-[400px] relative flex justify-center items-center z-10 transition-transform cursor-grab active:cursor-grabbing pointer-events-auto ${isScrolling ? 'duration-75 ease-out' : 'duration-300'}`}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {activeBeltItems.map((item, index) => {
                        const theta = (360 / activeBeltItems.length) * index + rotation;
                        const thetaRad = (theta * Math.PI) / 180;
                        const y = Math.sin(thetaRad) * a;
                        const z = Math.cos(thetaRad) * b;

                        // Calculate dynamic flat-front tilt
                        const cosZ = z / b; // ranges from -1 to 1
                        const tiltDegrees = -Math.sin(thetaRad) * 45 * (1 - Math.max(0, cosZ));

                        const isCardFacingFront = z > -15; // Hide or dim items on the back curve
                        const isCenterNode = index === maxZIndex;
                        const isHovered = hoveredIndex === index;

                        const proximity = Math.max(0, cosZ); // 1.0 at front center, 0.0 at sides

                        // Dynamic opacity: center node and hovered nodes have full 1.0 opacity.
                        // Other nodes fade out smoothly down to 0.05 as they move away from the center.
                        const dynamicOpacity = isCenterNode 
                            ? 1.0 
                            : isHovered 
                                ? 1.0 
                                : isCardFacingFront 
                                    ? (0.08 + 0.82 * Math.pow(proximity, 1.5)) 
                                    : 0.05;

                        // Dynamic scale: center gets 1.15, other nodes range from 0.7 to 1.0 based on proximity, hovered gets an active boost.
                        const baseScale = isCenterNode ? 1.15 : (0.7 + 0.3 * proximity);
                        const finalScale = isHovered ? baseScale * 1.12 : baseScale;

                        // Z-indexing: center is topmost, followed by hovered, then layered by physical proximity depth.
                        const zIndexValue = isCenterNode ? 40 : isHovered ? 30 : Math.round(10 + 15 * proximity);

                        // Icon stroke color transition
                        const iconColor = isCenterNode 
                            ? 'rgb(251, 191, 36)' // bright amber-400
                            : isHovered 
                                ? 'rgba(251, 191, 36, 0.9)' // active hover amber
                                : `rgba(161, 161, 170, ${0.3 + 0.7 * proximity})`; // zinc-400 fading to zinc-600

                        return (
                            <div
                                key={item.id}
                                onClick={(e) => { e.stopPropagation(); handleCardClick(item); }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="absolute w-14 h-14 select-none cursor-pointer group pointer-events-auto transition-opacity duration-300"
                                style={{
                                    transform: `translateY(${y}px) translateZ(${z}px) rotateX(${tiltDegrees}deg)`,
                                    opacity: dynamicOpacity,
                                    pointerEvents: isCardFacingFront ? 'auto' : 'none',
                                    backfaceVisibility: 'hidden',
                                    zIndex: zIndexValue
                                }}
                            >
                                {/* Inner hardware-accelerated wrapper to avoid layout transition jank during dragging/scrolling */}
                                <div 
                                    className="w-full h-full rounded-full flex items-center justify-center border transition-all duration-350 backdrop-blur-md shadow-lg"
                                    style={{
                                        transform: `scale(${finalScale})`,
                                        borderColor: isCenterNode 
                                            ? 'rgba(245, 158, 11, 0.85)' 
                                            : `rgba(255, 255, 255, ${0.03 + 0.15 * Math.pow(proximity, 2)})`,
                                        backgroundColor: isCenterNode 
                                            ? 'rgba(245, 158, 11, 0.22)' 
                                            : isHovered
                                                ? 'rgba(39, 39, 42, 0.6)'
                                                : `rgba(24, 24, 27, ${0.1 + 0.35 * proximity})`,
                                        boxShadow: isCenterNode 
                                            ? '0 0 25px rgba(245, 158, 11, 0.45), inset 0 0 10px rgba(245, 158, 11, 0.15)' 
                                            : 'none'
                                    }}
                                >
                                    {item.icon ? (
                                        <item.icon 
                                            className={`w-5 h-5 transition-transform duration-300 ${isCenterNode ? 'animate-pulse' : ''}`}
                                            style={{ color: iconColor }}
                                        />
                                    ) : (
                                        <Layers 
                                            className={`w-5 h-5 transition-transform duration-300 ${isCenterNode ? 'animate-pulse' : ''}`}
                                            style={{ color: iconColor }}
                                        />
                                    )}

                                    {/* Glossy Glassmorphic Sliding Hover Tooltip */}
                                    <div className="absolute left-[70px] top-1/2 -translate-y-1/2 px-3 py-2 rounded-xl bg-black/95 backdrop-blur-md border border-white/10 shadow-2xl scale-0 group-hover:scale-100 origin-left transition-all duration-300 pointer-events-none w-56 font-mono text-[9px] z-50">
                                        <span className="text-white font-bold block uppercase tracking-wider">{item.title}</span>
                                        <span className="text-zinc-400 block mt-0.5 uppercase text-[8px]">{item.subtitle}</span>
                                        <span className="text-zinc-500 block text-[8px] mt-1 border-t border-white/5 pt-1 uppercase">{item.meta}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
