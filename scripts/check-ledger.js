
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'studio-9105849211-9ba48'
    });
}

const db = admin.firestore();

async function checkLedger() {
    console.log('--- PUBLIC LEDGER CHECK ---');
    const snapshot = await db.collection('universal_value_tokens').orderBy('timestamp', 'desc').limit(5).get();
    console.log(`Found ${snapshot.size} recent transfers.`);
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- [${data.timestamp?.toDate()?.toLocaleTimeString()}] ${data.ownerId}: ${data.amount} UVT (${data.tokenType})`);
        console.log(`  Desc: ${data.description}`);
    });
}

checkLedger().catch(console.error);
