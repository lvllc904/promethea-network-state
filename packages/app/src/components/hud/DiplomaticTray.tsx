'use client';

import React from 'react';
import { useUser, useDoc, useFirestore, doc } from '@promethea/identity';
import { Fingerprint, Shield, Zap, Globe, Key } from 'lucide-react';
import { Citizen } from '@promethea/lib';

import { useHUD } from '@/lib/hud-store';

export const DiplomaticTray = () => {
    const { activateFocusPanel } = useHUD();
    const db = useFirestore();
    const { user, isUserLoading } = useUser();
    const citizenRef = db && user && user.uid !== 'anonymous' ? doc(db, 'citizens', user.uid) : null;
    const { data: citizen, isLoading: isCitizenLoading } = useDoc<Citizen>(citizenRef as any);

    const isGuest = !user || user.uid === 'anonymous';

    if (isUserLoading || isCitizenLoading) return <div className="p-4 text-xs font-mono text-amber-500 animate-pulse">VERIFYING_IDENTITY...</div>;

    return (
        <div className="space-y-6">
            {/* Identity Card */}
            <div 
                onClick={() => activateFocusPanel('SWEAT_CLAIM')}
                className="p-5 bg-gradient-to-br from-amber-500/10 to-black border border-amber-500/30 rounded-xl relative overflow-hidden group cursor-pointer hover:border-amber-500/50 transition-colors"
            >
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Fingerprint className="w-16 h-16 text-amber-400" />
                </div>
                
                <h3 className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-6">Sovereign Passport</h3>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-[9px] text-zinc-500 font-mono uppercase">Designation</p>
                        <p className="text-lg font-bold text-white tracking-tight">
                            {isGuest ? 'Anonymous Entity' : citizen?.displayName || user?.displayName || 'Citizen'}
                        </p>
                    </div>
                    
                    <div>
                        <p className="text-[9px] text-zinc-500 font-mono uppercase">Decentralized ID (DID)</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Key className="w-3 h-3 text-amber-500" />
                            <p className="text-[10px] font-mono text-amber-100/70 break-all">
                                {isGuest ? 'did:sovereign:unverified:00000000' : `did:sovereign:auth:${user?.uid}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clearance & Access */}
            <div className="space-y-2">
                <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Network Access</h3>
                
                <div className="grid gap-2">
                    <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-zinc-400" />
                            <span className="text-xs text-zinc-300">Security Clearance</span>
                        </div>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${isGuest ? 'bg-zinc-800 text-zinc-500' : 'bg-amber-500/20 text-amber-400'}`}>
                            {isGuest ? 'LEVEL_0' : 'LEVEL_3'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-zinc-400" />
                            <span className="text-xs text-zinc-300">Hardware Tier</span>
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                            CORE
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-zinc-400" />
                            <span className="text-xs text-zinc-300">Territory Status</span>
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            UNASSIGNED
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
