import { BiologicalPowPayload, UniversalValueToken } from './types';
import { DepthOSEvaluationResult } from './depthos-bridge';
import crypto from 'crypto';

export interface UVTMintingEvent {
  citizenId: string;
  syndicateId: string;
  taskId: string;
  tokensMinted: UniversalValueToken[];
  reason: string;
  timestamp: string;
}

export class AutonomousPowOracle {
  /**
   * Processes a verified payload and determines the UVT minting amounts based on:
   * 1. The payload source type (LIDAR, IOT_SENSOR, etc.)
   * 2. The quality score from DepthOS
   * 3. Base reward multiplier constants
   */
  static evaluateAndMint(
    payload: BiologicalPowPayload,
    evaluation: DepthOSEvaluationResult
  ): UVTMintingEvent {
    if (!evaluation.isVerified) {
      throw new Error(`Payload ${payload.id} was not verified by DepthOS.`);
    }

    const tokensToMint: UniversalValueToken[] = [];

    // Base multiplier mapping based on hardware/source type effort
    // E.g., LiDAR mapping is mathematically/physically harder to fake and highly valuable
    // Audio or basic photos might have a lower base reward.
    const rewardBaseMap: Record<string, { amount: number; type: 'Labor' | 'Capital' | 'Reputation' }> = {
      'LIDAR': { amount: 1500, type: 'Labor' },
      'IOT_SENSOR': { amount: 300, type: 'Capital' }, // Assuming deploying hardware is capital
      'VIDEO': { amount: 500, type: 'Labor' },
      'PHOTO': { amount: 100, type: 'Labor' },
      'AUDIO': { amount: 150, type: 'Labor' }
    };

    const baseConfig = rewardBaseMap[payload.sourceType] || { amount: 50, type: 'Labor' };

    // The higher the confidence score, the closer they get to the max multiplier (1.0 to 1.5x)
    // E.g. A score of 0.85 = 1.0x, 1.0 = 1.5x
    const qualityBonus = evaluation.score >= 0.85 
      ? 1.0 + ((evaluation.score - 0.85) / 0.15) * 0.5 
      : 0;

    const finalAmount = Math.floor(baseConfig.amount * qualityBonus);

    // 1. Primary Reward (Labor/Capital)
    tokensToMint.push({
      id: crypto.randomUUID(),
      assetId: payload.taskId, // In this case, the underlying asset task
      ownerId: payload.citizenId,
      amount: finalAmount,
      tokenType: baseConfig.type,
      createdAt: new Date().toISOString(),
      realityState: 'ACTUALIZED'
    });

    // 2. Reputation Reward (Minted as a secondary reflection of verified PoW)
    // Reputation is generated at 10% of the labor/capital value
    tokensToMint.push({
      id: crypto.randomUUID(),
      assetId: payload.taskId,
      ownerId: payload.citizenId,
      amount: Math.floor(finalAmount * 0.1),
      tokenType: 'Reputation',
      createdAt: new Date().toISOString(),
      realityState: 'ACTUALIZED'
    });

    return {
      citizenId: payload.citizenId,
      syndicateId: payload.syndicateId,
      taskId: payload.taskId,
      tokensMinted: tokensToMint,
      reason: `Verified ${payload.sourceType} Proof-of-Work (Score: ${evaluation.score})`,
      timestamp: new Date().toISOString()
    };
  }
}
