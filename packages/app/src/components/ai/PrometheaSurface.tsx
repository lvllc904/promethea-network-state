'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePromethea, PrometheaViewMode } from './PrometheaProvider';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeMode = overrideMode || contextMode;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isThinking) return;
    const query = inputQuery;
    setInputQuery('');
    sendMessage(query);
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
        Promethea <span className="text-amber-400 font-bold text-[10px] ml-1">● OMNI-SYNC</span>
      </span>
    </button>
  );

  if (!isOpen && !overrideMode) {
    return renderFloatingOrb();
  }

  // Visual container classes based on View Mode
  const modeContainerClasses = {
    omnibar: 'fixed top-16 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl border border-cyan-500/40 bg-slate-950/95 backdrop-blur-2xl',
    overlay: 'fixed bottom-6 right-6 w-[92%] sm:w-[460px] h-[640px] z-50 shadow-[0_0_60px_rgba(0,242,254,0.15)] rounded-2xl border border-cyan-500/40 bg-slate-950/95 backdrop-blur-2xl flex flex-col',
    docked: 'w-full h-full min-h-[600px] rounded-2xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-xl flex flex-col',
  };

  return (
    <div className={modeContainerClasses[activeMode]}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-slate-900/60 rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
            Promethea Prime
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            {activeContext}
          </span>
        </div>

        {/* View Mode & Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(activeMode === 'overlay' ? 'omnibar' : 'overlay')}
            title="Toggle Overlay / OmniBar"
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            {activeMode === 'omnibar' ? 'Drawer Mode' : 'Spotlight'}
          </button>
          <button
            onClick={clearThread}
            title="Clear Chat Thread"
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
          >
            Reset
          </button>
          {!overrideMode && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-cyan-300 p-1 text-sm font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm text-slate-200">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="text-[10px] font-mono text-slate-500 mb-1 px-1">
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
          placeholder="Ask Promethea or execute command (e.g. 'Draft SPV', 'ACOM')..."
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
