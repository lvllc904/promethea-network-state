'use client';

import { useState } from 'react';
import { Check, Copy, Fingerprint, Lock, ShieldCheck, Unlock, Vote, Wallet } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from '@promethea/ui';
import { useHUD } from '@/lib/hud-store';
import { useSovereignStore, useSolanaCitizen } from '@promethea/hooks';
import { GuildhallStatusBadge } from '@/components/guildhall/GuildhallStatusBadge';
import { TelemetryProvenance } from '@/components/guildhall/TelemetryProvenance';
import { formatCurrency, formatNumber } from '@/lib/guildhall-formatters';

const proposals = [
  { id: 'PRP-104', title: 'Substrate oracle nodes', yes: 84 },
  { id: 'PRP-105', title: 'Carry-trade multi-signature', yes: 93 },
];

export function NetworkStateAccordion() {
  const { treasury, assets, userDid } = useHUD();
  const { isUnlocked, unlock, lock } = useSovereignStore();
  const { walletAddress, signMessage } = useSolanaCitizen();
  const [copied, setCopied] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(proposals[0].id);
  const [voteStatus, setVoteStatus] = useState<'idle' | 'signing' | 'success' | 'error'>('idle');

  const did = walletAddress ? `did:prmth:${walletAddress}` : userDid || 'did:prmth:guest-safe';
  const totalAssets = assets.reduce((total, asset) => total + asset.valuationUSDC, 0) + treasury.balanceUSDC + treasury.balanceUVT;

  const copyDid = async () => {
    try {
      await navigator.clipboard.writeText(did);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const toggleIdentity = () => {
    if (isUnlocked) {
      lock();
      return;
    }
    unlock(walletAddress || '9xQdZWhhN9sAka698n6F2SgZ1m6f9Uf9M4XFvC3Lz59a');
  };

  const castVote = async () => {
    setVoteStatus('signing');
    try {
      if (isUnlocked && walletAddress && signMessage) {
        await signMessage(`Promethea consensus vote: ${selectedProposal}`);
        setVoteStatus('success');
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 500));
        setVoteStatus('success');
      }
    } catch {
      setVoteStatus('error');
    }
  };

  return (
    <Accordion type="multiple" defaultValue={['identity']} className="guildhall-accordion space-y-3">
      <AccordionItem value="identity" className="border-b-0 rounded-2xl bg-white/[0.02] p-2 backdrop-blur-md">
        <AccordionTrigger className="gap-4 py-4 px-3 text-left hover:no-underline">
          <span className="flex items-center gap-3"><Fingerprint className="h-5 w-5 text-guildhall-identity" aria-hidden="true" /><span><span className="block font-command text-lg font-semibold text-guildhall-text">Identity</span><span className="mt-1 block text-sm font-normal text-guildhall-muted">Keys, DID portal, and proof status</span></span></span>
        </AccordionTrigger>
        <AccordionContent className="pb-4 px-3 pt-0">
          <div className="space-y-4">
            <div className="grid gap-3 rounded-xl bg-black/40 p-4 text-sm border border-white/5">
              <div className="flex items-center justify-between gap-4"><span className="text-guildhall-muted">Access state</span><span className="flex items-center gap-2 text-guildhall-text"><span className={`h-2 w-2 rounded-full ${isUnlocked ? 'bg-guildhall-treasury' : 'bg-guildhall-subtle'}`} />{isUnlocked ? 'Citizen' : 'Guest'}</span></div>
              <div className="flex items-start justify-between gap-4"><span className="text-guildhall-muted">DID portal</span><span className="flex max-w-[14rem] items-center gap-2 font-code text-xs text-guildhall-text"><span className="truncate">{did}</span><button type="button" onClick={copyDid} className="guildhall-icon-button h-7 w-7 shrink-0" aria-label="Copy DID portal">{copied ? <Check className="h-3.5 w-3.5 text-guildhall-treasury" /> : <Copy className="h-3.5 w-3.5" />}</button></span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-guildhall-muted">ZK proof</span><span className="flex items-center gap-2 text-guildhall-treasury"><Check className="h-4 w-4" aria-hidden="true" />Verified</span></div>
            </div>
            <div className="flex items-center justify-between gap-4"><GuildhallStatusBadge freshness={isUnlocked ? 'live' : 'demo'} /><Button type="button" onClick={toggleIdentity} variant="outline" className="border-white/10 bg-transparent text-guildhall-text hover:bg-white/5">{isUnlocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}{isUnlocked ? 'Lock keys' : 'Unlock keys'}</Button></div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="treasury" className="border-b-0 rounded-2xl bg-white/[0.02] p-2 backdrop-blur-md">
        <AccordionTrigger className="gap-4 py-4 px-3 text-left hover:no-underline">
          <span className="flex items-center gap-3"><Wallet className="h-5 w-5 text-guildhall-treasury" aria-hidden="true" /><span><span className="block font-command text-lg font-semibold text-guildhall-text">Treasury</span><span className="mt-1 block text-sm font-normal text-guildhall-muted">Assets, reserves, and yield posture</span></span></span>
        </AccordionTrigger>
        <AccordionContent className="pb-4 px-3 pt-0">
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4 rounded-xl bg-black/40 p-4 border border-white/5"><div><p className="guildhall-label">Total assets</p><p className="mt-2 font-code text-2xl text-guildhall-text">{formatCurrency(totalAssets)}</p></div><span className="font-code text-xs text-guildhall-subtle">USD equiv.</span></div>
            <div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-black/30 p-3 border border-white/5"><p className="text-guildhall-muted">Liquid USDC</p><p className="mt-2 font-code text-guildhall-text">{formatCurrency(treasury.balanceUSDC)}</p></div><div className="rounded-xl bg-black/30 p-3 border border-white/5"><p className="text-guildhall-muted">RWA value</p><p className="mt-2 font-code text-guildhall-treasury">{formatCurrency(assets.reduce((total, asset) => total + asset.valuationUSDC, 0))}</p></div></div>
            <div className="space-y-3"><div className="flex items-center justify-between"><p className="guildhall-label">Asset mix</p><span className="font-code text-xs text-guildhall-subtle">Demo snapshot</span></div>{[['UVT', 49, 'bg-guildhall-treasury'], ['SOL', 17, 'bg-guildhall-identity'], ['USDC', 38, 'bg-guildhall-consensus'], ['BTC', 8, 'bg-guildhall-identity']].map(([label, value, color]) => <div key={String(label)}><div className="mb-1 flex justify-between text-xs"><span className="text-guildhall-muted">{label}</span><span className="font-code text-guildhall-text">{value}%</span></div><div className="h-2 rounded-full overflow-hidden bg-white/5"><div className={`h-full ${color}`} style={{ width: `${value}%` }} /></div></div>)}</div>
            <TelemetryProvenance freshness="demo" source="Seeded cockpit snapshot" />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="consensus" className="border-b-0 rounded-2xl bg-white/[0.02] p-2 backdrop-blur-md">
        <AccordionTrigger className="gap-4 py-4 px-3 text-left hover:no-underline">
          <span className="flex items-center gap-3"><Vote className="h-5 w-5 text-guildhall-consensus" aria-hidden="true" /><span><span className="block font-command text-lg font-semibold text-guildhall-text">Consensus</span><span className="mt-1 block text-sm font-normal text-guildhall-muted">Active proposals and edge attestations</span></span></span>
        </AccordionTrigger>
        <AccordionContent className="pb-4 px-3 pt-0">
          <div className="space-y-4">
            <div className="space-y-2">{proposals.map((proposal) => <button key={proposal.id} type="button" onClick={() => { setSelectedProposal(proposal.id); setVoteStatus('idle'); }} className={`w-full rounded-xl p-3 text-left transition-colors ${selectedProposal === proposal.id ? 'border border-guildhall-consensus/50 bg-guildhall-consensus/10' : 'border border-white/5 bg-black/20 hover:bg-white/5'}`} aria-pressed={selectedProposal === proposal.id}><div className="flex items-center justify-between gap-3"><span className="font-code text-xs text-guildhall-consensus">{proposal.id}</span><span className="font-code text-xs text-guildhall-text">{proposal.yes}% yes</span></div><span className="mt-2 block font-medium text-guildhall-text">{proposal.title}</span><div className="mt-3 h-1.5 rounded-full overflow-hidden bg-white/5"><div className="h-full bg-guildhall-consensus" style={{ width: `${proposal.yes}%` }} /></div></button>)}</div>
            <div className="flex items-center justify-between gap-3"><GuildhallStatusBadge freshness="demo" /><Button type="button" onClick={() => void castVote()} disabled={voteStatus === 'signing'} className="bg-guildhall-consensus text-guildhall-bg hover:bg-cyan-300"><Vote className="h-4 w-4" />{voteStatus === 'signing' ? 'Signing…' : 'Cast vote'}</Button></div>
            {voteStatus === 'success' && <div className="rounded-xl border border-guildhall-treasury/40 bg-guildhall-treasury/10 p-3 text-sm text-guildhall-treasury"><div className="flex items-center gap-2 font-medium"><ShieldCheck className="h-4 w-4" />Vote attested</div><p className="mt-1 text-xs text-guildhall-muted">{isUnlocked && signMessage ? 'Wallet signature confirmed.' : 'Demo attestation only. Connect a wallet to create a signed vote.'}</p></div>}
            {voteStatus === 'error' && <div className="rounded-xl border border-guildhall-danger/40 bg-guildhall-danger/10 p-3 text-sm text-guildhall-danger">The signature request failed. Try again when your wallet is available.</div>}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
