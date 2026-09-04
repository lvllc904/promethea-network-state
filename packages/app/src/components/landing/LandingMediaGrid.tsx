'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Newspaper,
  ExternalLink,
  Clock,
  RefreshCw,
  Play,
  Headphones,
  FileText,
  X,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import type { DynamicMediaItem } from '@/app/api/media/feed/route';

// ─── Type icon helper ────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: DynamicMediaItem['type'] }) {
  const map = {
    video: { Icon: Play, label: 'Video', cls: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
    audio: { Icon: Headphones, label: 'Audio', cls: 'bg-sky-500/15 text-sky-400 border-sky-500/20' },
    article: { Icon: FileText, label: 'Article', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  } as const;
  const { Icon, label, cls } = map[type];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${cls}`}>
      <Icon className="h-2.5 w-2.5" aria-hidden />
      {label}
    </span>
  );
}

// ─── Reader modal ────────────────────────────────────────────────────────────

function ReaderModal({ item, onClose }: { item: DynamicMediaItem; onClose: () => void }) {
  const isExternal = !item.isLocalAsset && item.externalUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl max-h-[90dvh] flex flex-col rounded-3xl overflow-hidden"
        style={{ background: 'rgba(10,14,30,0.97)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>

        {/* Hero thumbnail */}
        {item.thumbnailUrl && (
          <div className="relative h-44 w-full overflow-hidden shrink-0">
            <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1e] via-[#0a0e1e]/40 to-transparent" />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <TypeBadge type={item.type} />
              <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-[10px] font-mono font-bold text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                {item.category}
              </span>
            </div>
          </div>
        )}

        {/* Content area (scrollable) */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-5">
          {/* Meta */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="text-amber-400 font-semibold">{item.source}</span>
            <span>•</span>
            <span>{item.date}</span>
            {item.readTimeMin && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.readTimeMin} min</span>
              </>
            )}
          </div>

          {/* Title */}
          <h2 id="reader-modal-title" className="text-xl sm:text-2xl font-bold text-white leading-tight">
            {item.title}
          </h2>

          {/* TL;DR summary */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest">
              <Sparkles className="h-3 w-3" />
              TL;DR Summary
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{item.summary}</p>
          </div>

          {/* Key points */}
          {item.keyPoints && item.keyPoints.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Key Points</p>
              <ul className="space-y-2">
                {item.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-amber-400 shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full content (if available) */}
          {item.fullContent && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Full Article</p>
              <p className="text-sm text-zinc-400 leading-relaxed">{item.fullContent}</p>
            </div>
          )}

          {/* External link CTA */}
          {isExternal && item.externalUrl && (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center justify-between gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all duration-200 group"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              <span className="text-amber-400 group-hover:text-amber-300">Open original source</span>
              <ExternalLink className="h-4 w-4 text-amber-400 group-hover:text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          )}

          {/* Local article CTA */}
          {item.isLocalAsset && item.mediaUrl && item.type === 'article' && (
            <a
              href={item.mediaUrl}
              className="flex items-center justify-between gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all duration-200 group"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              <span className="text-amber-400 group-hover:text-amber-300">Read full document</span>
              <BookOpen className="h-4 w-4 text-amber-400 group-hover:text-amber-300" />
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end px-6 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors font-mono"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X className="h-3.5 w-3.5" />
            Close
          </button>
        </div>

        {/* Close button overlay */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-white transition-colors"
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          aria-label="Close article reader"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Card component ──────────────────────────────────────────────────────────

function MediaCard({ item, featured, onClick }: { item: DynamicMediaItem; featured?: boolean; onClick: () => void }) {
  if (featured) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="lg:col-span-7 group text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl"
        aria-label={`Open article: ${item.title}`}
      >
        <div
          className="relative overflow-hidden rounded-2xl h-full transition-transform duration-300 hover:scale-[1.01]"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 40px rgba(0,0,0,0.5)' }}
        >
          {/* Thumbnail */}
          <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
            <img
              src={item.thumbnailUrl || '/media/Local_Wealth_Sovereignty_Pillars.png'}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-bold tracking-widest uppercase shadow-lg">
                FEATURED
              </span>
              <TypeBadge type={item.type} />
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-zinc-500 mb-3">
              <span className="text-amber-400 font-semibold">{item.source}</span>
              <span>•</span>
              {item.readTimeMin && (
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.readTimeMin} min</span>
              )}
              <span>•</span>
              <span>{item.date}</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-400 transition-colors leading-tight mb-3">
              {item.title}
            </h3>

            {/* TL;DR on card */}
            <p className="text-sm text-zinc-400 leading-relaxed mb-5 line-clamp-3">
              {item.summary}
            </p>

            <div className="flex items-center text-xs font-mono text-amber-400 font-bold tracking-wider group-hover:translate-x-1 transition-transform">
              <span>{item.type === 'video' ? 'Watch Briefing' : item.type === 'audio' ? 'Listen Now' : 'Read Full Dispatch'}</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </button>
    );
  }

  // ── Secondary card ───────────────────────────────────────────────────────
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-4 flex gap-4 items-start group hover:scale-[1.01] transition-all duration-300 w-full text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      aria-label={`Open article: ${item.title}`}
    >
      {/* Thumbnail */}
      <div className="relative h-20 w-24 shrink-0 rounded-xl overflow-hidden bg-slate-900">
        <img
          src={item.thumbnailUrl || '/media/Local_Wealth_Sovereignty_Pillars.png'}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {/* type overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {item.type === 'video' && <Play className="h-5 w-5 text-white" />}
          {item.type === 'audio' && <Headphones className="h-5 w-5 text-white" />}
          {item.type === 'article' && <FileText className="h-5 w-5 text-white" />}
        </div>
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-amber-400 font-bold uppercase truncate text-[10px] font-mono">{item.category}</span>
          <TypeBadge type={item.type} />
        </div>
        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
          {item.title}
        </h4>
        <p className="text-xs text-zinc-400 line-clamp-2 mt-1 font-light leading-relaxed">{item.summary}</p>
        <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          {item.readTimeMin && (
            <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{item.readTimeMin} min</span>
          )}
          {!item.isLocalAsset && (
            <span className="flex items-center gap-1 text-zinc-600"><ExternalLink className="h-2.5 w-2.5" />External</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function LandingMediaGrid() {
  const [items, setItems] = useState<DynamicMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DynamicMediaItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/media/feed');
      if (res.ok) {
        const data = await res.json();
        if (data.media && data.media.length > 0) {
          setItems(data.media as DynamicMediaItem[]);
        }
      }
    } catch {
      console.warn('[LandingMediaGrid] Using default media catalog');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchMedia(); }, [fetchMedia]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMedia();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const featuredItem = items[0];
  const secondaryItems = items.slice(1);

  // Close modal on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedItem(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
            Real-time news, legal developments, and structural breakthroughs — each card includes an AI-generated TL;DR summary and links to the full article.
          </p>
          <button
            onClick={handleRefresh}
            title="Sync dynamic internet & YouTube feeds"
            className="p-2 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-400 hover:text-white transition"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
          <div className="lg:col-span-7 h-[30rem] rounded-2xl bg-white/5" />
          <div className="lg:col-span-5 flex flex-col gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-white/5" />)}
          </div>
        </div>
      )}

      {/* Cards */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {featuredItem && (
            <MediaCard item={featuredItem} featured onClick={() => setSelectedItem(featuredItem)} />
          )}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {secondaryItems.map((item) => (
              <MediaCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        </div>
      )}

      {/* Reader Modal */}
      {selectedItem && (
        <ReaderModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </section>
  );
}
