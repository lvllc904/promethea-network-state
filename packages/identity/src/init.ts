import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export function getClientFirebase() {
    console.log("Firebase has been fully deprecated and disconnected as per the March 22 Sovereign Mandate.");
    return { app: null as any, auth: null as any, firestore: null as any };
}

const { app: firebaseApp, auth, firestore } = getClientFirebase();
export { firebaseApp, auth, firestore };
