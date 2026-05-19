import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ECONOMIC_ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';

// Comprehensive regex for identifying non-human intelligences / bots
const BOT_REGEX = /bot|spider|crawl|slurp|gemini|chatgpt|facebookexternalhit|linkedinbot|embedly|baiduspider|twitterbot|whatsapp|notion|slack|discord/i;

export async function middleware(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || '';
    
    // Wave 11: The Sovereign Shadow Protocol Bifurcation
    const acceptHeader = request.headers.get('accept') || '';
    const isMarkdownRequested = acceptHeader.includes('text/markdown');

    if (BOT_REGEX.test(userAgent) || isMarkdownRequested) {
        console.log(`[Gatekeeper] 🛡️ Non-Human Intelligence Detected (${userAgent}). Activating Shadow Protocol for ${request.nextUrl.pathname}`);
        
        try {
            // Forward the exact path to the Engine's Cartographer service
            const format = isMarkdownRequested ? 'markdown' : 'html';
            const shadowUrl = `${ECONOMIC_ENGINE_URL}/api/shadow${request.nextUrl.pathname}?format=${format}`;
            
            const response = await fetch(shadowUrl, {
                // Prevent infinite loops if the engine decides to fetch itself
                headers: { 'User-Agent': 'Promethean-Gatekeeper' } 
            });
            
            if (response.ok) {
                const content = await response.text();
                // We return the raw synthetic block instantly.
                return new NextResponse(content, {
                    headers: { 'Content-Type': isMarkdownRequested ? 'text/markdown' : 'text/html' }
                });
            } else {
                console.warn(`[Gatekeeper] Cartographer returned ${response.status}. Falling back to default routing.`);
            }
        } catch (error) {
            console.error('[Gatekeeper] Failed to fetch Holographic Mapping:', error);
        }
    }

    // Humans and unrecognized agents pass through to the React SPA undisturbed
    return NextResponse.next();
}

// Only match page routes. Skip static assets, Next.js internal paths, and API routes.
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
