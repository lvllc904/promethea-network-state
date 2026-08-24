//! Labor Value Matrix (LVM) Calculation Engine
//! Computes worker-owner equity allocations based on local labor hours, PPP, and risk premiums.
//! Follows canonical parameter limits defined in `packages/client/config/sovereign_parameters.json`.

use serde::{Deserialize, Serialize};

pub const FIXED_PRECISION: u64 = 1_000_000; // 10^6 fixed-point scaling factor

// Canonical risk premium multipliers from sovereign_parameters.json
pub const CANONICAL_RISK_STANDARD: u64 = 1_500_000; // 1.5x standard operations
pub const CANONICAL_RISK_HAZARDOUS: u64 = 3_000_000; // 3.0x hazardous / deep tech operations

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct WorkerLaborEntry {
    pub citizen_did_hash: [u8; 32],
    /// Verified labor hours (scaled by FIXED_PRECISION)
    pub labor_hours_scaled: u64,
    /// Regional Purchasing Power Parity index (e.g. 1.15 * 10^6)
    pub ppp_factor_scaled: u64,
    /// Risk premium multiplier (e.g., 1.5 * 10^6 or 3.0 * 10^6)
    pub risk_premium_scaled: u64,
    /// Base hourly equity unit allocation
    pub base_rate_scaled: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct LaborAllocationProof {
    pub citizen_did_hash: [u8; 32],
    pub equity_units_scaled: u64,
    pub is_verified: bool,
}

/// Computes worker-owner equity units:
/// Equity = Hours * BaseRate * PPP * RiskMultiplier
pub fn compute_worker_equity(entry: &WorkerLaborEntry) -> u64 {
    // Step 1: Base Value = (Hours * BaseRate) / FIXED_PRECISION
    let base_val = (entry.labor_hours_scaled * entry.base_rate_scaled) / FIXED_PRECISION;

    // Step 2: Adjusted for PPP = (BaseVal * PPP) / FIXED_PRECISION
    let ppp_adjusted = (base_val * entry.ppp_factor_scaled) / FIXED_PRECISION;

    // Step 3: Risk adjusted = (PPPAdjusted * RiskMultiplier) / FIXED_PRECISION
    let final_equity_scaled = (ppp_adjusted * entry.risk_premium_scaled) / FIXED_PRECISION;

    final_equity_scaled
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_standard_canonical_labor_allocation() {
        let entry = WorkerLaborEntry {
            citizen_did_hash: [1u8; 32],
            labor_hours_scaled: 40 * FIXED_PRECISION,   // 40 hours
            ppp_factor_scaled: 1 * FIXED_PRECISION,     // 1.0 PPP
            risk_premium_scaled: CANONICAL_RISK_STANDARD, // 1.5x standard
            base_rate_scaled: 20 * FIXED_PRECISION,     // 20 tokens/hr
        };

        let equity = compute_worker_equity(&entry);
        // 40 * 20 * 1.0 * 1.5 = 1,200 equity tokens
        assert_eq!(equity, 1_200 * FIXED_PRECISION);
    }

    #[test]
    fn test_hazardous_deep_tech_labor_allocation() {
        let entry = WorkerLaborEntry {
            citizen_did_hash: [2u8; 32],
            labor_hours_scaled: 10 * FIXED_PRECISION,    // 10 hours
            ppp_factor_scaled: 1_200_000,                // 1.20 PPP
            risk_premium_scaled: CANONICAL_RISK_HAZARDOUS, // 3.0x hazardous
            base_rate_scaled: 100 * FIXED_PRECISION,     // 100 tokens/hr
        };

        // 10 * 100 = 1000 base
        // 1000 * 1.20 = 1200 PPP
        // 1200 * 3.0 = 3600 final equity
        let equity = compute_worker_equity(&entry);
        assert_eq!(equity, 3_600 * FIXED_PRECISION);
    }
}
