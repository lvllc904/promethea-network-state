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
            const doc = await userRef.get();
            let newBalance = amount;

            if (doc.exists) {
                const data = typeof doc.data === 'function' ? doc.data() : (doc as any).data;
                newBalance += (data?.balance || 0);
                await userRef.update({
                    balance: newBalance,
                    username: username,
                    lastMinedAt: new Date()
                });
            } else {
                await userRef.set({
                    discordId: discordId,
                    username: username,
                    balance: amount,
                    lastMinedAt: new Date(),
                    joinedAt: new Date()
                });
            }

            // 2. Log Transaction (Flat structure for SQLite compatibility)
            const txId = `${discordId}_${Date.now()}`;
            await db.collection('uvt_transactions').doc(txId).set({
                discordId: discordId,
                amount: amount,
                type: type,
                description: description,
                createdAt: new Date()
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
            const doc = await userRef.get();

            if (!doc.exists) {
                throw new Error('User has no UVT balance');
            }

            const data = typeof doc.data === 'function' ? doc.data() : (doc as any).data;
            const currentBalance = data?.balance || 0;

            if (currentBalance < amount) {
                throw new Error(`Insufficient UVT. Required: ${amount}, Available: ${currentBalance}`);
            }

            const updatedBalance = currentBalance - amount;

            await userRef.update({
                balance: updatedBalance,
                username: username,
                lastSpentAt: new Date()
            });

            // Log spend transaction
            const txId = `${discordId}_${Date.now()}`;
            await db.collection('uvt_transactions').doc(txId).set({
                discordId: discordId,
                type: type,
                amount: -amount, // Negative for spending
                description: description,
                timestamp: new Date()
            });

            console.log(`[DiscordLedger] Debited ${amount} UVT from ${username}. New balance: ${updatedBalance}`);
            return updatedBalance;
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
        let docs = [];
        try {
            const collectionObj = db.collection('uvt_ledger') as any;
            if (collectionObj.orderBy) {
                const snapshot = await collectionObj.orderBy('balance', 'desc').limit(limit).get();
                docs = snapshot.docs.map((d: any) => d.data());
            } else {
                const all = await collectionObj.get();
                docs = all.map((d: any) => typeof d.data === 'function' ? d.data() : d.data)
                    .sort((a: any, b: any) => (b.balance || 0) - (a.balance || 0))
                    .slice(0, limit);
            }
        } catch (e) {
            console.error('[DiscordLedger] Failed to fetch rich list', e);
        }

        return docs.map((data: any) => ({
            username: data.username,
            balance: data.balance
        }));
    }
}

export const discordLedger = new DiscordLedger();

