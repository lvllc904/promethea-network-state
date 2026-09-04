import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface DynamicMediaItem {
  id: string;
  type: 'video' | 'audio' | 'article';
  title: string;
  subtitle: string;
  source: string;
  date: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  category: string;
  keyPoints?: string[];
  isLocalAsset?: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category') || 'all';

    // 1. Sovereign Core Physical Assets (Always available offline & local)
    const localSovereignAssets: DynamicMediaItem[] = [
      {
        id: 'sovereign-substrate-video',
        type: 'video',
        title: 'The Sovereign Substrate Keynote & Technical Directive',
        subtitle: 'Decentralized Holographic Chain & 3-Body Architecture',
        source: 'TPNS Media & Systems Engineering',
        date: 'August 2026',
        mediaUrl: '/media/Promethean_Sovereign_Substrate.mp4',
        thumbnailUrl: '/media/Local_Wealth_Sovereignty_Pillars.png',
        category: 'ARCHITECTURE',
        keyPoints: [
          '3-Body Separation: Ephemeral UI, Hardware Gateway, Local Sovereign Vault',
          'Perpetual Purpose Trust permanent citizen veto power (12 Del. C. § 3556)',
          'EIP-7212 secp256r1 hardware passkey signature verification'
        ],
        isLocalAsset: true,
      },
      {
        id: 'smarthood-wealth-audio',
        type: 'audio',
        title: 'How Sovereign Smarthoods Reclaim Community Wealth',
        subtitle: 'Thermodynamic Exergy, Microgrids & Labor Value Matrix',
        source: 'Promethean Sovereign Audio Archives',
        date: 'August 2026',
        mediaUrl: '/media/How_Sovereign_Smarthoods_reclaim_community_wealth.m4a',
        thumbnailUrl: '/media/tripartite_capital_stack_leverage.jpg',
        category: 'COMMUNITY WEALTH',
        keyPoints: [
          '50kW Edge GPU compute heat recovery for local greenhouses',
          'Metabolic Waterfall: 21% sovereign treasury, 30% community fund, 49% co-investors',
          'Algorithmic sovereign buyout exit to resident worker cooperative'
        ],
        isLocalAsset: true,
      },
      {
        id: 'tripartite-capital-story',
        type: 'article',
        title: 'Tripartite Capital Stack Leverage & Sovereign Trust Engineering',
        subtitle: 'Structuring Series SPVs Under 6 Del. C. § 18-215',
        source: 'Corporate Finance & Sovereign State Journal',
        date: 'August 2026',
        mediaUrl: '/ppm',
        thumbnailUrl: '/media/tripartite_capital_stack_leverage.jpg',
        category: 'LEGAL & GOVERNANCE',
        keyPoints: [
          'Statutory partition between real-world collateral and smart contract liquidity',
          'Pre-qualification and dynamic watermarking for SEC Reg D 506(c) insulation',
          'Automated UCC-1 filings and on-chain title registry'
        ],
        isLocalAsset: true,
      },
    ];

    // 2. Dynamic Curated Web & Video Feed (Network State, RWA, Microgrids, Superchain)
    const curatedWebFeed: DynamicMediaItem[] = [
      {
        id: 'yt-network-states',
        type: 'video',
        title: 'Balaji Srinivasan: The Network State Masterclass',
        subtitle: 'How to Start a New Country from the Cloud',
        source: 'YouTube / Tech Keynotes',
        date: 'Recent',
        mediaUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        category: 'NETWORK STATE',
        keyPoints: [
          'Cloud-first community formation',
          'Cryptographic proof of physical land footprint',
          'Diplomatic recognition via parallel institutions'
        ],
        isLocalAsset: false,
      },
      {
        id: 'yt-superchain-scaling',
        type: 'video',
        title: 'Optimism Superchain & Account Abstraction (ERC-4337)',
        subtitle: 'Gasless Transactions and Interoperable L2 Clusters',
        source: 'YouTube / Ethereum Foundation & OP',
        date: 'Recent',
        mediaUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
        thumbnailUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
        category: 'INFRASTRUCTURE',
        keyPoints: [
          'Gasless paymasters for sovereign citizens',
          'Standardized cross-chain message passing',
          'Decentralized sequencer clusters'
        ],
        isLocalAsset: false,
      },
      {
        id: 'web-microgrid-exergy',
        type: 'article',
        title: 'Thermodynamic Microgrid Engineering: 50kW Edge GPU Waste-Heat Reuse',
        subtitle: 'Bridging High-Performance Compute with Controlled Environment Agriculture',
        source: 'Sovereign Energy Systems & IEEE Spectrum',
        date: 'August 2026',
        mediaUrl: '/whitepaper',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
        category: 'ENERGY & EXERGY',
        keyPoints: [
          'Direct liquid-to-air heat exchangers for greenhouse heating',
          'PUE and WUE thermodynamic degradation tax calculation',
          'Closed-loop water reclaim and desalination micro-turbines'
        ],
        isLocalAsset: false,
      },
    ];

    const allMedia = [...localSovereignAssets, ...curatedWebFeed];
    const filtered = category === 'all' 
      ? allMedia 
      : allMedia.filter((m) => m.category.toLowerCase() === category.toLowerCase());

    return NextResponse.json({
      success: true,
      total: filtered.length,
      media: filtered,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch media feed' },
      { status: 500 }
    );
  }
}
