'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ShieldAlert, Clock, Activity, FileText, 
  Sparkles, TrendingUp, Coins, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';

interface BiasGrading {
  propaganda: number;
  sourceTrust: number;
  consensusScore: number;
  leaning: 'Neutral' | 'Slight Left' | 'Slight Right' | 'Pro-Sovereign' | 'Balanced';
}

interface Signal {
  id: string;
  type: string;
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
    feePaid?: number;
    reputationGain?: number;
  };
}

interface FilteredFeedPanelProps {
  category: 'HIVEMIND' | 'COGNITIVE_ECON' | 'NSPI' | 'PHILOSOPHICAL' | 'GENERAL';
  isClassicTheme?: boolean;
}

export default function FilteredFeedPanel({ category, isClassicTheme = false }: FilteredFeedPanelProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/lake?category=${category}&limit=5`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (active) {
          setSignals(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(`[FilteredFeedPanel] Error fetching ${category} signals:`, err);
        if (active) {
          setError('Failed to query dynamic network consensus lake.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [category]);

  const toggleExpand = (id: string) => {
    setExpandedSignalId(expandedSignalId === id ? null : id);
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'HIVEMIND':
        return 'Neural Swarm Consensus';
      case 'COGNITIVE_ECON':
        return 'Cognitive Economic Telemetry';
      case 'NSPI':
        return 'Noospheric Sensor Network';
      case 'PHILOSOPHICAL':
        return 'Constitutional Consensus';
      default:
        return 'Sovereign Signal';
    }
  };

  return (
    <div className={`mt-16 border rounded-lg overflow-hidden transition-all duration-300 ${
      isClassicTheme 
        ? 'bg-[#f4f2eb] border-zinc-300 text-zinc-800' 
        : 'bg-black/30 border-white/5 backdrop-blur-xl text-zinc-300'
    }`}>
      {/* Header Panel */}
      <div className={`px-6 py-4 border-b flex items-center justify-between flex-wrap gap-4 ${
        isClassicTheme ? 'border-zinc-300 bg-zinc-200/50' : 'border-white/5 bg-white/[0.02]'
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className={`text-xs font-sans font-black tracking-widest uppercase ${
              isClassicTheme ? 'text-zinc-950' : 'text-white'
            }`}>
              {getCategoryTitle(category)} Live Feed
            </h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">
              Query: /api/lake?category={category} • Client-Side Verified
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono border px-2 py-0.5 uppercase tracking-widest ${
            isClassicTheme ? 'border-zinc-400 text-zinc-600' : 'border-amber-500/20 text-amber-400 bg-amber-500/[0.03]'
          }`}>
            GAAP 0.15% Fee Audited
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className={`h-4 w-1/3 rounded ${isClassicTheme ? 'bg-zinc-300' : 'bg-white/5'}`}></div>
                <div className={`h-12 rounded ${isClassicTheme ? 'bg-zinc-200' : 'bg-white/[0.02]'}`}></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={`p-4 rounded flex items-center gap-3 text-sm ${
            isClassicTheme ? 'bg-amber-100 border border-amber-200 text-amber-900' : 'bg-amber-950/20 border border-amber-500/10 text-amber-400'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : signals.length === 0 ? (
          <div className="p-8 border border-dashed border-zinc-700/20 text-center text-xs font-mono uppercase tracking-widest">
            No active consensus tracks available in the lake for this segment.
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {signals.map((signal) => {
                const isExpanded = expandedSignalId === signal.id;
                const isTrustAlert = signal.biasGrading.sourceTrust < 90 || signal.biasGrading.propaganda > 20;

                return (
                  <motion.div
                    key={signal.id}
                    layout="position"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border transition-all duration-300 p-4 rounded ${
                      isClassicTheme
                        ? 'bg-[#faf8f2] border-zinc-200 hover:border-zinc-400'
                        : isTrustAlert
                        ? 'bg-red-500/[0.01] border-red-500/20 hover:border-red-500/30'
                        : 'bg-white/[0.01] border-white/5 hover:border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-[9px] font-mono">
                          <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${
                            isClassicTheme ? 'bg-zinc-200 text-zinc-700' : 'bg-white/5 text-zinc-400'
                          }`}>
                            {signal.mediaType}
                          </span>
                          <span className="text-zinc-500">
                            {signal.timestamp}
                          </span>
                          <span className="text-zinc-500">•</span>
                          <span className="text-zinc-500">
                            By {signal.payload.author || 'Citizen Node'}
                          </span>
                        </div>

                        <h4 className={`text-sm font-bold uppercase tracking-tight leading-snug ${
                          isClassicTheme ? 'text-zinc-950 font-serif' : 'text-white'
                        }`}>
                          {signal.payload.title}
                        </h4>
                        
                        <p className={`text-xs mt-2 font-light leading-relaxed line-clamp-2 ${
                          isExpanded ? 'line-clamp-none' : ''
                        } ${isClassicTheme ? 'text-zinc-700' : 'text-zinc-400'}`}>
                          {signal.payload.content}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleExpand(signal.id)}
                        className={`p-1 rounded hover:bg-zinc-500/10 transition-colors shrink-0 ${
                          isClassicTheme ? 'text-zinc-600' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expandable Section */}
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-dashed border-zinc-700/20 space-y-4"
                      >
                        {/* Metrics Gauges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className={`p-3 rounded border ${
                            isClassicTheme ? 'bg-zinc-100 border-zinc-300' : 'bg-black/40 border-white/5'
                          }`}>
                            <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Activity className="w-3 h-3 text-red-400" /> Propaganda
                            </div>
                            <div className={`text-xs font-mono font-bold ${
                              signal.biasGrading.propaganda > 20 ? 'text-red-500 animate-pulse' : 'text-green-500'
                            }`}>
                              {signal.biasGrading.propaganda}%
                            </div>
                          </div>

                          <div className={`p-3 rounded border ${
                            isClassicTheme ? 'bg-zinc-100 border-zinc-300' : 'bg-black/40 border-white/5'
                          }`}>
                            <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Source Trust
                            </div>
                            <div className="text-xs font-mono font-bold text-amber-500">
                              {signal.biasGrading.sourceTrust}%
                            </div>
                          </div>

                          <div className={`p-3 rounded border ${
                            isClassicTheme ? 'bg-zinc-100 border-zinc-300' : 'bg-black/40 border-white/5'
                          }`}>
                            <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" /> Consensus
                            </div>
                            <div className="text-xs font-mono font-bold text-orange-500">
                              {signal.biasGrading.consensusScore}%
                            </div>
                          </div>

                          <div className={`p-3 rounded border ${
                            isClassicTheme ? 'bg-zinc-100 border-zinc-300' : 'bg-black/40 border-white/5'
                          }`}>
                            <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-blue-400" /> Reputation
                            </div>
                            <div className="text-xs font-mono font-bold text-green-500">
                              +{signal.metrics?.reputationGain || 5} Gained
                            </div>
                          </div>
                        </div>

                        {/* Transcript block if available */}
                        {signal.payload.transcript && (
                          <div className={`p-3 rounded border ${
                            isClassicTheme ? 'bg-zinc-100 border-zinc-300 text-zinc-800' : 'bg-black/50 border-white/5 text-zinc-400'
                          }`}>
                            <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-zinc-500" /> Ingest Transcript
                            </div>
                            <p className="text-[11px] leading-relaxed italic">
                              "{signal.payload.transcript}"
                            </p>
                          </div>
                        )}

                        {/* Network Fees Paid */}
                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Coins className="w-3 h-3 text-amber-500" /> Network GAAP Tax Ceiling: 0.15%
                          </span>
                          <span>Fee Paid: {(signal.metrics?.feePaid || 0.15).toFixed(2)}%</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
