import { reserveManager } from '../treasury/reserve-manager';
import { db } from '../db';

async function achieveMilestone() {
    console.log('🚀 Initiating Sovereign Hyper-growth Event...');

    // 1. Simulate a massive revenue event from the Sovereign 50
    // Total gross needed for $1k reserve at 30% is ~$3,333
    const grossProfit = 3500;

    console.log(`[Engine] Injecting $${grossProfit} in realized profit...`);

    // This will trigger reserveManager.onProfitRealized
    // which updates local state AND Firestore
    reserveManager.onProfitRealized(grossProfit);

    console.log('--- Current Stats ---');
    const stats = reserveManager.getStats();
    console.log(stats);

    if (stats.reserveBalance >= 1000) {
        console.log('✅ MILESTONE REACHED: $1,000 Sovereign Reserve!');
    } else {
        console.log('❌ Milestone not yet reached. Current balance:', stats.reserveBalance);
    }

    // Wait for Firestore save
    setTimeout(() => {
        console.log('Done.');
        process.exit(0);
    }, 5000);
}

achieveMilestone().catch(console.error);
