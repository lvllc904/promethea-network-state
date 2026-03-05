import { NextResponse } from 'next/server';

// In-memory cache: one entry lives for CACHE_TTL_MS
// This is per-Cloud-Run-instance but still dramatically reduces CoinGecko hits
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cachedData: any = null;
let cacheTime = 0;

const COINGECKO_URL =
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,chainlink&vs_currencies=usd&include_24hr_change=true';

// Fallback prices to return when CoinGecko is unavailable
const FALLBACK = {
    bitcoin: { usd: 95430, usd_24h_change: 1.2 },
    ethereum: { usd: 3450, usd_24h_change: -0.5 },
    solana: { usd: 184.20, usd_24h_change: 3.4 },
    chainlink: { usd: 18.20, usd_24h_change: 0.05 },
};

export async function GET() {
    // Serve from cache if still fresh
    if (cachedData && Date.now() - cacheTime < CACHE_TTL_MS) {
        return NextResponse.json(cachedData, {
            headers: {
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
                'X-Cache': 'HIT',
            },
        });
    }

    try {
        const res = await fetch(COINGECKO_URL, {
            headers: { Accept: 'application/json' },
            // Next.js server-side fetch caching (on top of our in-memory cache)
            next: { revalidate: 300 },
        });

        if (!res.ok) {
            throw new Error(`CoinGecko responded with ${res.status}`);
        }

        const data = await res.json();
        cachedData = data;
        cacheTime = Date.now();

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
                'X-Cache': 'MISS',
            },
        });
    } catch (err) {
        console.error('[/api/ticker] CoinGecko fetch failed:', err);
        // Return stale cache if available, otherwise fallback
        return NextResponse.json(cachedData ?? FALLBACK, {
            headers: {
                'Cache-Control': 'public, max-age=60',
                'X-Cache': 'STALE',
            },
        });
    }
}
