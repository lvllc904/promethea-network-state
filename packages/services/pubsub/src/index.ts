import { PubSub, Message } from '@google-cloud/pubsub';

const pubsub = new PubSub({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

export interface TeamMessage {
    sender: 'user' | 'antigravity' | 'promethea' | string;
    timestamp: string;
    content: string;
    context?: {
        task?: string;
        intent?: string;
        priority?: 'normal' | 'urgent' | 'info';
    };
    metadata?: Record<string, any>;
}

export const TEAM_CONVERSATION_TOPIC = 'promethean-team-conversation';

/**
 * Publish a message to the team conversation topic
 */
export async function publishTeamMessage(message: TeamMessage): Promise<string> {
    try {
        const topic = pubsub.topic(TEAM_CONVERSATION_TOPIC);
        const dataBuffer = Buffer.from(JSON.stringify(message));
        const messageId = await topic.publishMessage({ data: dataBuffer });
        console.log(`[PubSub] Published message ${messageId} from ${message.sender}`);
        return messageId;
    } catch (error) {
        console.error('[PubSub] Failed to publish message:', error);
        throw error;
    }
}

/**
 * Subscribe to team conversation messages
 */
export async function subscribeToTeamMessages(
    subscriptionName: string,
    callback: (message: TeamMessage) => void | Promise<void>
): Promise<void> {
    const subscription = pubsub.subscription(subscriptionName);

    const messageHandler = async (message: Message) => {
        try {
            const teamMessage: TeamMessage = JSON.parse(message.data.toString());
            console.log(`[PubSub] Received message from ${teamMessage.sender}`);
            await callback(teamMessage);
            message.ack();
        } catch (error) {
            console.error('[PubSub] Error processing message:', error);
            message.nack();
        }
    };

    subscription.on('message', messageHandler);
    subscription.on('error', (error) => {
        console.error('[PubSub] Subscription error:', error);
    });

    console.log(`[PubSub] Listening to subscription: ${subscriptionName}`);
}

/**
 * Legacy stub for backward compatibility
 */
export const publishEvent = async (topic: string, data: any) => {
    console.log(`[PubSub] Legacy publishEvent called for topic ${topic}:`, data);
    // This can be migrated to use publishTeamMessage if needed
};
