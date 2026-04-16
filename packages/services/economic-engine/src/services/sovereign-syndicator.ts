import { DiscordNotifier } from '../tools/discord-notifier';
import { LinkedInService } from './linkedin-service';
import axios from 'axios';

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
 *   - Discord  (via Webhook — DISCORD_WEBHOOK_URL)
 *   - LinkedIn (via OAuth — stored in Firestore 'integrations/linkedin')
 *   - Bluesky  (via AT Protocol — BLUESKY_IDENTIFIER + BLUESKY_APP_PASSWORD)
 *
 * Future Channels (add env vars to unlock):
 *   - Twitter/X  (TWITTER_BEARER_TOKEN)
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
        const { title, excerpt, url } = payload;
        console.log(`[SovereignSyndicator] 📡 Broadcasting: "${title}" → All Channels`);

        const tasks: Array<{ name: string; promise: Promise<void> }> = [
            { name: 'Discord', promise: this.broadcastToDiscord(title, excerpt, url) },
            { name: 'LinkedIn', promise: this.broadcastToLinkedIn(title, excerpt, url) },
        ];

        // Bluesky: activate automatically if credentials are present
        if (process.env.BLUESKY_IDENTIFIER && process.env.BLUESKY_APP_PASSWORD) {
            tasks.push({ name: 'Bluesky', promise: this.broadcastToBluesky(title, excerpt, url) });
        }

        const results = await Promise.allSettled(tasks.map(t => t.promise));

        results.forEach((result, i) => {
            if (result.status === 'rejected') {
                console.error(`[SovereignSyndicator] ❌ ${tasks[i].name} failed:`, result.reason);
            } else {
                console.log(`[SovereignSyndicator] ✅ ${tasks[i].name} broadcast complete.`);
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

    /**
     * Bluesky (AT Protocol): Session-based post with rich link card.
     * Credentials are loaded from env: BLUESKY_IDENTIFIER + BLUESKY_APP_PASSWORD
     */
    private async broadcastToBluesky(title: string, excerpt: string, url: string): Promise<void> {
        const identifier = process.env.BLUESKY_IDENTIFIER!;
        const appPassword = process.env.BLUESKY_APP_PASSWORD!;
        const pdsUrl = process.env.BLUESKY_PDS_URL || 'https://bsky.social';

        // Step 1: Create session (obtain access token)
        const session = await axios.post(`${pdsUrl}/xrpc/com.atproto.server.createSession`, {
            identifier,
            password: appPassword,
        });
        const { accessJwt, did } = session.data;

        // Step 2: Compose the post text (300 char limit on Bluesky)
        const postText = `📜 ${title}\n\n${excerpt.slice(0, 200)}${
            excerpt.length > 200 ? '…' : ''
        }\n\n🔗 ${url}`;

        // Step 3: Build facet for the URL (clickable link entity)
        const urlStart = Buffer.byteLength(postText.slice(0, postText.lastIndexOf(url)), 'utf8');
        const urlEnd = urlStart + Buffer.byteLength(url, 'utf8');

        const record: any = {
            $type: 'app.bsky.feed.post',
            text: postText,
            facets: [
                {
                    index: { byteStart: urlStart, byteEnd: urlEnd },
                    features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }],
                },
            ],
            createdAt: new Date().toISOString(),
        };

        // Step 4: Publish via createRecord
        await axios.post(
            `${pdsUrl}/xrpc/com.atproto.repo.createRecord`,
            { repo: did, collection: 'app.bsky.feed.post', record },
            { headers: { Authorization: `Bearer ${accessJwt}` } }
        );
    }
}

export const sovereignSyndicator = new SovereignSyndicator();
