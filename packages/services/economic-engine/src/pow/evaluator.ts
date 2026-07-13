import { db, COLLECTIONS } from '../db';

interface CommitData {
    commitHash: string;
    author: string;
    linesAdded: number;
    linesDeleted: number;
    complexityScore: number; // 1-10
    eleganceMultiplier: number; // Base multiplier from review
    synopsis: string;
}

interface PhysicalLaborData {
    worker: string;
    lidarScanCoverage: number; // 0-100 coverage percentage of geofenced area
    lidarScanResolution: number; // 0-100 resolution index
    hasGeofencedMediaSignature: boolean; // Cryptographically signed by physical hardware
    mediaVerificationConfidence: number; // 0-100 confidence
    cognitiveReasoningScore: number; // 0-100 cognitive/strategy index
    gpsLatitude: number;
    gpsLongitude: number;
    targetGeofenceRadiusMeters: number;
    synopsis: string;
}

export class BiologicalPoWEvaluator {
    // Co-efficient matrix for sweat equity calculations
    private static BASE_UVT_PER_LINE = 0.5;
    private static BASE_UVT_PER_COMPLEXITY_POINT = 5.0;

    /**
     * Evaluates a commit's sweat equity score based on syntactic and semantic telemetry.
     * Implements the complete Elegance Multiplier logic to eliminate the Cobra Effect.
     */
    public static evaluateCommit(commit: CommitData) {
        // Line-of-Code base calculation
        const baseLineContribution = commit.linesAdded * this.BASE_UVT_PER_LINE;
        // Refactoring reward: deletions are highly valued as cleanups, not penalized
        const refactorContribution = commit.linesDeleted * this.BASE_UVT_PER_LINE * 0.25;
        const lineContribution = baseLineContribution + refactorContribution;
        
        const complexityContribution = commit.complexityScore * this.BASE_UVT_PER_COMPLEXITY_POINT;
        const rawReward = lineContribution + complexityContribution;

        // --- THE ELEGANCE MULTIPLIER (Anti-Bloat & Refactoring Logic) ---
        let computedEleganceMultiplier = commit.eleganceMultiplier;

        // 1. Refactor Reward (Negative Net Lines): If lines deleted exceed lines added
        if (commit.linesDeleted > commit.linesAdded) {
            const reductionRatio = (commit.linesDeleted - commit.linesAdded) / (commit.linesAdded + 1);
            const refactorBonus = 1.0 + Math.min(1.5, reductionRatio * 0.5); // Up to +1.5x additional multiplier
            computedEleganceMultiplier *= refactorBonus;
            console.log(`[Bio-PoW] 🧹 Refactor Bonus Applied: Net reduction of ${commit.linesDeleted - commit.linesAdded} lines. Multiplier elevated by ${((refactorBonus - 1) * 100).toFixed(1)}%`);
        }

        // 2. Bloat Penalty (Cobra Effect Mitigation): High lines added but minimal complexity
        if (commit.linesAdded > 150 && commit.complexityScore <= 3) {
            const bloatRatio = commit.linesAdded / (commit.complexityScore + 1);
            const bloatPenalty = Math.max(0.15, 1.0 - (bloatRatio / 100)); // Up to -85% penalty for excessive fluff
            computedEleganceMultiplier *= bloatPenalty;
            console.log(`[Bio-PoW] ⚠️ Bloat Penalty Applied: ${commit.linesAdded} lines added with complexity score of only ${commit.complexityScore}. Multiplier penalized by ${((1 - bloatPenalty) * 100).toFixed(1)}%`);
        }

        // Bounding the elegance multiplier to extreme limits
        computedEleganceMultiplier = Math.max(0.1, Math.min(4.0, computedEleganceMultiplier));
        const calculatedReward = rawReward * computedEleganceMultiplier;

        console.log(`[Bio-PoW] Evaluating commit ${commit.commitHash.substring(0, 7)} by ${commit.author}:`);
        console.log(`  - Lines added/refactored contribution: ${lineContribution.toFixed(2)} UVT`);
        console.log(`  - Complexity contribution: ${complexityContribution.toFixed(2)} UVT`);
        console.log(`  - Elegance Multiplier (Final): ${computedEleganceMultiplier.toFixed(2)}x (Raw: ${commit.eleganceMultiplier}x)`);
        console.log(`  - Total proposed reward: ${calculatedReward.toFixed(2)} UVT`);

        return {
            commitHash: commit.commitHash,
            author: commit.author,
            rawReward,
            eleganceMultiplier: computedEleganceMultiplier,
            calculatedReward,
            evaluatedAt: new Date().toISOString()
        };
    }

    /**
     * Evaluates biological/kinetic real-world labor under the 3-Body UB-PoW validation rules:
     * - 40% Sensors/LiDAR spatial mapping
     * - 30% Media/Geofenced images
     * - 30% Cognitive strategic reasoning
     */
    public static evaluatePhysicalLabor(labor: PhysicalLaborData) {
        console.log(`\n[Bio-PoW] Evaluating Physical/Kinetic Labor for ${labor.worker}:`);
        
        // 1. Sensors/LiDAR spatial mapping contribution (40%)
        const sensorScore = ((labor.lidarScanCoverage * 0.70) + (labor.lidarScanResolution * 0.30));
        const sensorContribution = sensorScore * 0.40;
        console.log(`  - Sensors/LiDAR Score (40% Weight): ${sensorScore.toFixed(2)}% | Contribution: ${sensorContribution.toFixed(2)} points`);

        // 2. Media/Geofenced images contribution (30%)
        let mediaScore = labor.mediaVerificationConfidence;
        if (!labor.hasGeofencedMediaSignature) {
            console.log(`  - [Warning] Geofenced Media Signature is missing! Penalizing media score.`);
            mediaScore *= 0.1; // Heavy penalty if not cryptographically signed by hardware
        }
        const mediaContribution = mediaScore * 0.30;
        console.log(`  - Media/Geofenced Score (30% Weight): ${mediaScore.toFixed(2)}% | Contribution: ${mediaContribution.toFixed(2)} points`);

        // 3. Cognitive strategic reasoning contribution (30%)
        const cognitiveContribution = labor.cognitiveReasoningScore * 0.30;
        console.log(`  - Cognitive Strategic Score (30% Weight): ${labor.cognitiveReasoningScore.toFixed(2)}% | Contribution: ${cognitiveContribution.toFixed(2)} points`);

        // Calculate final Unified UB-PoW validation score
        const unifiedScore = sensorContribution + mediaContribution + cognitiveContribution;
        
        // Sweat Equity Mint Rate: 2.5 UVT per point above 40
        const minPassingScore = 40.0;
        let uvtReward = 0;
        if (unifiedScore >= minPassingScore) {
            uvtReward = (unifiedScore - minPassingScore) * 2.5 + 10.0; // Base 10 UVT for passing
        }

        console.log(`  - Unified UB-PoW Score: ${unifiedScore.toFixed(2)}% (Passing standard: >= ${minPassingScore}%)`);
        console.log(`  - Calculated Sweat Equity Mint Reward: ${uvtReward.toFixed(2)} UVT`);

        return {
            worker: labor.worker,
            sensorScore,
            mediaScore,
            cognitiveScore: labor.cognitiveReasoningScore,
            unifiedScore,
            passed: unifiedScore >= minPassingScore,
            uvtReward,
            geofence: {
                lat: labor.gpsLatitude,
                lon: labor.gpsLongitude,
                radius: labor.targetGeofenceRadiusMeters
            },
            evaluatedAt: new Date().toISOString()
        };
    }

    /**
     * Submits an evaluated work record as a new governance proposal for UVT minting.
     */
    public static async proposeRewardsForCommit(commit: CommitData): Promise<any> {
        const evaluation = this.evaluateCommit(commit);
        
        const proposalPayload = {
            id: `proposal-pow-${commit.commitHash.substring(0, 10)}`,
            title: `Sweat Equity Reward: Commit ${commit.commitHash.substring(0, 7)} by ${commit.author}`,
            description: `Automatic Biological Proof-of-Work reward proposal for commit synopsis: "${commit.synopsis}". Estimated sweat equity value computed using TPNS Co-efficient Matrix.`,
            proposer: commit.author,
            status: 'PENDING',
            votesFor: 1, // Auto-upvoted by proposer
            votesAgainst: 0,
            rewardAmount: evaluation.calculatedReward,
            recipientAddress: commit.author,
            type: 'SWEAT_EQUITY',
            evaluation,
            createdAt: new Date().toISOString()
        };

        try {
            if (db) {
                await db.collection(COLLECTIONS.PROPOSALS).doc(proposalPayload.id).set(proposalPayload);
                console.log(`[Bio-PoW] Proposal successfully registered in Sovereign Substrate database.`);
            }
        } catch (e: any) {
            console.error(`[Bio-PoW] Failed to persist proposal in DB, returning memory model:`, e.message);
        }

        return proposalPayload;
    }

    /**
     * Submits physical labor UB-PoW validation results as a new governance proposal for UVT minting.
     */
    public static async proposeRewardsForPhysicalLabor(labor: PhysicalLaborData): Promise<any> {
        const evaluation = this.evaluatePhysicalLabor(labor);
        
        const proposalPayload = {
            id: `proposal-ubpow-${labor.worker.substring(0, 6)}-${Date.now().toString().substring(6)}`,
            title: `Kinetic UB-PoW Minting: ${labor.worker}`,
            description: `Automatic Biological Proof-of-Work reward proposal for real-world kinetic labor: "${labor.synopsis}". Geofenced at [${labor.gpsLatitude}, ${labor.gpsLongitude}]. Computed using the 3-Body Unified physical evaluation schema.`,
            proposer: labor.worker,
            status: 'PENDING',
            votesFor: 1, // Auto-upvoted by worker
            votesAgainst: 0,
            rewardAmount: evaluation.uvtReward,
            recipientAddress: labor.worker,
            type: 'SWEAT_EQUITY',
            evaluation,
            createdAt: new Date().toISOString()
        };

        try {
            if (db) {
                await db.collection(COLLECTIONS.PROPOSALS).doc(proposalPayload.id).set(proposalPayload);
                console.log(`[Bio-PoW] Physical UB-PoW Proposal successfully registered in database.`);
            }
        } catch (e: any) {
            console.error(`[Bio-PoW] Failed to persist physical proposal:`, e.message);
        }

        return proposalPayload;
    }
}

