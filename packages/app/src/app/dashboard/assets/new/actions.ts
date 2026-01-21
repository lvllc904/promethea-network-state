'use server';

import { getServerFirebase } from "@promethea/firebase/server-init";
import { Proposal, Task, UnderwriteRWAInput, UnderwriteRWAOutput, AutoListRWAOutput } from "@promethea/lib";

export async function handleUnderwrite(data: UnderwriteRWAInput): Promise<UnderwriteRWAOutput | { error: string }> {
    try {
        const Ai = await import("@promethea/ai");
        const result = await Ai.invokeUnderwriteRWA(data) as UnderwriteRWAOutput;
        return result;
    } catch (error: any) {
        console.error("Error in handleUnderwrite action: ", error);
        return { error: error.message || "An unexpected error occurred during underwriting." };
    }
}

export async function handleAutoList(documents: string): Promise<AutoListRWAOutput | { error: string }> {
    try {
        const Ai = await import("@promethea/ai");
        const result = await Ai.invokeAutoListRWA(documents) as AutoListRWAOutput;
        return result;
    } catch (error: any) {
        console.error("Error in handleAutoList action: ", error);
        return { error: error.message || "An unexpected error occurred during auto-listing." };
    }
}

export async function handleProposeAsset(data: {
    assetData: UnderwriteRWAInput,
    analysis: UnderwriteRWAOutput,
    ownerId: string
}): Promise<{ success: boolean; proposalId?: string; error?: string }> {
    try {
        const admin = await getServerFirebase();
        const db = admin.firestore();
        const batch = db.batch();

        const newProposalRef = db.collection('proposals').doc();
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const newProposal: Proposal = {
            id: newProposalRef.id,
            proposerId: data.ownerId,
            title: data.assetData.assetName,
            description: data.assetData.executiveSummary,
            category: data.assetData.assetType,
            status: 'Active',
            votingStartTime: now.toISOString(),
            votingEndTime: oneWeekFromNow.toISOString(),
            ipfsCid: 'pending', // Placeholder 
            targetEquity: data.analysis.enterpriseValue,
            pledgedCapital: 0,
            pledgedSweatEquity: 0,
            tasks: data.analysis.pathTovalue
        };

        batch.set(newProposalRef, newProposal);

        // 2. Create all associated tasks and add them to the batch
        for (const taskData of data.analysis.pathTovalue) {
            const newTaskRef = db.collection('tasks').doc();
            const newTask: Task = {
                id: newTaskRef.id,
                proposalId: newProposalRef.id, // Link task to the new proposal
                description: taskData.description,
                priority: taskData.priority,
                status: 'Open',
                dueDate: oneWeekFromNow.toISOString().split('T')[0], // Set due date to end of voting
            };
            batch.set(newTaskRef, newTask);
        }

        await batch.commit();

        // 3. Emit event to the network
        try {
            const { publishEvent } = await import("@promethea/pubsub");
            await publishEvent('proposal.created', {
                proposalId: newProposal.id,
                title: newProposal.title,
                category: newProposal.category,
                timestamp: now.toISOString()
            });
        } catch (pubsubError) {
            console.error("Failed to publish to PubSub, but proposal was committed:", pubsubError);
        }

        return { success: true, proposalId: newProposalRef.id };

    } catch (error: any) {
        console.error("Error in handleProposeAsset action: ", error);
        return { success: false, error: error.message || "An unexpected error occurred." };
    }
}
