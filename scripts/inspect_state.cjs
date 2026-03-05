const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../packages/app/.env') });

async function run() {
    try {
        const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        const db = admin.firestore();
        const doc = await db.collection('treasury').doc('global').get();
        console.log('--- GLOBAL TREASURY DOC ---');
        console.log(JSON.stringify(doc.data(), null, 2));

        const transfers = await db.collection('uvt_transfers').get();
        console.log('\n--- TRANSFERS SUMMARY ---');
        console.log('Total Transfers:', transfers.size);
        const settled = transfers.docs.filter(d => d.data().onChainStatus === 'Settled').length;
        console.log('Settled:', settled);
        console.log('Unsettled:', transfers.size - settled);

        if (transfers.size > 0) {
            console.log('\nSample Transfer Status:', transfers.docs[0].data().onChainStatus);
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}
run();
