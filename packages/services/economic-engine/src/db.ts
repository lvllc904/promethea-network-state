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
    private createdTables = new Set<string>();

    private async ensureTable(name: string) {
        if (!this.db) return;
        const sanitized = name.replace(/[^a-zA-Z0-9_]/g, '');
        if (!sanitized) throw new Error(`Invalid table name: ${name}`);
        if (this.createdTables.has(sanitized)) return;
        
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS ${sanitized} (
                id TEXT PRIMARY KEY, 
                orgId TEXT DEFAULT 'global', 
                data TEXT, 
                timestamp DATETIME
            );
        `);
        this.createdTables.add(sanitized);
    }

    async init() {
        if (this.initialized) return;
        const dbPath = path.join(process.cwd(), 'pro-forma.db');
        this.db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        
        console.log(`[STORAGE] 🏰 Sovereign SQLite substrate initialized: ${dbPath}`);
        
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS real_world_assets (
                id TEXT PRIMARY KEY, 
                orgId TEXT, 
                data TEXT, 
                realityState TEXT, 
                progressionState TEXT DEFAULT 'IDEA', 
                prerequisiteTasks TEXT DEFAULT '[]'
            );
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
            CREATE TABLE IF NOT EXISTS quests (
                id TEXT PRIMARY KEY, 
                orgId TEXT, 
                data TEXT, 
                timestamp DATETIME, 
                associatedAssetId TEXT
            );
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
            CREATE TABLE IF NOT EXISTS substrate (id TEXT PRIMARY KEY, orgId TEXT, data TEXT, timestamp DATETIME);
        `);

        await this.db.run(`
            INSERT OR IGNORE INTO substrate (id, orgId, data, timestamp)
            VALUES ('status', 'tpns_genesis', ?, ?)
        `, [JSON.stringify({ status: 'NOMINAL', uptime: 86400, defenseLevel: 4, immuneIntegrity: 94, activeNodes: 3 }), new Date().toISOString()]);

        const preCreated = [
            'real_world_assets', 'universal_value_tokens', 'proposals', 'revenue_events',
            'exodus_logs', 'omni_intel_lake', 'treasury', 'treasury_events', 'uvt_ledger',
            'uvt_transactions', 'infrastructure', 'grant_opportunities', 'api_metrics',
            'celestial_events', 'sovereign_intelligence', 'labor_records', 'security_telemetry',
            'quests', 'citizens', 'pledges', 'sessions', 'diplomatic_sessions',
            'hardware_jobs', 'planetary_healing', 'bio_events', 'acquisitions',
            'content_archive', 'billing_records', 'market', 'marketplace', 'broker',
            'omni_vectors', 'organizations', 'ledger', 'waterfall', 'wallet',
            'narrative', 'votes', 'sovereign_settings', 'substrate'
        ];
        for (const t of preCreated) {
            this.createdTables.add(t);
        }

        // Schema Migration: Ensure all tables have the orgId column to prevent seeding/query failures
        const tables = [
            'real_world_assets', 'universal_value_tokens', 'proposals', 'revenue_events',
            'exodus_logs', 'omni_intel_lake', 'treasury', 'treasury_events', 'uvt_ledger',
            'uvt_transactions', 'infrastructure', 'grant_opportunities', 'api_metrics',
            'sovereign_intelligence', 'labor_records', 'quests', 'citizens', 'diplomatic_sessions',
            'hardware_jobs', 'acquisitions', 'content_archive', 'marketplace', 'ledger',
            'waterfall', 'wallet', 'narrative', 'votes', 'sovereign_settings',
            'celestial_events', 'security_telemetry', 'pledges', 'sessions', 'planetary_healing',
            'bio_events', 'billing_records', 'market', 'broker', 'organizations'
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

        // Self-healing migrations for progressive state and quest relationships
        try {
            if (this.db) {
                await this.db.get(`SELECT progressionState FROM real_world_assets LIMIT 1`);
            }
        } catch (err: any) {
            if (err.message && err.message.includes('no such column: progressionState')) {
                console.log(`[STORAGE] 🛠️ Migration: Adding progressionState column to real_world_assets...`);
                if (this.db) {
                    await this.db.exec(`ALTER TABLE real_world_assets ADD COLUMN progressionState TEXT DEFAULT 'IDEA'`);
                }
            }
        }

        try {
            if (this.db) {
                await this.db.get(`SELECT prerequisiteTasks FROM real_world_assets LIMIT 1`);
            }
        } catch (err: any) {
            if (err.message && err.message.includes('no such column: prerequisiteTasks')) {
                console.log(`[STORAGE] 🛠️ Migration: Adding prerequisiteTasks column to real_world_assets...`);
                if (this.db) {
                    await this.db.exec(`ALTER TABLE real_world_assets ADD COLUMN prerequisiteTasks TEXT DEFAULT '[]'`);
                }
            }
        }

        try {
            if (this.db) {
                await this.db.get(`SELECT associatedAssetId FROM quests LIMIT 1`);
            }
        } catch (err: any) {
            if (err.message && err.message.includes('no such column: associatedAssetId')) {
                console.log(`[STORAGE] 🛠️ Migration: Adding associatedAssetId column to quests...`);
                if (this.db) {
                    await this.db.exec(`ALTER TABLE quests ADD COLUMN associatedAssetId TEXT`);
                }
            }
        }

        this.initialized = true;
    }

    collection(name: string, orgId?: string) {
        const sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '');
        return {
            doc: (id: string) => ({
                set: async (data: any) => {
                    await this.init();
                    await this.ensureTable(sanitizedName);
                    // Ensure the data object contains the orgId if we are in a scoped context
                    const finalData = orgId ? { ...data, orgId } : data;
                    const res = await this.db?.run(`INSERT OR REPLACE INTO ${sanitizedName} (id, orgId, data) VALUES (?, ?, ?)`, [id, orgId || 'global', JSON.stringify(finalData)]);
                    
                    // Sync dedicated columns
                    if (sanitizedName === 'real_world_assets' && this.db) {
                        const progressionState = finalData.progressionState || 'IDEA';
                        const prerequisiteTasks = JSON.stringify(finalData.prerequisiteTasks || []);
                        const realityState = finalData.realityState || 'SIMULATED';
                        await this.db.run(`UPDATE real_world_assets SET progressionState = ?, prerequisiteTasks = ?, realityState = ? WHERE id = ?`, [progressionState, prerequisiteTasks, realityState, id]);
                    } else if (sanitizedName === 'quests' && this.db) {
                        const associatedAssetId = finalData.associatedAssetId || null;
                        await this.db.run(`UPDATE quests SET associatedAssetId = ? WHERE id = ?`, [associatedAssetId, id]);
                    }
                    return res;
                },
                update: async (data: any) => {
                    await this.init();
                    await this.ensureTable(sanitizedName);
                    const existing = await this.db?.get(`SELECT data FROM ${sanitizedName} WHERE id = ?`, [id]);
                    const merged = { ...(existing ? JSON.parse(existing.data) : {}), ...data };
                    const res = await this.db?.run(`INSERT OR REPLACE INTO ${sanitizedName} (id, orgId, data) VALUES (?, ?, ?)`, [id, orgId || 'global', JSON.stringify(merged)]);
                    
                    // Sync dedicated columns
                    if (sanitizedName === 'real_world_assets' && this.db) {
                        const progressionState = merged.progressionState || 'IDEA';
                        const prerequisiteTasks = JSON.stringify(merged.prerequisiteTasks || []);
                        const realityState = merged.realityState || 'SIMULATED';
                        await this.db.run(`UPDATE real_world_assets SET progressionState = ?, prerequisiteTasks = ?, realityState = ? WHERE id = ?`, [progressionState, prerequisiteTasks, realityState, id]);
                    } else if (sanitizedName === 'quests' && this.db) {
                        const associatedAssetId = merged.associatedAssetId || null;
                        await this.db.run(`UPDATE quests SET associatedAssetId = ? WHERE id = ?`, [associatedAssetId, id]);
                    }
                    return res;
                },
                get: async () => {
                    await this.init();
                    await this.ensureTable(sanitizedName);
                    const row = await this.db?.get(`SELECT data FROM ${sanitizedName} WHERE id = ?`, [id]);
                    return { exists: !!row, data: () => row ? JSON.parse(row.data) : null };
                }
            }),
            add: async (data: any) => {
                await this.init();
                await this.ensureTable(sanitizedName);
                const id = Math.random().toString(36).substr(2, 9);
                const finalData = orgId ? { ...data, orgId } : data;
                const res = await this.db?.run(`INSERT INTO ${sanitizedName} (id, orgId, data, timestamp) VALUES (?, ?, ?, ?)`, [id, orgId || 'global', JSON.stringify(finalData), new Date().toISOString()]);
                
                // Sync dedicated columns
                if (sanitizedName === 'real_world_assets' && this.db) {
                    const progressionState = finalData.progressionState || 'IDEA';
                    const prerequisiteTasks = JSON.stringify(finalData.prerequisiteTasks || []);
                    const realityState = finalData.realityState || 'SIMULATED';
                    await this.db.run(`UPDATE real_world_assets SET progressionState = ?, prerequisiteTasks = ?, realityState = ? WHERE id = ?`, [progressionState, prerequisiteTasks, realityState, id]);
                } else if (sanitizedName === 'quests' && this.db) {
                    const associatedAssetId = finalData.associatedAssetId || null;
                    await this.db.run(`UPDATE quests SET associatedAssetId = ? WHERE id = ?`, [associatedAssetId, id]);
                }
                return { ...res, lastID: id };
            },
            get: async () => {
                await this.init();
                await this.ensureTable(sanitizedName);
                const queryStr = orgId 
                    ? `SELECT id, data FROM ${sanitizedName} WHERE orgId = ?` 
                    : `SELECT id, data FROM ${sanitizedName}`;
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
                        try {
                            const file = this.gcs.bucket(this.bucketName).file(`${name}/${id}.json`);
                            const safeData = this.redactPII(updated.data());
                            await file.save(JSON.stringify(safeData), { contentType: 'application/json' });
                        } catch (e: any) {
                            console.warn(`[GCS Bridge] Mirroring update failed for ${id}: ${e.message}`);
                        }
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
                
                try {
                    const file = this.gcs.bucket(this.bucketName).file(`${name}/${id}.json`);
                    const safeData = this.redactPII({ ...data, id });
                    await file.save(JSON.stringify(safeData), { contentType: 'application/json' });
                } catch (e: any) {
                    console.warn(`[GCS Bridge] Mirroring addition failed for ${id}: ${e.message}`);
                }

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
