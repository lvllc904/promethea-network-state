import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import * as path from 'path';
import * as fs from 'fs';

let cachedDb: Database | null = null;
let connectionPromise: Promise<Database> | null = null;

export async function getLocalDB(): Promise<Database> {
    if (cachedDb) return cachedDb;
    if (connectionPromise) return connectionPromise;

    connectionPromise = (async () => {
        let dbPath = path.join(process.cwd(), 'pro-forma.db');

        // Robust path resolver to locate pro-forma.db in monorepo layouts
        if (!fs.existsSync(dbPath)) {
            const parentPath = path.join(process.cwd(), '..', 'pro-forma.db');
            if (fs.existsSync(parentPath)) {
                dbPath = parentPath;
            } else {
                const grandParentPath = path.join(process.cwd(), '..', '..', 'pro-forma.db');
                if (fs.existsSync(grandParentPath)) {
                    dbPath = grandParentPath;
                } else {
                    // Fail-safe absolute path for local Mac context
                    dbPath = '/Users/officeone/Promethean Network State/promethea_antigravity_bundle_20251130_211450/pro-forma.db';
                }
            }
        }

        console.log(`[SQLITE NEXTJS] Initializing local database connector: ${dbPath}`);

        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Verify/Create core tables to avoid route-level initialization exceptions
        await db.exec(`
            CREATE TABLE IF NOT EXISTS proposals (
                id TEXT PRIMARY KEY, 
                orgId TEXT DEFAULT 'global', 
                data TEXT
            );
            CREATE TABLE IF NOT EXISTS votes (
                id TEXT PRIMARY KEY, 
                orgId TEXT DEFAULT 'global', 
                data TEXT
            );
            CREATE TABLE IF NOT EXISTS uvt_ledger (
                id TEXT PRIMARY KEY, 
                orgId TEXT DEFAULT 'global', 
                data TEXT, 
                timestamp DATETIME
            );
            CREATE TABLE IF NOT EXISTS waterfall (
                id TEXT PRIMARY KEY, 
                orgId TEXT DEFAULT 'global', 
                data TEXT, 
                timestamp DATETIME
            );
        `);

        // Schema Migration: Ensure all tables have the orgId column to prevent seeding/query failures
        const tables = ['proposals', 'votes', 'uvt_ledger', 'waterfall'];
        for (const table of tables) {
            try {
                await db.get(`SELECT orgId FROM ${table} LIMIT 1`);
            } catch (err: any) {
                if (err.message && (err.message.includes('no such column: orgId') || err.message.includes('has no column named orgId'))) {
                    console.log(`[SQLITE NEXTJS] 🛠️ Migration: Adding orgId column to ${table}...`);
                    try {
                        await db.exec(`ALTER TABLE ${table} ADD COLUMN orgId TEXT DEFAULT 'global'`);
                    } catch (alterErr) {
                        console.error(`[SQLITE NEXTJS] ❌ Migration failed for ${table}:`, alterErr);
                    }
                }
            }
        }

        // Seed default genesis proposals if the table is completely empty
        const countRes = await db.get('SELECT COUNT(*) as count FROM proposals');
        if (countRes && countRes.count === 0) {
            console.log('[SQLITE NEXTJS] Seeding default genesis proposals into local proposals table');
            const genesisProposals = [
                {
                    id: 'prop-1',
                    title: 'Amplify Reserve Sweep Dividend',
                    type: 'ECONOMIC',
                    current: 8,
                    threshold: 10,
                    narrative: 'Mandates increase of sovereign plowsbacks into direct citizen dividends by 5%.'
                },
                {
                    id: 'prop-2',
                    title: 'Establish Sovereign Grid Boundary',
                    type: 'TERRITORIAL',
                    current: 5,
                    threshold: 10,
                    narrative: 'Defines permanent physical coordinate boundaries for Zone-A agricultural cells.'
                },
                {
                    id: 'prop-3',
                    title: '3-Body Protocol Integration',
                    type: 'CONSTITUTIONAL',
                    current: 12,
                    threshold: 15,
                    narrative: 'Fully integrates DepthOS telemetry loops directly into constitutional decision trees.'
                }
            ];

            for (const prop of genesisProposals) {
                await db.run(
                    'INSERT INTO proposals (id, orgId, data) VALUES (?, ?, ?)',
                    [prop.id, 'global', JSON.stringify(prop)]
                );
            }
        }

        // Seed default uvt_ledger if empty
        const uvtCount = await db.get('SELECT COUNT(*) as count FROM uvt_ledger');
        if (uvtCount && uvtCount.count === 0) {
            console.log('[SQLITE NEXTJS] Seeding initial ledger transactions');
            const genesisLedger = [
                { id: 'tx-1', method: 'ZONING_ROYALTY_REVENUE', amount: '+$12,450.00', timestamp: new Date(Date.now() - 3600000).toISOString() },
                { id: 'tx-2', method: 'ENERGY_ZONE_YIELD_SWEEP', amount: '+$8,120.00', timestamp: new Date(Date.now() - 7200000).toISOString() },
                { id: 'tx-3', method: 'ORACLE_POW_VERIFICATION_BURST', amount: '-$420.00', timestamp: new Date(Date.now() - 10800000).toISOString() },
                { id: 'tx-4', method: 'LIQUIDITY_POOL_REBALANCE', amount: '+$1,850.00', timestamp: new Date(Date.now() - 14400000).toISOString() },
                { id: 'tx-5', method: 'CITIZEN_SWEAT_DISBURSEMENT', amount: '-$2,500.00', timestamp: new Date(Date.now() - 18000000).toISOString() }
            ];

            for (const tx of genesisLedger) {
                await db.run(
                    'INSERT INTO uvt_ledger (id, orgId, data, timestamp) VALUES (?, ?, ?, ?)',
                    [tx.id, 'global', JSON.stringify(tx), tx.timestamp]
                );
            }
        }

        // Seed default waterfall stats if empty
        const waterfallCount = await db.get('SELECT COUNT(*) as count FROM waterfall');
        if (waterfallCount && waterfallCount.count === 0) {
            console.log('[SQLITE NEXTJS] Seeding default waterfall matrix state');
            const defaultWaterfall = {
                totalTvlUsd: 1452000,
                infrastructureCostUsd: 4200,
                activeRings: 4,
                nextUnlock: '23h 14m 05s',
                rings: [
                    { name: 'Micro-Toll Protocol', thresholdSol: 10, balanceSol: 8.5, isActive: true, address: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpNDH2LNXXHHwb' },
                    { name: 'Investor Hurdle Hurdle', thresholdSol: 100, balanceSol: 45, isActive: true, address: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpNDH2LNXXHHwb' },
                    { name: 'Sovereign Plowback', thresholdSol: 1000, balanceSol: 120, isActive: false, address: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpNDH2LNXXHHwb' },
                    { name: 'Labor Allocation', thresholdSol: 10000, balanceSol: 0, isActive: false, address: 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpNDH2LNXXHHwb' }
                ]
            };
            await db.run(
                'INSERT INTO waterfall (id, orgId, data, timestamp) VALUES (?, ?, ?, ?)',
                ['status', 'global', JSON.stringify(defaultWaterfall), new Date().toISOString()]
            );
        }

        cachedDb = db;
        return db;
    })();

    return connectionPromise;
}
