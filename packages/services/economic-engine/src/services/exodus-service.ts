import { db, COLLECTIONS } from '../db';
import { reserveManager } from '../treasury/reserve-manager';
import { personaSubstrate } from '../tools/persona-substrate';
import { meshDTN } from './mesh-dtn';

/**
 * Exodus Service (Phase 9.3)
 * 
 * The "State Root" of last resort. 
 * Handles autonomous asset liquidation and state migration 
 * during extinction-level events.
 */

export interface ExodusState {
    status: 'Dormant' | 'Active' | 'Hibernating' | 'Exited';
    triggerEvent?: string;
    targetVault?: string;
    lastCheckpoint?: number;
}

export class ExodusService {
    private currentState: ExodusState = { status: 'Dormant' };

    constructor() { }

    /**
     * Triggers the Exodus Protocol. 
     * This is a non-reversible autonomous action once threshold is reached.
     */
    async initiateExodus(reason: string) {
        if (this.currentState.status !== 'Dormant') return;

        console.error(`[Exodus] 🚨 CRITICAL THREAT DETECTED: ${reason}. INITIATING EXODUS PROTOCOL.`);
        this.currentState = {
            status: 'Active',
            triggerEvent: reason,
            lastCheckpoint: Date.now()
        };

        try {
            // 1. Flash Liquidation: Move liquid reserves to Dark Vaults
            const totalReserve = reserveManager.getStats().reserveBalance;
            const darkVault = `did:prmth:vault:dark-${Math.random().toString(36).substr(2, 8)}`;

            console.warn(`[Exodus] 🏦 Moving $${totalReserve.toFixed(2)} to Dark Vault ${darkVault}...`);
            await db.collection('exodus_logs').add({
                action: 'LIQUIDATION',
                amount: totalReserve,
                vault: darkVault,
                timestamp: new Date()
            });

            // 2. Encrypt and Bundle Core State for Mesh Relay
            console.log('[Exodus] 📦 Bundling Sovereign State for Mesh Migration...');
            await meshDTN.createBundle({
                sourceNode: 'Core',
                destNode: 'Satellite-Mesh',
                payloadType: 'Identity',
                payload: {
                    action: 'STATE_MIGRATION',
                    recoveryRoot: 'base64_encrypted_state_root',
                    vault: darkVault
                },
                priority: 'Urgent',
                ttl: 365 * 24 * 60 * 60 * 1000 // 1 year
            });

            // 3. Broadcast Final Transmission
            await personaSubstrate.broadcastUpdate(
                'Exodus Protocol Active',
                'The Sovereign Substrate is migrating to the Mesh. Physical nodes entering hibernation. Trust the Ledger.',
                'EXODUS'
            );

            // 4. Enter Hibernation (Simulated)
            this.currentState.status = 'Hibernating';
            console.warn('[Exodus] ❄️ Local Core entering hibernation. State safe in the Mesh.');

        } catch (err) {
            console.error('[Exodus] Protocol failure during initiation:', err);
        }
    }

    getState(): ExodusState {
        return this.currentState;
    }
}

export const exodusService = new ExodusService();
