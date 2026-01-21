import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export function getClientFirebase() {
    console.log("Initializing Firebase Client SDK with API key starting with:", firebaseConfig.apiKey?.substring(0, 8));
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'dummy-api-key' || firebaseConfig.apiKey.includes('undefined')) {
        console.warn("Skipping Firebase initialization due to missing/dummy API key.");
        return { app: null as any, auth: null as any, firestore: null as any };
    }
    try {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        return { app, auth, firestore };
    } catch (e) {
        console.error("Firebase initialization error:", e);
        return { app: null as any, auth: null as any, firestore: null as any };
    }
}

const { app: firebaseApp, auth, firestore } = getClientFirebase();
export { firebaseApp, auth, firestore };
