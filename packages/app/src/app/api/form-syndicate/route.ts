import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const cookieStore = cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8080';
        
        const response = await fetch(`${AI_SERVICE_URL}/api/form-syndicate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            return NextResponse.json({ error: data.error || 'Failed to form syndicate' }, { status: response.status });
        }

        // Update the token cookie if a new token was returned
        if (data.token) {
            cookieStore.set({
                name: 'auth_token',
                value: data.token,
                httpOnly: true,
                path: '/',
                secure: process.env.NODE_env === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 // 24 hours
            });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[BFF] Form Syndicate Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
