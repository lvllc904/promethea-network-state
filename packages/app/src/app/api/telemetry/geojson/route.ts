import { NextResponse } from 'next/server';

// -------------------------------------------------------------------------
//  Osiris Planetary Intelligence — Cloud-Native Telemetry Proxy
//  
//  Priority order:
//    1. Try the local depthos-bridge daemon (dev / edge node mode)
//    2. If daemon is offline, run live OSINT fetches directly (production)
//    3. Final fallback: kinematic simulation with animated coordinates
// -------------------------------------------------------------------------

const DAEMON_URL = process.env.DEPTHOS_BRIDGE_URL || 'http://localhost:9999';
const DAEMON_TIMEOUT_MS = 1500;

// ── Live OSINT Fetchers ───────────────────────────────────────────────────

async function fetchOpenSkyFlights(): Promise<any[]> {
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        // Global coverage bounding box
        const res = await fetch(
            'https://opensky-network.org/api/states/all?lamin=-60&lomin=-180&lamax=75&lomax=180',
            { signal: ctrl.signal, cache: 'no-store' }
        );
        clearTimeout(t);
        if (!res.ok) throw new Error(`OpenSky status ${res.status}`);
        const data = await res.json() as any;
        const states: any[][] = data.states || [];

        return states.slice(0, 20).flatMap((s: any[]) => {
            const callsign = (s[1] || '').trim() || `FLIGHT-${s[0]}`;
            const lng = s[5];
            const lat = s[6];
            if (typeof lat !== 'number' || typeof lng !== 'number') return [];
            const altFt = s[7] ? Math.round(s[7] * 3.28084) : 32000;
            const knots = s[9] ? Math.round(s[9] * 1.94384) : 450;
            const hdg = s[10] || 90;
            return [{
                type: 'Feature',
                properties: {
                    id: `OSIRIS-FLIGHT-${callsign}`,
                    category: 'sdk_air',
                    severity: 'LOW',
                    title: `Flight ${callsign}`,
                    metadata: { callsign, altitude: altFt, velocityKnots: knots, heading: hdg, aircraftType: 'Commercial Aircraft', operator: 'OpenSky Live ADS-B' }
                },
                geometry: { type: 'Point', coordinates: [lng, lat] }
            }];
        });
    } catch {
        return [];
    }
}

async function fetchUSGSEarthquakes(): Promise<any[]> {
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(
            'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5&limit=15&orderby=time',
            { signal: ctrl.signal, cache: 'no-store' }
        );
        clearTimeout(t);
        if (!res.ok) throw new Error(`USGS status ${res.status}`);
        const geojson = await res.json() as any;
        return (geojson.features || []).flatMap((f: any) => {
            const p = f.properties || {};
            const c = (f.geometry || {}).coordinates || [];
            if (c.length < 2) return [];
            const mag = p.mag || 3.0;
            const severity = mag >= 5.0 ? 'HIGH' : mag >= 4.0 ? 'MEDIUM' : 'LOW';
            return [{
                type: 'Feature',
                properties: {
                    id: `OSIRIS-SEISMIC-${f.id}`,
                    category: 'earthquakes',
                    severity,
                    intensity: mag,
                    title: p.title || `M ${mag} Earthquake`,
                    metadata: { magnitude: mag, depthKm: c[2] || 10, tsunamiWarning: p.tsunami || 0, reportingAgency: 'USGS Real-Time Network' }
                },
                geometry: { type: 'Point', coordinates: [c[0], c[1]] }
            }];
        });
    } catch {
        return [];
    }
}

async function fetchNASAFIRMS(): Promise<any[]> {
    const firmsKey = process.env.FIRMS_MAP_KEY;
    if (!firmsKey) return [];
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch(
            `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${firmsKey}/VIIRS_SNPP_NRT/world/1`,
            { signal: ctrl.signal, cache: 'no-store' }
        );
        clearTimeout(t);
        if (!res.ok) throw new Error(`FIRMS status ${res.status}`);
        const csv = await res.text();
        const lines = csv.split('\n').slice(1).filter(Boolean);
        return lines.slice(0, 10).flatMap((line) => {
            const p = line.split(',');
            if (p.length < 5) return [];
            const lat = parseFloat(p[0]), lng = parseFloat(p[1]);
            if (isNaN(lat) || isNaN(lng)) return [];
            const frp = parseFloat(p[4]) || 15.0;
            return [{
                type: 'Feature',
                properties: {
                    id: `OSIRIS-THERMAL-${p[2]}-${p[3]}`,
                    category: 'wildfire',
                    severity: frp >= 40 ? 'CRITICAL' : 'HIGH',
                    intensity: frp,
                    title: 'Thermal Fire Hotspot (NASA VIIRS)',
                    metadata: { fireRadiativePowerMw: frp, satelliteSource: 'Suomi NPP (VIIRS)', confidence: 'HIGH', detectionTime: new Date().toISOString() }
                },
                geometry: { type: 'Point', coordinates: [lng, lat] }
            }];
        });
    } catch {
        return [];
    }
}

// ── Static / Simulated Layers (always included) ───────────────────────────

function buildStaticLayers(now: number): any[] {
    const features: any[] = [];

    // Maritime vessels (kinematic simulation)
    const vessels = [
        { id: 'MAR-802', name: 'Sovereign Harvest', type: 'Cargo Bulk Carrier', baseLat: 34.0, baseLng: 142.5, naval: false },
        { id: 'NVL-09', name: 'TPNS Guardian-V', type: 'Naval Patrol Cutter', baseLat: 31.5, baseLng: -79.8, naval: true },
        { id: 'MAR-311', name: 'Vanguard Voyager', type: 'Liquid Gas Tanker', baseLat: 22.0, baseLng: -115.0, naval: false },
        { id: 'NVL-12', name: 'Promethean Shield', type: 'Research Vessel', baseLat: 33.8, baseLng: 138.2, naval: true }
    ];
    vessels.forEach(v => {
        const rad = (now / 1000 / 600) * 2 * Math.PI;
        features.push({
            type: 'Feature',
            properties: {
                id: `OSIRIS-VESSEL-${v.id}`,
                category: v.naval ? 'sdk_naval' : 'sdk_sea',
                severity: v.naval ? 'MEDIUM' : 'LOW',
                title: `${v.name} (${v.type})`,
                metadata: { hullId: v.id, vesselName: v.name, vesselType: v.type, knotSpeed: v.naval ? 22.5 : 14.2, status: 'UNDERWAY' }
            },
            geometry: { type: 'Point', coordinates: [v.baseLng + Math.sin(rad) * 1.5, v.baseLat + Math.cos(rad * 2) * 1.5] }
        });
    });

    // Orbital satellites (kinematic)
    const sats = [
        { id: 'SAT-01', name: 'Sovereign Sentinel-1', altitude: 420, inclination: 51.6 },
        { id: 'SAT-02', name: 'Promethea Cognitive Relay', altitude: 550, inclination: 97.5 },
        { id: 'SAT-03', name: 'Starlink-TPNS-A', altitude: 525, inclination: 53.0 }
    ];
    sats.forEach((sat, i) => {
        const theta = ((now / (90 * 60 * 1000)) * 2 * Math.PI) + (i * Math.PI / 1.5);
        features.push({
            type: 'Feature',
            properties: {
                id: `OSIRIS-SATELLITE-${sat.id}`,
                category: 'satellites',
                severity: 'LOW',
                title: sat.name,
                metadata: { altitudeKm: sat.altitude, inclinationDegrees: sat.inclination, activeUplink: 'Delay-Tolerant Laser Mesh' }
            },
            geometry: { type: 'Point', coordinates: [(((theta * 180 / Math.PI) % 360) - 180), Math.sin(theta) * sat.inclination] }
        });
    });

    // Sovereign citadel intel nodes
    const citadels = [
        { id: 'INC-101', title: 'Sovereign Mesh Node Online — Tokyo Core', lat: 35.6762, lng: 139.6503, cat: 'cctv', alert: 'LOW', msg: 'System integrity active. 47 peer nodes attached.' },
        { id: 'INC-102', title: 'Wyoming Compute Citadel Perimeter Feed', lat: 42.8252, lng: -108.7513, cat: 'cctv', alert: 'LOW', msg: 'Secure entry monitor active. Radical transparency stream live.' },
        { id: 'INC-201', title: 'Global Grid Security Warning // Delmarva Port', lat: 39.12, lng: -75.52, cat: 'news_intel', alert: 'MEDIUM', msg: 'ICS cyber-intrusion probing detected at municipal facility.' },
        { id: 'INC-202', title: 'Active RWA Node Audit — Geneva', lat: 46.2044, lng: 6.1432, cat: 'live_news', alert: 'LOW', msg: 'Sovereign appraisers verifying property boundaries for RWA proposal.' },
        { id: 'INC-203', title: 'Supply Chain Alert // Suez Corridor', lat: 29.97, lng: 32.53, cat: 'global_incidents', alert: 'CRITICAL', msg: 'Vessel bottleneck routing delaying mineral transports 48hrs.' }
    ];
    citadels.forEach(inc => {
        features.push({
            type: 'Feature',
            properties: {
                id: `OSIRIS-INTEL-${inc.id}`,
                category: inc.cat,
                severity: inc.alert,
                title: inc.title,
                metadata: { summary: inc.msg, reportingHub: 'Osiris Planetary AI', witnessVerified: true }
            },
            geometry: { type: 'Point', coordinates: [inc.lng, inc.lat] }
        });
    });

    return features;
}

// ── Kinematic simulation fallback (for when all APIs are down) ────────────

function buildKinematicFallback(now: number): any[] {
    const timeFactor = (now / 1000 / 60) % 360;
    const rad = (timeFactor * Math.PI) / 180;

    const flights = [
        { callsign: 'PAC-810', origin: 'HND', dest: 'SFO', baseLat: 37.0, baseLng: -150.0, speed: 480, heading: 85, alt: 35000 },
        { callsign: 'PRM-001', origin: 'WYO', dest: 'TYO', baseLat: 40.0, baseLng: -140.0, speed: 520, heading: 265, alt: 41000 },
        { callsign: 'DL-430',  origin: 'JAX', dest: 'LHR', baseLat: 42.0, baseLng: -45.0,  speed: 490, heading: 60,  alt: 37000 },
        { callsign: 'ANA-92',  origin: 'NRT', dest: 'LAX', baseLat: 36.5, baseLng: 170.0,  speed: 510, heading: 90,  alt: 39000 },
        { callsign: 'SVR-88',  origin: 'HKG', dest: 'ZRH', baseLat: 48.0, baseLng: 65.0,   speed: 470, heading: 310, alt: 33000 }
    ];

    return flights.map((route, idx) => {
        const r2 = (timeFactor / 30 * Math.PI) / 180;
        const dLat = Math.sin(r2) * 4 * Math.sin((route.heading * Math.PI) / 180);
        const dLng = Math.sin(r2) * 4 * Math.cos((route.heading * Math.PI) / 180);
        return {
            type: 'Feature',
            properties: {
                id: `OSIRIS-FLIGHT-${route.callsign}`,
                category: 'sdk_air',
                severity: 'LOW',
                title: `Flight ${route.callsign} (${route.origin} → ${route.dest})`,
                metadata: {
                    callsign: route.callsign,
                    altitude: route.alt + Math.floor(Math.sin(rad * 5) * 500),
                    velocityKnots: route.speed + Math.floor(Math.sin(rad * 3) * 10),
                    heading: (route.heading + (Math.sin(rad) > 0 ? 0 : 180)) % 360,
                    aircraftType: idx % 2 === 0 ? 'Airbus A350-900' : 'Boeing 787-9',
                    operator: 'Sovereign Airlink Transport (Simulated)'
                }
            },
            geometry: { type: 'Point', coordinates: [route.baseLng + dLng, route.baseLat + dLat] }
        };
    });
}

// ── Main Handler ──────────────────────────────────────────────────────────

export async function GET() {
    // 1. Try local daemon first
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), DAEMON_TIMEOUT_MS);
        const res = await fetch(`${DAEMON_URL}/api/telemetry/geojson`, { signal: ctrl.signal, cache: 'no-store' });
        clearTimeout(t);
        if (res.ok) {
            const data = await res.json();
            return NextResponse.json(data, {
                headers: { 'Cache-Control': 'no-store', 'X-Osiris-Source': 'local-daemon' }
            });
        }
    } catch {
        // Daemon offline — proceed to cloud-native fetch
    }

    // 2. Run live OSINT fetches in parallel (cloud-native Osiris)
    const now = Date.now();
    const [flights, earthquakes, wildfires] = await Promise.all([
        fetchOpenSkyFlights(),
        fetchUSGSEarthquakes(),
        fetchNASAFIRMS()
    ]);

    const staticLayers = buildStaticLayers(now);

    // Use kinematic simulation for flights if OpenSky returned nothing
    const flightFeatures = flights.length > 0 ? flights : buildKinematicFallback(now);

    const allFeatures = [
        ...flightFeatures,
        ...earthquakes,
        ...wildfires,
        ...staticLayers
    ];

    const source = flights.length > 0 ? 'live-opensky' : 'kinematic-simulation';

    return NextResponse.json(
        { type: 'FeatureCollection', features: allFeatures },
        {
            headers: {
                'Cache-Control': 'public, max-age=12, stale-while-revalidate=30',
                'X-Osiris-Source': source,
                'X-Osiris-Features': String(allFeatures.length),
                'X-Osiris-Timestamp': new Date().toISOString()
            }
        }
    );
}
