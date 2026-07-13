'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Radio, Play, Pause, Volume2, Video, Headphones, 
  FileText, Filter, Sparkles, Cpu, ShieldCheck, ShieldAlert, 
  Send, CheckCircle, Percent, Info, Calendar, User, Clock, Flame,
  RefreshCw, XCircle, Star
} from 'lucide-react';
import { Button } from '@promethea/ui';

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
  isSpeculative?: boolean;
}

const getYouTubeId = (url?: string) => {
  if (!url) return null;
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
};

const parseHtmlLinks = (text: string) => {
  if (!text) return '';
  
  // Clean up common HTML entities that might appear in RSS feeds
  let cleanText = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Regex to match a tags: <a href="URL" ...>TEXT</a>
  const aTagRegex = /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const fontTagRegex = /<font[^>]*>([\s\S]*?)<\/font>/gi;
  
  // Strip font tags but keep content
  cleanText = cleanText.replace(fontTagRegex, '$1');

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // Use exec to find all matches of <a href="...">...</a>
  while ((match = aTagRegex.exec(cleanText)) !== null) {
    const matchIndex = match.index;
    
    // Add text before the match
    if (matchIndex > lastIndex) {
      elements.push(cleanText.substring(lastIndex, matchIndex));
    }

    const url = match[1];
    const linkText = match[2];

    // Add the clickable link with premium styling!
    elements.push(
      <a
        key={matchIndex}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-500 hover:text-amber-400 hover:underline inline-flex items-center gap-1 font-bold break-all"
      >
        {linkText}
      </a>
    );

    lastIndex = aTagRegex.lastIndex;
  }

  // Add any remaining text
  if (lastIndex < cleanText.length) {
    elements.push(cleanText.substring(lastIndex));
  }

  return elements.length > 0 ? elements : text;
};

function NewsHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusId = searchParams.get('id');

  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [vettedMode, setVettedMode] = useState(true); // Vetting Lens toggle
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMediaType, setSelectedMediaType] = useState<string>('ALL');
  const [activePlayer, setActivePlayer] = useState<{ id: string; type: 'VIDEO' | 'AUDIO' } | null>(null);
  const [isPlaying, setIsPlayerPlaying] = useState(false);
  const [playerProgress, setPlayerProgress] = useState(0);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'HIVEMIND' | 'COGNITIVE_ECON' | 'NSPI' | 'PHILOSOPHICAL' | 'GENERAL'>('GENERAL');
  const [formMediaType, setFormMediaType] = useState<'VIDEO' | 'AUDIO' | 'ARTICLE' | 'CITIZEN_POST'>('CITIZEN_POST');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formPropaganda, setFormPropaganda] = useState(5);
  const [formTrust, setFormSourceTrust] = useState(95);
  const [formConsensus, setFormConsensus] = useState(90);
  const [formLeaning, setFormLeaning] = useState<'Neutral' | 'Slight Left' | 'Slight Right' | 'Pro-Sovereign' | 'Balanced'>('Neutral');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load signals from the Lake API
  const loadSignals = () => {
    setLoading(true);
    fetch('/api/lake?limit=30')
      .then(res => res.json())
      .then(data => {
        setSignals(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[News Hub] Error loading signals:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSignals();
  }, []);

  // Audio/Video player simulation interval ticker
  useEffect(() => {
    let interval: any;
    if (activePlayer && isPlaying) {
      interval = setInterval(() => {
        setPlayerProgress(prev => {
          if (prev >= 100) {
            setIsPlayerPlaying(false);
            return 0;
          }
          return prev + 1.5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [activePlayer, isPlaying]);

  const handlePlayToggle = (id: string, type: 'VIDEO' | 'AUDIO') => {
    if (activePlayer?.id === id) {
      setIsPlayerPlaying(!isPlaying);
    } else {
      setActivePlayer({ id, type });
      setIsPlayerPlaying(true);
      setPlayerProgress(0);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    const payload = {
      title: formTitle,
      category: formCategory,
      mediaType: formMediaType,
      content: formContent,
      author: formAuthor || 'Citizen Edge Node',
      reality: 'REALITY',
      biasGrading: {
        propaganda: formPropaganda,
        sourceTrust: formTrust,
        consensusScore: formConsensus,
        leaning: formLeaning
      }
    };

    try {
      const res = await fetch('/api/lake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        setSubmitSuccess(true);
        // Clear fields
        setFormTitle('');
        setFormContent('');
        setFormAuthor('');
        
        // Re-load list to display new post instantly
        loadSignals();
        
        // Hide success alert after 3 seconds
        setTimeout(() => setSubmitSuccess(false), 4000);
      }
    } catch (err) {
      console.error('[News Hub] Post failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Logic:
  // 1. If focusId is active, keep it regardless of category/media filters
  // 2. Vetted mode filters out items with low source trust (< 90) or high propaganda (> 20)
  // 3. Category filter
  // 4. Media Type filter
  const filteredSignals = signals.filter(s => {
    if (focusId && s.id === focusId) {
      return true;
    }
    if (vettedMode) {
      if (s.biasGrading.sourceTrust < 90 || s.biasGrading.propaganda > 20) {
        return false;
      }
    }
    if (selectedCategory !== 'ALL' && s.category !== selectedCategory) {
      return false;
    }
    if (selectedMediaType !== 'ALL' && s.mediaType !== selectedMediaType) {
      return false;
    }
    return true;
  });

  // Reorder signals: place the focused signal at the top of the list if it exists
  const sortedSignals = [...filteredSignals];
  if (focusId) {
    const focusIndex = sortedSignals.findIndex(s => s.id === focusId);
    if (focusIndex > 0) {
      const [focusedItem] = sortedSignals.splice(focusIndex, 1);
      sortedSignals.unshift(focusedItem);
    }
  }

  return (
    <div className="bg-background text-foreground dark:text-white min-h-screen selection:bg-amber-500/30 font-sans pb-32">
      
      {/* Decorative colored glow background spots */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 h-20 border-b border-foreground/5 dark:border-white/5 bg-background/40 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return Home</span>
          </Link>
          <span className="text-zinc-700 font-mono">/</span>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="font-headline font-black tracking-widest text-xs uppercase">OMNI LAKE MEDIA HUB</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Vetting Lens Controller */}
          <div className="flex items-center border border-white/10 bg-black/40 px-3 py-1.5 gap-3">
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Vetting Lens:</span>
            <button 
              onClick={() => setVettedMode(true)}
              className={`text-[9px] font-mono font-black uppercase px-2 py-1 transition-all ${
                vettedMode 
                  ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              Vetted Only
            </button>
            <button 
              onClick={() => setVettedMode(false)}
              className={`text-[9px] font-mono font-black uppercase px-2 py-1 transition-all ${
                !vettedMode 
                  ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              Raw Stream
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="pt-32 px-8 md:px-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left 2 Columns: Feed & Media Players */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground dark:text-white uppercase mb-4 leading-none">
              Sovereign <br />Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Narratives</span>
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl font-light">
              Real-time multi-modal stream of economic telemetry, raw transcripts, and community-ingested evidence validated via neuro-symbolic algorithms.
            </p>
          </div>

          {/* Dynamic Feed Filters */}
          <div className="flex flex-wrap gap-2 border-y border-white/5 py-4">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mr-2 flex items-center gap-1"><Filter className="w-3 h-3" /> Category:</span>
              {['ALL', 'HIVEMIND', 'COGNITIVE_ECON', 'NSPI', 'PHILOSOPHICAL', 'GENERAL'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[9px] font-mono font-black uppercase tracking-wider px-3 py-1.5 transition-all ${
                    selectedCategory === cat 
                      ? 'bg-amber-500 text-black font-bold' 
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="w-full h-px bg-white/5 my-2" />

            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mr-2 flex items-center gap-1"><Cpu className="w-3 h-3" /> Media:</span>
              {['ALL', 'VIDEO', 'AUDIO', 'ARTICLE', 'CITIZEN_POST'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedMediaType(type)}
                  className={`text-[9px] font-mono font-black uppercase tracking-wider px-3 py-1.5 transition-all ${
                    selectedMediaType === type 
                      ? 'bg-orange-500 text-white font-bold' 
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Active Player Module */}
          <AnimatePresence>
            {activePlayer && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-amber-500/30 bg-zinc-950/80 backdrop-blur-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] pointer-events-none" />
                
                {activePlayer.type === 'VIDEO' ? (
                  <div className="w-full flex flex-col md:flex-row gap-6">
                    {/* Visual Player */}
                    <div className="relative shrink-0 w-full md:w-80 h-44 bg-zinc-900 border border-white/10 flex flex-col items-center justify-center group overflow-hidden">
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 px-2 py-0.5 border border-red-500/30 text-red-500 font-mono text-[8px] font-bold uppercase tracking-wider z-10">
                        <Flame className="w-3 h-3 animate-pulse" />
                        <span>Live Stream Player</span>
                      </div>
                      
                      {(() => {
                        const activeSignal = signals.find(s => s.id === activePlayer.id);
                        const ytId = getYouTubeId(activeSignal?.payload?.url);
                        
                        if (ytId && isPlaying) {
                          return (
                            <iframe 
                              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0`} 
                              allow="autoplay; encrypted-media; picture-in-picture" 
                              allowFullScreen
                              className="w-full h-full border-0 absolute inset-0 z-0"
                            />
                          );
                        }

                        // Fallback background image if YouTube ID is resolved but not playing
                        const bgStyle = ytId 
                          ? { backgroundImage: `url(https://img.youtube.com/vi/${ytId}/hqdefault.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' } 
                          : {};

                        return (
                          <div 
                            className="w-full h-full flex flex-col items-center justify-center relative"
                            style={bgStyle}
                          >
                            {ytId && <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-all group-hover:bg-black/40" />}
                            <div className="relative z-10 flex flex-col items-center gap-3">
                              {isPlaying ? (
                                <div className="flex flex-col items-center gap-3">
                                  {/* Animated sound equalizer columns */}
                                  <div className="flex gap-1 h-8 items-end">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                      <motion.div 
                                        key={i}
                                        className="w-1 bg-amber-500"
                                        animate={{ height: [10, 32, 10] }}
                                        transition={{ repeat: Infinity, duration: 0.5 + (i * 0.1), ease: "easeInOut" }}
                                      />
                                    ))}
                                  </div>
                                  <button onClick={() => setIsPlayerPlaying(false)} className="p-3 bg-amber-500 text-black rounded-full hover:bg-amber-400">
                                    <Pause className="w-5 h-5 fill-black" />
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => setIsPlayerPlaying(true)} className="p-4 bg-amber-500 text-black rounded-full hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all">
                                  <Play className="w-6 h-6 fill-black ml-0.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Progress bar */}
                      <div className="absolute bottom-0 left-0 h-1 bg-amber-500 z-10" style={{ width: `${playerProgress}%` }} />
                    </div>

                    {/* Detailed Metadata & Transcript */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-mono mb-2 uppercase">
                          <Clock className="w-3 h-3" />
                          <span>Progress: {Math.floor(playerProgress)}%</span>
                          <span>•</span>
                          <span>Video Transcript first</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 uppercase">
                          {signals.find(s => s.id === activePlayer.id)?.payload.title}
                        </h3>
                        <div className="border border-white/5 bg-black/60 p-3 h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                          <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Synchronized Transcript Feed:</div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed font-light italic">
                            "{signals.find(s => s.id === activePlayer.id)?.payload.transcript || 'No transcript block available for this signal.'}"
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-4">
                        <span>On-Chain Verified</span>
                        <button onClick={() => setActivePlayer(null)} className="text-amber-500 hover:text-amber-400 uppercase tracking-wider">Close Player</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // AUDIO Player
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 animate-pulse">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-zinc-500 text-[8px] font-mono mb-1 uppercase">
                          <span>AUDIO BROADCAST // IN-LINE</span>
                          <span>•</span>
                          <span>Progress: {Math.floor(playerProgress)}%</span>
                        </div>
                        <h3 className="text-sm font-bold text-white uppercase line-clamp-1">
                          {signals.find(s => s.id === activePlayer.id)?.payload.title}
                        </h3>
                        <div className="h-1 bg-zinc-800 w-full mt-2 relative">
                          <div className="h-full bg-orange-500" style={{ width: `${playerProgress}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsPlayerPlaying(!isPlaying)}
                        className="p-3 bg-orange-500 text-white rounded-none hover:bg-orange-400 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                      </button>
                      <button onClick={() => setActivePlayer(null)} className="text-zinc-500 hover:text-white text-[10px] font-mono uppercase border border-white/5 px-2 py-2">Close</button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* List of Signals */}
          <div className="space-y-6">
            {focusId && (
              <div className="flex items-center justify-between border border-amber-500/30 bg-amber-500/[0.03] p-4 text-xs font-mono text-amber-500 uppercase tracking-wider gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>FOCAL VIEW ACTIVE: Focusing on highlighted narrative card</span>
                </div>
                <button 
                  onClick={() => router.push('/news')}
                  className="px-3 py-1 bg-amber-500 text-black hover:bg-amber-400 font-bold transition-all text-[10px]"
                >
                  SHOW ALL NARRATIVES
                </button>
              </div>
            )}

            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-6 bg-black/40 border border-white/5 animate-pulse h-40 rounded-none" />
              ))
            ) : sortedSignals.length === 0 ? (
              <div className="p-12 border border-dashed border-white/10 text-center text-zinc-500 font-mono text-sm uppercase tracking-widest">
                No signals match the current filtering parameters.
              </div>
            ) : (
              sortedSignals.map(signal => {
                const isTrustVetoed = signal.biasGrading.sourceTrust < 90 || signal.biasGrading.propaganda > 20;
                const isSpeculative = !!signal.isSpeculative;
                const isFocused = focusId === signal.id;
                return (
                  <motion.div
                    key={signal.id}
                    layoutId={`card_${signal.id}`}
                    className={`p-6 bg-card/40 backdrop-blur-xl border hover:bg-foreground/5 dark:hover:bg-white/5 transition-all duration-300 relative group overflow-hidden ${
                      isFocused
                        ? 'border-amber-500 bg-amber-500/[0.03] shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                        : isSpeculative
                          ? 'border-amber-500/20 bg-amber-500/[0.005] hover:border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.02)]'
                          : isTrustVetoed 
                            ? 'border-red-500/20 bg-red-500/[0.01] hover:border-red-500/40' 
                            : 'border-foreground/5 dark:border-white/5 hover:border-amber-500/30'
                    }`}
                  >
                    {/* Glowing highlight indicator */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                      isFocused 
                        ? 'bg-amber-500 animate-pulse' 
                        : isSpeculative 
                          ? 'bg-amber-500/40 group-hover:bg-amber-500' 
                          : isTrustVetoed 
                            ? 'bg-red-500/60' 
                            : 'bg-amber-500/40 group-hover:bg-amber-500'
                    }`} />

                    {/* Left Column Details */}
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        {isSpeculative && (
                          <div className="mb-3 px-3 py-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-500 font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 animate-pulse" />
                            <span>[🟡 SPECULATIVE MODEL / DESCRIPTIVE FRAMEWORK]</span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {isFocused && (
                            <span className="text-[8px] font-mono font-black tracking-widest text-black bg-amber-500 border border-amber-500 px-2 py-0.5 uppercase flex items-center gap-1">
                              <Star className="w-3 h-3 fill-black animate-pulse" />
                              <span>ACTIVE FOCUS</span>
                            </span>
                          )}
                          <span className="text-[8px] font-mono font-bold tracking-widest text-zinc-400 bg-white/5 border border-white/5 px-2 py-0.5 uppercase">
                            {signal.category}
                          </span>
                          <span className={`text-[8px] font-mono font-bold tracking-widest border px-2 py-0.5 uppercase ${
                            signal.type.includes('VIDEO') ? 'text-red-400 border-red-500/20 bg-red-500/5' :
                            signal.type.includes('AUDIO') ? 'text-purple-400 border-orange-500/20 bg-orange-500/5' :
                            'text-green-400 border-green-500/20'
                          }`}>
                            {signal.mediaType}
                          </span>
                          <span className="text-zinc-600 text-[9px] font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {signal.timestamp}
                          </span>
                        </div>

                        <h3 className="text-lg font-black tracking-tight text-white mb-2 uppercase group-hover:text-amber-400 transition-colors leading-tight">
                          {signal.payload.title}
                        </h3>
                        <p className="text-xs text-zinc-400 font-light leading-relaxed mb-4">
                          {parseHtmlLinks(signal.payload.content)}
                        </p>

                        {/* Inline Player Actions */}
                        {signal.mediaType === 'VIDEO' && (
                          <button
                            onClick={() => handlePlayToggle(signal.id, 'VIDEO')}
                            className="inline-flex items-center gap-2 text-[10px] font-mono font-black uppercase text-red-400 hover:text-red-300 transition-colors border border-red-500/20 bg-red-500/5 px-3 py-1.5"
                          >
                            {activePlayer?.id === signal.id && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-red-400" />}
                            <span>Play Streamed Video ({signal.payload.duration || 'Live'})</span>
                          </button>
                        )}
                        {signal.mediaType === 'AUDIO' && (
                          <button
                            onClick={() => handlePlayToggle(signal.id, 'AUDIO')}
                            className="inline-flex items-center gap-2 text-[10px] font-mono font-black uppercase text-orange-400 hover:text-orange-300 transition-colors border border-orange-500/20 bg-orange-500/5 px-3 py-1.5"
                          >
                            {activePlayer?.id === signal.id && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-orange-400" />}
                            <span>Play Audio Signal ({signal.payload.duration || 'Live'})</span>
                          </button>
                        )}
                      </div>

                      {/* Right Panel: Bias Scoring */}
                      <div className="shrink-0 w-full md:w-48 bg-black/40 border border-white/5 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[9px] font-mono uppercase mb-2 border-b border-white/5 pb-1">
                            <span className="text-zinc-500">Vetting Score</span>
                            {isSpeculative ? (
                              <span className="text-amber-500 font-bold flex items-center gap-0.5"><Info className="w-3 h-3 animate-pulse" /> Speculative</span>
                            ) : isTrustVetoed ? (
                              <span className="text-red-500 font-bold flex items-center gap-0.5"><ShieldAlert className="w-3 h-3" /> Raw Alert</span>
                            ) : (
                              <span className="text-green-500 font-bold flex items-center gap-0.5"><ShieldCheck className="w-3 h-3" /> Vetted</span>
                            )}
                          </div>

                          <div className="space-y-1.5 text-[9px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Propaganda:</span>
                              <span className={signal.biasGrading.propaganda > 30 ? 'text-red-400' : 'text-green-400'}>
                                {signal.biasGrading.propaganda}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Source Trust:</span>
                              <span className="text-amber-400">{signal.biasGrading.sourceTrust}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Consensus:</span>
                              <span className="text-orange-400">{signal.biasGrading.consensusScore}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 border-t border-white/5 pt-2 text-[9px] font-mono flex justify-between items-center text-zinc-500">
                          <span>Auth: {signal.payload.author?.split(' ')[1] || 'Citizen'}</span>
                          <span className="text-green-500 font-bold">Submission: Free</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Column: Signal Proposal Submissions Form */}
        <div className="space-y-8 lg:border-l lg:border-white/5 lg:pl-12">
          
          <div className="p-6 border border-amber-500/20 bg-amber-500/[0.01] backdrop-blur-xl relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[40px] pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-amber-500" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase">Sovereign Signal Ingestion</h2>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-light mb-6">
              Post real-time geopolitical intelligence or media feeds from the edge. Submissions are processed first via transcribing algorithms to keep cloud compute cost down, and subsequently cross-vetted.
            </p>

            {submitSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/30 p-4 mb-6 flex gap-3 text-green-400"
              >
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase font-mono">Signal Ingested Successfully!</h4>
                  <p className="text-[10px] leading-relaxed text-green-400/80 font-light mt-1">
                    Your citizen feed has been cached and propagated to the decentralized edge network.
                  </p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Signal / Narrative Title</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Subsea Cable Segment J-14 delay anomaly"
                  required
                  className="w-full bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none rounded-none placeholder:text-zinc-600"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Citizen Author Name</label>
                <input 
                  type="text" 
                  value={formAuthor}
                  onChange={e => setFormAuthor(e.target.value)}
                  placeholder="e.g. Citizen @noosphere_agent"
                  className="w-full bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none rounded-none placeholder:text-zinc-600"
                />
              </div>

              {/* Grid 2 Elements */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Category</label>
                  <select 
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-white/10 px-2 py-2 text-xs text-white focus:border-amber-500 focus:outline-none rounded-none"
                  >
                    <option value="GENERAL">General Feed</option>
                    <option value="HIVEMIND">Hive-Mind swarm</option>
                    <option value="COGNITIVE_ECON">Cognitive Economic</option>
                    <option value="NSPI">NSPI Telemetry</option>
                    <option value="PHILOSOPHICAL">Philosophical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Media Format</label>
                  <select 
                    value={formMediaType}
                    onChange={e => setFormMediaType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-white/10 px-2 py-2 text-xs text-white focus:border-amber-500 focus:outline-none rounded-none"
                  >
                    <option value="CITIZEN_POST">Citizen Post</option>
                    <option value="ARTICLE">Article Text</option>
                    <option value="VIDEO">Video Upload</option>
                    <option value="AUDIO">Audio Broadcast</option>
                  </select>
                </div>
              </div>

              {/* Content / Transcript */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Narrative Content / Speech Transcript</label>
                <textarea 
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  rows={4}
                  placeholder="Insert article text or speech transcript here..."
                  required
                  className="w-full bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none rounded-none placeholder:text-zinc-600 resize-none"
                />
              </div>

              {/* Developer Mock Bias Controls */}
              <div className="border border-white/5 bg-black/60 p-4 space-y-3">
                <div className="flex items-center justify-between text-[9px] font-mono uppercase border-b border-white/5 pb-1">
                  <span className="text-amber-500 font-bold">Developer Bias Controls</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>

                <div className="space-y-2 text-[9px] font-mono">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Propaganda metric:</span>
                      <span>{formPropaganda}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={formPropaganda}
                      onChange={e => setFormPropaganda(parseInt(e.target.value))}
                      className="w-full accent-amber-500 bg-zinc-800 h-1 appearance-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Source Trust rating:</span>
                      <span>{formTrust}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={formTrust}
                      onChange={e => setFormSourceTrust(parseInt(e.target.value))}
                      className="w-full accent-amber-500 bg-zinc-800 h-1 appearance-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Swarm Consensus Score:</span>
                      <span>{formConsensus}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={formConsensus}
                      onChange={e => setFormConsensus(parseInt(e.target.value))}
                      className="w-full accent-amber-500 bg-zinc-800 h-1 appearance-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] text-zinc-400 uppercase tracking-widest mb-1">Geopolitical Leaning</label>
                    <select 
                      value={formLeaning}
                      onChange={e => setFormLeaning(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-white/10 px-1 py-1 text-xs text-white"
                    >
                      <option value="Neutral">Neutral</option>
                      <option value="Slight Left">Slight Left</option>
                      <option value="Slight Right">Slight Right</option>
                      <option value="Pro-Sovereign">Pro-Sovereign</option>
                      <option value="Balanced">Balanced</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fee Notice */}
              <div className="flex items-start gap-2 text-zinc-500 border-t border-white/5 pt-4">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed">
                  **Network Disclosure:** Citizen submissions are free of charge. The **0.15%** protocol fee is strictly limited to actual financial transactions executed within the cockpit.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs uppercase tracking-widest py-3 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 rounded-none"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Ingestion...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Signal Free</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function NewsHub() {
  return (
    <Suspense fallback={
      <div className="bg-background text-zinc-400 min-h-screen flex flex-col items-center justify-center font-mono text-xs uppercase tracking-widest gap-4">
        <Radio className="w-6 h-6 text-amber-500 animate-pulse" />
        <span>Syncing with Omni Lake Feed...</span>
      </div>
    }>
      <NewsHubContent />
    </Suspense>
  );
}
