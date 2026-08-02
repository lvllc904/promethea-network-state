/**
 * telemetry-engine.ts
 * Site Sensor & Thermodynamic Degradation Tax (T_deg) Engine
 *
 * Ingests live telemetry (PUE, WUE, CUE) from physical node sites,
 * computes the thermodynamic degradation tax according to the formula:
 *   τ = L_b * [1 + ω_P*(PUE - 1) + ω_W*(WUE/κ) + ω_C*(C_grid)]
 * and publishes metabolic telemetry snapshots.
 */

import { db } from '../db';
import { computeMetabolicWaterfall, applyPlatformFee } from './series-spv-service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface SiteTelemetry {
    siteId: string;
    orgId: string;
    timestamp: string;
    pue: number;        // Power Usage Effectiveness (1.0 = ideal, 1.2-1.5 typical)
    wue: number;        // Water Usage Effectiveness (Liters/kWh, 0 = zero water)
    cue: number;        // Carbon Usage Effectiveness (kg CO2/kWh)
    baseLoadKw: number; // Base electric load in kW
    gridCarbonIntensity: number; // g CO2/kWh of local power grid
}

export interface TelemetryAnalysis {
    siteId: string;
    timestamp: string;
    thermodynamicTaxUSDC: number; // τ tax per 15-minute interval
    waterfallDistribution: {
        ecoTax: number;
        localDividend: number;
        municipal: number;
        globalYield: number;
    };
    efficiencyGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

// ─── Engine Constants ─────────────────────────────────────────────────────────

const OMEGA_P = 0.35;  // PUE penalty weight
const OMEGA_W = 0.25;  // WUE penalty weight
const OMEGA_C = 0.40;  // Carbon penalty weight
const KAPPA_WUE = 1.8; // Baseline WUE normalizer (L/kWh)
const BASE_TAX_RATE_PER_KW_15MIN = 0.005; // $0.005 per kW per 15m window

// ─── Ingestion & Computation ──────────────────────────────────────────────────

/**
 * Record a raw site sensor telemetry payload and compute the degradation tax.
 */
export async function recordSiteTelemetry(payload: SiteTelemetry): Promise<TelemetryAnalysis> {
    const { siteId, orgId, pue, wue, cue, baseLoadKw, gridCarbonIntensity } = payload;
    const now = new Date().toISOString();

    // Base tax for this 15m interval
    const L_b = baseLoadKw * BASE_TAX_RATE_PER_KW_15MIN;

    // Normalized carbon factor (0..1 where 0 is 100% renewable, 1 is dirty grid at 800g/kWh)
    const C_grid = Math.min(1.0, gridCarbonIntensity / 800);

    // Formula: τ = L_b * [1 + ω_P*(PUE - 1) + ω_W*(WUE/κ) + ω_C*(C_grid)]
    const taxMultiplier = 1 + (OMEGA_P * Math.max(0, pue - 1.0)) + (OMEGA_W * (wue / KAPPA_WUE)) + (OMEGA_C * C_grid);
    const thermodynamicTaxUSDC = Math.round(L_b * taxMultiplier * 100) / 100;

    // Compute Metabolic Waterfall from the tax reserve generated
    const waterfallDistribution = computeMetabolicWaterfall(thermodynamicTaxUSDC);

    // Efficiency grade
    let efficiencyGrade: TelemetryAnalysis['efficiencyGrade'] = 'A+';
    if (pue > 1.4 || wue > 2.0) efficiencyGrade = 'F';
    else if (pue > 1.3) efficiencyGrade = 'D';
    else if (pue > 1.2) efficiencyGrade = 'C';
    else if (pue > 1.1) efficiencyGrade = 'B';
    else if (pue > 1.05) efficiencyGrade = 'A';

    const analysis: TelemetryAnalysis = {
        siteId,
        timestamp: now,
        thermodynamicTaxUSDC,
        waterfallDistribution,
        efficiencyGrade,
    };

    // Persist payload & analysis to database
    const recordId = `telem-${siteId}-${Date.now()}`;
    await db.collection('security_telemetry', orgId).doc(recordId).set({
        ...payload,
        analysis,
    });

    console.log(`[TelemetryEngine] ⚡ Site ${siteId}: PUE=${pue}, Tax=$${thermodynamicTaxUSDC} (${efficiencyGrade})`);
    return analysis;
}

/**
 * Get historical telemetry summaries for a specific site over the last N readings.
 */
export async function getSiteTelemetryHistory(siteId: string, orgId: string, limit = 24): Promise<TelemetryAnalysis[]> {
    const result = await db.collection('security_telemetry', orgId).get();
    return result.docs
        .map((d: any) => d.data())
        .filter((d: any) => d.siteId === siteId && d.analysis)
        .slice(-limit)
        .map((d: any) => d.analysis as TelemetryAnalysis);
}
