const {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    clusterApiUrl
} = require('@solana/web3.js');
const {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    TOKEN_PROGRAM_ID
} = require('@solana/spl-token');
const bs58 = require('bs58');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: 'packages/app/.env' });

async function createUVTMint() {
    console.log("=== Promethean Network State: UVT Token Generation ===");

    // Determine the network (Devnet by default for this run)
    const isMainnet = process.argv.includes('--mainnet');
    const networkName = isMainnet ? 'mainnet-beta' : 'devnet';

    // Choose the RPC URL. If Devnet, use public devnet URL. If Mainnet, use your Helius URL.
    const rpcUrl = isMainnet ? process.env.SOLANA_RPC_URL : clusterApiUrl('devnet');

    console.log(`📡 Connecting to: ${networkName}`);
    const connection = new Connection(rpcUrl, 'confirmed');

    // Load the Sovereign Root KeyPair
    if (!process.env.SOLANA_PRIVATE_KEY) {
        throw new Error("Missing SOLANA_PRIVATE_KEY in .env");
    }

    const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY);
    const sovereignKeypair = Keypair.fromSecretKey(secretKey);

    console.log(`👑 Sovereign Root Wallet: ${sovereignKeypair.publicKey.toBase58()}`);

    // Check Balance
    const balance = await connection.getBalance(sovereignKeypair.publicKey);
    console.log(`💰 Balance: ${balance / 1e9} SOL`);

    if (balance < 0.01 * 1e9) {
        if (!isMainnet) {
            console.log(`💧 Low balance on Devnet. Requesting Airdrop...`);
            try {
                const airdropSignature = await connection.requestAirdrop(
                    sovereignKeypair.publicKey,
                    1 * 1e9 // 1 SOL
                );
                await connection.confirmTransaction(airdropSignature);
                console.log(`✅ Airdrop successful!`);
            } catch (error) {
                console.error(`❌ Airdrop failed. (Devnet faucet might be rate-limited)`);
                console.error(error.message);
                process.exit(1);
            }
        } else {
            console.error(`❌ Insufficient SOL balance on Mainnet. Need at least ~0.02 SOL to create mint and token accounts.$$`);
            process.exit(1);
        }
    }

    console.log(`\n🔨 Step 1: Creating UVT Mint (SPL Token)...`);

    try {
        // Create the token mint
        // 9 decimals is standard for most Solana tokens
        const mint = await createMint(
            connection,
            sovereignKeypair,            // Payer of the transaction fees
            sovereignKeypair.publicKey,  // Mint Authority (can create new tokens)
            sovereignKeypair.publicKey,  // Freeze Authority (can freeze token accounts - required for some regulatory compliance, but can be null)
            9                            // Decimals
        );

        console.log(`✨ UVT Mint Address Created: ${mint.toBase58()}`);
        console.log(`   (Save this address as NEXT_PUBLIC_UVT_MINT_ADDRESS in your .env)`);

        console.log(`\n🏦 Step 2: Creating Associated Token Account for Sovereign Root...`);
        // Get or Create the Associated Token Account (ATA) for the Sovereign Root wallet
        // This is where the initial supply will be held
        const sovereignATA = await getOrCreateAssociatedTokenAccount(
            connection,
            sovereignKeypair,
            mint,
            sovereignKeypair.publicKey
        );

        console.log(`📁 Sovereign ATA Created: ${sovereignATA.address.toBase58()}`);

        console.log(`\n🖨️  Step 3: Minting Initial Genesis Supply to Sovereign Treasury...`);
        // Let's create an initial "Genesis" supply of 100,000,000 UVT for the treasury
        const genesisAmount = 100_000_000;
        // Multiply by 10^decimals
        const mintAmount = genesisAmount * Math.pow(10, 9);

        await mintTo(
            connection,
            sovereignKeypair,
            mint,
            sovereignATA.address,
            sovereignKeypair.publicKey,
            mintAmount
        );

        console.log(`✅ Successfully minted ${genesisAmount.toLocaleString()} UVT to the Treasury!`);

        console.log(`\n🎉 UVT GENERATION COMPLETE (${networkName.toUpperCase()})`);
        console.log(`--------------------------------------------------`);
        console.log(`Network:      ${networkName}`);
        console.log(`Mint Address: ${mint.toBase58()}`);
        console.log(`Treasury ATA: ${sovereignATA.address.toBase58()}`);
        console.log(`Sovereign Root: ${sovereignKeypair.publicKey.toBase58()}`);
        console.log(`--------------------------------------------------\n`);

    } catch (error) {
        console.error("❌ Failed to create UVT Mint:", error);
    }
}

createUVTMint().catch(console.error);
