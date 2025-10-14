
export interface Citizen {
    id: string;
    decentralizedId: string;
    reputationScore: number;
    contributionScore: number;
    personhoodScore: number;
    skills?: string[];
    proofOfUniqueness: {
        issuer: string;
        issuanceDate: string;
    };
}

export interface Proposal {
    id: string;
    proposerId: string;
    title: string;
    description: string;
    status: 'Draft' | 'Active' | 'Passed' | 'Rejected';
    votingStartTime?: string;
    votingEndTime?: string;
    ipfsCid?: string;
}

export interface RealWorldAsset {
    id: string;
    name: string;
    description: string;
    location: string;
    assetType: string;
    tokenIds?: string[];
}

export interface UniversalValueToken {
    id: string;
    ownerId: string;
    assetId: string;
    tokenType: 'Labor' | 'Capital' | 'Reputation';
    amount: number;
}

export interface Vote {
    id: string;
    citizenId: string;
    proposalId: string;
    votePower: number;
    support: boolean;
}

export interface Task {
    id: string;
    assetId: string;
    assigneeId?: string;
    description: string;
    status: 'Open' | 'In Progress' | 'Completed';
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string;
}

export interface DACParams {
    id: string;
    name: string;
    value: string;
    description: string;
}

export interface Constitution {
    id: string;
    version: string;
    content: string;
    lastAmended: string;
}


// Below are the original types from the template, which you may want to remove or merge.
export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  reputation: number;
  credentials: string[];
  ownershipValue: number;
};

export type Proposal_Old = {
  id: string;
  title: string;
  description: string;
  proposer: User;
  status: 'active' | 'passed' | 'failed' | 'executing';
  votes: {
    for: number;
    against: number;
  };
  endsIn: string;
  category: string;
};

export type Asset = {
  id:string;
  name: string;
  description: string;
  imageId: string;
  aum: number;
  cashFlow: number;
  tasks: Task_Old[];
  location: string;
};

export type Task_Old = {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Completed';
  value: number; // in UVT
};

export type LedgerEntry = {
  id: string;
  type: 'Sweat Equity' | 'Capital' | 'Profit Distribution' | 'Governance';
  description: string;
  value: string;
  timestamp: string;
};
