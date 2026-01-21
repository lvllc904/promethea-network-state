import type * as admin from 'firebase-admin';

export async function getServerFirebase(): Promise<typeof admin> {
  const adminModule = await import('firebase-admin');
  if (adminModule.apps.length === 0) {
    adminModule.initializeApp();
  }
  return adminModule;
}

export async function initializeFirebaseAdmin() {
  await getServerFirebase();
}
