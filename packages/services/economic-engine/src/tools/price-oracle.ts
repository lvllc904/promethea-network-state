import axios from 'axios';

/**
 * Sovereign Price Oracle (Wave 1, Item 4)
 * 
 * Fetches real-time price data for treasury valuation.
 * Uses Alpaca (Primary) and CoinGecko (Secondary) APIs with internal caching.
 */
export class PriceOracle {
    private static CACHE_TTL = 300000; // 5 minutes cache
    private cache: Map<string, { price: number; timestamp: number }> = new Map();

    private alpacaKeyId = process.env.APCA_API_KEY_ID;
    private alpacaSecret = process.env.APCA_API_SECRET_KEY;

    /**
     * Get real-time price for a token symbol
     */
    async getPrice(symbol: string): Promise<number> {
        const upSymbol = symbol.toUpperCase();
        const cached = this.cache.get(upSymbol);

        if (cached && Date.now() - cached.timestamp < PriceOracle.CACHE_TTL) {
            return cached.price;
        }

        // Try Pyth Network first (High-Fidelity)
        try {
            const pythPrice = await this.getPythPrice(upSymbol);
            if (pythPrice) {
                this.cache.set(upSymbol, { price: pythPrice, timestamp: Date.now() });
                console.log(`[PriceOracle] Updated ${upSymbol} price via Pyth: $${pythPrice.toFixed(2)}`);
                return pythPrice;
            }
        } catch (err) {
            // Silently fall through to Alpaca
        }

        // Try Alpaca second for common stocks/crypto if keys are available
        if (this.alpacaKeyId && this.alpacaSecret) {
            try {
                const alpacaPrice = await this.getAlpacaPrice(upSymbol);
                if (alpacaPrice) {
                    this.cache.set(upSymbol, { price: alpacaPrice, timestamp: Date.now() });
                    console.log(`[PriceOracle] Updated ${upSymbol} price via Alpaca: $${alpacaPrice.toFixed(2)}`);
                    return alpacaPrice;
                }
            } catch (err) {
                console.warn(`[PriceOracle] Alpaca failed for ${upSymbol}, falling back to CoinGecko...`);
            }
        }

        try {
            // Mapping symbols to CoinGecko IDs
            const idMap: Record<string, string> = {
                'SOL': 'solana',
                'ETH': 'ethereum',
                'BTC': 'bitcoin',
                'BASE': 'ethereum',
                'USDC': 'usd-coin',
                'USDT': 'tether'
            };

            const id = idMap[upSymbol];
            if (!id) {
                console.warn(`[PriceOracle] Unsupported symbol: ${upSymbol}. Using $1 fallback.`);
                return 1.0;
            }

            // Note: CoinGecko free tier has rate limits
            const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);

            if (response.data && response.data[id] && typeof response.data[id].usd === 'number') {
                const price = response.data[id].usd;
                this.cache.set(upSymbol, { price, timestamp: Date.now() });
                console.log(`[PriceOracle] Updated ${upSymbol} price via CoinGecko: $${price}`);
                return price;
            }

            throw new Error(`Invalid response format for ${id}`);
        } catch (error: any) {
            console.error(`[PriceOracle] API Error for ${upSymbol}:`, error.message);

            // Hard fallbacks if the API is down to prevent engine stall
            const fallbacks: Record<string, number> = {
                'SOL': 145.50,
                'ETH': 2680.00,
                'BTC': 68400.00,
                'BASE': 2680.00,
                'USDC': 1.0,
                'USDT': 1.0
            };

            return fallbacks[upSymbol] || 1.0;
        }
    }

    private async getAlpacaPrice(symbol: string): Promise<number | null> {
        try {
            // Support for common crypto and stocks
            const alpacaSymbols: Record<string, string> = {
                'BTC': 'BTC/USD',
                'ETH': 'ETH/USD',
                'SOL': 'SOL/USD',
                'USDC': 'USDC/USD'
            };

            const targetSymbol = alpacaSymbols[symbol] || symbol;
            const isCrypto = targetSymbol.includes('/');

            const baseUrl = isCrypto
                ? 'https://data.alpaca.markets/v1beta3/crypto/us/latest/quotes'
                : 'https://data.alpaca.markets/v2/stocks/quotes/latest';

            const response = await axios.get(baseUrl, {
                params: { symbols: targetSymbol },
                headers: {
                    'APCA-API-KEY-ID': this.alpacaKeyId,
                    'APCA-API-SECRET-KEY': this.alpacaSecret
                }
            });

            const data = response.data;
            if (isCrypto) {
                const quote = data.quotes[targetSymbol];
                return quote ? (quote.ap + quote.bp) / 2 : null; // Average of bid/ask
            } else {
                const quote = data.quotes[targetSymbol];
                return quote ? (quote.ap + quote.bp) / 2 : null;
            }
        } catch (err) {
            return null;
        }
    }

    private async getPythPrice(symbol: string): Promise<number | null> {
        try {
            const feedIds: Record<string, string> = {
                'SOL': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
                'ETH': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
                'BTC': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43'
            };

            const feedId = feedIds[symbol];
            if (!feedId) return null;

            const url = `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${feedId}`;
            const response = await axios.get(url, { timeout: 10000 });

            if (response.data && response.data.parsed && response.data.parsed[0]) {
                const parsed = response.data.parsed[0];
                const price = parseInt(parsed.price.price);
                const expo = parseInt(parsed.price.expo);
                return price * Math.pow(10, expo);
            }

            return null;
        } catch (err: any) {
            console.error(`[PriceOracle] Pyth Error for ${symbol}:`, err.message);
            return null;
        }
    }
}

export const priceOracle = new PriceOracle();
