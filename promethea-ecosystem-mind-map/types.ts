
export enum Category {
  SENTIENCE = 'The Sentient Spark (ASGI)',
  BODY = 'The House (DAC & Polity)',
  NEURAL = 'The Nervous System (Agnostic Adapters)',
  SUBSTRATE = 'The Foundation (DepthOS Pillars)',
  AWARENESS = 'Homeostatic Evolution (SBI)'
}

export interface NodeData {
  id: string;
  name: string;
  utility: string;
  connection: string;
  status: string;
  category: Category;
  isGap?: boolean;
  isMeta?: boolean;
  isInternal?: boolean;
}

export interface LinkData {
  source: string;
  target: string;
  isGap?: boolean;
  isInternal?: boolean;
}

export interface Ecosystem {
  nodes: NodeData[];
  links: LinkData[];
}

export interface Task {
  id: number | string;
  label: string;
  desc: string;
}

export interface Phase {
  phase: string;
  tasks: Task[];
}

export type RefactoringPlan = Phase[];

export type ImageSize = '1K' | '2K' | '4K';

export interface AppState {
  ecosystem: Ecosystem;
  plan: RefactoringPlan;
  isSyncing: boolean;
}
