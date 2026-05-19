'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineData, AreaSeries, LineSeries, ColorType } from 'lightweight-charts';
import { Button } from '@promethea/ui';
import { Activity, TrendingUp, Layers } from 'lucide-react';

interface SovereignChartProps {
    primaryData: LineData[];
    btcData: LineData[];
    ethData: LineData[];
    title: string;
}

export const SovereignChart: React.FC<SovereignChartProps> = ({ primaryData, btcData, ethData, title }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<IChartApi | null>(null);
    const primarySeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
    
    // Overlay Series Refs
    const btcSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
    const ethSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
    const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

    const [toggles, setToggles] = useState({
        sma: false,
        btc: false,
        eth: false
    });

    // Calculate a simple 5-period moving average
    const calculateSMA = (data: LineData[], period: number) => {
        const sma: LineData[] = [];
        for (let i = period - 1; i < data.length; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += data[i - j].value;
            }
            sma.push({ time: data[i].time, value: sum / period });
        }
        return sma;
    };

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#9ca3af',
            },
            grid: {
                vertLines: { color: 'rgba(31, 41, 55, 0.4)' },
                horzLines: { color: 'rgba(31, 41, 55, 0.4)' },
            },
            rightPriceScale: {
                borderVisible: false,
            },
            timeScale: {
                borderVisible: false,
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                mode: 1, // Normal mode
                vertLine: {
                    color: '#10b981',
                    width: 1,
                    style: 3,
                },
                horzLine: {
                    color: '#10b981',
                    width: 1,
                    style: 3,
                },
            },
            autoSize: true,
        });
        chartInstanceRef.current = chart;

        // Primary Series (UVT / Reserve)
        const areaSeries = chart.addSeries(AreaSeries, {
            lineColor: '#06b6d4', // Cyan
            topColor: 'rgba(6, 182, 212, 0.2)',
            bottomColor: 'rgba(6, 182, 212, 0.0)',
            lineWidth: 2,
        });
        areaSeries.setData(primaryData);
        primarySeriesRef.current = areaSeries;

        chart.timeScale().fitContent();

        return () => {
            chart.remove();
        };
    }, [primaryData]);

    // Handle Toggles
    useEffect(() => {
        const chart = chartInstanceRef.current;
        if (!chart) return;

        // SMA Toggle
        if (toggles.sma && !smaSeriesRef.current) {
            const smaData = calculateSMA(primaryData, 5);
            const smaSeries = chart.addSeries(LineSeries, {
                color: '#f59e0b', // Amber
                lineWidth: 1,
                lineStyle: 2, // Dashed
                title: 'SMA (5)',
            });
            smaSeries.setData(smaData);
            smaSeriesRef.current = smaSeries;
        } else if (!toggles.sma && smaSeriesRef.current) {
            chart.removeSeries(smaSeriesRef.current);
            smaSeriesRef.current = null;
        }

        // BTC Toggle
        if (toggles.btc && !btcSeriesRef.current) {
            const btcSeries = chart.addSeries(LineSeries, {
                color: '#f7931a', // Bitcoin Orange
                lineWidth: 2,
                title: 'BTC Overlay',
            });
            btcSeries.setData(btcData);
            btcSeriesRef.current = btcSeries;
        } else if (!toggles.btc && btcSeriesRef.current) {
            chart.removeSeries(btcSeriesRef.current);
            btcSeriesRef.current = null;
        }

        // ETH Toggle
        if (toggles.eth && !ethSeriesRef.current) {
            const ethSeries = chart.addSeries(LineSeries, {
                color: '#627eea', // Ethereum Blue
                lineWidth: 2,
                title: 'ETH Overlay',
            });
            ethSeries.setData(ethData);
            ethSeriesRef.current = ethSeries;
        } else if (!toggles.eth && ethSeriesRef.current) {
            chart.removeSeries(ethSeriesRef.current);
            ethSeriesRef.current = null;
        }

    }, [toggles, primaryData, btcData, ethData]);

    const toggleFeature = (feature: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [feature]: !prev[feature] }));
    };

    return (
        <div className="relative w-full h-[400px] bg-gray-950 rounded-lg border border-gray-800 overflow-hidden flex flex-col">
            {/* Contextual Overlay / Toolbar */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-start pointer-events-none">
                <div>
                    <h3 className="text-lg font-black uppercase text-white font-mono flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-500" />
                        {title}
                    </h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Live Data Canvas</p>
                </div>
                
                <div className="flex gap-2 pointer-events-auto">
                    <Button 
                        size="sm" 
                        onClick={() => toggleFeature('sma')}
                        className={`h-7 text-[9px] uppercase font-black tracking-widest transition-colors ${toggles.sma ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' : 'bg-black/50 text-gray-400 border-gray-800 hover:border-amber-500/30'}`}
                        variant="outline"
                    >
                        <TrendingUp className="w-3 h-3 mr-1" /> SMA
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={() => toggleFeature('btc')}
                        className={`h-7 text-[9px] uppercase font-black tracking-widest transition-colors ${toggles.btc ? 'bg-orange-500/20 text-orange-500 border-orange-500/50' : 'bg-black/50 text-gray-400 border-gray-800 hover:border-orange-500/30'}`}
                        variant="outline"
                    >
                        <Layers className="w-3 h-3 mr-1" /> vs BTC
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={() => toggleFeature('eth')}
                        className={`h-7 text-[9px] uppercase font-black tracking-widest transition-colors ${toggles.eth ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-black/50 text-gray-400 border-gray-800 hover:border-blue-500/30'}`}
                        variant="outline"
                    >
                        <Layers className="w-3 h-3 mr-1" /> vs ETH
                    </Button>
                </div>
            </div>

            {/* Chart Container */}
            <div ref={chartContainerRef} className="flex-1 w-full pt-16" />
        </div>
    );
};
