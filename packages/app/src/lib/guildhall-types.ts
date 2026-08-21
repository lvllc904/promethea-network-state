export type AccentRole = 'identity' | 'treasury' | 'consensus';
export type DataFreshness = 'live' | 'cached' | 'demo' | 'unavailable';
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';
export type CockpitSectionId = 'identity' | 'treasury' | 'consensus';
export type MapMode = 'SURFACE' | 'INTERSTELLAR';
export type ThemeKey = 'dark' | 'theme-latex' | 'theme-16bit' | 'theme-phosphor';

export interface NetworkSignal {
  id: string;
  category: string;
  type: string;
  title: string;
  content: string;
  author?: string;
  timestamp: string;
  reality?: string;
  bias?: {
    propaganda: number;
    sourceTrust: number;
    consensusScore: number;
    leaning?: string;
  };
  transcript?: string;
}

export interface NetworkMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  source?: string;
  updatedAt?: string;
  freshness: DataFreshness;
}

export interface TickerSnapshot {
  label: string;
  value: string;
  change?: number;
  prefix?: string;
  freshness: DataFreshness;
  source?: string;
  updatedAt?: string;
}

export interface ProposalSummary {
  id: string;
  title: string;
  yesPercent: number;
  status: 'open' | 'signed' | 'unavailable';
}

export interface DocumentAccessState {
  status: RequestStatus;
  error?: string;
  signature?: string;
}
