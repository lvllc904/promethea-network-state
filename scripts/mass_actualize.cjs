const admin = require('firebase-admin');
require('dotenv').config({ path: './packages/app/.env' });

async function massActualize() {
    console.log('--- Promethean State Actualization: Simulation -> Ledger (ADC) ---');

    try {
        if (!admin.apps.length) {
            const saContent = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
            const serviceAccount = JSON.parse(saContent);
            // Fix double-escaped newlines in private key
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
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
