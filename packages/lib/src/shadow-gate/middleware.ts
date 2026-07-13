/**
 * Shadow Gate & Gas Abstraction Middleware (Phase 4.2 / Component 3)
 * 
 * Objective: Intercept B2B enterprise partner API queries, route macroscopic transaction fees,
 * and provide complete gas abstraction (Paymaster co-signing) for human citizens' peer-to-peer UVT transfers.
 */

// Global mock state for B2B accumulated subsidy pools
let accumulatedGasSubsidyPool = 100.0; // In USD equivalent, seeded on startup

export function shadowGateMiddleware(req: any, res: any, next: () => void) {
    // 1. Check if the request is an enterprise B2B partner query (M2M enterprise payloads)
    const isB2B = req.headers['x-b2b-partner'] || req.url.includes('/api/b2b/') || req.headers['x-shadow-partner'];
    
    // 2. Check if the request is a citizen P2P transaction gas-abstraction request
    const isPaymasterRequest = req.url.includes('/api/paymaster/') || req.headers['x-citizen-transfer'];

    if (isB2B) {
        // Extract fee from headers, query, or assign a default fee (microscopic fee in SOL/USD)
        const feeHeader = req.headers['x-shadow-fee'] || req.headers['x-transaction-fee'];
        const fee = parseFloat(feeHeader as string) || 0.0005; // 0.0005 default B2B fee

        // B2B Waterfall routing split
        const rwaReserveShare = fee * 0.30;
        const uvtBuybackShare = fee * 0.65; // Allocate 65% to buybacks and 5% to citizen gas subsidy pool
        const gasSubsidyShare = fee * 0.05; 

        // Convert SOL to mock USD for the subsidy pool (1 SOL = $150 equivalent for simulation)
        accumulatedGasSubsidyPool += gasSubsidyShare * 150;

        console.log(`[Shadow Gate] 🌌 Intercepted Enterprise B2B Query: ${req.method} ${req.url}`);
        console.log(`[Shadow Gate] 💳 Total Micro-Transaction Fee: ${fee.toFixed(6)} SOL`);
        console.log(`[Shadow Gate] 🏛️ Routing 30% (${rwaReserveShare.toFixed(6)} SOL) to Multi-Sig Corporate Reserve (RWA Atlas)`);
        console.log(`[Shadow Gate] 🔄 Routing 65% (${uvtBuybackShare.toFixed(6)} SOL) to LP Router for UVT Buybacks`);
        console.log(`[Shadow Gate] ⛽ Routing 5% (${gasSubsidyShare.toFixed(6)} SOL) to Gas Subsidy Pool. Pool Balance: $${accumulatedGasSubsidyPool.toFixed(4)} USD`);

        // Attach transaction split telemetry to request
        req.shadowGate = {
            isIntercepted: true,
            partner: req.headers['x-b2b-partner'] || req.headers['x-shadow-partner'] || 'Enterprise_Partner',
            fee,
            rwaReserveShare,
            uvtBuybackShare,
            gasSubsidyShare,
            timestamp: new Date().toISOString()
        };
    } else if (isPaymasterRequest) {
        console.log(`[Paymaster] ⛽ Intercepted Citizen P2P transaction context for gas-free execution.`);
        
        const sender = req.headers['x-sender-wallet'] || 'Citizen_Wallet';
        const recipient = req.headers['x-recipient-wallet'] || 'Recipient_Wallet';
        const rawAmount = req.headers['x-transfer-amount'] || '0.0';
        const amount = parseFloat(rawAmount) || 0.0;

        const gasCostEst = 0.000005; // ~0.000005 SOL base Solana P2P transfer cost
        const gasCostUsd = gasCostEst * 150; // $0.00075 USD

        if (accumulatedGasSubsidyPool >= gasCostUsd) {
            accumulatedGasSubsidyPool -= gasCostUsd;
            console.log(`[Paymaster] 🟢 Subsidizing transfer of ${amount} UVT from ${sender.substring(0, 8)}... to ${recipient.substring(0, 8)}...`);
            console.log(`[Paymaster] 💸 Covered Gas Fee of ${gasCostEst.toFixed(6)} SOL ($${gasCostUsd.toFixed(5)} USD) from B2B Subsidy Pool. New Pool Balance: $${accumulatedGasSubsidyPool.toFixed(4)} USD`);

            // Inject co-signer metadata mimicking Solana Paymaster fee payer authorization
            req.paymaster = {
                subsidized: true,
                feePayer: 'PROMETHEAN_TREASURY_SOLANA_PAYMASTER_8888',
                signature: 'SIG_AA_' + Math.random().toString(36).substring(2, 15).toUpperCase(),
                costCoveredSol: gasCostEst,
                costCoveredUsd: gasCostUsd,
                remainingSubsidyPool: accumulatedGasSubsidyPool
            };
        } else {
            console.log(`[Paymaster] ⚠️ WARNING: Gas Subsidy Pool low ($${accumulatedGasSubsidyPool.toFixed(4)}). Unable to fully subsidize.`);
            req.paymaster = {
                subsidized: false,
                reason: 'Subsidy pool exhausted'
            };
        }
    }

    next();
}

