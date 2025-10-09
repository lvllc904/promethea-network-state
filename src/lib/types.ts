export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  reputation: number;
  credentials: string[];
  ownershipValue: number;
};

export type Proposal = {
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
  tasks: Task[];
  location: string;
};

export type Task = {
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
