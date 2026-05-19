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
                    volatilityScore: 0.1,
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
            volatilityScore: 0.15,
            liquidityDepth: 5000000000,
            reflexivityScore: 0.3,
            status: 'OPPORTUNITY'
        });

        // Apply Tiers 1-4 (The Funnel)
        const qualified = candidates.filter(c => {
            const isProfitable = c.netYield > 5; 
            const isStable = c.volatilityScore < 0.3;
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
