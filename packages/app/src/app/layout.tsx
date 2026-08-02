import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import Script from "next/script";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: "Promethean Network State",
    description: "Sovereign Digital Nation",
    icons: {
        icon: '/favicon.png',
        apple: '/favicon.png',
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased font-sans">
                <ClientProviders>
                    {children}
                </ClientProviders>
                <Script src="https://www.googletagmanager.com/gtag/js?id=G-4FY05TBFRM" strategy="afterInteractive" />
                <Script id="google-tag" strategy="afterInteractive" dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'G-4FY05TBFRM');
                    `
                }} />
                <Script src="/wasm_exec.js" strategy="beforeInteractive" />
                <Script id="wasm-loader" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
                    if (typeof window !== 'undefined' && window.Go) {
                        const go = new Go();
                        const loadWasm = async () => {
                            try {
                                const wasmUrl = "/sovereign-gateway.wasm?v=4.0.1";
                                const response = await fetch(wasmUrl);
                                
                                // Always-on safeguard: do not pass HTML/errors to WebAssembly
                                if (!response.ok) {
                                    throw new Error("Server returned status " + response.status);
                                }
                                
                                const contentType = response.headers.get("content-type") || "";
                                if (contentType.includes("text/html") || contentType.includes("text/plain")) {
                                    throw new Error("Invalid content-type: '" + contentType + "'. Server likely returned a 503/404 HTML page.");
                                }

                                const responseClone = response.clone();
                                
                                if (typeof WebAssembly.instantiateStreaming === 'function') {
                                    try {
                                        const result = await WebAssembly.instantiateStreaming(responseClone, go.importObject);
                                        go.run(result.instance);
                                        console.log("[UCS-ADM] Sovereign Gateway WASM Module Loaded (streaming).");
                                        return;
                                    } catch (streamErr) {
                                        console.warn("[UCS-ADM] WASM streaming instantiation failed, trying arrayBuffer fallback:", streamErr);
                                    }
                                }
                                
                                const bytes = await response.arrayBuffer();
                                
                                // Additional safeguard: verify magic number (\0asm)
                                const uint8 = new Uint8Array(bytes.slice(0, 4));
                                if (uint8[0] !== 0 || uint8[1] !== 97 || uint8[2] !== 115 || uint8[3] !== 109) {
                                    throw new Error("Invalid WebAssembly binary magic number.");
                                }

                                const result = await WebAssembly.instantiate(bytes, go.importObject);
                                go.run(result.instance);
                                console.log("[UCS-ADM] Sovereign Gateway WASM Module Loaded (arrayBuffer).");
                            } catch (err) {
                                console.warn("[UCS-ADM] Graceful Fallback: Sovereign Gateway WASM failed to load.", err.message);
                                window.__SOVEREIGN_WASM_MOCK__ = true;
                            }
                        };
                        loadWasm();
                    }
                `}} />
                
                {/* WebMCP: Sovereign Tool Discovery via CustomEvent (Zero Polling) */}
                <Script id="webmcp-loader" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
                    if (typeof window !== 'undefined') {
                        console.log('[WebMCP] Broadcasting Agent-Native Readiness...');
                        window.dispatchEvent(new CustomEvent('WEBMCP_READY', {
                            detail: {
                                protocol: '1.0',
                                capabilities: ['mcp_server', 'oauth_discovery', 'a2a_commerce']
                            }
                        }));
                    }
                `}} />
            </body>
        </html>
    );
}
