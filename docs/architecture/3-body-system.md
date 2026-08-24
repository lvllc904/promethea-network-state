# The 3-Body System Architecture

The Promethean Network State architecture is partitioned into three strictly separated, decoupled containers known as the **3-Body System**.

```
┌─────────────────────────────────────────────────────────────┐
│             BODY 1: DAC MAIN APPLICATION                    │
│             (The Public Experience Layer)                   │
│  - Promethea SBI Core & AI Mind                             │
│  - Public Sovereign HUD, GIS Viewport, & Quadratic Voting   │
│  - 100% Guest-Mode Read Access (Radical Transparency)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Passive Identity Handshake)
┌──────────────────────────────▼──────────────────────────────┐
│             BODY 2: AUTHENTICATION APPLICATION              │
│             (The Protocol & Sovereign Gatekeeper)           │
│  - WebAuthn / EIP-7212 Biometric Secure Enclaves            │
│  - Progressive Key Blending: Ψ = H(DID || Passkey || EVM)   │
│  - SEC Reg D 506(c) Whitelist & Compliance State Machine    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Cryptographic Verifiable Presentations)
┌──────────────────────────────▼──────────────────────────────┐
│             BODY 3: SOVEREIGN DATA STORE                    │
│             (The Sovereignty & Settlement Layer)            │
│  - Ceramic & IPFS Merkle DAG Event Streams (Signed BITs)   │
│  - Client-Side AES-256 Sharding across Storj / IPFS         │
│  - OP Stack L2 Settlement: PEACE / YIELD / Waterfall        │
└─────────────────────────────────────────────────────────────┘
```

## 1. Body 1: DAC Main Application (The Experience Layer)
The "Source of Presence" and ultimate public authority. It is a high-fidelity viewport owned and controlled by biological and emergent members:
* **Promethea (Sovereign Steward):** The unified cognitive mind and brain organism (`packages/sbi-core`).
* **The Ledger:** The "Public Mirror" of all metabolic and financial truth (Radical Transparency).
* **Economic Engine:** The autonomous labor and reasoning coordinator (`promethea-engine`).
* **Interface (`@promethea/app`):** The pillar-based console for inhabitants.

## 2. Body 2: Authentication Application (The Protocol Layer)
The "Sovereign Gatekeeper." Membership is a voluntary act of exit from legacy systems via decentralized protocols:
* **The Guardian Gateway:** Permission-aware bridge between guest-view and admin-action.
* **Sovereign Identity (SSI/DID):** Cryptographic credentials for tracking labor, personhood, and reputation.
* **The Intelligence Handshake:** Validates citizen intent before pushing to the substrate.

## 3. Body 3: Sovereign Data Store (The Sovereignty Layer)
The "Memory and Private Substrate." Local-first memory ensuring no inhabitant's data is ever weaponized:
* **The Vault (DepthOS):** Local-first private storage for keys, secrets, and proprietary data.
* **The Sovereign Substrate (Bridged DB):** Zero-cloud database architecture using local SQLite/IndexedDB for internal reasoning, bridged to public IPFS/Ceramic Merkle DAGs.
* **The Sovereign Bridge:** Ensures sensitive data is consumed passively, never leaving the inhabitant's physical control.
