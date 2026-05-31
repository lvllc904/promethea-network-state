# Hybrid Architecture: Bridging Web2 to Web4

**Goal:** Create a unified system that serves legacy users (Web2), decentralized users (Web3), and off-grid/mesh users (Web4) without fracturing the codebase.

**1. The Web2 Layer (The Illusion of Centralization)**
*   *Audience:* Users who just want a website. They don't care about wallets, IPFS, or mesh networks.
*   *Mechanism:* The `promethea-frontend` (Next.js) acts as a gateway. It runs in the cloud (GCP) and serves standard HTML/JS.
*   *Data Sync:* When the user interacts, the Next.js backend participates in the CRDT mesh *on their behalf*. It translates standard REST/GraphQL requests into CRDT operations.
*   *Auth:* Traditional Email/Password (via Firebase Auth) or OAuth, mapped to a custodial DID.

**2. The Web3 Layer (The Sovereign Individual)**
*   *Audience:* Users with crypto wallets (Solana/Ethereum) who want self-custody and verifiable actions.
*   *Mechanism:* The user connects a wallet (Phantom/MetaMask) to the Next.js frontend.
*   *Data Sync:* The frontend application runs the CRDT engine directly in the browser (IndexedDB). It syncs with the network via WebSockets (connecting to a relay node).
*   *Auth:* Cryptographic signature (SIWE/SIWS). The wallet *is* the DID.

**3. The Web4 Layer (The Off-Grid Mesh)**
*   *Audience:* Displaced teams, physical sovereign nodes, users in denied environments.
*   *Mechanism:* The user runs a local instance of the application (e.g., a bundled Electron app, a local Docker container, or a PWA installed offline).
*   *Data Sync:* The local application runs the CRDT engine. It syncs via local WebRTC, Bluetooth, or Delay-Tolerant Network (DTN) protocols (like LoRaWAN or intermittent satellite bursts) with other local peers. When any peer finds internet, it bridges the local mesh to the global mesh.
*   *Auth:* Pure local DID management (DepthOS).

**The Unifying Thread: The CRDT Substrate**
The core innovation is that the *data layer* is identical across all three tiers. Whether the CRDT document is being edited by a cloud server (Web2), a browser tab (Web3), or a phone in the woods (Web4), it's the exact same mathematical structure.

**Implementation Steps (The Bridge):**
1.  **Select CRDT Engine:** Adopt `Yjs` or `Automerge`. Both support browser, Node.js, and offline capabilities.
2.  **Abstract Data Access:** Create a unified `DataProvider` interface in the React app.
    *   If Web2 mode: `DataProvider` calls Next.js API routes.
    *   If Web3 mode: `DataProvider` connects to a WebSocket relay.
    *   If Web4 mode: `DataProvider` listens to WebRTC/Local network channels.
3.  **The Relay Node:** Deploy a lightweight "Gossip Server" (a WebRTC signaling server + WebSocket relay) that bridges the cloud, browsers, and intermittent local meshes.
