import { db } from '../treasury/discord-ledger';

/**
 * Metrics Calculator
 * Computes advanced economic and engagement metrics for the dashboard
 */

export interface AdvancedMetrics {
    // Economic Health
    uvtVelocity: number; // Transactions per day
    totalTransactions: number;
    totalMined: number;
    totalSpent: number;

    // Community Engagement
    activeCitizens7d: number;
    avgUvtPerCitizen: number;

    // Quest Metrics
    questCompletionRate: number;
    activeQuests: number;

    // Wealth Distribution (Sovereign Metrics)
    wealthConcentration: string; // "Low", "Medium", "High"
    giniCoefficient: number;     // 0-1 scale
    laborDistribution: { ai: number; human: number }; // Percentage
}

/**
 * Calculate UVT velocity (transactions per day over last 7 days)
 */
async function calculateVelocity(): Promise<{ velocity: number; totalTx: number }> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    let totalTx = 0;

    // Query all user transaction subcollections
    const usersSnapshot = await db.collection('uvt_ledger').get();

    for (const userDoc of usersSnapshot.docs) {
        const txSnapshot = await userDoc.ref
            .collection('transactions')
            .where('timestamp', '>=', sevenDaysAgo)
            .get();

        totalTx += txSnapshot.size;
    }

    const velocity = totalTx / 7; // Per day average
    return { velocity, totalTx };
}

/**
 * Calculate active citizens (users with transactions in last 7 days)
 */
async function calculateActiveCitizens(): Promise<number> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const usersSnapshot = await db.collection('uvt_ledger')
        .where('lastMinedAt', '>=', sevenDaysAgo)
        .get();

    return usersSnapshot.size;
}

/**
 * Calculate mining vs spending totals
 */
async function calculateMiningVsSpending(): Promise<{ mined: number; spent: number }> {
    let totalMined = 0;
    let totalSpent = 0;

    const usersSnapshot = await db.collection('uvt_ledger').get();

    for (const userDoc of usersSnapshot.docs) {
        const txSnapshot = await userDoc.ref.collection('transactions').get();

        txSnapshot.forEach(tx => {
            const data = tx.data();
            if (data.amount > 0) {
                totalMined += data.amount;
            } else {
                totalSpent += Math.abs(data.amount);
            }
        });
    }

    return { mined: totalMined, spent: totalSpent };
}

/**
 * Calculate quest completion rate
 */
async function calculateQuestMetrics(): Promise<{ completionRate: number; activeQuests: number }> {
    const questsSnapshot = await db.collection('quests').get();

    if (questsSnapshot.empty) {
        return { completionRate: 0, activeQuests: 0 };
    }

    let completed = 0;
    let active = 0;

    questsSnapshot.forEach(doc => {
        const quest = doc.data();
        if (quest.status === 'COMPLETED') completed++;
        if (quest.status === 'OPEN' || quest.status === 'CLAIMED') active++;
    });

    const total = questsSnapshot.size;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return { completionRate, activeQuests: active };
}

/**
 * Calculate wealth concentration (simplified Gini approximation)
 */
async function calculateWealthConcentration(): Promise<string> {
    const usersSnapshot = await db.collection('uvt_ledger').get();
    const balances = usersSnapshot.docs.map(doc => doc.data().balance || 0).sort((a, b) => b - a);

    if (balances.length === 0) return 'N/A';

    const totalWealth = balances.reduce((sum, b) => sum + b, 0);
    if (totalWealth === 0) return 'N/A';

    // Top 20% holds what % of wealth?
    const top20Count = Math.ceil(balances.length * 0.2);
    const top20Wealth = balances.slice(0, top20Count).reduce((sum, b) => sum + b, 0);
    const top20Percentage = (top20Wealth / totalWealth) * 100;

    if (top20Percentage > 80) return 'High (Top 20% holds >80%)';
    if (top20Percentage > 60) return 'Medium (Top 20% holds >60%)';
    return 'Low (Distributed)';
}

/**
 * Calculate true Gini Coefficient
 */
function calculateGiniCoefficient(balances: number[]): number {
    if (balances.length < 2) return 0;
    const n = balances.length;
    let sumDiff = 0;
    let sumBalances = 0;
    for (let i = 0; i < n; i++) {
        sumBalances += balances[i];
        for (let j = 0; j < n; j++) {
            sumDiff += Math.abs(balances[i] - balances[j]);
        }
    }
    return Math.round((sumDiff / (2 * n * n * (sumBalances / n))) * 100) / 100;
}

/**
 * Calculate Labor Distribution (AI Models vs Human Citizens)
 */
async function calculateLaborDistribution(): Promise<{ ai: number; human: number }> {
    const transfers = await db.collection('universal_value_tokens').get();
    let aiLabor = 0;
    let humanLabor = 0;

    transfers.forEach(doc => {
        const data = doc.data();
        if (data.ownerId?.startsWith('did:prmth:model')) {
            aiLabor += data.amount;
        } else {
            humanLabor += data.amount;
        }
    });

    const total = aiLabor + humanLabor;
    if (total === 0) return { ai: 0, human: 0 };

    return {
        ai: Math.round((aiLabor / total) * 100),
        human: Math.round((humanLabor / total) * 100)
    };
}

/**
 * Calculate all advanced metrics
 */
export async function calculateAdvancedMetrics(): Promise<AdvancedMetrics> {
    console.log('[MetricsCalculator] Computing advanced metrics...');

    const [
        velocityData,
        activeCitizens,
        miningSpending,
        questMetrics,
        wealthConcentration,
        laborDistribution
    ] = await Promise.all([
        calculateVelocity(),
        calculateActiveCitizens(),
        calculateMiningVsSpending(),
        calculateQuestMetrics(),
        calculateWealthConcentration(),
        calculateLaborDistribution()
    ]);

    const ledgerSnapshot = await db.collection('uvt_ledger').get();
    const balances = ledgerSnapshot.docs.map(doc => doc.data().balance || 0).sort((a, b) => b - a);
    const gini = calculateGiniCoefficient(balances);

    const totalUsers = ledgerSnapshot.size;
    const avgUvt = totalUsers > 0 ? miningSpending.mined / totalUsers : 0;

    const metrics: AdvancedMetrics = {
        uvtVelocity: Math.round(velocityData.velocity * 100) / 100,
        totalTransactions: velocityData.totalTx,
        totalMined: Math.round(miningSpending.mined * 100) / 100,
        totalSpent: Math.round(miningSpending.spent * 100) / 100,
        activeCitizens7d: activeCitizens,
        avgUvtPerCitizen: Math.round(avgUvt * 100) / 100,
        questCompletionRate: Math.round(questMetrics.completionRate * 10) / 10,
        activeQuests: questMetrics.activeQuests,
        wealthConcentration,
        giniCoefficient: gini,
        laborDistribution: laborDistribution
    };

    console.log('[MetricsCalculator] Metrics computed:', metrics);
    return metrics;
}
