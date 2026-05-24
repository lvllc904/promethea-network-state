import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import * as path from 'path';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

/**
 * Sovereign Storage Adapter (Exodus v2.0)
 * 
 * Supports two modes: 
 * - FIREBASE (Default, legacy billing)
 * - SOVEREIGN (Local SQLite + GCS Sync, $0 incremental cost)
 */
export interface StorageAdapter {
    collection(name: string, orgId?: string): any;
    runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T>;
}

class SQLiteAdapter implements StorageAdapter {
    private db: Database | null = null;
    private initialized = false;

    async init() {
        if (this.initialized) return;
        const dbPath = path.join(process.cwd(), 'pro-forma.db');
        this.db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        
        console.log(`[STORAGE] 🏰 Sovereign SQLite substrate initialized: ${dbPath}`);
        
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS real_world_assets (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, realityState TEXT);
            CREATE TABLE IF NOT EXISTS universal_value_tokens (id TEXT PRIMARY KEY, orgId TEXT, data TEXT);
            CREATE TABLE IF NOT EXISTS proposals (id TEXT PRIMARY KEY, orgId TEXT, data TEXT);
            CREATE TABLE IF NOT EXISTS revenue_events (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS exodus_logs (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS omni_intel_lake (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS treasury (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS treasury_events (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS uvt_ledger (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS uvt_transactions (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS infrastructure (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS grant_opportunities (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS api_metrics (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS celestial_events (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS sovereign_intelligence (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS labor_records (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS security_telemetry (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS quests (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS citizens (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS pledges (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS diplomatic_sessions (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS hardware_jobs (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS planetary_healing (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS bio_events (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS acquisitions (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS content_archive (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS billing_records (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS market (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS marketplace (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS broker (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS omni_vectors (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS organizations (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS ledger (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS waterfall (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS wallet (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS narrative (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS votes (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS sovereign_settings (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
        `);

        // Schema Migration: Ensure all tables have the orgId column to prevent seeding/query failures
        const tables = [
            'real_world_assets', 'universal_value_tokens', 'proposals', 'revenue_events',
            'exodus_logs', 'omni_intel_lake', 'treasury', 'treasury_events', 'uvt_ledger',
            'uvt_transactions', 'infrastructure', 'grant_opportunities', 'api_metrics',
            'sovereign_intelligence', 'labor_records', 'quests', 'citizens', 'diplomatic_sessions',
            'hardware_jobs', 'acquisitions', 'content_archive', 'marketplace', 'ledger',
            'waterfall', 'wallet', 'narrative', 'votes', 'sovereign_settings'
        ];
        for (const table of tables) {
            try {
                if (this.db) {
                    await this.db.get(`SELECT orgId FROM ${table} LIMIT 1`);
                }
            } catch (err: any) {
                if (err.message && err.message.includes('no such column: orgId')) {
                    console.log(`[STORAGE] 🛠️ Migration: Adding orgId column to ${table}...`);
                    try {
                        if (this.db) {
                            await this.db.exec(`ALTER TABLE ${table} ADD COLUMN orgId TEXT DEFAULT 'global'`);
                        }
                    } catch (alterErr) {
                        console.error(`[STORAGE] ❌ Migration failed for ${table}:`, alterErr);
                    }
                }
            }
        }

        this.initialized = true;
    }

    collection(name: string, orgId?: string) {
        return {
            doc: (id: string) => ({
                set: async (data: any) => {
                    await this.init();
                    // Ensure the data object contains the orgId if we are in a scoped context
                    const finalData = orgId ? { ...data, orgId } : data;
                    return this.db?.run(`INSERT OR REPLACE INTO ${name} (id, orgId, data) VALUES (?, ?, ?)`, [id, orgId || 'global', JSON.stringify(finalData)]);
                },
                update: async (data: any) => {
                    await this.init();
                    const existing = await this.db?.get(`SELECT data FROM ${name} WHERE id = ?`, [id]);
                    const merged = { ...(existing ? JSON.parse(existing.data) : {}), ...data };
                    return this.db?.run(`INSERT OR REPLACE INTO ${name} (id, orgId, data) VALUES (?, ?, ?)`, [id, orgId || 'global', JSON.stringify(merged)]);
                },
                get: async () => {
                    await this.init();
                    const row = await this.db?.get(`SELECT data FROM ${name} WHERE id = ?`, [id]);
                    return { exists: !!row, data: () => row ? JSON.parse(row.data) : null };
                }
            }),
            add: async (data: any) => {
                await this.init();
                const id = Math.random().toString(36).substr(2, 9);
                const finalData = orgId ? { ...data, orgId } : data;
                const res = await this.db?.run(`INSERT INTO ${name} (id, orgId, data, timestamp) VALUES (?, ?, ?, ?)`, [id, orgId || 'global', JSON.stringify(finalData), new Date().toISOString()]);
                return { ...res, lastID: id };
            },
            get: async () => {
                await this.init();
                const queryStr = orgId 
                    ? `SELECT id, data FROM ${name} WHERE orgId = ?` 
                    : `SELECT id, data FROM ${name}`;
                const rows = await this.db?.all(queryStr, orgId ? [orgId] : []);
                return {
                    docs: rows ? rows.map(r => ({ id: r.id, data: () => JSON.parse(r.data) })) : []
                };
            }
        };
    }

    async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
        await this.init();
        const transactionObject = {
            get: async (ref: any) => ref.get(),
            update: async (ref: any, data: any) => ref.update(data),
            set: async (ref: any, data: any) => ref.set(data),
        };
        return await updateFunction(transactionObject);
    }
}

/**
 * Bridged Storage Adapter (The Revelation Bridge)
 * 
 * Objective: Simultaneously writes to Local SQLite (Internal reasoning)
 * and Public GCS / IPFS (Universal Transparency). 
 * FIRESTORE IS DECOMMISSIONED.
 */
class BridgedAdapter implements StorageAdapter {
    private sqlite = new SQLiteAdapter();
    private gcs = new Storage();
    private bucketName = process.env.PUBLIC_METABOLIC_BUCKET || 'promethea-omni-lake-385120524005';

    private isRestoring = false;
    private memoryRestored = false;

    constructor() {
        console.log(`[Storage Bridge] 🌊 Revelation Bridge active. Sink: GCS://${this.bucketName} + IPFS`);
    }

    private redactPII(data: any): any {
        if (!data) return data;
        if (typeof data !== 'object') return data;
        
        const redacted = { ...data };
        const sensitiveKeys = ['email', 'phoneNumber', 'ssn', 'privateKey', 'socialSecurity', 'taxId', 'dob', 'walletSecret'];
        
        for (const key of Object.keys(redacted)) {
            // General PII masking
            if (sensitiveKeys.includes(key) && typeof redacted[key] === 'string') {
                redacted[key] = '[REDACTED - SOVEREIGN PRIVACY PROTOCOL]';
            } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
                redacted[key] = this.redactPII(redacted[key]);
            }
            
            // Fuzzing explicit residential addresses (keeping city/state level context for macroeconomic tracking)
            if ((key === 'address' || key === 'location') && typeof redacted[key] === 'string') {
                // Heuristic: If there are street numbers, scrub them. Otherwise, assume it's just "City, State"
                if (/^\d+\s/.test(redacted[key])) {
                    const parts = redacted[key].split(',');
                    redacted[key] = (parts.length > 1 ? parts.slice(1).join(',').trim() : '[ADDRESS FUZZED]');
                }
            }
        }
        return redacted;
    }

    async restoreMemory() {
        if (this.memoryRestored || this.isRestoring) return;
        this.isRestoring = true;
        console.log(`[Storage Bridge] 🧠 Initiating Memory Rehydration from GCS://${this.bucketName}...`);
        
        try {
            // Rehydrate the core tables to restore object permanence
            const collectionsToRestore = ['real_world_assets', 'proposals', 'omni_intel_lake', 'narrative', 'vetoes'];
            const bucket = this.gcs.bucket(this.bucketName);
            
            const [exists] = await bucket.exists();
            if (!exists) {
                console.warn(`[Storage Bridge] ⚠️ Bucket ${this.bucketName} not found. Skipping rehydration.`);
                this.isRestoring = false;
                this.memoryRestored = true;
                return;
            }

            for (const collectionName of collectionsToRestore) {
                const [files] = await bucket.getFiles({ prefix: `${collectionName}/` });
                const sqlColl = this.sqlite.collection(collectionName);
                
                let restoredCount = 0;
                for (const file of files) {
                    if (!file.name.endsWith('.json')) continue;
                    try {
                        const [contents] = await file.download();
                        const data = JSON.parse(contents.toString('utf-8'));
                        const id = path.basename(file.name, '.json');
                        await sqlColl.doc(id).set(data);
                        restoredCount++;
                    } catch (err) {
                        console.error(`[Storage Bridge] Failed to restore memory fragment ${file.name}:`, err);
                    }
                }
                if (restoredCount > 0) {
                    console.log(`[Storage Bridge] 🧠 Restored ${restoredCount} fragments to ${collectionName}.`);
                }
            }
            console.log(`[Storage Bridge] ✅ Memory Rehydration complete. Object permanence restored.`);
        } catch (e) {
            console.error('[Storage Bridge] 🛑 CRITICAL: Memory Rehydration Failed:', e);
        } finally {
            this.isRestoring = false;
            this.memoryRestored = true;
        }
    }

    collection(name: string, orgId?: string): any {
        const sqlColl = this.sqlite.collection(name, orgId);

        const queryProxy = {
            orderBy: () => queryProxy,
            limit: () => queryProxy,
            where: () => queryProxy,
            doc: (id: string) => ({
                set: async (data: any) => {
                    const res = await sqlColl.doc(id).set(data);
                    
                    // Public Revelation Mirror (GCS)
                    // We save as a JSON artifact so lvhllc.org can consume it directly
                    try {
                        const file = this.gcs.bucket(this.bucketName).file(`${name}/${id}.json`);
                        const safeData = this.redactPII(data);
                        await file.save(JSON.stringify(safeData), {
                            contentType: 'application/json',
                            metadata: { cacheControl: 'public, max-age=30' }
                        });
                    } catch (e) {
                         // We don't block the engine on cloud availability
                         console.warn(`[GCS Bridge] Mirroring failed for ${id}: ${e.message}`);
                    }
                    
                    return { id };
                },
                update: async (data: any) => {
                    const res = await sqlColl.doc(id).update(data);
                    // Update the mirror
                    const updated = await sqlColl.doc(id).get();
                    if (updated.exists) {
                        const file = this.gcs.bucket(this.bucketName).file(`${name}/${id}.json`);
                        const safeData = this.redactPII(updated.data());
                        await file.save(JSON.stringify(safeData), { contentType: 'application/json' });
                    }
                    return { id };
                },
                get: async () => {
                    const res = await sqlColl.doc(id).get();
                    return { exists: res.exists, id, data: () => res.data() };
                }
            }),
            add: async (data: any) => {
                const res = await sqlColl.add(data);
                const id = res?.lastID?.toString() || Math.random().toString(36).substr(2, 9);
                
                const file = this.gcs.bucket(this.bucketName).file(`${name}/${id}.json`);
                const safeData = this.redactPII({ ...data, id });
                await file.save(JSON.stringify(safeData), { contentType: 'application/json' });

                return { id };
            },
            get: async () => {
                const res = await sqlColl.get();
                return {
                    docs: res.docs.map((r: any) => ({
                        id: r.id || 'unknown',
                        data: () => typeof r.data === 'function' ? r.data() : r
                    }))
                };
            }
        };

        return queryProxy;
    }

    async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
        return await this.sqlite.runTransaction(updateFunction);
    }
}

export const db = new BridgedAdapter();

export const COLLECTIONS = {
    ASSETS: 'real_world_assets',
    REVENUE_EVENTS: 'revenue_events',
    LABOR_RECORDS: 'labor_records',
    UVT_TRANSFERS: 'universal_value_tokens',
    PROPOSALS: 'proposals',
    DIPLOMATIC_SESSIONS: 'diplomatic_sessions',
    HARDWARE_JOBS: 'hardware_jobs',
    PLANETARY_HEALING: 'planetary_healing',
    BIO_EVENTS: 'bio_events',
    ACQUISITIONS: 'acquisitions',
    OMNI_INTEL_LAKE: 'omni_intel_lake',
    TREASURY: 'treasury',
    TREASURY_EVENTS: 'treasury_events',
    MARKET: 'market',
    MARKETPLACE: 'marketplace',
    ORGANIZATIONS: 'organizations',
    SECURITY_TELEMETRY: 'security_telemetry',
    OMNI_VECTORS: 'omni_vectors',
    VOTES: 'votes',
    NARRATIVE: 'narrative',
    SOVEREIGN_SETTINGS: 'sovereign_settings'
};
