
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'studio-9105849211-9ba48'
    });
}

const db = admin.firestore();

async function checkAssets() {
    const snapshot = await db.collection('real_world_assets').get();
    console.log(`Found ${snapshot.size} assets.`);
    snapshot.forEach(doc => {
        console.log(`- ${doc.id}: ${doc.data().name} (${doc.data().status})`);
    });
}

checkAssets().catch(console.error);
