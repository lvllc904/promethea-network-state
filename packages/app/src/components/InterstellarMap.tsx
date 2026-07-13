'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useHUD, POIDetails, defaultPOI } from '../lib/hud-store';
import { DTNManager, BundlePacket } from '../lib/dtn-manager';
import { Orbit, Radio, Navigation, Zap, Network, Database, Layers, ArrowDownCircle, ShieldAlert } from 'lucide-react';

// Static celestial database
interface PlanetData {
    id: 'SOL' | 'MERCURY' | 'VENUS' | 'EARTH' | 'LUNA' | 'MARS' | 'JUPITER' | 'SATURN' | 'URANUS' | 'NEPTUNE';
    name: string;
    radius: number;
    orbitDistance: number;
    orbitSpeed: number;
    color: string;
    details: {
        type: string;
        atmosphere: string;
        temp: string;
        governance: string;
        nodesActive: number;
        scannedRegions: string;
        networkStatus: string;
    };
}

const CELESTIAL_DB: PlanetData[] = [
    {
        id: 'SOL',
        name: 'Sol (Sun)',
        radius: 2.8,
        orbitDistance: 0,
        orbitSpeed: 0,
        color: '#f59e0b',
        details: {
            type: 'G-Type Main-Sequence Star',
            atmosphere: 'Hydrogen/Helium Plasma',
            temp: '5,500 °C (Surface)',
            governance: 'Sovereign Physical Commons',
            nodesActive: 0,
            scannedRegions: 'Uninhabitable (100% Coronal Scanned)',
            networkStatus: 'High Solar Interference'
        }
    },
    {
        id: 'MERCURY',
        name: 'Mercury',
        radius: 0.4,
        orbitDistance: 6,
        orbitSpeed: 0.04,
        color: '#a1a1aa',
        details: {
            type: 'Terrestrial Planet',
            atmosphere: 'Exosphere (Trace Helium/Sodium)',
            temp: '-180 °C to 430 °C',
            governance: 'Unclaimed Baseline',
            nodesActive: 0,
            scannedRegions: '24% Caloris Basin Scanned',
            networkStatus: 'No Comm Relay'
        }
    },
    {
        id: 'VENUS',
        name: 'Venus',
        radius: 0.7,
        orbitDistance: 9,
        orbitSpeed: 0.028,
        color: '#e3bb76',
        details: {
            type: 'Terrestrial Planet',
            atmosphere: '96.5% Carbon Dioxide (Dense)',
            temp: '460 °C (Supercritical)',
            governance: 'Automated Atmospheric Monitor',
            nodesActive: 0,
            scannedRegions: 'Maxwell Montes Synthetic Aperture Scan',
            networkStatus: 'Thermal Absorption Mode'
        }
    },
    {
        id: 'EARTH',
        name: 'Earth (Terra)',
        radius: 1.1,
        orbitDistance: 15,
        orbitSpeed: 0.015,
        color: '#d97706',
        details: {
            type: 'Sovereign Capital Basin',
            atmosphere: 'Nitrogen/Oxygen (Bio-Stable)',
            temp: '15 °C (Mean)',
            governance: 'Promethean Network State (DAC)',
            nodesActive: 342,
            scannedRegions: '100% High-Fidelity 3D Photorealistic Tiles',
            networkStatus: 'Core Fiber Sync // GCS Active'
        }
    },
    {
        id: 'LUNA',
        name: 'Luna (Moon)',
        radius: 0.35,
        orbitDistance: 2.2, // Dist from Earth
        orbitSpeed: 0.06,
        color: '#cbd5e1',
        details: {
            type: 'Sovereign Mining Outpost',
            atmosphere: 'Vacuum Exosphere',
            temp: '-130 °C to 120 °C',
            governance: 'Selenographic Transport Logistics',
            nodesActive: 14,
            scannedRegions: '94% Clavius & Shackleton Basins Scanned',
            networkStatus: 'Laser Telemetry Uplink (RFC 5050)'
        }
    },
    {
        id: 'MARS',
        name: 'Mars (Ares)',
        radius: 0.85,
        orbitDistance: 21,
        orbitSpeed: 0.01,
        color: '#f97316',
        details: {
            type: 'Agricultural Outpost Core',
            atmosphere: '95% Carbon Dioxide (Thin)',
            temp: '-60 °C (Mean)',
            governance: 'Areocentre Mining Corp Hub',
            nodesActive: 28,
            scannedRegions: 'Olympus Mons & Gale Crater Active Descents',
            networkStatus: 'Delay-Tolerant Laser Link (~12s)'
        }
    },
    {
        id: 'JUPITER',
        name: 'Jupiter',
        radius: 2.1,
        orbitDistance: 28,
        orbitSpeed: 0.006,
        color: '#d97706',
        details: {
            type: 'Gas Giant',
            atmosphere: 'Hydrogen/Helium (Metallic Mantle)',
            temp: '-110 °C (Cloud Tops)',
            governance: 'Joint Magnetospheric Reserve',
            nodesActive: 0,
            scannedRegions: 'Great Red Spot Volumetric Feed',
            networkStatus: 'Passive Radiotelescope Sync'
        }
    },
    {
        id: 'SATURN',
        name: 'Saturn',
        radius: 1.7,
        orbitDistance: 36,
        orbitSpeed: 0.004,
        color: '#f59e0b',
        details: {
            type: 'Gas Giant // Ring Subsystem',
            atmosphere: 'Dense Hydrogen/Helium',
            temp: '-140 °C',
            governance: 'Decentralized Asteroid Ring Lease',
            nodesActive: 0,
            scannedRegions: 'Ring Particle Distribution Grid',
            networkStatus: 'Relay Beacon Pending'
        }
    },
    {
        id: 'URANUS',
        name: 'Uranus',
        radius: 1.2,
        orbitDistance: 43,
        orbitSpeed: 0.002,
        color: '#b45309',
        details: {
            type: 'Ice Giant',
            atmosphere: 'Hydrogen/Helium/Methane',
            temp: '-195 °C',
            governance: 'Polar Sovereign Sanctuary',
            nodesActive: 0,
            scannedRegions: 'Magnetic Axis Volumetric Model',
            networkStatus: 'Offline'
        }
    },
    {
        id: 'NEPTUNE',
        name: 'Neptune',
        radius: 1.1,
        orbitDistance: 50,
        orbitSpeed: 0.001,
        color: '#991b1b',
        details: {
            type: 'Ice Giant',
            atmosphere: 'Hydrogen/Helium/Methane (High Winds)',
            temp: '-200 °C',
            governance: 'Deep-Space Telemetry Outpost',
            nodesActive: 0,
            scannedRegions: 'Triton Gravitational Field Map',
            networkStatus: 'Passive Deep Space Sync'
        }
    }
];

// Helper to keep tracks of planet positions inside React Three Fiber
interface PlanetPosRegistry {
    [key: string]: THREE.Vector3;
}

const globalPlanetPositions: PlanetPosRegistry = {};

// Solar system background stars & grid
const InterstellarGrid = () => {
    return (
        <gridHelper 
            args={[120, 40, '#ea580c', '#1c1917']} 
            position={[0, -5, 0]} 
            rotation={[0, 0, 0]}
            onClick={(e) => e.stopPropagation()}
        />
    );
};

// Orbital Path Ring Component
const OrbitalPath = ({ distance }: { distance: number }) => {
    if (distance === 0) return null;
    const points = [];
    for (let i = 0; i <= 100; i++) {
        const theta = (i / 100) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * distance, 0, Math.sin(theta) * distance));
    }
    return (
        <Line 
            points={points} 
            color="#ea580c" 
            lineWidth={0.5} 
            opacity={0.15} 
            transparent 
        />
    );
};

// Individual Planet Component
interface PlanetProps {
    data: PlanetData;
    isSelected: boolean;
    onSelect: (data: PlanetData) => void;
    onDoubleClick: (data: PlanetData) => void;
}

const PlanetSphere = ({ data, isSelected, onSelect, onDoubleClick }: PlanetProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const { activePOI } = useHUD();

    // Store starting random angle so orbits are distributed on load
    const angleOffset = useRef(data.id === 'SOL' ? 0 : Math.random() * Math.PI * 2);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();

        if (data.id === 'SOL') {
            // Spin Sun slowly
            meshRef.current.rotation.y = time * 0.03;
            globalPlanetPositions['SOL'] = new THREE.Vector3(0, 0, 0);
            return;
        }

        if (data.id === 'LUNA') {
            // Luna orbits Earth
            const earthPos = globalPlanetPositions['EARTH'] || new THREE.Vector3(15, 0, 0);
            const moonAngle = angleOffset.current + time * data.orbitSpeed;
            const x = earthPos.x + Math.cos(moonAngle) * data.orbitDistance;
            const z = earthPos.z + Math.sin(moonAngle) * data.orbitDistance;
            
            meshRef.current.position.set(x, 0.2, z);
            meshRef.current.rotation.y = time * 0.1;
            globalPlanetPositions['LUNA'] = meshRef.current.position.clone();
            return;
        }

        // Standard planets orbit Sol
        const angle = angleOffset.current + time * data.orbitSpeed;
        const x = Math.cos(angle) * data.orbitDistance;
        const z = Math.sin(angle) * data.orbitDistance;

        meshRef.current.position.set(x, 0, z);
        meshRef.current.rotation.y = time * 0.08;
        
        globalPlanetPositions[data.id] = meshRef.current.position.clone();
    });

    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto';
        return () => { document.body.style.cursor = 'auto'; };
    }, [hovered]);

    // Sun glows emissively, other planets receive light
    const isSol = data.id === 'SOL';
    const meshColor = isSol ? '#fbbf24' : data.color;

    return (
        <group>
            {/* Draw individual Orbit Line */}
            {data.id !== 'SOL' && data.id !== 'LUNA' && (
                <OrbitalPath distance={data.orbitDistance} />
            )}
            
            {/* Luna's orbit path around Earth */}
            {data.id === 'LUNA' && globalPlanetPositions['EARTH'] && (
                <OrbitalPathAroundEarth earthPos={globalPlanetPositions['EARTH']} radius={data.orbitDistance} />
            )}

            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(data);
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (data.id === 'EARTH' || data.id === 'LUNA' || data.id === 'MARS') {
                        onDoubleClick(data);
                    }
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    setHovered(false);
                }}
            >
                <sphereGeometry args={[data.radius, 32, 32]} />
                <meshStandardMaterial
                    color={meshColor}
                    roughness={0.6}
                    metalness={0.1}
                    emissive={meshColor}
                    emissiveIntensity={isSol ? 2.5 : hovered || isSelected ? 0.4 : 0.0}
                />

                {/* Saturn flat ring */}
                {data.id === 'SATURN' && (
                    <mesh rotation={[Math.PI / 2.3, 0.1, 0]}>
                        <ringGeometry args={[data.radius * 1.3, data.radius * 2.2, 64]} />
                        <meshStandardMaterial 
                            color="#b45309" 
                            side={THREE.DoubleSide} 
                            transparent 
                            opacity={0.7} 
                        />
                    </mesh>
                )}

                {/* Animated active Scanning Cone for selected network planets */}
                {(data.id === 'EARTH' || data.id === 'LUNA' || data.id === 'MARS') && (
                    <mesh rotation={[0, 0, 0]} position={[0, -data.radius * 1.1, 0]}>
                        <coneGeometry args={[data.radius * 0.6, data.radius * 1.5, 16, 1, true]} />
                        <meshBasicMaterial
                            color="#f59e0b"
                            wireframe
                            transparent
                            opacity={hovered ? 0.35 : isSelected ? 0.25 : 0.08}
                        />
                    </mesh>
                )}

                {/* Small labels above key active reference planets */}
                {(data.id === 'EARTH' || data.id === 'LUNA' || data.id === 'MARS' || data.id === 'SOL') && (
                    <Html distanceFactor={15} position={[0, data.radius * 1.6, 0]} center pointerEvents="none">
                        <div className="flex flex-col items-center">
                            <span className={`text-[7px] font-black font-mono px-1 py-0.5 rounded tracking-widest uppercase shadow-[0_0_8px_rgba(0,0,0,0.8)] border ${
                                isSelected 
                                ? 'bg-amber-500/20 text-amber-400 border-amber-400/50' 
                                : 'bg-black/80 text-zinc-400 border-zinc-500/20'
                            }`}>
                                {data.name}
                            </span>
                        </div>
                    </Html>
                )}
            </mesh>
        </group>
    );
};

// Helper for Lunar orbit rendering
const OrbitalPathAroundEarth = ({ earthPos, radius }: { earthPos: THREE.Vector3; radius: number }) => {
    const points = [];
    for (let i = 0; i <= 60; i++) {
        const theta = (i / 60) * Math.PI * 2;
        points.push(new THREE.Vector3(
            earthPos.x + Math.cos(theta) * radius,
            earthPos.y + 0.2,
            earthPos.z + Math.sin(theta) * radius
        ));
    }
    return (
        <Line 
            points={points} 
            color="#cbd5e1" 
            lineWidth={0.3} 
            opacity={0.15} 
            transparent 
        />
    );
};

// Laser linkages between Earth, Luna, and Mars
const InterplanetaryLasers = () => {
    const [positions, setPositions] = useState<{ earth: THREE.Vector3; luna: THREE.Vector3; mars: THREE.Vector3 } | null>(null);

    useFrame(() => {
        const earth = globalPlanetPositions['EARTH'];
        const luna = globalPlanetPositions['LUNA'];
        const mars = globalPlanetPositions['MARS'];

        if (earth && luna && mars) {
            setPositions({
                earth: earth.clone(),
                luna: luna.clone(),
                mars: mars.clone()
            });
        }
    });

    if (!positions) return null;

    return (
        <group>
            {/* Earth - Luna Link (White glowing laser) */}
            <Line 
                points={[positions.earth, positions.luna]} 
                color="#e2e8f0" 
                lineWidth={0.8} 
                opacity={0.3} 
                transparent 
            />

            {/* Earth - Mars Link (Cyan laser link) */}
            <Line 
                points={[positions.earth, positions.mars]} 
                color="#ea580c" 
                lineWidth={1} 
                opacity={0.25} 
                transparent 
            />

            {/* Luna - Mars Link (Orange backup link) */}
            <Line 
                points={[positions.luna, positions.mars]} 
                color="#f97316" 
                lineWidth={0.6} 
                opacity={0.15} 
                transparent 
            />
        </group>
    );
};

// Interactive orbiting 3D telemetry overlay
const TelemetryOverlay = ({ features }: { features: any[] }) => {
    const [hoveredNode, setHoveredNode] = useState<any | null>(null);
    const [nodePositions, setNodePositions] = useState<Array<{ pos: THREE.Vector3; feature: any; color: string }>>([]);

    useFrame(() => {
        const earthPos = globalPlanetPositions['EARTH'];
        if (!earthPos) return;

        const mapped = features.map((f, idx) => {
            const coords = f.geometry?.coordinates;
            if (!coords || coords.length < 2) return null;

            const lng = coords[0];
            const lat = coords[1];

            // Spherical coordinates projection on Earth's shell
            const phi = (lat * Math.PI) / 180;
            const theta = ((lng + 180) * Math.PI) / 180;
            const r = 1.35; // Hovering above 1.1 Earth mesh

            const ox = r * Math.cos(phi) * Math.sin(theta);
            const oy = r * Math.sin(phi);
            const oz = r * Math.cos(phi) * Math.cos(theta);

            const pos = new THREE.Vector3(earthPos.x + ox, earthPos.y + oy, earthPos.z + oz);

            // Determine color matching SovereignMap.tsx styles
            let color = '#38bdf8'; // Cyan default
            const category = f.properties?.category || '';
            if (category.includes('wildfire') || category.includes('fire')) {
                color = '#ef4444'; // Red
            } else if (category.includes('seismic') || category.includes('quake') || category.includes('warning')) {
                color = '#f59e0b'; // Yellow
            }

            return { pos, feature: f, color };
        }).filter(Boolean) as Array<{ pos: THREE.Vector3; feature: any; color: string }>;

        setNodePositions(mapped);
    });

    return (
        <group>
            {nodePositions.map((node, idx) => {
                const isHovered = hoveredNode === node.feature;
                const radius = isHovered ? 0.09 : 0.05;

                return (
                    <group key={idx}>
                        <mesh 
                            position={node.pos}
                            onPointerOver={(e) => {
                                e.stopPropagation();
                                setHoveredNode(node.feature);
                            }}
                            onPointerOut={(e) => {
                                e.stopPropagation();
                                setHoveredNode(null);
                            }}
                        >
                            <sphereGeometry args={[radius, 16, 16]} />
                            <meshBasicMaterial 
                                color={node.color}
                                toneMapped={false}
                            />
                        </mesh>
                        
                        {/* Interactive floating 3D pulsing halo */}
                        <mesh position={node.pos} rotation={[Math.PI / 2, 0, 0]}>
                            <ringGeometry args={[radius * 1.5, radius * 2.2, 16]} />
                            <meshBasicMaterial 
                                color={node.color} 
                                transparent 
                                opacity={0.3} 
                                side={THREE.DoubleSide} 
                            />
                        </mesh>

                        {/* HTML hover tooltips */}
                        {isHovered && (
                            <Html distanceFactor={10} position={[node.pos.x, node.pos.y + 0.3, node.pos.z]} center>
                                <div className="glass-panel p-2 border border-zinc-800 bg-black/95 text-white font-mono text-[7px] rounded-md shadow-2xl flex flex-col gap-0.5 whitespace-nowrap select-none pointer-events-none z-50">
                                    <span className="font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: node.color }} />
                                        {node.feature.properties?.title || 'Telemetry Target'}
                                    </span>
                                    <span className="text-[6px] text-zinc-400 uppercase tracking-wider">
                                        Lat: {node.feature.geometry.coordinates[1].toFixed(4)} // Lng: {node.feature.geometry.coordinates[0].toFixed(4)}
                                    </span>
                                    {node.feature.properties?.metadata && (
                                        <div className="flex flex-col gap-0.5 mt-0.5 border-t border-white/5 pt-0.5 text-[5.5px] text-zinc-500">
                                            {Object.entries(node.feature.properties.metadata).map(([k, v]: any) => (
                                                <span key={k} className="uppercase">{k}: {String(v)}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Html>
                        )}
                    </group>
                );
            })}
        </group>
    );
};

// Animated DTN Network packet nodes flying along the laser pathways
const TelemetryPacketNodes = () => {
    const [packets, setPackets] = useState<BundlePacket[]>([]);
    const [livePositions, setLivePositions] = useState<{ [id: string]: THREE.Vector3 }>({});

    // Poll DTNManager periodically to animate transmission status
    useEffect(() => {
        const manager = DTNManager.getInstance();
        const unsubscribe = manager.addListener((queue) => {
            // Keep only active bundles
            setPackets(queue.filter(b => b.status === 'TRANSMITTING' || b.status === 'QUEUED'));
        });
        return unsubscribe;
    }, []);

    useFrame(() => {
        if (packets.length === 0) return;

        const updated: { [id: string]: THREE.Vector3 } = {};
        packets.forEach(p => {
            const sourcePos = globalPlanetPositions[p.sourceNode];
            const targetPos = globalPlanetPositions[p.targetNode];

            if (sourcePos && targetPos) {
                // Linear interpolation based on packet transit progress
                const pos = new THREE.Vector3().lerpVectors(sourcePos, targetPos, p.transitProgress);
                updated[p.id] = pos;
            }
        });
        setLivePositions(updated);
    });

    return (
        <group>
            {packets.map(p => {
                const pos = livePositions[p.id];
                if (!pos) return null;

                // Color-match packet categories
                const pColor = p.targetNode === 'LUNA' ? '#ffffff' : '#f59e0b';

                return (
                    <mesh key={p.id} position={pos}>
                        <sphereGeometry args={[0.22, 16, 16]} />
                        <meshBasicMaterial 
                            color={pColor} 
                            toneMapped={false}
                        />
                        <pointLight color={pColor} intensity={2} distance={3} decay={1} />
                        <Html distanceFactor={12} position={[0, 0.4, 0]} center pointerEvents="none">
                            <div className="flex flex-col items-center select-none font-mono">
                                <span className="bg-black/90 text-amber-400 text-[5px] px-1 py-0.5 border border-amber-500/20 rounded uppercase tracking-widest whitespace-nowrap">
                                    PKG {p.id.split('-')[1]} ({Math.floor(p.transitProgress * 100)}%)
                                </span>
                            </div>
                        </Html>
                    </mesh>
                );
            })}
        </group>
    );
};

// Camera tracking controller that anchors controls on the selected planet 
// and triggers atmospheric entry if the camera gets extremely close (zoom continuum)
const CameraController = ({
    selectedPlanet,
    onCloseZoom,
    controlsRef
}: {
    selectedPlanet: PlanetData | null;
    onCloseZoom: (planet: PlanetData) => void;
    controlsRef: React.RefObject<any>;
}) => {
    const { camera } = useThree();
    const currentTarget = useRef(new THREE.Vector3(0, 0, 0));
    const activeDescentTriggered = useRef(false);

    // Reset lock-out flag when selected planet changes
    useEffect(() => {
        activeDescentTriggered.current = false;
    }, [selectedPlanet?.id]);

    useFrame(() => {
        const targetPos = new THREE.Vector3(0, 0, 0);
        if (selectedPlanet && selectedPlanet.id !== 'SOL') {
            const pos = globalPlanetPositions[selectedPlanet.id];
            if (pos) {
                targetPos.copy(pos);
            }
        }

        // Smoothly lerp camera track coordinates
        currentTarget.current.lerp(targetPos, 0.05);
        if (controlsRef.current) {
            controlsRef.current.target.copy(currentTarget.current);
            controlsRef.current.update();
        }

        // Zoom continuum detector
        if (
            selectedPlanet && 
            !activeDescentTriggered.current &&
            (selectedPlanet.id === 'EARTH' || selectedPlanet.id === 'LUNA' || selectedPlanet.id === 'MARS')
        ) {
            const planetPos = globalPlanetPositions[selectedPlanet.id];
            if (planetPos) {
                const dist = camera.position.distanceTo(planetPos);
                // OrbitControls distance check. If zoomed closer than 7.5 units, descend!
                if (dist < 7.5) {
                    activeDescentTriggered.current = true;
                    onCloseZoom(selectedPlanet);
                }
            }
        }
    });

    return null;
};

// Deep Space Field coordinate projection mapping component
interface DeepFieldPointsProps {
    data: any[];
    onHoverBody: (body: any | null) => void;
    onClickBody: (body: any) => void;
}

const DeepFieldPoints = ({ data, onHoverBody, onClickBody }: DeepFieldPointsProps) => {
    const pointsRef = useRef<THREE.Points>(null);

    // Generate Cartesian positions and color vectors
    const [positions, colors] = useMemo(() => {
        const pos: number[] = [];
        const col: number[] = [];
        const R = 85; // Mapping sphere radius bounding outer solar system

        data.forEach((body) => {
            const raRad = (body.ra * Math.PI) / 180;
            const decRad = (body.dec * Math.PI) / 180;

            const x = R * Math.cos(decRad) * Math.cos(raRad);
            const y = R * Math.sin(decRad);
            const z = R * Math.cos(decRad) * Math.sin(raRad);

            pos.push(x, y, z);

            const c = new THREE.Color();
            if (body.type === 'star') {
                c.set('#fef08a'); // Foreground Star: warm yellow
            } else if (body.type === 'galaxy') {
                c.set('#ea580c'); // Deep Field Galaxy: hot orange glow
            } else {
                c.set('#f43f5e'); // Quasar / Active Nucleus: magenta spark
            }
            col.push(c.r, c.g, c.b);
        });

        return [new Float32Array(pos), new Float32Array(col)];
    }, [data]);

    if (data.length === 0) return null;

    return (
        <points
            ref={pointsRef}
            onPointerMove={(e) => {
                e.stopPropagation();
                if (e.index !== undefined && e.index < data.length) {
                    onHoverBody(data[e.index]);
                }
            }}
            onPointerOut={(e) => {
                onHoverBody(null);
            }}
            onClick={(e) => {
                e.stopPropagation();
                if (e.index !== undefined && e.index < data.length) {
                    onClickBody(data[e.index]);
                }
            }}
        >
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.65}
                sizeAttenuation={true}
                vertexColors={true}
                transparent={true}
                opacity={0.85}
                depthWrite={false}
            />
        </points>
    );
};

// Main Interstellar Map component
export const InterstellarMap = () => {
    const { activePOI, setHUDState, celestialMesh } = useHUD();
    const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
    const [selectedBody, setSelectedBody] = useState<any | null>(null);
    const [telemetryFeatures, setTelemetryFeatures] = useState<any[]>([]);

    useEffect(() => {
        let active = true;
        const fetchTelemetry = async () => {
            try {
                const res = await fetch('/api/telemetry/geojson');
                if (res.ok) {
                    const data = await res.json();
                    if (active && data && Array.isArray(data.features)) {
                        setTelemetryFeatures(data.features);
                    }
                }
            } catch (err) {
                console.warn('[InterstellarMap] Telemetry poll failed:', err);
            }
        };
        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 10000);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    // Support Escape key to clear selected target and zoom back out
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedPlanet(null);
                setSelectedBody(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    const [hoveredBody, setHoveredBody] = useState<any | null>(null);
    const [celestialData, setCelestialData] = useState<any[]>([]);
    const controlsRef = useRef<any>(null);
    const [transitioning, setTransitioning] = useState<PlanetData | null>(null);
    const [transitionTimer, setTransitionTimer] = useState(0);

    // WebGL support probe
    const [hasWebGL, setHasWebGL] = useState<boolean>(true);
    useEffect(() => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            setHasWebGL(!!gl);
        } catch (e) {
            setHasWebGL(false);
        }
    }, []);

    // 2D SVG direct DOM references for 60 FPS updates
    const planetRefs = useRef<{ [key: string]: SVGGElement | null }>({});
    const lunaOrbitPathRef = useRef<SVGCircleElement>(null);
    const laserEarthLunaRef = useRef<SVGLineElement>(null);
    const laserEarthMarsRef = useRef<SVGLineElement>(null);
    const laserLunaMarsRef = useRef<SVGLineElement>(null);
    const packetRefs = useRef<{ [key: string]: SVGGElement | null }>({});
    const positionsRef = useRef<{ [key: string]: { x: number; y: number } }>({});
    const svgAngleOffsets = useRef<{ [key: string]: number }>({});
    const animFrameRef = useRef<number | null>(null);

    // Filter packets
    const [packets, setPackets] = useState<BundlePacket[]>([]);
    useEffect(() => {
        const manager = DTNManager.getInstance();
        const unsubscribe = manager.addListener((queue) => {
            setPackets(queue.filter(b => b.status === 'TRANSMITTING' || b.status === 'QUEUED'));
        });
        return unsubscribe;
    }, []);

    // Initialize random starting offsets for SVG orbits
    useEffect(() => {
        CELESTIAL_DB.forEach(p => {
            if (svgAngleOffsets.current[p.id] === undefined) {
                svgAngleOffsets.current[p.id] = p.id === 'SOL' ? 0 : Math.random() * Math.PI * 2;
            }
        });
    }, []);

    // High performance direct DOM mutation loop
    useEffect(() => {
        if (hasWebGL) return;

        const startTime = Date.now();

        const updatePositions = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const pos: { [key: string]: { x: number; y: number } } = {};
            pos['SOL'] = { x: 0, y: 0 };

            CELESTIAL_DB.forEach(p => {
                if (p.id === 'SOL' || p.id === 'LUNA') return;
                const angle = svgAngleOffsets.current[p.id] + elapsed * p.orbitSpeed;
                pos[p.id] = {
                    x: Math.cos(angle) * p.orbitDistance * 9,
                    y: Math.sin(angle) * p.orbitDistance * 9
                };
            });

            // Luna relative to Earth
            const earthPos = pos['EARTH'] || { x: 135, y: 0 };
            const lunaAngle = svgAngleOffsets.current['LUNA'] + elapsed * 0.06;
            pos['LUNA'] = {
                x: earthPos.x + Math.cos(lunaAngle) * 2.2 * 9,
                y: earthPos.y + Math.sin(lunaAngle) * 2.2 * 9
            };

            positionsRef.current = pos;

            // Direct DOM translates
            CELESTIAL_DB.forEach(p => {
                const el = planetRefs.current[p.id];
                const coordinates = pos[p.id];
                if (el && coordinates) {
                    el.setAttribute('transform', `translate(${coordinates.x}, ${coordinates.y})`);
                }
            });

            // Luna Orbit Path cx, cy updates
            if (lunaOrbitPathRef.current) {
                lunaOrbitPathRef.current.setAttribute('cx', String(earthPos.x));
                lunaOrbitPathRef.current.setAttribute('cy', String(earthPos.y));
            }

            // Laser connections updates
            const xEarth = pos['EARTH']?.x ?? 0;
            const yEarth = pos['EARTH']?.y ?? 0;
            const xLuna = pos['LUNA']?.x ?? 0;
            const yLuna = pos['LUNA']?.y ?? 0;
            const xMars = pos['MARS']?.x ?? 0;
            const yMars = pos['MARS']?.y ?? 0;

            if (laserEarthLunaRef.current) {
                laserEarthLunaRef.current.setAttribute('x1', String(xEarth));
                laserEarthLunaRef.current.setAttribute('y1', String(yEarth));
                laserEarthLunaRef.current.setAttribute('x2', String(xLuna));
                laserEarthLunaRef.current.setAttribute('y2', String(yLuna));
            }
            if (laserEarthMarsRef.current) {
                laserEarthMarsRef.current.setAttribute('x1', String(xEarth));
                laserEarthMarsRef.current.setAttribute('y1', String(yEarth));
                laserEarthMarsRef.current.setAttribute('x2', String(xMars));
                laserEarthMarsRef.current.setAttribute('y2', String(yMars));
            }
            if (laserLunaMarsRef.current) {
                laserLunaMarsRef.current.setAttribute('x1', String(xLuna));
                laserLunaMarsRef.current.setAttribute('y1', String(yLuna));
                laserLunaMarsRef.current.setAttribute('x2', String(xMars));
                laserLunaMarsRef.current.setAttribute('y2', String(yMars));
            }

            // Packet transmissions updates
            packets.forEach(packet => {
                const pEl = packetRefs.current[packet.id];
                if (pEl) {
                    const srcPos = pos[packet.sourceNode];
                    const tgtPos = pos[packet.targetNode];
                    if (srcPos && tgtPos) {
                        const px = srcPos.x + packet.transitProgress * (tgtPos.x - srcPos.x);
                        const py = srcPos.y + packet.transitProgress * (tgtPos.y - srcPos.y);
                        pEl.setAttribute('transform', `translate(${px}, ${py})`);
                    }
                }
            });

            animFrameRef.current = requestAnimationFrame(updatePositions);
        };

        animFrameRef.current = requestAnimationFrame(updatePositions);
        return () => {
            if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
        };
    }, [hasWebGL, packets]);

    // Load astronomical deep field coordinates
    useEffect(() => {
        fetch('/data/cosmos_deep_field.json')
            .then(res => res.json())
            .then(data => setCelestialData(data))
            .catch(err => console.error("Failed to load astronomical catalog:", err));
    }, []);

    // Default selection centers around active POV reference frame
    useEffect(() => {
        const frame = activePOI?.referenceFrame || 'EARTH';
        const defaultMatch = CELESTIAL_DB.find(p => p.id === frame);
        if (defaultMatch) {
            setSelectedPlanet(defaultMatch);
        }
    }, [activePOI?.referenceFrame]);

    const handlePlanetSelect = (planet: PlanetData) => {
        setSelectedPlanet(planet);
        setSelectedBody(null);
    };

    // Camera Flight Descent Initiator
    const handleDescent = (planet: PlanetData) => {
        if (planet.id !== 'EARTH' && planet.id !== 'LUNA' && planet.id !== 'MARS') {
            return; // Only active mesh nodes allow standard terminal landings
        }
        setTransitioning(planet);
        setTransitionTimer(100);
    };

    // Count-down ticker simulation during warp descent
    useEffect(() => {
        if (!transitioning) return;
        let elapsed = 100;
        const interval = setInterval(() => {
            elapsed -= 4;
            setTransitionTimer(elapsed);
            if (elapsed <= 0) {
                clearInterval(interval);
                setTransitioning(null);
                
                // Complete handshake transition down to surface maps
                const targetPOI: POIDetails = transitioning.id === 'EARTH' ? defaultPOI : transitioning.id === 'LUNA' ? {
                    name: "Clavius Crater Hub",
                    formattedAddress: "Clavius Crater, Selenographic Coord Frame, Luna",
                    website: "https://clavius.luna.lvhllc.org",
                    rating: 4.9,
                    photos: ["https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=600&q=80"],
                    coordinates: { lat: -58.4, lng: -14.4, alt: -1200 },
                    referenceFrame: 'LUNA',
                    ownership: {
                        ownerDid: "did:sovereign:luna:0x7c4e2b8a3e1c0d4f",
                        ownerName: "Luna Transport Logistics",
                        stakedSovereignUnits: 32000
                    },
                    publicPlans: "Phase 1: Excavate sub-surface lava tubes. Phase 2: Deploy solar collectors on crater rim.",
                    metrics: { solar: 95, wind: 0, water: 30, zoning: 40 }
                } : {
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
                    publicPlans: "Phase 1: Erect localized aerostat weather beacons. Phase 2: Expand geothermal water reservoirs.",
                    metrics: { solar: 40, wind: 65, water: 15, zoning: 55 }
                };

                setHUDState({
                    activePOI: targetPOI,
                    mapMode: 'SURFACE'
                });
            }
        }, 100);

        return () => clearInterval(interval);
    }, [transitioning, setHUDState]);

    return (
        <div className="absolute inset-0 z-0 bg-black flex flex-row items-stretch select-none overflow-hidden">
            
            {/* The 3D Canvas Viewport or 2D SVG Fallback */}
            <div className="flex-1 h-full relative">
                {hasWebGL ? (
                    <Canvas camera={{ position: [0, 22, 35], fov: 50 }}>
                        <color attach="background" args={['#0c0a09']} />
                        <ambientLight intensity={0.65} />
                        <pointLight position={[0, 0, 0]} intensity={3.5} distance={150} decay={1.1} />
                        
                        {/* Atmospheric outer glow stars */}
                        {celestialMesh ? (
                            <DeepFieldPoints 
                                data={celestialData} 
                                onHoverBody={setHoveredBody} 
                                onClickBody={(body) => {
                                    setSelectedPlanet(null);
                                    setSelectedBody(body);
                                }} 
                            />
                        ) : (
                            <Stars radius={90} depth={40} count={1200} factor={4} saturation={0.5} fade speed={1.2} />
                        )}

                        {/* Interactive Floating Tooltip for Deep Field Object */}
                        {celestialMesh && hoveredBody && (
                            <Html 
                                position={(() => {
                                    const raRad = (hoveredBody.ra * Math.PI) / 180;
                                    const decRad = (hoveredBody.dec * Math.PI) / 180;
                                    const R = 85;
                                    return [
                                        R * Math.cos(decRad) * Math.cos(raRad),
                                        R * Math.sin(decRad),
                                        R * Math.cos(decRad) * Math.sin(raRad)
                                    ];
                                })()}
                                pointerEvents="none"
                                center
                            >
                                <div className="glass-panel px-3 py-2 text-white font-sans text-xs rounded-lg flex flex-col gap-1 whitespace-nowrap select-none">
                                    <span className="font-black text-amber-400 uppercase tracking-widest">{hoveredBody.id}</span>
                                    <span className="text-[6px] text-zinc-400 uppercase tracking-wider">{hoveredBody.type} // mag: {hoveredBody.mag}</span>
                                    <span className="text-[6px] text-rose-400 tracking-wider">z = {hoveredBody.z}</span>
                                </div>
                            </Html>
                        )}
                        
                        {/* Planetary grid helper */}
                        <InterstellarGrid />

                        {/* Solar System Bodies */}
                        {CELESTIAL_DB.map((p) => (
                            <PlanetSphere
                                key={p.id}
                                data={p}
                                isSelected={selectedPlanet?.id === p.id}
                                onSelect={handlePlanetSelect}
                                onDoubleClick={handleDescent}
                            />
                        ))}

                        {/* Mesh node laser linkages */}
                        <InterplanetaryLasers />

                        {/* Real-time RF packet node flights */}
                        <TelemetryPacketNodes />

                        {/* Orbiting Telemetry Overlay */}
                        <TelemetryOverlay features={telemetryFeatures} />

                        <CameraController
                            selectedPlanet={selectedPlanet}
                            onCloseZoom={handleDescent}
                            controlsRef={controlsRef}
                        />

                        <OrbitControls
                            ref={controlsRef}
                            enableZoom={true}
                            maxDistance={110}
                            minDistance={2} // Allow close zooms to trigger the transition continuum
                            maxPolarAngle={Math.PI / 1.9} // Prevent clipping below bottom grid
                            enablePan={false}
                            enableDamping={true}
                            dampingFactor={0.05}
                            zoomSpeed={1.2}
                        />
                    </Canvas>
                ) : (
                    <svg viewBox="-300 -300 600 600" className="w-full h-full bg-[#02040a]">
                        <defs>
                            <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                                <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient id="scan-cone" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid systems */}
                        <circle cx="0" cy="0" r="100" fill="none" stroke="#ea580c" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.1" />
                        <circle cx="0" cy="0" r="200" fill="none" stroke="#ea580c" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.1" />
                        <circle cx="0" cy="0" r="300" fill="none" stroke="#ea580c" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.1" />
                        <line x1="-300" y1="0" x2="300" y2="0" stroke="#ea580c" strokeWidth="0.5" strokeDasharray="5 5" opacity="0.08" />
                        <line x1="0" y1="-300" x2="0" y2="300" stroke="#ea580c" strokeWidth="0.5" strokeDasharray="5 5" opacity="0.08" />

                        {/* Orbit trails */}
                        {CELESTIAL_DB.map((p) => {
                            if (p.id === 'SOL' || p.id === 'LUNA') return null;
                            return (
                                <circle
                                    key={`orbit-${p.id}`}
                                    cx="0"
                                    cy="0"
                                    r={p.orbitDistance * 9}
                                    fill="none"
                                    stroke="#ea580c"
                                    strokeWidth="0.5"
                                    opacity="0.15"
                                />
                            );
                        })}

                        {/* Luna orbit around Earth */}
                        <circle
                            ref={lunaOrbitPathRef}
                            r={2.2 * 9}
                            fill="none"
                            stroke="#cbd5e1"
                            strokeWidth="0.3"
                            opacity="0.15"
                            strokeDasharray="2 2"
                        />

                        {/* Laser communication pathways */}
                        <line ref={laserEarthLunaRef} stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
                        <line ref={laserEarthMarsRef} stroke="#ea580c" strokeWidth="1" opacity="0.3" />
                        <line ref={laserLunaMarsRef} stroke="#f97316" strokeWidth="0.6" opacity="0.2" />

                        {/* Packet telemetries */}
                        {packets.map(packet => {
                            const isLuna = packet.targetNode === 'LUNA';
                            const pColor = isLuna ? '#ffffff' : '#f59e0b';
                            return (
                                <g key={packet.id} ref={el => { packetRefs.current[packet.id] = el; }}>
                                    <circle r="4" fill={pColor} />
                                    <circle r="12" fill="none" stroke={pColor} strokeWidth="0.5" opacity="0.4" className="animate-ping" />
                                    <text y="-8" textAnchor="middle" fill="#f59e0b" className="font-mono text-[5px] uppercase tracking-widest pointer-events-none select-none">
                                        PKG {packet.id.split('-')[1]} ({Math.floor(packet.transitProgress * 100)}%)
                                    </text>
                                </g>
                            );
                        })}

                        {/* Celestial bodies */}
                        {CELESTIAL_DB.map((p) => {
                            const isSelected = selectedPlanet?.id === p.id;
                            const isSol = p.id === 'SOL';
                            const isInteractable = p.id === 'EARTH' || p.id === 'LUNA' || p.id === 'MARS';

                            return (
                                <g
                                    key={p.id}
                                    ref={el => { planetRefs.current[p.id] = el; }}
                                    className="cursor-pointer select-none"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePlanetSelect(p);
                                    }}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        if (isInteractable) {
                                            handleDescent(p);
                                        }
                                    }}
                                >
                                    {isSol && (
                                        <circle r={p.radius * 9 * 1.8} fill="url(#sun-glow)" opacity="0.6" />
                                    )}

                                    {isInteractable && (
                                        <polygon
                                            points={`0,0 -${p.radius * 9},30 ${p.radius * 9},30`}
                                            fill="url(#scan-cone)"
                                            opacity={isSelected ? 0.3 : 0.1}
                                        />
                                    )}

                                    <circle
                                        r={p.radius * 9}
                                        fill={p.color}
                                        stroke={isSelected ? '#f59e0b' : '#ffffff'}
                                        strokeWidth={isSelected ? 1.5 : 0.2}
                                        className="transition-all duration-300"
                                        style={{
                                            filter: isSelected ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))' : 'none'
                                        }}
                                    />

                                    {p.id === 'SATURN' && (
                                        <ellipse
                                            rx={p.radius * 9 * 1.8}
                                            ry={p.radius * 9 * 0.4}
                                            fill="none"
                                            stroke="#b45309"
                                            strokeWidth="2"
                                            opacity="0.7"
                                        />
                                    )}

                                    {isSelected && (
                                        <circle
                                            r={p.radius * 9 + 4}
                                            fill="none"
                                            stroke="#f59e0b"
                                            strokeWidth="0.5"
                                            strokeDasharray="2 2"
                                            className="animate-spin"
                                            style={{ transformOrigin: 'center', animationDuration: '10s' }}
                                        />
                                    )}

                                    {p.id === 'EARTH' && Array.isArray(telemetryFeatures) && telemetryFeatures.map((feat, fIdx) => {
                                        const total = telemetryFeatures.length;
                                        const angle = (fIdx / total) * Math.PI * 2;
                                        const r = 18; // Dist from Earth center in pixels (Earth is ~9.9px)
                                        const tx = r * Math.cos(angle);
                                        const ty = r * Math.sin(angle);

                                        let color = '#38bdf8'; // Cyan default
                                        const category = feat.properties?.category || '';
                                        if (category.includes('wildfire') || category.includes('fire')) {
                                            color = '#ef4444'; // Red
                                        } else if (category.includes('seismic') || category.includes('quake') || category.includes('warning')) {
                                            color = '#f59e0b'; // Yellow
                                        }

                                        return (
                                            <g key={`telemetry-2d-${fIdx}`} className="group/telemetry">
                                                {/* Pulsing ring */}
                                                <circle cx={tx} cy={ty} r="4" fill="none" stroke={color} strokeWidth="0.5" opacity="0.6" className="animate-ping" style={{ transformOrigin: `${tx}px ${ty}px` }} />
                                                {/* Core dot */}
                                                <circle cx={tx} cy={ty} r="2.2" fill={color} />
                                                
                                                {/* SVG hover tooltip */}
                                                <g className="opacity-0 group-hover/telemetry:opacity-100 pointer-events-none transition-opacity duration-150">
                                                    <rect
                                                        x={tx - 40}
                                                        y={ty - 18}
                                                        width="80"
                                                        height="12"
                                                        rx="1.5"
                                                        fill="rgba(0,0,0,0.95)"
                                                        stroke={color}
                                                        strokeWidth="0.5"
                                                    />
                                                    <text
                                                        x={tx}
                                                        y={ty - 10}
                                                        textAnchor="middle"
                                                        fill="#ffffff"
                                                        className="font-mono text-[4.5px] uppercase tracking-wider font-bold"
                                                    >
                                                        {feat.properties?.title ? (feat.properties.title.length > 20 ? feat.properties.title.substring(0, 18) + '..' : feat.properties.title) : 'Target'}
                                                    </text>
                                                </g>
                                            </g>
                                        );
                                    })}

                                    {(p.id === 'EARTH' || p.id === 'LUNA' || p.id === 'MARS' || p.id === 'SOL') && (
                                        <g transform={`translate(0, -${p.radius * 9 + 8})`}>
                                            <rect
                                                x={-p.name.length * 2.5 - 4}
                                                y="-6"
                                                width={p.name.length * 5 + 8}
                                                height="10"
                                                rx="2"
                                                fill="rgba(0,0,0,0.85)"
                                                stroke={isSelected ? '#f59e0b' : 'rgba(255,255,255,0.1)'}
                                                strokeWidth="0.5"
                                            />
                                            <text
                                                textAnchor="middle"
                                                y="1"
                                                fill={isSelected ? '#f59e0b' : '#a1a1aa'}
                                                className="font-mono text-[6px] font-black tracking-widest uppercase select-none pointer-events-none"
                                            >
                                                {p.name}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                )}

                {/* Cyberpunk Top Bar Overlay */}
                <div className="absolute top-4 left-4 right-4 pointer-events-none flex flex-row justify-between items-start font-mono z-10">
                    <div className="glass-panel px-4 py-2 border border-amber-500/20 bg-black/60 rounded-xl flex flex-row items-center gap-3">
                        <Orbit className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black tracking-widest text-amber-400">CELESTIAL ORBITAL VIEWPORT</span>
                            <span className="text-[6px] text-zinc-400 tracking-wider">UNIVERSAL MATRIX / REGISTRY FEED ACTIVE</span>
                        </div>
                    </div>

                    <div className="glass-panel px-4 py-2 border border-amber-500/20 bg-black/60 rounded-xl flex flex-col items-end">
                        <span className="text-[8px] text-amber-400 tracking-wider">STABILIZATION CODE: TR-0x4FA3</span>
                        <span className="text-[6px] text-zinc-500">LATENCY JITTER: +/- 0.05ms (TERRESTRIAL LOOP)</span>
                    </div>
                </div>

                {/* Cyberpunk Ambient Compass Watermark */}
                <div className="absolute bottom-4 left-4 pointer-events-none font-mono opacity-20 text-[8px] tracking-widest text-amber-400 flex flex-col gap-0.5 select-none z-10">
                    <span>FRAME RATE: 60.0 FPS [STABLE]</span>
                    <span>PROJECTION: ORTHOGRAPHIC SPATIAL</span>
                    <span>COGNITIVE MATRIX: INTERCONNECTED</span>
                </div>
            </div>

            {/* The Right Hand Holographic Control Sidebar */}
            <div className="w-80 border-l border-amber-400/20 bg-stone-950/60 relative z-10 flex flex-col items-stretch p-4 gap-4 overflow-y-auto select-none font-mono">
                
                {/* Header title */}
                <div className="flex flex-col gap-1 border-b border-amber-400/20 pb-3">
                    <div className="flex flex-row items-center gap-2">
                        <Radio className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-black tracking-widest text-white">SYSTEM SELECTOR</span>
                    </div>
                    <span className="text-[7px] text-zinc-400">TELEMETRY LINK STATUS AND COGNITIVE TRANSCEIVERS</span>
                </div>

                {/* Celestial Mesh Toggle Section */}
                <div className="glass-panel p-3 border border-amber-500/10 bg-black/40 rounded-xl flex flex-col gap-2 shrink-0">
                    <div className="flex flex-row justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-white uppercase tracking-wider">CELESTIAL OVERLAY</span>
                            <span className="text-[6px] text-zinc-400">COSMOS & DESI DEEP FIELD</span>
                        </div>
                        <button
                            onClick={() => {
                                const nextVal = !celestialMesh;
                                setHUDState({ celestialMesh: nextVal });
                                if (!nextVal) setSelectedBody(null);
                            }}
                            className={`px-2.5 py-1 border text-[8px] font-black uppercase tracking-widest rounded transition-all duration-300 cursor-pointer ${
                                celestialMesh 
                                    ? 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                            }`}
                        >
                            {celestialMesh ? 'ACTIVE' : 'OFFLINE'}
                        </button>
                    </div>
                </div>

                {/* Dynamic selected planet information card */}
                {selectedPlanet ? (
                    <div className="flex flex-col gap-3 flex-1">
                        
                        {/* Planet header and color node */}
                        <div className="glass-panel p-3 border border-amber-500/10 bg-black/40 rounded-xl flex flex-row items-center gap-3">
                            <div 
                                className="w-4 h-4 rounded-full border border-black/40 shrink-0"
                                style={{ backgroundColor: selectedPlanet.color, boxShadow: `0 0 10px ${selectedPlanet.color}` }}
                            />
                            <div className="flex flex-col flex-1">
                                <div className="flex flex-row justify-between items-center">
                                    <span className="text-[11px] font-black text-white uppercase tracking-wider">{selectedPlanet.name}</span>
                                    <button 
                                        onClick={() => setSelectedPlanet(null)}
                                        className="text-[8px] text-zinc-500 hover:text-amber-400 font-bold uppercase cursor-pointer transition-colors duration-200"
                                        title="Deselect Planet & Reset Focus"
                                    >
                                        [Reset System Focus]
                                    </button>
                                </div>
                                <span className="text-[6px] text-zinc-400 uppercase tracking-widest">{selectedPlanet.details.type}</span>
                            </div>
                        </div>

                        {/* Interactive Stats Table */}
                        <div className="glass-panel p-3 border border-amber-500/10 bg-black/40 rounded-xl flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-[6px] text-zinc-500 tracking-widest uppercase">ATMOSPHERE</span>
                                <span className="text-[8px] text-zinc-300 font-bold uppercase">{selectedPlanet.details.atmosphere}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[6px] text-zinc-500 tracking-widest uppercase">SURFACE TEMPERATURE</span>
                                <span className="text-[8px] text-zinc-300 font-bold uppercase">{selectedPlanet.details.temp}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[6px] text-zinc-500 tracking-widest uppercase">GOVERNANCE ENTITY</span>
                                <span className="text-[8px] text-amber-500 font-bold uppercase tracking-wide">{selectedPlanet.details.governance}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[6px] text-zinc-500 tracking-widest uppercase">REGISTRY SCAN DENSITY</span>
                                <span className="text-[8px] text-zinc-300 font-bold uppercase">{selectedPlanet.details.scannedRegions}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[6px] text-zinc-500 tracking-widest uppercase">RF-5050 NETWORKING CONFIG</span>
                                <span className="text-[8px] text-orange-400 font-black tracking-wide uppercase">{selectedPlanet.details.networkStatus}</span>
                            </div>
                        </div>

                        {/* Node Telemetry summary */}
                        <div className="glass-panel p-3 border border-amber-500/10 bg-black/40 rounded-xl flex flex-col gap-2">
                            <div className="flex flex-row justify-between items-center text-[7px] tracking-widest text-zinc-400 border-b border-amber-400/10 pb-1.5">
                                <span>SOVEREIGN MESH NODES</span>
                                <span className="text-amber-400 font-black">{selectedPlanet.details.nodesActive} ACTIVE</span>
                            </div>
                            <div className="flex flex-row justify-between items-center text-[8px] text-zinc-300">
                                <span className="flex flex-row items-center gap-1.5">
                                    <Database className="w-3 h-3 text-amber-400" /> DB SUBSYSTEM
                                </span>
                                <span className="text-[7px] text-zinc-400 font-bold">{selectedPlanet.details.nodesActive > 0 ? 'SQLITE COMPATIBLE' : 'NONE'}</span>
                            </div>
                            <div className="flex flex-row justify-between items-center text-[8px] text-zinc-300">
                                <span className="flex flex-row items-center gap-1.5">
                                    <Network className="w-3 h-3 text-amber-400" /> ROUTER STATUS
                                </span>
                                <span className="text-[7px] text-amber-400 font-bold">{selectedPlanet.details.nodesActive > 0 ? 'RFC 5050 DELAY SYNC' : 'OFFLINE'}</span>
                            </div>
                        </div>

                        {/* Interactive Descent Flight Launcher */}
                        {selectedPlanet.details.nodesActive > 0 ? (
                            <button
                                onClick={() => handleDescent(selectedPlanet)}
                                disabled={transitioning !== null}
                                className="mt-auto px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-[10px] font-bold rounded-lg uppercase tracking-widest transition-all duration-300 flex flex-row items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowDownCircle className="w-4 h-4 animate-bounce" />
                                Initiate Surface Descent
                            </button>
                        ) : (
                            <div className="mt-auto glass-panel p-3 border border-amber-500/20 bg-amber-950/10 rounded-xl flex flex-row items-start gap-2">
                                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider">Descent Restrained</span>
                                    <span className="text-[6px] text-zinc-400 leading-normal">
                                        No active Promethean substrate mesh has been authorized on this celestial body. High-fidelity terrain descent files are locked.
                                    </span>
                                </div>
                            </div>
                        )}

                    </div>
                ) : selectedBody ? (
                    <div className="flex flex-col gap-3 flex-1">
                        
                        {/* Deep Space Body header */}
                        <div className="glass-panel p-3 border border-pink-500/20 bg-black/40 rounded-xl flex flex-row items-center gap-3">
                            <div 
                                className={`w-3.5 h-3.5 rounded-full border border-black/40 shrink-0 ${
                                    selectedBody.type === 'star' ? 'bg-yellow-200' : selectedBody.type === 'galaxy' ? 'bg-amber-400' : 'bg-rose-500'
                                }`}
                                style={{ 
                                    boxShadow: `0 0 10px ${selectedBody.type === 'star' ? '#fef08a' : selectedBody.type === 'galaxy' ? '#22d3ee' : '#f43f5e'}`
                                }}
                            />
                            <div className="flex flex-col flex-1">
                                <div className="flex flex-row justify-between items-center">
                                    <span className="text-[11px] font-black text-white uppercase tracking-wider">{selectedBody.id}</span>
                                    <button 
                                        onClick={() => setSelectedBody(null)}
                                        className="text-[8px] text-zinc-500 hover:text-zinc-300 font-bold uppercase cursor-pointer"
                                    >
                                        [ESC]
                                    </button>
                                </div>
                                <span className="text-[6px] text-zinc-400 uppercase tracking-widest">Deep Field {selectedBody.type}</span>
                            </div>
                        </div>

                        {/* Interactive Stats Table */}
                        <div className="glass-panel p-3 border border-amber-500/10 bg-black/40 rounded-xl flex flex-col gap-2">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[6px] text-zinc-500 tracking-widest uppercase">RIGHT ASCENSION (RA)</span>
                                <span className="text-[8px] text-zinc-300 font-bold uppercase">{selectedBody.ra}°</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[6px] text-zinc-500 tracking-widest uppercase">DECLINATION (DEC)</span>
                                <span className="text-[8px] text-zinc-300 font-bold uppercase">{selectedBody.dec}°</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[6px] text-zinc-500 tracking-widest uppercase">PHOTOMETRIC MAGNITUDE</span>
                                <span className="text-[8px] text-zinc-300 font-bold uppercase">{selectedBody.mag} mag</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[6px] text-zinc-500 tracking-widest uppercase">SPECTRAL REDSHIFT (z)</span>
                                <span className="text-[8px] text-rose-400 font-black tracking-wide uppercase">{selectedBody.z}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[6px] text-zinc-500 tracking-widest uppercase">COSMOLOGICAL CLASSIFICATION</span>
                                <span className="text-[8px] text-amber-400 font-bold uppercase tracking-wider">
                                    {selectedBody.type === 'star' ? 'Milky Way Foreground Star' : selectedBody.type === 'galaxy' ? 'Luminous Red Galaxy (LRG)' : 'Active Galactic Nucleus (Quasar)'}
                                </span>
                            </div>
                        </div>

                        {/* Lightyear distance estimation */}
                        <div className="glass-panel p-3 border border-amber-500/10 bg-black/40 rounded-xl flex flex-col gap-1 text-[7px] text-zinc-400 leading-normal">
                            <span className="font-bold text-zinc-300 uppercase tracking-wider text-[8px] mb-1">COSMIC SCALE SPECIFICATION</span>
                            <span>Calculated radial distance from solar barycenter is approximately <strong className="text-amber-400">{(selectedBody.z * 13.8 * 3.26).toFixed(2)} Billion LY</strong>.</span>
                            <span className="mt-1 text-zinc-500 text-[6px]">COSMOS Field coordinates calibrated by HST observations.</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-zinc-500 text-[9px] uppercase tracking-widest leading-relaxed">
                        Hover or Select a Planet Mesh in the cosmic grid to center telemetry trackers.
                    </div>
                )}
            </div>

            {/* Cinematic Telemetry Warp Overlap during transitions */}
            {transitioning && (
                <div 
                    className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center font-mono select-none"
                    style={{ animation: 'glitch-flicker 0.2s infinite' }}
                >
                    <div className="relative flex flex-col items-center max-w-sm w-full p-6 text-center gap-6">
                        
                        {/* Entry Radar/Compass ring */}
                        <div className="relative flex items-center justify-center w-24 h-24">
                            <div className="absolute inset-0 border border-dashed border-amber-400/40 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                            <div className="absolute inset-2 border border-amber-400/20 rounded-full animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
                            <Layers className="w-8 h-8 text-zinc-400" />
                        </div>

                        {/* Flight computer readouts */}
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-amber-400 tracking-[0.25em] uppercase">ATMOSPHERIC ENTRY INTERFACE</h3>
                            <p className="text-[7px] text-zinc-500 tracking-widest uppercase">PROMETHEAN COGNITIVE TELEMETRY COUPLING</p>
                        </div>

                        {/* Real-time progression stats */}
                        <div className="w-full space-y-2">
                            <div className="flex flex-row justify-between text-[7px] text-zinc-400 tracking-widest">
                                <span>WARP COEFFICIENT: {((100 - transitionTimer) * 0.1).toFixed(1)}c</span>
                                <span>ALTITUDE: {(transitionTimer * 125).toLocaleString()} KM</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_8px_#f59e0b]"
                                    style={{ width: `${100 - transitionTimer}%` }}
                                />
                            </div>
                            <div className="flex flex-row justify-between text-[6px] text-zinc-500 tracking-wider">
                                <span>COGNITIVE BRAIN RE-GRIDDING...</span>
                                <span>LOCKING REFERENCE FRAME: {transitioning.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
