/**
 * Promethean Portal (lvhllc.org) - 8-Step Compliance State Machine & Database Types
 * Enforces SEC Regulation D Rule 506(c) and IRS June 28, 2024 Digital Asset Tax compliance.
 */

export type ComplianceStateId = 
  | 'State-01' // Visitor
  | 'State-02' // Registered (Wallet Connected)
  | 'State-03' // PreQualified (Form Complete)
  | 'State-04' // DocumentGated (NDA Executed)
  | 'State-05' // ComplianceVerify (AML/KYC & Accreditation Docs Uploaded)
  | 'State-06' // Approved (GP Cleared)
  | 'State-07' // Signed (Subscription Booklet Executed)
  | 'State-08'; // ActiveLP (Funds Cleared, $YIELD Minted)

export interface ComplianceStateMeta {
  id: ComplianceStateId;
  name: string;
  description: string;
  requiredTrigger: string;
  gatedAccess: string;
  isDocumentUnlocked: boolean;
  isAccredited: boolean;
  isFunded: boolean;
}

export const COMPLIANCE_STATES: Record<ComplianceStateId, ComplianceStateMeta> = {
  'State-01': {
    id: 'State-01',
    name: 'Visitor',
    description: 'Standard public landing page view',
    requiredTrigger: 'Standard public landing page load; unrestricted visual routing.',
    gatedAccess: 'Public landing page, disclaimers, general disclosures. PPM/LOA totally hidden.',
    isDocumentUnlocked: false,
    isAccredited: false,
    isFunded: false,
  },
  'State-02': {
    id: 'State-02',
    name: 'Registered',
    description: 'Wallet connected & click-sign completed',
    requiredTrigger: 'EVM or Solana wallet connection with Click-to-Sign challenge message.',
    gatedAccess: 'Sovereign Web3 ID archived; portal displays read-only public dashboard. Core documents locked.',
    isDocumentUnlocked: false,
    isAccredited: false,
    isFunded: false,
  },
  'State-03': {
    id: 'State-03',
    name: 'PreQualified',
    description: 'Pre-qualification form complete',
    requiredTrigger: 'Complete Pre-Qualification Form logging demographic & background info.',
    gatedAccess: 'Database records pre-existing relationship profile to defend against unregistered general solicitation.',
    isDocumentUnlocked: false,
    isAccredited: false,
    isFunded: false,
  },
  'State-04': {
    id: 'State-04',
    name: 'DocumentGated',
    description: 'Digital NDA executed',
    requiredTrigger: 'Electronic execution of Clickwrap Non-Disclosure Agreement (NDA).',
    gatedAccess: 'Access Control Matrix unlocks file decryption keys. Dynamic user-specific watermarking enabled on PPM/LOA.',
    isDocumentUnlocked: true,
    isAccredited: false,
    isFunded: false,
  },
  'State-05': {
    id: 'State-05',
    name: 'ComplianceVerify',
    description: 'AML/KYC & Accreditation docs uploaded',
    requiredTrigger: 'Investor uploads photo ID and Rule 506(c) CPA/attorney verification letters.',
    gatedAccess: 'Automated OFAC / Sanctions screening activated; Corporate BOI checked; accreditation status verified.',
    isDocumentUnlocked: true,
    isAccredited: false,
    isFunded: false,
  },
  'State-06': {
    id: 'State-06',
    name: 'Approved',
    description: 'General Partner cleared for subscription',
    requiredTrigger: 'GP compliance review clears investor profile; system releases documents.',
    gatedAccess: 'System generates pre-filled Subscription Booklet (Template 3.1.A), Investor Questionnaire, and tax W-9/W-8.',
    isDocumentUnlocked: true,
    isAccredited: true,
    isFunded: false,
  },
  'State-07': {
    id: 'State-07',
    name: 'Signed',
    description: 'Subscription booklet counterpart executed',
    requiredTrigger: 'LP executes the subscription booklet; GP counterpart signatures collected.',
    gatedAccess: 'LP allocation limit locked on-chain. Automated escrow address designated for the active Series Cell.',
    isDocumentUnlocked: true,
    isAccredited: true,
    isFunded: false,
  },
  'State-08': {
    id: 'State-08',
    name: 'ActiveLP',
    description: 'Funds cleared, $YIELD tokens minted',
    requiredTrigger: 'Clearing of Fedwire or stablecoin funds; automated escrow reconciliation.',
    gatedAccess: 'Programmatic minting and transfer of fractional $YIELD economic security tokens directly to whitelisted wallet.',
    isDocumentUnlocked: true,
    isAccredited: true,
    isFunded: true,
  },
};

export const STATE_HIERARCHY: ComplianceStateId[] = [
  'State-01',
  'State-02',
  'State-03',
  'State-04',
  'State-05',
  'State-06',
  'State-07',
  'State-08',
];

/**
 * Validates if the user's current compliance state satisfies the minimum required state.
 */
export function isStateEligible(currentState: ComplianceStateId, requiredState: ComplianceStateId): boolean {
  const currentRank = STATE_HIERARCHY.indexOf(currentState);
  const requiredRank = STATE_HIERARCHY.indexOf(requiredState);
  if (currentRank === -1 || requiredRank === -1) return false;
  return currentRank >= requiredRank;
}

// ─── Database Models (PostgreSQL DDL Alignment) ───────────────────────────────

export interface UserProfile {
  user_id: string; // UUID
  wallet_address: string; // VARCHAR(258)
  full_legal_name?: string | null;
  email?: string | null;
  country_residence: string; // ISO 3-character country code (e.g. 'USA')
  current_state_id: ComplianceStateId;
  created_at: string;
  updated_at: string;
}

export interface DelawareSeriesCell {
  series_id: string; // UUID
  series_name: string; // e.g., 'Series-Wadi-Ham'
  delaware_ein?: string | null; // IRS Tax ID
  sec_form_d_num?: string | null; // SEC SEC-Filer reference
  created_at: string;
}

export interface ComplianceStateHistoryAudit {
  history_id: string; // UUID
  user_id: string; // UUID
  previous_state_id?: ComplianceStateId | null;
  new_state_id: ComplianceStateId;
  transition_timestamp: string;
  ip_address: string; // IPv4 or IPv6 tracking
  signature_hash: string; // VARCHAR(258) Cryptographic click-sign hash
}

export interface TaxLotMatching {
  lot_id: string; // UUID
  user_id: string; // UUID
  series_id: string; // UUID
  wallet_address: string; // VARCHAR(258)
  tokens_acquired: string; // Numeric(36, 18)
  cost_basis_usd: string; // Numeric(15, 2)
  acquisition_timestamp: string;
  disposal_timestamp?: string | null;
  is_disposed: boolean;
}
