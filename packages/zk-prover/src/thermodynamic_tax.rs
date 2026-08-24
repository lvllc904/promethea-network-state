//! Thermodynamic Degradation Tax (τ) Engine
//! Computes exergy penalties based on PUE, WUE, and grid carbon intensity in pure deterministic Rust.
//! Follows canonical parameter limits defined in `packages/client/config/sovereign_parameters.json`.

use serde::{Deserialize, Serialize};

pub const FIXED_PRECISION: u64 = 1_000_000; // 10^6 fixed-point scaling factor

// Canonical default weights from sovereign_parameters.json
pub const CANONICAL_W_P: u64 = 300_000; // 0.30 power weight
pub const CANONICAL_W_W: u64 = 400_000; // 0.40 water weight
pub const CANONICAL_W_C: u64 = 300_000; // 0.30 carbon weight
pub const CANONICAL_KAPPA: u64 = 10_000_000; // 10.0 sustainable water replenishment coefficient

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ThermodynamicInputs {
    /// Base lease rate (scaled by FIXED_PRECISION)
    pub base_lease_scaled: u64,
    /// Power Usage Effectiveness (scaled by FIXED_PRECISION, e.g., 1.25 * 10^6 = 1_250_000)
    pub pue_scaled: u64,
    /// Water Usage Effectiveness (scaled by FIXED_PRECISION)
    pub wue_scaled: u64,
    /// Water replenishment constant kappa (scaled by FIXED_PRECISION)
    pub kappa_scaled: u64,
    /// Grid carbon intensity (scaled by FIXED_PRECISION)
    pub carbon_grid_scaled: u64,
    /// Power weight w_P (scaled by FIXED_PRECISION)
    pub w_p_scaled: u64,
    /// Water weight w_W (scaled by FIXED_PRECISION)
    pub w_w_scaled: u64,
    /// Carbon weight w_C (scaled by FIXED_PRECISION)
    pub w_c_scaled: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ThermodynamicTaxProof {
    pub tax_amount_scaled: u64,
    pub input_commitment_hash: [u8; 32],
    pub is_valid: bool,
}

/// Computes the exact thermodynamic tax penalty:
/// τ = Lb * [ 1 + w_P * (PUE - 1.0) + w_W * (WUE / κ) + w_C * C_grid ]
pub fn compute_thermodynamic_tax(inputs: &ThermodynamicInputs) -> Result<u64, &'static str> {
    if inputs.kappa_scaled == 0 {
        return Err("DivisionByZero: kappa coefficient cannot be 0");
    }

    // 1.0 in fixed precision
    let one_scaled = FIXED_PRECISION;

    // Term 1: w_P * max(0, PUE - 1.0)
    let pue_excess = if inputs.pue_scaled > one_scaled {
        inputs.pue_scaled - one_scaled
    } else {
        0
    };
    let term_power = (inputs.w_p_scaled * pue_excess) / FIXED_PRECISION;

    // Term 2: w_W * (WUE / κ)
    // Scaled arithmetic: (w_W * WUE) / κ
    let term_water = (inputs.w_w_scaled * inputs.wue_scaled) / inputs.kappa_scaled;

    // Term 3: w_C * C_grid
    let term_carbon = (inputs.w_c_scaled * inputs.carbon_grid_scaled) / FIXED_PRECISION;

    // Multiplier = 1.0 + term_power + term_water + term_carbon
    let multiplier_scaled = one_scaled + term_power + term_water + term_carbon;

    // τ = (Lb * Multiplier) / FIXED_PRECISION
    let tax_scaled = (inputs.base_lease_scaled * multiplier_scaled) / FIXED_PRECISION;

    Ok(tax_scaled)
}

/// Helper using canonical parameter weights from sovereign_parameters.json
pub fn compute_canonical_thermodynamic_tax(
    base_lease_scaled: u64,
    pue_scaled: u64,
    wue_scaled: u64,
    carbon_grid_scaled: u64,
) -> Result<u64, &'static str> {
    let inputs = ThermodynamicInputs {
        base_lease_scaled,
        pue_scaled,
        wue_scaled,
        kappa_scaled: CANONICAL_KAPPA,
        carbon_grid_scaled,
        w_p_scaled: CANONICAL_W_P,
        w_w_scaled: CANONICAL_W_W,
        w_c_scaled: CANONICAL_W_C,
    };
    compute_thermodynamic_tax(&inputs)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_baseline_ideal_efficiency() {
        // Ideal datacenter: PUE = 1.0, WUE = 0.0, Carbon = 0.0
        let inputs = ThermodynamicInputs {
            base_lease_scaled: 10_000 * FIXED_PRECISION,
            pue_scaled: 1 * FIXED_PRECISION,
            wue_scaled: 0,
            kappa_scaled: 10 * FIXED_PRECISION,
            carbon_grid_scaled: 0,
            w_p_scaled: CANONICAL_W_P,
            w_w_scaled: CANONICAL_W_W,
            w_c_scaled: CANONICAL_W_C,
        };

        let tax = compute_thermodynamic_tax(&inputs).unwrap();
        // Should equal exactly base lease (10,000 * 10^6)
        assert_eq!(tax, 10_000 * FIXED_PRECISION);
    }

    #[test]
    fn test_canonical_manifest_parameters() {
        // Test with parameters matching sovereign_parameters.json
        // PUE = 1.5 (+0.5 excess), w_P = 0.30 -> +0.15 penalty
        // WUE = 2.0, kappa = 10.0, w_W = 0.40 -> (0.40 * 2.0 / 10.0) = +0.08 penalty
        // Carbon = 0.40, w_C = 0.30 -> (0.30 * 0.40) = +0.12 penalty
        // Total Multiplier = 1.0 + 0.15 + 0.08 + 0.12 = 1.35x
        let base_lease = 100_000 * FIXED_PRECISION;
        let tax = compute_canonical_thermodynamic_tax(
            base_lease,
            1_500_000, // PUE 1.5
            2_000_000, // WUE 2.0
            400_000,   // Carbon 0.4
        )
        .unwrap();

        // 100,000 * 1.35 = 135,000
        assert_eq!(tax, 135_000 * FIXED_PRECISION);
    }
}
