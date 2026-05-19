import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'NARRATIVE_SIGNAL,GOVERNANCE,VISIONARY';
  const limit = searchParams.get('limit') || '8';
  try {
    const r = await fetch(`${ENGINE_URL}/api/state/tpns_genesis/lake?type=${type}&limit=${limit}`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (r.ok) { 
        const d = await r.json(); 
        if (Array.isArray(d)) return NextResponse.json(d); 
    } else {
        return NextResponse.json({ error: `Engine returned ${r.status}` }, { status: r.status });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Connection to Sovereign Engine failed', details: err.message }, { status: 503 });
  }
}
