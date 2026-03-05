const admin = require('firebase-admin');
const dotenv = require('dotenv');
// Using path relative to where it will be run (packages/app)
dotenv.config();

async function seedUserWallet() {
    try {
        const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        const db = admin.firestore();

        const address = 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb';

        // Find citizen with email lvllc@lvhllc.org (assuming that's the user)
        const snapshot = await db.collection('citizens')
            .where('email', '==', 'lvllc@lvhllc.org')
            .get();

        if (snapshot.empty) {
            console.log('User citizen profile not found.');
            return;
        }

        const doc = snapshot.docs[0];
        await doc.ref.update({
            solanaAddress: address
        });

        console.log(`✅ Updated citizen profile ${doc.id} with Solana address: ${address}`);

    } catch (err) {
        console.error('❌ Error updating wallet:', err.message);
    }
}
seedUserWallet();
