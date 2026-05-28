import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Standard x402 payment required response for Machine Payment Protocol / AP2
    return new NextResponse(JSON.stringify({
        error: 'Payment Required',
        message: 'This endpoint requires payment via x402 protocol.',
        accepted_methods: ['mpp', 'ap2']
    }), {
        status: 402,
        headers: {
            'Content-Type': 'application/json',
            'x-payment-requirement': 'true',
            'x402-accepted-methods': 'mpp,ap2'
        }
    });
}
