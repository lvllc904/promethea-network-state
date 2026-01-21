import 'dotenv/config';
import { getServerFirebase } from "@promethea/firebase/server-init";
import { processEvent } from './event-processor.js';
import { fetch } from 'undici';


const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:4003';
const POLLING_INTERVAL_MS = 5000;

let lastProcessedTimestamp = new Date().toISOString();

async function pollMCPServer() {
    console.log(`[MCP-Subscriber] Polling for new events since ${lastProcessedTimestamp}...`);
    try {
        const response = await fetch(`${MCP_SERVER_URL}/api/messages?since=${lastProcessedTimestamp}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch events from MCP: ${response.status} ${errorText}`);
        }

        const events: any[] = await response.json() as any[];

        if (events.length > 0) {
            console.log(`[MCP-Subscriber] Received ${events.length} new event(s).`);
            for (const event of events) {
                try {
                    await processEvent(event);
                } catch (processingError) {
                    console.error(`[MCP-Subscriber] Error processing event`, { event, processingError });
                }
            }
            lastProcessedTimestamp = events[events.length - 1].receivedAt;
        }

    } catch (error) {
        console.error('[MCP-Subscriber] Error polling MCP server:', error);
    } finally {
        setTimeout(pollMCPServer, POLLING_INTERVAL_MS);
    }
}

async function main() {
    console.log('[MCP-Subscriber] Initializing...');
    try {
        await getServerFirebase();
        console.log('[MCP-Subscriber] Firebase Initialized. Starting MCP polling.');
        setTimeout(pollMCPServer, POLLING_INTERVAL_MS);
    } catch (error) {
        console.error('[MCP-Subscriber] Failed to initialize Firebase:', error);
        process.exit(1);
    }
}

main();
