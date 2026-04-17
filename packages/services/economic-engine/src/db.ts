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
    collection(name: string): any;
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
            CREATE TABLE IF NOT EXISTS real_world_assets (id TEXT PRIMARY KEY, data TEXT, realityState TEXT);
            CREATE TABLE IF NOT EXISTS universal_value_tokens (id TEXT PRIMARY KEY, data TEXT);
            CREATE TABLE IF NOT EXISTS proposals (id TEXT PRIMARY KEY, data TEXT);
            CREATE TABLE IF NOT EXISTS revenue_events (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS exodus_logs (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS omni_intel_lake (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS treasury (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS treasury_events (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS uvt_ledger (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS uvt_transactions (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS infrastructure (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS grant_opportunities (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS api_metrics (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS celestial_events (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS sovereign_intelligence (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS labor_records (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS security_telemetry (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS quests (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS citizens (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS pledges (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS diplomatic_sessions (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS hardware_jobs (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS planetary_healing (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS bio_events (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS acquisitions (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS content_archive (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS billing_records (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS market (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
            CREATE TABLE IF NOT EXISTS marketplace (id TEXT PRIMARY KEY, data TEXT, timestamp DATETIME);
        `);
        this.initialized = true;
    }

    collection(name: string) {
        return {
            doc: (id: string) => ({
                set: async (data: any) => {
                    await this.init();
                    return this.db?.run(`INSERT OR REPLACE INTO ${name} (id, data) VALUES (?, ?)`, [id, JSON.stringify(data)]);
                },
                update: async (data: any) => {
                    await this.init();
                    const existing = await this.db?.get(`SELECT data FROM ${name} WHERE id = ?`, [id]);
                    const merged = { ...(existing ? JSON.parse(existing.data) : {}), ...data };
                    return this.db?.run(`INSERT OR REPLACE INTO ${name} (id, data) VALUES (?, ?)`, [id, JSON.stringify(merged)]);
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
                const res = await this.db?.run(`INSERT INTO ${name} (id, data, timestamp) VALUES (?, ?, ?)`, [id, JSON.stringify(data), new Date().toISOString()]);
                return { ...res, lastID: id };
            },
            get: async () => {
                await this.init();
                const rows = await this.db?.all(`SELECT data FROM ${name}`);
                return rows ? rows.map(r => ({ data: () => JSON.parse(r.data) })) : [];
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
    private bucketName = process.env.PUBLIC_METABOLIC_BUCKET || 'promethea-omni-lake';

    constructor() {
        console.log(`[Storage Bridge] 🌊 Revelation Bridge active. Sink: GCS://${this.bucketName} + IPFS`);
    }

    collection(name: string): any {
        const sqlColl = this.sqlite.collection(name);

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
                        await file.save(JSON.stringify(data), {
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
                        await file.save(JSON.stringify(updated.data()), { contentType: 'application/json' });
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
                await file.save(JSON.stringify({ ...data, id }), { contentType: 'application/json' });

                return { id };
            },
            get: async () => {
                const rows = await sqlColl.get();
                return {
                    docs: rows.map((r: any) => ({
                        id: r.id || 'unknown',
                        data: () => r.data ? r.data() : r
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
    MARKETPLACE: 'marketplace'
};
