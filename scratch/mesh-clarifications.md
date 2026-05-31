# Sovereign Mesh Clarifications

## IoT Comm Methods
Yes, exactly. To pass data completely off-grid, the Mesh will utilize standard IoT and Delay-Tolerant communication methods.
- **WebRTC/Data Channels:** For peer-to-peer browser connections over local networks (when browsers are on the same Wi-Fi but have no internet).
- **Bluetooth Low Energy (BLE) / Wi-Fi Direct:** For mobile devices (like a PWA or native app) to physically connect to nearby devices in a blackout zone.
- **LoRa / LoRaWAN:** For long-range, low-power text transmission (perfect for the bio-nodes or hardware relays).
The software protocol aggregates these physical layers. It doesn't care *how* the bytes get there, it just uses whatever is available.

## Seamless Connection (How it works in practice)
Yes, it is entirely seamless. There is no "Connect to Mesh" button required.
1. **The Web Browser Node:** A user opens `mesh.promethea.org` or `lvhllc.org` (which has the script installed). The browser automatically executes the script. 
2. **Auto-Discovery:** The script immediately starts scanning for peers. If online, it connects to a lightweight signaling server to find other online nodes. If offline (but on a local network), it uses mDNS or local WebRTC discovery to find other devices on the same network running the app.
3. **The Gossip Begins:** As soon as two nodes discover each other, they automatically shake hands and exchange encrypted CRDT packets. 
The user experience is zero-friction. They open the app, and the background daemon handles all the routing and peer discovery silently.
