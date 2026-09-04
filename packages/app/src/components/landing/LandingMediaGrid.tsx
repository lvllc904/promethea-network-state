'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Newspaper, ExternalLink, Sparkles, Shield, ArrowUpRight, Clock, Award, RefreshCw, Radio } from 'lucide-react';

interface NewsItem {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  source: string;
  date: string;
  imageUrl: string;
  readTime: string;
  featured?: boolean;
}

const defaultNewsStories: NewsItem[] = [
  {
    id: 'story-1',
    category: 'GLOBAL NETWORK DIPLOMACY',
    title: 'Promethean Sovereign Accord Ratified by Initial 12 Autonomous Node Communities',
    excerpt: 'The global summit concluded with unanimous ratification of the Three-Body Constitution, establishing cross-jurisdictional passport reciprocity and automated treasury clearing.',
    source: 'Sovereign Dispatch & International Press',
    date: 'August 2026',
    imageUrl: '/media/Local_Wealth_Sovereignty_Pillars.png',
    readTime: '4 min read',
    featured: true,
  },
  {
    id: 'story-2',
    category: 'LEGAL & GOVERNANCE',
    title: 'Delaware Series SPV Architecture Secures On-Chain Statutory Protection',
    excerpt: 'Under 6 Del. C. § 18-215, isolated asset series achieve legally enforceable partition between real-world physical collateral and decentralized smart contract pools.',
    source: 'Delaware Corporate & Tech Review',
    date: 'August 2026',
    imageUrl: '/media/tripartite_capital_stack_leverage.jpg',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 'story-3',
    category: 'AUTONOMOUS ECONOMY (ACOM)',
    title: 'Thermodynamic Microgrid Continuum Clears $14.2M in Compute Heat Rebalancing',
    excerpt: '50kW edge GPU arrays dissipation directly powers community controlled-environment agriculture while settling exergy tax credits to local wealth ledgers.',
    source: 'Sovereign Energy Systems Journal',
    date: 'August 2026',
    imageUrl: '/media/Local_Wealth_Sovereignty_Pillars.png',
    readTime: '5 min read',
    featured: false,
  },
];

export function LandingMediaGrid() {
  const [stories, setStories] = useState<NewsItem[]>(defaultNewsStories);
  const [selectedStory, setSelectedStory] = useState<NewsItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    // Dynamically query the media feed API
    async function loadDynamicMedia() {
      try {
        const res = await fetch('/api/media/feed');
        if (res.ok) {
          const data = await res.json();
          if (data.media && data.media.length > 0) {
            const mapped: NewsItem[] = data.media.map((m: any, idx: number) => ({
              id: m.id,
              category: m.category,
              title: m.title,
              excerpt: m.subtitle,
              source: m.source,
              date: m.date,
              imageUrl: m.thumbnailUrl || '/media/Local_Wealth_Sovereignty_Pillars.png',
              readTime: m.type === 'video' ? 'Video Briefing' : m.type === 'audio' ? 'Audio Master' : '5 min read',
              featured: idx === 0,
            }));
            setStories(mapped);
          }
        }
      } catch (err) {
        console.warn('[LandingMediaGrid] Using default sovereign media catalog');
      }
    }

    void loadDynamicMedia();
  }, []);

  const handleRefreshFeed = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/media/feed');
      if (res.ok) {
        const data = await res.json();
        if (data.media && data.media.length > 0) {
          const mapped: NewsItem[] = data.media.map((m: any, idx: number) => ({
            id: m.id,
            category: m.category,
            title: m.title,
            excerpt: m.subtitle,
            source: m.source,
            date: m.date,
            imageUrl: m.thumbnailUrl || '/media/Local_Wealth_Sovereignty_Pillars.png',
            readTime: m.type === 'video' ? 'Video Briefing' : m.type === 'audio' ? 'Audio Master' : '5 min read',
            featured: idx === 0,
          }));
          setStories(mapped);
        }
      }
    } catch (e) {
      // Keep existing
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const featuredStory = stories.find(s => s.featured) || stories[0];
  const secondaryStories = stories.filter(s => s.id !== featuredStory.id);

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold uppercase tracking-widest mb-4">
          <Newspaper className="w-3.5 h-3.5" />
          <span>Press, Media &amp; Dynamic Live Streams</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Sovereign Network Coverage
        </h2>
        <div className="flex items-center justify-center gap-3 mt-3">
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl font-light">
            Real-time news stories, legal developments, and structural breakthroughs powering the Promethean Network State.
          </p>
          <button
            onClick={handleRefreshFeed}
            title="Sync dynamic internet &amp; YouTube feeds"
            className="p-2 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-400 hover:text-white transition"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Featured + Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Featured Story (Left 7 Cols) */}
        {featuredStory && (
          <div
            key={featuredStory.id}
            onClick={() => setSelectedStory(featuredStory)}
            className="lg:col-span-7 group relative hover:scale-[1.01] transition-all duration-300 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,0.5)' }}
          >
            <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-950">
              <img
                src={featuredStory.imageUrl}
                alt={featuredStory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-bold tracking-widest uppercase shadow-lg">
                  FEATURED DISPATCH
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-amber-400 text-[10px] font-mono font-semibold tracking-wider">
                  {featuredStory.category}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 mb-3">
                <span className="text-amber-400 font-semibold">{featuredStory.source}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featuredStory.readTime}</span>
                <span>•</span>
                <span>{featuredStory.date}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-amber-400 transition-colors leading-tight mb-3">
                {featuredStory.title}
              </h3>
              <p className="text-sm text-zinc-300 font-light leading-relaxed mb-6">
                {featuredStory.excerpt}
              </p>

              <div className="flex items-center text-xs font-mono text-amber-400 font-bold tracking-wider group-hover:translate-x-1 transition-transform">
                <span>Read Full Dispatch</span>
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        )}

        {/* Secondary Stories List (Right 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {secondaryStories.map((story) => (
            <div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="p-5 flex gap-4 items-start group hover:scale-[1.01] transition-all duration-300 cursor-pointer backdrop-blur-md border border-white/5 hover:border-amber-500/30 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="relative h-20 w-24 shrink-0 rounded-xl overflow-hidden bg-slate-900">
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-zinc-500 mb-1">
                  <span className="text-amber-400 font-bold uppercase truncate">{story.category}</span>
                  <span>{story.date}</span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                  {story.title}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-1 font-light">{story.excerpt}</p>
                <div className="mt-2 text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{story.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111625] border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white font-mono text-lg font-bold"
            >
              ✕
            </button>
            <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
              <span className="bg-amber-500/20 px-2.5 py-1 rounded-full uppercase font-bold">{selectedStory.category}</span>
              <span>•</span>
              <span>{selectedStory.source}</span>
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight">{selectedStory.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{selectedStory.excerpt}</p>
            <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-xs font-mono text-gray-500">
              <span>Published: {selectedStory.date}</span>
              <button
                onClick={() => setSelectedStory(null)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs uppercase"
              >
                Close Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
