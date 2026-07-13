import { NextResponse } from 'next/server';

export async function GET() {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500);

    const daemonUrl = process.env.DEPTHOS_BRIDGE_URL || 'http://localhost:9999';

    try {
        const response = await fetch(`${daemonUrl}/api/telemetry/geojson`, {
            signal: controller.signal,
            cache: 'no-store'
        });
        clearTimeout(id);

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json(data);
        }
        throw new Error(`HTTP status ${response.status}`);
    } catch (err: any) {
        clearTimeout(id);
        console.warn(`[Telemetry Proxy] Daemon offline at ${daemonUrl}. Returning live animated telemetry fallback.`);

        // Dynamic time-based kinematics to make coordinates drift naturally over time
        const now = Date.now();
        const timeFactor = (now / 1000 / 60) % 360; // 60s full-rotation loop
        const rad = (timeFactor * Math.PI) / 180;

        // Animate each target with different speeds and phases so they look like distinct moving vessels
        const driftAirX = Math.sin(rad * 2) * 0.18;
        const driftAirY = Math.cos(rad * 1.5) * 0.12;

        const driftSkyX = Math.sin(rad * 1.2 + 2) * 0.22;
        const driftSkyY = Math.cos(rad * 0.8 + 1) * 0.15;

        const driftTyoX = Math.sin(rad * 2.5 + 4) * 0.15;
        const driftTyoY = Math.cos(rad * 2 + 3) * 0.1;

        const driftPatrolX = Math.sin(rad * 0.6 + 1.5) * 0.08;
        const driftPatrolY = Math.cos(rad * 0.4 + 2) * 0.04;

        const driftTugX = Math.sin(rad * 0.8 + 3) * 0.05;
        const driftTugY = Math.cos(rad * 0.5 + 4) * 0.03;

        return NextResponse.json({
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [-108.7513 + 0.15 + driftAirX, 42.8252 + 0.12 + driftAirY]
                    },
                    properties: {
                        category: "sdk_air",
                        severity: "info",
                        title: "Promethean Air-Sentry Node #102",
                        metadata: {
                            heading: Math.round((timeFactor * 2) % 360),
                            callsign: "PR-A102",
                            altitude: Math.round(28000 + Math.sin(rad * 5) * 1200)
                        }
                    }
                },
                {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [-108.7513 - 0.22 + driftSkyX, 42.8252 - 0.18 + driftSkyY]
                    },
                    properties: {
                        category: "sdk_air",
                        severity: "info",
                        title: "Citizen Sky-Link Cargo Transport",
                        metadata: {
                            heading: Math.round((timeFactor * 1.5 + 180) % 360),
                            callsign: "SKY-LN7",
                            altitude: Math.round(18500 + Math.cos(rad * 3) * 800)
                        }
                    }
                },
                {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [139.6503 + 0.25 + driftTyoX, 35.6762 + 0.22 + driftTyoY]
                    },
                    properties: {
                        category: "sdk_air",
                        severity: "info",
                        title: "Tokyo Airway Commuter Drone",
                        metadata: {
                            heading: Math.round((timeFactor * 3) % 360),
                            callsign: "TYO-DR3",
                            altitude: Math.round(4200 + Math.sin(rad * 10) * 300)
                        }
                    }
                },
                {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [-81.6557 - 0.35 + driftPatrolX, 30.3322 + 0.45 + driftPatrolY]
                    },
                    properties: {
                        category: "sdk_naval",
                        severity: "warning",
                        title: "Atlantic Ocean Substrate Patrol",
                        metadata: {
                            vesselName: "Sovereign Wave-Rider VII"
                        }
                    }
                },
                {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [-81.6557 + 0.2 + driftTugX, 30.3322 + 0.15 + driftTugY]
                    },
                    properties: {
                        category: "sdk_sea",
                        severity: "info",
                        title: "Jacksonville Harbor Drone Tugboat",
                        metadata: {
                            vesselName: "TPNS Tug-99"
                        }
                    }
                }
            ]
        });
    }
}
