'use client';

// Shared celestial data module — used by InterstellarMap (3D/SVG canvas)
// and by the Cockpit HUD panels to display planet details.

export interface PlanetData {
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

export const CELESTIAL_DB: PlanetData[] = [
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

/** Look up a planet by ID */
export function getCelestialById(id: string): PlanetData | undefined {
    return CELESTIAL_DB.find(p => p.id === id);
}
