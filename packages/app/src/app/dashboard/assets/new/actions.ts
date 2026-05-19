'use server';

import { type AutoListRWAOutput } from "@promethea/ai";
import jwt from 'jsonwebtoken';

export async function handleUnderwrite(data: any): Promise<any | { error: string }> {
    try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4002';
        const response = await fetch(`${aiServiceUrl}/api/underwrite-rwa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const resData = await response.json();
            throw new Error(resData.error || 'Failed to underwrite');
        }
        return await response.json();
    } catch (error: any) {
        console.error("Error in handleUnderwrite action: ", error);
        return { error: error.message || "An unexpected error occurred during underwriting." };
    }
}

export async function handleAutoList(formData: FormData): Promise<any | { error: string }> {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error("No file provided for ingestion.");

        const engineUrl = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';
        
        // Convert file to buffer for the engine's raw body endpoint
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const JWT_SECRET = process.env.JWT_SECRET || 'promethea-sovereign-intelligence-v5';
        const serviceToken = jwt.sign({ service: 'promethea-app', role: 'internal' }, JWT_SECRET, { expiresIn: '1h' });

        const response = await fetch(`${engineUrl}/api/ai/ingest`, {
            method: 'POST',
            headers: { 
                'Content-Type': file.type || 'application/octet-stream',
                'Authorization': `Bearer ${serviceToken}`
            },
            body: arrayBuffer
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ingestion failed');
        }

        const ingestedData = await response.json();

        // Now, trigger the auto-listing underwriting logic using the ingested text
        const aiServiceUrl = process.env.AI_SERVICE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4002';
        const autoListRes = await fetch(`${aiServiceUrl}/api/auto-list-rwa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documents: ingestedData.description })
        });

        if (!autoListRes.ok) {
            throw new Error('Metabolic synthesis failed after ingestion');
        }

        const finalAnalysis = await autoListRes.json();
        
        // Merge the ingested metadata (title, category) with the underwriting analysis
        return {
            ...finalAnalysis,
            assetName: ingestedData.title || finalAnalysis.assetName,
            assetType: ingestedData.category || finalAnalysis.assetType,
        };

    } catch (error: any) {
        console.error("Error in handleAutoList action: ", error);
        return { error: error.message || "An unexpected error occurred during auto-listing." };
    }
}
