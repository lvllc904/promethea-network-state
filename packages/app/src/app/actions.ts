'use server';

// The local type definition for the assistant input, as the flow is now external

// The local type definition for the assistant input, as the flow is now external
type PrometheaAssistantInput = {
    query: string;
    constitutionContent: string;
    whitePaperContent: string;
};

// The local type definition for the assistant output
type PrometheaAssistantOutput = {
    response: string;
};


// --- AI Chat Actions ---

export async function askPrometheaAction(input: PrometheaAssistantInput): Promise<PrometheaAssistantOutput | { error: string }> {
    try {
        if (!input.constitutionContent) {
            return { error: "Constitution content is missing. Cannot proceed." };
        }
        if (!input.whitePaperContent) {
            return { error: "White Paper content is missing. Cannot proceed." };
        }

        // The AI service now runs on its own port, which we'll fetch from an environment variable.
        // For local development, we'll default to 4002 if not set.
        const aiServiceUrl = process.env.AI_SERVICE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4002';

        const response = await fetch(`${aiServiceUrl}/api/ask-promethea`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
            cache: 'no-store', // Ensure fresh responses
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || `AI service returned an error: ${response.statusText}`);
        }

        const result: PrometheaAssistantOutput = await response.json();

        if (!result?.response) {
            console.error("AI service returned an invalid response structure:", result);
            return { error: "Received an invalid response from the AI. Please try again." };
        }
        return result;

    } catch (error) {
        console.error("Error in askPrometheaAction: ", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: `An error occurred while communicating with the AI: ${errorMessage}` };
    }
}

export async function textToSpeechAction(input: any): Promise<any | { error: string }> {
    try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4002';
        const response = await fetch(`${aiServiceUrl}/api/text-to-speech`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });
        if (!response.ok) throw new Error('Failed to generate audio');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in textToSpeechAction: ", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: `An error occurred while generating audio: ${errorMessage}` };
    }
}

export async function speechToTextAction(input: any): Promise<any | { error: string }> {
    try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4002';
        const response = await fetch(`${aiServiceUrl}/api/speech-to-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });
        if (!response.ok) throw new Error('Failed to transcribe audio');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in speechToTextAction: ", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: `An error occurred during transcription: ${errorMessage}` };
    }
}

import { db } from '@/lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function genesisMintAction(uid: string, displayName: string, email: string) {
    console.log(`[GENESIS] Initiating Genesis Merge for UID: ${uid}`);

    try {
        const citizenCollection = db.collection('citizens');
        const uvtCollection = db.collection('universal_value_tokens');

        // 1. Philosophical Aggregate: Find ALL legacy/placeholder founders
        const foundersQuery = await citizenCollection
            .where('skills', 'array-contains', 'Founding Member')
            .get();

        let totalReputation = 1000;
        let totalContribution = 1000;
        const legacyUids: string[] = [];

        for (const doc of foundersQuery.docs) {
            if (doc.id !== uid) {
                const data = doc.data();
                console.log(`[GENESIS] Merging legacy founder: ${doc.id} (${data.displayName || 'Unknown'})`);
                
                // Aggregate stats (preventing duplication if they are 0)
                if (data.reputation) totalReputation += (data.reputation > 100 ? data.reputation : 0);
                if (data.contributionScore) totalContribution += data.contributionScore;
                
                legacyUids.push(doc.id);

                // Transfer legacy UVTs to the new UID
                const legacyUvtQuery = await uvtCollection.where('ownerId', '==', doc.id).get();
                for (const uvtDoc of legacyUvtQuery.docs) {
                    await uvtDoc.ref.update({ ownerId: uid, description: `[GENESIS_MERGE] Transferred from legacy identity ${doc.id}` });
                }

                // Decommission legacy Founding skill
                await doc.ref.update({ 
                    skills: FieldValue.arrayRemove('Founding Member'),
                    mergedInto: uid,
                    updatedAt: FieldValue.serverTimestamp()
                });
            }
        }

        // 2. Perform the Sovereignty Elevation (Final Root Identity)
        // Auto-attaching the established Solana Public Key provided by Joshua
        const solanaPublicKey = 'Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb';

        const citizenRef = citizenCollection.doc(uid);
        await citizenRef.set({
            uid: uid,
            decentralizedId: `did:prmth:sol:${uid.slice(-10)}`,
            solanaAddress: solanaPublicKey, // Persistent link to on-chain liquidity
            displayName: displayName || 'Joshua Wicke',
            email: email || 'joshua@lvhllc.org',
            governanceTokens: 1000,
            reputation: totalReputation,
            reputationScore: 100,
            personhoodScore: 100,
            contributionScore: totalContribution,
            isGovIdVerified: true,
            skills: ['Founding Member', 'Economic Soul', 'Architect', 'Genesis Root'],
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            genesisMergedAt: FieldValue.serverTimestamp(),
            legacyIdentities: legacyUids
        }, { merge: true });

        // 3. Back-dated Genesis Minting (If no previous genesis UVT exists for this user)
        const existingGenesisUvt = await uvtCollection.where('ownerId', '==', uid).where('assetId', '==', 'genesis-link').get();
        if (existingGenesisUvt.empty) {
            const genesisUvtDoc = await uvtCollection.add({
                ownerId: uid,
                amount: 100000,
                tokenType: 'Reputation',
                assetId: 'genesis-link',
                description: 'Initial Genesis Mint: Legacy confirmation of foundational substrate contributions.',
                createdAt: new Date().toISOString(),
                onChainStatus: 'Settled',
                timestamp: FieldValue.serverTimestamp(),
                realityState: 'ACTUALIZED'
            });
            console.log(`[GENESIS] Back-dated mint complete. Hash: ${genesisUvtDoc.id}`);
        }

        console.log(`[GENESIS] Merge and Elevation Complete for ${displayName}. Solana Link: ${solanaPublicKey}`);

        return { success: true, mergedCount: legacyUids.length };
    } catch (error: any) {
        console.error('[GENESIS] Merge Protocol Failure:', error);
        return { error: error.message || 'An internal substrate error occurred during Genesis Merge.' };
    }
}
