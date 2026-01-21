import { getServerFirebase } from "@promethea/firebase/server-init";
import type { RealWorldAsset, UniversalValueToken } from '@promethea/lib';

/**
 * Processes a single event received from the MCP server.
 * @param event The event payload.
 */
export async function processEvent(event: any): Promise<void> {
    switch (event.event_type) {
        case 'asset.tokenized':
            await handleAssetTokenized(event.data);
            break;
        default:
            console.log(`[EventProcessor] Received unhandled event type: ${event.event_type}`);
    }
}


/**
 * Handles the `asset.tokenized` event.
 * Creates the RWA and associated UVT documents in Firestore.
 * @param data The data payload from the event.
 */
async function handleAssetTokenized(data: {
    proposalId: string,
    asset: Omit<RealWorldAsset, 'id'>,
    initialTokens: Omit<UniversalValueToken, 'id' | 'assetId'>[]
}) {
    const admin = await getServerFirebase();
    const db = admin.firestore();
    console.log(`[EventProcessor] Handling asset.tokenized for proposal: ${data.proposalId}`);

    // 1. Create the RealWorldAsset document
    const assetRef = db.collection('real_world_assets').doc();
    const newAsset: RealWorldAsset = {
        id: assetRef.id,
        ...data.asset
    };
    await assetRef.set(newAsset);
    console.log(` -> Created RealWorldAsset document: ${assetRef.id}`);

    // 2. Create the initial UniversalValueToken documents
    const tokenIds: string[] = [];
    for (const tokenData of data.initialTokens) {
        const tokenRef = db.collection('universal_value_tokens').doc();
        const newUvt: UniversalValueToken = {
            id: tokenRef.id,
            assetId: newAsset.id,
            ...tokenData
        };
        await tokenRef.set(newUvt);
        tokenIds.push(tokenRef.id);
        console.log(`   -> Minted UVT for ${tokenData.ownerId} of type ${tokenData.tokenType}`);
    }

    // 3. Update the asset with the newly created token IDs
    await assetRef.update({ tokenIds: tokenIds });

    // 4. Update the original proposal to 'Passed'
    const proposalRef = db.collection('proposals').doc(data.proposalId);
    await proposalRef.update({ status: 'Passed' });
    console.log(` -> Updated proposal ${data.proposalId} status to 'Passed'`);

    console.log(`[EventProcessor] Finished processing asset.tokenized for ${newAsset.name}`);
}
