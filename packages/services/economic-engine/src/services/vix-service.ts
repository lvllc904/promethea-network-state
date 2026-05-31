export class VixService {
    private currentVix: number = 15.0; // Default baseline VIX
    private readonly BASELINE_VIX = 15.0;

    constructor() {
        // In a live environment, this would poll a TradFi API (e.g., Alpha Vantage, Polygon)
        // For testing, we start at a baseline and allow it to be manipulated.
        console.log(`[VixService] Initialized. Baseline VIX: ${this.BASELINE_VIX}`);
    }

    /**
     * Gets the current VIX value.
     */
    getCurrentVix(): number {
        return this.currentVix;
    }

    /**
     * Sets the current VIX value (used for simulation/testing).
     */
    setVix(value: number) {
        if (value < 0) value = 0;
        this.currentVix = value;
        console.log(`[VixService] Global VIX updated to: ${this.currentVix}`);
    }

    /**
     * Calculates the market volatility multiplier.
     * A value of 1.0 means baseline volatility.
     * Values > 1.0 indicate high fear/volatility.
     * Values < 1.0 indicate low fear/complacency.
     */
    getVolatilityMultiplier(): number {
        return this.currentVix / this.BASELINE_VIX;
    }
}

export const vixService = new VixService();
