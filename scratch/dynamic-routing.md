# The Sovereign Router: Dynamic Multi-Modal Mesh

## The Concept
A "Sensing Component" that dynamically routes data across different physical layers (Internet, Wi-Fi, LoRa, HAM) based on payload characteristics, network availability, and legal/ethical constraints.

## The Routing Matrix
Data packets are tagged with metadata defining their requirements:
1. **Privacy:** `[Encrypted | Cleartext]`
2. **Priority:** `[Critical | Normal | Background]`
3. **Payload Size:** `[Bytes | Kilobytes | Megabytes]`

## The Sensing Component (The Daemon)
The local mesh daemon continuously monitors available physical interfaces:
- **Interface A:** High-Speed Internet (Fiber/Starlink) -> *Status: DOWN*
- **Interface B:** Local Wi-Fi Direct -> *Status: ACTIVE (Peers: 3)*
- **Interface C:** LoRa (ISM Band) -> *Status: ACTIVE*
- **Interface D:** HAM (APRS) -> *Status: ACTIVE*

## The Routing Logic
When the application attempts to send data, the daemon evaluates the tags against the active interfaces:

*   **Scenario 1: Large Encrypted File (10MB Vault Sync)**
    *   *Rule:* Encrypted data cannot go over HAM. 10MB is too large for LoRa.
    *   *Action:* The daemon routes the data to **Interface B (Local Wi-Fi)** if the target peer is nearby. If not, it holds the packet in the "Delay-Tolerant Queue" until **Interface A (Internet)** comes back online.

*   **Scenario 2: Critical Public Governance Vote (50 Bytes)**
    *   *Rule:* Cleartext is allowed on HAM. 50 bytes fits on LoRa and HAM.
    *   *Action:* The daemon broadcasts the packet simultaneously over **Interface C (LoRa)** and **Interface D (HAM)** to ensure maximum survivability and reach to the nearest global gateway.

*   **Scenario 3: Standard Dashboard Interaction (Internet Available)**
    *   *Rule:* Normal operation.
    *   *Action:* All traffic routes over **Interface A (Internet)** for maximum speed.

## General Internet Access over the Mesh?
Can we provide general internet browsing (e.g., loading Wikipedia or watching a video) over the mesh?
*   *Yes, but heavily throttled.* If a user has no internet but connects to a node that does, the daemon acts as a proxy.
*   *The Catch:* To protect the network, the daemon limits general web traffic to text-only or heavily compressed versions of websites (using the Promethea Cartographer synthesis engine) unless a high-bandwidth connection (like point-to-point Wi-Fi to a Starlink node) is established.
