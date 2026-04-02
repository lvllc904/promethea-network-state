/**
 * Sovereign API Bridge (Exodus v1.1)
 * 
 * Centralized fetch logic for accessing the Network State substrate.
 * Redirects all data reads through the Economic Engine Cloud Run instance
 * to avoid expensive direct Firebase/Firestore billing.
 */

export const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:8080';

export async function fetchFromEngine(endpoint: string) {
    const res = await fetch(`${ENGINE_URL}${endpoint}`, {
        cache: 'no-store'
    });
    if (!res.ok) throw new Error(`Engine error: ${res.statusText}`);
    return res.json();
}

export const NetworkAPI = {
    getAssets: () => fetchFromEngine('/api/assets'),
    getIntel: () => fetchFromEngine('/api/intel'),
    getStatus: () => fetchFromEngine('/status')
};
