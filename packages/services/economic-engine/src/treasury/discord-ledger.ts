import { db, COLLECTIONS } from '../db';

export { db };

/**
 * Sovereign Discord Ledger (UVT Micro-Ledger)
 * 
 * Manages the "Proof-of-Contribution" economy.
 * - Tracks UVT balances (8 decimal precision)
 * - Records Transaction History
 * - PERSISTENT: Uses Firestore
 */
export class DiscordLedger {

    async init() {
        console.log('[DiscordLedger] Connecting to Sovereign Firestore Ledger...');
        // No schema migration needed for NoSQL
        console.log('[DiscordLedger] Ready.');
    }

    /**
     * Credit a user with fractional UVT
     */
    async credit(discordId: string, username: string, amount: number, type: string, description: string) {
        const userRef = db.collection('uvt_ledger').doc(discordId);

        try {
            await db.runTransaction(async (t) => {
                const doc = await t.get(userRef);
                let newBalance = amount;

                if (doc.exists) {
                    newBalance += doc.data()!.balance || 0;
                    t.update(userRef, {
                        balance: newBalance,
                        username: username,
                        lastMinedAt: new Date()
                    });
                } else {
                    t.set(userRef, {
                        discordId: discordId,
                        username: username,
                        balance: amount,
                        lastMinedAt: new Date(),
                        joinedAt: new Date()
                    });
                }

                // 2. Log Transaction (Subcollection for scalability)
                const txRef = userRef.collection('transactions').doc();
                t.set(txRef, {
                    amount: amount,
                    type: type,
                    description: description,
                    createdAt: new Date()
                });
            });

            console.log(`[DiscordLedger] Credited ${amount} UVT to ${username}.`);
        } catch (e) {
            console.error('[DiscordLedger] Transaction Failed:', e);
        }

        return this.getBalance(discordId);
    }

    /**
     * Debit (spend) UVT from a user's balance
     * Returns new balance on success, throws error if insufficient funds
     */
    async debit(discordId: string, username: string, amount: number, type: string, description: string): Promise<number> {
        const userRef = db.collection('uvt_ledger').doc(discordId);

        try {
            const newBalance = await db.runTransaction(async (t) => {
                const doc = await t.get(userRef);

                if (!doc.exists) {
                    throw new Error('User has no UVT balance');
                }

                const currentBalance = doc.data()!.balance || 0;

                if (currentBalance < amount) {
                    throw new Error(`Insufficient UVT. Required: ${amount}, Available: ${currentBalance}`);
                }

                const updatedBalance = currentBalance - amount;

                t.update(userRef, {
                    balance: updatedBalance,
                    username: username,
                    lastSpentAt: new Date()
                });

                // Log spend transaction
                const txRef = userRef.collection('transactions').doc();
                t.set(txRef, {
                    type: type,
                    amount: -amount, // Negative for spending
                    description: description,
                    timestamp: new Date()
                });

                return updatedBalance;
            });

            console.log(`[DiscordLedger] Debited ${amount} UVT from ${username}. New balance: ${newBalance}`);
            return newBalance;
        } catch (e: any) {
            console.error('[DiscordLedger] Debit failed:', e.message);
            throw e;
        }
    }

    async getBalance(discordId: string): Promise<number> {
        const doc = await db.collection('uvt_ledger').doc(discordId).get();
        return doc.exists ? (doc.data() as any).balance : 0.0;
    }

    async getRichList(limit = 10) {
        const snapshot = await db.collection('uvt_ledger')
            .orderBy('balance', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            username: doc.data().username,
            balance: doc.data().balance
        }));
    }
}

export const discordLedger = new DiscordLedger();

