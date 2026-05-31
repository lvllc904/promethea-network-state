export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'NARRATIVE_SIGNAL,GOVERNANCE,VISIONARY';
  const limit = searchParams.get('limit') || '8';
  try {
    const r = await fetch(`${ENGINE_URL}/api/state/tpns_genesis/lake?type=${type}&limit=${limit}`, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
    if (r.ok) { 
        const d = await r.json(); 
        if (Array.isArray(d)) return NextResponse.json(d); 
    }
    // Graceful fallback during cold starts or network sevrance
    return NextResponse.json([]);
  } catch (err: any) {
    // Graceful fallback during cold starts or network sevrance
    return NextResponse.json([]);
  }
}
