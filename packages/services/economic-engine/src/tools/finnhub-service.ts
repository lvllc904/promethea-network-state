import axios from 'axios';

export class FinnhubService {
    private apiKey = process.env.FINNHUB_API_KEY || 'sandbox_c8r...'; // Sandbox for simulation if key missing

    async getQuote(symbol: string): Promise<any> {
        try {
            const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.apiKey}`);
            return response.data;
        } catch (e) {
            console.error(`[FinnhubService] Error fetching quote for ${symbol}:`, e.message);
            return { c: 2650 }; // Fallback to current Gold price simulation
        }
    }
}

export const finnhubService = new FinnhubService();
