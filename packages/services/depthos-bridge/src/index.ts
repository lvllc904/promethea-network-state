import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';

const app = express();
const PORT = 9999; // Standard port for the DepthOS Bridge

app.use(cors());
app.use(express.json());

// Health check endpoint for the UI to pulse
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'DepthOS Bridge Daemon',
        version: '1.0.0',
        capabilities: ['websocket', 'filesystem', 'posix']
    });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
    console.log('[DepthOS Bridge] New connection established from TPNS Interface.');

    // Welcome message
    ws.send(JSON.stringify({
        type: 'SYSTEM_LOG',
        payload: 'DepthOS Bridge Handshake Successful. Native POSIX and Filesystem access granted.'
    }));

    ws.on('message', (message: string) => {
        try {
            const data = JSON.parse(message);
            console.log('[DepthOS Bridge] Received command:', data);

            // Mock handling of basic terminal commands from the browser
            if (data.type === 'EXEC_COMMAND') {
                const cmd = data.payload.trim();
                let output = '';

                if (cmd === 'ping') {
                    output = 'pong - native daemon response';
                } else if (cmd === 'whoami') {
                    output = 'sovereign-citizen (UID 1000)';
                } else if (cmd === 'ls') {
                    output = 'Desktop\nDocuments\nDownloads\nOmniLake\nSovereignKeys';
                } else if (cmd === 'pwd') {
                    output = '/home/sovereign-citizen';
                } else {
                    output = `bash: ${cmd}: command not found`;
                }

                ws.send(JSON.stringify({
                    type: 'COMMAND_STDOUT',
                    payload: output
                }));
            }
        } catch (e) {
            console.error('[DepthOS Bridge] Error parsing message:', e);
        }
    });

    ws.on('close', () => {
        console.log('[DepthOS Bridge] Connection closed.');
    });
});

server.listen(PORT, () => {
    console.log(`[DepthOS Bridge] Anchor Daemon running locally on http://localhost:${PORT}`);
    console.log(`[DepthOS Bridge] WebSocket listening on ws://localhost:${PORT}`);
});
