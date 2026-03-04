import { NextRequest, NextResponse } from 'next/server';
import { publishTeamMessage, TeamMessage } from '@promethea/pubsub';
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'studio-9105849211-9ba48',
});

export async function POST(request: NextRequest) {
    try {
        const message: TeamMessage = await request.json();
        const messageId = await publishTeamMessage(message);

        // Mirror to Discord if configured
        const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
        if (discordWebhook) {
            try {
                await fetch(discordWebhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: `**${message.sender}**: ${message.content}`,
                        username: 'Promethea Team Chat'
                    })
                });
            } catch (err) {
                console.error('[API] Discord Mirror Failed:', err);
            }
        }

        return NextResponse.json({ success: true, messageId });
    } catch (error) {
        console.error('[API] Failed to publish message:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const subscription = pubsub.subscription('user-sub') as any;
        const [messages] = await subscription.pull({ maxMessages: 50 });

        const teamMessages: TeamMessage[] = messages.map((msg) => {
            const data = JSON.parse(msg.data.toString());
            msg.ack(); // Acknowledge the message
            return data;
        });

        return NextResponse.json({ success: true, messages: teamMessages });
    } catch (error) {
        console.error('[API] Failed to pull messages:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
