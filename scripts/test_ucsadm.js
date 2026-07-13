const jwt = require('jsonwebtoken');

async function runExpressAuthTests() {
    console.log("\n--- Part 1: UCS-ADM Middleware Authorization Tests ---");
    
    const JWT_SECRET = 'promethea-sovereign-intelligence-v5'; // Fallback secret
    
    // Create an authorized token for 'syndicate_zero'
    const authorizedToken = jwt.sign(
      { 
          uid: 'user123', 
          did: 'did:prmth:alice', 
          address: '0x123', 
          syndicates: { "global": "citizen", "syndicate_zero": "admin" } 
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Create an unauthorized token (missing syndicate_zero)
    const unauthorizedToken = jwt.sign(
      { 
          uid: 'user456', 
          did: 'did:prmth:bob', 
          address: '0x456', 
          syndicates: { "global": "citizen", "blue_group": "member" } 
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    const ledgerUrl = 'http://localhost:4001';

    console.log("\n[Test 1] Testing Authorized Access to syndicate_zero...");
    try {
        const resAuth = await fetch(`${ledgerUrl}/api/v1/crdt/events?syndicate_id=syndicate_zero`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authorizedToken}` }
        });
        console.log(`Status: ${resAuth.status} (Expected: 200)`);
    } catch (e) {
        console.log("Error (is Ledger running?):", e.message);
    }

    console.log("\n[Test 2] Testing Unauthorized Access to syndicate_zero...");
    try {
        const resUnauth = await fetch(`${ledgerUrl}/api/v1/crdt/events?syndicate_id=syndicate_zero`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${unauthorizedToken}` }
        });
        console.log(`Status: ${resUnauth.status} (Expected: 403)`);
    } catch (e) {
        console.log("Error:", e.message);
    }

    console.log("\n[Test 3] Testing Missing Token...");
    try {
        const resMissing = await fetch(`${ledgerUrl}/api/v1/crdt/events?syndicate_id=syndicate_zero`, {
            method: 'GET'
        });
        console.log(`Status: ${resMissing.status} (Expected: 401)`);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

async function runDepthOSBridgeTests() {
    console.log("\n--- Part 2: Local Sovereign Edge (DepthOS Bridge) Tests ---");
    const bridgeUrl = 'http://localhost:9999';

    // Verify Bridge is running and check its capabilities
    console.log("\n[Test 5] Checking DepthOS Bridge Health & Capabilities...");
    let healthData;
    try {
        const res = await fetch(`${bridgeUrl}/health`);
        healthData = await res.json();
        console.log(`Status: ${res.status} (Expected: 200)`);
        console.log("Capabilities:", healthData.capabilities);
    } catch (err) {
        console.log("DepthOS Bridge is offline. Make sure to run the bridge service. Error:", err.message);
        return;
    }

    // Test ZK Document Encryption
    console.log("\n[Test 6] Testing Local ZK Document Encryption...");
    try {
        const payload = {
            documentData: "CITIZEN_PASSPORT_ID_NUMBER_A1290384_WYOMING_USA",
            mimeType: "text/plain",
            passphrase: "sovereign-master-salt-key-999"
        };
        const res = await fetch(`${bridgeUrl}/api/zk/encrypt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log(`Status: ${res.status} (Expected: 200)`);
        console.log(`Encrypted Data Length: ${data.encrypted.encryptedData.length} characters`);
        console.log(`Hash (Verification Fingerprint): ${data.encrypted.hash}`);
    } catch (err) {
        console.log("ZK Encryption Error:", err.message);
    }

    // Test ZK Verifiable Credential Generation
    console.log("\n[Test 7] Testing ZK Verifiable Credential generation...");
    try {
        const payload = {
            citizenDid: "did:sovereign:citizen:0x9f88d2288fa",
            claims: {
                isPersonhoodVerified: true,
                citizenshipCountry: "US",
                minimumAgeRequirement: "PASSED"
            }
        };
        const res = await fetch(`${bridgeUrl}/api/zk/generate-vc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log(`Status: ${res.status} (Expected: 200)`);
        console.log("Issuer:", data.vc.issuer);
        console.log("Credential ID:", data.vc.id);
        console.log("Verification Proof Verified:", data.zkProof.proofVerified);
    } catch (err) {
        console.log("ZK Credential Error:", err.message);
    }

    // Test UCC Lien Verification
    console.log("\n[Test 8] Scanning State registries (Wyoming) for existing liens via Cobalt Intelligence...");
    try {
        const debtorName = "Acme satellite operations llc";
        const res = await fetch(`${bridgeUrl}/api/ucc/verify-liens?debtorName=${encodeURIComponent(debtorName)}&state=WY`);
        const data = await res.json();
        console.log(`Status: ${res.status} (Expected: 200)`);
        console.log(`Prior Liens Found: ${data.priorLiensFound}`);
        if (data.priorLiensFound) {
            console.log(`Number of Prior Liens: ${data.activeLienCount}`);
            console.log(`First Lien Secured Party: ${data.liens[0].securedParty}`);
        }
    } catch (err) {
        console.log("Lien Verification Error:", err.message);
    }

    // Test UCC Coprocessor Automated Workflow (Draft, State File, Article 12 Signature)
    console.log("\n[Test 9] Triggering UCC Coprocessor automated drafting and filing sequence...");
    try {
        const payload = {
            debtorName: "Acme satellite operations llc",
            debtorAddress: "72 Cloud Computing Ave, Casper, WY 82601",
            securedPartyName: "TPNS Steward Sovereign Office",
            securedPartyAddress: "1209 Orange St, Wilmington, DE 19801",
            collateralDescription: "All physical satellite compute nodes and localized S3 replica arrays.",
            state: "Wyoming",
            tokenMintAddress: "SoL1111111111111111111111111111111111111112"
        };
        const res = await fetch(`${bridgeUrl}/api/ucc/draft-and-file`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log(`Status: ${res.status} (Expected: 200)`);
        console.log(`UCC-1 Document ID Generated: ${data.draft.documentId}`);
        console.log(`Filing Status with SOS: ${data.receipt.status}`);
        console.log(`Wyoming SOS Filing ID: ${data.receipt.filingId}`);
        console.log(`Wyoming State Certified Receipt Hash: ${data.receipt.stateReceiptHash}`);
        console.log(`UCC Article 12 Controllable Electronic Record Control Signature: ${data.cerSignature}`);
        console.log(`UCC Article 12 Transfer-of-Control Compliant: ${data.isArticle12Compliant}`);
    } catch (err) {
        console.log("UCC Coprocessor Workflow Error:", err.message);
    }
}

async function main() {
    console.log("==================================================");
    console.log("=== TPNS SOVEREIGN PIPELINE INTEGRATION TESTER ===");
    console.log("==================================================");

    await runExpressAuthTests();
    await runDepthOSBridgeTests();

    console.log("\n==================================================");
    console.log("===           Integration Test Complete        ===");
    console.log("==================================================");
}

main().catch(console.error);
