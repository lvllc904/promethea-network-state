export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "dummy-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "dummy-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "dummy-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
};