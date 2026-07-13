import fetch from 'node-fetch';
import { db } from '../db';
import { personaSubstrate } from '../tools/persona-substrate';

export interface BrokerOrderResult {
    success: boolean;
    orderId?: string;
    message?: string;
    error?: string;
}

export interface Position {
    conid: number;
    symbol: string;
    position: number;
    avgCost: number;
    mktPrice: number;
    unrealizedPnl: number;
}

/**
 * Sovereign Broker Gateway
 * 
 * Future-proof abstraction layer. Currently routes to Interactive Brokers (IBKR)
 * via the Client Portal REST API Gateway (IBeam).
 * Can be easily extended to support other brokerages later without modifying AI prompts.
 */
export class BrokerGateway {
    private baseUrl: string;
    private accountId: string;
    private allowLiveTrading: boolean;

    constructor() {
        // The URL where the local IBKR Gateway (IBeam) is running.
        this.baseUrl = process.env.IBKR_API_URL || 'https://localhost:5001/v1/api';
        this.accountId = process.env.IBKR_ACCOUNT_ID || ''; // e.g., DU1234567
        // Hard security constraint: Connections must strictly default to Paper Trading (starts with 'DU')
        // unless explicitly overridden by conscious user toggle in environment variables or UI.
        this.allowLiveTrading = process.env.IBKR_ALLOW_LIVE_TRADING === 'true';
    }

    /**
     * Ensures the gateway is authenticated and active.
     */
    async checkAuthentication(): Promise<boolean> {
        try {
            // Disable strict SSL for local self-signed certs used by IBeam
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
            
            const response = await fetch(`${this.baseUrl}/iserver/auth/status`);
            const data = await response.json() as any;
            return data.authenticated === true;
        } catch (error) {
            console.error('[BrokerGateway] Authentication check failed:', error);
            return false;
        }
    }

    /**
     * Retrieves the Net Liquidation Value (NLV) of the account.
     */
    async getNetLiquidWorth(): Promise<number> {
        if (!this.accountId) {
            console.warn('[BrokerGateway] IBKR_ACCOUNT_ID not configured. Returning 0 for NLV.');
            return 0;
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/portfolio/${this.accountId}/summary`);
            if (!response.ok) throw new Error('Failed to fetch account summary');
            const data = await response.json() as any;
            
            // Extract Net Liquidation Value
            const netLiquidation = data?.netliquidation?.amount || 0;
            return parseFloat(netLiquidation);
        } catch (error) {
            console.error('[BrokerGateway] Failed to get Net Liquid Worth:', error);
            return 0;
        }
    }

    /**
     * Retrieves all current open positions.
     */
    async getPositions(): Promise<Position[]> {
        if (!this.accountId) {
            console.warn('[BrokerGateway] IBKR_ACCOUNT_ID not configured. Returning empty positions.');
            return [];
        }

        try {
            const response = await fetch(`${this.baseUrl}/portfolio/${this.accountId}/positions/0`);
            if (!response.ok) throw new Error('Failed to fetch positions');
            const data = await response.json() as any[];
            
            return data.map(pos => ({
                conid: pos.conid,
                symbol: pos.contractDesc,
                position: pos.position,
                avgCost: pos.avgCost,
                mktPrice: pos.mktPrice,
                unrealizedPnl: pos.unrealizedPnl
            }));
        } catch (error) {
            console.error('[BrokerGateway] Failed to get positions:', error);
            return [];
        }
    }

    /**
     * Executes a Market Order.
     * Future-proofed interface: the AI just calls placeMarketOrder('SPY', 'BUY', 100)
     */
    async placeMarketOrder(symbol: string, action: 'BUY' | 'SELL', quantity: number): Promise<BrokerOrderResult> {
        if (!this.accountId) {
             return { success: false, error: 'IBKR_ACCOUNT_ID not configured.' };
        }

        const isPaperAccount = this.accountId.toUpperCase().startsWith('DU');
        if (!isPaperAccount && !this.allowLiveTrading) {
            const blockMsg = `LIVE TRADING BLOCKED: Account ${this.accountId} is a production live account, but live trading has not been explicitly enabled. IBKR connections strictly default to Paper Trading (DU...) sandboxes and require conscious, explicit configuration (setting IBKR_ALLOW_LIVE_TRADING=true) to promote.`;
            console.error(`[BrokerGateway] ⚠️ ${blockMsg}`);
            return {
                success: false,
                error: blockMsg
            };
        }

        try {
            console.log(`[BrokerGateway] 🏛️ Submitting ${action} order for ${quantity} shares of ${symbol}...`);
            
            // 1. Fetch Contract ID (conid) for the symbol
            const searchRes = await fetch(`${this.baseUrl}/iserver/secdef/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, name: false, secType: 'STK' })
            });
            const searchData = await searchRes.json() as any[];
            
            if (!searchData || searchData.length === 0) {
                return { success: false, error: `Could not find contract ID for symbol: ${symbol}` };
            }
            const conid = searchData[0].conid;

            // 2. Construct Order Payload
            const orderPayload = {
                acctId: this.accountId,
                conid: conid,
                secType: searchData[0].description,
                cOID: `SovereignEngine_${Date.now()}`,
                orderType: 'MKT',
                side: action,
                quantity: quantity,
                tif: 'GTC', // Good Till Cancelled
                outsideRTH: false // Outside Regular Trading Hours
            };

            // 3. Submit Order
            const orderRes = await fetch(`${this.baseUrl}/iserver/account/${this.accountId}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orders: [orderPayload] })
            });
            const orderData = await orderRes.json() as any[];

            if (orderData[0]?.order_status === 'Submitted' || orderData[0]?.order_status === 'PreSubmitted') {
                const result = {
                    success: true,
                    orderId: orderData[0].order_id,
                    message: `Successfully routed ${action} order for ${quantity} ${symbol}.`
                };
                
                await personaSubstrate.broadcastUpdate(
                    'TradFi Asset Acquisition',
                    `Promethea has autonomously routed a ${action} order for ${quantity} shares of ${symbol} to the Sovereign Treasury broker via API.`,
                    'RESERVE_HUB'
                );
                
                // Log to ledger
                await db.collection('carry_trades').add({
                    type: 'TRADFI_EXECUTION',
                    symbol,
                    action,
                    quantity,
                    timestamp: new Date().toISOString()
                });

                return result;
            } else {
                return { success: false, error: orderData[0]?.error_message || 'Order rejected by broker.' };
            }

        } catch (error) {
            console.error('[BrokerGateway] Execution failed:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}

export const brokerGateway = new BrokerGateway();
