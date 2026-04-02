import { BaseMethod, ExecutionResult } from './base-method';
import { db, COLLECTIONS } from '../db';

/**
 * Grant & Endowment Automation Method (Refinery)
 * 
 * Objective: Subscribes to the Omni-Lake, snatches active Grant packets, 
 * synthesizes a technical draft proposition, and dumps the draft back into 
 * the Lake or Proposal system.
 */
export class GrantAutomationMethod extends BaseMethod {
    constructor(private aiKey: string) {
        super('mth_grant_automation', 'Federal Grant Refinery', {
            priority: 9, // High value
            maxExecutionsPerDay: 5,
            estimatedRevenue: { min: 100000, max: 5000000 },
            complexity: 9,
            conservationTier: 'ZERO_COST' // Doesn't require capital to draft proposals
        });
    }

    /**
     * Executes the standard loop (Legacy/Cron mode)
     */
    async execute(): Promise<ExecutionResult> {
        // Fallback routine if no stimuli triggers it
        return {
            success: true,
            revenue: 0,
            cost: 0,
            profit: 0,
            timestamp: Date.now(),
            logs: ['[Grant Refinery] Awaiting stimulus packets from Omni-Lake...']
        };
    }

    /**
     * The true driver of Iteration 2:
     * This method snatches data specifically matching "GRANT" and refines it.
     */
    async onOmniStimulus(packet: any): Promise<void> {
        if (packet.category !== 'GRANT') return;

        console.log(`[Grant Refinery] 🏗️ Snatching GRANT packet: ${packet.id}`);
        let payloadMap;
        try {
            payloadMap = JSON.parse(packet.payload);
        } catch (e) {
            payloadMap = packet.payload;
        }

        const grantId = packet.id;
        const agency = payloadMap.agency || 'Unknown';
        const title = payloadMap.title || 'Unknown Grant';
        
        console.log(`[Grant Refinery] ✍️ Synthesizing Proposal for [${agency}] ${title}...`);
        
        // Mocking the AI core synthesis delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const draftedProposal = {
            id: `prop.draft.${Date.now()}`,
            ref_packet_id: grantId,
            producer_id: this.methodId,
            category: 'PROPOSAL_DRAFT',
            title: `Proposal Draft: ${title}`,
            agency: agency,
            status: 'WAITING_FOR_HUMAN_REVIEW',
            payload: JSON.stringify({
                executiveSummary: `This proposal targets the ${agency} initiative regarding ${title}, requesting sovereign deployment...`,
                capitalReq: payloadMap.amount || 'Unknown'
            }),
            priority_score: 1.0, // High priority for human UI
            timestamp: new Date().toISOString()
        };

        // Dump the newly drafted proposal BACK into the Omni-Lake 
        await db.collection(COLLECTIONS.OMNI_INTEL_LAKE).doc(draftedProposal.id).set(draftedProposal);
        
        console.log(`[Grant Refinery] 🌊 Draft dumped back into Omni-Lake: ${draftedProposal.id}`);
        
        // Also log this successful labor loop
        await db.collection(COLLECTIONS.LABOR_RECORDS).add({
            methodId: this.methodId,
            packetRef: grantId,
            action: 'DRAFT_PROPOSAL',
            timestamp: new Date().toISOString()
        });
    }
}
