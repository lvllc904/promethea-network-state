import * as admin from 'firebase-admin';

// Initialize Firebase Admin only once
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.GOOGLE_CLOUD_PROJECT || 'studio-9105849211-9ba48'
    });
}

export const db = admin.firestore();
export const auth = admin.auth();
