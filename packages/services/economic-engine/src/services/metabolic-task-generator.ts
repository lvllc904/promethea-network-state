import { db, COLLECTIONS } from '../db';
import { questManager, Quest } from '../treasury/quest-manager';

export class MetabolicTaskGenerator {
    /**
     * Spawns appropriate prerequisite quests when an asset is in the 'IDEA' state.
     */
    async generatePrerequisiteQuests(assetId: string, assetName: string, assetType: string): Promise<Quest[]> {
        console.log(`[MetabolicTaskGenerator] 🧬 Spawning collaborative quests for asset: ${assetName} (${assetId})`);
        
        const spawnedQuests: Quest[] = [];

        // 1. Legal Quest (Sweat Equity)
        const legalQuest = await questManager.createQuest(
            `Draft and Sign Operating Agreement for ${assetName} DUNA`,
            `Draft, review, and sign the decentralized unincorporated association (DUNA) operating agreement for ${assetName} in Wyoming. This is required to wrap the RWA in a sovereign legal shell.`,
            100, // reward: 100 UVT
            'SYSTEM_METABOLIC'
        );
        // Link to asset and set quest type
        await db.collection('quests').doc(legalQuest.questId).update({
            associatedAssetId: assetId,
            questType: 'Legal',
            valueRate: 50 // Expert task value rate $50/hour
        });
        spawnedQuests.push({ ...legalQuest, associatedAssetId: assetId, questType: 'Legal' } as any);

        // 2. Financial Quest (Capital Contribution)
        const financialQuest = await questManager.createQuest(
            `Fund Secretary of State Filing Fee ($25.00) for ${assetName}`,
            `Contribute $25.00 in UVT or USDC to fund the Wyoming state filing fee for ${assetName} DUNA organization wrapping.`,
            250, // reward: 250 UVT
            'SYSTEM_METABOLIC'
        );
        await db.collection('quests').doc(financialQuest.questId).update({
            associatedAssetId: assetId,
            questType: 'Financial',
            valueRate: 25 // General task rate $25/hour
        });
        spawnedQuests.push({ ...financialQuest, associatedAssetId: assetId, questType: 'Financial' } as any);

        // 3. Physical Quest (Sweat Equity) - For physical lands/claims
        if (assetType === 'RESTORATION_LAND' || assetType === 'MINERAL_CLAIM' || assetType === 'RECLAMATION_BROWNFIELD') {
            const physicalQuest = await questManager.createQuest(
                `Validate boundary coordinates and survey landmarks for ${assetName}`,
                `Conduct boundary audit, verify GPS/GIS coordinates and survey landmarks on the public ledger for ${assetName}.`,
                150,
                'SYSTEM_METABOLIC'
            );
            await db.collection('quests').doc(physicalQuest.questId).update({
                associatedAssetId: assetId,
                questType: 'Physical',
                valueRate: 50 // Expert boundary survey
            });
            spawnedQuests.push({ ...physicalQuest, associatedAssetId: assetId, questType: 'Physical' } as any);
        }

        // 4. Technical Quest (Sweat Equity) - For tech/depin compute/etc
        if (assetType === 'DEPIN_COMPUTE' || assetType === 'COMPUTE_NODE') {
            const techQuest = await questManager.createQuest(
                `Configure RPC daemon and verify bandwidth telemetry for ${assetName}`,
                `Configure local substrate RPC daemon, establish network handshake, and verify telemetry reports for computing nodes of ${assetName}.`,
                150,
                'SYSTEM_METABOLIC'
            );
            await db.collection('quests').doc(techQuest.questId).update({
                associatedAssetId: assetId,
                questType: 'Technical',
                valueRate: 50 // Expert tech configuration
            });
            spawnedQuests.push({ ...techQuest, associatedAssetId: assetId, questType: 'Technical' } as any);
        }

        // Write the default prerequisite checklists to the asset document
        const checklist = spawnedQuests.map(q => ({
            questId: q.questId,
            title: q.title,
            questType: (q as any).questType,
            completed: false
        }));

        await db.collection('real_world_assets').doc(assetId).update({
            prerequisiteTasks: checklist,
            progressionState: 'IDEA'
        });

        return spawnedQuests;
    }

    /**
     * Runs checks and auto-transitions the asset state if appropriate quests are complete.
     */
    async checkAndTransitionAsset(assetId: string): Promise<string | null> {
        const assetRef = db.collection('real_world_assets').doc(assetId);
        const doc = await assetRef.get();
        if (!doc.exists) return null;

        const asset = doc.data();
        const currentState = asset.progressionState || 'IDEA';
        console.log(`[MetabolicTaskGenerator] Evaluating progression state transition for ${asset.name || asset.title}. Current: ${currentState}`);

        // Fetch all quests associated with this asset
        const questsColl = db.collection('quests');
        const questsSnapshot = await questsColl.get();
        const assetQuests = questsSnapshot.docs
            .map((d: any) => ({ ...d.data(), id: d.id }))
            .filter((q: any) => q.associatedAssetId === assetId);

        let newState = currentState;

        if (currentState === 'IDEA') {
            // IDEA -> VETTED
            // Validates that net votes (yesVotes - noVotes) >= 10
            const yesVotes = asset.yesVotes || 0;
            const noVotes = asset.noVotes || 0;
            const netVotes = yesVotes - noVotes;
            if (netVotes >= 10) {
                newState = 'VETTED';
                console.log(`[MetabolicTaskGenerator] 🎉 Transitioning ${asset.name || asset.title} from IDEA to VETTED due to +${netVotes} consensus votes.`);
            }
        } 
        
        if (newState === 'VETTED') {
            // VETTED -> LEGALIZED
            // Requires Legal quest to be completed
            const legalQuest = assetQuests.find((q: any) => q.questType === 'Legal');
            if (legalQuest && legalQuest.status === 'COMPLETED') {
                newState = 'LEGALIZED';
                console.log(`[MetabolicTaskGenerator] 🎉 Transitioning ${asset.name || asset.title} from VETTED to LEGALIZED. DUNA Entity Wrapper articles signed.`);
            }
        } 
        
        if (newState === 'LEGALIZED') {
            // LEGALIZED -> SECURED
            // Requires Financial/Filing quest to be completed (or manual bypass)
            const financialQuest = assetQuests.find((q: any) => q.questType === 'Financial');
            const hasUcc1Filing = asset.ucc1FilingId || asset.bypassReceiptUrl || asset.wyomingFilingNumber;
            if ((financialQuest && financialQuest.status === 'COMPLETED') || hasUcc1Filing) {
                newState = 'SECURED';
                console.log(`[MetabolicTaskGenerator] 🎉 Transitioning ${asset.name || asset.title} from LEGALIZED to SECURED. UCC-1 Lien statement registered.`);
            }
        } 
        
        if (newState === 'SECURED') {
            // SECURED -> ACTUALIZED
            // If all physical / tech quests are complete, token minting can trigger
            const physicalQuest = assetQuests.find((q: any) => q.questType === 'Physical');
            const techQuest = assetQuests.find((q: any) => q.questType === 'Technical');
            
            const physicalDone = !physicalQuest || physicalQuest.status === 'COMPLETED';
            const techDone = !techQuest || techQuest.status === 'COMPLETED';

            if (physicalDone && techDone) {
                newState = 'ACTUALIZED';
                console.log(`[MetabolicTaskGenerator] 🎉 Transitioning ${asset.name || asset.title} from SECURED to ACTUALIZED. Asset minted on the DEX.`);
                
                // Set reality state to ACTUALIZED if appropriate
                await assetRef.update({
                    realityState: 'ACTUALIZED'
                });
            }
        }

        if (newState !== currentState) {
            // Update checklist completed status
            const updatedChecklist = assetQuests.map((q: any) => ({
                questId: q.id || q.questId,
                title: q.title,
                questType: q.questType,
                completed: q.status === 'COMPLETED'
            }));

            await assetRef.update({
                progressionState: newState,
                prerequisiteTasks: updatedChecklist
            });

            // Also broadcast update
            const { personaSubstrate } = require('../tools/persona-substrate');
            await personaSubstrate.broadcastUpdate(
                `State Transition: ${asset.name || asset.title}`,
                `${asset.name || asset.title} has progressed from ${currentState} to ${newState}.`,
                assetId
            );

            // Re-evaluate in case multiple steps are completed in one tick
            return this.checkAndTransitionAsset(assetId);
        }

        return currentState;
    }
}

export const metabolicTaskGenerator = new MetabolicTaskGenerator();
