export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';
  
  try {
    const response = await fetch(`${ENGINE_URL}/queue`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch engine queue' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Engine Queue Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
