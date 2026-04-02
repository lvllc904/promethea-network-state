/**
 * SOVEREIGN DISCLOSURE PROVIDER
 * 
 * This module enforces the site-wide color taxonomy mandate:
 * - AMBER  = Simulated / Unverified (no corresponding on-chain/CEX proof)
 * - GREEN  = Verified / Live (provable via block explorer or Coinbase CEX API)
 * 
 * All financial figures rendered inside <DisclosureProvider> 
 * must use <LedgerValue> to declare their verification state.
 * 
 * A global banner is injected at the layout level when the system 
 * is in SIMULATED mode to ensure there is never any ambiguity.
 */

'use client';

import React, { createContext, useContext } from 'react';
import { Badge } from '@promethea/ui';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

type SystemMode = 'SIMULATED' | 'VERIFIED';

const DisclosureContext = createContext<{ mode: SystemMode }>({ mode: 'SIMULATED' });

export function useDisclosure() {
    return useContext(DisclosureContext);
}

interface DisclosureProviderProps {
    children: React.ReactNode;
    mode?: SystemMode;
}

/**
 * Wraps the application and injects the global disclosure banner.
 * Until the CoinbaseService is fully live and passing real capital
 * through the waterfall, mode defaults to 'SIMULATED'.
 */
export function DisclosureProvider({ children, mode = 'SIMULATED' }: DisclosureProviderProps) {
    return (
        <DisclosureContext.Provider value={{ mode }}>
            <GlobalDisclosureBanner mode={mode} />
            {children}
        </DisclosureContext.Provider>
    );
}

function GlobalDisclosureBanner({ mode }: { mode: SystemMode }) {
    if (mode === 'VERIFIED') {
        return (
            <div className="w-full bg-emerald-950/80 border-b border-emerald-500/30 px-4 py-1.5 flex items-center justify-center gap-3 text-xs relative z-[999]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-bold uppercase tracking-widest text-[10px]">
                    All financial metrics are verified against live on-chain and CEX data.
                </span>
                <Badge variant="outline" className="text-[8px] font-black text-emerald-400 border-emerald-400/30 bg-emerald-400/5 uppercase">
                    LIVE
                </Badge>
            </div>
        );
    }

    return (
        <div className="w-full bg-amber-950/90 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-center gap-3 text-xs relative z-[999]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-amber-300 font-bold uppercase tracking-widest text-[10px]">
                Financial metrics reflect architectural simulations. Simulated data points are marked with a flashing yellow dot.
            </span>
            <Badge variant="outline" className="text-[8px] font-black text-amber-500 border-amber-500/30 bg-amber-500/5 uppercase">
                SIMULATED
            </Badge>
            <a
                href="https://explorer.solana.com/address/Fe9cYeJEHswbyeTfrHGLgJocYnTA1gpND6H2LNXXHHwb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400/60 hover:text-amber-300 underline text-[9px] uppercase tracking-wider transition-colors"
            >
                Audit On-Chain
            </a>
        </div>
    );
}
