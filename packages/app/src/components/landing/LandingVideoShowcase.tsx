'use client';

import React, { useState } from 'react';
import { Play, Video, ShieldCheck, Cpu, Layers, Sparkles, MonitorPlay, Music, Film, Radio } from 'lucide-react';

interface MediaTrack {
  id: string;
  type: 'video' | 'audio' | 'youtube';
  title: string;
  subtitle: string;
  duration: string;
  icon: any;
  srcUrl: string;
  posterUrl?: string;
  youtubeId?: string;
  description: string;
  keyPoints: string[];
}

const mediaCatalog: MediaTrack[] = [
  {
    id: 'sovereign-substrate-mp4',
    type: 'video',
    title: 'The Sovereign Substrate Master Keynote',
    subtitle: 'Physical MP4 Video · Holographic Substrate',
    duration: '22:15',
    icon: Film,
    srcUrl: '/media/Promethean_Sovereign_Substrate.mp4',
    posterUrl: '/media/Local_Wealth_Sovereignty_Pillars.png',
    description: 'The definitive video briefing on the Sovereign Substrate, 3-Body architectural separation, and on-device cryptographic state roots.',
    keyPoints: [
      '3-Body Separation (Ephemeral UI, Hardware Gateway, Local Vault)',
      '12 Del. C. § 3556 Perpetual Purpose Trust democratic veto',
      'EIP-7212 (secp256r1) hardware enclave signature verification',
      'Gasless Superchain Paymaster execution'
    ],
  },
  {
    id: 'smarthood-wealth-audio',
    type: 'audio',
    title: 'How Sovereign Smarthoods Reclaim Community Wealth',
    subtitle: 'Sovereign Audio Master · Thermodynamic Exergy',
    duration: '31:40',
    icon: Music,
    srcUrl: '/media/How_Sovereign_Smarthoods_reclaim_community_wealth.m4a',
    posterUrl: '/media/tripartite_capital_stack_leverage.jpg',
    description: 'Comprehensive audio masterclass covering microgrid GPU compute dissipation, controlled agriculture heating loops, and the Metabolic Waterfall.',
    keyPoints: [
      '50kW Edge GPU compute waste-heat recovery for local greenhouses',
      'Metabolic Waterfall: 21% sovereign treasury, 30% community fund, 49% co-investors',
      'Algorithmic sovereign buyout exit to resident worker cooperative',
      'PUE and WUE thermodynamic degradation tax formulas'
    ],
  },
  {
    id: 'genesis-keynote',
    type: 'youtube',
    title: 'Network State Principles & Sovereign Design',
    subtitle: 'Curated Internet Stream · Architecture',
    duration: '12:45',
    icon: Sparkles,
    srcUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    youtubeId: '9bZkp7q19f0',
    description: 'An executive breakdown of cloud-first community formation, cryptographic land footprints, and automated cross-state settlement.',
    keyPoints: [
      'Three-Body Partition Model',
      'On-Chain Citizen Verification',
      'Automated Cross-State Settlement'
    ],
  },
  {
    id: 'acom-engine',
    type: 'youtube',
    title: 'ACOM Engine & AI Telemetry Stream',
    subtitle: 'Curated Internet Stream · AI Economics',
    duration: '15:10',
    icon: Cpu,
    srcUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
    youtubeId: 'L_LUpnjgPso',
    description: 'Demonstration of autonomous AI agents executing tokenized real estate escrow, yield rebalancing, and threat mitigation in real time.',
    keyPoints: [
      'AI Risk Scoring Matrix',
      'Zero-Human Intervention Settlement',
      'Multi-Agent Consensus Protocol'
    ],
  },
];

export function LandingVideoShowcase() {
  const [activeTab, setActiveTab] = useState<string>('sovereign-substrate-mp4');

  const currentMedia = mediaCatalog.find(m => m.id === activeTab) || mediaCatalog[0];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-14 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold uppercase tracking-widest mb-4">
          <MonitorPlay className="w-3.5 h-3.5" />
          <span>Sovereign Media, Audio &amp; Video Streams</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Watch &amp; Listen To The Network State
        </h2>
        <p className="mt-3 text-base sm:text-lg text-zinc-400 max-w-2xl font-light">
          Access physical master video recordings, high-fidelity audio narratives, and curated internet streams.
        </p>
      </div>

      {/* Main Grid: Player + Playlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Media Player Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video w-full overflow-hidden flex items-center justify-center" style={{ borderRadius: '1.5rem', background: '#050708', boxShadow: '0 8px 48px rgba(0,0,0,0.7)' }}>
            
            {/* 1. Native HTML5 Video Player */}
            {currentMedia.type === 'video' && (
              <video
                key={currentMedia.srcUrl}
                controls
                playsInline
                poster={currentMedia.posterUrl}
                className="w-full h-full object-contain"
              >
                <source src={currentMedia.srcUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            {/* 2. Native HTML5 Audio Player with Poster Background */}
            {currentMedia.type === 'audio' && (
              <div className="relative w-full h-full flex flex-col justify-end p-6 bg-gradient-to-t from-black via-slate-950/80 to-transparent">
                {currentMedia.posterUrl && (
                  <img
                    src={currentMedia.posterUrl}
                    alt={currentMedia.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-xs"
                  />
                )}
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center space-x-3 bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-xl backdrop-blur-md w-fit">
                    <Radio className="h-4 w-4 text-amber-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                      Master Audio Narrative Broadcast
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white drop-shadow-md">{currentMedia.title}</h3>
                  <audio
                    key={currentMedia.srcUrl}
                    controls
                    className="w-full rounded-xl"
                  >
                    <source src={currentMedia.srcUrl} type="audio/mp4" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}

            {/* 3. YouTube Embed */}
            {currentMedia.type === 'youtube' && currentMedia.youtubeId && (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${currentMedia.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                title={currentMedia.title}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          {/* Video Metadata Panel */}
          <div className="p-6 sm:p-8 backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.025)', borderRadius: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-amber-400 mb-2">
              <span className="font-bold tracking-widest uppercase">{currentMedia.subtitle}</span>
              <span className="text-zinc-500 font-mono">Duration: {currentMedia.duration}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{currentMedia.title}</h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-light mb-5">{currentMedia.description}</p>

            <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-3 font-semibold">
                Key Technical Highlights:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentMedia.keyPoints.map((kp, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-amber-400 text-xs font-mono" style={{ background: 'rgba(245,158,11,0.08)', borderRadius: '0.5rem' }}
                  >
                    ✓ {kp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Playlist Selector Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest px-2 mb-1 flex items-center gap-2">
            <Video className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Media Module</span>
          </div>

          {mediaCatalog.map((vid) => {
            const Icon = vid.icon;
            const isActive = vid.id === activeTab;

            return (
              <button
                key={vid.id}
                onClick={() => setActiveTab(vid.id)}
                className={`w-full text-left p-4 transition-all duration-300 flex items-start gap-4 ${
                  isActive
                    ? 'shadow-[0_0_25px_rgba(245,158,11,0.15)] border border-amber-500/40'
                    : 'opacity-70 hover:opacity-100 border border-transparent'
                }`}
                style={{
                  background: isActive ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)',
                  borderRadius: '1rem',
                }}
              >
                <div
                  className={`p-2.5 shrink-0 mt-0.5 ${
                    isActive ? 'bg-amber-500 text-black' : 'text-zinc-400'
                  }`}
                  style={{ borderRadius: '0.6rem', background: isActive ? '#f59e0b' : 'rgba(255,255,255,0.05)' }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 text-[10px] font-mono mb-1">
                    <span className={isActive ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                      {vid.subtitle.split(' ')[0]}
                    </span>
                    <span className="text-zinc-500">{vid.duration}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{vid.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-1 font-light">{vid.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
