'use client';

import React, { useState } from 'react';
import { Play, Video, ShieldCheck, Cpu, Layers, Sparkles, MonitorPlay } from 'lucide-react';

interface VideoTab {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  icon: any;
  youtubeId: string;
  description: string;
  keyPoints: string[];
}

const videos: VideoTab[] = [
  {
    id: 'genesis',
    title: 'Genesis Architecture Keynote',
    subtitle: 'Network State Principles & Sovereign Design',
    duration: '12:45',
    icon: Sparkles,
    youtubeId: '9bZkp7q19f0', // High-tech tech presentation placeholder / embed
    description: 'An executive breakdown of the Three-Body sovereign architecture: Identity Passport, Treasury Cap Table, and Consensus Governance.',
    keyPoints: ['Three-Body Partition Model', 'On-Chain Citizen Verification', 'Automated Cross-State Settlement']
  },
  {
    id: 'legal-spv',
    title: 'Delaware Series SPV Legal Briefing',
    subtitle: '6 Del. C. § 18-215 Statutory Enforceability',
    duration: '08:30',
    icon: ShieldCheck,
    youtubeId: 'dQw4w9WgXcQ',
    description: 'Comprehensive walkthrough of the Delaware Series LLC framework establishing legal partition between real-world physical assets and smart contract pools.',
    keyPoints: ['Isolated Asset Liabilities', 'SEC Regulation D & S Compliance', 'UCC-1 Digital Filing System']
  },
  {
    id: 'acom-engine',
    title: 'ACOM Engine & AI Telemetry',
    subtitle: 'Autonomous Cognitive Economy Execution',
    duration: '15:10',
    icon: Cpu,
    youtubeId: 'L_LUpnjgPso',
    description: 'Demonstration of autonomous AI agents executing tokenized real estate escrow, yield rebalancing, and threat mitigation in real time.',
    keyPoints: ['AI Risk Scoring Matrix', 'Zero-Human Intervention Settlement', 'Multi-Agent Consensus Protocol']
  },
  {
    id: 'cartographer',
    title: 'Cartographer Spatial Map Demo',
    subtitle: 'Three.js 3D Celestial & Geographic Atlas',
    duration: '06:15',
    icon: Layers,
    youtubeId: 'fJ9rUzIMcZQ',
    description: 'Interactive visualization of physical node nodes, orbital relays, and sovereign domain territories rendered dynamically in spatial 3D.',
    keyPoints: ['WebGL / Three.js Renderer', 'Real-Time Telemetry Pins', 'Interstellar & Surface Viewports']
  }
];

export function LandingVideoShowcase() {
  const [activeTab, setActiveTab] = useState<string>('genesis');

  const currentVideo = videos.find(v => v.id === activeTab) || videos[0];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-14 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold uppercase tracking-widest mb-4">
          <MonitorPlay className="w-3.5 h-3.5" />
          <span>Video Briefings & Keynotes</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Watch The Network State In Action
        </h2>
        <p className="mt-3 text-base sm:text-lg text-zinc-400 max-w-2xl font-light">
          Deep-dive video presentations detailing sovereign architecture, legal SPV mechanics, and autonomous AI economics.
        </p>
      </div>

      {/* Main Grid: Player + Playlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Video Player Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video w-full overflow-hidden group" style={{ borderRadius: '1.5rem', background: '#050708', boxShadow: '0 8px 48px rgba(0,0,0,0.7)' }}>
            {/* Embedded Responsive iFrame */}
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${currentVideo.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
              title={currentVideo.title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Video Metadata Panel */}
          <div className="p-6 sm:p-8 backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.025)', borderRadius: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-emerald-400 mb-2">
              <span className="font-bold tracking-widest uppercase">{currentVideo.subtitle}</span>
              <span className="text-zinc-500">Duration: {currentVideo.duration}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{currentVideo.title}</h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-light mb-5">{currentVideo.description}</p>

            <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-3 font-semibold">
                Key Technical Highlights:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentVideo.keyPoints.map((kp, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-emerald-400 text-xs font-mono" style={{ background: 'rgba(16,185,129,0.08)', borderRadius: '0.5rem' }}
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
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select Briefing Module</span>
          </div>

          {videos.map((vid) => {
            const Icon = vid.icon;
            const isActive = vid.id === activeTab;

            return (
              <button
                key={vid.id}
                onClick={() => setActiveTab(vid.id)}
                className={`w-full text-left p-4 transition-all duration-300 flex items-start gap-4 ${
                  isActive
                    ? 'shadow-[0_0_25px_rgba(16,185,129,0.12)]'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                  borderRadius: '1rem',
                }}
              >
                <div
                  className={`p-2.5 shrink-0 mt-0.5 ${
                    isActive ? 'bg-emerald-500 text-black' : 'text-zinc-400'
                  }`}
                  style={{ borderRadius: '0.6rem', background: isActive ? '#10b981' : 'rgba(255,255,255,0.05)' }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 text-[10px] font-mono mb-1">
                    <span className={isActive ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
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
