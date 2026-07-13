import { vixService } from './vix-service';

import { db } from '../db';
import { reserveManager } from '../treasury/reserve-manager';
import { personaSubstrate } from '../tools/persona-substrate';
import { brokerGateway } from '../treasury/broker-gateway';

export interface CarryTradeOpportunity {
    id: string;
    fundingAsset: string;
    fundingYield: number;
    targetAsset: string;
    targetYield: number;
    netYield: number;
    volatilityScore: number;
    liquidityDepth: number;
    reflexivityScore: number;
    status: 'OPPORTUNITY' | 'ACTIVE' | 'UNWINDING';
}

export class CarryTradeService {
    private activeTrades: Map<string, CarryTradeOpportunity> = new Map();

    /**
     * The Funnel: Filters all globally available TradFi and DeFi rates.
     */
    async scanForOpportunities(): Promise<CarryTradeOpportunity[]> {
        console.log('[CarryTrade] 📡 Initiating Multi-Chain Yield Sweep via DefiLlama...');
        
        const candidates: CarryTradeOpportunity[] = [];
        const volatilityMultiplier = vixService.getVolatilityMultiplier();

        try {
            const res = await fetch('https://yields.llama.fi/pools');
            const json: any = await res.json();
            const data = json.data;
            
            // Filter for high-liquidity, stable yield opportunities (PrOS Tier 1-3)
            const topPools = data
                .filter((p: any) => p.tvlUsd > 10000000 && p.apy > 5)
                .slice(0, 5);

            topPools.forEach((p: any) => {
                candidates.push({
                    id: `llama-${p.pool}`,
                    fundingAsset: 'USDC (Treasury)',
                    fundingYield: 0,
                    targetAsset: `${p.symbol} (${p.project})`,
                    targetYield: p.apy,
                    netYield: p.apy,
                    volatilityScore: 0.1 * volatilityMultiplier, // Scale volatility score by market VIX
                    liquidityDepth: p.tvlUsd,
                    reflexivityScore: 0.5,
                    status: 'OPPORTUNITY'
                });
            });
        } catch (e) {
            console.error('[CarryTrade] Yield Sweep Failed:', e);
        }

        // Add the Institutional TradFi Leg
        candidates.push({
            id: 'ct-tradfi-01',
            fundingAsset: 'JPY (Institutional)',
            fundingYield: 0.1,
            targetAsset: 'SPY (S&P 500)',
            targetYield: 9.2, 
            netYield: 9.1,
            volatilityScore: 0.15 * volatilityMultiplier, // Scale volatility score by market VIX
            liquidityDepth: 5000000000,
            reflexivityScore: 0.3,
            status: 'OPPORTUNITY'
        });

        // Apply Tiers 1-4 (The Funnel)
        const qualified = candidates.filter(c => {
            // In high fear environments (VIX > 20, multiplier > 1.33), we require higher net yields to compensate for risk
            const adjustedYieldTarget = 5 * Math.max(1, volatilityMultiplier * 0.8);
            
            const isProfitable = c.netYield > adjustedYieldTarget; 
            // In high fear environments, we shrink the acceptable stability band
            const adjustedStabilityTarget = 0.3 / Math.max(1, volatilityMultiplier * 0.5);
            const isStable = c.volatilityScore < adjustedStabilityTarget;
            const isLiquid = c.liquidityDepth > 1000000;
            const isNotCrowded = c.reflexivityScore < 0.9;
            
            return isProfitable && isStable && isLiquid && isNotCrowded;
        });

        console.log(`[CarryTrade] 🎯 Found ${qualified.length} real-world conviction candidates.`);
        return qualified;
    }

    /**
     * Synthesizes a new carry trade, allocating capital and updating the reserve manager.
     */
    async executeTrade(opportunity: CarryTradeOpportunity, allocationUsd: number) {
        console.log(`[CarryTrade] 🏛️ Executing Sovereign Synthesis: ${opportunity.fundingAsset} -> ${opportunity.targetAsset}`);
        
        const dailyYield = (opportunity.netYield / 100 / 365) * allocationUsd;
        
        // Mark as active
        opportunity.status = 'ACTIVE';
        this.activeTrades.set(opportunity.id, opportunity);

        // Update Reserve Manager with the daily yield synthesis
        reserveManager.onProfitRealized(dailyYield);

        await personaSubstrate.broadcastUpdate(
            'Sovereign Carry Trade Synthesized',
            `Allocated $${allocationUsd.toLocaleString()} to ${opportunity.targetAsset} carry. Predicted daily yield: $${dailyYield.toFixed(4)}.`,
        );
        
        // --- TRADFI EXECUTION BRIDGE ---
        // If the target asset is a recognized stock ticker, route to IBKR
        if (opportunity.targetAsset.includes('SPY') || opportunity.targetAsset.includes('GLD')) {
            const symbol = opportunity.targetAsset.split(' ')[0];
            const price = 500; // Rough SPY price
            const quantity = Math.floor(allocationUsd / price);
            
            if (quantity > 0) {
                console.log(`[CarryTrade] 🏛️ Routing TradFi Order: ${quantity} shares of ${symbol}...`);
                await brokerGateway.placeMarketOrder(symbol, 'BUY', quantity);
            }
        }

        // --- DEFI EXECUTION BRIDGE ---
        // If the opportunity is DeFi, route USDC via Solana transferSPL
        if (opportunity.id.startsWith('llama-') || opportunity.fundingAsset.includes('USDC')) {
            const { walletManager } = require('../treasury/wallet-manager');
            const solanaAddress = walletManager.getSolanaAddress();
            
            if (solanaAddress) {
                // Determine target pool address (Kamino or Solend)
                const isKamino = opportunity.targetAsset.toLowerCase().includes('kamino') || Math.random() > 0.5;
                const targetPoolAddress = isKamino 
                    ? 'KaminoUSDC1111111111111111111111111111111' // Kamino USDC Vault
                    : 'SolendUSDC11111111111111111111111111111111'; // Solend USDC Vault
                
                const poolName = isKamino ? 'Kamino' : 'Solend';
                console.log(`[CarryTrade] ⛓️ Routing DeFi Order: Transferring $${allocationUsd} USDC to ${poolName} Pool (${targetPoolAddress})...`);
                
                // Solana USDC Mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v, 6 decimals
                const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
                try {
                    const txSig = await walletManager.transferSPL(usdcMint, targetPoolAddress, allocationUsd, 6);
                    console.log(`[CarryTrade] DeFi Deposit Transmitted successfully via Solana. TX: ${txSig}`);
                } catch (err: any) {
                    console.error('[CarryTrade] DeFi Web3 SPL Transfer failed:', err.message);
                }
            } else {
                console.warn('[CarryTrade] Solana wallet not initialized, skipping DeFi Web3 routing.');
            }
        }

        // Persist trade state
        await db.collection('carry_trades').doc(opportunity.id).set({
            ...opportunity,
            allocationUsd,
            executedAt: new Date().toISOString()
        });
    }

    async runDailySweep() {
        const opportunities = await this.scanForOpportunities();
        const topCandidate = opportunities[0];
        
        if (topCandidate) {
            // Allocate 10% of liquid reserves to the top candidate
            const stats = reserveManager.getStats();
            const allocation = stats.reserveBalance * 0.1;
            
            if (allocation > 100) {
                await this.executeTrade(topCandidate, allocation);
            }
        }
    }
}

export const carryTradeService = new CarryTradeService();
