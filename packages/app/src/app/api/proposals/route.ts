export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';

export async function GET() {
  try {
    const r = await fetch(`${ENGINE_URL}/api/governance/proposals?status=active,proposed`, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
    if (r.ok) {
      const d = await r.json();
      if (Array.isArray(d)) return NextResponse.json(d);
    }
    return NextResponse.json([]);
  } catch (err) {
    console.warn("[BFF Proposals] Fallback triggered due to error:", err);
    return NextResponse.json([]);
  }
}
