import { NextResponse } from 'next/server';

export async function GET() {
  const ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-ijda67gvaq-uc.a.run.app';
  
  try {
    const response = await fetch(`${ENGINE_URL}/api/treasury/waterfall`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      // Fallback data if engine is down/unreachable to prevent dashboard breaking
      return NextResponse.json({
        totalTvlUsd: 0,
        infrastructureCostUsd: 0,
        activeRings: 0,
        nextUnlock: 'System Warming Up...',
        rings: Array.from({ length: 10 }).map((_, i) => ({
          name: `Ring ${i}`,
          thresholdSol: 10 * Math.pow(10, i),
          balanceSol: 0,
          isActive: i === 0,
          address: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb'
        }))
      });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Waterfall Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
