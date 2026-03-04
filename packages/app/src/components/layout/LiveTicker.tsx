'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Brain, Shield, Zap } from 'lucide-react';
import { useFirestore, useDoc } from '@promethea/firebase';
import { doc } from 'firebase/firestore';

interface TickerData {
    symbol: string;
    price: number;
    change24h: number;
}

interface BrainPulse {
    consciousness: string;
    memoryPatterns: number;
    securityEvents: number;
    collaborationInsights: number;
    predictiveAccuracy: number;
    lastThought: string;
    uptime: number;
}

export function LiveTicker() {
    const firestore = useFirestore();
    const { data: brainPulse } = useDoc<BrainPulse>(firestore ? doc(firestore, 'security_telemetry', 'pulse') as any : null);

    const [tickerData, setTickerData] = useState<TickerData[]>([
        { symbol: 'BTC', price: 95430.00, change24h: 1.2 },
        { symbol: 'ETH', price: 3450.00, change24h: -0.5 },
        { symbol: 'SOL', price: 184.20, change24h: 3.4 },
        { symbol: 'LINK', price: 18.20, change24h: 0.05 },
        { symbol: 'GOLD', price: 2650.10, change24h: -1.2 },
        { symbol: 'UVT', price: 1.00, change24h: 0.00 },
    ]);

    useEffect(() => {
        const fetchTicker = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,chainlink&vs_currencies=usd&include_24hr_change=true');
                const data = await response.json();

                if (data && data.bitcoin) {
                    const formatted: TickerData[] = [
                        { symbol: 'BTC', price: data.bitcoin.usd, change24h: data.bitcoin.usd_24h_change },
                        { symbol: 'ETH', price: data.ethereum.usd, change24h: data.ethereum.usd_24h_change },
                        { symbol: 'SOL', price: data.solana.usd, change24h: data.solana.usd_24h_change },
                        { symbol: 'LINK', price: data.chainlink.usd, change24h: data.chainlink.usd_24h_change },
                        { symbol: 'GOLD', price: 2650.10, change24h: -1.2 },
                        { symbol: 'UVT', price: 1.00, change24h: 0.00 },
                    ];
                    setTickerData(formatted);
                }
            } catch (error) {
                console.error("Failed to fetch ticker data", error);
            }
        };

        fetchTicker();
        const interval = setInterval(fetchTicker, 60000); // 1 minute
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-container {
            display: flex;
            width: fit-content;
            animation: marquee 30s linear infinite;
        }
        .animate-marquee-container:hover {
            animation-play-state: paused;
        }
      `}} />
            <div className="w-full bg-background/95 backdrop-blur border-b border-primary/20 flex overflow-hidden whitespace-nowrap py-1.5 px-4 shadow-sm relative z-40 bg-muted/20">
                <div className="flex items-center gap-2 mr-4 text-[10px] font-bold text-primary tracking-widest uppercase z-10 bg-background/95 pr-4 absolute left-0 h-full top-0 pl-4 border-r border-primary/10">
                    <Activity className="w-3 h-3" />
                    Sovereign Feed
                </div>
                <div className="flex w-full overflow-hidden pl-32">
                    <div className="animate-marquee-container gap-8 items-center flex-nowrap pr-8">
                        {/* Brain Pulse Metrics */}
                        {brainPulse && (
                            <>
                                <div className="flex flex-row items-center gap-1.5 font-mono text-xs hover:bg-muted/50 px-2 py-0.5 rounded transition-colors cursor-default border border-primary/20 bg-primary/5">
                                    <Brain className="w-3 h-3 text-orange-500 animate-pulse" />
                                    <span className="font-semibold text-muted-foreground uppercase">Awareness</span>
                                    <span className="font-bold text-primary">{brainPulse.consciousness || 'Active'}</span>
                                </div>
                                <div className="flex flex-row items-center gap-1.5 font-mono text-xs hover:bg-muted/50 px-2 py-0.5 rounded transition-colors cursor-default border border-primary/20 bg-primary/5">
                                    <Zap className="w-3 h-3 text-yellow-500" />
                                    <span className="font-semibold text-muted-foreground uppercase">Accuracy</span>
                                    <span className="font-bold text-yellow-500">{(brainPulse.predictiveAccuracy * 100 || 0).toFixed(1)}%</span>
                                </div>
                                <div className="flex flex-row items-center gap-1.5 font-mono text-xs hover:bg-muted/50 px-2 py-0.5 rounded transition-colors cursor-default border border-primary/20 bg-primary/5">
                                    <Shield className="w-3 h-3 text-blue-500" />
                                    <span className="font-semibold text-muted-foreground uppercase">Integrity</span>
                                    <span className="font-bold text-blue-500">{brainPulse.memoryPatterns || 0} Nodes</span>
                                </div>
                                <span className="text-muted-foreground/30 mx-2 text-lg">::</span>
                            </>
                        )}

                        {/* Financial Ticker */}
                        {[...tickerData, ...tickerData].map((item, idx) => (
                            <div key={idx} className="flex flex-row items-center gap-1.5 font-mono text-xs hover:bg-muted/50 px-2 py-0.5 rounded transition-colors cursor-default">
                                <span className="font-semibold text-muted-foreground">{item.symbol}</span>
                                <span className="font-bold">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span className={`flex items-center text-[10px] ${item.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {item.change24h >= 0 ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                                    {Math.abs(item.change24h).toFixed(2)}%
                                </span>
                                <span className="text-muted-foreground/30 mx-2">|</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
