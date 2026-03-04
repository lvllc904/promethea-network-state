import { db } from './discord-ledger';

/**
 * Quest Manager - Firestore-backed quest/bounty system
 * 
 * Manages the full lifecycle of quests:
 * - Creation by admins
 * - Claims by users
 * - Approval and UVT distribution
 */

export interface Quest {
    questId: string;
    title: string;
    description: string;
    reward: number; // UVT amount
    status: 'OPEN' | 'CLAIMED' | 'COMPLETED';
    createdBy: string; // Discord user ID
    createdAt: Date;
    claimedBy?: string; // Discord user ID
    claimedAt?: Date;
    completedAt?: Date;
}

class QuestManager {
    private collection = db.collection('quests');

    /**
     * Create a new quest
     */
    async createQuest(
        title: string,
        description: string,
        reward: number,
        createdBy: string
    ): Promise<Quest> {
        const questId = `Q-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const quest: Quest = {
            questId,
            title,
            description,
            reward,
            status: 'OPEN',
            createdBy,
            createdAt: new Date()
        };

        await this.collection.doc(questId).set(quest as any);
        console.log(`[QuestManager] Created quest ${questId}: ${title} (${reward} UVT)`);

        return quest;
    }

    /**
     * User claims a quest
     */
    async claimQuest(questId: string, userId: string): Promise<Quest | null> {
        const questRef = this.collection.doc(questId);

        try {
            const result = await db.runTransaction(async (t) => {
                const doc = await t.get(questRef);

                if (!doc.exists) {
                    throw new Error('Quest not found');
                }

                const quest = doc.data() as Quest;

                if (quest.status !== 'OPEN') {
                    throw new Error(`Quest is already ${quest.status}`);
                }

                const updatedQuest: Quest = {
                    ...quest,
                    status: 'CLAIMED',
                    claimedBy: userId,
                    claimedAt: new Date()
                };

                t.update(questRef, updatedQuest as any);
                return updatedQuest;
            });

            console.log(`[QuestManager] Quest ${questId} claimed by ${userId}`);
            return result;
        } catch (e: any) {
            console.error('[QuestManager] Claim failed:', e.message);
            return null;
        }
    }

    /**
     * Admin approves a quest and awards UVT
     */
    async approveQuest(questId: string): Promise<Quest | null> {
        const questRef = this.collection.doc(questId);

        try {
            const result = await db.runTransaction(async (t) => {
                const doc = await t.get(questRef);

                if (!doc.exists) {
                    throw new Error('Quest not found');
                }

                const quest = doc.data() as Quest;

                if (quest.status !== 'CLAIMED') {
                    throw new Error(`Quest must be CLAIMED to approve (current: ${quest.status})`);
                }

                const updatedQuest: Quest = {
                    ...quest,
                    status: 'COMPLETED',
                    completedAt: new Date()
                };

                t.update(questRef, updatedQuest as any);
                return updatedQuest;
            });

            console.log(`[QuestManager] Quest ${questId} approved and completed`);
            return result;
        } catch (e: any) {
            console.error('[QuestManager] Approval failed:', e.message);
            return null;
        }
    }

    /**
     * Get a specific quest by ID
     */
    async getQuest(questId: string): Promise<Quest | null> {
        const doc = await this.collection.doc(questId).get();

        if (!doc.exists) {
            return null;
        }

        return doc.data() as Quest;
    }

    /**
     * List all quests with optional status filter
     */
    async listQuests(status?: 'OPEN' | 'CLAIMED' | 'COMPLETED'): Promise<Quest[]> {
        let query = this.collection.orderBy('createdAt', 'desc').limit(20);

        if (status) {
            query = query.where('status', '==', status) as any;
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => doc.data() as Quest);
    }

    /**
     * Get user's claimed quests
     */
    async getUserQuests(userId: string): Promise<Quest[]> {
        const snapshot = await this.collection
            .where('claimedBy', '==', userId)
            .orderBy('claimedAt', 'desc')
            .limit(10)
            .get();

        return snapshot.docs.map(doc => doc.data() as Quest);
    }
}

export const questManager = new QuestManager();
