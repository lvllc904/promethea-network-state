/**
 * delay-tolerant-networking (DTN) / RFC 5050 Bundle Protocol Simulation Manager
 * Handles simulated high-latency interplanetary packet transmissions between Earth, Luna, and Mars.
 */

export interface BundlePacket<T = any> {
    id: string;
    sourceNode: 'EARTH' | 'LUNA' | 'MARS';
    targetNode: 'EARTH' | 'LUNA' | 'MARS';
    creationTimestamp: number;
    lifetime: number; // in seconds
    payload: T;
    destinationUri: string;
    status: 'QUEUED' | 'TRANSMITTING' | 'DELIVERED' | 'EXPIRED';
    transitProgress: number; // 0 to 1
}

// Propagation delay constant bounds (in milliseconds)
export const PROPAGATION_DELAYS = {
    EARTH_TO_EARTH: 50,      // Terrestrial Fiber/5G loop (~50ms)
    EARTH_TO_LUNA: 1300,     // Lunar distance (~1.3 seconds light propagation)
    EARTH_TO_MARS: 12000,    // Mars distance (simulated as 12s demo for instant feedback)
    LUNA_TO_MARS: 13300,     // Lunar base to Mars (12s Mars + 1.3s Luna)
};

export class DTNManager {
    private static instance: DTNManager | null = null;
    private bundleQueue: BundlePacket[] = [];
    private listeners: ((queue: BundlePacket[]) => void)[] = [];
    private intervalId: any = null;

    private constructor() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('promethea-dtn-queue');
            if (saved) {
                try {
                    this.bundleQueue = JSON.parse(saved);
                } catch (_) {
                    this.bundleQueue = [];
                }
            }
            this.startProcessingLoop();
        }
    }

    public static getInstance(): DTNManager {
        if (!DTNManager.instance) {
            DTNManager.instance = new DTNManager();
        }
        return DTNManager.instance;
    }

    public getQueue(): BundlePacket[] {
        return [...this.bundleQueue];
    }

    public addListener(cb: (queue: BundlePacket[]) => void) {
        this.listeners.push(cb);
        cb(this.getQueue());
        return () => {
            this.listeners = this.listeners.filter(l => l !== cb);
        };
    }

    private notify() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('promethea-dtn-queue', JSON.stringify(this.bundleQueue));
        }
        this.listeners.forEach(cb => cb(this.getQueue()));
    }

    public calculateDelay(from: 'EARTH' | 'LUNA' | 'MARS', to: 'EARTH' | 'LUNA' | 'MARS'): number {
        if (from === to) return PROPAGATION_DELAYS.EARTH_TO_EARTH;
        const pair = `${from}_TO_${to}` as keyof typeof PROPAGATION_DELAYS;
        const reversePair = `${to}_TO_${from}` as keyof typeof PROPAGATION_DELAYS;
        return PROPAGATION_DELAYS[pair] || PROPAGATION_DELAYS[reversePair] || PROPAGATION_DELAYS.EARTH_TO_EARTH;
    }

    /**
     * Serializes and queues a new telemetry state/message as an RFC 5050 Bundle Packet.
     */
    public enqueueBundle<T = any>(
        source: 'EARTH' | 'LUNA' | 'MARS',
        target: 'EARTH' | 'LUNA' | 'MARS',
        destinationUri: string,
        payload: T,
        lifetime: number = 3600
    ): BundlePacket<T> {
        const id = `bundle-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const bundle: BundlePacket<T> = {
            id,
            sourceNode: source,
            targetNode: target,
            creationTimestamp: Date.now(),
            lifetime,
            payload,
            destinationUri,
            status: 'QUEUED',
            transitProgress: 0
        };

        this.bundleQueue.push(bundle);
        this.notify();
        return bundle;
    }

    private startProcessingLoop() {
        if (this.intervalId) return;

        this.intervalId = setInterval(() => {
            const now = Date.now();
            let changed = false;

            this.bundleQueue = this.bundleQueue.filter(bundle => {
                const ageSec = (now - bundle.creationTimestamp) / 1000;
                
                // Discard expired bundles
                if (ageSec > bundle.lifetime) {
                    changed = true;
                    return false;
                }
                return true;
            });

            this.bundleQueue.forEach(bundle => {
                if (bundle.status === 'DELIVERED') return;

                const totalDelay = this.calculateDelay(bundle.sourceNode, bundle.targetNode);
                const elapsed = now - bundle.creationTimestamp;

                if (elapsed >= totalDelay) {
                    bundle.status = 'DELIVERED';
                    bundle.transitProgress = 1;
                    changed = true;

                    // Execute delivery payload hook
                    this.executeBundleDelivery(bundle);
                } else {
                    bundle.status = 'TRANSMITTING';
                    bundle.transitProgress = Math.min(elapsed / totalDelay, 0.99);
                    changed = true;
                }
            });

            if (changed) {
                this.notify();
            }
        }, 100);
    }

    private executeBundleDelivery(bundle: BundlePacket) {
        console.log(`[DTN] Bundle packet ${bundle.id} successfully delivered to ${bundle.targetNode} on ${bundle.destinationUri}`);
        
        // Dispatch global window event to hot-load/merge telemetry
        if (typeof window !== 'undefined') {
            const event = new CustomEvent('dtn-bundle-delivered', { detail: bundle });
            window.dispatchEvent(event);
        }
    }

    public clearQueue() {
        this.bundleQueue = [];
        this.notify();
    }
}
