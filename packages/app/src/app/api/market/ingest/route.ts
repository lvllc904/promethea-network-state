import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { invokeAutoListRWA } from '@promethea/ai';

// Initialize Firebase Admin for server-side operations
function initAdmin() {
    if (getApps().length === 0) {
        const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        if (serviceAccountJson) {
            try {
                const cleanedJson = serviceAccountJson.trim().replace(/^'|'$/g, '');
                const serviceAccount = JSON.parse(cleanedJson);
                if (typeof serviceAccount.private_key === 'string') {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
                }
                initializeApp({
                    credential: cert(serviceAccount),
                    projectId: serviceAccount.project_id || 'studio-9105849211-9ba48'
                });
                console.log("[API] Firebase Admin initialized with Service Account");
                return;
            } catch (err) {
                console.error("[API] Failed to parse Service Account JSON:", err);
            }
        }

        // Fallback to basic init
        initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-9105849211-9ba48'
        });
        console.log("[API] Firebase Admin initialized with Project ID only (ADC)");
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { proposalText, providerId, files } = body;

        console.log(`[INGEST] Received proposal from ${providerId}. Files count: ${files?.length || 0}`);

        initAdmin();
        const db = getFirestore();

        // AI Deep-Chain Ingestion
        try {
            const aiOutput = await invokeAutoListRWA(proposalText);

            // Log full analysis temporarily
            await db.collection('ingestions').add({
                proposalText,
                providerId,
                files: files || [],
                status: 'Metabolized',
                analysis: aiOutput,
                createdAt: new Date(),
            });

            // "Metabolize" the asset onto the Public Ledger
            const assetRef = await db.collection('real_world_assets').add({
                name: aiOutput.assetName || `New Asset: ${proposalText.substring(0, 30)}...`,
                description: aiOutput.executiveSummary || proposalText,
                assetType: aiOutput.assetType || 'Utility',
                location: aiOutput.location || 'Unknown',
                price: aiOutput.enterpriseValue || 100, // FCFF Valuation
                viability: aiOutput.isViable,
                viabilityAssessment: aiOutput.viabilityAssessment,
                keyAssumptions: aiOutput.keyAssumptions,
                status: aiOutput.isViable ? 'Active' : 'Under Review',
                providerId,
                createdAt: new Date(),
                imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2832', // Wait for Synthesizer integration
            });

            // Translate "Path to Value" into Sovereign Tasks
            if (aiOutput.pathTovalue && Array.isArray(aiOutput.pathTovalue)) {
                const batch = db.batch();
                for (const task of aiOutput.pathTovalue) {
                    const taskRef = db.collection('tasks').doc();
                    batch.set(taskRef, {
                        proposalId: assetRef.id,
                        description: task.description,
                        priority: task.priority,
                        status: 'Open',
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        createdAt: new Date()
                    });
                }
                await batch.commit();
            }

            return NextResponse.json({ success: true, id: assetRef.id });

        } catch (aiError) {
            console.error('[INGEST] Deep-chain AI error:', aiError);
            return NextResponse.json({ error: 'AI Underwriter Failed' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Ingestion error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
