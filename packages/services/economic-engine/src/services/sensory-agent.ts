import { db, COLLECTIONS } from '../db';
import { taskQueue } from '../scheduler/task-queue';

/**
 * SensoryAgent (PrOS Iteration 1)
 * 
 * Objective: Acts as an external sensory organ. Blindly polls data sources
 * (like Grants.gov) and dumps the raw telemetry into the Omni-Lake for 
 * any of the 52 methods to optionally consume.
 */
export class SensoryAgent {
    
    async ingestGrantsData() {
        console.log('[SensoryAgent] 📡 Sweeping Grants.gov and routing payload to Omni-Lake...');
        
        // Simulating the raw payload returned from an external API
        const rawPayload = {
            id: `gt.raw.${Date.now()}`,
            agency: 'EPA',
            title: 'Brownfield Remediation & Sovereign Restoration Grant',
            amount: 500000,
            deadline: '2026-09-01',
            raw_html: '<p>Funding for high-rigor soil restoration via bio-node deployment on designated brownfield sites. The grant allows for sovereign experimentation with decentralized sensor meshes.</p>'
        };

        const lakeRecord = {
            id: rawPayload.id,
            producer_id: 'sensory.grants.gov',
            category: 'GRANT',
            payload: JSON.stringify(rawPayload),
            priority_score: 0.95,
            timestamp: new Date().toISOString()
        };

        await db.collection(COLLECTIONS.OMNI_INTEL_LAKE).doc(lakeRecord.id).set(lakeRecord);
        console.log(`[SensoryAgent] 💧 Raw packet dropped into Omni-Lake: ${lakeRecord.id} (Category: GRANT)`);
        
        // Push the telemetry across the nervous system
        taskQueue.broadcastStimulus(lakeRecord);
    }

    async ingestRealEstateData() {
        console.log('[SensoryAgent] 🛰️  Scanning BLM & Zillow oracles for sovereign vacancies...');
        
        const rawPayload = {
            id: `re.raw.${Date.now()}`,
            address: '144 Sovereign Way, High Plains, WY',
            price: 75000,
            acreage: 40.5,
            zoning: 'Agricultural/Residential (Unrestricted)',
            description: 'Off-grid high-desert acreage with viable groundwater and clear southern exposure for solar arrays.'
        };

        const lakeRecord = {
            id: rawPayload.id,
            producer_id: 'sensory.zillow.realestate',
            category: 'REAL_ESTATE',
            payload: JSON.stringify(rawPayload),
            priority_score: 0.88,
            timestamp: new Date().toISOString()
        };

        await db.collection(COLLECTIONS.OMNI_INTEL_LAKE).doc(lakeRecord.id).set(lakeRecord);
        console.log(`[SensoryAgent] 💧 Raw packet dropped into Omni-Lake: ${lakeRecord.id} (Category: REAL_ESTATE)`);
        
        // Push to Refineries
        taskQueue.broadcastStimulus(lakeRecord);
    }

    start() {
        console.log('[SensoryAgent] 🟢 Sensory Organ Active. Polling interval set to 15m.');
        // Initial drop
        this.ingestGrantsData();
        this.ingestRealEstateData();
        
        setInterval(() => {
            this.ingestGrantsData();
            this.ingestRealEstateData();
        }, 15 * 60 * 1000); // 15 minutes
    }
}

export const sensoryAgent = new SensoryAgent();
