
import * as admin from 'firebase-admin';

/**
 * Sovereign Database Bridge (Phase 3.5)
 * 
 * Provides authenticated write access to the Network State's global ledger.
 */

if (!admin.apps.length) {
    let serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    let credential;

    if (serviceAccountJson) {
        try {
            // Robust parsing: strip potential single/double quotes and unescape newlines
            let cleanedJson = serviceAccountJson.trim();
            // Handle cases where the whole JSON is wrapped in external quotes from .env
            if ((cleanedJson.startsWith("'") && cleanedJson.endsWith("'")) ||
                (cleanedJson.startsWith('"') && cleanedJson.endsWith('"'))) {
                cleanedJson = cleanedJson.substring(1, cleanedJson.length - 1);
            }

            const serviceAccount = JSON.parse(cleanedJson);
            if (typeof serviceAccount.private_key === 'string') {
                // The private key must have literal newlines for the PEM parser
                serviceAccount.private_key = serviceAccount.private_key
                    .replace(/\\n/g, '\n')
                    .replace(/\\\\n/g, '\n');
            }
            credential = admin.credential.cert(serviceAccount);
            console.log(`[Database] Initializing with service account: ${serviceAccount.client_email}`);
        } catch (err) {
            console.error('[Database] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', err instanceof Error ? err.message : 'Unknown error');
            console.log('[Database] Falling back to Application Default Credentials');
            credential = admin.credential.applicationDefault();
        }
    } else {
        credential = admin.credential.applicationDefault();
    }

    admin.initializeApp({
        credential,
        projectId: process.env.FIREBASE_PROJECT_ID || 'studio-9105849211-9ba48'
    });
}

export const db = admin.firestore();

export const COLLECTIONS = {
    ASSETS: 'real_world_assets',
    REVENUE_EVENTS: 'revenue_events',
    LABOR_RECORDS: 'labor_records',
    UVT_TRANSFERS: 'universal_value_tokens',
    PROPOSALS: 'proposals',
    DIPLOMATIC_SESSIONS: 'diplomatic_sessions',
    HARDWARE_JOBS: 'hardware_jobs',
    PLANETARY_HEALING: 'planetary_healing',
    BIO_EVENTS: 'bio_events',
    ACQUISITIONS: 'acquisitions'
};
