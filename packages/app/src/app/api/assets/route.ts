export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';

export async function GET() {
  try {
    const r = await fetch(`${ENGINE_URL}/api/assets`, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
    if (r.ok) { 
        const d = await r.json(); 
        if (Array.isArray(d)) {
            return NextResponse.json(d); 
        }
        return NextResponse.json({ error: 'Unexpected response format from engine', data: d }, { status: 500 });
    } else {
        return NextResponse.json({ error: `Engine returned ${r.status}` }, { status: r.status });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Connection to Sovereign Engine failed', details: err.message }, { status: 503 });
  }
}
