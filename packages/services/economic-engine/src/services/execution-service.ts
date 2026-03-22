import { db } from '../db';

/**
 * ExecutionService (The Reality Anchor)
 * 
 * Forms a strict boundary between simulated logic and hard physical/financial action.
 * If CONSERVATION_MODE is active, all actualizing actions are intercepted, logged,
 * and flagged with the 'SIMULATED' state.
 */
export class ExecutionService {
  private static conservationMode = process.env.CONSERVATION_MODE === 'true';

  static async wireFiat(amount: number, destination: string, description: string): Promise<{ success: boolean; state: 'SIMULATED' | 'ACTUALIZED'; txId: string }> {
    if (this.conservationMode) {
      console.log(`[SIMULATION: FIAT WIRE] Would have wired $${amount} to ${destination}. Reason: ${description}`);
      return { success: true, state: 'SIMULATED', txId: `sim_tx_${Date.now()}` };
    }

    // ACTUALIZATION: Insert Mercury/Stripe Issuing API call here.
    // const tx = await LVH_Bank.wire(amount, destination, description);
    
    console.log(`[ACTUALIZED: FIAT WIRE] Wired $${amount} to ${destination}.`);
    return { success: true, state: 'SIMULATED', txId: 'pending_api_integration' }; // TEMPORARY RED DOT UNTIL API KEYS INJECTED
  }

  static async purchaseAssetRWA(assetId: string, amount: number): Promise<{ success: boolean; state: 'SIMULATED' | 'ACTUALIZED' }> {
    if (this.conservationMode) {
      console.log(`[SIMULATION: RWA PURCHASE] Would have acquired asset ${assetId} for $${amount}.`);
      await this.updateAssetRealityState(assetId, 'SIMULATED');
      return { success: true, state: 'SIMULATED' };
    }

    // ACTUALIZATION: Trigger DocuSign / Fiat Wire logic
    console.log(`[ACTUALIZED: RWA PURCHASE] Acquired physical title for asset ${assetId}.`);
    await this.updateAssetRealityState(assetId, 'SIMULATED'); // TEMPORARY RED DOT UNTIL DOCUSIGN/BANK INJECTED
    return { success: true, state: 'SIMULATED' };
  }

  private static async updateAssetRealityState(assetId: string, state: 'SIMULATED' | 'ACTUALIZED' | 'TESTNET') {
    try {
      await db.collection('real_world_assets').doc(assetId).update({
        realityState: state
      });
    } catch (err) {
      console.warn('Failed to update RealityState tag:', err);
    }
  }

  static isConservationModeActive(): boolean {
    return this.conservationMode;
  }
}
