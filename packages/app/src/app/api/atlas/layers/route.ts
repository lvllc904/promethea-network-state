export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';

// Static sovereign asset nodes — used as fallback when the engine is cold
const FALLBACK_LAYERS = [
  {
    id: 'commodity-layer',
    type: 'COMMODITY',
    data: {
      price: 2650,
      nodes: [
        { id: 'wyoming-refinery', coords: { lat: 42.8252, lng: -108.7513 }, intensity: 0.88 },
        { id: 'la-gateway', coords: { lat: 34.0522, lng: -118.2437 }, intensity: 0.60 },
      ]
    }
  },
  {
    id: 'liquidity-arcs',
    type: 'LIQUIDITY_ARC',
    data: {
      source: { lat: 34.0522, lng: -118.2437 },
      target: { lat: 42.8252, lng: -108.7513 },
      value: 93.24,
      currency: 'SOL'
    }
  },
  {
    id: 'institutional-citadels',
    type: 'INSTITUTION',
    data: [
      { id: 'prom-dao', name: 'Promethean Society DAO', coords: { lat: 37.7749, lng: -122.4194 }, stake: 50000, status: 'ACTUALIZED' },
      { id: 'archipelago', name: 'Archipelago Holdings LLC', coords: { lat: 42.8252, lng: -108.7513 }, stake: 12500, status: 'STAKED' },
    ]
  },
  {
    id: 'metabolic-pulses',
    type: 'METABOLIC_PULSE',
    data: [
      { id: 'node-1', coords: { lat: 40.7128, lng: -74.0060 }, status: 'OPTIMAL' },
      { id: 'node-2', coords: { lat: 51.5074, lng: -0.1278 }, status: 'OPTIMAL' },
    ]
  }
];

export async function GET() {
  try {
    // Attempt to fetch live layers from the Economic Engine
    const response = await fetch(`${ENGINE_URL}/api/atlas/layers`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000), // 5 second timeout to avoid hanging
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch (error) {
    // Engine cold-start or network issue — fall through to static fallback
    console.warn('[Atlas API] Engine unreachable, serving static layer data:', error instanceof Error ? error.message : 'unknown');
  }

  // Return static sovereign fallback layers — map is always visible
  return NextResponse.json(FALLBACK_LAYERS, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
  });
}
