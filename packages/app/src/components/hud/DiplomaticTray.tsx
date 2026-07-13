'use client';

import React from 'react';

import { Fingerprint, Shield, Zap, Globe, Key, FileUp, CheckCircle2, AlertCircle, Loader2, Lock, RefreshCw, FileText, Terminal } from 'lucide-react';
import { Citizen } from '@promethea/lib';

import { useHUD } from '@/lib/hud-store';


export const DiplomaticTray = () => {
    const { activateFocusPanel } = useHUD();

    const isGuest = true;
    const user = null as any;
    const citizen = null as any;

    const [dragActive, setDragActive] = React.useState(false);
    const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [passphrase, setPassphrase] = React.useState('promethean-sovereign-vault');
    const [fileInfo, setFileInfo] = React.useState<{ name: string; size: number; type: string } | null>(null);
    const [vaultResult, setVaultResult] = React.useState<{ hash: string; path: string; timestamp: string; algorithm: string } | null>(null);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = React.useState(0);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const uploadFile = async (file: File) => {
        setFileInfo({ name: file.name, size: file.size, type: file.type || 'application/octet-stream' });
        setUploadStatus('uploading');
        setUploadProgress(10);
        setErrorMsg(null);
        setVaultResult(null);

        try {
            // Read file as ArrayBuffer
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const arrayBuffer = event.target?.result as ArrayBuffer;
                    if (!arrayBuffer) {
                        throw new Error("Failed to read file content.");
                    }
                    
                    setUploadProgress(40);

                    // Send POST request with raw binary stream data
                    const response = await fetch('http://localhost:9999/api/depthos-bridge', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/octet-stream',
                            'X-File-Name': file.name,
                            'X-Mime-Type': file.type || 'application/octet-stream',
                            'X-Passphrase': passphrase,
                        },
                        body: arrayBuffer,
                    });

                    setUploadProgress(80);

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || `HTTP error ${response.status}`);
                    }

                    const data = await response.json();
                    setUploadProgress(100);
                    
                    if (data.status === 'success') {
                        setVaultResult({
                            hash: data.hash,
                            path: data.vaultPath,
                            timestamp: data.timestamp,
                            algorithm: data.algorithm
                        });
                        setUploadStatus('success');
                    } else {
                        throw new Error(data.error || 'Unknown error received from bridge.');
                    }
                } catch (err: any) {
                    setErrorMsg(err.message || 'Cryptographic uplink failed.');
                    setUploadStatus('error');
                }
            };

            reader.onerror = () => {
                setErrorMsg("FileReader encountered an error reading the file.");
                setUploadStatus('error');
            };

            reader.readAsArrayBuffer(file);

        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to initialize secure upload stream.');
            setUploadStatus('error');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            uploadFile(e.target.files[0]);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

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

            {/* Cryptographic Document Vault Bridge */}
            <div className="space-y-2">
                <h3 className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center justify-between">
                    <span>Cryptographic Bridge Vault</span>
                    <span className="text-[8px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">AES-GCM-256 ACTIVE</span>
                </h3>

                <div className="bg-black/60 border border-zinc-800 rounded-xl p-4 space-y-4 shadow-2xl relative overflow-hidden backdrop-blur-md">
                    {/* Glowing background highlights */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                    {/* Custom Key Derivation Input */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] text-zinc-400 font-mono flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-amber-400" />
                            VAULT PASSPHRASE (PBKDF2 SEED)
                        </label>
                        <input
                            type="password"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                            disabled={uploadStatus === 'uploading'}
                            className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 text-xs text-zinc-100 font-mono px-3 py-2 rounded-lg transition-all outline-none"
                            placeholder="Enter secure vault passphrase..."
                        />
                    </div>

                    {/* Drag and Drop Container */}
                    <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border border-dashed rounded-xl p-6 transition-all duration-300 relative flex flex-col items-center justify-center text-center cursor-pointer ${
                            dragActive 
                                ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_15px_rgba(245, 158, 11,0.15)] scale-[1.01]' 
                                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50'
                        }`}
                    >
                        <input
                            type="file"
                            id="file-vault-upload"
                            onChange={handleChange}
                            className="hidden"
                            disabled={uploadStatus === 'uploading'}
                        />
                        <label htmlFor="file-vault-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                            {uploadStatus === 'idle' && (
                                <>
                                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-full mb-3 group-hover:scale-105 transition-transform">
                                        <FileUp className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <p className="text-xs text-zinc-300 font-semibold mb-1">Secure Sovereign Upload</p>
                                    <p className="text-[10px] text-zinc-500 font-mono">Drag & drop raw documents or click to browse</p>
                                    <p className="text-[8px] text-zinc-600 mt-2 font-mono">Payload encrypted client-side prior to edge storage</p>
                                </>
                            )}

                            {uploadStatus === 'uploading' && (
                                <div className="space-y-3 w-full py-2">
                                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                                    <div className="space-y-1">
                                        <p className="text-xs text-amber-400 font-semibold">Securing Uplink Stream...</p>
                                        <p className="text-[9px] text-zinc-400 font-mono truncate max-w-[200px] mx-auto">{fileInfo?.name}</p>
                                    </div>
                                    <div className="w-full bg-zinc-950 border border-zinc-800 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-amber-500 to-amber-500 h-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-[8px] text-zinc-500 font-mono">{uploadProgress}% Packets Processed</p>
                                </div>
                            )}

                            {uploadStatus === 'success' && vaultResult && (
                                <div className="space-y-4 w-full py-1 text-left">
                                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
                                        <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                                        <div>
                                            <p className="text-xs text-amber-400 font-semibold">Uplink Cryptographically Sealed</p>
                                            <p className="text-[8px] text-zinc-500 font-mono uppercase">Local DepthOS Vault Confirmed</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-[10px] font-mono text-zinc-400">
                                        <div className="flex justify-between border-b border-zinc-900 pb-1">
                                            <span className="text-zinc-500">FILENAME</span>
                                            <span className="text-zinc-200 font-bold truncate max-w-[150px]">{fileInfo?.name}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-zinc-900 pb-1">
                                            <span className="text-zinc-500">SIZE / TYPE</span>
                                            <span className="text-zinc-200">{formatBytes(fileInfo?.size || 0)} ({fileInfo?.type.split('/')[1] || 'bin'})</span>
                                        </div>
                                        <div className="flex justify-between border-b border-zinc-900 pb-1">
                                            <span className="text-zinc-500">CIPHER / MODE</span>
                                            <span className="text-amber-400 font-bold">{vaultResult.algorithm.toUpperCase()}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-zinc-500 block">SHA-256 VAULT HASH</span>
                                            <span className="text-[9px] text-zinc-300 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 select-all block break-all leading-normal font-bold">
                                                {vaultResult.hash}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-zinc-500 block">LOCAL STORAGE VAULT PATH</span>
                                            <span className="text-[9px] text-zinc-400 bg-zinc-950/60 px-2 py-1 rounded border border-zinc-900/60 select-all block truncate" title={vaultResult.path}>
                                                {vaultResult.path}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setUploadStatus('idle');
                                            setFileInfo(null);
                                            setVaultResult(null);
                                        }}
                                        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[10px] text-zinc-300 font-mono rounded-lg transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3 text-amber-400" />
                                        RESET BRIDGE VAULT UPLOADER
                                    </button>
                                </div>
                            )}

                            {uploadStatus === 'error' && (
                                <div className="space-y-3 w-full py-2">
                                    <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                                    <div>
                                        <p className="text-xs text-rose-500 font-semibold">Uplink Encryption Failed</p>
                                        <p className="text-[9px] text-zinc-400 font-mono mt-1 leading-normal max-w-[220px] mx-auto bg-rose-950/20 border border-rose-900/20 p-2 rounded">{errorMsg}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setUploadStatus('idle');
                                        }}
                                        className="px-4 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[10px] text-rose-400 font-mono rounded-lg transition-colors"
                                    >
                                        RETRY UPLINK
                                    </button>
                                </div>
                            )}
                        </label>
                    </div>
                </div>
            </div>

            {/* Vanguard Canary Opt-In */}
            <div className="space-y-2 mt-6">
                <h3 className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center justify-between">
                    <span>Vanguard Protocol</span>
                    <span className="text-[8px] px-2 py-0.5 bg-amber-500/20 rounded text-amber-400">YIELD ACTIVE</span>
                </h3>
                
                <div className="p-3 bg-black/40 border border-amber-500/30 rounded-lg cursor-pointer hover:bg-black/60 transition-colors"
                    onClick={() => {
                        const current = localStorage.getItem('vanguardOptIn') === 'true';
                        localStorage.setItem('vanguardOptIn', (!current).toString());
                        window.dispatchEvent(new Event('vanguardChanged'));
                    }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-amber-400 font-bold">Join Vanguard (Canary)</span>
                        <div className="relative inline-block w-8 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="toggle" id="vanguard-toggle" checked={typeof window !== 'undefined' && window.localStorage?.getItem('vanguardOptIn') === 'true'} readOnly className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer" style={{ right: (typeof window !== 'undefined' && window.localStorage?.getItem('vanguardOptIn') === 'true') ? '0' : '1rem' }}/>
                            <label htmlFor="vanguard-toggle" className="toggle-label block overflow-hidden h-4 rounded-full bg-amber-900 cursor-pointer"></label>
                        </div>
                    </div>
                    <p className="text-[9px] text-zinc-500 leading-relaxed font-mono">
                        Route your traffic to unstable Canary builds (5% Network Split). Earn micro-UVT rewards for session time and bug reports. Settlement can be chosen on-chain or off-chain.
                    </p>
                </div>
            </div>
        </div>
    );
};
