'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useHUD, POIDetails, defaultPOI } from '../lib/hud-store';
import { PlanetData, CELESTIAL_DB, getCelestialById } from '../lib/celestial-data';
import { DTNManager, BundlePacket } from '../lib/dtn-manager';
import { Orbit, Radio, Navigation, Zap, Network, Database, Layers, ArrowDownCircle, ShieldAlert } from 'lucide-react';



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
    const { activePOI, setHUDState, celestialMesh, selectedCelestialId, selectedDeepFieldBody, interstellarTransitioning } = useHUD();
    const selectedPlanet = selectedCelestialId ? getCelestialById(selectedCelestialId) ?? null : null;
    const selectedBody = selectedDeepFieldBody;
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
                setHUDState({ selectedCelestialId: null, selectedDeepFieldBody: null });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setHUDState]);
    const [hoveredBody, setHoveredBody] = useState<any | null>(null);
    const [celestialData, setCelestialData] = useState<any[]>([]);
    const controlsRef = useRef<any>(null);

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
        setHUDState({ selectedCelestialId: frame });
    }, [activePOI?.referenceFrame, setHUDState]);

    const handlePlanetSelect = (planet: PlanetData) => {
        setHUDState({ selectedCelestialId: planet.id, selectedDeepFieldBody: null });
    };

    // Camera Flight Descent Initiator — signals HUD store, page.tsx handles the overlay
    const handleDescent = (planet: PlanetData) => {
        if (planet.id !== 'EARTH' && planet.id !== 'LUNA' && planet.id !== 'MARS') {
            return;
        }
        setHUDState({ interstellarTransitioning: planet.id });
    };

    // Descent countdown is now managed by page.tsx (atmospheric entry overlay at page level)

    return (
        <div className="absolute inset-0 z-0 bg-black select-none overflow-hidden">
            
            {/* The 3D Canvas Viewport or 2D SVG Fallback */}
            <div className="absolute inset-0 relative">
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
                                    setHUDState({ selectedCelestialId: null });
                                    setHUDState({ selectedDeepFieldBody: body });
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
            </div>
        </div>
    );
};
