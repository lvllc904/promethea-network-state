import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import crypto from 'crypto';
import { guardianSingleton } from '@promethea/guardian';

const app = express();
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Sovereign Identity Substrate (SQLite)
let db: Database;
const JWT_SECRET = process.env.JWT_SECRET || 'promethea-sovereign-intelligence-v5';

async function initIdentityDb() {
  db = await open({
    filename: path.join(process.cwd(), 'identity.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS citizens (
      uid TEXT PRIMARY KEY,
      decentralizedId TEXT,
      displayName TEXT,
      email TEXT,
      reputation REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS security_telemetry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('[Auth Service] 🏰 Sovereign Identity Substrate initialized: identity.db');
}

initIdentityDb().catch(err => console.error('[Auth Service] DB Init Failed:', err));

// Guardian Pulse Bridge
guardianSingleton.on('consciousness_pulse', async (state: any) => {
  try {
    if (db) {
      await db.run('INSERT INTO security_telemetry (data) VALUES (?)', JSON.stringify(state));
    }
  } catch (e) {
    console.error('[Auth Service] Failed to log Guardian pulse:', e);
  }
});

// In-memory challenge store (use Redis in production)
interface Challenge {
  challenge: string;
  expires: number;
}

const challenges = new Map<string, Challenge>();

// Cleanup expired challenges every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [did, data] of challenges.entries()) {
    if (now > data.expires) {
      challenges.delete(did);
    }
  }
}, 5 * 60 * 1000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'authentication' });
});

// Legacy redirect for /login
app.get('/login', (req, res) => {
  const query = req.url.includes('?') ? req.url.split('?')[1] : '';
  res.redirect(`/?${query}`);
});

// 1. Generate authentication challenge
app.post('/auth/challenge', async (req, res) => {
  try {
    const analysis = await guardianSingleton.processRequest(req, res, null);
    if (analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'HIGH') {
      console.warn(`[Auth Service] AMG Blocked challenge request. Risk Level: ${analysis.riskLevel}`);
      return res.status(403).json({ error: 'Security anomaly detected by Guardian' });
    }

    const { did } = req.body;

    if (!did) {
      return res.status(400).json({ error: 'DID is required' });
    }

    // Extract address from DID (format: did:prmth:0x...)
    const address = did.replace('did:prmth:', '');

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid DID format' });
    }

    const challenge = `Sign this message to authenticate with Promethea Network State:\n\nChallenge: ${crypto.randomBytes(32).toString('hex')}\nTimestamp: ${Date.now()}`;
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    challenges.set(did, { challenge, expires });

    console.log(`[Auth Service] Challenge generated for DID: ${did}`);

    res.json({ challenge });
  } catch (error: any) {
    console.error('[Auth Service] Challenge generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate challenge' });
  }
});

// 2. Verify signature and issue Firebase token
app.post('/auth/verify', async (req, res) => {
  try {
    const analysis = await guardianSingleton.processRequest(req, res, null);
    if (analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'HIGH') {
      console.warn(`[Auth Service] AMG Blocked verify request. Risk Level: ${analysis.riskLevel}`);
      return res.status(403).json({ error: 'Security anomaly detected by Guardian' });
    }

    const { did, signature, uid } = req.body;

    if (!did || !signature || !uid) {
      return res.status(400).json({ error: 'DID, signature, and UID are required' });
    }

    const stored = challenges.get(did);

    if (!stored) {
      return res.status(401).json({ error: 'No challenge found for this DID' });
    }

    if (Date.now() > stored.expires) {
      challenges.delete(did);
      return res.status(401).json({ error: 'Challenge expired' });
    }

    // Extract address from DID
    const address = did.replace('did:prmth:', '');

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(stored.challenge, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      console.warn(`[Auth Service] Signature verification failed for DID: ${did}`);
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // Challenge used, delete it to prevent replay attacks
    challenges.delete(did);

    // Create Sovereign JWT
    const token = jwt.sign(
      { uid, did, address }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log(`[Auth Service] Sovereign Authentication successful for DID: ${did}`);

    res.json({
      token,
      did,
      authenticated: true
    });

  } catch (error: any) {
    console.error('[Auth Service] Verification error:', error);
    res.status(500).json({ error: error.message || 'Verification failed' });
  }
});

// 3. Create new citizen (DID minting and registration)
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, displayName, did } = req.body;

    if (!email || !password || !displayName || !did) {
      return res.status(400).json({
        error: 'Email, password, displayName, and DID are required'
      });
    }

    // Validate DID format
    const address = did.replace('did:prmth:', '');
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid DID format' });
    }

    // Generate a unique ID if not provided
    const userUid = crypto.randomBytes(16).toString('hex');

    // Create citizen profile in Sovereign SQLite
    await db.run(
      'INSERT INTO citizens (uid, decentralizedId, displayName, email) VALUES (?, ?, ?, ?)',
      [userUid, did, displayName, email]
    );

    console.log(`[Auth Service] New Sovereign Citizen registered: ${did}`);

    res.json({
      success: true,
      uid: userUid,
      did
    });

  } catch (error: any) {
    console.error('[Auth Service] Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// 4. Generate wallet (for users without DepthOS)
app.post('/auth/generate-wallet', (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required for keystore encryption' });
    }

    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();
    const did = `did:prmth:${wallet.address}`;

    console.log(`[Auth Service] Wallet generated for DID: ${did}`);

    // Return wallet info (private key will be encrypted client-side)
    res.json({
      did,
      address: wallet.address,
      privateKey: wallet.privateKey // Client will encrypt this immediately
    });

  } catch (error: any) {
    console.error('[Auth Service] Wallet generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate wallet' });
  }
});

// 5. Encrypt keystore (for backup)
app.post('/auth/encrypt-keystore', async (req, res) => {
  try {
    const { privateKey, password } = req.body;

    if (!privateKey || !password) {
      return res.status(400).json({
        error: 'Private key and password are required'
      });
    }

    const wallet = new ethers.Wallet(privateKey);
    const keystoreJson = await wallet.encrypt(password);

    res.json({
      keystore: keystoreJson,
      address: wallet.address
    });

  } catch (error: any) {
    console.error('[Auth Service] Keystore encryption error:', error);
    res.status(500).json({ error: error.message || 'Failed to encrypt keystore' });
  }
});

// 6. Intent Ledger (Real-time Mirroring)
app.get('/auth/intent-ledger', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const ledger = guardianSingleton.getThoughtLog(limit);

    res.json({
      service: 'authentication-service',
      guardian: 'Apex Master Guardian',
      ledger: ledger.map(item => ({
        ...item,
        id: crypto.randomBytes(4).toString('hex')
      }))
    });
  } catch (error: any) {
    console.error('[Auth Service] Intent ledger retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve intent ledger' });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[Auth Service] Running on port ${PORT}`);
  console.log(`[Auth Service] Firebase Project: ${process.env.FIREBASE_PROJECT_ID || 'studio-9105849211-9ba48'}`);
});
