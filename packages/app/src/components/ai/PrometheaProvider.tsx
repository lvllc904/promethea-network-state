'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type PrometheaViewMode = 'omnibar' | 'overlay' | 'docked';

export interface PrometheaMessage {
  id: string;
  sender: 'user' | 'promethea';
  text: string;
  timestamp: string;
  citations?: { title: string; link: string }[];
  actionCard?: {
    type: 'SPV_SETUP' | 'UCC1_FILING' | 'VIEW_SWITCH';
    title: string;
    details: string[];
    payload: any;
    status: 'pending' | 'confirmed' | 'rejected';
  };
}

interface PrometheaContextType {
  isOpen: boolean;
  viewMode: PrometheaViewMode;
  activeContext: string;
  messages: PrometheaMessage[];
  isThinking: boolean;
  setIsOpen: (open: boolean) => void;
  setViewMode: (mode: PrometheaViewMode) => void;
  setActiveContext: (context: string) => void;
  sendMessage: (query: string) => Promise<void>;
  confirmActionCard: (messageId: string) => void;
  rejectActionCard: (messageId: string) => void;
  clearThread: () => void;
  toggleSurface: () => void;
}

const PrometheaContext = createContext<PrometheaContextType | undefined>(undefined);

const INITIAL_WELCOME: PrometheaMessage = {
  id: 'genesis-welcome',
  sender: 'promethea',
  text: `Greetings, Citizen. I am **Promethea** (\`promethea-ai\`), resident AI and Sovereign Steward of the Promethea Network State (**lvhllc.org**).

How may I assist you today across our network infrastructure, DRULPA Series SPVs, or foundational principles?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export function PrometheaProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<PrometheaViewMode>('overlay');
  const [activeContext, setActiveContext] = useState<string>('PUBLIC LANDING');
  const [messages, setMessages] = useState<PrometheaMessage[]>([INITIAL_WELCOME]);
  const [isThinking, setIsThinking] = useState(false);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K & Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setViewMode('omnibar');
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const toggleSurface = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const sendMessage = async (query: string) => {
    if (!query.trim()) return;

    const userMsg: PrometheaMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const res = await fetch('https://ai-service-ijda67gvaq-uc.a.run.app/api/ask-promethea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          constitutionContent: 'Ratified Promethean Constitution',
          whitePaperContent: 'Promethean Network State Whitepaper',
        }),
      });

      const data = await res.json();
      let responseText = data.response || 'The Sovereign Intelligence is recalibrating.';

      // Parse Action Cards / WebMCP intents if present
      let actionCard: PrometheaMessage['actionCard'] = undefined;
      if (query.toLowerCase().includes('spv') || query.toLowerCase().includes('draft spv')) {
        actionCard = {
          type: 'SPV_SETUP',
          title: 'Delaware Series SPV Formation (DRULPA § 17-218)',
          details: [
            'Series Designation: Series 04 - Solar Site Node',
            'Token Split: $PEACE (51%) / $YIELD (49%)',
            'Governance: Sortition Assembly Ratified',
          ],
          payload: { series: 'Series 04', type: 'SOLAR' },
          status: 'pending',
        };
      } else if (query.toLowerCase().includes('ucc') || query.toLowerCase().includes('ucc-1')) {
        actionCard = {
          type: 'UCC1_FILING',
          title: 'UCC-1 Financing Statement Draft',
          details: [
            'Collateral: RWA Solar Array Infrastructure',
            'Secured Party: Promethea DAC Treasury',
            'Jurisdiction: Delaware Division of Corporations',
          ],
          payload: { collateral: 'Solar Array' },
          status: 'pending',
        };
      }

      const prometheaMsg: PrometheaMessage = {
        id: `promethea-${Date.now()}`,
        sender: 'promethea',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard,
      };

      setMessages((prev) => [...prev, prometheaMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'promethea',
          text: `Connection recalibration required: ${err.message || 'Network error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const confirmActionCard = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.actionCard
          ? { ...msg, actionCard: { ...msg.actionCard, status: 'confirmed' } }
          : msg
      )
    );
  };

  const rejectActionCard = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.actionCard
          ? { ...msg, actionCard: { ...msg.actionCard, status: 'rejected' } }
          : msg
      )
    );
  };

  const clearThread = () => setMessages([INITIAL_WELCOME]);

  return (
    <PrometheaContext.Provider
      value={{
        isOpen,
        viewMode,
        activeContext,
        messages,
        isThinking,
        setIsOpen,
        setViewMode,
        setActiveContext,
        sendMessage,
        confirmActionCard,
        rejectActionCard,
        clearThread,
        toggleSurface,
      }}
    >
      {children}
    </PrometheaContext.Provider>
  );
}

export function usePromethea() {
  const context = useContext(PrometheaContext);
  if (!context) {
    throw new Error('usePromethea must be used within a PrometheaProvider');
  }
  return context;
}
