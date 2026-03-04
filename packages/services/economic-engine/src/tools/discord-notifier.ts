
import axios from 'axios';

/**
 * Sovereign Discord Notifier (Phase 4.3)
 * 
 * Bridges metabolic events and institutional updates to the Promethean Discord.
 */
export class DiscordNotifier {
    private webhookUrl: string | undefined;

    constructor() {
        this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    }

    async notify(message: string, embed?: any) {
        if (!this.webhookUrl) {
            console.log('[DiscordNotifier] Mocking Discord notification (No webhook URL):', message);
            return;
        }

        try {
            await axios.post(this.webhookUrl, {
                content: message,
                embeds: embed ? [embed] : []
            });
            console.log('[DiscordNotifier] Notification sent.');
        } catch (err) {
            console.error('[DiscordNotifier] Failed to send notification:', err);
        }
    }

    async notifyMilestone(title: string, description: string, value?: string) {
        const embed = {
            title,
            description,
            color: 0x00ff00, // Green
            fields: value ? [{ name: 'Value', value, inline: true }] : [],
            timestamp: new Date().toISOString(),
            footer: { text: 'Promethean Economic Engine' }
        };

        await this.notify(`🏛️ **New Institutional Event**`, embed);
    }
}

export const discordNotifier = new DiscordNotifier();
