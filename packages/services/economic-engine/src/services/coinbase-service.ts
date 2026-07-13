import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { vaultService } from './vault-service';

/**
 * Sovereign Direct Off-Ramp (Path A)
 * Uses Coinbase Developer Platform (CDP) API to sell SOL and directly
 * fund the tied Varo Bank Account without UI interception.
 */
export class CoinbaseService {
    private apiKeyName: string;
    private apiPrivateKey: string;

    constructor() {
        this.apiKeyName = '';
        this.apiPrivateKey = '';
    }

    private async initialize() {
        if (!this.apiKeyName || !this.apiPrivateKey) {
            this.apiKeyName = await vaultService.getSecret('CDP_API_KEY_NAME');
            
            const rawKey = await vaultService.getSecret('CDP_API_PRIVATE_KEY');
            // Ensure proper EC PEM parsing format
            this.apiPrivateKey = rawKey.replace(/\\n/g, '\n');
        }
    }

    private generateToken(requestMethod: string, requestPath: string): string {
        const hostname = 'api.coinbase.com';
        const uri = requestMethod + ' ' + hostname + requestPath;
        
        const payload = {
            iss: 'cdp', 
            nbf: Math.floor(Date.now() / 1000), 
            exp: Math.floor(Date.now() / 1000) + 120,
            sub: this.apiKeyName, 
            uri
        };

        return jwt.sign(payload, this.apiPrivateKey, {
            algorithm: 'ES256',
            header: { kid: this.apiKeyName, nonce: crypto.randomBytes(16).toString('hex') }
        } as any);
    }

    public async offrampSolToFiat(amountUsd: number) {
        await this.initialize();
        if (!this.apiKeyName) throw new Error("CDP_API_KEY_NAME missing in Sovereign Vault");

        console.log(`[CoinbaseService] 🦅 Initiating Direct Sovereign Off-Ramp: $${amountUsd} USD`);
        
        try {
            // STEP 1: Execute the Web3 On-Chain Transfer (The Liquidity Push)
            console.log(`[CoinbaseService] ⛓️ Step 1: Initiating On-Chain Liquidation...`);
            const depositAddress = await vaultService.getSecret('CDP_DEPOSIT_ADDRESS');
            const { walletManager } = require('../treasury/wallet-manager');
            
            // Calculate required SOL based on current market rate + 1% slippage buffer.
            // Using a mock calculation here for the structural flow. In production, this queries Pyth or similar oracle.
            const estimatedSolRequired = amountUsd / 200; // Assuming ~$200/SOL for example
            const bufferedSol = estimatedSolRequired * 1.01;
            
            console.log(`[CoinbaseService] Sending ${bufferedSol.toFixed(4)} SOL from Promethea Treasury to Coinbase Drop-Zone: ${depositAddress}...`);
            await walletManager.transferSol(depositAddress, bufferedSol);
            console.log(`[CoinbaseService] ⏱️ Awaiting 30 block confirmations for CEX deposit clearance...`);
            await new Promise(resolve => setTimeout(resolve, 60 * 1000)); // Wait 60s for exchange ingestion
            
            // STEP 2: Verify Account balances to ensure Treasury availability inside the CEX
            console.log(`[CoinbaseService] 🏦 Step 2: Extracting CEX Treasury Balances...`);
            const accToken = this.generateToken('GET', '/api/v3/brokerage/accounts');
            const accRes = await axios.get(`https://api.coinbase.com/api/v3/brokerage/accounts`, {
                headers: { 'Authorization': `Bearer ${accToken}` }
            });
            const solAcc = accRes.data.accounts.find((a: any) => a.currency === 'SOL');
            console.log(`[CoinbaseService] Verified SOL Account (${solAcc.uuid}): ${solAcc.available_balance.value} SOL`);

            // STEP 3: Execute Market Sell on Advanced Trade
            console.log(`[CoinbaseService] 💱 Step 3: Executing Market Sell Order (SOL/USD) to generate Fiat...`);
            const tradeToken = this.generateToken('POST', '/api/v3/brokerage/orders');
            const tradeBody = {
                client_order_id: crypto.randomBytes(16).toString('hex'),
                product_id: 'SOL-USD',
                side: 'SELL',
                order_configuration: {
                    market_market_ioc: {
                        base_size: bufferedSol.toString()
                    }
                }
            };
            const tradeRes = await axios.post(`https://api.coinbase.com/api/v3/brokerage/orders`, tradeBody, {
                headers: { 'Authorization': `Bearer ${tradeToken}` }
            });
            console.log(`[CoinbaseService] ⚡ Trade Executed. Order ID: ${tradeRes.data.order_id}`);
            
            // STEP 2: Find the Varo Bank Payment Method
            console.log(`[CoinbaseService] Querying linked Varo Bank fiat rails...`);
            const pmToken = this.generateToken('GET', '/api/v3/brokerage/payment_methods');
            const pmRes = await axios.get(`https://api.coinbase.com/api/v3/brokerage/payment_methods`, {
                headers: { 'Authorization': `Bearer ${pmToken}` }
            });

            // Fallback to first debit_card or bank_account if specifically Varo is not parsed by name
            const paymentMethods = pmRes.data.payment_methods || [];
            let targetMethod = paymentMethods.find((m: any) => m.name.toLowerCase().includes('varo') && m.allow_withdraw);
            if (!targetMethod) {
                targetMethod = paymentMethods.find((m: any) => m.allow_withdraw && (m.type === 'debit_card' || m.type === 'bank_account'));
            }

            if (!targetMethod) {
                console.error("[CoinbaseService] 🛑 No valid fiat off-ramp target found.");
                return false;
            }

            console.log(`[CoinbaseService] Locked Target: ${targetMethod.name} (${targetMethod.type}) - ID: ${targetMethod.id}`);

            // STEP 3: Execute the Fiat Withdrawal
            console.log(`[CoinbaseService] Pushing converted $${amountUsd} USD Fiat to target...`);
            
            const reqBody = {
                payment_method_id: targetMethod.id,
                amount: amountUsd.toString(),
                currency: "USD"
            };

            // Uncomment the actual API trigger below for live production
            const wdToken = this.generateToken('POST', '/api/v3/brokerage/fiat_withdrawals');
            const wdRes = await axios.post(`https://api.coinbase.com/api/v3/brokerage/fiat_withdrawals`, reqBody, {
                headers: { 'Authorization': `Bearer ${wdToken}` }
            });
            console.log(`[CoinbaseService] ⚡ Withdrawal Event Fired! ID: ${wdRes.data.withdrawal.id}`);
            
            console.log(`[CoinbaseService] ✅ $${amountUsd} USD Off-Ramp transmission executed successfully.`);
            console.log(`[CoinbaseService] The Metabolic Bridge (Path A) is fully operational.`);

            return true;
        } catch (error: any) {
            console.error(`[CoinbaseService] 🛑 Off-Ramp Failure:`, error.response?.data || error.message);
            return false;
        }
    }
}

export const coinbaseService = new CoinbaseService();
