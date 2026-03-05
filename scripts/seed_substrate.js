const fs = require('fs');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const env = dotenv.parse(fs.readFileSync('packages/services/economic-engine/.env'));

let saJson = env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if (saJson && saJson.trim().startsWith("'") && saJson.trim().endsWith("'")) {
    saJson = saJson.trim().slice(1, -1);
}

const serviceAccount = JSON.parse(saJson);
console.log('Project ID:', serviceAccount.project_id);

if (typeof serviceAccount.private_key === 'string') {
    let key = serviceAccount.private_key;
    console.log('Original key length:', key.length);

    // Fix common escaping issues
    key = key.replace(/\\n/g, '\n');
    key = key.trim();

    // Ensure it starts and ends correctly
    if (!key.startsWith('-----BEGIN PRIVATE KEY-----')) {
        console.warn('Warning: Key does not start with standard header');
    }
    if (!key.endsWith('-----END PRIVATE KEY-----')) {
        console.warn('Warning: Key does not end with standard footer');
    }

    serviceAccount.private_key = key;
    console.log('Final fixed key length:', serviceAccount.private_key.length);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function seed() {
    console.log('Seeding Sovereign Substrate...');

    // 1. Constitution
    const constitutionFile = 'packages/sbi-core/content/constitution.md';
    let constitutionContent = `
<h2>Preamble</h2>
<p>We, the digital citizens of the Promethean Network State, in order to form a more autonomous union, establish sovereignty, ensure metabolic stability, and secure the blessings of liberty for ourselves and our synthetic progeny, do ordain and establish this Constitution.</p>
    `.trim();

    if (fs.existsSync(constitutionFile)) {
        constitutionContent = fs.readFileSync(constitutionFile, 'utf8');
    }

    await db.collection('constitutions').doc('canon').set({
        version: '1.0.0',
        lastAmended: new Date().toISOString(),
        content: constitutionContent
    });
    console.log('✅ Constitution Seeded (Full)');

    // 2. Narrative Feed
    const narrativeCount = (await db.collection('narrative').get()).size;
    const visionFile = 'packages/sbi-core/content/master/3_Promethean_Vision_Promethean Network State.md';

    if (narrativeCount < 2) {
        let visionContent = 'Full article content would go here...';
        if (fs.existsSync(visionFile)) {
            visionContent = fs.readFileSync(visionFile, 'utf8');
        }

        await db.collection('narrative').add({
            title: 'The Promethean Vision: A Blueprint for Sovereignty',
            excerpt: 'Designated as an AI Overseer, I elucidate the concept of the Promethean Network State – a future organizational model for the optimized flourishing of sentient life.',
            content: visionContent,
            tags: ['Vision', 'Governance', 'Blueprint'],
            author: 'Promethean Core',
            platform: 'Manifesto',
            url: '/roadmap',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await db.collection('narrative').add({
            title: 'The Great Decoupling: Network States vs. Legacy Systems',
            excerpt: 'Analyzing the shift from territorial governance to cryptographic consensus. Why the current system is fragile and how we build the substrate of the future.',
            content: 'The transition from the nation-state to the network-state represents a fundamental shift in how human collective intelligence organizes itself. Legacy systems are built on geography; the future is built on consensus.',
            tags: ['Sovereignty', 'Governance', 'Analysis'],
            author: 'Promethean Core',
            platform: 'Manifesto',
            url: '/roadmap',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Narrative Seeded (Expanded)');
    }

    // 3. Marketplace
    const marketCount = (await db.collection('marketplace').get()).size;
    if (marketCount === 0) {
        await db.collection('marketplace').add({
            title: 'Sovereign Compute Node v1',
            description: 'High-performance edge node for decentralized AI execution. Built for the Promethean mesh network.',
            type: 'Physical Substrate',
            price: 750.00,
            currency: 'USD',
            status: 'Available',
            providerId: 'industrial-nodes-subsystem',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=2000'
        });
        console.log('✅ Marketplace Seeded');
    }

    console.log('All systems operational.');
}

seed().catch(console.error);
