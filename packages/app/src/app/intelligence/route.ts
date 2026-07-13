export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const defaultLat = 42.8252;
  const defaultLng = -108.7513;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${defaultLat}&longitude=${defaultLng}&current=temperature_2m,wind_speed_10m,shortwave_radiation`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    
    let temp = 24.5;
    let windSpeed = 12.4;
    let solarFlux = 480;

    if (res.ok) {
      const data = await res.json();
      const current = data.current;
      if (current) {
        temp = current.temperature_2m ?? temp;
        windSpeed = current.wind_speed_10m ?? windSpeed;
        solarFlux = current.shortwave_radiation ?? solarFlux;
      }
    }

    const mockData = [
      {
        id: "env-packet-1",
        category: "ENVIRONMENTAL",
        timestamp: new Date().toISOString(),
        payload: JSON.stringify({
          wind_speed_10m: windSpeed,
          temperature_2m: temp,
          shortwave_radiation: solarFlux
        })
      }
    ];

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('[API Intelligence] Oracle Fetch Error, utilizing secure local-first simulation:', error);
    
    // Offline / Network Failure Fallback
    const fallbackData = [
      {
        id: "env-packet-fallback",
        category: "ENVIRONMENTAL",
        timestamp: new Date().toISOString(),
        payload: JSON.stringify({
          wind_speed_10m: Number((14.5 + Math.sin(Date.now() / 100000) * 4).toFixed(1)),
          temperature_2m: Number((23.2 + Math.cos(Date.now() / 100000) * 3).toFixed(1)),
          shortwave_radiation: Math.max(50, Math.round(520 + Math.sin(Date.now() / 50000) * 150))
        })
      }
    ];
    return NextResponse.json(fallbackData);
  }
}
