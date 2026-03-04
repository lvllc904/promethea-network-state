
import { discordClient } from '../tools/discord-client';
import { discordLedger } from '../treasury/discord-ledger';
import { reserveManager } from '../treasury/reserve-manager';

async function verifyEconomy() {
    console.log('🏛️  Starting Promethean Sovereign Economy Verification...');

    try {
        // 1. Verify Reserve Manager
        console.log('\n--- 1. 💰 Reserve Manager ---');
        console.log('Checking Reserve Balances...');
        const stats = reserveManager.getStats();
        console.log('✅ Reserve Stats:', stats);
        if (stats.reserveBalance < 0 || stats.communityPoolBalance < 0) {
            throw new Error('❌ Negative balance detected!');
        }

        // 2. Verify Discord Ledger (Firestore Connection)
        console.log('\n--- 2. 📒 Discord Ledger (Firestore) ---');
        console.log('Initializing Ledger...');
        await discordLedger.init();

        console.log('Testing UVT Credit (Mining Mock)...');
        const TEST_USER = 'verify-bot-user';
        const initialBalance = await discordLedger.getBalance(TEST_USER);
        console.log(`Initial Balance for ${TEST_USER}: ${initialBalance} UVT`);

        const newBalance = await discordLedger.credit(TEST_USER, 'Verify Bot', 1.0, 'test', 'Economy Verification Script');
        console.log(`New Balance: ${newBalance} UVT`);

        if (newBalance !== initialBalance + 1.0) {
            throw new Error(`❌ Balance mismatch! Expected ${initialBalance + 1.0}, got ${newBalance}`);
        }
        console.log('✅ UVT Crediting Works.');

        console.log('Testing Rich List...');
        const richList = await discordLedger.getRichList(5);
        console.log('Rich List Top 5:', richList);
        if (!richList.length) console.warn('⚠️ Rich List is empty (might be expected for new DB).');
        else console.log('✅ Rich List retrieved.');

        // 3. Verify Dashboard Logic (Dry Run)
        console.log('\n--- 3. 📊 Sovereign Dashboard Logic ---');
        // We can't easily test Discord interactions without a running bot and user interaction,
        // but we can verify the method exists and the data it consumes is valid.
        if (typeof discordClient.startDashboardLoop === 'function') {
            console.log('✅ `startDashboardLoop` method exists on DiscordClient.');
        } else {
            throw new Error('❌ `startDashboardLoop` is missing!');
        }

        console.log('\n✅✅✅ ECONOMY VERIFICATION PASSED ✅✅✅');
        process.exit(0);

    } catch (err) {
        console.error('\n❌❌❌ VERIFICATION FAILED ❌❌❌');
        console.error(err);
        process.exit(1);
    }
}

verifyEconomy();
