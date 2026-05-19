import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';

export async function GET() {
  try {
    const r = await fetch(`${ENGINE_URL}/api/governance/cap_table`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (r.ok) { const d = await r.json(); if (d) return NextResponse.json(d); }
  } catch (_) {}
  // Fallback: static cap table
  return NextResponse.json({ promethea: 40.0, citizens: 35.2, liquidity: 24.8 });
}
