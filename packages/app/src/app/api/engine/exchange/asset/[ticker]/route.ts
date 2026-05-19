import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { ticker: string } }
) {
    const ticker = params.ticker;
    const engineUrl = process.env.ECONOMIC_ENGINE_URL || 'http://localhost:4000';
    
    try {
        const res = await fetch(`${engineUrl}/api/exchange/asset/${ticker}`);
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
