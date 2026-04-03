import { DiscordNotifier } from '../tools/discord-notifier';
import { LinkedInService } from './linkedin-service';

export interface SyndicationPayload {
    title: string;
    excerpt: string;
    url: string;
    topic?: string;
}

/**
 * Sovereign Syndicator (Phase 6: Omni-Channel Broadcast)
 *
 * The unified broadcast layer for Promethean narratives.
 * When Promethea publishes intelligence, this service fans it
 * out to every sovereign channel simultaneously.
 *
 * Active Channels:
 *   - Discord (via Webhook — DISCORD_WEBHOOK_URL)
 *   - LinkedIn (via OAuth — stored in Firestore 'integrations/linkedin')
 *
 * Future Channels (add env vars to unlock):
 *   - Twitter/X  (TWITTER_BEARER_TOKEN)
 *   - Bluesky    (BLUESKY_IDENTIFIER + BLUESKY_APP_PASSWORD)
 *   - Farcaster  (FARCASTER_MNEMONIC)
 */
export class SovereignSyndicator {
    private discord: DiscordNotifier;
    private linkedin: LinkedInService;

    constructor() {
        this.discord = new DiscordNotifier();
        this.linkedin = new LinkedInService(
            process.env.LINKEDIN_CLIENT_ID || '',
            process.env.LINKEDIN_CLIENT_SECRET || '',
            process.env.LINKEDIN_REDIRECT_URI || 'https://lvhllc.org/api/linkedin/callback'
        );
    }

    /**
     * Broadcast a published post to ALL active sovereign channels.
     * Failures on individual channels are isolated and non-blocking.
     */
    async broadcast(payload: SyndicationPayload): Promise<void> {
        const { title, excerpt, url, topic } = payload;
        console.log(`[SovereignSyndicator] 📡 Broadcasting: "${title}" → All Channels`);

        const results = await Promise.allSettled([
            this.broadcastToDiscord(title, excerpt, url),
            this.broadcastToLinkedIn(title, excerpt, url),
        ]);

        results.forEach((result, i) => {
            const channels = ['Discord', 'LinkedIn'];
            if (result.status === 'rejected') {
                console.error(`[SovereignSyndicator] ❌ ${channels[i]} failed:`, result.reason);
            } else {
                console.log(`[SovereignSyndicator] ✅ ${channels[i]} broadcast complete.`);
            }
        });
    }

    /**
     * Discord: Rich embed with title, excerpt, and direct link.
     */
    private async broadcastToDiscord(title: string, excerpt: string, url: string): Promise<void> {
        const embed = {
            title: `📜 New Sovereign Intel: ${title}`,
            description: excerpt,
            url,
            color: 0xF5A623, // Promethean gold
            fields: [
                { name: 'Read on Substack', value: `[Open Post](${url})`, inline: true },
            ],
            footer: { text: 'The Promethean Network State · Sovereign Intelligence' },
            timestamp: new Date().toISOString(),
        };

        await this.discord.notify('', embed);
    }

    /**
     * LinkedIn: Article share with full title and link preview.
     */
    private async broadcastToLinkedIn(title: string, excerpt: string, url: string): Promise<void> {
        const text = `📜 New Sovereign Intel from The Promethean Network State:\n\n${title}\n\n${excerpt}\n\nRead the full essay: ${url}\n\n#NetworkState #Sovereignty #AI #Innovation #Promethea`;

        await this.linkedin.broadcastEvent({ text, title, url });
    }
}

export const sovereignSyndicator = new SovereignSyndicator();
