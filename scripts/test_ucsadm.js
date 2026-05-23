const jwt = require('jsonwebtoken');

async function main() {
    console.log("=== UCS-ADM Middleware Authorization Test ===");
    
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
        console.log("Error:", e.message);
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

    console.log("\n[Test 4] Testing Authorized Access to global (Default)...");
    try {
        const resGlobal = await fetch(`${ledgerUrl}/api/v1/crdt/events`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${unauthorizedToken}` } // Bob has 'global'
        });
        console.log(`Status: ${resGlobal.status} (Expected: 200)`);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

main();
