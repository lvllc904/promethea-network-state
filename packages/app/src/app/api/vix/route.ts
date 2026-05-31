import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log(`[API] Received VIX update: ${body.vix}`);
        
        return NextResponse.json({ success: true, newVix: body.vix });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }
}
