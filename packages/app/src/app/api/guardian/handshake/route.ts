import { NextRequest, NextResponse } from 'next/server';

const ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';

/**
 * SOVEREIGN GUARDIAN HANDSHAKE (Body 2)
 * 
 * This route validates the 3-Body Handshake protocol.
 * It sits between the DAC (Body 1) and the Engine (Body 2).
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');
        
        console.log(`[Guardian] 🛡️ Validating Handshake for action: ${body.action}`);

        // Forward the intent to the Sovereign Engine
        const response = await fetch(`${ENGINE_URL}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader || ''
            },
            body: JSON.stringify({
                methodId: body.action,
                params: body.params
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json({ 
                success: false, 
                message: error.error || 'Engine rejected handshake' 
            }, { status: response.status });
        }

        const result = await response.json();
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[Guardian] ❌ Handshake Protocol Violation:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal Handshake Failure' 
        }, { status: 500 });
    }
}
