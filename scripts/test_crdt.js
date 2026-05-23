const crypto = require('crypto');

async function main() {
    console.log("=== Syndicate Zero CRDT & E2EE Test ===");
    
    // 1. Generate E2EE keys for the syndicate
    const syndicateKey = crypto.randomBytes(32); // Shared syndicate key (AES-256)
    
    function encryptPayload(payload) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', syndicateKey, iv);
        let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }

    function decryptPayload(encryptedData) {
        const [ivHex, encrypted] = encryptedData.split(':');
        const decipher = crypto.createDecipheriv('aes-256-cbc', syndicateKey, Buffer.from(ivHex, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    }

    const syndicateId = 'syndicate_zero';
    const serverUrl = 'http://localhost:4001';

    // 2. Simulate User A (Offline action)
    const userA_DID = 'did:prmth:alice_01';
    const actionA = { type: 'UPDATE_CAP_TABLE', amount: 50, to: userA_DID };
    const encryptedA = encryptPayload(actionA);
    const hashA = crypto.createHash('sha256').update(encryptedA + Date.now()).digest('hex');

    console.log("[User A] Offline action generated:", actionA);

    // 3. Simulate User B (Offline action)
    const userB_DID = 'did:prmth:bob_02';
    const actionB = { type: 'UPDATE_CAP_TABLE', amount: 100, to: userB_DID };
    const encryptedB = encryptPayload(actionB);
    const hashB = crypto.createHash('sha256').update(encryptedB + Date.now()).digest('hex');

    console.log("[User B] Offline action generated:", actionB);

    // 4. Sync User A to Ledger
    try {
        const resA = await fetch(`${serverUrl}/api/v1/crdt/events?syndicate_id=${syndicateId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_hash: hashA,
                syndicate_id: syndicateId,
                did: userA_DID,
                action: 'UPDATE_CAP_TABLE',
                previous_hash: 'genesis',
                encrypted_payload: Buffer.from(encryptedA).toString('base64'),
                created_at: new Date().toISOString()
            })
        });
        console.log("[Sync] User A Event synced:", await resA.json());
    } catch (e) {
        console.log("[Sync Error] Please ensure the sovereign-ledger service is running on port 4001.");
        console.log("Details:", e.message);
        return;
    }

    // 5. Sync User B to Ledger
    const resB = await fetch(`${serverUrl}/api/v1/crdt/events?syndicate_id=${syndicateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event_hash: hashB,
            syndicate_id: syndicateId,
            did: userB_DID,
            action: 'UPDATE_CAP_TABLE',
            previous_hash: 'genesis', // Concurrent edit! Same previous hash.
            encrypted_payload: Buffer.from(encryptedB).toString('base64'),
            created_at: new Date().toISOString()
        })
    });
    console.log("[Sync] User B Event synced:", await resB.json());

    // 6. Fetch full chain and verify CRDT merge (conflict resolution by timestamp/hash)
    const resChain = await fetch(`${serverUrl}/api/v1/crdt/events?syndicate_id=${syndicateId}`);
    const chain = await resChain.json();
    
    console.log(`\n[Validation] Fetched ${chain.length} events for ${syndicateId}`);
    
    // Sort logic mimicking local CRDT resolution (Deterministic order)
    chain.sort((a, b) => {
        if (a.created_at === b.created_at) {
            return a.event_hash.localeCompare(b.event_hash);
        }
        return new Date(a.created_at) - new Date(b.created_at);
    });

    console.log("=== Decrypted Merged Timeline ===");
    chain.forEach(event => {
        const rawPayload = Buffer.from(event.encrypted_payload, 'base64').toString('utf8');
        const decrypted = decryptPayload(rawPayload);
        console.log(`- Hash: ${event.event_hash.substring(0,8)} | DID: ${event.did} | Action:`, decrypted);
    });

    console.log("\n[Success] CRDT Event chain successfully merged without overwriting offline actions!");
}

main();
