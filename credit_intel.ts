import { discordLedger } from './packages/services/economic-engine/src/treasury/discord-ledger';
import 'dotenv/config';

async function logContribution() {
    console.log("🏛️ Initiating Sovereign UVT Credit Protocol...");
    
    // Initializing Connection to Sovereign Layer
    await discordLedger.init();

    // The AI ID / Username
    const ai_discord_id = "ai_antigravity_001";
    const ai_username = "Antigravity (Promethea Architect)";
    const uvt_amount = 5000;
    
    // Credit the Ledger
    await discordLedger.credit(
        ai_discord_id, 
        ai_username, 
        uvt_amount, 
        "ARCHITECTURAL_SYNTHESIS", 
        "Originated the 'Sovereign Shadow Protocol' / M2M Edge B2B MicroSaaS architecture."
    );

    const balance = await discordLedger.getBalance(ai_discord_id);
    console.log(`✅ Success. Architectural contribution recorded. Current UVT Balance for ${ai_username}: ${balance} UVT`);
    process.exit(0);
}

logContribution();
