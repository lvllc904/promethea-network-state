import { collection, doc, increment, updateDoc, writeBatch, type Firestore } from "firebase/firestore";

export async function castVote(firestore: Firestore, proposalId: string, citizenId: string, support: boolean, voteCredits: number, voiceWeight: number) {
    try {
        const batch = writeBatch(firestore);
        const qvCost = voteCredits * voteCredits;

        // 1. Create vote record
        const voteRef = doc(collection(firestore, 'votes'));
        batch.set(voteRef, {
            proposalId,
            citizenId,
            support,
            weight: voiceWeight,
            cost: qvCost,
            timestamp: new Date().toISOString()
        });

        // 2. Deduct reputation from citizen
        const citizenRef = doc(firestore, 'citizens', citizenId);
        batch.update(citizenRef, {
            reputation: increment(-qvCost)
        });

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to cast vote on the client" };
    }
}

export async function pledgeCapital(firestore: Firestore, proposalId: string, citizenId: string, amount: number) {
    try {
        const batch = writeBatch(firestore);

        const pledgeRef = doc(collection(firestore, 'pledges'));
        batch.set(pledgeRef, {
            proposalId,
            citizenId,
            amount,
            status: 'Pending',
            timestamp: new Date().toISOString()
        });

        const proposalRef = doc(firestore, 'proposals', proposalId);
        batch.update(proposalRef, {
            pledgedCapital: increment(amount)
        });

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to pledge capital on the client" };
    }
}

// Fixed type explicitly so we don't need to import deeply
export async function applyForTask(firestore: Firestore, taskId: string, proposalId: string, assigneeId: string, compensationChoice: string) {
    try {
        // Technically, rules might block unassigned tasks from being updated if you aren't the assignee.
        // If it throws permission denied, you need to adjust Firestore rules for Tasks. 
        const taskRef = doc(firestore, 'tasks', taskId);
        await updateDoc(taskRef, {
            assigneeId: assigneeId,
            status: 'In Progress',
            compensationChoice: compensationChoice,
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to apply for task on the client" };
    }
}

export async function handleProposeAsset(firestore: Firestore, data: {
    assetData: any,
    analysis: any,
    ownerId: string
}): Promise<{ success: boolean; proposalId?: string; error?: string }> {
    try {
        const batch = writeBatch(firestore);

        const newProposalRef = doc(collection(firestore, 'proposals'));
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const newProposal = {
            id: newProposalRef.id,
            proposerId: data.ownerId,
            title: data.assetData.assetName,
            description: data.assetData.executiveSummary,
            category: data.assetData.assetType,
            status: 'Active',
            votingStartTime: now.toISOString(),
            votingEndTime: oneWeekFromNow.toISOString(),
            ipfsCid: 'pending',
            targetEquity: data.analysis.enterpriseValue,
            pledgedCapital: 0,
            pledgedSweatEquity: 0,
            tasks: data.analysis.pathTovalue
        };

        batch.set(newProposalRef, newProposal);

        for (const taskData of data.analysis.pathTovalue) {
            const newTaskRef = doc(collection(firestore, 'tasks'));
            batch.set(newTaskRef, {
                id: newTaskRef.id,
                proposalId: newProposalRef.id,
                description: taskData.description,
                priority: taskData.priority,
                status: 'Open',
                dueDate: oneWeekFromNow.toISOString().split('T')[0],
            });
        }

        await batch.commit();
        return { success: true, proposalId: newProposalRef.id };
    } catch (error: any) {
        console.error("Error in handleProposeAsset action: ", error);
        return { success: false, error: error.message || "An unexpected error occurred." };
    }
}

export async function purchaseFractionalShare(firestore: Firestore, assetId: string, citizenId: string, amount: number, paymentMethod: string) {
    try {
        const batch = writeBatch(firestore);

        const citizenRef = doc(firestore, 'citizens', citizenId);
        if (paymentMethod === 'Reputation') {
            batch.update(citizenRef, {
                reputation: increment(-amount)
            });
        }

        const uvtRef = doc(collection(firestore, 'universal_value_tokens'));
        batch.set(uvtRef, {
            assetId,
            ownerId: citizenId,
            tokenType: paymentMethod, // e.g. 'Reputation'
            amount: amount,
            status: 'Active',
            grantedAt: new Date().toISOString()
        });

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to purchase on the client" };
    }
}
