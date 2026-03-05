const admin = require('firebase-admin');
const { SettlementService } = require('./packages/services/economic-engine/dist/services/settlement-service');
const { walletManager } = require('./packages/services/economic-engine/dist/treasury/wallet-manager');
const bs58 = require('bs58');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: 'packages/services/economic-engine/.env' });
dotenv.config({ path: 'packages/app/.env' });

// Init Firebase
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function triggerSettlement() {
    try {
        // 1. Init WalletManager for Mainnet
        const rpcUrl = 'https://api.mainnet-beta.solana.com';
        const privateKey = process.env.SOLANA_PRIVATE_KEY;

        console.log('Initializing WalletManager...');
        await walletManager.initWallet('solana', privateKey, rpcUrl);

        // 2. Find an unsettled transfer
        console.log('Searching for unsettled UVT transfers...');
        const snapshot = await db.collection('uvt_transfers')
            .where('onChainStatus', '!=', 'Settled')
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.log('No unsettled transfers found.');
            return;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();
        console.log(`Found transfer: ${doc.id} for ${data.amount} UVT`);

        // 3. Update destination address to the Sovereign Root for testing if none exists
        if (!data.solanaAddress) {
            console.log('Updating destination address to Sovereign Root for testing...');
            await doc.ref.update({
                solanaAddress: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb'
            });
        }

        // 4. Trigger settlement
        const settlementService = new (require('./packages/services/economic-engine/dist/packages/services/economic-engine/src/services/settlement-service').SettlementService)();

        console.log('Triggering settlement...');
        const result = await settlementService.settleUVT(doc.id);

        if (result.success) {
            console.log('✅ Settlement SUCCESSFUL!');
            console.log('Signature:', result.signature);
            console.log(`Verify: https://solscan.io/tx/${result.signature}`);
        } else {
            console.error('❌ Settlement FAILED:', result.error);
        }

    } catch (err) {
        console.error('Runtime Error:', err);
    }
}

triggerSettlement();
