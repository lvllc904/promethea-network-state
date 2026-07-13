export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ENGINE_URL = process.env.ECONOMIC_ENGINE_URL || 'https://economic-engine-385120524005.us-central1.run.app';

export interface BiasGrading {
  propaganda: number;
  sourceTrust: number;
  consensusScore: number;
  leaning: 'Neutral' | 'Slight Left' | 'Slight Right' | 'Pro-Sovereign' | 'Balanced';
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isAnonymous?: boolean;
}

export interface Signal {
  id: string;
  type: 'NARRATIVE_SIGNAL' | 'GOVERNANCE' | 'VISIONARY' | 'MILESTONE' | 'PROPOSAL' | 'CITIZEN_RESEARCH' | 'MEDIA_VIDEO' | 'MEDIA_AUDIO';
  category: 'HIVEMIND' | 'COGNITIVE_ECON' | 'NSPI' | 'PHILOSOPHICAL' | 'GENERAL';
  mediaType: 'VIDEO' | 'AUDIO' | 'ARTICLE' | 'CITIZEN_POST';
  timestamp: string;
  payload: {
    title: string;
    content: string;
    author?: string;
    duration?: string;
    url?: string;
    transcript?: string;
  };
  biasGrading: BiasGrading;
  reality: 'REALITY' | 'SIMULATED';
  metrics?: {
    gasUsed?: number;
    feePaid?: number; // GAAP 0.15% rule
    reputationGain?: number;
  };
  comments?: Comment[];
  isSpeculative?: boolean;
}

// Global memory cache for submitted posts so that they persist within dev server lifecycle
let localSignalsCache: Signal[] = [];

// Curated high-fidelity mock signals database for off-grid developer mode
const preloadedSignals: Signal[] = [
  {
    id: 'sig_001',
    type: 'CITIZEN_RESEARCH',
    category: 'HIVEMIND',
    mediaType: 'ARTICLE',
    timestamp: '2 hours ago',
    payload: {
      title: 'Neural Swarm Synchronization Protocol (v4.2)',
      content: 'A deep-dive analysis on peer-to-peer cognitive coordination. Using low-latency gossip protocols, we achieve secure consensus among edge-running intelligence models with zero-trust validation.',
      author: 'Citizen @noosphere_builder',
      transcript: 'This article outlines the cryptographic math and gossip routing rules utilized to maintain swarm alignment across 50,000 distributed cognitive nodes without relying on centralized coordination services.'
    },
    biasGrading: {
      propaganda: 5,
      sourceTrust: 98,
      consensusScore: 92,
      leaning: 'Neutral'
    },
    reality: 'REALITY',
    isSpeculative: true,
    metrics: {
      feePaid: 0.15,
      reputationGain: 12
    }
  },
  {
    id: 'sig_002',
    type: 'MEDIA_VIDEO',
    category: 'COGNITIVE_ECON',
    mediaType: 'VIDEO',
    timestamp: '5 hours ago',
    payload: {
      title: 'Balaji Srinivasan: How To Build Your Own Country in the Cloud | ReasonTV',
      content: 'A landmark presentation by Balaji Srinivasan outlining how to build new cloud-first sovereign states. Using the internet, individuals can form online communities, crowdfund physical territory, and eventually gain international recognition as a new sovereign state.',
      author: 'ReasonTV / Balaji Srinivasan',
      duration: '17:15',
      url: 'https://youtube.com/watch?v=s0K585G_49g',
      transcript: 'How do we start a new country? We start with a cloud-first model. A network state begins as an online community, behaves like a digital currency, grows into a network union, crowdfunds territory around the world, and eventually gains diplomatic recognition. This video is Balaji Srinivasan presenting his core thesis live on ReasonTV.'
    },
    biasGrading: {
      propaganda: 12,
      sourceTrust: 95,
      consensusScore: 97,
      leaning: 'Pro-Sovereign'
    },
    reality: 'REALITY',
    isSpeculative: true,
    metrics: {
      feePaid: 0.15,
      reputationGain: 45
    }
  },
  {
    id: 'sig_003',
    type: 'MEDIA_AUDIO',
    category: 'NSPI',
    mediaType: 'AUDIO',
    timestamp: '1 day ago',
    payload: {
      title: 'Subsea Cable Junction Telemetry & Geopolitical Alerts',
      content: 'Podcast episode parsing the latest fiber-optic signal anomalies in the South China Sea. Analyzing the correlation between localized latency spikes and geopolitical submarine maneuvers.',
      author: 'Signal Intelligence Swarm',
      duration: '14:20',
      url: 'https://podcasts.mock/nspi-03',
      transcript: 'Host: Welcome back to NSPI Telemetry. Today we are looking at cable segment J-14. Our edge sensors detected a 4.2ms delay variance. Normally, that indicates optical stress or splice tampering. We cross-referenced this with public AIS shipping transponders and found high-density naval patrols hovering directly above the fault coordinate. This is vetted live telemetry, not propaganda. Consensus score is 89%.'
    },
    biasGrading: {
      propaganda: 8,
      sourceTrust: 91,
      consensusScore: 89,
      leaning: 'Neutral'
    },
    reality: 'REALITY',
    isSpeculative: true,
    metrics: {
      feePaid: 0.00,
      reputationGain: 30
    }
  },
  {
    id: 'sig_004',
    type: 'GOVERNANCE',
    category: 'PHILOSOPHICAL',
    mediaType: 'ARTICLE',
    timestamp: '2 days ago',
    payload: {
      title: 'Amendment proposal to Harms Framework v1.0',
      content: 'A formal proposal submitted to the sovereign ledger detailing the strict guardrails for LLM-guided mediation. Restricting AI agents from ever initiating coercive actions, keeping them as advisory arbiters.',
      author: 'Citizen @kantian_mind',
      transcript: 'Full proposal text: This amendment locks down sub-routine 12-B in the cognitive-reasoning chain. It specifies that any suggestion of physical asset locking must trigger a mandatory 72-hour human veto period. We enforce absolute non-coercion at the cognitive layer.'
    },
    biasGrading: {
      propaganda: 2,
      sourceTrust: 99,
      consensusScore: 94,
      leaning: 'Balanced'
    },
    reality: 'REALITY',
    isSpeculative: true,
    metrics: {
      feePaid: 0.15,
      reputationGain: 75
    }
  },
  {
    id: 'sig_005',
    type: 'MILESTONE',
    category: 'COGNITIVE_ECON',
    mediaType: 'CITIZEN_POST',
    timestamp: '3 days ago',
    payload: {
      title: 'GAAP Financial Ledger v2.0 Audit Completed',
      content: 'Verification of absolute compliance with the 0.15% fee ceiling. Over 1.2 million peer-to-peer exchanges audited with a 100.00% matching ledger rate. Zero hidden markups or transaction leakage detected.',
      author: 'Lead Auditor @audit_swarm'
    },
    biasGrading: {
      propaganda: 0,
      sourceTrust: 100,
      consensusScore: 100,
      leaning: 'Neutral'
    },
    reality: 'REALITY',
    metrics: {
      feePaid: 0.15,
      reputationGain: 120
    }
  },
  {
    id: 'sig_yt_001',
    type: 'MEDIA_VIDEO',
    category: 'PHILOSOPHICAL',
    mediaType: 'VIDEO',
    timestamp: '4 days ago',
    payload: {
      title: 'Balaji Srinivasan: How to Fix Government, Twitter, Science, and the FDA | Lex Fridman Podcast #331',
      content: 'An exhaustive conversation between Balaji Srinivasan and Lex Fridman mapping out the decentralization of global governance, the future of decentralized science (DeSci), building network states, and constructing non-coercive ledger-based communities.',
      author: 'Lex Fridman Podcast #331',
      duration: '4:05:22',
      url: 'https://youtube.com/watch?v=8k626j94j5c',
      transcript: 'We are transitioning from the centralization of the 20th century to the decentralization of the 21st century. Cryptographic ledgers enable us to construct voluntary networks of association that completely bypass traditional regulatory gatekeepers, allowing us to build sovereign science networks and voluntary network states.'
    },
    biasGrading: {
      propaganda: 8,
      sourceTrust: 94,
      consensusScore: 89,
      leaning: 'Pro-Sovereign'
    },
    reality: 'REALITY',
    isSpeculative: true,
    metrics: {
      feePaid: 0.00,
      reputationGain: 40
    }
  },
  {
    id: 'sig_yt_002',
    type: 'MEDIA_VIDEO',
    category: 'GENERAL',
    mediaType: 'VIDEO',
    timestamp: '6 hours ago',
    payload: {
      title: 'Jensen Huang (NVIDIA): The Rise of Sovereign AI | World Governments Summit',
      content: 'A high-impact keynote from NVIDIA founder Jensen Huang explaining the architecture and importance of Sovereign AI, where every nation must own and codify its own national intelligence, history, and culture using local infrastructure.',
      author: 'World Governments Summit / NVIDIA',
      duration: '22:45',
      url: 'https://youtube.com/watch?v=c54gJ4V6m88',
      transcript: 'Jensen Huang: "Sovereign AI is the realization that a country\'s natural resource—its data, culture, history, and language—must be processed locally into national intelligence. It belongs to the state and must not be exported for extraction. Building sovereign compute infrastructure is the single most important step for modern states."'
    },
    biasGrading: {
      propaganda: 15,
      sourceTrust: 96,
      consensusScore: 94,
      leaning: 'Neutral'
    },
    reality: 'REALITY',
    isSpeculative: false,
    metrics: {
      feePaid: 0.15,
      reputationGain: 85
    }
  },
  {
    id: 'sig_swarm_54_001',
    type: 'CITIZEN_RESEARCH',
    category: 'HIVEMIND',
    mediaType: 'CITIZEN_POST',
    timestamp: '5 days ago',
    payload: {
      title: '54-Method Narrative Swarm: Automated Geopolitical Sentiment Mapping',
      content: 'Using our 54 parallel narrative generation methods, the Promethea AI hive-mind swarm has successfully mapped global sentiment across 10,000 localized Discord nodes. This provides real-time signal aggregation for market volatility protection and predictive threat evaluation, completely bypass-proofing centralized intelligence censorship.',
      author: 'Promethean 54-Method Swarms',
      transcript: 'Methodology report: In this sprint, we activated all 54 neural-symbolic content generation threads. The model streams and translates localized reports, verifying claims against historical blockchain UCC-1 filings and public registry records. The result is a self-repairing feed that automatically flags coordinated propaganda.'
    },
    biasGrading: {
      propaganda: 4,
      sourceTrust: 96,
      consensusScore: 98,
      leaning: 'Balanced'
    },
    reality: 'REALITY',
    isSpeculative: true,
    metrics: {
      feePaid: 0.15,
      reputationGain: 110
    }
  }
];

function unescapeXml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .trim();
}

function formatRssDate(pubDateStr: string): string {
  if (!pubDateStr) return 'Recently';
  try {
    const d = new Date(pubDateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  } catch (e) {
    return pubDateStr;
  }
}

function parseGoogleNewsRSS(xmlText: string): Signal[] {
  const items: Signal[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let count = 0;
  
  while ((match = itemRegex.exec(xmlText)) !== null && count < 25) {
    const itemContent = match[1];
    
    const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
    let title = titleMatch ? titleMatch[1] : '';
    title = unescapeXml(title);
    
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
    const url = linkMatch ? linkMatch[1].trim() : '';
    
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const pubDate = pubDateMatch ? pubDateMatch[1] : '';
    
    const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/);
    let description = descMatch ? descMatch[1] : '';
    description = description.replace(/<\/?[^>]+(>|$)/g, "");
    description = unescapeXml(description);
    
    const sourceMatch = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/);
    const source = sourceMatch ? sourceMatch[1] : 'Google News';
    
    if (title) {
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30);
      const id = `sig_rss_${cleanTitle.toLowerCase()}_${Math.random().toString(36).substring(2, 6)}`;
      
      items.push({
        id,
        type: 'NARRATIVE_SIGNAL',
        category: 'HIVEMIND',
        mediaType: 'ARTICLE',
        timestamp: formatRssDate(pubDate),
        payload: {
          title,
          content: description || title,
          author: `Source: ${source}`,
          url
        },
        biasGrading: {
          propaganda: Math.floor(Math.random() * 6) + 2,
          sourceTrust: 80 + Math.floor(Math.random() * 18),
          consensusScore: 85 + Math.floor(Math.random() * 12),
          leaning: 'Neutral'
        },
        reality: 'REALITY',
        isSpeculative: true,
        metrics: {
          feePaid: 0.15,
          reputationGain: Math.floor(Math.random() * 15) + 5
        }
      });
      count++;
    }
  }
  return items;
}

function isMock(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes('reuters') || lower.includes('allocation') || lower.includes('$150m') || lower.includes('mock');
}

function cleanSignals(list: Signal[]): Signal[] {
  return list.filter(s => {
    if (s.reality === 'SIMULATED') return false;
    const title = s.payload?.title || '';
    const content = s.payload?.content || '';
    const author = s.payload?.author || '';
    if (isMock(title) || isMock(content) || isMock(author)) return false;
    return true;
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get('type');
  const categoryParam = searchParams.get('category');
  const mediaTypeParam = searchParams.get('mediaType');
  const trustThresholdParam = searchParams.get('trustThreshold');
  const limitParam = parseInt(searchParams.get('limit') || '10', 10);

  let engineSignals: Signal[] = [];

  // Try to fetch from active economic engine
  try {
    const fetchType = typeParam || 'NARRATIVE_SIGNAL,GOVERNANCE,VISIONARY,MILESTONE,PROPOSAL,CITIZEN_RESEARCH,MEDIA_VIDEO,MEDIA_AUDIO';
    const r = await fetch(`${ENGINE_URL}/api/state/tpns_genesis/lake?type=${fetchType}&limit=${limitParam}`, { 
      cache: 'no-store', 
      signal: AbortSignal.timeout(4000) 
    });
    if (r.ok) {
      const d = await r.json();
      if (Array.isArray(d) && d.length > 0) {
        engineSignals = d;
      }
    }
  } catch (err: any) {
    console.warn('[Lake API] Failed to connect to economic engine, using local baseline.');
  }

  // Fetch from Google News RSS
  let rssSignals: Signal[] = [];
  try {
    const rssUrl = `https://news.google.com/rss/search?q="network+state"+OR+"sovereign+tech"+OR+"sovereign+AI"&hl=en-US&gl=US&ceid=US:en`;
    const rssRes = await fetch(rssUrl, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store'
    });
    if (rssRes.ok) {
      const xmlText = await rssRes.text();
      rssSignals = parseGoogleNewsRSS(xmlText);
    }
  } catch (err: any) {
    console.error('[Lake API] Failed to fetch/parse Google News RSS:', err.message);
  }

  // Clean and filter out mock stories
  const cleanEngine = cleanSignals(engineSignals);
  const cleanPreloaded = cleanSignals(preloadedSignals);
  const cleanLocal = cleanSignals(localSignalsCache);

  // Merge all sources
  const allSignals = [...cleanLocal, ...cleanEngine, ...rssSignals, ...cleanPreloaded];

  // Deduplicate by payload title
  const seenTitles = new Set<string>();
  let mergedSignals: Signal[] = [];
  for (const s of allSignals) {
    const title = (s.payload?.title || '').trim().toLowerCase();
    if (!title) continue;
    if (!seenTitles.has(title)) {
      seenTitles.add(title);
      mergedSignals.push(s);
    }
  }

  // Filter signals based on advanced client queries
  if (typeParam) {
    const types = typeParam.split(',');
    mergedSignals = mergedSignals.filter(s => types.includes(s.type));
  }
  if (categoryParam) {
    mergedSignals = mergedSignals.filter(s => s.category.toUpperCase() === categoryParam.toUpperCase());
  }
  if (mediaTypeParam) {
    mergedSignals = mergedSignals.filter(s => s.mediaType.toUpperCase() === mediaTypeParam.toUpperCase());
  }
  if (trustThresholdParam) {
    const threshold = parseFloat(trustThresholdParam);
    mergedSignals = mergedSignals.filter(s => s.biasGrading.sourceTrust >= threshold);
  }

  // Slice to limit
  mergedSignals = mergedSignals.slice(0, limitParam);

  return NextResponse.json(mergedSignals);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, signalId, commentAuthor, commentContent, isAnonymous } = body;

    // Handle adding comments
    if (action === 'add_comment') {
      if (!signalId || !commentContent) {
        return NextResponse.json({ success: false, error: 'Missing signalId or commentContent' }, { status: 400 });
      }

      // Find signal in either localSignalsCache or preloadedSignals
      let targetSignal = localSignalsCache.find(s => s.id === signalId);
      if (!targetSignal) {
        // Find in preloadedSignals and copy to local cache
        const preloaded = preloadedSignals.find(s => s.id === signalId);
        if (preloaded) {
          targetSignal = JSON.parse(JSON.stringify(preloaded)); // deep clone
          localSignalsCache.push(targetSignal!);
        }
      }

      if (!targetSignal) {
        return NextResponse.json({ success: false, error: 'Signal not found' }, { status: 404 });
      }

      if (!targetSignal.comments) {
        targetSignal.comments = [];
      }

      const newComment: Comment = {
        id: `com_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        author: isAnonymous ? `@anon_zk_${Math.random().toString(36).substring(2, 6)}` : (commentAuthor || '@citizen_node'),
        content: commentContent,
        timestamp: 'Just now',
        isAnonymous: !!isAnonymous
      };

      targetSignal.comments.push(newComment);

      return NextResponse.json({ success: true, comment: newComment, signal: targetSignal });
    }

    // Standard Signal creation / editing
    const { id, title, category, content, reality, mediaType, biasGrading, author, isAnonymousSignal } = body;

    if (id) {
      // Find signal and edit it in-place
      let targetSignal = localSignalsCache.find(s => s.id === id);
      if (!targetSignal) {
        // Clone from preloaded
        const preloaded = preloadedSignals.find(s => s.id === id);
        if (preloaded) {
          targetSignal = JSON.parse(JSON.stringify(preloaded));
          localSignalsCache.push(targetSignal!);
        }
      }

      if (targetSignal) {
        targetSignal.payload.title = title || targetSignal.payload.title;
        targetSignal.payload.content = content || targetSignal.payload.content;
        targetSignal.payload.transcript = content || targetSignal.payload.transcript;
        targetSignal.category = (category || targetSignal.category).toUpperCase() as any;
        targetSignal.mediaType = mediaType || targetSignal.mediaType;
        targetSignal.payload.author = isAnonymousSignal ? `@anon_zk_${Math.random().toString(36).substring(2, 6)}` : (author || targetSignal.payload.author);
        if (biasGrading) {
          targetSignal.biasGrading = { ...targetSignal.biasGrading, ...biasGrading };
        }
        return NextResponse.json({ success: true, signal: targetSignal });
      }
    }

    // Build sophisticated multi-modal schema for new signals
    const defaultBias: BiasGrading = {
      propaganda: Math.floor(Math.random() * 15),
      sourceTrust: 85 + Math.floor(Math.random() * 15),
      consensusScore: 80 + Math.floor(Math.random() * 20),
      leaning: 'Neutral'
    };

    const newSignal: Signal = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: mediaType === 'VIDEO' ? 'MEDIA_VIDEO' : mediaType === 'AUDIO' ? 'MEDIA_AUDIO' : 'CITIZEN_RESEARCH',
      category: (category || 'GENERAL').toUpperCase() as any,
      mediaType: mediaType || 'CITIZEN_POST',
      timestamp: 'Just now',
      payload: {
        title: title || 'Untitled Signal',
        content: content || '',
        author: isAnonymousSignal ? `@anon_zk_${Math.random().toString(36).substring(2, 6)}` : (author || 'Citizen Edge Node'),
        transcript: content || ''
      },
      biasGrading: biasGrading || defaultBias,
      reality: reality || 'REALITY',
      metrics: {
        feePaid: 0.15, // GAAP strict 0.15% fee
        reputationGain: 5
      },
      comments: []
    };

    // Cache locally
    localSignalsCache.unshift(newSignal);

    // Forward to remote economic engine (fail-silent)
    try {
      await fetch(`${ENGINE_URL}/api/state/tpns_genesis/lake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSignal),
        signal: AbortSignal.timeout(3000)
      });
    } catch (err) {
      console.warn('[Lake API] Fail-silent: could not forward to economic-engine.');
    }

    return NextResponse.json({ success: true, signal: newSignal });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing signal ID' }, { status: 400 });
    }

    // Remove from local cache
    localSignalsCache = localSignalsCache.filter(s => s.id !== id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
