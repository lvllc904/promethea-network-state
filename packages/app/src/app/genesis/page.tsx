'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@promethea/ui';
import { useUser, useFirestore, useDoc, doc, setDoc, serverTimestamp, collection, addDoc } from '@promethea/identity';
import { ShieldCheck, Zap, Sparkles, Loader2, Landmark } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { genesisMintAction } from '@/app/actions';

export default function GenesisPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const [isMinting, setIsMinting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [secretKey, setSecretKey] = useState('');

    const handleGenesisMint = async () => {
        if (!user) return;
        
        // Security check for Joshua
        if (secretKey.toLowerCase() !== 'promethae-genesis-2026') {
            setErrorMessage('Invalid Genesis Secret Key. Unauthorized substrate access.');
            setStatus('error');
            return;
        }

        setIsMinting(true);
        setStatus('idle');

        try {
            const result = await genesisMintAction(
                user.uid, 
                user.displayName || 'Joshua Wicke', 
                'joshua@lvhllc.org'
            );
            
            if ('error' in result) {
                setErrorMessage(result.error);
                setStatus('error');
                return;
            }

            setStatus('success');
            setTimeout(() => {
                router.push('/dashboard/ledger');
            }, 3000);
        } catch (err: any) {
            console.error('Genesis Mint Failed:', err);
            setErrorMessage(err.message || 'Substrate initialization failure.');
            setStatus('error');
        } finally {
            setIsMinting(false);
        }
    };

    if (isUserLoading) return <div className="p-10 text-center animate-pulse">Scanning Grid...</div>;

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(0,188,212,0.1),transparent_70%)]">
            <Card className="max-w-xl w-full border-primary/20 bg-black/80 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,188,212,0.1)]">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-primary/10 border border-primary/20 ring-4 ring-primary/5">
                            <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                        </div>
                    </div>
                    <CardTitle className="text-4xl font-headline font-bold uppercase tracking-tighter">Genesis Initiation</CardTitle>
                    <CardDescription className="text-muted-foreground uppercase tracking-widest text-[10px]">Level 0 Protocol Activation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
                        <p className="text-sm leading-relaxed text-zinc-300">
                            Detecting identity: <span className="text-primary font-mono">{user?.uid || 'ANONYMOUS'}</span>
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-tighter">
                            Status: Unclaimed Substrate
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Genesis Secret Key</label>
                            <input 
                                type="password" 
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                placeholder="Enter Root Authority Key..."
                                className="w-full bg-black/40 border border-primary/20 rounded-lg p-3 text-sm focus:border-primary outline-none transition-all placeholder:text-zinc-700"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { icon: ShieldCheck, text: "Elevate to Founding Member" },
                                { icon: Landmark, text: "Mint 100,000 Genesis UVT Tokens" },
                                { icon: Zap, text: "Unlock Full Architecture Access" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                    <item.icon className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-medium">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {status === 'error' && (
                         <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-mono">
                            ERROR: {errorMessage}
                         </div>
                    )}

                    {status === 'success' ? (
                        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-center space-y-2">
                            <ShieldCheck className="w-12 h-12 text-green-500 mx-auto" />
                            <p className="text-green-500 font-bold uppercase tracking-widest text-sm">Founding Member Initialized</p>
                            <p className="text-xs text-green-200/50">Redirecting to Sovereign Ledger...</p>
                        </div>
                    ) : (
                        <Button 
                            onClick={handleGenesisMint} 
                            disabled={isMinting || !user || !secretKey}
                            className="w-full h-16 text-lg font-headline uppercase tracking-widest rounded-xl shadow-2xl shadow-primary/20 group"
                        >
                            {isMinting ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-3">
                                    Confirm Genesis Mint
                                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                </span>
                            )}
                        </Button>
                    )}

                    <p className="text-[10px] text-muted-foreground text-center italic">
                        By confirming, you are signing this identity as the Root Authority of the current Network State.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
