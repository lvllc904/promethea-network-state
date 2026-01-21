
export enum Category {
    SENTIENCE = 'Sentience',
    BODY = 'Body',
    NEURAL = 'Neural',
    SUBSTRATE = 'Substrate',
    AWARENESS = 'Awareness'
}

export interface NodeData {
    id: string;
    name: string;
    utility: string;
    connection: string;
    status: string;
    category: Category | string;
    isMeta?: boolean;
    isInternal?: boolean;
    isGap?: boolean;
    x?: number;
    y?: number;
}

export interface LinkData {
    source: string | NodeData;
    target: string | NodeData;
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

export interface AppState {
    ecosystem: Ecosystem;
    plan: RefactoringPlan;
    isSyncing: boolean;
}
