'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Download, Terminal, Cpu, Zap, Shield, HelpCircle, Check, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useMesh } from '@/components/providers/mesh-provider';

const BirdsBackground = dynamic(() => import('../../components/ui/BirdsBackground'), { ssr: false });

export default function CPPIntegrationPackPage() {
  const { themeState } = useMesh();
  const currentTheme = themeState?.theme || 'dark';
  const isClassicTheme = currentTheme === 'theme-latex';

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const codeSnippets = {
    interfaces: `export interface ChatMessage {
  id: string;
  sender: string;
  role: 'user' | 'assistant' | 'system' | 'peer';
  content: string;
  timestamp: string;
  signature?: string; // Cryptographic DID signature proof for sovereign verification
  parentId: string | null;
  status: 'completed' | 'generating' | 'interrupted';
  childrenIds: string[];
}`,
    traversal: `export function getActivePath(thread: ChatThread): ChatMessage[] {
  if (!thread || !thread.messages || thread.messages.length === 0) return [];
  
  const messages = thread.messages;
  const msgMap = new Map<string, ChatMessage>();
  messages.forEach(m => msgMap.set(m.id, m));

  let headId = thread.activeHeadMessageId;
  if (!headId || !msgMap.has(headId)) {
    headId = messages[messages.length - 1].id;
  }

  const path: ChatMessage[] = [];
  let currentId: string | null | undefined = headId;
  const visited = new Set<string>();

  while (currentId && msgMap.has(currentId) && !visited.has(currentId)) {
    visited.add(currentId);
    const msg = msgMap.get(currentId)!;
    path.push(msg);
    currentId = msg.parentId;
  }

  if (path.length > 0) {
    return path.reverse();
  }

  return messages;
}`,
    server: `private async handlePivotInit(ws: WebSocket, payload: any) {
  const { activeThreadId, interruptedNodeId, userPrompt, newBranchNodeId } = payload;
  
  // 1. Hot Halt Active LLM Task
  const activeStream = this.activeStreams.get(activeThreadId);
  if (activeStream) {
    activeStream.abortController.abort();
    this.activeStreams.delete(activeThreadId);
  }

  // 2. Transmit Halt Confirmation
  ws.send(JSON.stringify({
    type: 'CPP_STREAM_HALTED',
    timestamp: Date.now(),
    payload: {
      interruptedNodeId,
      finalContentLength: 100,
      lastChunkReceived: "[Halted via Conversational Pivot Protocol]"
    }
  }));
}`
  };

  return (
    <div className={`min-h-screen selection:bg-amber-500/30 transition-colors duration-500 ${
      isClassicTheme 
        ? 'bg-[#fdfcf7] text-[#1a1a1a] font-serif' 
        : 'bg-background text-foreground dark:text-white font-sans'
    }`}>
      {!isClassicTheme && <BirdsBackground />}
      
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-20 border-b border-foreground/5 dark:border-white/5 bg-background/20 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span className="font-headline font-black tracking-[0.2em] text-xs text-foreground dark:text-white">BACK TO CORE</span>
        </Link>
        <div className="text-[10px] font-mono text-zinc-500 hidden sm:block tracking-widest">
          IMPLEMENTATION PACK // CPP V1.1.0 // DEPTHOS COMPATIBLE
        </div>
      </header>

      <div className="relative z-10 w-full pt-40 pb-32 px-4 md:px-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 backdrop-blur-md w-fit">
              <Cpu className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-[9px] font-mono font-bold text-pink-300 uppercase tracking-widest">depthOS Integration Pack</span>
            </div>
            
            <a 
              href="/documents/conversational_pivot_protocol_integration_pack.md" 
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-400 hover:text-pink-300 font-mono text-xs font-bold uppercase tracking-widest transition-all w-fit rounded"
            >
              <Download className="w-4 h-4" /> Download Manual (.md)
            </a>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40 uppercase">
            CPP Integration Pack.
          </h1>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-12 text-zinc-400">
            Plug-and-play Directed Semantic Graph (DSG) & Halt-and-Splice server engines for depthOS
          </h2>

          {/* Intro Section */}
          <div className="p-8 bg-white/[0.01] border border-white/5 backdrop-blur-xl rounded-xl mb-12 leading-relaxed text-zinc-300">
            <p className="mb-4">
              The <strong>Conversational Pivot Protocol (CPP) Integration Pack</strong> maps out the complete technical specification to bridge local-first depthOS vault applications with high-fidelity distributed AI intelligence nodes.
            </p>
            <p>
              By shifting conversations from simple chronological message arrays to a state-managed <strong>Directed Semantic Graph (DSG)</strong>, this pack empowers your application layers with mid-stream interruption-pivoting, retroactive branch anchoring, and parallel future timeline swaps.
            </p>
          </div>

          {/* Quick Code Sections */}
          <div className="space-y-12">
            
            {/* Core Schema */}
            <div className="p-6 md:p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" /> 1. Core State Schema (Zustand/TypeScript)
                </h3>
                <button 
                  onClick={() => handleCopy(codeSnippets.interfaces, 'interfaces')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all text-[10px] font-mono rounded"
                >
                  {copiedSection === 'interfaces' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'interfaces' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-black/60 border border-white/5 p-4 rounded font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
                {codeSnippets.interfaces}
              </pre>
            </div>

            {/* Depth First Path */}
            <div className="p-6 md:p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" /> 2. DSG Path Traversal (Depth-First Ancestral Path)
                </h3>
                <button 
                  onClick={() => handleCopy(codeSnippets.traversal, 'traversal')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all text-[10px] font-mono rounded"
                >
                  {copiedSection === 'traversal' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'traversal' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-black/60 border border-white/5 p-4 rounded font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
                {codeSnippets.traversal}
              </pre>
            </div>

            {/* Halt and Splice Engine */}
            <div className="p-6 md:p-8 bg-black/40 border border-white/5 backdrop-blur-xl rounded-xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> 3. Halt-and-Splice Server Engine (WebSocket Node.js)
                </h3>
                <button 
                  onClick={() => handleCopy(codeSnippets.server, 'server')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all text-[10px] font-mono rounded"
                >
                  {copiedSection === 'server' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'server' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-black/60 border border-white/5 p-4 rounded font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
                {codeSnippets.server}
              </pre>
            </div>

          </div>

          <div className="mt-16 p-8 border border-amber-500/20 bg-amber-500/[0.03] backdrop-blur-md rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Want the complete manual?</h4>
              <p className="text-xs text-zinc-400">Download the complete, detailed 800+ line markdown integration manual with WebSocket frames, state controllers, and interactive UI views.</p>
            </div>
            <a 
              href="/documents/conversational_pivot_protocol_integration_pack.md" 
              download
              className="px-6 py-3 bg-amber-500 text-black font-black text-xs font-mono uppercase tracking-widest hover:bg-amber-400 transition-colors whitespace-nowrap rounded"
            >
              Get Manual
            </a>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
