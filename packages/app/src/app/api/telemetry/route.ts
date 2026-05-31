import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Ensure TPNS directory exists
        const tpnsDir = path.join(os.homedir(), '.tpns');
        if (!fs.existsSync(tpnsDir)) {
            fs.mkdirSync(tpnsDir, { recursive: true });
        }

        const logFile = path.join(tpnsDir, 'telemetry.log');
        const logEntry = JSON.stringify({
            timestamp: new Date().toISOString(),
            ...body
        }) + '\n';

        // Append to local log file (simplest SQLite stand-in for immediate telemetry)
        // In a true SQLite integration, we'd use better-sqlite3 here
        fs.appendFileSync(logFile, logEntry);

        // Forward to the Promethea LISP Core (Simulated via a network call or direct process invocation)
        // This triggers the `:diagnose-issue` phase in the Metabolic Loop
        try {
            await fetch('http://localhost:3000/api/engine/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'SOVEREIGN_IMMUNE_RESPONSE', 
                    payload: body 
                })
            });
        } catch (e) {
            console.error('Failed to wake Promethea Immune System:', e);
        }

        return NextResponse.json({ success: true, message: 'Telemetry securely logged.' });
    } catch (error: any) {
        console.error('Telemetry Route Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
