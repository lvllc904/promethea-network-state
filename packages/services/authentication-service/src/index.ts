import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import crypto from 'crypto';

const app = express();
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Initialize Firebase Admin
let adminApp: App;
let auth: Auth;
let db: Firestore;

try {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  const projectId = process.env.FIREBASE_PROJECT_ID || 'studio-9105849211-9ba48';

  const initConfig: any = {
    projectId: projectId
  };

  if (serviceAccountEnv) {
    console.log('[Auth Service] Initializing with Service Account JSON...');
    initConfig.credential = cert(JSON.parse(serviceAccountEnv));
  } else {
    console.log('[Auth Service] No service account key provided. Falling back to Application Default Credentials (ADC)...');
    // On Cloud Run, this will automatically use the Compute Service Account
  }

  adminApp = initializeApp(initConfig);

  auth = getAuth(adminApp);
  db = getFirestore(adminApp);

  console.log('[Auth Service] Firebase Admin initialized successfully');
} catch (error) {
  console.error('[Auth Service] Failed to initialize Firebase Admin:', error);
  // Do not exit here to allow for local development without Firebase if needed, 
  // but most endpoints will fail.
}

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

// 1. Generate authentication challenge
app.post('/auth/challenge', (req, res) => {
  try {
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

    // Create custom Firebase token
    const customToken = await auth.createCustomToken(uid);

    console.log(`[Auth Service] Authentication successful for DID: ${did}`);

    res.json({
      token: customToken,
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

    // Create Firebase user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });

    // Create citizen profile in Firestore
    await db.collection('citizens').doc(userRecord.uid).set({
      uid: userRecord.uid,
      id: userRecord.uid,
      decentralizedId: did,
      displayName,
      email,
      reputation: 0,
      governanceTokens: 0,
      createdAt: new Date(),
      reputationScore: 0,
      personhoodScore: 0,
      contributionScore: 0,
      isGovIdVerified: false,
      proofOfUniqueness: {
        issuer: "did:prmth:identity-oracle.promethea.network",
        issuanceDate: new Date().toISOString()
      }
    });

    console.log(`[Auth Service] New citizen registered: ${did}`);

    res.json({
      success: true,
      uid: userRecord.uid,
      did
    });

  } catch (error: any) {
    console.error('[Auth Service] Registration error:', error);

    let errorMessage = error.message || 'Registration failed';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists';
    }

    res.status(500).json({ error: errorMessage });
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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[Auth Service] Running on port ${PORT}`);
  console.log(`[Auth Service] Firebase Project: ${process.env.FIREBASE_PROJECT_ID || 'studio-9105849211-9ba48'}`);
});
