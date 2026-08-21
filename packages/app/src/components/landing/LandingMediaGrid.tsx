'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Newspaper, ExternalLink, Sparkles, Shield, ArrowUpRight, Clock, Award } from 'lucide-react';

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

const newsStories: NewsItem[] = [
  {
    id: 'story-1',
    category: 'GLOBAL NETWORK DIPLOMACY',
    title: 'Promethean Sovereign Accord Ratified by Initial 12 Autonomous Node Communities',
    excerpt: 'The global summit concluded with unanimous ratification of the Three-Body Constitution, establishing cross-jurisdictional passport reciprocity and automated treasury clearing.',
    source: 'Sovereign Dispatch & International Press',
    date: 'August 2026',
    imageUrl: '/images/landing/summit.png',
    readTime: '4 min read',
    featured: true,
  },
  {
    id: 'story-2',
    category: 'LEGAL & GOVERNANCE',
    title: 'Delaware Series SPV Architecture Secures On-Chain Statutory Protection',
    excerpt: 'Under 6 Del. C. § 18-215, isolated asset series achieve legally enforceable partition between real-world physical collateral and decentralized smart contract pools.',
    source: 'Delaware Corporate & Tech Review',
    date: 'July 2026',
    imageUrl: '/images/landing/delaware_spv.png',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 'story-3',
    category: 'AUTONOMOUS ECONOMY (ACOM)',
    title: 'Quantum Autonomous AI Engines Clear $14.2M in RWA Compute & Real Estate Escrow',
    excerpt: 'The ACOM Continuum engine deployed autonomous risk mitigation protocols to automatically rebalance liquidity across tokenized RWA series without human intervention.',
    source: 'Financial Cryptography & AI Journal',
    date: 'August 2026',
    imageUrl: '/images/landing/acom_engine.png',
    readTime: '5 min read',
    featured: false,
  },
];

export function LandingMediaGrid() {
  const [selectedStory, setSelectedStory] = useState<NewsItem | null>(null);

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-widest mb-4">
          <Newspaper className="w-3.5 h-3.5" />
          <span>Press & Media Operations</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Sovereign Network Coverage
        </h2>
        <p className="mt-3 text-base sm:text-lg text-zinc-400 max-w-2xl font-light">
          Real-time news stories, legal developments, and structural breakthroughs powering the Promethean Network State.
        </p>
      </div>

      {/* Featured + Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Featured Story (Left 7 Cols) */}
        {newsStories.filter(s => s.featured).map((story) => (
          <div
            key={story.id}
            onClick={() => setSelectedStory(story)}
            className="lg:col-span-7 group relative hover:scale-[1.01] transition-all duration-300 cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,0.5)' }}
          >
            <div className="relative h-72 sm:h-80 w-full overflow-hidden">
              <Image
                src={story.imageUrl}
                alt={story.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-black text-[10px] font-bold tracking-widest uppercase shadow-lg">
                  FEATURED STORY
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-emerald-400 text-[10px] font-mono font-semibold tracking-wider">
                  {story.category}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between bg-zinc-950/90">
              <div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono mb-3">
                  <span className="text-emerald-400 font-semibold">{story.source}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {story.readTime}</span>
                  <span>•</span>
                  <span>{story.date}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                  {story.title}
                </h3>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed font-light">
                  {story.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Read Full Dispatch <ArrowUpRight className="w-4 h-4" />
                </span>
                <Award className="w-4 h-4 text-amber-400 opacity-60" />
              </div>
            </div>
          </div>
        ))}

        {/* Side Stories (Right 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {newsStories.filter(s => !s.featured).map((story) => (
            <div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="group flex flex-col sm:flex-row gap-4 cursor-pointer hover:scale-[1.01] transition-all duration-300" style={{ background: 'rgba(255,255,255,0.025)', borderRadius: '1.25rem', overflow: 'hidden', padding: '1rem 1.25rem', boxShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
            >
              <div className="relative h-40 sm:h-auto sm:w-44 shrink-0 overflow-hidden" style={{ borderRadius: '1rem' }}>
                <Image
                  src={story.imageUrl}
                  alt={story.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono mb-1 font-semibold uppercase tracking-wider">
                    <span>{story.category}</span>
                    <span className="text-zinc-500">{story.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                    {story.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2 font-light">
                    {story.excerpt}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="text-zinc-500">{story.readTime}</span>
                  <span className="text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform font-semibold">
                    View <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Modal Detail */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-2xl w-full overflow-hidden" style={{ background: '#0a0c0f', borderRadius: '1.5rem', boxShadow: '0 0 60px rgba(16,185,129,0.12), 0 24px 80px rgba(0,0,0,0.7)' }}>
            <div className="relative h-64 w-full">
              <Image src={selectedStory.imageUrl} alt={selectedStory.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white w-8 h-8 flex items-center justify-center" style={{ borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                ✕
              </button>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span>{selectedStory.category}</span>
                <span>•</span>
                <span>{selectedStory.source}</span>
                <span>•</span>
                <span>{selectedStory.date}</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{selectedStory.title}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed font-light">{selectedStory.excerpt}</p>
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedStory(null)}
                  className="px-5 py-2 text-black font-bold text-xs uppercase tracking-wider transition-all" style={{ borderRadius: '0.75rem', background: '#10b981' }}
                >
                  Close Story
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
