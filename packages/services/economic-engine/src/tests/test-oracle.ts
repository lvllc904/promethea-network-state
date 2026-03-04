import 'dotenv/config';
import { priceOracle } from '../tools/price-oracle';

async function testOracle() {
    console.log('--- Price Oracle Verification ---');

    const symbols = ['SOL', 'ETH', 'BTC', 'AAPL'];

    for (const symbol of symbols) {
        try {
            const price = await priceOracle.getPrice(symbol);
            console.log(`[Test] ${symbol.padEnd(5)}: $${price.toFixed(2)}`);
        } catch (err: any) {
            console.error(`[Test] ${symbol} Failed:`, err.message);
        }
    }

    process.exit(0);
}

testOracle().catch(console.error);
