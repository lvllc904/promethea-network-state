import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500);

    try {
        const body = await req.json();

        const daemonUrl = process.env.DEPTHOS_BRIDGE_URL || 'http://localhost:9999';

        const response = await fetch(`${daemonUrl}/api/telemetry/verify-hazard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
            cache: 'no-store'
        });
        clearTimeout(id);

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json(data);
        }
        throw new Error(`HTTP status ${response.status}`);
    } catch (err: any) {
        clearTimeout(id);
        console.warn('[Telemetry Proxy] Local daemon offline. Returning silent verify-hazard fallback.');
        
        return NextResponse.json({
            hazardFound: false,
            hazards: []
        });
    }
}
