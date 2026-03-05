const admin = require('firebase-admin');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: 'packages/app/.env' });

async function seed() {
    let saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!saJson) {
        console.error("Missing GOOGLE_SERVICE_ACCOUNT_JSON");
        process.exit(1);
    }

    // Clean up typical .env parsing issues
    if (saJson.startsWith("'") && saJson.endsWith("'")) {
        saJson = saJson.slice(1, -1);
    }

    let serviceAccount;
    try {
        serviceAccount = JSON.parse(saJson);
    } catch (e) {
        console.error("Failed to parse Service Account JSON:", e);
        // Try fallback: maybe it's already a string?
        console.log("Raw JSON head:", saJson.substring(0, 100));
        process.exit(1);
    }

    // Ensure private key has correct format for ASN.1 parsing
    if (serviceAccount.private_key) {
        // Remove any stringified escapes
        let key = serviceAccount.private_key.replace(/\\n/g, '\n');

        // Extract the base64 content
        const match = key.match(/-----BEGIN PRIVATE KEY-----([\s\S]*)-----END PRIVATE KEY-----/);
        if (match) {
            const body = match[1].replace(/\s/g, ''); // Remove ALL whitespace
            // Reconstruct with proper PEM formatting (64 chars per line)
            const wrapped = body.match(/.{1,64}/g).join('\n');
            serviceAccount.private_key = `-----BEGIN PRIVATE KEY-----\n${wrapped}\n-----END PRIVATE KEY-----\n`;
        } else {
            console.warn("Could not find BEGIN/END markers in private key.");
        }
    }

    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: 'studio-9105849211-9ba48'
        });
    }

    const db = admin.firestore();

    console.log("Seeding data...");

    // 1. Narrative
    const narrativeDir = [
        {
            id: 'n1',
            title: 'The Sovereign Manifest: A New Dawn',
            content: '# The Manifest\n\nWe are the architects of our own destiny. The network state is a substrate for human flourishing.\n\n## Sovereignty\n\nTrue sovereignty is not granted; it is claimed through the construction of autonomous systems.',
            excerpt: 'The fundamental declaration of the Promethean Network State.',
            author: 'Promethea',
            platform: 'Manifesto',
            tags: ['Governance', 'Philosophy'],
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            id: 'n2',
            title: 'Economic Metabolism Report',
            content: 'The metabolic rate of the substrate has increased by 14% this cycle. Autonomous revenue generation is optimal.',
            excerpt: 'Analyzing the current state of value creation within the network.',
            author: 'Economic Engine',
            platform: 'Intel',
            tags: ['Economics', 'Data'],
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }
    ];

    for (const p of narrativeDir) {
        await db.collection('narrative').doc(p.id).set(p);
    }

    // 2. Real World Assets
    const assets = [
        {
            id: 'land-1770936158888',
            title: 'Ozark Ridge Sanctuary',
            description: 'A 42-acre autonomous land parcel dedicated to permaculture and soil restoration.',
            price: 750000,
            location: {
                nearestTown: 'Jasper',
                region: 'Newton County',
                state: 'Arkansas',
                coordinates: { latitude: 36.0084, longitude: -93.1864 }
            },
            type: 'Land',
            status: 'Operational',
            imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }
    ];

    for (const a of assets) {
        await db.collection('real_world_assets').doc(a.id).set(a);
    }

    // 3. Vetoes
    const vetoes = [
        {
            id: 'V-2024-001',
            status: 'Halted',
            action: 'Automated Micro-Lending optimization',
            reason: 'Proposed interest rate exceeded the Maximum Sovereign Usury cap of 12%.',
            impact: 'Prevented predatory lending patterns in the economic engine.',
            date: '2024-11-28',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        }
    ];

    for (const v of vetoes) {
        await db.collection('vetoes').doc(v.id).set(v);
    }

    console.log("Seeding complete!");
}

seed().catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
});
