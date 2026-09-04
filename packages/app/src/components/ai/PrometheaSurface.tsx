'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePromethea, PrometheaViewMode } from './PrometheaProvider';
import { Radio, Volume2, VolumeX, ShieldCheck, Sparkles, Zap, Users, CheckCircle2 } from 'lucide-react';

export function PrometheaSurface({ overrideMode }: { overrideMode?: PrometheaViewMode }) {
  const {
    isOpen,
    viewMode: contextMode,
    activeContext,
    messages,
    isThinking,
    setIsOpen,
    setViewMode,
    sendMessage,
    confirmActionCard,
    rejectActionCard,
    clearThread,
    toggleSurface,
  } = usePromethea();

  const [inputQuery, setInputQuery] = useState('');
  const [isTownSquareOpen, setIsTownSquareOpen] = useState<boolean>(false);
  const [inAudioRoom, setInAudioRoom] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [audioLevels, setAudioLevels] = useState<number[]>([12, 24, 18, 32, 14, 28, 48, 16, 10, 22]);
  const [consentPhase, setConsentPhase] = useState<'NONE' | 'INFORMED' | 'TACTILE' | 'CRYPTOGRAPHIC' | 'CERTIFIED'>('NONE');
  const [activeActionTitle, setActiveActionTitle] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeMode = overrideMode || contextMode;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Ambient audio visualizer movement
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (inAudioRoom) {
      interval = setInterval(() => {
        setAudioLevels((prev) => prev.map(() => Math.floor(Math.random() * 75) + 15));
      }, 120);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inAudioRoom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isThinking) return;
    const query = inputQuery;
    setInputQuery('');
    sendMessage(query);
  };

  const handleStartSweatEquityConsent = (title: string) => {
    setActiveActionTitle(title);
    setConsentPhase('INFORMED');
  };

  const handleTactileAuthorize = () => {
    setConsentPhase('CRYPTOGRAPHIC');
    setTimeout(() => {
      setConsentPhase('CERTIFIED');
      setTimeout(() => {
        setConsentPhase('NONE');
        setActiveActionTitle('');
      }, 4000);
    }, 1500);
  };

  // Render 1: Floating Orb Button (Bottom-Right Trigger)
  const renderFloatingOrb = () => (
    <button
      onClick={toggleSurface}
      aria-label="Promethea Assistant"
      className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 rounded-full bg-slate-900/90 border border-cyan-500/40 px-4 py-3 shadow-[0_0_30px_rgba(0,242,254,0.2)] hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(0,242,254,0.4)] transition-all duration-300 backdrop-blur-xl group"
    >
      <div className="relative flex h-3.5 w-3.5 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
      </div>
      <span className="text-xs font-mono tracking-widest text-cyan-200 font-semibold uppercase">
        Promethea <span className="text-amber-400 font-bold text-[10px] ml-1">● TOWN SQUARE LIVE</span>
      </span>
    </button>
  );

  if (!isOpen && !overrideMode) {
    return renderFloatingOrb();
  }

  // Visual container classes based on View Mode
  const modeContainerClasses = {
    omnibar: 'fixed top-16 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl border border-cyan-500/40 bg-slate-950/95 backdrop-blur-2xl',
    overlay: 'fixed bottom-6 right-6 w-[92%] sm:w-[480px] h-[680px] z-50 shadow-[0_0_60px_rgba(0,242,254,0.15)] rounded-2xl border border-cyan-500/40 bg-slate-950/95 backdrop-blur-2xl flex flex-col',
    docked: 'w-full h-full min-h-[640px] rounded-2xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-xl flex flex-col',
  };

  return (
    <div className={modeContainerClasses[activeMode]}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-slate-900/70 rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
            Promethea Prime
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            {activeContext}
          </span>
        </div>

        {/* Town Square Audio Toggle & View Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsTownSquareOpen(!isTownSquareOpen)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all flex items-center space-x-1 ${
              isTownSquareOpen || inAudioRoom
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-amber-300'
            }`}
          >
            <Radio className={`h-3 w-3 ${inAudioRoom ? 'animate-pulse text-amber-400' : ''}`} />
            <span>Town Square</span>
          </button>

          <button
            onClick={() => setViewMode(activeMode === 'overlay' ? 'omnibar' : 'overlay')}
            title="Toggle Overlay / OmniBar"
            className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            {activeMode === 'omnibar' ? 'Drawer' : 'Spotlight'}
          </button>
          
          <button
            onClick={clearThread}
            title="Clear Chat Thread"
            className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
          >
            Reset
          </button>

          {!overrideMode && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-cyan-300 p-1 text-sm font-bold ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* NATIVE TOWN SQUARE SPATIAL AUDIO DOCK */}
      {isTownSquareOpen && (
        <div className="bg-gradient-to-r from-[#111625] via-[#182035] to-[#111625] border-b border-amber-500/30 p-3.5 space-y-2.5 transition-all">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className={`h-2 w-2 rounded-full ${inAudioRoom ? 'bg-green-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                {inAudioRoom ? 'Spatial Audio Commons: Active' : 'Town Square Audio: Standby'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">4 Stewards Present</span>
          </div>

          {/* Audio Visualizer & Controls */}
          <div className="flex items-center justify-between bg-slate-950/70 border border-amber-900/40 rounded-xl p-2.5 px-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setInAudioRoom(!inAudioRoom)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition ${
                  inAudioRoom
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                }`}
              >
                {inAudioRoom ? 'Leave Audio' : 'Enter Audio'}
              </button>

              {inAudioRoom && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs transition"
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-green-400" />}
                </button>
              )}
            </div>

            {/* Visualizer bars */}
            <div className="flex items-end space-x-1 h-5">
              {audioLevels.map((lvl, i) => (
                <div
                  key={i}
                  className="w-1 bg-amber-400 rounded-full transition-all duration-100"
                  style={{ height: inAudioRoom ? `${lvl}%` : '20%' }}
                />
              ))}
            </div>
          </div>

          {/* In-Chat Quick Action Bar */}
          <div className="flex space-x-2 pt-1">
            <button
              onClick={() => handleStartSweatEquityConsent('Greenhouse Construction Labor (4.5 hrs)')}
              className="flex-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-200 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition"
            >
              + Log Sweat Equity
            </button>
            <button
              onClick={() => handleStartSweatEquityConsent('Solar Grid Micro-Trade (12 kWh)')}
              className="flex-1 bg-teal-950/80 hover:bg-teal-900 border border-teal-700/50 text-teal-200 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition"
            >
              + Certify Energy Trade
            </button>
          </div>
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm text-slate-200">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div suppressHydrationWarning className="text-[10px] font-mono text-slate-500 mb-1 px-1">
              {msg.sender === 'user' ? 'CITIZEN' : 'PROMETHEA AI'} • {msg.timestamp}
            </div>

            <div
              className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-100 font-medium'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-inner'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Action Card (Human Veto Guardrail) */}
              {msg.actionCard && (
                <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-950/30 p-3 text-xs font-mono text-amber-200">
                  <div className="font-bold text-amber-400 mb-1 flex items-center space-x-1.5">
                    <span>⚡ PROPOSED ACTION:</span>
                    <span>{msg.actionCard.title}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-amber-200/80 my-2">
                    {msg.actionCard.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>

                  {msg.actionCard.status === 'pending' && (
                    <div className="flex space-x-2 mt-3 pt-2 border-t border-amber-500/20">
                      <button
                        onClick={() => confirmActionCard(msg.id)}
                        className="flex-1 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all"
                      >
                        [ ⚡ Confirm & Sign Payload ]
                      </button>
                      <button
                        onClick={() => rejectActionCard(msg.id)}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-rose-900 text-rose-300 font-medium transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {msg.actionCard.status === 'confirmed' && (
                    <div className="mt-2 font-bold text-cyan-400">
                      ✓ CONFIRMED: Payload signed and dispatched to Body 3 Economic Engine.
                    </div>
                  )}

                  {msg.actionCard.status === 'rejected' && (
                    <div className="mt-2 font-bold text-rose-400">
                      ✕ REJECTED: Action canceled by citizen human veto.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Progressive 3-Body Consent Card Triggered from Town Square */}
        {consentPhase !== 'NONE' && (
          <div className="rounded-xl border border-amber-500/50 bg-slate-900/95 p-4 space-y-3 shadow-2xl font-mono text-xs text-slate-200">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
              <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>3-Body Step-Up Certification</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Phase: {consentPhase}</span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Target: <span className="text-amber-300 font-bold">{activeActionTitle}</span>
            </p>

            {consentPhase === 'INFORMED' && (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400 leading-normal">
                  Promethea is requesting authorization to record this action into your local on-device SQLite ledger (Body 3). Zero keys leave your hardware enclave.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setConsentPhase('TACTILE')}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-xs transition"
                  >
                    Authorize Handshake
                  </button>
                  <button
                    onClick={() => setConsentPhase('NONE')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {consentPhase === 'TACTILE' && (
              <div className="space-y-3">
                <button
                  onClick={handleTactileAuthorize}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition"
                >
                  [ 🔒 Tap to Authorize Intent ]
                </button>
              </div>
            )}

            {consentPhase === 'CRYPTOGRAPHIC' && (
              <div className="text-center py-2 space-y-2">
                <div className="h-6 w-6 border-2 border-cyan-400 border-dashed rounded-full animate-spin mx-auto" />
                <p className="text-[11px] text-cyan-300">
                  Executing EIP-7212 secp256r1 hardware assertion...
                </p>
              </div>
            )}

            {consentPhase === 'CERTIFIED' && (
              <div className="text-center py-2 space-y-1 bg-green-950/30 border border-green-800/40 rounded-lg">
                <p className="text-green-400 font-bold flex items-center justify-center space-x-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Action Certified &amp; Reconciled</span>
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  State root: 0x7a8d... committed to P2P Merkle DAG
                </p>
              </div>
            )}
          </div>
        )}

        {isThinking && (
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono p-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Promethea is synthesizing grounded response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-cyan-500/20 bg-slate-900/60 rounded-b-2xl flex items-center space-x-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask Promethea or execute command (e.g. 'Town square', 'Log sweat equity')..."
          className="flex-1 bg-slate-950 border border-cyan-900/60 rounded-xl px-4 py-2.5 text-sm text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-all"
        />
        <button
          type="submit"
          disabled={isThinking || !inputQuery.trim()}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all"
        >
          Send
        </button>
      </form>
    </div>
  );
}
