import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
let cachedData: any = null;
let cacheTime = 0;

const UVT_MINT = process.env.NEXT_PUBLIC_UVT_MINT_ADDRESS || 'Bm2GRKS92odxL6P4grmYyDMNChWNhQPHrLgcJRab7vf1';
const SOVEREIGN_ROOT = process.env.SOLANA_PUBLIC_KEY || 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb';
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    // If an address is provided, fetch only its balance
    if (address) {
        try {
            const connection = new Connection(RPC_URL, 'confirmed');
            const mintPubkey = new PublicKey(UVT_MINT);
            const ownerPubkey = new PublicKey(address);

            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerPubkey, {
                mint: mintPubkey,
            });

            let balance = 0;
            if (tokenAccounts.value.length > 0) {
                balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
            }

            return NextResponse.json({ address, balance, mint: UVT_MINT });
        } catch (err: any) {
            return NextResponse.json({ error: err.message }, { status: 400 });
        }
    }

    // Serve from cache if fresh (Global stats)
    if (cachedData && Date.now() - cacheTime < CACHE_TTL_MS) {
        return NextResponse.json(cachedData, {
            headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=120' },
        });
    }

    try {
        const connection = new Connection(RPC_URL, 'confirmed');
        const mintPubkey = new PublicKey(UVT_MINT);
        const sovereignPubkey = new PublicKey(SOVEREIGN_ROOT);

        // Fetch mint info (total supply, decimals) and SOL balance in parallel
        const [mintInfo, solBalance] = await Promise.all([
            getMint(connection, mintPubkey),
            connection.getBalance(sovereignPubkey),
        ]);

        const decimals = mintInfo.decimals;
        const totalSupply = Number(mintInfo.supply) / Math.pow(10, decimals);
        const solBalanceFormatted = solBalance / 1e9;

        const data = {
            mintAddress: UVT_MINT,
            sovereignRoot: SOVEREIGN_ROOT,
            totalSupply,
            decimals,
            solBalance: solBalanceFormatted,
            solscanUrl: `https://solscan.io/token/${UVT_MINT}`,
            sovereignSolscanUrl: `https://solscan.io/account/${SOVEREIGN_ROOT}`,
            network: 'mainnet-beta',
            fetchedAt: new Date().toISOString(),
        };

        cachedData = data;
        cacheTime = Date.now();

        return NextResponse.json(data, {
            headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=120' },
        });
    } catch (err: any) {
        console.error('[/api/uvt] Solana RPC fetch failed:', err.message);

        // Return stale cache or last-known values
        if (cachedData) {
            return NextResponse.json({ ...cachedData, stale: true }, {
                headers: { 'X-Cache': 'STALE', 'Cache-Control': 'public, max-age=30' },
            });
        }

        // Genesis fallback — values we know are true
        return NextResponse.json({
            mintAddress: UVT_MINT,
            sovereignRoot: SOVEREIGN_ROOT,
            totalSupply: 100_000_000,
            decimals: 9,
            solBalance: 0,
            solscanUrl: `https://solscan.io/token/${UVT_MINT}`,
            sovereignSolscanUrl: `https://solscan.io/account/${SOVEREIGN_ROOT}`,
            network: 'mainnet-beta',
            fetchedAt: new Date().toISOString(),
            fallback: true,
        });
    }
}

