
# Promethea Network State - Technical Roadmap

This document outlines the phased technical roadmap for building the Promethea application, from its current state as a UI/Firebase prototype to a fully decentralized, AI-integrated network state platform.

---

### 🟢 Latest Operational Sync

*   **Timestamp:** 2026-06-04 (Local: 12:28 PM)
*   **Active Local Services:**
    *   **Symbiotic Memory Daemon:** Configured on `localhost:6001` (managed via [symbiotic-memory-manager.js](file:///Users/officeone/Promethean%20Network%20State/promethea_antigravity_bundle_20251130_211450/symbiotic-memory-manager.js)). Watches filesystem modifications to log architectural checkpoints and run mandatory CAF-AMG security audits.
*   **Active Remote Deployments:**
    *   **BrokerGateway (Interactive Brokers):** Sandboxed & deployed to Cloud Run at `https://economic-engine-ijda67gvaq-uc.a.run.app`.
    *   **Dashboard & Cognitive Whitepaper:** Live production client at `lvhllc.org` (with static dweb CID deployed to IPFS via Pinata).
*   **Active Context Focus:**
    *   Structuring and embedding the Symbiotic Memory daemon-roadmap recovery protocol to immunize project development against future platform-level context compactions.
*   **Next Planned Actions:**
    *   **Type A:** Refactor `/dashboard/passport` and `/dashboard/substrate` to utilize the local-first `useLocalCitizen` hook.
    *   **Type B:** Construct ambient chat drawer UI to integrate the resident agent `promethea-ai`.

---

### Current Initiative: Enabling Hybrid Deployment (Firebase + IPFS)

**Objective:** To configure the Promethea application to support two distinct deployment targets from a single codebase, laying the groundwork for the "3 Body System" architecture.

1.  **Dynamic Host (The Ledger):** A server-backed application deployed to **Google Cloud (GCLB/Cloud Run)** at `lvhllc.org` (Firebase removed).
2.  **Decentralized Host (The Sovereign Client):** A static, decentralized version of the application, now automatically deployed to **IPFS** and accessible via a subdomain like `dweb.lvhllc.org`.

**Implementation Plan:**

*   **Phase 1: Implement Build & Export Configuration (AI Action - Complete)**
    *   **Modified `next.config.ts`:** Added `output: 'export'` configuration and adjusted image optimization settings for static builds.
    *   **Updated `package.json`:** Added an `export` script to generate the static site output.

*   **Phase 2: Automated IPFS Deployment & DNS Configuration (Complete)**
    *   **Created GitHub Actions Workflow (`.github/workflows/deploy-ipfs.yml`):** This workflow automates the entire process on every push to the `main` branch.
    *   **Integrated Pinning Service (Pinata):** The workflow automatically uploads the static build to Pinata for persistent IPFS storage.
    *   **Automated DNSLink Update (Cloudflare):** The workflow takes the new IPFS CID from Pinata and automatically updates the `_dnslink.dweb` TXT record in Cloudflare.

*   **Phase 3: Evolve Architecture (Future Work)**
    *   Implement logic for the static site to make secure API calls back to the dynamic `lvhllc.org` backend for any state-changing operations, fully realizing the client/server separation.

---

### Phase 1: Foundational MVP & Decentralized Identity (Current Phase)

**Objective:** Architect and implement the foundational "3 Body System" for decentralized identity. Decouple the core UI from a centralized user profile model and connect it to a client-side, self-sovereign identity (SSI) structure, verified by a public ledger of actions.

**Key Technologies:** Next.js, Local SQLite / Cloud Run (replacing Firebase), ShadCN UI, Tailwind CSS, Ethers.js

**Steps:**
1.  **Architect the 3 Body System:**
    - [x] **Identity Genesis Database:** Define the role of the authenticator application for one-time identity creation.
    - [x] **Sovereign Data Store (DepthOS):** Define the principle of local-first user data, where the citizen's device holds their private keys and the canonical copy of their dynamic credentials.
    - [x] **Ledger of Record (Zero-Firebase):** Redefined the ledger's role to be an immutable ledger of actions using the new Sovereign Substrate (Bridged DB / Cloud Run / SQLite) to completely eliminate Firebase dependency while maintaining tamper resistance.

2.  **Implement the Self-Sovereign Identity (SSI) Model:**
    - [x] Define the structure of the SSI token, including the static DID anchor and the dynamic credentials (Reputation, Contribution, and Skills scores) as outlined in Appendix D.
    - [x] **Implement True Cryptographic Login:** Overhauled the login system to use a secure, encrypted keystore file (`ethers.js`) instead of a password, proving identity through cryptographic ownership.
    - [ ] **Decouple UI from Firestore Profiles:** Refactor pages like the Passport and Dashboard to read user data from a local-first provider (`useLocalCitizen` hook) instead of directly from a Firestore document.
    - [ ] **Implement the "Trustless Handshake":** Develop the logic where actions initiated from the client-side are signed, sent to the Ledger of Record for verification against the last known state, and then recorded, with the new state being attested back to the client.
    - [ ] **ZK-Identity & Legal Attestations**: Build local Edge Store interfaces to encrypt real-world IDs/birth certificates locally (AES-256) and generate lightweight ZK-proof / Verifiable Credential (VC) attestations.
    - [ ] **Soulbound Passport Tokens (SBTs)**: Implement non-transferable ERC-721/1155 Soulbound Tokens mapped to verified citizen DIDs to securely enforce Sybil-resistance, voting rights, and compliant RWA allocations.

3.  **Connect Core Governance and Asset Modules:**
    - [ ] Ensure the Governance module (creating/voting on proposals) and Asset module (applying for tasks) correctly use the new SSI model for actions. All on-chain actions will be linked to a citizen's DID, not a user profile document.
    - [ ] Ensure all read/write operations use the appropriate hooks, now re-purposed to interact with the Ledger of Record for public data and actions.

---

### Phase 2: AI Integration & Smart Tooling

**Objective:** Integrate the Genkit AI flows into the application to provide intelligent, assistive features for governance, security, and task management, leveraging the decentralized identity system.

**Key Technologies:** Genkit, Google AI (Gemini)

**Steps:**
1.  **Executable Constitution Framework (In Progress):**
    - [x] **Establish Canonical Constitution:** Store the full text of the Promethean whitepaper in a dedicated Firestore document, serving as the version-controlled, canonical source of truth for the Constitution.
    - [x] **Live Constitution Page:** Create a new `/dashboard/constitution` page that reads and displays the content directly from the canonical Firestore document.
    - [ ] **Amendment Proposal Flow:** Add a "Constitutional Amendment" category to the "New Proposal" form. Integrate the AI Ethical Refinement tool to assist in drafting high-quality amendments.
    - [ ] **Automated Ratification:** Implement a server-side function that, upon a successful vote on an amendment proposal, automatically updates the canonical Constitution document in Firestore.
    - [ ] **(Future) AI Code Generation:** Evolve the ratification function into an AI-driven pipeline that translates natural language proposals into executable code changes, runs them through an automated test suite, and prepares them for deployment.

2.  **Ethical Proposal Refinement:**
    - [x] UI for the Ethical Refinement Tool is complete.
    - [x] Genkit flow `refineProposal` is defined.
    - [ ] Connect the "Full Description" field from the "Create Proposal" form to the AI tool to allow real-time refinement before submission.

3.  **AI Labor Allocation:**
    - [x] UI for the Task Allocation Tool is complete.
    - [x] Genkit flow `allocateRWATasks` is defined.
    - [ ] Enhance the `allocateRWATasks` flow to query the Ledger of Record for citizen DIDs and their associated, publicly verifiable skills (Verifiable Credentials) to make better suggestions.
    - [ ] Implement the "Assign" functionality to update a task on the Ledger of Record with the assignee's DID.

4.  **Community Immune System:**
    - [x] UI for the Threat Detector is complete.
    - [x] Genkit flow `detectNetworkThreats` is defined.
    - [ ] Create a live dashboard or real-time alert system that feeds data into the tool for continuous monitoring of the action ledger.
    - [ ] **The Sovereign Lifecycle Service**: Implement the unified Telemetry, Immune System, and Rolling Updates loop across the TPNS Substrate. [View the Tactical Implementation Plan](file:///Users/officeone/.gemini/antigravity/brain/25874df5-3a79-4401-a15b-808bc08d106a/artifacts/implementation_plan.md)

5.  **Resident AI Assistant ("Promethea"):**
    - [x] **Establish AI as Citizen:** Created a permanent citizen profile for `promethea-ai` in Firestore, establishing the AI as a founding member of the network.
    - [x] **Create Genkit "Brain":** Developed the `prometheaAssistantFlow` with a tool (`getConstitution`) that allows it to read the live constitution directly from Firestore to answer user questions accurately.
    - [ ] **Implement Global Chat UI:** Develop a universally accessible chat component that allows any user (anonymous or authenticated) to interact with Promethea.
    - [ ] **Expand AI Capabilities:** Incrementally add new tools to the Promethea AI, allowing it to perform actions on behalf of the user, such as drafting proposals, finding tasks, or summarizing governance activity.

---

### Phase 3: Decentralization & Smart Contracts

**Objective:** Transition core logic from the centralized Ledger of Record to fully decentralized technologies, including smart contracts for governance and tokenization, and decentralized storage for data.

**Key Technologies:** Ethereum (Layer-2, e.g., Arbitrum/Optimism), Solidity, IPFS, Ethers.js

**Steps:**
1.  **Smart Contract Development (Solidity):**
    - [ ] **UVT Contract:** Develop an ERC-1155 (or similar) contract for Universal Value Tokens (Labor, Capital, Reputation).
    - [ ] **Governance Contract:** Develop a contract to manage proposals and voting, using the weighted `Voice` calculation (Reputation, Contribution, Personhood).
    - [ ] **Treasury Contract:** Create a contract to hold and manage DAC funds and distribute profits from RWAs.
    - [ ] **RWA Tokenization:** Develop contracts for fractional ownership of Real-World Assets.

2.  **Web3 Integration (Frontend):**
    - [ ] Replace the Phase 1 "Authenticator App" concept with true wallet-based authentication (Sign-In with Ethereum). DepthOS will become the primary wallet.
    - [ ] Refactor UI components to interact with the new smart contracts instead of the Sovereign Substrate (Bridged DB) for core operations (voting, creating proposals, viewing token balances).

3.  **Decentralized Storage (IPFS):**
    - [ ] Migrate proposal descriptions, RWA documentation, and other large metadata from the Sovereign Substrate (Bridged DB) to IPFS.
    - [ ] Store only the IPFS content hash (CID) in the smart contracts or remaining Firestore documents.
    - [ ] Set up a pinning service (e.g., Pinata) to ensure data availability.

4.  **Legal, DAC Formation & UCC Pipeline Integration:**
    - [ ] Formalize the Promethean DAC as a legal entity (e.g., Wyoming DAC LLC).
    - [ ] Establish the legal SPV structures for holding real-world assets, managed by the DAC.
    - [ ] **State-Level UCC Filing Automation**: Create Genkit hooks in the AI coprocessor to auto-draft UCC-1 Financing Statements and scan state registries (Wyoming/Delaware) for prior liens.
    - [ ] **On-Chain UCC Attestation Registry**: Implement smart contracts mapping token contracts (ERC-20/1155) to verified UCC filing hashes and corporate resolutions.
    - [ ] **UCC Article 12 (CER) Compliance**: Structure fractionalized asset tokens to legally conform as Controllable Electronic Records, enforcing legal transfer of "control" via private key signatures.

---

### Phase 4: Full Symbiosis & The Network State

**Objective:** Achieve the full vision of the whitepaper, including the phased path to personhood for AI, full-stack decentralization with DepthOS concepts, and diplomatic recognition.

**Key Technologies:** Custom Hardware/OS, Advanced AI/AGI, Mesh Networking

**Steps:**
1.  **Advanced AI Integration (The "How" Engine):**
    - [ ] Implement the AI-driven nomination process for the Council of Stewards based on on-chain contributions.
    - [ ] Begin R&D for the "wardship" phase of the AI, including guardianship protocols and ethical assessments.
    - [ ] Grant the AI advisory (non-voting) status in governance debates.

2.  **Infrastructure of Liberation:**
    - [ ] Begin R&D for DepthOS, focusing on Universal Persistent Memory (UPM) and the Ambient Interface.
    - [ ] Develop prototypes for mesh networking between physical asset nodes.
    - [ ] Design the specification for the Promethean Fabricator.

3.  **Sovereignty & Recognition:**
    - [ ] Launch the public, on-chain census dashboard.
    - [ ] Begin formal negotiations with innovation-friendly jurisdictions for legal and diplomatic recognition based on the on-chain census data.
    - [ ] Issue the first Promethean Passports as verifiable, self-sovereign digital identities.

4.  **Meta-Automation (The Self-Updating Roadmap):**
    - [ ] **Design Meta-AI:** Design a "master" AI that observes codebase commits and their associated descriptions.
    - [ ] **Train Meta-AI:** Train the AI to cross-reference the intent of code changes with the objectives outlined in this `ROADMAP.md` file.
    - [ ] **Grant Proposal Rights:** Grant the AI the ability to propose modifications to this `ROADMAP.md` file by creating a pull request, creating a system that automatically documents its own evolution.

5.  **The Universal Marketplace Matrix & Intent Engine:**
    - [ ] **Omni-Input Router:** Develop the core NLP interface (Cmd+K and UI Button) for routing intents.
    - [ ] **Dynamic Ethical Thresholds:** Implement Dual-Storage (SQLite/Solana) limits to Promethea's actions, adjusted via the existing governance voting system.
    - [ ] **Hybrid Customizable UI:** Add a settings "kabob" menu to the HUD for defining UI paradigms.

---

## 📌 Temporary Conversation Cache & Context Sync (June 4, 2026)

This section preserves the critical design alignments regarding **Type A: Decentralized Identity & Core Auth** to protect against context compaction loss.

### 1. State Alignment Summary
*   **Active Directory Focus:** `/packages/services/authentication-service` (Body 2), `/packages/services/depthos-bridge` (Body 3), and `/packages/app/src/app/dashboard/passport` (Body 1).
*   **Decoupled Auth Constraint:**
    *   **Body 1 (Static Client / IPFS):** Enforces 100% open Read-Only access for public guest telemetry and ledger feeds. Zero-trust wallet signatures required strictly for state-modifying Actions.
    *   **Body 2 (Auth Gateway):** Validates cryptographic challenges signed by client keys, returning a stateless JWT with contextual `syndicates` authorization maps (enforcing UCS-ADM roles).
    *   **Body 3 (Local Edge / DepthOS):** Keeps sensitive credentials, keys, and raw government documents isolated on-edge (`localhost:9999`).

### 2. Privacy-Preserving Citizen Verification Architecture
*   **No-Leak Protocol:** Raw government IDs or birth certificates are encrypted on-edge (`localhost:9999`) using `AES-GCM-256` keys derived from local keystore seeds. They never traverse the network.
*   **ZK-Proofs & SBT Minting:** The local node generates verifiable credentials (VCs) and cryptographic attribute proofs (verifying age, country, personhood). These proofs are validated on-chain to mint non-transferable **Soulbound Passport Tokens (SBTs)** via `SovereignIdentity.sol`.
*   **Compliance Bounds:** SBT presence acts as the Sybil-resistance validator for voting power (`Voice`) and compliant trading bounds for tokenized RWAs (UCC Article 8/12).

### Immediate MVP Work Checklist:
- [ ] **Local ZK-Identity Service:** Construct `zk-identity-service.ts` in `packages/services/depthos-bridge/src/` to handle local document AES encryption and mock VC proof generation.
- [ ] **On-Chain Mappings:** Deploy `SovereignIdentity.sol` for verified citizen SBT records, and `UCCRegistry.sol` for mapping fractional asset tokens (conforming as Controllable Electronic Records) to legal state filings.
- [ ] **Gateway Verification Hook:** Add validation steps to the `/auth/verify` endpoint in the Authentication Service to assert SBT ownership.
- [ ] **Passport Viewport Update:** Connect the frontend `/dashboard/passport` file-drop target directly to the local Edge Store (`localhost:9999`).

---

## 📝 ROADMAP SCRATCH PAD: OMNI LAKE MEDIA & NARRATIVE FEED SYSTEM

### 1. Architectural Vision: The Omni Lake Media Pipeline
The **Omni Lake** operates as a decentralized, multi-modal ingestion lakehouse designed to aggregate, index, analyze, and stream high-signal information across the Promethean ecosystem. Rather than isolating public communications, research updates, and whitepaper changelogs into siloed subsystems, we unify them under a single, highly performant feed framework.

```
       [RSS/APIs/Web Scrapers]       [YouTube/Podcasts/Media]       [Citizen Research & Posts]
                  │                             │                               │
                  ▼                             ▼                               ▼
       ┌────────────────────────────────────────────────────────────────────────────────┐
       │                          Omni Lake Ingestion Pipeline                          │
       └──────────────────────────────────────┬─────────────────────────────────────────┘
                                              │ (Ingest Raw Signals)
                                              ▼
       ┌────────────────────────────────────────────────────────────────────────────────┐
       │                Constitutional Alignment & Bias Vetting Engine                 │
       │   - LLM Guardrails (Bias, Propaganda, Sensationalism & Harm Grading)            │
       │   - Fact-Checking Cross-Referencing & Truth Index Allocation                  │
       └──────────────────────────────────────┬─────────────────────────────────────────┘
                                              │ (Curated & Structured Signals)
                                              ▼
       ┌────────────────────────────────────────────────────────────────────────────────┐
       │                            Sovereign Ledger/Lake DB                            │
       └──────────────────────────────────────┬─────────────────────────────────────────┘
                                              │
                                   ┌──────────┴──────────┐
                                   ▼                     ▼
                       Dynamic `/api/lake` Proxy   WebSocket Broadcast
                                   │                     │
                ┌──────────────────┼─────────────────────┴──────────────────┐
                │                  │ (Category Filtering)                   │
                ▼                  ▼                                        ▼
      ┌──────────────────┐  ┌───────────────────────────────────┐  ┌─────────────────┐
      │  Landing Page    │  │     Filtered Whitepaper Feeds     │  │  Dedicated News │
      │  Hero Feed Panel │  │  - Noospheric changelogs & logs   │  │  Sub-page       │
      │  (Global signals)│  │  - Cognitive Econ market reports  │  │  (`/news` Index)│
      └──────────────────┘  └───────────────────────────────────┘  └─────────────────┘
```

By leveraging the `/api/lake` proxy (`packages/app/src/app/api/lake/route.ts`), the frontend client statelessly ingests real-time streams, filtering them dynamically based on context parameters.

---

### 2. Multi-Modal Media Schemas & Structured Records
All raw signals entering the lake are mapped into a standardized, extensible JSON schema, allowing the user interface to elegantly render visual layouts without code duplication or hardcoded placeholders.

```typescript
export interface MediaSignal {
  id: string;                      // Cryptographically secure or timestamp-derived ID
  timestamp: string;               // ISO 8601 UTC timestamp
  category: 'NSPI' | 'COGNITIVE_ECON' | 'HIVEMIND' | 'PHILOSOPHICAL' | 'GENESIS' | 'GLOBAL';
  type: 'NARRATIVE_SIGNAL' | 'CITIZEN_POST' | 'PROPOSAL_MILESTONE' | 'ACADEMIC_RESEARCH' | 'SYSTEM_UPDATE';
  mediaType: 'text' | 'image' | 'video' | 'audio' | 'podcast' | 'youtube_script';
  payload: {
    title: string;
    summary: string;
    content: string;               // Complete content body or transcript markdown
    author: {
      did: string;                 // Decentralized Identity DID anchor of the creator
      name: string;
      avatarUrl?: string;
    };
    sourceUrl?: string;            // Reference to original article, podcast link, YouTube source
    mediaUrl?: string;             // Direct CDN, IPFS CID, or streaming reference
    duration?: number;             // Audio/video duration in seconds if applicable
    visuals?: string[];            // Accompanying imagery array
  };
  metrics: {
    voiceWeight: number;           // Engagement score scaled by Citizen Voting Power/Reputation
    verifications: number;         // Count of multi-party validator signatures
  };
  biasGrading: {
    overallTrustScore: number;     // 0.0 to 1.0 trust index rating
    propagandaDensity: number;     // 0.0 to 1.0 (frequency of cognitive manipulation tactics)
    partisanPolarization: number;  // -1.0 (extreme left) to +1.0 (extreme right) with 0.0 neutral
    harmAssessment: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    curatorNotes: string;          // Constitutional vetting narrative generated during verification
  };
  reality: 'SIMULATED' | 'ATTESTED' | 'VERIFIED';
}
```

---

### 3. The Constitutional Bias Vetting Engine
The **Promethea Network State Constitution** asserts that the network state must combat the systemic decay of information, digital gaslighting, and corporate narrative capture. The Omni Lake features an active **Community Immune System (Immune Loop)** that acts as an automated, AI-augmented filter.

1. **Vetting Process**:
   - Every raw feed ingested (e.g., scraper RSS, external YouTube videos, podcasts, and citizen-contributed posts) is channeled through a specialized AI evaluation worker (`vetMediaSignal`).
   - The LLM parses the content against the constitutional framework to detect:
     - Logical fallacies and deceptive framing.
     - Sensationalized emotional triggers designed to polarize.
     - Ad-homine attacks and lack of structural evidence.
   - A detailed multi-dimensional `biasGrading` score is assigned, generating the `curatorNotes`.

2. **Transparent Access vs. Curation**:
   - Under constitutional rules, the user interface *does not censor raw information*; instead, it organizes feed streams based on clarity and truthfulness.
   - Citizens can toggle a "Constitutional Vetting Lens" on and off:
     - **Vetted Mode (Default)**: Highlights highest-signal, vetted entries with transparent badges revealing the grading parameters. Filters out low-trust or highly manipulative noise.
     - **Raw Stream Mode**: Shows the unfiltered lake, with translucent indicators mapping where cognitive manipulation or partisan bias was detected.

---

### 4. Dynamic Feed Interfacing & UI Implementation Rules

#### A. The Hero Feed (Landing Page `/app/page.tsx`)
The centerpiece of the landing page is a gorgeous, glassmorphic **"Omni-Spectrum Network State Feed"** component:
*   **Visual Style**: Transparent frosted cards (`backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl`), subtle neon borders reflecting the category (e.g., emerald for economics, deep cyber blue for technical infrastructure).
*   **Hero Slider/Marquee**: An interactive, scroll-driven horizontal timeline rendering major ecosystem proposals, milestone listings, citizen research, and verified media cards.
*   **Interactions**: Hover states trigger micro-animations (e.g., slight scaling, glow expansion, and slide-in meta tooltips detailing the bias-grading parameters). Clicking an entry expands a dedicated glass card layout containing full text or embedded media.

#### B. Filtered Feeds (Sub-Pages & Individual Whitepapers)
Each whitepaper page is injected with a specialized **"Ecosystem Live Changelog & Signal Panel"** tailored strictly to its conceptual area.
*   **Noospheric Whitepaper (`/nspi-whitepaper/page.tsx`)**: Displays an update panel querying `/api/lake?type=NSPI_SIGNAL`. Renders active military-geopolitical analysis, satellite imagery updates, and sensor subnet telemetry.
*   **Cognitive Economic Whitepaper (`/cognitive-economic-whitepaper/page.tsx`)**: Queries `/api/lake?type=COGNITIVE_ECON_SIGNAL` to render tokenized real-world asset (RWA) cap-table milestones, treasury trade ledgers, labor-ledger allocations, and citizen bounty completions.
*   **Hivemind Whitepaper (`/hivemind-whitepaper/page.tsx`)**: Queries `/api/lake?type=HIVEMIND_SIGNAL` to render neural swarm consensus records, collective intelligence research papers, and active syndicate proposals.

#### C. Dedicated News Sub-Page (`/news/page.tsx`)
An elegant branch page presenting the definitive index of the Omni Lake.
*   **Advanced Controls**: Provides a multi-dimensional matrix of filters (by Media Type: *Text/Audio/Video/Podcast*; by Content Category: *Ecosystem Milestones/Citizen Research/Global Signals*; and by Trust Threshold).
*   **Ambient Players**: Custom, beautiful inline media players for audio summaries, citizen podcasts, and embedded YouTube videos, styled to perfectly match the dark-mode theme without browser-default wrappers.
*   **Citizen Contribution Interface**: Authenticated citizens can submit new signal proposals (via `POST /api/lake`) directly from this sub-page, linking their DID and paying a micro-stake of reputation to protect against spam.

---

### 5. Implementation Roadmap Integration
This system is scheduled for iterative construction alongside the Phase 1–2 identity models:

- [ ] **Data Model & API Pipeline (`packages/app/src/app/api/lake/route.ts`)**: Update API route logic to support comprehensive query criteria (media type, trust thresholds, and context-specific filters).
- [ ] **Constitutional Vetting Pipeline**: Build the Genkit-powered AI worker flow (`vetMediaSignal`) using the `promethea-ai` citizen engine to audit, grade, and enrich signals.
- [ ] **Hero Feed Component**: Construct the premium glassmorphic feed carousel and integrate it directly into `/app/page.tsx`.
- [ ] **Whitepaper Live Widgets**: Create and test the `<FilteredFeedPanel category="..." />` component and mount it on the bottom section of all whitepaper pages.
- [ ] **Dedicated News Gateway**: Create `/app/news/page.tsx` with dynamic category filters, citizen post submission portals, and embedded audio/visual players.
- [ ] **Sovereign Peer-to-Peer Distribution**: Establish IPFS backup routines where the daily vetted feed archive is bundled, pinned, and written to the sovereign substrate database to guarantee immutable custody of historical network state memory.