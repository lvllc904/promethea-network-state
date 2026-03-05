const admin = require('firebase-admin');

async function massActualize() {
    console.log('--- Promethean State Actualization: Simulation -> Ledger (ADC) ---');

    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: 'studio-9105849211-9ba48'
            });
        }
        const db = admin.firestore();

        console.log('Fetching unsettled uvt_transfers...');
        const snapshot = await db.collection('universal_value_tokens').get();
        console.log(`Found ${snapshot.size} total records.`);

        const batch = db.batch();
        let ops = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.onChainStatus !== 'Settled' && data.onChainStatus !== 'Pending') {
                batch.update(doc.ref, {
                    onChainStatus: 'Pending',
                    actualizedAt: new Date()
                });
                ops++;
                if (ops >= 400) break; // Firestore batch limit is 500
            }
        }

        if (ops > 0) {
            console.log(`Updating ${ops} records to Pending...`);
            await batch.commit();
            console.log('✅ Batch committed. The Economic Engine will now process these.');
        } else {
            console.log('No records need updating.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.log('Try running: gcloud auth application-default login');
    }
}

massActualize();
