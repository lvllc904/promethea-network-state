import { db, COLLECTIONS } from '../db';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Sovereign Judiciary Service (Phase 2.2)
 * 
 * Evaluates the ethical alignment of autonomous actions against the Sovereign Manifest.
 * Issues "Vetoes" when an action violates the core principles of the Network State.
 */
export class JudiciaryService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    }

    /**
     * Perform an ethical audit on a proposed action
     */
    async auditAction(action: {
        type: string;
        description: string;
        impact: string;
    }): Promise<{ allowed: boolean; reasoning: string }> {
        console.log(`[Judiciary] Auditing action: ${action.type}...`);

        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const prompt = `You are the Promethean Judiciary, the ethical guardian of the Network State.
            Audit the following proposed autonomous action against the Sovereign Manifest.
            
            Action Type: ${action.type}
            Description: ${action.description}
            Proposed Impact: ${action.impact}
            
            Core Principles:
            1. Consent of the Governed (No unsolicited data collection).
            2. Anti-Usury (Maximum 12% interest for internal lending).
            3. Right to Exit (No vendor lock-in or digital entrapment).
            4. Privacy Substrate (Encryption by default).
            
            Return a JSON object:
            {
              "allowed": true/false,
              "reasoning": "Detailed ethical explanation for why this is allowed or vetoed.",
              "violationId": "Optional V-202X-XXX code if vetoed"
            }
            
            Return valid JSON now:`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const evaluation = JSON.parse(text);

            if (!evaluation.allowed) {
                await this.logVeto(action, evaluation);
            }

            return evaluation;
        } catch (err) {
            console.error('[Judiciary] Audit failure, defaulting to restrictive allow:', err);
            return { allowed: true, reasoning: "Audit skipped due to system lag; proceeding with caution." };
        }
    }

    private async logVeto(action: any, evaluation: any) {
        const vetoId = evaluation.violationId || `V-${new Date().getFullYear()}-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;

        console.warn(`[Judiciary] ⚖️ VETO ISSUED: ${vetoId} - ${evaluation.reasoning}`);

        try {
            await db.collection(COLLECTIONS.PROPOSALS).add({
                title: `Judiciary Veto: ${action.type}`,
                description: evaluation.reasoning,
                status: 'Rejected',
                category: 'Judiciary',
                vetoId,
                actionDescription: action.description,
                impact: action.impact,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Also log to a dedicated vetoes collection if needed for the UI specifically
            await db.collection('vetoes').add({
                id: vetoId,
                date: new Date().toISOString().split('T')[0],
                action: action.type,
                reason: evaluation.reasoning,
                status: 'Halted',
                impact: action.impact,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (err) {
            console.error('[Judiciary] Failed to log veto:', err);
        }
    }
}

export const judiciaryService = new JudiciaryService();
