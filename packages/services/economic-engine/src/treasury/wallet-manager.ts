import { ethers } from 'ethers';
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from '@solana/spl-token';
import bs58 from 'bs58';
import { priceOracle } from '../tools/price-oracle';

/**
 * Multi-Chain Wallet Manager (Phase 3)
 * 
 * Abstraction layer for managing wallets across multiple chains.
 * Supports: Ethereum, Base, Solana, etc.
 */

export interface WalletBalance {
    chain: string;
    address: string;
    balance: number; // Native token balance in USD
    tokens: { symbol: string; balance: number; usdValue: number }[];
}

export class WalletManager {
    private wallets: Map<string, ethers.Wallet> = new Map();
    private providers: Map<string, ethers.Provider> = new Map();

    // Solana specific
    private solConn: Connection | null = null;
    private solKeypair: Keypair | null = null;

    /**
     * Initialize wallet for a specific chain
     */
    async initWallet(chain: string, privateKey: string, rpcUrl: string): Promise<void> {
        if (chain === 'solana') {
            this.solConn = new Connection(rpcUrl, 'confirmed');

            if (privateKey) {
                // Assume base58 private key for Solana
                const secretKey = bs58.decode(privateKey);
                this.solKeypair = Keypair.fromSecretKey(secretKey);
                console.log(`[WalletManager] ✅ Initialized Solana wallet: ${this.solKeypair.publicKey.toBase58()}`);
            } else {
                // Auto-generate a Sovereign Root if no key provided
                this.solKeypair = Keypair.generate();
                const encoded = bs58.encode(this.solKeypair.secretKey);
                console.warn(`[WalletManager] ⚠️ NO PRIVATE KEY PROVIDED. Generated Sovereign Root: ${this.solKeypair.publicKey.toBase58()}`);
                console.warn(`[WalletManager] 🔒 STORAGE REQUIRED: Secure this key for persistence: ${encoded}`);
            }
            return;
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        this.providers.set(chain, provider);
        this.wallets.set(chain, wallet);

        console.log(`[WalletManager] Initialized wallet for ${chain}: ${wallet.address}`);
    }

    /**
     * Get wallet for a specific chain
     */
    getWallet(chain: string): ethers.Wallet | undefined {
        return this.wallets.get(chain);
    }

    /**
     * Get balance for a specific chain
     */
    async getBalance(chain: string): Promise<WalletBalance | null> {
        if (chain === 'solana') {
            const balance = await this.solConn.getBalance(this.solKeypair.publicKey);
            const solValue = balance / LAMPORTS_PER_SOL;
            const price = await priceOracle.getPrice('SOL');
            const usdValue = solValue * price;

            const tokens = await this.getSolanaTokenBalances();

            return {
                chain,
                address: this.solKeypair.publicKey.toBase58(),
                balance: usdValue,
                tokens,
            };
        }

        const wallet = this.wallets.get(chain);
        if (!wallet) return null;

        const balance = await wallet.provider.getBalance(wallet.address);
        const balanceEth = parseFloat(ethers.formatEther(balance));

        const price = await priceOracle.getPrice('ETH');
        const usdValue = balanceEth * price;

        return {
            chain,
            address: wallet.address,
            balance: usdValue,
            tokens: [], // TODO: Fetch ERC20 balances
        };
    }

    /**
     * Get total balance across all chains
     */
    async getTotalBalance(): Promise<number> {
        let total = 0;

        for (const chain of this.wallets.keys()) {
            const balance = await this.getBalance(chain);
            if (balance) total += balance.balance;
        }

        return total;
    }

    /**
     * Transfer Native Funds (ETH, SOL, etc.)
     */
    async transferNative(chain: string, to: string, amount: string): Promise<string> {
        if (chain === 'solana') {
            if (!this.solConn || !this.solKeypair) throw new Error('Solana wallet not initialized');

            // Require SystemProgram import dynamically or at top. 
            // We use standard web3.js classes already imported but need SystemProgram.
            const { SystemProgram } = require('@solana/web3.js');

            const toPubkey = new PublicKey(to);
            const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);

            const tx = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: this.solKeypair.publicKey,
                    toPubkey,
                    lamports
                })
            );

            return await sendAndConfirmTransaction(this.solConn, tx, [this.solKeypair]);
        }

        // EVM chains (base, eth)
        const wallet = this.wallets.get(chain);
        if (!wallet) throw new Error(`Wallet not initialized for chain: ${chain}`);

        const tx = await wallet.sendTransaction({
            to,
            value: ethers.parseEther(amount),
        });

        await tx.wait();
        return tx.hash;
    }

    /**
     * Get SPL token balances for Solana
     */
    async getSolanaTokenBalances(): Promise<{ symbol: string; balance: number; usdValue: number }[]> {
        if (!this.solConn || !this.solKeypair) return [];

        try {
            // Program ID for standard Token program
            const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

            const tokenAccounts = await this.solConn.getParsedTokenAccountsByOwner(
                this.solKeypair.publicKey,
                { programId: TOKEN_PROGRAM_ID }
            );

            const tokens = [];
            for (const account of tokenAccounts.value) {
                const info = account.account.data.parsed.info;
                const mint = info.mint;
                const balance = info.tokenAmount.uiAmount || 0;

                // Common mint addresses
                const MINT_MAP: Record<string, string> = {
                    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
                    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT'
                };

                const symbol = MINT_MAP[mint] || `TOKEN-${mint.substring(0, 4)}`;

                if (balance > 0) {
                    const price = symbol.startsWith('TOKEN-') ? 0 : await priceOracle.getPrice(symbol);
                    tokens.push({
                        symbol,
                        balance,
                        usdValue: balance * price
                    });
                }
            }
            return tokens;
        } catch (error) {
            console.error('[WalletManager] Error fetching SPL token balances:', error);
            return [];
        }
    }

    /**
     * Transfer SPL tokens (Wave 1, Item 1)
     */
    async transferSPL(mintAddress: string, toAddress: string, amount: number, decimals: number = 9): Promise<string> {
        if (!this.solConn || !this.solKeypair) throw new Error('Solana wallet not initialized');

        const mint = new PublicKey(mintAddress);
        const to = new PublicKey(toAddress);
        const amountInSmallestUnit = Math.floor(amount * Math.pow(10, decimals));

        console.log(`[WalletManager] Transferring ${amount} tokens (${mintAddress}) to ${toAddress}`);

        // 1. Get/Create ATA for sender (this wallet)
        const fromAta = await getOrCreateAssociatedTokenAccount(
            this.solConn,
            this.solKeypair,
            mint,
            this.solKeypair.publicKey
        );

        // 2. Get/Create ATA for receiver
        const toAta = await getOrCreateAssociatedTokenAccount(
            this.solConn,
            this.solKeypair,
            mint,
            to
        );

        // 3. Create transfer instruction
        const tx = new Transaction().add(
            createTransferInstruction(
                fromAta.address,
                toAta.address,
                this.solKeypair.publicKey,
                BigInt(amountInSmallestUnit)
            )
        );

        // 4. Send and confirm
        const signature = await sendAndConfirmTransaction(this.solConn, tx, [this.solKeypair]);
        console.log(`[WalletManager] SPL Transfer Success: ${signature}`);
        return signature;
    }

    getSolanaAddress(): string | null {
        return this.solKeypair?.publicKey.toBase58() || null;
    }
}

export const walletManager = new WalletManager();
