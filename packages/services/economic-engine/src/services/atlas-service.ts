import { db, COLLECTIONS } from '../db';
import { priceOracle } from '../tools/price-oracle';
import { finnhubService } from '../tools/finnhub-service';

export interface AtlasLayer {
    id: string;
    type: 'COMMODITY' | 'LIQUIDITY_ARC' | 'METABOLIC_PULSE' | 'INSTITUTION';
    data: any;
}

export function geocodeLocation(location: string): { lat: number; lng: number } {
    if (!location) {
        return {
            lat: 42.8252 + (Math.random() - 0.5) * 0.1,
            lng: -108.7513 + (Math.random() - 0.5) * 0.1
        };
    }

    const locLower = location.toLowerCase();

    // Specific preset regions with subtle random jitter to prevent markers stacking perfectly
    if (locLower.includes('wyoming') || locLower.includes('lander')) {
        return { lat: 42.8252 + (Math.random() - 0.5) * 0.05, lng: -108.7513 + (Math.random() - 0.5) * 0.05 };
    }
    if (locLower.includes('washington') || locLower.includes('grays harbor')) {
        return { lat: 47.7511 + (Math.random() - 0.5) * 0.2, lng: -120.7401 + (Math.random() - 0.5) * 0.2 };
    }
    if (locLower.includes('oregon')) {
        return { lat: 44.5720 + (Math.random() - 0.5) * 0.2, lng: -124.0531 + (Math.random() - 0.5) * 0.2 };
    }
    if (locLower.includes('california') || locLower.includes('los angeles') || locLower.includes('la-gateway')) {
        return { lat: 34.0522 + (Math.random() - 0.5) * 0.2, lng: -118.2437 + (Math.random() - 0.5) * 0.2 };
    }
    if (locLower.includes('appalachia')) {
        return { lat: 37.5000 + (Math.random() - 0.5) * 1.5, lng: -82.5000 + (Math.random() - 0.5) * 1.5 };
    }
    if (locLower.includes('ozarks') || locLower.includes('missouri') || locLower.includes('arkansas')) {
        return { lat: 37.0000 + (Math.random() - 0.5) * 1.0, lng: -92.5000 + (Math.random() - 0.5) * 1.0 };
    }
    if (locLower.includes('seattle')) {
        return { lat: 47.6062 + (Math.random() - 0.5) * 0.05, lng: -122.3321 + (Math.random() - 0.5) * 0.05 };
    }
    if (locLower.includes('portland')) {
        return { lat: 45.5152 + (Math.random() - 0.5) * 0.05, lng: -122.6784 + (Math.random() - 0.5) * 0.05 };
    }
    if (locLower.includes('san francisco')) {
        return { lat: 37.7749 + (Math.random() - 0.5) * 0.05, lng: -122.4194 + (Math.random() - 0.5) * 0.05 };
    }
    if (locLower.includes('new york')) {
        return { lat: 40.7128 + (Math.random() - 0.5) * 0.1, lng: -74.0060 + (Math.random() - 0.5) * 0.1 };
    }

    // Deterministic hash-based coordinate fallback within North America to distribute other text queries realistically
    let hash = 0;
    for (let i = 0; i < locLower.length; i++) {
        hash = locLower.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lat = 35 + (Math.abs(hash % 100) / 100) * 12; // 35 to 47 degrees N
    const lng = -120 + (Math.abs((hash >> 8) % 100) / 100) * 45; // -120 to -75 degrees W
    return { lat, lng };
}

export class AtlasService {
    /**
     * Synthesize all geo-financial layers for the Atlas.
     */
    async getSovereignLayers(): Promise<AtlasLayer[]> {
        const layers: AtlasLayer[] = [];

        // 1. Commodity Layer (Gold/Lithium/etc.)
        // Mapping commodity value to sovereign nodes
        try {
            const goldPrice = await finnhubService.getQuote('GC=F'); // Gold Futures
            const assets = await db.collection(COLLECTIONS.ASSETS).get();
            
            layers.push({
                id: 'commodity-layer',
                type: 'COMMODITY',
                data: {
                    price: goldPrice?.c || 2650,
                    nodes: assets.docs.map((a: any) => {
                        const assetData = a.data();
                        return {
                            id: a.id,
                            coords: assetData.coords || geocodeLocation(assetData.location || assetData.name || ''),
                            intensity: (goldPrice?.c || 2650) / 3000 // Scale brightness
                        };
                    })
                }
            });
        } catch (e) {
            console.warn('[AtlasService] Failed to fetch commodity layer:', e instanceof Error ? e.message : 'Unknown error');
        }

        // 2. Liquidity Arc Layer (DEX Flows)
        try {
            const solanaPrice = await priceOracle.getPrice('SOL');
            layers.push({
                id: 'liquidity-arcs',
                type: 'LIQUIDITY_ARC',
                data: {
                    source: { lat: 34.0522, lng: -118.2437 }, // LA (Gateway)
                    target: { lat: 42.8252, lng: -108.7513 }, // Wyoming (Vault)
                    value: solanaPrice,
                    currency: 'SOL'
                }
            });
        } catch (e) {
            console.warn('[AtlasService] Failed to fetch liquidity arcs:', e instanceof Error ? e.message : 'Unknown error');
        }

        // 3. Metabolic Pulse Layer (Health)
        try {
            const securityEvents = await db.collection(COLLECTIONS.SECURITY_TELEMETRY).get();
            layers.push({
                id: 'metabolic-pulses',
                type: 'METABOLIC_PULSE',
                data: securityEvents.docs.slice(0, 10).map((e: any) => {
                    const eventData = e.data();
                    return {
                        id: e.id,
                        coords: eventData.location || geocodeLocation(eventData.locationName || ''),
                        status: eventData.type === 'IMMUNE' ? 'HEALING' : 'OPTIMAL'
                    };
                })
            });
        } catch (e) {
            console.warn('[AtlasService] Failed to fetch metabolic pulses:', e instanceof Error ? e.message : 'Unknown error');
        }

        // 4. Institutional Citadels (Organizations)
        try {
            const orgs = await db.collection(COLLECTIONS.ORGANIZATIONS).get();
            layers.push({
                id: 'institutional-citadels',
                type: 'INSTITUTION',
                data: orgs.docs.map((o: any) => {
                    const orgData = o.data();
                    return {
                        id: o.id,
                        name: orgData.name,
                        coords: orgData.coords || geocodeLocation(orgData.location || orgData.name || ''),
                        stake: orgData.stakedUvt,
                        status: orgData.status
                    };
                })
            });
        } catch (e) {
            console.warn('[AtlasService] Failed to fetch institutional layer:', e instanceof Error ? e.message : 'Unknown error');
        }

        // 5. Governance Intents (Proposals)
        try {
            const proposals = await db.collection(COLLECTIONS.PROPOSALS).get();
            layers.push({
                id: 'governance-proposals',
                type: 'PROPOSAL' as any,
                data: proposals.docs.map((p: any) => {
                    const propData = p.data();
                    return {
                        id: p.id,
                        title: propData.title,
                        coords: propData.coords || geocodeLocation(propData.location || propData.title || '')
                    };
                })
            });
        } catch (e) {
            console.warn('[AtlasService] Failed to fetch proposal layer:', e instanceof Error ? e.message : 'Unknown error');
        }

        return layers;
    }
}

export const atlasService = new AtlasService();
