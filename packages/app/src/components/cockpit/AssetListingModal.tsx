'use client';

import React, { useState } from 'react';
import { useHUD } from '@/lib/hud-store';
import { X, ShieldCheck, Box, Users, Coins, ArrowRight, Zap, CheckCircle2, UploadCloud } from 'lucide-react';
import type { Asset, AssetOwnership, PricingMode } from '@/lib/hud-store';

export function AssetListingModal({ onClose }: { onClose: () => void }) {
    const { listAsset, userDid } = useHUD();
    const [step, setStep] = useState(1);

    // Form State
    const [assetType, setAssetType] = useState<Asset['type']>('REAL_ESTATE');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [valuation, setValuation] = useState(10000);
    const [ownership, setOwnership] = useState<AssetOwnership>('WHOLE');
    const [pricingMode, setPricingMode] = useState<PricingMode>('FIXED');

    const handleOnboard = () => {
        const newAsset: Asset = {
            id: `asset-0x${Math.random().toString(16).substring(2, 10)}`,
            type: assetType,
            name,
            description,
            ownership,
            pricingMode,
            valuationUSDC: valuation,
            sharesTotal: ownership === 'FRACTIONAL' ? 10000 : undefined,
            sharesAvailable: ownership === 'FRACTIONAL' ? 10000 : undefined,
            isUCC1Filed: true,
            ownerDid: userDid
        };

        listAsset(newAsset);
        setStep(5); // Success Step
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
            <div className="w-[480px] bg-black/90 border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-emerald-400" />
                        <h2 className="text-[10px] font-label uppercase tracking-widest text-zinc-200">
                            Onboard RWA Asset
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Wizard Body */}
                <div className="p-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-sm font-semibold text-white mb-1 font-data">1. Asset Definition</h3>
                            <p className="text-[10px] text-zinc-400 mb-4 font-label">Classify the underlying collateral.</p>

                            <select 
                                value={assetType}
                                onChange={(e) => setAssetType(e.target.value as any)}
                                className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:border-emerald-500/50 outline-none"
                            >
                                <option value="REAL_ESTATE">Real Estate / Land</option>
                                <option value="COMPUTE_NODE">Hardware / Compute Node</option>
                                <option value="IP">Intellectual Property</option>
                                <option value="OTHER">Other Tangible Asset</option>
                            </select>

                            <input 
                                type="text"
                                placeholder="Asset Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:border-emerald-500/50 outline-none"
                            />

                            <textarea 
                                placeholder="Asset Description & Legal Bounds"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-20 bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:border-emerald-500/50 outline-none resize-none"
                            />

                            <button 
                                onClick={() => setStep(2)}
                                disabled={!name || !description}
                                className="w-full py-2 mt-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-data text-[10px] font-bold tracking-[0.14em] uppercase rounded-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                Next <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-sm font-semibold text-white mb-1 font-data">2. Structuring</h3>
                            <p className="text-[10px] text-zinc-400 mb-4 font-label">Define the ownership and valuation geometry.</p>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setOwnership('WHOLE')}
                                    className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${ownership === 'WHOLE' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 bg-black hover:bg-white/5'}`}
                                >
                                    <Box className={`w-5 h-5 ${ownership === 'WHOLE' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                                    <span className="text-[10px] font-label font-bold text-white uppercase tracking-wider">Whole Block</span>
                                    <span className="text-[8px] text-zinc-500 text-center">Transfer 100% ownership atomically.</span>
                                </button>
                                <button 
                                    onClick={() => setOwnership('FRACTIONAL')}
                                    className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${ownership === 'FRACTIONAL' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 bg-black hover:bg-white/5'}`}
                                >
                                    <Users className={`w-5 h-5 ${ownership === 'FRACTIONAL' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                                    <span className="text-[10px] font-label font-bold text-white uppercase tracking-wider">Syndicate</span>
                                    <span className="text-[8px] text-zinc-500 text-center">Fractionalize into 10,000 shares.</span>
                                </button>
                            </div>

                            <div className="pt-2">
                                <label className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Total Valuation (USDC)</label>
                                <input 
                                    type="number"
                                    value={valuation}
                                    onChange={(e) => setValuation(Number(e.target.value))}
                                    className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:border-emerald-500/50 outline-none"
                                />
                            </div>

                            <button 
                                onClick={() => setStep(3)}
                                className="w-full py-2 mt-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-data text-[10px] font-bold tracking-[0.14em] uppercase rounded-lg transition-all flex justify-center items-center gap-2"
                            >
                                Next <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-sm font-semibold text-white mb-1 font-data">3. Market Configuration</h3>
                            <p className="text-[10px] text-zinc-400 mb-4 font-label">How will this asset clear on the Sovereign Exchange?</p>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setPricingMode('FIXED')}
                                    className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${pricingMode === 'FIXED' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 bg-black hover:bg-white/5'}`}
                                >
                                    <ShieldCheck className={`w-5 h-5 ${pricingMode === 'FIXED' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                                    <span className="text-[10px] font-label font-bold text-white uppercase tracking-wider">Fixed OTC</span>
                                    <span className="text-[8px] text-zinc-500 text-center">Bonded Escrow. Fixed price.</span>
                                </button>
                                <button 
                                    onClick={() => setPricingMode('ORDER_BOOK')}
                                    className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${pricingMode === 'ORDER_BOOK' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10 bg-black hover:bg-white/5'}`}
                                >
                                    <Coins className={`w-5 h-5 ${pricingMode === 'ORDER_BOOK' ? 'text-amber-400' : 'text-zinc-500'}`} />
                                    <span className="text-[10px] font-label font-bold text-white uppercase tracking-wider">Order Book</span>
                                    <span className="text-[8px] text-zinc-500 text-center">Dynamic Bid/Ask Spread.</span>
                                </button>
                            </div>

                            <button 
                                onClick={() => setStep(4)}
                                className="w-full py-2 mt-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-data text-[10px] font-bold tracking-[0.14em] uppercase rounded-lg transition-all flex justify-center items-center gap-2"
                            >
                                Next <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-sm font-semibold text-white mb-1 font-data">4. Legal Anchoring & Document Attachment</h3>
                            <p className="text-[10px] text-zinc-400 mb-2 font-label">Attach title deeds, operating agreements, or UCC-1 statement.</p>

                            {/* Document File Input Dropzone */}
                            <div className="border border-dashed border-white/20 hover:border-emerald-500/50 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg p-3 text-center transition-all cursor-pointer">
                                <UploadCloud className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                                <span className="text-[10px] font-semibold text-zinc-200 block font-data">
                                    Click or Drag PDF Deed / UCC-1 Statement
                                </span>
                                <span className="text-[8px] text-zinc-500 block font-mono mt-0.5">
                                    Supported: .pdf, .docx, .zip (Max 50MB)
                                </span>
                                <input type="file" className="hidden" id="assetDocUpload" onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        // File selected
                                    }
                                }} />
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2 font-data text-[10px]">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400">Owner DID:</span>
                                    <span className="text-emerald-400 font-mono">{userDid.substring(0, 18)}...</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400">Delaware Series Registration:</span>
                                    <span className="text-sky-400 font-mono font-bold">AUTOMATIC</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400">UCC-1 Status:</span>
                                    <span className="text-amber-400 flex items-center gap-1 font-bold"><Zap className="w-3 h-3" /> PENDING MINT</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleOnboard}
                                className="w-full py-2 mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-data text-[10px] font-bold tracking-[0.14em] uppercase rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" /> MINT & LIST ASSET
                            </button>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-4 animate-in zoom-in duration-500 flex flex-col items-center text-center py-6">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white font-data">Asset Listed Successfully</h3>
                            <p className="text-xs text-zinc-400 font-label">The asset is now active on the Sovereign Ledger.</p>

                            <button 
                                onClick={onClose}
                                className="w-full py-2 mt-4 bg-white/10 hover:bg-white/20 text-white font-data text-[10px] font-bold tracking-[0.14em] uppercase rounded-lg transition-all"
                            >
                                CLOSE
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
