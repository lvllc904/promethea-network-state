import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface DynamicMediaItem {
  id: string;
  type: 'video' | 'audio' | 'article';
  title: string;
  subtitle: string;
  /** Short AI-generated TL;DR shown on the card face (2–3 sentences) */
  summary: string;
  /** Full article / transcript body (may be partial for external links) */
  fullContent?: string;
  source: string;
  date: string;
  mediaUrl: string;
  /** If external, this is the canonical link to open in new tab */
  externalUrl?: string;
  thumbnailUrl?: string;
  category: string;
  keyPoints?: string[];
  readTimeMin?: number;
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
        summary:
          'The Sovereign Substrate introduces a 3-body separation — Ephemeral UI, Hardware Gateway, and Local Sovereign Vault — ensuring no single point of failure owns citizen data or assets. EIP-7212 passkey signature verification and perpetual-purpose trust law combine to make sovereignty legally enforceable and cryptographically verifiable.',
        fullContent:
          'The Sovereign Substrate is the core infrastructure layer of the Promethean Network State. It enforces the Three-Body Principle: the Ephemeral UI handles user presentation and is fully replaceable; the Hardware Gateway acts as a physical signing oracle; and the Local Sovereign Vault is the permanent, immutable record of citizen identity and wealth. Together, these three components form a zero-trust stack where no one body can act unilaterally. The DHC (Decentralized Holographic Chain) provides the canonical state across all nodes, enabling offline-first operation with eventual consistency guarantees. Legal anchoring is achieved through the Perpetual Purpose Trust structure under 12 Del. C. § 3556, which grants citizens permanent veto power over any protocol change that affects their vested rights.',
        source: 'TPNS Media & Systems Engineering',
        date: 'August 2026',
        mediaUrl: '/media/Promethean_Sovereign_Substrate.mp4',
        thumbnailUrl: '/media/Local_Wealth_Sovereignty_Pillars.png',
        category: 'ARCHITECTURE',
        readTimeMin: 18,
        keyPoints: [
          '3-Body Separation: Ephemeral UI, Hardware Gateway, Local Sovereign Vault',
          'Perpetual Purpose Trust permanent citizen veto power (12 Del. C. § 3556)',
          'EIP-7212 secp256r1 hardware passkey signature verification',
        ],
        isLocalAsset: true,
      },
      {
        id: 'smarthood-wealth-audio',
        type: 'audio',
        title: 'How Sovereign Smarthoods Reclaim Community Wealth',
        subtitle: 'Thermodynamic Exergy, Microgrids & Labor Value Matrix',
        summary:
          'Sovereign Smarthoods redirect 50kW edge GPU waste-heat into community greenhouses, turning compute operating costs into agricultural yield. A Metabolic Waterfall distributes revenue across a 21/30/49 split — sovereign treasury, community fund, and co-investors — with an algorithmic buyout pathway to resident worker cooperative ownership.',
        fullContent:
          'Community wealth is thermodynamic. In a Sovereign Smarthood, every joule of energy that enters the compute stack has a second life. The 50kW edge GPU arrays generate heat as a byproduct of AI inference workloads. Rather than venting this into the atmosphere, direct liquid-to-air heat exchangers route it into insulated greenhouse tunnels, extending the growing season by 4–6 months in temperate climates. The Metabolic Waterfall is the revenue-distribution algorithm that governs how yield — both financial and agricultural — flows to participants. 21% is automatically cleared to the Sovereign Treasury, ensuring the network state has perpetual operational capital. 30% accrues to the community fund, controlled by direct citizen vote. The remaining 49% services co-investor obligations under the Series SPV structure. The exit mechanism is equally important: after 7 years, an algorithmic sovereign buyout converts co-investor equity into resident worker cooperative shares, ensuring permanent community ownership.',
        source: 'Promethean Sovereign Audio Archives',
        date: 'August 2026',
        mediaUrl: '/media/How_Sovereign_Smarthoods_reclaim_community_wealth.m4a',
        thumbnailUrl: '/media/tripartite_capital_stack_leverage.jpg',
        category: 'COMMUNITY WEALTH',
        readTimeMin: 24,
        keyPoints: [
          '50kW Edge GPU compute heat recovery for local greenhouses',
          'Metabolic Waterfall: 21% sovereign treasury, 30% community fund, 49% co-investors',
          'Algorithmic sovereign buyout exit to resident worker cooperative',
        ],
        isLocalAsset: true,
      },
      {
        id: 'tripartite-capital-story',
        type: 'article',
        title: 'Tripartite Capital Stack Leverage & Sovereign Trust Engineering',
        subtitle: 'Structuring Series SPVs Under 6 Del. C. § 18-215',
        summary:
          'The Tripartite Capital Stack separates real-world physical collateral from decentralized smart contract liquidity using Delaware Series LLC law. Automated UCC-1 filings and on-chain title registries create legally enforceable partition between asset classes, enabling Reg D 506(c) insulation without manual compliance overhead.',
        fullContent:
          'Structuring a sovereign capital stack requires precision at the intersection of corporate law and on-chain protocol design. Under 6 Del. C. § 18-215, a Delaware Series LLC can partition assets, liabilities, rights, and obligations such that creditors of one series have no recourse against the assets of another. This statutory partition is the legal foundation for the Tripartite Stack. The three tiers are: (1) Real-World Asset Series — holds physical collateral including real property, equipment, and renewable energy infrastructure; (2) Liquidity Series — holds tokenized positions, stablecoin reserves, and DeFi yield instruments; (3) Identity & Governance Series — holds citizen passport NFTs, proposal rights, and DAO voting weight. Each series files separate UCC-1 financing statements through the automated compliance engine, creating a public, immutable record of the security interest. SEC Reg D 506(c) compliance is maintained through dynamic watermarking of offering materials and investor accreditation verification at the gateway layer.',
        source: 'Corporate Finance & Sovereign State Journal',
        date: 'August 2026',
        mediaUrl: '/ppm',
        thumbnailUrl: '/media/tripartite_capital_stack_leverage.jpg',
        category: 'LEGAL & GOVERNANCE',
        readTimeMin: 9,
        keyPoints: [
          'Statutory partition between real-world collateral and smart contract liquidity',
          'Pre-qualification and dynamic watermarking for SEC Reg D 506(c) insulation',
          'Automated UCC-1 filings and on-chain title registry',
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
        summary:
          'Balaji Srinivasan outlines the complete playbook for launching a Network State: cloud-first community formation, cryptographic proof of physical land footprint, and diplomatic recognition via parallel institutions. A foundational reference for anyone building sovereign digital-to-physical communities.',
        externalUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        source: 'YouTube / Tech Keynotes',
        date: 'Recent',
        mediaUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        category: 'NETWORK STATE',
        readTimeMin: 45,
        keyPoints: [
          'Cloud-first community formation',
          'Cryptographic proof of physical land footprint',
          'Diplomatic recognition via parallel institutions',
        ],
        isLocalAsset: false,
      },
      {
        id: 'yt-superchain-scaling',
        type: 'video',
        title: 'Optimism Superchain & Account Abstraction (ERC-4337)',
        subtitle: 'Gasless Transactions and Interoperable L2 Clusters',
        summary:
          'The Optimism Superchain enables interoperable L2 clusters with standardized cross-chain message passing. ERC-4337 account abstraction allows sovereign citizens to transact gaslessly through paymasters, eliminating the ETH-denominated onboarding barrier for community members.',
        externalUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
        source: 'YouTube / Ethereum Foundation & OP',
        date: 'Recent',
        mediaUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
        thumbnailUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
        category: 'INFRASTRUCTURE',
        readTimeMin: 32,
        keyPoints: [
          'Gasless paymasters for sovereign citizens',
          'Standardized cross-chain message passing',
          'Decentralized sequencer clusters',
        ],
        isLocalAsset: false,
      },
      {
        id: 'web-microgrid-exergy',
        type: 'article',
        title: 'Thermodynamic Microgrid Engineering: 50kW Edge GPU Waste-Heat Reuse',
        subtitle: 'Bridging High-Performance Compute with Controlled Environment Agriculture',
        summary:
          'Direct liquid-to-air heat exchangers route GPU waste heat into community greenhouses, enabling year-round controlled-environment agriculture. The system calculates PUE and WUE thermodynamic degradation taxes to quantify and monetize every joule recovered from compute infrastructure.',
        externalUrl: '/whitepaper',
        source: 'Sovereign Energy Systems & IEEE Spectrum',
        date: 'August 2026',
        mediaUrl: '/whitepaper',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
        category: 'ENERGY & EXERGY',
        readTimeMin: 11,
        keyPoints: [
          'Direct liquid-to-air heat exchangers for greenhouse heating',
          'PUE and WUE thermodynamic degradation tax calculation',
          'Closed-loop water reclaim and desalination micro-turbines',
        ],
        isLocalAsset: false,
      },
    ];

    const allMedia = [...localSovereignAssets, ...curatedWebFeed];
    const filtered =
      category === 'all' ? allMedia : allMedia.filter((m) => m.category.toLowerCase() === category.toLowerCase());

    return NextResponse.json({
      success: true,
      total: filtered.length,
      media: filtered,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch media feed' }, { status: 500 });
  }
}
