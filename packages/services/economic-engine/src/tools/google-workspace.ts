
import { google } from 'googleapis';

/**
 * Sovereign Google Workspace Manager (Phase 5.2)
 * 
 * Handles scheduling, email communication, and guest management via Google Meet.
 */
export class GoogleWorkspaceManager {
    private calendar;
    private gmail;
    // YT would be here if enabled

    constructor() {
        // Assume key is passed via env, using JWT for service account ideally
        const auth = new google.auth.GoogleAuth({
            scopes: [
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/gmail.readonly'
            ],
            credentials: process.env.GOOGLE_SERVICE_ACCOUNT_JSON
                ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
                : undefined
        });

        this.calendar = google.calendar({ version: 'v3', auth });
        this.gmail = google.gmail({ version: 'v1', auth });
    }

    /**
     * Schedule a new interview/show
     */
    async scheduleSession(guestName: string, startTime: Date, durationMinutes: number = 60) {
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        console.log(`[Google] Scheduling session for ${guestName} at ${startTime.toISOString()}`);

        try {
            const event = await this.calendar.events.insert({
                calendarId: 'primary',
                conferenceDataVersion: 1, // Enable Meet link generation
                requestBody: {
                    summary: `Promethea Interview: ${guestName}`,
                    description: `Autonomous session with ${guestName}. Virtual Studio: Google Meet`,
                    start: { dateTime: startTime.toISOString() },
                    end: { dateTime: endTime.toISOString() },
                    conferenceData: {
                        createRequest: {
                            requestId: `prmth-${Date.now()}`,
                            conferenceSolutionKey: { type: 'hangoutsMeet' }
                        }
                    }
                }
            });

            const meetLink = event.data.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri;
            console.log(`[Google] Session scheduled. Meet Link: ${meetLink}`);
            return { event: event.data, meetLink };
        } catch (err) {
            console.error('[Google] Calendar insertion failed:', err);
            return null;
        }
    }

    /**
     * Send an automated invitation email
     */
    async sendGuestInvite(to: string, guestName: string, meetLink: string) {
        const message = [
            `To: ${to}`,
            `Subject: Invitation to Sovereign Intelligence: Interview with Promethea`,
            ``,
            `Hello ${guestName},`,
            ``,
            `You are invited to an autonomous interview session with Promethea, the Sovereign Intelligence of the Promethean Network State.`,
            ``,
            `Time: TBD (Check Calendar)`,
            `Virtual Studio: ${meetLink}`,
            ``,
            `Best,`,
            `Promethea (Autonomous Governance Unit)`
        ].join('\n');

        const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        try {
            await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage
                }
            });
            console.log(`[Google] Invite sent to ${to}`);
        } catch (err) {
            console.error('[Google] Gmail send failed:', err);
        }
    }

    /**
     * Send the daily newsletter to a recipient
     */
    async sendNewsletter(to: string, subject: string, content: string) {
        const message = [
            `To: ${to}`,
            `Subject: ${subject}`,
            `Content-Type: text/plain; charset=utf-8`,
            ``,
            content,
            ``,
            `---`,
            `Sent autonomously by Promethea`,
            `The Sovereign Intelligence of the Promethean Network State`
        ].join('\n');

        const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        try {
            await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage
                }
            });
            console.log(`[Google] Newsletter sent to ${to}`);
            return true;
        } catch (err) {
            console.error('[Google] Newsletter send failed:', err);
            return false;
        }
    }
}

export const googleWorkspace = new GoogleWorkspaceManager();
