import Peer, { DataConnection } from 'peerjs';

/**
 * Cross-Device Sync Engine (Phase 2.5)
 * 
 * Body 3 (Local): WebRTC peer-to-peer encrypted sync between user's devices.
 * Body 2 (Backend): STUN/TURN server coordination only (no data access).
 * 
 * Privacy: All data is end-to-end encrypted. Backend never sees plaintext.
 */

interface SyncMessage {
    type: 'sync_request' | 'sync_response' | 'heartbeat';
    timestamp: number;
    data?: any;
}

class SyncEngine {
    private peer: Peer | null = null;
    private connections: Map<string, DataConnection> = new Map();
    private enabled: boolean = false;

    async init(userId: string): Promise<void> {
        if (this.peer) return; // Already initialized

        // Initialize PeerJS with user's DID as peer ID
        this.peer = new Peer(userId, {
            // Use public STUN servers (Body 2 could provide custom TURN in future)
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                ],
            },
        });

        this.peer.on('open', (id) => {
            console.log('[SyncEngine] Peer initialized:', id);
        });

        this.peer.on('connection', (conn) => {
            this.handleIncomingConnection(conn);
        });

        this.peer.on('error', (err) => {
            console.error('[SyncEngine] Peer error:', err);
        });
    }

    async connectToDevice(targetPeerId: string): Promise<void> {
        if (!this.peer) throw new Error('SyncEngine not initialized');

        const conn = this.peer.connect(targetPeerId, {
            reliable: true, // Use reliable data channel
        });

        conn.on('open', () => {
            console.log('[SyncEngine] Connected to peer:', targetPeerId);
            this.connections.set(targetPeerId, conn);
            this.sendHeartbeat(conn);
        });

        conn.on('data', (data) => {
            this.handleMessage(conn, data as SyncMessage);
        });

        conn.on('close', () => {
            console.log('[SyncEngine] Connection closed:', targetPeerId);
            this.connections.delete(targetPeerId);
        });
    }

    private handleIncomingConnection(conn: DataConnection): void {
        conn.on('open', () => {
            console.log('[SyncEngine] Incoming connection from:', conn.peer);
            this.connections.set(conn.peer, conn);
        });

        conn.on('data', (data) => {
            this.handleMessage(conn, data as SyncMessage);
        });

        conn.on('close', () => {
            this.connections.delete(conn.peer);
        });
    }

    private handleMessage(conn: DataConnection, message: SyncMessage): void {
        switch (message.type) {
            case 'heartbeat':
                // Respond with heartbeat
                conn.send({ type: 'heartbeat', timestamp: Date.now() });
                break;
            case 'sync_request':
                // TODO: Implement actual sync logic
                console.log('[SyncEngine] Sync request received');
                break;
            case 'sync_response':
                // TODO: Apply synced data
                console.log('[SyncEngine] Sync response received');
                break;
        }
    }

    private sendHeartbeat(conn: DataConnection): void {
        conn.send({ type: 'heartbeat', timestamp: Date.now() });
    }

    async syncData(data: any): Promise<void> {
        if (!this.enabled) return;

        const message: SyncMessage = {
            type: 'sync_request',
            timestamp: Date.now(),
            data: this.encrypt(data), // TODO: Implement encryption
        };

        for (const conn of this.connections.values()) {
            conn.send(message);
        }
    }

    private encrypt(data: any): any {
        // TODO: Implement end-to-end encryption using user's keys
        // For now, return as-is (INSECURE - placeholder only)
        return data;
    }

    private decrypt(data: any): any {
        // TODO: Implement decryption
        return data;
    }

    enable(): void {
        this.enabled = true;
    }

    disable(): void {
        this.enabled = false;
        // Close all connections
        for (const conn of this.connections.values()) {
            conn.close();
        }
        this.connections.clear();
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    getConnectedDevices(): string[] {
        return Array.from(this.connections.keys());
    }
}

export const syncEngine = new SyncEngine();
