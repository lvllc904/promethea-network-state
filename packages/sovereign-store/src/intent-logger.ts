import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * Sovereign Intent Logger (Phase 2.5)
 * 
 * Body 3 (Local): Append-only log of user actions stored in IndexedDB.
 * Ensures auditability and persistence across browser sessions.
 * 
 * Privacy: Data never leaves the device unless user explicitly opts in.
 */

interface IntentLogSchema extends DBSchema {
    intents: {
        key: string; // UUID
        value: {
            id: string;
            timestamp: number;
            action: string; // e.g., "create_proposal", "vote", "claim_labor"
            payload: Record<string, any>;
            citizenId?: string; // Optional: user's DID
        };
        indexes: { 'by-timestamp': number; 'by-action': string };
    };
}

class IntentLogger {
    private db: IDBPDatabase<IntentLogSchema> | null = null;
    private readonly DB_NAME = 'promethea-sovereign-store';
    private readonly DB_VERSION = 1;

    async init(): Promise<void> {
        if (this.db) return; // Already initialized

        this.db = await openDB<IntentLogSchema>(this.DB_NAME, this.DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('intents')) {
                    const store = db.createObjectStore('intents', { keyPath: 'id' });
                    store.createIndex('by-timestamp', 'timestamp');
                    store.createIndex('by-action', 'action');
                }
            },
        });
    }

    async log(action: string, payload: Record<string, any>, citizenId?: string): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('IntentLogger not initialized');

        const intent = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            action,
            payload,
            citizenId,
        };

        await this.db.add('intents', intent);
    }

    async getRecent(limit: number = 50): Promise<any[]> {
        await this.init();
        if (!this.db) throw new Error('IntentLogger not initialized');

        const tx = this.db.transaction('intents', 'readonly');
        const index = tx.store.index('by-timestamp');
        const intents = await index.getAll();

        return intents.reverse().slice(0, limit);
    }

    async getByAction(action: string): Promise<any[]> {
        await this.init();
        if (!this.db) throw new Error('IntentLogger not initialized');

        const tx = this.db.transaction('intents', 'readonly');
        const index = tx.store.index('by-action');
        return await index.getAll(action);
    }

    async exportForTelemetry(optIn: boolean = false): Promise<any[] | null> {
        if (!optIn) return null; // Respect privacy

        await this.init();
        if (!this.db) throw new Error('IntentLogger not initialized');

        const intents = await this.db.getAll('intents');

        // Anonymize: Remove citizenId
        return intents.map(({ citizenId, ...intent }) => intent);
    }
}

export const intentLogger = new IntentLogger();
