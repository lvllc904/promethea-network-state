'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, Skeleton } from '@promethea/ui';
import { Settings, Shield, User, Globe, Bell, Zap, Copy, Key, UserCheck, EyeOff, ShieldAlert, Cpu } from 'lucide-react';
import { useFirestore, useUser, useDoc } from '@promethea/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Citizen } from '@promethea/lib';

export default function SecuritySettingsPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { data: citizen, isLoading } = useDoc<Citizen>(
        firestore && user?.uid && !user.isAnonymous ? doc(firestore, 'citizens', user.uid) as any : null
    );

    const [isUpdating, setIsUpdating] = React.useState(false);

    const toggleAnonymity = async () => {
        if (!firestore || !user?.uid || !citizen) return;
        setIsUpdating(true);
        try {
            await updateDoc(doc(firestore, 'citizens', user.uid), {
                isAnonymized: !(citizen as any).isAnonymized
            });
        } catch (error) {
            console.error('Failed to update anonymity settings:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full" />)}
                </div>
            </div>
        );
    }

    const categories = [
        {
            title: "Identity Layer",
            desc: "Manage SSI and DID credentials.",
            icon: User,
            content: citizen ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono bg-black/20 p-2 rounded border border-white/5">
                        <span className="text-muted-foreground">DID:</span>
                        <span className="text-primary truncate ml-2 max-w-[150px]">{citizen.decentralizedId}</span>
                        <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => navigator.clipboard.writeText(citizen.decentralizedId)}>
                            <Copy className="h-2 w-2" />
                        </Button>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[8px] uppercase tracking-widest">
                        <UserCheck className="w-2 h-2 mr-1" />
                        Sovereign Verified
                    </Badge>
                </div>
            ) : "Login to view credentials."
        },
        {
            title: "Privacy Substrate",
            desc: "Anonymization levels and data opting.",
            icon: EyeOff,
            content: (
                <div className="space-y-4">
                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                        Control how your metabolic and contribution data is reflected on the public ledger.
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Global Anonymization</span>
                        <Button
                            variant={(citizen as any)?.isAnonymized ? "default" : "outline"}
                            size="sm"
                            className="text-[10px] h-7 px-4"
                            onClick={toggleAnonymity}
                            disabled={isUpdating || !citizen}
                        >
                            {(citizen as any)?.isAnonymized ? "Enabled" : "Enable"}
                        </Button>
                    </div>
                </div>
            )
        },
        {
            title: "Network Access",
            desc: "Global perimeter and CDN settings.",
            icon: Globe,
            content: (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground uppercase tracking-widest">Latency</span>
                        <span className="text-primary font-mono">14ms</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground uppercase tracking-widest">Protocol</span>
                        <span className="text-primary font-mono">WebRTC / TLS 1.3</span>
                    </div>
                </div>
            )
        },
        {
            title: "Alert Protocols",
            desc: "Notification routing for critical events.",
            icon: Bell,
            content: (
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[8px] opacity-70">Push</Badge>
                    <Badge variant="outline" className="text-[8px] opacity-70">Email</Badge>
                    <Badge variant="outline" className="text-[8px] opacity-30">Neural (Wave 9)</Badge>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-10 max-w-6xl mx-auto pb-12">
            <div className="flex justify-between items-end border-b border-primary/10 pb-8">
                <div>
                    <h1 className="text-4xl font-headline flex items-center gap-3">
                        <Settings className="w-10 h-10 text-primary" />
                        System Settings
                    </h1>
                    <p className="text-muted-foreground mt-2 font-mono text-sm">Configure your personal interface with the Network State substrate.</p>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1">BUILD v5.2.3</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {categories.map((cat) => (
                    <Card key={cat.title} className="border-primary/10 bg-black/40 backdrop-blur-md relative group overflow-hidden hover:border-primary/30 transition-all shadow-xl">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl pointer-events-none" />
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-muted/50 border border-primary/5 group-hover:bg-primary/10 transition-colors">
                                    <cat.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-headline text-white">{cat.title}</CardTitle>
                                    <CardDescription className="text-xs">{cat.desc}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="min-h-[60px]">
                                {typeof cat.content === 'string' ? (
                                    <p className="text-sm text-muted-foreground">{cat.content}</p>
                                ) : (
                                    cat.content
                                )}
                            </div>
                            <Button variant="ghost" className="w-full text-[10px] mt-6 border border-white/5 uppercase tracking-widest hover:bg-primary/5 h-8">
                                <Settings className="w-3 h-3 mr-2" />
                                Advanced Configuration
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-amber-500/30 bg-amber-500/5 backdrop-blur-md overflow-hidden relative group">
                <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Cpu className="w-48 h-48" />
                </div>
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-3 text-amber-500">
                        <ShieldAlert className="w-6 h-6" />
                        Sovereign Kernel Console
                    </CardTitle>
                    <CardDescription className="text-amber-500/70 font-mono text-[10px] uppercase tracking-tighter">LEVEL 0 ACCESS REQUIRED</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground mb-6 leading-relaxed max-w-2xl">
                        Warning: Enabling Kernel Mode provides direct write-access to the **MCP Communication Bus** and the **Clojure Core substrate**.
                        This action is irreversible for the current session and bypasses Guardian Intent Filtering.
                    </p>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" disabled className="border-amber-500/50 text-amber-500/50 bg-amber-500/5 text-xs px-8">
                            <Key className="w-4 h-4 mr-2" />
                            Enter Kernel Mode (L0)
                        </Button>
                        <span className="text-[10px] font-mono text-amber-500/40 italic">Wave 4 Protocol: Restricted to Genesis Citizens</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
