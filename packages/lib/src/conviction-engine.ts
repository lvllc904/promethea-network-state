export interface ConvictionParams {
  amountUvt: number;
  durationDays: number;
  intervalDays?: number; // Optional, can be used for yield curve shaping later
}

export class ConvictionMathEngine {
  /**
   * Calculates the Conviction Power (veUVT) based on amount locked and duration.
   *
   * Formula:
   * veUVT = amountUvt * Multiplier
   * 
   * Multiplier Curve:
   * 1 month (30 days)  = 1.0x
   * 6 months (180 days) = 1.5x
   * 1 year (365 days)   = 2.0x
   * 2 years (730 days)  = 3.0x
   * 4 years (1460 days) = 4.0x (Max)
   *
   * Below 30 days is treated linearly up to 1.0x (e.g., 15 days = 0.5x).
   */
  static calculateVeUVT(params: ConvictionParams): number {
    const { amountUvt, durationDays } = params;

    let multiplier = 0;

    if (durationDays < 30) {
      multiplier = durationDays / 30; // Linear ramp up to 1x for the first month
    } else if (durationDays <= 180) {
      // 30 to 180 days (1x to 1.5x)
      multiplier = 1.0 + ((durationDays - 30) / 150) * 0.5;
    } else if (durationDays <= 365) {
      // 180 to 365 days (1.5x to 2.0x)
      multiplier = 1.5 + ((durationDays - 180) / 185) * 0.5;
    } else if (durationDays <= 730) {
      // 365 to 730 days (2.0x to 3.0x)
      multiplier = 2.0 + ((durationDays - 365) / 365) * 1.0;
    } else if (durationDays <= 1460) {
      // 730 to 1460 days (3.0x to 4.0x)
      multiplier = 3.0 + ((durationDays - 730) / 730) * 1.0;
    } else {
      // Cap at 4 years / 4x
      multiplier = 4.0;
    }

    return Math.floor(amountUvt * multiplier);
  }

  /**
   * Calculates the decay of Conviction Power over time as the lock approaches expiration.
   */
  static calculateDecay(initialVeUVT: number, initialDurationDays: number, daysRemaining: number): number {
    if (daysRemaining <= 0) return 0;
    if (daysRemaining >= initialDurationDays) return initialVeUVT;
    
    // Linear decay
    return Math.floor(initialVeUVT * (daysRemaining / initialDurationDays));
  }
}
