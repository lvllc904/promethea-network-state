export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';
  
  try {
    const response = await fetch(`${ENGINE_URL}/intelligence`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
        // Return empty array if engine intelligence is not yet available
        return NextResponse.json([]);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Engine Intelligence Proxy Error:', error);
    return NextResponse.json([], { status: 200 }); // Graceful fallback
  }
}
