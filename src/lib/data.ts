import type { User, Proposal, Asset, LedgerEntry, Task } from './types';

export const users: User[] = [
  { id: 'user1', name: 'Joshua Wicke', avatarUrl: 'user1', reputation: 987, credentials: ['Founding Member', 'AI Ethics Certified'], ownershipValue: 125000 },
  { id: 'user2', name: 'Eleanor Vance', avatarUrl: 'user2', reputation: 850, credentials: ['RWA Manager', 'Solidity Dev'], ownershipValue: 78000 },
  { id: 'user3', name: 'Kenji Tanaka', avatarUrl: 'user3', reputation: 720, credentials: ['Electrician', 'Mesh Network Specialist'], ownershipValue: 45000 },
];

export const mainUser = users[0];

export const proposals: Proposal[] = [
  {
    id: 'prop1',
    title: 'Acquire "The Phoenix" Apartment Complex in Brooklyn',
    description: 'Proposal to acquire a 50-unit apartment complex in Brooklyn, NY. The property has a strong cash flow history and presents an opportunity for value-add through green energy retrofits, deploying sweat equity from local members.',
    proposer: users[1],
    status: 'active',
    votes: { for: 1258, against: 112 },
    endsIn: '3 days',
    category: 'RWA Acquisition'
  },
  {
    id: 'prop2',
    title: 'Update Reputation Decay Algorithm',
    description: 'This proposal suggests a modification to the reputation decay algorithm to better reward recent, high-impact contributions and reduce the weight of older, less relevant activities. The goal is to ensure the meritocracy remains dynamic.',
    proposer: users[0],
    status: 'passed',
    votes: { for: 2340, against: 88 },
    endsIn: 'Ended',
    category: 'Governance'
  },
  {
    id: 'prop3',
    title: 'Fund Development of a Universal Virtualization Bridge for DepthOS',
    description: 'Allocate treasury funds to a dedicated development team to build the Universal Virtualization Bridge, enabling DepthOS to run any other operating system for free. This is a critical step for our "Warm Transition" strategy.',
    proposer: users[2],
    status: 'executing',
    votes: { for: 1987, against: 201 },
    endsIn: 'Ended',
    category: 'Technology'
  },
];

const asset1Tasks: Task[] = [
    {id: 't1', title: 'Repair Plumbing in Unit 12B', description: 'Fix leaking faucet and replace shower head.', status: 'Open', value: 150},
    {id: 't2', title: 'Paint Common Area Hallways', description: 'Repaint hallways on floors 3 and 4.', status: 'In Progress', value: 1200},
    {id: 't3', title: 'Landscape Front Courtyard', description: 'Plant new flowers and trim hedges.', status: 'Open', value: 300},
]

const asset2Tasks: Task[] = [
    {id: 't4', title: 'Install Automated Irrigation System', description: 'Set up a new water-efficient irrigation system for the north field.', status: 'Open', value: 2500},
    {id: 't5', title: 'Soil Quality Analysis', description: 'Take soil samples from all 5 fields and send for lab analysis.', status: 'Completed', value: 200},
]


export const assets: Asset[] = [
  {
    id: 'asset1',
    name: 'The Phoenix Apartments',
    description: 'A 50-unit residential complex in Brooklyn, NY, serving as a primary node in the Promethean Archipelago.',
    imageId: 'asset1',
    aum: 15_500_000,
    cashFlow: 45_000,
    tasks: asset1Tasks,
    location: 'Brooklyn, NY'
  },
  {
    id: 'asset2',
    name: 'Verdant Valley Farmlands',
    description: '1,000 acres of fertile agricultural land in Central California, focused on sustainable and organic crop production.',
    imageId: 'asset2',
    aum: 8_200_000,
    cashFlow: 22_000,
    tasks: asset2Tasks,
    location: 'Central Valley, CA'
  },
  {
    id: 'asset3',
    name: 'The Daily Grind Cafe',
    description: 'A community-owned coffee shop and meeting space in a bustling urban area.',
    imageId: 'asset3',
    aum: 750_000,
    cashFlow: 8_500,
    tasks: [],
    location: 'Denver, CO'
  },
  {
    id: 'asset4',
    name: 'Rooftop Solar Initiative',
    description: 'A portfolio of rooftop solar installations across multiple owned assets, generating clean energy and revenue.',
    imageId: 'asset4',
    aum: 1_200_000,
    cashFlow: 12_000,
    tasks: [],
    location: 'Network-wide'
  },
];

export const ledger: LedgerEntry[] = [
  { id: 'txn1', type: 'Sweat Equity', description: 'K. Tanaka - Mesh network setup (Node: Phoenix Apts)', value: '+450 UVT', timestamp: '2025-10-07T14:00:00Z' },
  { id: 'txn2', type: 'Profit Distribution', description: 'Verdant Valley Farmlands - Q3 Distribution', value: '+$1.25/token', timestamp: '2025-10-05T18:30:00Z' },
  { id: 'txn3', type: 'Capital', description: 'E. Vance - Capital investment for Prop #1', value: '+10,000 USDC', timestamp: '2025-10-04T11:00:00Z' },
  { id: 'txn4', type: 'Governance', description: 'Vote Cast: Proposal #2 (Reputation Decay)', value: '-10 Voice Credits', timestamp: '2025-10-03T09:20:00Z' },
  { id: 'txn5', type: 'Sweat Equity', description: 'J. Wicke - Whitepaper V12.777 finalization', value: '+1,000 UVT', timestamp: '2025-10-02T23:59:00Z' },
];
