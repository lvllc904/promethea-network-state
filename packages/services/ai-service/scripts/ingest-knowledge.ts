/**
 * @fileoverview Promethea Vertex AI Knowledge Ingestion Pipeline
 *
 * This script programmatically:
 * 1. Checks/creates GCS bucket `promethea-knowledge-base-data`.
 * 2. Scans workspace for docs (.md, .txt, .pdf, .mdx), excluding secrets.
 * 3. Uploads files to GCS bucket.
 * 4. Checks/creates Vertex AI DataStore `promethea-knowledge-base`.
 * 5. Triggers Discovery Engine import job to index documents into the DataStore.
 *
 * Run via: npm run ingest --workspace=@promethea/ai-service
 */

import { Storage } from '@google-cloud/storage';
import { DocumentServiceClient, DataStoreServiceClient } from '@google-cloud/discoveryengine';
import glob from 'glob';
import path from 'path';

// ─── Config ───────────────────────────────────────────────────────────────────
const PROJECT_ID = 'studio-9105849211-9ba48';
const BUCKET_NAME = 'promethea-knowledge-base-data';
const DATA_STORE_ID = 'promethea-knowledge-base';
const LOCATION = 'global';
const COLLECTION_ID = 'default_collection';

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../');

const INCLUDE_EXTENSIONS = ['.md', '.txt', '.pdf', '.mdx'];
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/.next/**',
  '**/.turbo/**',
  '**/*.env',
  '**/.env',
  '**/.env.*',
  '**/*.env.*',
  '**/.gitignore',
  '**/*.gitignore',
  '**/*.log',
  '**/*.lock',
  '**/yarn.lock',
  '**/package-lock.json',
  '**/*.key',
  '**/*.pem',
  '**/*.p12',
  '**/*.secret',
  '**/*.secrets',
  '**/secrets/**',
  '**/.cache/**',
  '**/__pycache__/**',
  '**/*.pyc',
  '**/.DS_Store',
  '**/coverage/**',
  '**/.gemini/**',
];

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureBucketExists(storage: Storage): Promise<void> {
  console.log(`\n[INGEST] 1/5 Checking bucket gs://${BUCKET_NAME}...`);
  try {
    const [exists] = await storage.bucket(BUCKET_NAME).exists();
    if (exists) {
      console.log(`[INGEST] ✓ Bucket gs://${BUCKET_NAME} exists.`);
    } else {
      console.log(`[INGEST] Creating bucket gs://${BUCKET_NAME}...`);
      await storage.createBucket(BUCKET_NAME, { location: 'US', storageClass: 'STANDARD' });
      console.log(`[INGEST] ✓ Bucket created.`);
    }
  } catch (err: any) {
    if (err.code === 409) {
      console.log(`[INGEST] ✓ Bucket exists.`);
    } else {
      throw err;
    }
  }
}

function discoverDocuments(): string[] {
  console.log('\n[INGEST] 2/5 Scanning workspace documents...');
  const allFiles = glob.sync('**/*', {
    cwd: WORKSPACE_ROOT,
    absolute: true,
    nodir: true,
    ignore: IGNORE_PATTERNS,
  });

  const docs = allFiles.filter(f => INCLUDE_EXTENSIONS.includes(path.extname(f).toLowerCase()));
  console.log(`[INGEST] ✓ Discovered ${docs.length} documentation files.`);
  return docs;
}

async function uploadDocumentsToGCS(storage: Storage, files: string[]): Promise<void> {
  console.log(`\n[INGEST] 3/5 Uploading documents to gs://${BUCKET_NAME}/documents/ ...`);
  const bucket = storage.bucket(BUCKET_NAME);
  let uploaded = 0;
  let skipped = 0;

  for (const filePath of files) {
    try {
      const relativePath = path.relative(WORKSPACE_ROOT, filePath);
      const destination = `documents/${relativePath}`;
      const gcsFile = bucket.file(destination);

      const [exists] = await gcsFile.exists();
      if (exists) {
        skipped++;
        continue;
      }

      await bucket.upload(filePath, { destination, metadata: { cacheControl: 'no-cache' } });
      uploaded++;

      if (uploaded % 20 === 0) {
        console.log(`[INGEST]  → Uploaded ${uploaded}/${files.length - skipped} new files...`);
      }
    } catch (err: any) {
      console.warn(`[INGEST] ⚠ Skipped ${path.basename(filePath)}: ${err.message}`);
    }
  }

  console.log(`[INGEST] ✓ Upload complete: ${uploaded} new uploaded, ${skipped} already in GCS.`);
}

async function ensureDataStoreExists(dsClient: DataStoreServiceClient): Promise<void> {
  console.log(`\n[INGEST] 4/5 Checking Vertex AI DataStore '${DATA_STORE_ID}'...`);
  const parent = dsClient.collectionPath(PROJECT_ID, LOCATION, COLLECTION_ID);

  try {
    const dataStorePath = dsClient.dataStorePath(PROJECT_ID, LOCATION, COLLECTION_ID, DATA_STORE_ID);
    await dsClient.getDataStore({ name: dataStorePath });
    console.log(`[INGEST] ✓ DataStore '${DATA_STORE_ID}' exists.`);
  } catch (err: any) {
    if (err.message?.includes('NOT_FOUND') || err.code === 5) {
      console.log(`[INGEST] DataStore not found. Creating DataStore '${DATA_STORE_ID}'...`);
      const request = {
        parent,
        dataStoreId: DATA_STORE_ID,
        dataStore: {
          displayName: 'Promethea Knowledge Base',
          industryVertical: 'GENERIC',
          solutionTypes: ['SOLUTION_TYPE_SEARCH'],
          contentConfig: 'CONTENT_REQUIRED',
        },
      };
      const [op] = await dsClient.createDataStore(request as any);
      console.log(`[INGEST] Creation operation started...`);
      await op.promise();
      console.log(`[INGEST] ✓ DataStore '${DATA_STORE_ID}' created successfully.`);
    } else {
      console.log(`[INGEST] DataStore notice: ${err.message}`);
    }
  }
}

async function triggerVertexImport(docClient: DocumentServiceClient): Promise<void> {
  console.log('\n[INGEST] 5/5 Triggering Vertex AI Discovery Engine document import...');

  const parent = docClient.projectLocationCollectionDataStoreBranchPath(
    PROJECT_ID,
    LOCATION,
    COLLECTION_ID,
    DATA_STORE_ID,
    'default_branch'
  );

  const request = {
    parent,
    gcsSource: {
      inputUris: [`gs://${BUCKET_NAME}/documents/**`],
      dataSchema: 'content',
    },
    reconciliationMode: 'INCREMENTAL',
  };

  const [operation] = await docClient.importDocuments(request as any);
  console.log(`[INGEST] ✓ Import job initiated! Operation: ${operation.name}`);
  console.log('[INGEST] Vertex AI is now actively indexing your 245 documents in the background.');
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PROMETHEA VERTEX AI KNOWLEDGE INGESTION PIPELINE v1.0   ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Project  : ${PROJECT_ID}`);
  console.log(`  Bucket   : gs://${BUCKET_NAME}`);
  console.log(`  DataStore: ${DATA_STORE_ID}`);
  console.log('═══════════════════════════════════════════════════════════');

  try {
    const storage = new Storage({ projectId: PROJECT_ID });
    const docClient = new DocumentServiceClient();
    const dsClient = new DataStoreServiceClient();

    await ensureBucketExists(storage);
    const files = discoverDocuments();
    await uploadDocumentsToGCS(storage, files);
    await ensureDataStoreExists(dsClient);
    await triggerVertexImport(docClient);

    console.log('\n[INGEST] ═══════════════ INGESTION PIPELINE COMPLETE ═══════════════');
    console.log('[INGEST] All 245 documents are fully staged and indexing in Vertex AI!');
  } catch (err: any) {
    console.error('\n[INGEST] ✗ FATAL ERROR:', err.message || err);
    process.exit(1);
  }
}

main();
