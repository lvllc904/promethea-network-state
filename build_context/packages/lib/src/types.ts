export interface Citizen {
  uid: string;
  id?: string; // Legacy ID compatibility
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
    capital: number; // percentage in stablecoins/SOL
    equity: number;  // percentage in UVT
  };
  createdAt: any; // Firestore Timestamp
}

export interface LocalCitizenProfile {
  localId?: string;
  displayName: string;
  uid?: string;
  email?: string;
  governanceTokens?: number;
  reputation?: number;
  createdAt?: any;
}

export interface Constitution {
  content: string;
  version: string;
  lastUpdated: any;
  lastAmended: any;
}

export interface RefineProposalInput {
  proposalText: string;
  pastLearnings: string;
}

export interface RefineProposalOutput {
  refinedProposal: string;
}

export interface UnderwriteRWAInput {
  assetName: string;
  assetType: string;
  location: string;
  executiveSummary: string;
  businessPlan: string;
  verificationDocuments: string;
}

export interface RealWorldAsset {
  id: string;
  name: string;
  description: string;
  assetType: 'Land' | 'Housing' | 'Manufacturing' | 'Utility';
  location: string;
  price: number;
  acreage?: number;
  resources?: string[]; // e.g. ["Water", "Sun", "Timber"]
  defensibilityScore?: number; // 0-100
  blueprint?: string; // G-Code or STL data
  url?: string; // Listing URL
  status: 'Draft' | 'Under Review' | 'Active' | 'Acquired';
  createdAt: string;
  modelDID?: string;
}

export interface UnderwriteRWAOutput {
  isViable: boolean;
  viabilityAssessment: string;
  enterpriseValue: number;
  keyAssumptions: string;
  pathTovalue: { description: string; priority: 'High' | 'Medium' | 'Low' }[];
}

export interface AutoListRWAOutput extends UnderwriteRWAInput, UnderwriteRWAOutput { }

export type CompensationChoice = 'Equity' | 'Capital' | 'SweatEquity';

export interface GapLoan {
  id: string;
  title: string;
  description: string;
  amountNeeded: number;
  repaymentTerms: string;
  proposalId: string;
  proposerId: string;
  status: 'Funding' | 'Funded' | 'Repaid';
  amountFunded: number;
  funderId?: string;
  createdAt?: any;
  fundedAt?: any;
}

export interface UniversalValueToken {
  id: string;
  assetId: string;
  ownerId: string;
  amount: number;
  tokenType: 'Labor' | 'Capital' | 'Reputation';
  createdAt: string;
  onChainStatus?: 'Pending' | 'Settled';
  onChainSignature?: string;
  timestamp?: any;
}

export interface DetectNetworkThreatsInput {
  networkActivityLogs: string;
  physicalAssetStatus: string;
}

export interface DetectNetworkThreatsOutput {
  threatDetected: boolean;
  threatDescription: string;
  suggestedAction: string;
}

export interface Pledge {
  id: string;
  amount: number;
  citizen: string;
}

export interface Vote {
  id: string;
  proposalId: string;
  voter: string;
  support: boolean;
  weight?: number; // Wave 3, Item 1: Reputation Weight
}

export interface Proposal {
  id: string;
  proposerId: string;
  title: string;
  description: string;
  category: string;
  status: 'Active' | 'Passed' | 'Rejected' | 'Expired' | 'Draft';
  votingStartTime: string;
  votingEndTime: string;
  ipfsCid: string;
  targetEquity: number;
  pledgedCapital: number;
  pledgedSweatEquity: number;
  tasks: { description: string; priority: 'High' | 'Medium' | 'Low' }[];
}

export interface Task {
  id: string;
  proposalId: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Completed';
  dueDate: string;
  assigneeId?: string;
  compensationChoice?: CompensationChoice;
}