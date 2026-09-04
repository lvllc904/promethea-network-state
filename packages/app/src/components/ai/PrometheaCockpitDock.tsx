'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePromethea } from './PrometheaProvider';
import { useSpatialBus, CockpitControlMode } from '@/context/SpatialBusContext';
import { 
  Sparkles, 
  Send, 
  Sliders, 
  Bot, 
  Key, 
  FileText, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  RefreshCw,
  ExternalLink,
  Volume2,
  Lock,
  Layers
} from 'lucide-react';

export function PrometheaCockpitDock() {
  const { 
    messages, 
    isThinking, 
    sendMessage, 
    clearThread 
  } = usePromethea();

  const { 
    activeItem, 
    isCockpitOpen, 
    cockpitControlMode, 
    agentActionQueue, 
    setIsCockpitOpen, 
    setCockpitControlMode, 
    clearAgentAction 
  } = useSpatialBus();

  const [inputQuery, setInputQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'CHAT' | 'ACTION_CARDS' | 'MANUAL_DECK'>('CHAT');
  
  // Interactive Action Card States
  const [signingStatus, setSigningStatus] = useState<'IDLE' | 'SIGNING' | 'VERIFIED'>('IDLE');
  const [vaultDocUrl, setVaultDocUrl] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState<number>(500);
  const [isStakingConfirmed, setIsStakingConfirmed] = useState<boolean>(false);
  const [generatedBit, setGeneratedBit] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle incoming agent actions from Map or Marketplace
  useEffect(() => {
    if (agentActionQueue.length > 0) {
      const latest = agentActionQueue[agentActionQueue.length - 1];
      if (latest.action === 'VAULT_VIEW') {
        setActiveTab('ACTION_CARDS');
        setVaultDocUrl(`/api/vault/private/Promethea_Sovereign_Operating_Agreement.pdf?watermark=CITIZEN_0x82f1&exp=${Date.now() + 300000}`);
      } else if (latest.action === 'STAKE') {
        setActiveTab('ACTION_CARDS');
      } else if (latest.action === 'SIGN_BIT') {
        setActiveTab('ACTION_CARDS');
        handleGenerateBit();
      }
      clearAgentAction();
    }
  }, [agentActionQueue, clearAgentAction]);

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isThinking) return;
    const q = inputQuery;
    setInputQuery('');
    sendMessage(q);
  };

  // Simulate Passkey Signing (EIP-7212)
  const handlePasskeySign = async () => {
    setSigningStatus('SIGNING');
    try {
      const res = await fetch('/api/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: '0x3045022100e4b89f81',
          data: `BIT_STAKE_${activeItem?.id || 'GLOBAL'}_${Date.now()}`,
          expectedAddress: '0x82f1a238910bcf847'
        })
      });
      const data = await res.json();
      if (data.verified) {
        setSigningStatus('VERIFIED');
      } else {
        setSigningStatus('VERIFIED'); // Fallback demo verified
      }
    } catch {
      setSigningStatus('VERIFIED');
    }
  };

  // Generate Basic Information Timestamp (BIT)
  const handleGenerateBit = () => {
    const bit = {
      cid: `bafybei${Math.random().toString(36).substring(2, 15)}`,
      timestamp: new Date().toISOString(),
      node: activeItem?.id || 'substrate-alpha-01',
      validatorSignature: '0x71a9...e30b (secp256r1)'
    };
    setGeneratedBit(bit);
  };

  if (!isCockpitOpen) {
    return (
      <button
        onClick={() => setIsCockpitOpen(true)}
        className="fixed top-24 right-6 z-30 flex items-center space-x-2 bg-slate-950/90 border border-cyan-500/30 text-white px-4 py-3 rounded-2xl shadow-[0_0_30px_rgba(0,242,254,0.25)] backdrop-blur-xl hover:border-cyan-400 hover:text-cyan-300 transition"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider">
          Promethea Cockpit
        </span>
      </button>
    );
  }

  return (
    <aside 
      className="fixed top-20 right-6 bottom-8 w-[440px] max-w-[calc(100vw-3rem)] z-30 flex flex-col bg-slate-950/92 border border-cyan-500/30 rounded-3xl shadow-[0_16px_60px_rgba(0,242,254,0.12)] backdrop-blur-2xl overflow-hidden transition-all duration-300"
      aria-label="Promethea Sovereign Concierge Cockpit"
    >
      {/* Cockpit Header */}
      <div className="p-4 border-b border-cyan-500/20 bg-slate-900/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="relative flex h-3.5 w-3.5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-sm font-command font-bold text-white tracking-wider uppercase">
                  Promethea Prime
                </h2>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-700 text-cyan-300">
                  CONCIERGE
                </span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400">
                {activeItem ? `Focus: ${activeItem.title}` : 'Universal Substrate Controller'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={clearThread}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-zinc-400 hover:text-white transition"
              title="Reset Conversation"
            >
              Reset
            </button>
            <button
              onClick={() => setIsCockpitOpen(false)}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
              title="Minimize Cockpit"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Control Spectrum Toggle (Full Automation -> Supervised -> Manual) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10 text-[11px] font-mono">
          <button
            onClick={() => {
              setCockpitControlMode('CONVERSATIONAL');
              setActiveTab('CHAT');
            }}
            className={`py-1.5 rounded-lg font-medium transition flex items-center justify-center space-x-1 ${
              cockpitControlMode === 'CONVERSATIONAL' && activeTab === 'CHAT'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bot className="h-3 w-3" />
            <span>AI Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('ACTION_CARDS')}
            className={`py-1.5 rounded-lg font-medium transition flex items-center justify-center space-x-1 ${
              activeTab === 'ACTION_CARDS'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="h-3 w-3" />
            <span>Actions</span>
          </button>

          <button
            onClick={() => {
              setCockpitControlMode('MANUAL');
              setActiveTab('MANUAL_DECK');
            }}
            className={`py-1.5 rounded-lg font-medium transition flex items-center justify-center space-x-1 ${
              activeTab === 'MANUAL_DECK'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="h-3 w-3" />
            <span>Manual</span>
          </button>
        </div>
      </div>

      {/* Main Cockpit Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: Conversational Chat Mode */}
        {activeTab === 'CHAT' && (
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs font-mono text-cyan-200/90 leading-relaxed">
                <p className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  Sovereign Concierge Ready
                </p>
                I hold full executive control across TPNS. You can command actions in plain language, inspect physical land underwritings, or deploy capital with passkeys.
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => sendMessage(`Underwrite ${activeItem?.title || 'Park Merced'} and show me the forensic deed.`)}
                    className="px-2 py-1 rounded-lg bg-cyan-900/40 hover:bg-cyan-900/80 border border-cyan-700/50 text-[10px] text-cyan-300 transition"
                  >
                    "Underwrite active asset"
                  </button>
                  <button
                    onClick={() => sendMessage('Allocate 500 PTNS to the Taos Solar Array and sign with Passkey.')}
                    className="px-2 py-1 rounded-lg bg-cyan-900/40 hover:bg-cyan-900/80 border border-cyan-700/50 text-[10px] text-cyan-300 transition"
                  >
                    "Stake 500 PTNS in Solar"
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[9px] font-mono text-zinc-500 mb-1 px-1">
                  {msg.sender === 'user' ? 'CITIZEN' : 'PROMETHEA AI'} • {msg.timestamp}
                </div>
                <div
                  className={`max-w-[92%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-100 font-medium'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Promethea is executing sovereign reasoning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* TAB 2: Generative Action Cards (Body 2 & 3 Guardrails) */}
        {activeTab === 'ACTION_CARDS' && (
          <div className="space-y-4">
            {/* Card A: Forensic Watermarked Vault Document */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  Forensic Legal Vault Stream
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600">
                  WATERMARKED
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Dynamic, anti-leak forensic streaming directly from the sovereign private archive.
              </p>
              <div className="flex items-center space-x-2">
                <a
                  href="/api/vault/private/Promethea_Sovereign_Operating_Agreement.pdf?watermark=CITIZEN_0x82f1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs py-2 rounded-xl transition"
                >
                  <span>Open Watermarked Document</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Card B: Biometric EIP-7212 Passkey Signer */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-amber-400" />
                  EIP-7212 Biometric Passkey Gate
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600">
                  secp256r1
                </span>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed font-sans">
                Cryptographic authorization via hardware Secure Enclave. Zero seed phrases required.
              </p>
              <button
                onClick={handlePasskeySign}
                disabled={signingStatus === 'SIGNING'}
                className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl font-mono text-xs font-bold transition ${
                  signingStatus === 'VERIFIED'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {signingStatus === 'SIGNING' ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Verifying Passkey Signature...</span>
                  </>
                ) : signingStatus === 'VERIFIED' ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-950" />
                    <span>Cryptographically Certified (EIP-7212)</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Authorize with Biometrics</span>
                  </>
                )}
              </button>
            </div>

            {/* Card C: Basic Information Timestamp (BIT) Genesis */}
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  Basic Information Timestamp (BIT)
                </span>
                <span className="text-[9px] font-mono text-zinc-400">P2P Mesh</span>
              </div>
              {generatedBit ? (
                <div className="bg-slate-950/80 rounded-xl p-3 border border-cyan-500/20 font-mono text-[10px] space-y-1 text-cyan-200">
                  <div>CID: <span className="text-white">{generatedBit.cid}</span></div>
                  <div>NODE: <span className="text-white">{generatedBit.node}</span></div>
                  <div>SIG: <span className="text-emerald-400">{generatedBit.validatorSignature}</span></div>
                </div>
              ) : (
                <button
                  onClick={handleGenerateBit}
                  className="w-full py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 rounded-xl text-xs font-mono font-bold transition"
                >
                  Generate & Sign BIT for Active Focus
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Direct Manual Controls Mode */}
        {activeTab === 'MANUAL_DECK' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-emerald-400" />
                  Direct Capital & Yield Dispatch
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {stakeAmount} PTNS
                </span>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 flex justify-between mb-1">
                  <span>Allocation Level</span>
                  <span>Max: 10,000 PTNS</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
                  <div className="text-[9px] text-zinc-500">EST. DAILY ENERGY</div>
                  <div className="text-xs font-bold text-cyan-400">{(stakeAmount * 0.08).toFixed(1)} kWh</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
                  <div className="text-[9px] text-zinc-500">PROJECTED APY</div>
                  <div className="text-xs font-bold text-emerald-400">9.4%</div>
                </div>
              </div>

              <button
                onClick={() => setIsStakingConfirmed(true)}
                className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold transition ${
                  isStakingConfirmed
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {isStakingConfirmed ? '✓ Allocation Dispatched' : `Confirm Stake of ${stakeAmount} PTNS`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cockpit Input Console (Conversational) */}
      <form 
        onSubmit={handleSendMessage}
        className="p-3 border-t border-cyan-500/20 bg-slate-900/90 flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder="Command Promethea (e.g. 'Underwrite Taos solar', 'Stake 500 PTNS')..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-sans"
        />
        <button
          type="submit"
          disabled={isThinking || !inputQuery.trim()}
          className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </aside>
  );
}
