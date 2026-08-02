/**
 * series-spv-service.ts
 * DRULPA § 17-218 / § 17-221 Series SPV Lifecycle Engine
 *
 * Handles:
 *  - Series designation addendums
 *  - Statutory filing verification (DE SOS, EIN, SEC Form D)
 *  - Gnosis Safe multi-sig mapping per child SPV
 *  - Dual-token ($PEACE soulbound / $YIELD economic) minting parameters
 */

import { db, COLLECTIONS } from '../db';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ComplianceStatus =
    | 'PENDING'
    | 'FILED'
    | 'ACTIVE'
    | 'SUSPENDED'
    | 'DISSOLVED';

export type SeriesType = 'PROTECTED_SERIES' | 'REGISTERED_SERIES';

export interface StatutoryChecklist {
    einFiled: boolean;
    deSOSFiled: boolean;           // Delaware Secretary of State filing
    secFormDFiled: boolean;        // SEC Form D (EDGAR, within 15 days)
    secFormDFiledAt?: string;      // ISO date
    franchiseTaxPaid: boolean;
    operatingAgreementSigned: boolean;
    ucc1Filed: boolean;
    gnosisSafeAddress?: string;    // Multi-sig wallet address for this series
}

export interface DualTokenParams {
    peaceSupply: number;           // Soulbound governance token supply (51% voting)
    peaceVestingDays: number;      // Linear vesting for sweat equity issuance
    yieldSupply: number;           // Economic equity token supply (49% Reg D 506c)
    yieldPriceUSDC: number;        // Per-token USDC price at formation
    revProc9327Eligible: boolean;  // Profits interest safe harbor (Rev Proc 93-27)
}

export interface SeriesSPV {
    id: string;
    orgId: string;
    seriesName: string;            // e.g. "Series 01: Chester County Land"
    seriesType: SeriesType;
    parentMasterLLCName: string;   // e.g. "TPNS Master LLC"
    complianceStatus: ComplianceStatus;
    assetDescription: string;
    assetValuationUSDC: number;
    statutory: StatutoryChecklist;
    tokens: DualTokenParams;
    createdAt: string;
    updatedAt: string;
    notes?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

const SERIES_COLLECTION = 'series_spvs';

/**
 * Create a new Series SPV with default statutory checklist and token params.
 */
export async function createSeriesSPV(params: {
    orgId: string;
    seriesName: string;
    seriesType?: SeriesType;
    parentMasterLLCName?: string;
    assetDescription: string;
    assetValuationUSDC: number;
    gnosisSafeAddress?: string;
    notes?: string;
}): Promise<SeriesSPV> {
    const now = new Date().toISOString();
    const id = `spv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const spv: SeriesSPV = {
        id,
        orgId: params.orgId,
        seriesName: params.seriesName,
        seriesType: params.seriesType || 'PROTECTED_SERIES',
        parentMasterLLCName: params.parentMasterLLCName || 'TPNS Master LLC',
        complianceStatus: 'PENDING',
        assetDescription: params.assetDescription,
        assetValuationUSDC: params.assetValuationUSDC,
        statutory: {
            einFiled: false,
            deSOSFiled: false,
            secFormDFiled: false,
            franchiseTaxPaid: false,
            operatingAgreementSigned: false,
            ucc1Filed: false,
            gnosisSafeAddress: params.gnosisSafeAddress,
        },
        tokens: {
            peaceSupply: 1_000_000,
            peaceVestingDays: 1460, // 4-year linear vest
            yieldSupply: 960_000,
            yieldPriceUSDC: params.assetValuationUSDC / 960_000,
            revProc9327Eligible: true,
        },
        createdAt: now,
        updatedAt: now,
        notes: params.notes,
    };

    await db.collection(SERIES_COLLECTION, params.orgId).doc(id).set(spv);
    console.log(`[SeriesSPV] ✅ Created ${spv.seriesName} (${id}) for org ${params.orgId}`);
    return spv;
}

/**
 * Fetch a single Series SPV by ID.
 */
export async function getSeriesSPV(id: string, orgId: string): Promise<SeriesSPV | null> {
    const ref = await db.collection(SERIES_COLLECTION, orgId).doc(id).get();
    if (!ref.exists) return null;
    return ref.data() as SeriesSPV;
}

/**
 * List all Series SPVs for a given org.
 */
export async function listSeriesSPVs(orgId: string): Promise<SeriesSPV[]> {
    const result = await db.collection(SERIES_COLLECTION, orgId).get();
    return result.docs.map((d: any) => d.data() as SeriesSPV);
}

/**
 * Update statutory checklist fields and automatically advance compliance status.
 * DRULPA § 17-218: All five statutory preconditions must be met to go ACTIVE.
 */
export async function updateSeriesCompliance(
    id: string,
    orgId: string,
    patch: Partial<StatutoryChecklist & { notes?: string; assetValuationUSDC?: number }>
): Promise<SeriesSPV | null> {
    const existing = await getSeriesSPV(id, orgId);
    if (!existing) return null;

    const updatedStatutory: StatutoryChecklist = {
        ...existing.statutory,
        ...patch,
    };

    // Auto-set SEC Form D filed timestamp
    if (patch.secFormDFiled && !existing.statutory.secFormDFiled) {
        updatedStatutory.secFormDFiledAt = new Date().toISOString();
    }

    // Determine compliance status from checklist
    const { einFiled, deSOSFiled, secFormDFiled, franchiseTaxPaid, operatingAgreementSigned, ucc1Filed } = updatedStatutory;
    let complianceStatus: ComplianceStatus = 'PENDING';
    if (einFiled && deSOSFiled && secFormDFiled && franchiseTaxPaid && operatingAgreementSigned) {
        complianceStatus = ucc1Filed ? 'ACTIVE' : 'FILED';
    }

    const updated: SeriesSPV = {
        ...existing,
        statutory: updatedStatutory,
        complianceStatus,
        assetValuationUSDC: patch.assetValuationUSDC ?? existing.assetValuationUSDC,
        notes: patch.notes ?? existing.notes,
        updatedAt: new Date().toISOString(),
    };

    // Recalculate yield token price when valuation changes
    updated.tokens = {
        ...existing.tokens,
        yieldPriceUSDC: updated.assetValuationUSDC / existing.tokens.yieldSupply,
    };

    await db.collection(SERIES_COLLECTION, orgId).doc(id).set(updated);
    console.log(`[SeriesSPV] 🔄 Compliance updated for ${id}: ${complianceStatus}`);
    return updated;
}

/**
 * Compute the 21/30/49 Metabolic Waterfall distribution for a SPV's FCF.
 * Returns absolute USDC amounts per tier.
 */
export function computeMetabolicWaterfall(freeCashFlowUSDC: number): {
    ecoTax: number;       // 21% — Sovereign Eco-Tax reserve
    localDividend: number; // 30% — Local $PEACE dividends
    municipal: number;    // 21% — Host government municipal treasury
    globalYield: number;  // 28% — Global Capital $YIELD  (NOTE: adjusted 21/30/21/28 = 100)
} {
    return {
        ecoTax:        Math.round(freeCashFlowUSDC * 0.21),
        localDividend: Math.round(freeCashFlowUSDC * 0.30),
        municipal:     Math.round(freeCashFlowUSDC * 0.21),
        globalYield:   Math.round(freeCashFlowUSDC * 0.28),
    };
}

/**
 * Apply the 3-Tier Platform Fee to a transaction amount.
 * Tier 1: Simple (NNN ground leases, stabilized title)       → 1.0%
 * Tier 2-3: Moderate (multifamily, maker guilds, op biz)     → 2.0%
 * Tier 4-5: Complex (skyscrapers, off-grid utilities)        → 3.0%
 */
export function applyPlatformFee(
    amountUSDC: number,
    tier: 1 | 2 | 3 | 4 | 5
): { fee: number; net: number; tierLabel: string } {
    const feeRates: Record<number, number> = { 1: 0.01, 2: 0.02, 3: 0.02, 4: 0.03, 5: 0.03 };
    const tierLabels: Record<number, string> = {
        1: 'Tier 1 — Simple (NNN)',
        2: 'Tier 2 — Moderate (Multifamily)',
        3: 'Tier 3 — Moderate (Operating Business)',
        4: 'Tier 4 — Complex (Skyscraper)',
        5: 'Tier 5 — Complex (Off-grid Utility)',
    };
    const rate = feeRates[tier] || 0.02;
    const fee = Math.round(amountUSDC * rate * 100) / 100;
    return { fee, net: amountUSDC - fee, tierLabel: tierLabels[tier] };
}
