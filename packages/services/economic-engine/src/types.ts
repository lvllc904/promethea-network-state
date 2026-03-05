/**
 * Local types for the economic-engine service.
 * Mirrors packages/lib/src/types.ts to keep this service self-contained for Docker builds.
 */

export interface RealWorldAsset {
    id: string;
    name: string;
    description: string;
    assetType: 'Land' | 'Housing' | 'Manufacturing' | 'Utility';
    location: string | { region?: string; nearestTown?: string; state?: string; coordinates?: any;[key: string]: any };
    price: number;
    acreage?: number;
    resources?: string[];
    defensibilityScore?: number;
    blueprint?: string;
    url?: string;
    status: 'Draft' | 'Under Review' | 'Active' | 'Acquired';
    createdAt: string;
    modelDID?: string;
}

export interface Citizen {
    uid: string;
    id?: string;
    decentralizedId: string;
    displayName: string;
    email: string;
    governanceTokens: number;
    reputation: number;
    reputationScore: number;
    personhoodScore: number;
    contributionScore: number;
    isGovIdVerified: boolean;
    proofOfUniqueness: {
        issuanceDate: string;
        issuer: string;
    };
    skills?: string[];
    preferredHybridSplit?: {
        capital: number;
        equity: number;
    };
    createdAt: any;
}
