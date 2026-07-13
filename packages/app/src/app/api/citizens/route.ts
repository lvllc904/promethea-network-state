export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';

export async function GET() {
  try {
    const r = await fetch(`${ENGINE_URL}/api/citizens`, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
    if (r.ok) { 
        const d = await r.json(); 
        if (Array.isArray(d)) return NextResponse.json(d); 
    }
    // Fallback: return empty array instead of crashing UI if backend is cold/dead
    return NextResponse.json([]);
  } catch (err: any) {
    // Graceful fallback for 503/timeout scenarios
    return NextResponse.json([]);
  }
}
