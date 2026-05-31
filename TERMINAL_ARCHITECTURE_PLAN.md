# Phosphor Terminal Architecture & Monetization Plan

## Overview
The Phosphor Terminal in the Sovereign Mesh serves as the ultimate CLI entry point for citizens to interact with the Promethean Network State (TPNS). To transition from a simulated shell to a fully functioning, extensible environment, we are adopting a **3-Tier Execution Architecture**. This architecture gives citizens ultimate sovereignty over their execution environment while providing scalable, monetized hosted options backed by the Immune System.

## Architecture Tiers

### Tier 1: WebAssembly (WASM) Sandbox (Free Tier)
- **Technology**: `v86` or similar in-browser WASM Linux kernel.
- **Environment**: Boots a lightweight Alpine Linux or JSLinux environment instantly entirely within the client's browser.
- **Capabilities**: Standard CLI tools (`curl`, `python`, `node`), retro games (16-bit arcade titles), and direct local execution without server-side compute costs.
- **Security & Oversight**: Network requests originating from the WASM environment are intercepted and routed through a TPNS proxy/gateway. This ensures the Immune System and Apex can monitor, log, and filter traffic without granting direct host access.
- **Cost Structure**: Free for all citizens. Compute is offloaded to the user's local hardware. Storage is ephemeral by default, with an option to persist a small compressed filesystem state to local browser storage (IndexedDB).

### Tier 2: Hosted Symbiotic Containers (Paid Tier)
- **Technology**: Docker/Podman managed by the `symbiotic-memory-daemon` on TPNS infrastructure.
- **Environment**: Dedicated, persistent Linux containers hosted on TPNS cloud infrastructure.
- **Capabilities**: Persistent storage across sessions, ability to run long-running background processes (e.g., trading bots, continuous AI model tuning, heavy data processing), and seamless WebSocket integration into the browser UI.
- **Security & Oversight**: Containers are strictly isolated within a secure VPC network. The Immune System monitors all stdout/stderr, network I/O, and resource utilization. Honeypot/Diagnostic routing (the "Abyssal Level") remains active for suspicious activity.
- **Cost Structure**: Pay-as-you-go or subscription-based.
    - **Compute Accounting**: Citizens are billed in UVT or fiat based on vCPU seconds, RAM allocation, and persistent disk volume size.
    - **Transparency UI**: The terminal and HUD will feature a real-time "Burn Rate" metric, showing exactly how much capital their container is consuming, broken down by base TPNS infrastructure costs + Sovereign Ecosystem fees.

### Tier 3: Sovereign Self-Hosting (BYO Compute)
- **Technology**: Provided Docker Compose configurations and deployment scripts.
- **Environment**: Citizen hosts the terminal backend on their own hardware (VPS, Raspberry Pi, home server).
- **Capabilities**: Unrestricted root access, full custom package installation, and infinite storage capability constrained only by their physical hardware.
- **Security & Oversight**: While execution is remote, the Phosphor UI connects securely via WebSocket. To participate in TPNS official state transitions (voting, transactions), the self-hosted node must authenticate cryptographic challenges (Proof of Work/Proof of Stake).
- **Cost Structure**: Free (from TPNS). Citizens pay their own external cloud/hardware costs.

## Implementation Steps
1. **WASM Integration**: Implement `v86` in the `PhosphorTerminal` React component to handle Tier 1 routing when the `booting` state resolves.
2. **WebSocket Gateway**: Refine the WebSocket logic in `PhosphorTerminal.tsx` to handle authentication handshakes and route commands to either the local WASM bridge, the hosted container proxy, or a custom user-defined WebSocket URL.
3. **Billing Service**: Integrate container resource monitoring into the `economic-engine` to deduct UVT balances automatically for Tier 2 users.
4. **UI Updates**: Add a "Terminal Configuration" panel to the right-focus tray allowing users to select their active Tier, provision new containers, and view their real-time compute burn rate.
