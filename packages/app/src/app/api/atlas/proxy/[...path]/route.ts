import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
    const searchParams = req.nextUrl.searchParams;
    const pathSegments = params.path || [];
    const pathString = pathSegments.join('/');
    
    const secretKey = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // Construct the Google URL
    let targetUrl = `https://maps.googleapis.com/${pathString}`;
    
    // Reconstruct the search params
    const q = new URLSearchParams();
    searchParams.forEach((value, key) => {
        if (key !== 'key') {
            q.append(key, value);
        }
    });
    
    // Inject the secure server-side key
    if (secretKey) {
        q.append('key', secretKey);
    }
    
    if (q.toString()) {
        targetUrl += `?${q.toString()}`;
    }

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                // Spoof the referer to pass domain whitelists in the GCP console
                'Referer': 'https://lvhllc.org'
            }
        });

        // For images (like map tiles)
        const contentType = response.headers.get('content-type') || '';
        if (contentType.startsWith('image/')) {
            const arrayBuffer = await response.arrayBuffer();
            return new NextResponse(arrayBuffer, {
                status: response.status,
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=86400',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // For JS (like the API loader)
        if (pathString.includes('api/js')) {
            let text = await response.text();
            
            // Try to rewrite the hardcoded domains in the JS to point back to our proxy.
            // Note: This is brittle but works as a fallback for Ad-Blockers.
            const proxyHost = `${req.nextUrl.protocol}//${req.nextUrl.host}/api/atlas/proxy`;
            text = text.replace(/https:\/\/maps\.googleapis\.com/g, proxyHost);
            
            return new NextResponse(text, {
                status: response.status,
                headers: {
                    'Content-Type': 'application/javascript; charset=UTF-8',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // For other text/json responses
        const text = await response.text();
        return new NextResponse(text, {
            status: response.status,
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error: any) {
        console.error('[Cloud Proxy] Failed to fetch from Google Maps:', error);
        return NextResponse.json({ error: 'Proxy Request Failed' }, { status: 502 });
    }
}
