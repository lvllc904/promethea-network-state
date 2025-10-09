# Promethea Network State - Technical Roadmap

This document outlines the phased technical roadmap for building the Promethea application, from its current state as a UI/Firebase prototype to a fully decentralized, AI-integrated network state platform.

---

### Phase 1: Foundational MVP & Core UI (Current Phase)

**Objective:** Solidify the core application, connect all UI components to a live Firebase backend, and ensure a stable, performant user experience. This phase focuses on building a fully functional centralized application.

**Key Technologies:** Next.js, Firebase (Auth, Firestore), ShadCN UI, Tailwind CSS

**Steps:**
1.  **Firebase Backend Integration:**
    - [x] Connect all pages (Dashboard, Governance, Assets, Ledger, Passport) to live Firestore collections.
    - [ ] Implement user-specific data queries for "My Reputation," "My Contribution," and "My Recent Contributions."
    - [ ] Finalize the data models in `backend.json` to match the UI perfectly.
    - [ ] Ensure all read/write operations use the provided Firebase hooks (`useDoc`, `useCollection`).

2.  **Authentication & User Passport:**
    - [ ] Implement a full authentication flow (Sign Up, Login, Logout) using Firebase Auth.
    - [ ] Connect the Passport page to the logged-in user's data in the `citizens` collection.
    - [ ] Implement a "Create Passport" flow for new users to initialize their citizen profile in Firestore.

3.  **Governance Module:**
    - [ ] Implement the "Create New Proposal" functionality, writing new proposals to the `proposals` collection.
    - [ ] Implement the "Vote" functionality on the proposal detail page, writing votes to the `votes` collection.
    - [ ] Ensure vote counts and proposal statuses update in real-time.

4.  **RWA & Task Management:**
    - [ ] Implement the "Apply" for task functionality on the asset detail page.
    - [ ] Develop an admin view or mechanism to update task statuses (e.g., 'In Progress', 'Completed').
    - [ ] Award UVT (create `universal_value_tokens` documents) upon task completion.

5.  **Code Cleanup & Refinement:**
    - [ ] Remove all placeholder/mock data from components.
    - [ ] Refactor any large components for better readability and performance.
    - [ ] Add comprehensive error handling for all data-fetching and mutation operations.

---

### Phase 2: AI Integration & Smart Tooling

**Objective:** Integrate the Genkit AI flows into the application to provide intelligent, assistive features for governance, security, and task management.

**Key Technologies:** Genkit, Google AI (Gemini)

**Steps:**
1.  **Ethical Proposal Refinement:**
    - [x] UI for the Ethical Refinement Tool is complete.
    - [x] Genkit flow `refineProposal` is defined.
    - [ ] Connect the "Full Description" field from the "Create Proposal" form to the AI tool to allow real-time refinement before submission.

2.  **AI Labor Allocation:**
    - [x] UI for the Task Allocation Tool is complete.
    - [x] Genkit flow `allocateRWATasks` is defined.
    - [ ] Enhance the `allocateRWATasks` flow to query the live `citizens` collection in Firestore (via a tool) to analyze skills and reputation for better suggestions.
    - [ ] Implement the "Assign" functionality to update the `assigneeId` on a task document in Firestore.

3.  **Community Immune System:**
    - [x] UI for the Threat Detector is complete.
    - [x] Genkit flow `detectNetworkThreats` is defined.
    - [ ] Enhance the `initiateCommunityVote` tool to create a new, high-priority proposal in the `proposals` collection in Firestore.
    - [ ] Create a live dashboard or real-time alert system (using Firestore listeners) that feeds data into the tool for continuous monitoring.

---

### Phase 3: Decentralization & Smart Contracts

**Objective:** Transition core logic from the centralized Firebase backend to decentralized technologies, including smart contracts for governance and tokenization, and decentralized storage for data.

**Key Technologies:** Ethereum (Layer-2, e.g., Arbitrum/Optimism), Solidity, IPFS, Ethers.js

**Steps:**
1.  **Smart Contract Development (Solidity):**
    - [ ] **UVT Contract:** Develop an ERC-1155 (or similar) contract for Universal Value Tokens (Labor, Capital, Reputation).
    - [ ] **Governance Contract:** Develop a contract to manage proposals and voting, using the weighted `Voice` calculation (Reputation, Contribution, Personhood).
    - [ ] **Treasury Contract:** Create a contract to hold and manage DAC funds and distribute profits from RWAs.
    - [ ] **RWA Tokenization:** Develop contracts for fractional ownership of Real-World Assets.

2.  **Web3 Integration (Frontend):**
    - [ ] Integrate a wallet connection library (e.g., RainbowKit, Wagmi) to manage user wallets.
    - [ ] Replace Firebase Auth with wallet-based authentication (Sign-In with Ethereum).
    - [ ] Refactor UI components to interact with the new smart contracts instead of Firestore for core operations (voting, creating proposals, viewing token balances).

3.  **Decentralized Storage (IPFS):**
    - [ ] Migrate proposal descriptions, RWA documentation, and other large metadata from Firestore to IPFS.
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
