-- ==============================================================================
-- THE PROMETHEAN PORTAL (lvhllc.org) - RELATIONAL POSTGRESQL SCHEMA (DDL)
-- Compliant with:
-- 1. SEC Regulation D Rule 506(c) Progressive Gating
-- 2. State of Delaware Series LP Framework (6 Del. C. § 17-218)
-- 3. IRS June 28, 2024 Digital Asset Tax Regulations (TD 10000 - No Global Pooling)
-- 4. 258-Character Sizing for Multi-Chain DIDs, Solana, & EVM Hashes
-- ==============================================================================

-- 1. Compliance States Reference Table
CREATE TABLE IF NOT EXISTS compliance_states (
    state_id VARCHAR(12) PRIMARY KEY,
    state_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL
);

INSERT INTO compliance_states (state_id, state_name, description) VALUES 
('State-01', 'Visitor', 'Standard landing page view'),
('State-02', 'Registered', 'Wallet connected & click-sign completed'),
('State-03', 'PreQualified', 'Pre-qualification form complete'),
('State-04', 'DocumentGated', 'Digital NDA executed'),
('State-05', 'ComplianceVerify', 'AML/KYC & Accreditation docs uploaded'),
('State-06', 'Approved', 'General Partner cleared for subscription'),
('State-07', 'Signed', 'Subscription booklet counterpart executed'),
('State-08', 'ActiveLP', 'Funds cleared, $YIELD tokens minted')
ON CONFLICT (state_id) DO NOTHING;

-- 2. Master Users & Profiles Table (258-Char Wallet Address & DID Support)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(258) NOT NULL UNIQUE, -- Supports EVM, Solana (Base58), & DIDs
    full_legal_name VARCHAR(120),
    email VARCHAR(255) UNIQUE,
    country_residence VARCHAR(3) DEFAULT 'USA', -- ISO 3-digit country code
    current_state_id VARCHAR(12) DEFAULT 'State-01' REFERENCES compliance_states(state_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Delaware Series Cell SPV Isolation Table (6 Del. C. § 17-218)
CREATE TABLE IF NOT EXISTS series_cells (
    series_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series_name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'Series-Wadi-Ham'
    delaware_ein VARCHAR(20) UNIQUE, -- Registered IRS Tax ID
    sec_form_d_num VARCHAR(50) UNIQUE, -- SEC Form D reference
    escrow_address VARCHAR(258), -- Series-specific multi-sig vault
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Compliance State History Audit Log (258-Char Cryptographic Signature Hash)
CREATE TABLE IF NOT EXISTS compliance_state_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    previous_state_id VARCHAR(12) REFERENCES compliance_states(state_id),
    new_state_id VARCHAR(12) NOT NULL REFERENCES compliance_states(state_id),
    transition_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NOT NULL, -- IPv4 or IPv6 tracking
    signature_hash VARCHAR(258) -- Cryptographic click-sign hash for audit trails
);

-- 5. User-Wallet Sourced Tax Lots (Treasury June 28, 2024 Rule Compliance)
-- Strictly prohibits universal/global asset pooling; enforces individual wallet matching.
CREATE TABLE IF NOT EXISTS tax_lots_matching (
    lot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    series_id UUID NOT NULL REFERENCES series_cells(series_id),
    wallet_address VARCHAR(258) NOT NULL,
    tokens_acquired NUMERIC(36, 18) NOT NULL, -- Supports 18 decimal places
    cost_basis_usd NUMERIC(15, 2) NOT NULL,
    acquisition_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    disposal_timestamp TIMESTAMP WITH TIME ZONE,
    is_disposed BOOLEAN DEFAULT FALSE
);

-- Indexes for high-speed compliance gating and tax audits
CREATE INDEX IF NOT EXISTS idx_users_wallet_state ON users(wallet_address, current_state_id);
CREATE INDEX IF NOT EXISTS idx_tax_lots_wallet ON tax_lots_matching(wallet_address, series_id, is_disposed);
CREATE INDEX IF NOT EXISTS idx_compliance_history_user ON compliance_state_history(user_id, transition_timestamp);
