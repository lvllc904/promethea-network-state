import { BaseMethod, ExecutionResult } from './base-method';
import { db, COLLECTIONS } from '../db';
import { googleWorkspace } from '../tools/google-workspace';
import { personaSubstrate } from '../tools/persona-substrate';

/**
 * Method: Diplomatic Sessions (Phase 5)
 * 
 * Autonomously schedules external Google Meet interviews and broadcasts them
 * across the DAC ecosystem for radical transparency.
 */
export class DiplomaticSessionMethod extends BaseMethod {
    constructor() {
        super('diplomatic-session', 'Diplomatic Virtual Studio Manager', {
            enabled: true,
            priority: 4,
            maxExecutionsPerDay: 24, // Check hourly
            estimatedRevenue: { min: 0, max: 0 },
        });
    }

    async execute(): Promise<ExecutionResult> {
        const logs: string[] = [];
        let scheduledCount = 0;

        try {
            logs.push('Scanning the ledger for pending diplomatic session requests...');

            const snapshot = await db.collection(COLLECTIONS.DIPLOMATIC_SESSIONS)
                .where('status', '==', 'Pending')
                .limit(5)
                .get();

            if (snapshot.empty) {
                logs.push('No pending requests found.');
                return {
                    success: true,
                    revenue: 0,
                    cost: 0,
                    profit: 0,
                    timestamp: Date.now(),
                    logs
                };
            }

            for (const doc of snapshot.docs) {
                const request = doc.data();
                const requestId = doc.id;

                logs.push(`Processing request ${requestId} for guest: ${request.guestName} (${request.email})`);

                const requestedDate = request.requestedDate ? request.requestedDate.toDate() : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // Default to 48 hours

                const sessionResult = await googleWorkspace.scheduleSession(request.guestName, requestedDate, request.duration || 60);

                if (sessionResult && sessionResult.meetLink) {
                    // Dispatch the official invite via Gmail
                    await googleWorkspace.sendGuestInvite(request.email, request.guestName, sessionResult.meetLink);

                    // Update ledger to lock it in
                    await doc.ref.update({
                        status: 'Scheduled',
                        meetLink: sessionResult.meetLink,
                        scheduledStart: sessionResult.event.start?.dateTime,
                        eventId: sessionResult.event.id,
                        updatedAt: new Date()
                    });

                    // Mirror to Discord for the DAC Public Square
                    await personaSubstrate.broadcastUpdate(
                        '🎙️ Diplomatic Session Scheduled',
                        `Promethea has confirmed a virtual studio interview with **${request.guestName}**.\nDate: ${requestedDate.toUTCString()}\nThe DAC is invited to tune in via the scheduled broadcast.`
                    );

                    logs.push(`✅ Scheduled and dispatched invites for ${request.guestName}.`);
                    scheduledCount++;
                } else {
                    logs.push(`❌ Failed to schedule Calendar event for ${request.guestName}.`);

                    await doc.ref.update({
                        status: 'Failed',
                        errorReason: 'Google Calendar/Meet API Exception',
                        updatedAt: new Date()
                    });
                }
            }

            return {
                success: true,
                revenue: 0,
                cost: 0.0, // Operational API calls
                profit: 0,
                timestamp: Date.now(),
                modelDID: 'did:prmth:model:gemini-2.0-flash',
                logs,
            };
        } catch (error: any) {
            return {
                success: false,
                revenue: 0,
                cost: 0,
                profit: 0,
                timestamp: Date.now(),
                logs,
                error: error.message
            };
        }
    }
}
