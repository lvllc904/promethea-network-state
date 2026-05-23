# Autonomous Proof-of-Work Oracle & Biological PoW Plan

## Executive Summary
This document outlines the architectural implementation of the **Autonomous Proof-of-Work Oracle**—an AI-driven economic engine designed to algorithmically convert human labor (both digital and physical) into universally verifiable equity (UVT). It also establishes the "State-as-a-Service" (SaaS) model, allowing external organizations to utilize Promethea's valuation matrix, and introduces **Biological Proof-of-Work**, linking real-world kinetic labor to cryptographic hash power.

---

## 1. The Autonomous Evaluation Pipeline (Digital Labor)

### 1.1 Webhook & Trigger Mechanism
*   **Ingestion:** The system connects directly to GitHub (or other VCS) via webhooks. Upon a `pull_request.merged` event on the `main` branch, the oracle is triggered.
*   **Context Aggregation:** The engine pulls the full code diff, PR description, linked issues, and any associated discussion threads.

### 1.2 The AI Auditor (Promethea's Valuation Matrix)
Instead of relying on easily gamable metrics like lines of code (LOC), the AI auditor performs deep semantic analysis across multiple vectors:
*   **Impact/Blast Radius:** Determines whether the contribution affects core stable infrastructure (Core) or experimental fluid features (Fluid).
*   **Complexity & Execution:** Evaluates the mathematical/architectural ceiling of the problem and the execution quality.
*   **Security & Stability:** Rewards patches for vulnerabilities or improvements to test coverage and overall robustness.

### 1.3 The Elegance Multiplier (Solving the Cobra Effect)
To prevent metric gaming (e.g., writing bloated code for more equity), the system employs an **Elegance Multiplier**:
*   The AI determines the "minimum viable complexity" for a given task.
*   If a developer achieves the goal with high elegance (e.g., refactoring and *deleting* redundant code), their base UVT reward is multiplied.
*   Complexity is only rewarded when the problem's nature inherently demands it, keeping the codebase hyper-optimized.

### 1.4 UVT Minting & Ledger Synchronization
*   Once a valuation score is established, the exact UVT amount is calculated.
*   A transaction is automatically broadcast to the **Sovereign Ledger**: `"Minted X UVT to Wallet Y for PR #Z"`.
*   The user's dashboard is instantly updated, reflecting their newly acquired "Sweat Equity" and increased governance power.

---

## 2. Biological Proof-of-Work (Physical Labor)

### 2.1 The Concept
Traditional blockchains use computational heat as Proof-of-Work. TPNS introduces **Biological Proof-of-Work**, converting verified physical human labor (e.g., community building, infrastructure maintenance, agricultural labor) into cryptographic equity.

### 2.2 The Oracle Problem & Verification
To ensure physical labor is verifiable without centralized human managers, the network utilizes:
*   **DepthOS 3D Spatial Scans:** Before-and-after spatial mapping (e.g., using LiDAR) to mathematically prove physical state changes (like constructing a solar array).
*   **IoT & Telemetry:** Sensor data (environmental, structural) verifying the outcome of the physical labor.
*   **Geofenced Media:** Cryptographically signed and location-locked media as secondary evidence.

### 2.3 Integration with the Ledger
Once verified by the multi-modal AI auditor, the physical labor is processed through the same valuation matrix as digital labor, yielding UVT and updating the cap table.

---

## 3. State-as-a-Service (DAO-in-a-Box)

### 3.1 The Cartographer / DepthOS Bridge
*   The Autonomous PoW Oracle will be packaged as a middleware service (`@promethea/shadow-gate` or via Cartographer) available to external DAOs, startups, and open-source projects.
*   **Generous Free Tier:** External projects can use the engine to analyze a limited number of PRs per month to generate a "Suggested Equity/Value Allocation" report.
*   **Monetization & Network Tax:** If organizations want to *mint* the actual tokens on the Sovereign Ledger or use TPNS's automated legal structuring, a small network fee (1-3%) is applied, directly feeding the global TPNS Treasury.

### 3.2 Impact
By providing the ultimate, unbiased AI arbiter for "Sweat Equity Valuation," TPNS positions itself as the standard physics engine for decentralized labor evaluation globally.

---

## 4. The Omni-Identity (Fragmented Labor Tracking)

### 4.1 Bridging Platforms via DIDs
Labor occurs across a fractured digital landscape (GitHub, Figma, Jira, Upwork). The oracle unifies this via **Sovereign Identity (SSI/DID)**.
*   **Verifiable Credentials (VCs):** Users perform OAuth handshakes to cryptographically bind external accounts (e.g., `@alice_dev` on GitHub) to their core Promethean DID (`did:prmth:alice123`).
*   **The Omnichannel Oracle API:** Instead of just webhooks, the AI Auditor exposes a universal `/api/v1/oracle/labor-event` endpoint. Any platform or community-built extension can push event payloads here.
*   **Unified Valuation:** Regardless of the platform where the labor occurred, the AI evaluates the commit/design/task, maps it to the core DID, and routes the generated UVT directly to the single Sovereign Wallet.

---

## 5. Multi-Modal PoW & The Omni-Metric

### 5.1 The Cryptographic Chain of Evidence
Biological PoW requires a combination of objective sensor data and subjective human context.
*   **Temporal Anchoring:** Photos, videos, and audio logs are cryptographically signed by the user's DID, locking metadata (time, GPS, device hash) on-chain.
*   **The Triad of Proof:** Submissions follow a "Before/During/After" chronological sequence to irrefutably prove state change (kinetic labor).

### 5.2 The Unified Biological PoW Score (UB-PoW)
The AI Auditor fuses diverse data streams into a single valuation metric:
*   **Sensor Weight (40%):** Objective mathematical proof of physical change (IoT telemetry, LiDAR scans).
*   **Media Weight (30%):** Visual/Contextual verification of quality via photos and videos.
*   **Cognitive Weight (30%):** Strategic reasoning extracted via transcribed audio logs or written reports.
The engine processes these weighted inputs through the Elegance Multiplier to output the exact UVT issuance. Ambiguous submissions are routed to a decentralized Jury of highly-ranked TPNS citizens for manual resolution, further training the AI.

---

## 6. Time-Locked Preference & Conviction Power

### 6.1 Programmable Vesting Curves
Users hold absolute sovereignty over their liquidity extraction timelines. They define their own vesting curves from 1 day to multiple years.
*   **High Velocity (Day Laborer):** Short intervals (e.g., 1 Day) provide immediate liquidity for survival needs, receiving the base 1.0x value of the labor.
*   **Low Velocity (The Believer):** Long intervals (e.g., 3 Years) lock UVT into the Sovereign Ledger. The protocol algorithmically rewards this "Patience Premium" with yield multipliers (e.g., 1.5x UVT generation).

### 6.2 The Trigger: Locking Capital as Voting
The act of locking liquidity is inherently the ultimate act of voting.
*   **Implicit Enfranchisement:** When a user time-locks their UVT, the Sovereign Ledger automatically flags their DID as an "Active Elector" and mints proportional **Conviction Power** (e.g., `veUVT` - vote-escrowed UVT).
*   **Solving the Capital vs. Labor Dilemma:** This bridges the gap between active labor (Proof-of-Work) and stored labor/capital (Proof-of-Stake). A silent stakeholder (a founder or massive investor) who is no longer writing code must time-lock their capital to retain a powerful voice, trading liquidity for authority.
*   **Quadratic Voting:** To prevent plutocracy, voting power scales quadratically. This ensures a unified group of active workers can outvote a single massive silent whale, maintaining a perfectly balanced, multi-dimensional Republic.

### 6.3 Integration with the 3-Body System
*   **Experience Layer (UI):** Dashboards separate "Liquid Balance" from "Conviction Power." Time-locking instantly spikes Conviction Power, unlocking the Governance/Will pillars.
*   **Protocol Layer (Auth):** The Guardian Gateway and JWTs now carry "Conviction Claims," allowing the system to know not just *who* the user is, but *how deeply invested* they are in the current timeline.
*   **Sovereignty Layer (Ledger):** The time-locks and voting multipliers are executed as immutable cryptographic contracts at the lowest substrate level (`pro-forma.db`), ensuring absolute integrity.
