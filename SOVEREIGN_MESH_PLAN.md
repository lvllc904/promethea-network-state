# The Sovereign Mesh Plan (Web4 Communication Substrate)

## 1. Executive Summary
The Promethean Network State (TPNS) is transitioning its core architecture from a centralized Web2 dependency model (Cloud Servers & REST APIs) to a **Local-First, Multi-Modal CRDT Mesh**. This fulfills the "Sovereign Substrate Mandate," ensuring that the state remains fully operational, resilient, and instantly synchronized across any environment—from high-speed fiber to off-grid Delay-Tolerant Networks (DTNs).

This architecture acts as a "Benevolent Trojan Horse" for global adoption: by providing the world's most resilient offline synchronization engine for free, we weave the Promethean Substrate into the fabric of the global internet.

---

## 2. Core Architectural Pillars

### 2.1 The Data Structure (CRDT)
*   **The Paradigm Shift:** The UI state, user identities, governance votes, and private notes are no longer stored solely in a central SQL/Firebase database. They are mathematically encoded as **Conflict-Free Replicated Data Types (CRDTs)** using `Yjs` or `Automerge`.
*   **Local-First Reality:** Every device running DepthOS or the Promethea PWA holds a local replica of the state. Merges happen perfectly without conflicts, regardless of how long the device has been disconnected.

### 2.2 The Unified Daemon (The Sovereign Router)
A headless background service that acts as an intelligent traffic cop, routing CRDT packets across the most efficient physical layer available.
*   **Sensing:** The daemon constantly monitors active radios (Wi-Fi, Bluetooth, LoRa, Internet).
*   **Tagging:** Packets are tagged with `[Privacy: Encrypted/Cleartext]`, `[Size: Bytes/MB]`, and `[Priority]`.
*   **Dynamic Routing:** 
    *   *High-Speed Internet:* Direct global sync.
    *   *Local Network:* WebRTC / mDNS peer-to-peer gossip.
    *   *Off-Grid Mobile:* Bluetooth Low Energy (BLE) / Wi-Fi Direct.
    *   *Extreme Range (Encrypted):* LoRa / ISM bands.
    *   *Global Emergency (Cleartext):* HAM Radio / APRS / AX.25 networks (strictly for public governance votes and SOS).

### 2.3 The Three Access Tiers
1.  **The Benevolent Pixel (Web2 / Third-Party Integration)**
    *   A single JavaScript `<script>` tag (`mesh.promethea.network/sync.js`).
    *   Organizations embed this to get free offline sync for their apps. In return, their users' browsers silently act as low-bandwidth relay nodes for the global Promethean mesh. No downloads required.
2.  **The Captive Portal (The Cold Start Solution)**
    *   Sovereign Nodes (laptops/phones) broadcast an open "Promethean Lifeline" Wi-Fi signal in blackout zones.
    *   When an uninitiated user connects, a Captive Portal serves the lightweight WASM mesh client directly from the host's hard drive, instantly onboarding them to the mesh without internet or an App Store.
3.  **The Sovereign Client (DepthOS / TPNS PWA)**
    *   The full-fidelity experience for Citizens. Contains the Cartographer proxy for compressed web browsing, local governance modules, and the encrypted private vault.

---

## 3. The Adaptive Brutalist UI (Aesthetic Degradation)

To ensure the heavy Promethea Dashboard remains fully usable over low-bandwidth IoT or HAM radio connections, the UI subscribes to the Daemon's telemetry and dynamically degrades its aesthetic footprint.

*   **Tier 1: The Glassmorphism Citadel (> 1 Mbps)**
    *   *Environment:* Standard Broadband / Starlink.
    *   *Aesthetic:* Full 3D Atlas mapping, translucent aquamarine glass panels, smooth animations, and live data streams.
*   **Tier 2: The 16-Bit Arcade (< 100 Kbps)**
    *   *Environment:* Congested Mesh / Bluetooth Bridges.
    *   *Aesthetic:* Cyberpunk pixel-art styling. Glass panels become flat, blocky windows. Fonts switch to monospaced bitmaps. Includes embedded 10KB WASM mini-games to play while waiting for high-latency syncs to resolve.
*   **Tier 3: The Phosphor Terminal (< 5 Kbps)**
    *   *Environment:* LoRa / HAM Radio (Delay-Tolerant Network).
    *   *Aesthetic:* Classic 1980s mainframe CRT terminal. Pure glowing green/amber text on pitch black. Simulated scanlines. ASCII/ANSI graphics. 
    *   *UX:* Command Line Interface (CLI). Complete elimination of graphical overhead, ensuring critical state data flows perfectly over the slowest connections on Earth.

---

## 4. The Cartographer Proxy (Throttled Internet)
When a citizen is fully off-grid but meshed to a node that has internet access, they can request general web resources (like Wikipedia). The internet-connected node acts as a proxy, stripping all Javascript, CSS, and images, and passing back a hyper-compressed, text-only HTML payload over the mesh.

---

## 5. Protocol Governance and Tasking

To ensure the Sovereign Mesh remains a living, public-good utility that evolves via open-source methods:
*   **The Protocol vs. Application Split:** The core mesh logic (`@promethea/mesh-core`) is maintained as a completely standalone, modular open-source library, fully decoupled from the TPNS UI.
*   **The TPNS Tasking Bridge:** Upgrades and feature requests for the Mesh protocol (e.g., a new LoRa compression adapter) are routed through the standard TPNS 3-Body tasking and proposal system. 
*   **Automated Bounties:** When the community approves an open-source pull request via the TPNS Ledger, the code is merged, and the developer is automatically compensated via the Sovereign Treasury bounty system.

---

## 6. Implementation Roadmap (Phases)

*   **Phase 1: The UI State Sandbox**
    *   Implement `Yjs` strictly for the dashboard layout and theme configuration. Prove that changing a color on an admin panel instantly gossips to all connected browsers without a Next.js server deploy.
*   **Phase 2: The Sovereign Router Daemon**
    *   Abstract the networking logic into a headless Node/Rust daemon that can interface with WebRTC and local networking protocols.
*   **Phase 3: The Adaptive UI Engine**
    *   Build the React Context providers that listen to the Daemon's bandwidth telemetry and swap the global CSS themes between Citadel, 16-Bit, and Phosphor.
*   **Phase 4: The Benevolent Pixel SDK**
    *   Package the sync logic into a standalone CDN-hosted JavaScript file for external organizational use.
*   **Phase 5: The IoT / LoRa Physical Bridge**
    *   Integrate the Daemon with serial ports to communicate directly with TNCs (Terminal Node Controllers) and LoRa radio hats.

---

## 7. Testing Methodology: The Delay-Tolerant Blackout Scenario

To verify the core CRDT mesh physics before global deployment, all protocol updates will be tested locally using a **Laptop/Cell Phone Blackout Simulation**.

1.  **The Local Mesh:** The development server is exposed to the local Wi-Fi router (e.g., `192.168.x.x`). The citizen opens the app on both their Laptop (the active node) and their Cell Phone (the remote node). Both download the CRDT engine and establish a local WebRTC peer-to-peer connection.
2.  **The Severance:** The Cell Phone is placed into Airplane Mode, fully disconnecting it from all networks.
3.  **The Offline Interaction:**
    *   *UI State:* The citizen changes the theme to "16-Bit Retro" on the disconnected phone.
    *   *Agentic Comm:* The citizen sends an AI prompt to Promethea (e.g., "What is the Treasury balance?").
    *   *Result:* The local CRDT engine queues both deltas seamlessly without crashing.
4.  **The Reconnection & Gossip:** The Cell Phone reconnects to Wi-Fi. The background daemon instantly discovers the Laptop and gossips the queued CRDT deltas across the room.
5.  **The Proxy Verification:** 
    *   The Laptop's UI snaps to "16-Bit Retro". 
    *   The Laptop (acting as the internet proxy) catches the queued AI prompt, routes it to the Gemini API, and gossips Promethea's response back to the phone. 
This scenario proves that both application state and agentic reasoning survive complete network severance via Delay-Tolerant Networking.
