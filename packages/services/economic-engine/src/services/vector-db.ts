import { GoogleGenerativeAI } from '@google/generative-ai';
import { db, COLLECTIONS } from '../db';
import { vaultService } from './vault-service';

export interface VectorDocument {
    id?: string;
    text: string;
    embedding: number[];
    metadata: any;
    timestamp: string;
}

export class SovereignVectorDB {
    private genAI: GoogleGenerativeAI | null = null;
    private initialized = false;

    private async init() {
        if (this.initialized) return;
        const apiKey = await vaultService.getSecret('GEMINI_API_KEY') || process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY is required for Sovereign Vector DB embeddings.');
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.initialized = true;
    }

    /**
     * Converts raw text into mathematical meaning (embeddings)
     */
    private async getEmbedding(text: string): Promise<number[]> {
        await this.init();
        if (!this.genAI) throw new Error('Vector DB not initialized.');
        
        // Use Gemini's embedding model
        const model = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(text);
        return result.embedding.values;
    }

    /**
     * Calculates the distance between two semantic concepts (Cosine Similarity)
     * Returns a score between -1 and 1. 1 = exact match.
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) throw new Error("Vector dimension mismatch");
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Ingests unstructured data (e.g., Lake Snapshots, geopolitical news, proposals),
     * converts it to meaning, and stores it in the local SQLite substrate.
     */
    public async indexDocument(text: string, metadata: any): Promise<string> {
        console.log(`[VectorDB] 🧠 Embedding document: ${text.substring(0, 40)}...`);
        const embedding = await this.getEmbedding(text);
        
        const doc: VectorDocument = {
            text,
            embedding,
            metadata,
            timestamp: new Date().toISOString()
        };

        const result = await db.collection(COLLECTIONS.OMNI_VECTORS).add(doc);
        return result.id;
    }

    /**
     * Allows Promethea to query her memory by *concept* rather than by keyword.
     * Searches the local SQLite substrate and returns the closest semantic matches.
     */
    public async searchSimilar(queryText: string, topK: number = 3): Promise<Array<VectorDocument & { similarity: number }>> {
        console.log(`[VectorDB] 🔍 Searching semantic memory for: "${queryText}"`);
        const queryEmbedding = await this.getEmbedding(queryText);
        
        // Fetch all vectors from the local SQLite substrate
        const rawRecords: any = await db.collection(COLLECTIONS.OMNI_VECTORS).get();
        const allDocs: VectorDocument[] = rawRecords.docs 
            ? rawRecords.docs.map((d: any) => typeof d.data === 'function' ? d.data() : d.data) 
            : rawRecords.map((d: any) => typeof d.data === 'function' ? d.data() : d.data);

        // Calculate similarity scores for all documents
        const scoredDocs = allDocs.map(doc => ({
            ...doc,
            similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
        }));

        // Sort by highest similarity first and take top K
        scoredDocs.sort((a, b) => b.similarity - a.similarity);
        return scoredDocs.slice(0, topK);
    }
}

export const vectorDB = new SovereignVectorDB();
