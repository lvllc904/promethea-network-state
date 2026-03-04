import { db, COLLECTIONS } from '../db';
import * as admin from 'firebase-admin';

/**
 * Hardware Relay Service (Phase 4.2)
 * 
 * Direct connection bridge between the Economic Engine and physical hardware
 * (3D Printers, CNC Machines, Sensor Grids).
 */

export interface GCodeJob {
    id: string;
    targetNode: string;
    nodeType: 'Sovereign' | 'PublicMaker' | 'DistributedMesh';
    gcode: string;
    status: 'Pending' | 'Relaying' | 'Executing' | 'Completed' | 'Failed';
    isEphemeral?: boolean; // If true, purge gcode after successful relay
    timestamp: number;
}

export class HardwareRelay {
    private activeJobs: Map<string, GCodeJob> = new Map();

    /**
     * Relay G-Code to a physical node
     */
    async relayGCode(job: GCodeJob): Promise<boolean> {
        console.log(`[HardwareRelay] 📡 Relaying G-Code [Type: ${job.nodeType}] to Node: ${job.targetNode}`);

        if (job.nodeType === 'PublicMaker') {
            console.log(`[HardwareRelay] 🛠️ Dispatching Kinetic Bounty to Public Endpoint: ${job.targetNode}`);
            // In a real scenario, this would post to an OctoPrint/Mainsail API or an Agent Marketplace
        }

        // In this substrate, we simulate the relay by logging and updating Firestore
        this.activeJobs.set(job.id, { ...job, status: 'Relaying' });

        // Phase 5.5: Ephemeral Purge logic
        if (job.isEphemeral) {
            console.log(`[HardwareRelay] 🗑️ Ephemeral G-Code PURGED for Job: ${job.id}`);
            const jobInStore = this.activeJobs.get(job.id);
            if (jobInStore) {
                jobInStore.gcode = '--- PURGED ---';
            }
        }

        try {
            // Update Firestore job status
            await db.collection(COLLECTIONS.HARDWARE_JOBS).add({
                ...job,
                status: 'Relaying',
                relayedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Simulate hardware execution delay
            setTimeout(() => this.simulateExecution(job.id), 10000);

            return true;
        } catch (error) {
            console.error(`[HardwareRelay] Relay failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }

    private async simulateExecution(jobId: string) {
        const job = this.activeJobs.get(jobId);
        if (!job) return;

        console.log(`[HardwareRelay] 🏗️ Hardware Node ${job.targetNode} is executing G-Code...`);
        job.status = 'Executing';

        setTimeout(async () => {
            console.log(`[HardwareRelay] ✅ Job ${jobId} Completed by Hardware.`);
            job.status = 'Completed';

            // Phase 5: Trigger real-world asset confirmation
            await db.collection(COLLECTIONS.ASSETS).doc(jobId).update({
                status: 'Manufactured',
                manufacturedAt: admin.firestore.FieldValue.serverTimestamp()
            }).catch(() => { }); // Asset might not exist in this mock
        }, 30000);
    }
}

export const hardwareRelay = new HardwareRelay();
