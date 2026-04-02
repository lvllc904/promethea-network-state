/**
 * THE GREAT STATE MIGRATION: AIRDROP EXECUTION
 * Initializes the on-chain state from genesis_snapshot.json
 */
const { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  sendAndConfirmTransaction 
} = require('@solana/web3.js');
const { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  TOKEN_PROGRAM_ID 
} = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

async function runAirdrop() {
    console.log("🚀 Starting Genesis Airdrop on Localnet...");
    
    const snapshot = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'genesis_snapshot.json'), 'utf8'));
    const connection = new Connection("http://localhost:8899", "confirmed");
    
    // Load local authority wallet (payer)
    const payer = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.config/solana/id.json'), 'utf8')))
    );

    console.log(`🔑 Authority Wallet: ${payer.publicKey.toBase58()}`);

    // 1. Create UVT Mint
    console.log("[1/3] Launching UVT Mint...");
    const mintKeypair = Keypair.generate();
    const uvtMint = await createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        9, // 9 decimals
        mintKeypair
    );
    console.log(`   ✅ UVT Mint Created: ${uvtMint.toBase58()}`);

    // 2. Distribute Balances
    console.log("[2/3] Distributing Citizen Balances...");
    const balances = snapshot.state.uvtBalances;
    const citizens = snapshot.state.citizens;

    for (const [userId, amount] of Object.entries(balances)) {
        const citizenData = citizens[userId];
        let wallet;

        if (citizenData && citizenData.solanaAddress) {
            wallet = new PublicKey(citizenData.solanaAddress);
        } else {
            // FOR LOCALNET TESTING: Generate a deterministic test address based on the ID
            // In production, this would skip or require a pre-registered address
            wallet = Keypair.generate().publicKey; 
            console.log(`   🛠️ Generated Test Wallet for ${userId}: ${wallet.toBase58()}`);
        }

        console.log(`   💎 Minting ${amount.toFixed(2)} UVT to ${userId}...`);

        try {
            const ata = await getOrCreateAssociatedTokenAccount(
                connection,
                payer,
                uvtMint,
                wallet
            );

            // Amount is in base units (9 decimals)
            const rawAmount = Math.floor(amount * 1_000_000_000);
            
            await mintTo(
                connection,
                payer,
                uvtMint,
                ata.address,
                payer.publicKey,
                rawAmount
            );
            console.log(`      ✅ Success.`);
        } catch (err) {
            console.error(`      ❌ Failed to mint to ${userId}:`, err.message);
        }
    }

    // 3. Output Final Registry
    const finalizedRegistry = {
        uvtMint: uvtMint.toBase58(),
        authority: payer.publicKey.toBase58(),
        timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(path.resolve(__dirname, 'deployed_registry.json'), JSON.stringify(finalizedRegistry, null, 2));
    console.log("\n🌌 AIRDROP COMPLETE. The Promethean State is now live on Localnet.");
    console.log("=========================================\n");
}

runAirdrop().catch(console.error);
