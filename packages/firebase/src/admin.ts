// src/firebase/admin.ts
import * as admin from 'firebase-admin';

// NOTE: This file is currently not used because the required environment variable
// FIREBASE_SERVICE_ACCOUNT_KEY is not set in this environment, causing server startup failures.
// The logic has been temporarily disabled in `src/app/login/page.tsx`.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// We will no longer throw an error here to allow the server to start.
// The functions that use this will handle the case where the adminApp is not initialized.
// if (!serviceAccount) {
//     throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
// }

let adminApp: admin.app.App | null = null;

export function initializeAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app();
    }
    
    if (!serviceAccount) {
        console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK could not be initialized.");
        return null;
    }

    try {
        adminApp = admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccount))
        });
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
        adminApp = null; // Ensure adminApp is null on failure
    }
    
    return adminApp;
}
