import { settlementService } from '../services/settlement-service';
import { walletManager } from '../treasury/wallet-manager';
import { db, COLLECTIONS } from '../db';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });
// Also load from app .env for shared secrets
dotenv.config({ path: path.join(__dirname, '../../../../app/.env') });

async function testSettlement() {
    console.log('--- Sovereign On-Chain Settlement Test ---');

    try {
        const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
        const privateKey = process.env.SOLANA_PRIVATE_KEY;

        if (!privateKey) {
            console.error('❌ SOLANA_PRIVATE_KEY not found in environment.');
            return;
        }

        console.log('Initializing WalletManager for Mainnet...');
        await walletManager.initWallet('solana', privateKey, rpcUrl);

        console.log('Searching for unsettled UVT transfers in Firestore...');
        const snapshot = await db.collection(COLLECTIONS.UVT_TRANSFERS)
            .where('onChainStatus', '!=', 'Settled')
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.log('No unsettled transfers found. Creating a simulation record for testing...');
            const newRecord = {
                ownerId: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb',
                amount: 1, // 1 UVT for testing
                tokenType: 'Labor',
                assetId: 'test-asset',
                timestamp: new Date(),
                onChainStatus: 'Pending',
                solanaAddress: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb'
            };
            const docRef = await db.collection(COLLECTIONS.UVT_TRANSFERS).add(newRecord);
            console.log(`Created simulation record: ${docRef.id}`);

            console.log('Triggering settlement for new record...');
            const result = await settlementService.settleUVT(docRef.id);
            handleResult(result);
        } else {
            const doc = snapshot.docs[0];
            console.log(`Found transfer: ${doc.id} for ${doc.data().amount} UVT`);

            // Ensure destination address is set
            if (!doc.data().solanaAddress) {
                console.log('Setting destination address to Sovereign Root for test...');
                await doc.ref.update({ solanaAddress: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb' });
            }

            console.log('Triggering settlement...');
            const result = await settlementService.settleUVT(doc.id);
            handleResult(result);
        }

    } catch (err: any) {
        console.error('❌ Runtime Error:', err.message);
    }
}

function handleResult(result: any) {
    if (result.success) {
        console.log('✅ SUCCESS! UVT settled on-chain.');
        console.log(`Signature: ${result.signature}`);
        console.log(`Verify at: https://solscan.io/tx/${result.signature}`);
    } else {
        console.error(`❌ FAILED: ${result.error}`);
    }
}

testSettlement();
