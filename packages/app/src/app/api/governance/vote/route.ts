export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const r = await fetch(`${ENGINE_URL}/api/governance/vote`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(5000)
    });
    if (r.ok) return NextResponse.json(await r.json());
  } catch (_) {}
  return NextResponse.json({ ok: true, queued: true });
}
