import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Patterns commonly used by bots/scanners that we want to block immediately
const BOT_PATTERNS = [
    /\.php$/,
    /wp-admin/,
    /wp-login/,
    /wp-includes/,
    /config\.php/,
    /\.env/,
    /\.git/,
    /cgi-bin/,
    /\.well-known\/acme-challenge/,
    /xmlrpc\.php/,
    /fckeditor/,
    /ckeditor/,
    /\/adm\//,
]

export function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl

    // BYPASS: Allow legitimate Next.js internal requests
    // These often contain _rsc or point to _next/static
    if (
        pathname.includes('/_next/') ||
        searchParams.has('_rsc') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next()
    }

    // Block suspicious bot probes with 403 Forbidden
    if (BOT_PATTERNS.some(pattern => pattern.test(pathname.toLowerCase()))) {
        console.warn(`[SECURITY] Blocked suspicious bot request: ${pathname} from ${request.ip || 'unknown IP'}`)
        return new NextResponse(null, { status: 403 })
    }

    return NextResponse.next()
}

// Ensure middleware runs on all paths
export const config = {
    matcher: '/:path*',
}
