'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

export type SpatialCategory = 'ALL' | 'PARCELS' | 'ENERGY' | 'TOWNHALL' | 'MEDIA' | 'GOVERNANCE';
export type RealityBoundary = 'LIVE' | 'SIM' | 'AI';
export type CockpitControlMode = 'CONVERSATIONAL' | 'SUPERVISED' | 'MANUAL';

export interface SpatialItem {
  id: string;
  title: string;
  subtitle?: string;
  category: SpatialCategory;
  realityBoundary: RealityBoundary;
  coordinates: { lat: number; lng: number; zoom?: number };
  stats?: { label: string; value: string; color?: string }[];
  description?: string;
  yieldRate?: string;
  status?: string;
  image?: string;
  actionType?: 'STAKE' | 'AUDIO_JOIN' | 'VAULT_VIEW' | 'SIGN_BIT' | 'VOTE' | 'CUSTOM';
  actionPayload?: any;
}

interface SpatialBusContextType {
  activeItemId: string | null;
  activeItem: SpatialItem | null;
  activeCategory: SpatialCategory;
  mapTarget: { lat: number; lng: number; zoom: number };
  searchQuery: string;
  isMarketplaceOpen: boolean;
  isCockpitOpen: boolean;
  cockpitControlMode: CockpitControlMode;
  agentActionQueue: any[];
  items: SpatialItem[];
  selectItem: (itemOrId: SpatialItem | string | null) => void;
  setActiveCategory: (cat: SpatialCategory) => void;
  setMapTarget: (coords: { lat: number; lng: number; zoom: number }) => void;
  setSearchQuery: (query: string) => void;
  setIsMarketplaceOpen: (open: boolean) => void;
  setIsCockpitOpen: (open: boolean) => void;
  setCockpitControlMode: (mode: CockpitControlMode) => void;
  triggerAgentAction: (action: string, payload?: any) => void;
  clearAgentAction: () => void;
}

const DEFAULT_ITEMS: SpatialItem[] = [
  {
    id: 'park-merced',
    title: 'Park Merced Sovereign Smarthood',
    subtitle: 'San Francisco, CA • Microgrid Cluster Alpha',
    category: 'PARCELS',
    realityBoundary: 'LIVE',
    coordinates: { lat: 37.7175, lng: -122.4836, zoom: 16 },
    stats: [
      { label: 'Installed Solar', value: '450 kW', color: 'text-emerald-400' },
      { label: 'Storage', value: '1.2 MWh', color: 'text-cyan-400' },
      { label: 'APY Yield', value: '8.4%', color: 'text-emerald-400' }
    ],
    description: 'Autonomous microgrid cluster serving residential density with peer-to-peer energy barter and zero-tax sovereign stewardship.',
    yieldRate: '8.4%',
    status: 'Operational',
    actionType: 'STAKE',
    actionPayload: { asset: 'Park Merced Grid Share', minStake: 100 }
  },
  {
    id: 'dubai-sovereign-hub',
    title: 'Dubai Sovereign Innovation Node',
    subtitle: 'DIFC Special Substrate • Trade Anchor',
    category: 'PARCELS',
    realityBoundary: 'LIVE',
    coordinates: { lat: 25.2048, lng: 55.2708, zoom: 15 },
    stats: [
      { label: 'Cap Table', value: '$14.2M USDC', color: 'text-emerald-400' },
      { label: 'Node Health', value: '99.98%', color: 'text-cyan-400' },
      { label: 'Settlement', value: 'Instant BIT', color: 'text-amber-400' }
    ],
    description: 'International legal and sovereign trade conduit integrating multi-jurisdictional smart contracts with physical real estate underwritings.',
    yieldRate: '11.2%',
    status: 'Settled',
    actionType: 'VAULT_VIEW',
    actionPayload: { document: 'Dubai_Framework_Treaty.pdf' }
  },
  {
    id: 'audio-commons-room',
    title: 'Spatial Audio Commons: Town Hall #14',
    subtitle: 'Global Frequency • Live Discussion',
    category: 'TOWNHALL',
    realityBoundary: 'LIVE',
    coordinates: { lat: 37.7749, lng: -122.4194, zoom: 14 },
    stats: [
      { label: 'Speakers', value: '4 Stewards', color: 'text-amber-400' },
      { label: 'Listeners', value: '142 Active', color: 'text-cyan-400' },
      { label: 'Bitrate', value: 'WebRTC P2P', color: 'text-emerald-400' }
    ],
    description: 'Constitutional debate regarding Autonomous Microgrid Expansion & EIP-7212 Passkey Gas Abstraction.',
    status: 'Live Now',
    actionType: 'AUDIO_JOIN',
    actionPayload: { channelId: 'townhall-main' }
  },
  {
    id: 'ozark-sanctuary',
    title: 'Ozark Ridge Autonomous Sanctuary',
    subtitle: 'Newton County, Arkansas • Agro-Ecology',
    category: 'PARCELS',
    realityBoundary: 'SIM',
    coordinates: { lat: 36.0084, lng: -93.1864, zoom: 15 },
    stats: [
      { label: 'Land Area', value: '42 Acres', color: 'text-amber-300' },
      { label: 'Target Equity', value: '$750k', color: 'text-zinc-300' },
      { label: 'Stage', value: 'DAO Underwriting', color: 'text-amber-400' }
    ],
    description: 'Autonomous permaculture research preserve, water harvesting topology, and off-grid research habitat.',
    yieldRate: '6.5%',
    status: 'Simulation / Underwriting',
    actionType: 'VOTE',
    actionPayload: { proposalId: 'prop-rwa-1' }
  },
  {
    id: 'solar-substrate-taos',
    title: 'Taos High-Desert Solar Node',
    subtitle: 'Taos, New Mexico • Clean Substrate Generation',
    category: 'ENERGY',
    realityBoundary: 'LIVE',
    coordinates: { lat: 36.4072, lng: -105.5731, zoom: 15 },
    stats: [
      { label: 'Generation', value: '150 kW', color: 'text-emerald-400' },
      { label: 'Daily Yield', value: '620 kWh', color: 'text-emerald-400' },
      { label: 'Protocol Node', value: 'ESP32 Substrate', color: 'text-cyan-400' }
    ],
    description: 'High-altitude photovoltaic array dispatching surplus watts into sovereign zero-knowledge validator compute.',
    yieldRate: '9.8%',
    status: 'Active Generation',
    actionType: 'SIGN_BIT',
    actionPayload: { nodeId: 'taos-solar-01' }
  },
  {
    id: 'media-sovereign-substrate',
    title: 'Video: Promethean Sovereign Substrate Briefing',
    subtitle: 'Master Media Showcase • Architecture & Vision',
    category: 'MEDIA',
    realityBoundary: 'AI',
    coordinates: { lat: 37.7749, lng: -122.4194, zoom: 12 },
    stats: [
      { label: 'Length', value: '12:45', color: 'text-cyan-400' },
      { label: 'Resolution', value: '4K Master', color: 'text-emerald-400' },
      { label: 'Format', value: 'MP4 / IPFS', color: 'text-amber-400' }
    ],
    description: 'Comprehensive video walk-through of the Promethean 3-Body Network State architecture, physical land integration, and autonomous AI stewards.',
    status: 'Available',
    actionType: 'CUSTOM',
    actionPayload: { mediaType: 'VIDEO', filename: 'Promethean_Sovereign_Substrate.mp4' }
  },
  {
    id: 'governance-eip7212',
    title: 'Docket #28: Universal Passkey Gas Subsidies',
    subtitle: 'Constitutional Amendment • Article VI',
    category: 'GOVERNANCE',
    realityBoundary: 'AI',
    coordinates: { lat: 37.7175, lng: -122.4836, zoom: 13 },
    stats: [
      { label: 'Quorum', value: '82%', color: 'text-cyan-400' },
      { label: 'Approval', value: '94.6%', color: 'text-emerald-400' },
      { label: 'Closes in', value: '3 Days', color: 'text-amber-400' }
    ],
    description: 'Proposal to allocate ASGI autonomous treasury profits to sponsor 100% of L1/L2 gas for all biometric EIP-7212 passkey actions by verified citizens.',
    status: 'Voting Open',
    actionType: 'VOTE',
    actionPayload: { docketId: 'docket-28' }
  }
];

const SpatialBusContext = createContext<SpatialBusContextType | undefined>(undefined);

export function SpatialBusProvider({ children }: { children: React.ReactNode }) {
  const [items] = useState<SpatialItem[]>(DEFAULT_ITEMS);
  const [activeItemId, setActiveItemId] = useState<string | null>('park-merced');
  const [activeCategory, setActiveCategory] = useState<SpatialCategory>('ALL');
  const [mapTarget, setMapTarget] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: 37.7175,
    lng: -122.4836,
    zoom: 15
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(true);
  const [isCockpitOpen, setIsCockpitOpen] = useState(true);
  const [cockpitControlMode, setCockpitControlMode] = useState<CockpitControlMode>('CONVERSATIONAL');
  const [agentActionQueue, setAgentActionQueue] = useState<any[]>([]);

  const activeItem = useMemo(() => {
    if (!activeItemId) return null;
    return items.find((i) => i.id === activeItemId) || null;
  }, [items, activeItemId]);

  const selectItem = useCallback((itemOrId: SpatialItem | string | null) => {
    if (!itemOrId) {
      setActiveItemId(null);
      return;
    }
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id;
    const found = items.find((i) => i.id === id);
    setActiveItemId(id);
    if (found?.coordinates) {
      setMapTarget({
        lat: found.coordinates.lat,
        lng: found.coordinates.lng,
        zoom: found.coordinates.zoom || 15
      });
    }
  }, [items]);

  const triggerAgentAction = useCallback((action: string, payload?: any) => {
    setAgentActionQueue((prev) => [...prev, { action, payload, timestamp: Date.now() }]);
    setIsCockpitOpen(true);
  }, []);

  const clearAgentAction = useCallback(() => {
    setAgentActionQueue([]);
  }, []);

  const value = useMemo(
    () => ({
      activeItemId,
      activeItem,
      activeCategory,
      mapTarget,
      searchQuery,
      isMarketplaceOpen,
      isCockpitOpen,
      cockpitControlMode,
      agentActionQueue,
      items,
      selectItem,
      setActiveCategory,
      setMapTarget,
      setSearchQuery,
      setIsMarketplaceOpen,
      setIsCockpitOpen,
      setCockpitControlMode,
      triggerAgentAction,
      clearAgentAction
    }),
    [
      activeItemId,
      activeItem,
      activeCategory,
      mapTarget,
      searchQuery,
      isMarketplaceOpen,
      isCockpitOpen,
      cockpitControlMode,
      agentActionQueue,
      items,
      selectItem,
      triggerAgentAction,
      clearAgentAction
    ]
  );

  return <SpatialBusContext.Provider value={value}>{children}</SpatialBusContext.Provider>;
}

export function useSpatialBus() {
  const context = useContext(SpatialBusContext);
  if (!context) {
    throw new Error('useSpatialBus must be used within a SpatialBusProvider');
  }
  return context;
}
