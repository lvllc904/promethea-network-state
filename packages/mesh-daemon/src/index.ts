import express from 'express';
import cors from 'cors';
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 4005;

app.use(cors());

// Health check for the UI to pulse
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Sovereign Daemon Online', mode: 'LOCAL' });
});

// Proxy Google Maps to bypass browser API Key restrictions and CORS
app.use('/maps', createProxyMiddleware({
    target: 'https://maps.googleapis.com',
    changeOrigin: true,
    pathRewrite: {
        '^/maps': '/maps'
    },
    // We inject the secret server-side key so the browser never needs to know it.
    on: {
        proxyReq: (proxyReq: any, req: any, res: any) => {
            if (req.url && req.url.includes('/api/js')) {
                const secretKey = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                
                // Parse the URL to properly manipulate query parameters
                try {
                    // Create a URL object using a dummy base since we only care about path/query
                    const urlObj = new URL(proxyReq.path, 'http://localhost');
                    
                    // Force the path to include /maps
                    if (!urlObj.pathname.startsWith('/maps')) {
                        urlObj.pathname = '/maps' + urlObj.pathname;
                    }
                    
                    // Inject the secret key
                    if (secretKey) {
                        urlObj.searchParams.set('key', secretKey);
                    }
                    
                    // Update proxyReq path with the correctly formatted string
                    proxyReq.path = urlObj.pathname + urlObj.search;
                } catch (e) {
                    console.error('[Sovereign Daemon] Error rewriting proxy path:', e);
                }
            }
            // Spoof the referer if necessary to pass Google's IP/Domain whitelist
            proxyReq.setHeader('referer', 'https://lvhllc.org');
        },
        // Optional: Attempt to rewrite tile URLs in the JS response to also flow through the proxy
        proxyRes: (proxyRes: any, req: any, res: any) => {
            // We just log or let it pass through. The custom loader injection handles the initial bypass.
            // Complex response interception for gzip/brotli compressed google map JS is prone to crash.
        }
    }
}));

app.listen(PORT, () => {
    console.log(`[Sovereign Daemon] Mesh Proxy running on http://localhost:${PORT}`);
});
