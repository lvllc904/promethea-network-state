/**
 * Comprehensive Verification Test for All 5 Enhancement Phases
 */

import { discordLedger } from '../treasury/discord-ledger';
import { questManager } from '../treasury/quest-manager';
import { reserveManager } from '../treasury/reserve-manager';
import { calculateAdvancedMetrics } from '../analytics/metrics-calculator';

async function verifyAllEnhancements() {
    console.log('🏛️  PROMETHEAN SOVEREIGN ECONOMY - COMPREHENSIVE VERIFICATION');
    console.log('Testing all 5 enhancement phases...\n');

    try {
        // === PHASE 1: QUEST COMPLETION SYSTEM ===
        console.log('--- ⚔️ PHASE 1: Quest Completion System ---');

        const quest = await questManager.createQuest(
            'Test Quest',
            'Verify quest system works',
            5.0,
            'test-admin-123'
        );
        console.log(`✅ Quest created: ${quest.questId}`);

        const claimedQuest = await questManager.claimQuest(quest.questId, 'test-user-456');
        if (!claimedQuest) throw new Error('Quest claim failed');
        console.log(`✅ Quest claimed by test-user-456`);

        const approvedQuest = await questManager.approveQuest(quest.questId);
        if (!approvedQuest) throw new Error('Quest approval failed');
        console.log(`✅ Quest approved and completed`);

        const quests = await questManager.listQuests();
        console.log(`✅ Quest listing works: ${quests.length} total quests`);

        // === PHASE 2: AI-POWERED MINING ===
        console.log('\n--- 🧠 PHASE 2: AI-Powered Mining ---');

        const { scoreMessage } = require('../tools/message-scorer');
        const testMessage = "This is a thoughtful contribution about the future of decentralized governance and AI sovereignty.";
        const score = await scoreMessage(testMessage, 'test-miner-789');

        console.log(`✅ AI Scoring works: ${score.score}/10 → ${score.uvt} UVT`);
        if (score.uvt <= 0 || score.uvt > 0.1) throw new Error('Invalid UVT amount');

        // === PHASE 3: UVT SPENDING SYSTEM ===
        console.log('\n--- 🛒 PHASE 3: UVT Spending System ---');

        // Credit test user
        await discordLedger.credit('test-spender-101', 'TestSpender', 50, 'test', 'Test credit for spending');
        const balanceBefore = await discordLedger.getBalance('test-spender-101');
        console.log(`✅ Test user credited: ${balanceBefore} UVT`);

        // Debit (spend) UVT
        await discordLedger.debit('test-spender-101', 'TestSpender', 10, 'purchase', 'Test purchase');
        const balanceAfter = await discordLedger.getBalance('test-spender-101');
        console.log(`✅ Debit works: ${balanceBefore} UVT → ${balanceAfter} UVT`);

        if (balanceAfter !== balanceBefore - 10) {
            throw new Error(`Balance mismatch! Expected ${balanceBefore - 10}, got ${balanceAfter}`);
        }

        // Test insufficient funds error
        try {
            await discordLedger.debit('test-spender-101', 'TestSpender', 1000, 'purchase', 'Should fail');
            throw new Error('Should have thrown insufficient funds error');
        } catch (e: any) {
            if (e.message.includes('Insufficient UVT')) {
                console.log('✅ Insufficient funds protection works');
            } else {
                throw e;
            }
        }

        // === PHASE 4: SOVEREIGN NARRATIVE ENGINE ===
        console.log('\n--- 📝 PHASE 4: Sovereign Narrative Engine ---');

        const { generateInsight } = require('../tools/narrative-engine');
        const narrative = await generateInsight('the future of AI governance');

        console.log(`✅ Narrative generated: "${narrative.title}"`);
        console.log(`   Word count: ${narrative.wordCount}`);
        console.log(`   Type: ${narrative.type}`);

        if (narrative.wordCount < 100) throw new Error('Narrative too short');
        if (!narrative.content) throw new Error('Narrative has no content');

        // === PHASE 5: ENHANCED DASHBOARD ===
        console.log('\n--- 📊 PHASE 5: Enhanced Dashboard Analytics ---');

        const metrics = await calculateAdvancedMetrics();

        console.log('✅ Advanced metrics calculated:');
        console.log(`   UVT Velocity: ${metrics.uvtVelocity} tx/day`);
        console.log(`   Active Citizens (7d): ${metrics.activeCitizens7d}`);
        console.log(`   Total Mined: ${metrics.totalMined} UVT`);
        console.log(`   Total Spent: ${metrics.totalSpent} UVT`);
        console.log(`   Quest Completion Rate: ${metrics.questCompletionRate}%`);
        console.log(`   Wealth Concentration: ${metrics.wealthConcentration}`);

        if (metrics.uvtVelocity < 0) throw new Error('Invalid velocity');
        if (metrics.totalMined < 0) throw new Error('Invalid total mined');

        // === FINAL SUMMARY ===
        console.log('\n' + '='.repeat(60));
        console.log('✅✅✅ ALL 5 PHASES VERIFIED SUCCESSFULLY ✅✅✅');
        console.log('='.repeat(60));

        console.log('\n📋 Feature Summary:');
        console.log('✅ Phase 1: Quest Completion - OPERATIONAL');
        console.log('✅ Phase 2: AI-Powered Mining - OPERATIONAL');
        console.log('✅ Phase 3: UVT Spending - OPERATIONAL');
        console.log('✅ Phase 4: Narrative Engine - OPERATIONAL');
        console.log('✅ Phase 5: Enhanced Dashboard - OPERATIONAL');

        console.log('\n🎮 Available Commands:');
        console.log('   /quest - Create bounties');
        console.log('   /claim - Claim a quest');
        console.log('   /approve - Approve quest completion');
        console.log('   /quests - List all quests');
        console.log('   /shop - Browse UVT shop');
        console.log('   /buy - Purchase with UVT');
        console.log('   /generate-insight - Generate philosophical content');
        console.log('   /commission-essay - Commission custom essay (100 UVT)');
        console.log('   /balance - Check UVT balance');

        console.log('\n📊 Dashboard: #sovereign-intel (auto-updates hourly)');
        console.log('\n🚀 Promethean Network State Economy is FULLY OPERATIONAL!\n');

        process.exit(0);

    } catch (err) {
        console.error('\n❌❌❌ VERIFICATION FAILED ❌❌❌');
        console.error(err);
        process.exit(1);
    }
}

verifyAllEnhancements();
