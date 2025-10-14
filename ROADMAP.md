
# Promethea Network State - Technical Roadmap

This document outlines the phased technical roadmap for building the Promethea application, from its current state as a UI/Firebase prototype to a fully decentralized, AI-integrated network state platform.

---

### Current Initiative: Enabling Hybrid Deployment (Firebase + IPFS)

**Objective:** To configure the Promethea application to support two distinct deployment targets from a single codebase, laying the groundwork for the "3 Body System" architecture.

1.  **Dynamic Host (The Ledger):** A server-backed application deployed to **Firebase Hosting** at `lvhllc.org`.
2.  **Decentralized Host (The Sovereign Client):** A static, decentralized version of the application, ready for deployment to **IPFS** and accessible via a subdomain like `dweb.lvhllc.org`.

**Implementation Plan:**

*   **Phase 1: Implement Build & Export Configuration (AI Action - In Progress)**
    *   **Modify `next.config.ts`:** Add `output: 'export'` configuration and adjust image optimization settings for static builds.
    *   **Update `package.json`:** Add an `export` script to generate the static site output.

*   **Phase 2: Deploy to IPFS & Configure DNS (User Action - Next Up)**
    *   Run `npm run export` to generate the static `/out` directory.
    *   Upload the `/out` directory to an IPFS pinning service to get a Content ID (CID).
    *   Create a `TXT` record in Cloudflare for `_dnslink.dweb` to point to the new IPFS CID.

*   **Phase 3: Evolve Architecture (Future Work)**
    *   Implement logic for the static site to make secure API calls back to the dynamic `lvhllc.org` backend for any state-changing operations, fully realizing the client/server separation.

---

### Phase 1: Foundational MVP & Decentralized Identity (Current Phase)

**Objective:** Architect and implement the foundational "3 Body System" for decentralized identity. Decouple the core UI from a centralized user profile model and connect it to a client-side, self-sovereign identity (SSI) structure, verified by a public ledger of actions.

**Key Technologies:** Next.js, Firebase (as a Ledger of Record), ShadCN UI, Tailwind CSS, Ethers.js

**Steps:**
1.  **Architect the 3 Body System:**
    - [x] **Identity Genesis Database:** Define the role of the authenticator application for one-time identity creation.
    - [x] **Sovereign Data Store (DepthOS):** Define the principle of local-first user data, where the citizen's device holds their private keys and the canonical copy of their dynamic credentials.
    - [x] **Ledger of Record (Firebase):** Redefine Firestore's role to be an immutable ledger of actions and a security checkpoint for the "last verified state" of a citizen's scores, preventing tampering.

2.  **Implement the Self-Sovereign Identity (SSI) Model:**
    - [x] Define the structure of the SSI token, including the static DID anchor and the dynamic credentials (Reputation, Contribution, and Skills scores) as outlined in Appendix D.
    - [x] **Implement True Cryptographic Login:** Overhauled the login system to use a secure, encrypted keystore file (`ethers.js`) instead of a password, proving identity through cryptographic ownership.
    - [ ] **Decouple UI from Firestore Profiles:** Refactor pages like the Passport and Dashboard to read user data from a local-first provider (`useLocalCitizen` hook) instead of directly from a Firestore document.
    - [ ] **Implement the "Trustless Handshake":** Develop the logic where actions initiated from the client-side are signed, sent to the Ledger of Record for verification against the last known state, and then recorded, with the new state being attested back to the client.

3.  **Connect Core Governance and Asset Modules:**
    - [ ] Ensure the Governance module (creating/voting on proposals) and Asset module (applying for tasks) correctly use the new SSI model for actions. All on-chain actions will be linked to a citizen's DID, not a user profile document.
    - [ ] Ensure all read/write operations use the appropriate hooks, now re-purposed to interact with the Ledger of Record for public data and actions.

---

### Phase 2: AI Integration & Smart Tooling

**Objective:** Integrate the Genkit AI flows into the application to provide intelligent, assistive features for governance, security, and task management, leveraging the decentralized identity system.

**Key Technologies:** Genkit, Google AI (Gemini)

**Steps:**
1.  **Executable Constitution Framework (In Progress):**
    - [ ] **Establish Canonical Constitution:** Store the full text of the Promethean whitepaper in a dedicated Firestore document, serving as the version-controlled, canonical source of truth for the Constitution.
    - [ ] **Live Constitution Page:** Create a new `/dashboard/constitution` page that reads and displays the content directly from the canonical Firestore document.
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
    - [ ] Enhance the `initiateCommunityVote` tool to create a new, high-priority proposal on the Ledger of Record.
    - [ ] Create a live dashboard or real-time alert system that feeds data into the tool for continuous monitoring of the action ledger.

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
    - [ ] Refactor UI components to interact with the new smart contracts instead of the Firebase Ledger for core operations (voting, creating proposals, viewing token balances).

3.  **Decentralized Storage (IPFS):**
    - [ ] Migrate proposal descriptions, RWA documentation, and other large metadata from the Firebase Ledger to IPFS.
    - [ ] Store only the IPFS content hash (CID) in the smart contracts or remaining Firestore documents.
    - [ ] Set up a pinning service (e.g., Pinata) to ensure data availability.

4.  **Legal & DAO Formation:**
    - [ ] Formalize the Promethean DAC as a legal entity (e.g., Wyoming DAO LLC).
    - [ ] Establish the legal SPV structures for holding real-world assets, managed by the DAO.

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
