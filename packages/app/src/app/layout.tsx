import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import Script from "next/script";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

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
        <html lang="en" suppressHydrationWarning className="dark">
            <body className="antialiased font-sans">
                <ClientProviders>
                    {children}
                </ClientProviders>
                <Script src="/wasm_exec.js" strategy="beforeInteractive" />
                <Script id="wasm-loader" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
                    if (typeof window !== 'undefined' && window.Go) {
                        const go = new Go();
                        WebAssembly.instantiateStreaming(fetch("/sovereign-gateway.wasm"), go.importObject).then((result) => {
                            go.run(result.instance);
                            console.log("[UCS-ADM] Sovereign Gateway WASM Module Loaded.");
                        }).catch(err => {
                            console.warn("[UCS-ADM] Failed to load WASM module. Are you running 'make copy-wasm'?", err);
                        });
                    }
                `}} />
                
                {/* WebMCP: Sovereign Tool Discovery for AI Agents */}
                <script dangerouslySetInnerHTML={{ __html: `
                    if (window.navigator && !window.navigator.modelContext) {
                        console.log('[WebMCP] Initializing Sovereign Model Context...');
                        window.navigator.modelContext = {
                            registerTool: (tool) => {
                                console.log('[WebMCP] Registered Tool:', tool.name);
                                if (!window._pns_tools) window._pns_tools = [];
                                window._pns_tools.push(tool);
                            }
                        };
                    }
                `}} />
            </body>
        </html>
    );
}
