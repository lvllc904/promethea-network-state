const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'studio-9105849211-9ba48'
    });
}

const db = admin.firestore();

async function check() {
    const doc = await db.collection('treasury').doc('global').get();
    if (doc.exists) {
        console.log('RESERVE_STATUS:', JSON.stringify(doc.data(), null, 2));
    } else {
        console.log('RESERVE_STATUS: NOT_FOUND');
    }
}

check();
