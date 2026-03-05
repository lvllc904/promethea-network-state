const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const dotenv = require('dotenv');
dotenv.config({ path: 'packages/app/.env' });

async function check() {
    const conn = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
    const pubkey = new PublicKey(process.env.SOLANA_PUBLIC_KEY);
    const balance = await conn.getBalance(pubkey);
    console.log(`Address: ${pubkey.toBase58()}`);
    console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
}

check().catch(console.error);
