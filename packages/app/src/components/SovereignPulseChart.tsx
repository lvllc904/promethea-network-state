'use client';
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, AreaSeries, LineData } from 'lightweight-charts';
import { Activity, ShieldAlert } from 'lucide-react';

interface SovereignPulseChartProps {
    velocityData: LineData[];
    immuneData: LineData[];
}

export const SovereignPulseChart: React.FC<SovereignPulseChartProps> = ({ velocityData, immuneData }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: 'solid', color: 'transparent' },
                textColor: '#9ca3af',
            },
            grid: {
                vertLines: { color: 'rgba(31, 41, 55, 0.4)', style: 1 },
                horzLines: { color: 'rgba(31, 41, 55, 0.4)', style: 1 },
            },
            rightPriceScale: {
                borderVisible: false,
                scaleMargins: { top: 0.1, bottom: 0.1 }
            },
            leftPriceScale: {
                visible: true,
                borderVisible: false,
                scaleMargins: { top: 0.5, bottom: 0 } // Immune blocks on lower half
            },
            timeScale: {
                borderVisible: false,
                timeVisible: true,
                secondsVisible: true,
            },
            crosshair: {
                mode: 1,
                vertLine: { color: '#10b981', width: 1, style: 3 },
                horzLine: { color: '#10b981', width: 1, style: 3 },
            },
            autoSize: true,
        });
        chartInstanceRef.current = chart;

        // Primary Series: Metabolic Velocity (Cyan)
        const velocitySeries = chart.addSeries(AreaSeries, {
            lineColor: '#06b6d4',
            topColor: 'rgba(6, 182, 212, 0.3)',
            bottomColor: 'rgba(6, 182, 212, 0.0)',
            lineWidth: 2,
            priceScaleId: 'right',
            title: 'Ops/s'
        });
        velocitySeries.setData(velocityData);

        // Secondary Series: Immune Rejections (Red)
        const immuneSeries = chart.addSeries(AreaSeries, {
            lineColor: '#ef4444',
            topColor: 'rgba(239, 68, 68, 0.4)',
            bottomColor: 'rgba(239, 68, 68, 0.0)',
            lineWidth: 2,
            priceScaleId: 'left',
            title: 'Blocks'
        });
        immuneSeries.setData(immuneData);

        chart.timeScale().fitContent();

        return () => {
            chart.remove();
        };
    }, [velocityData, immuneData]);

    return (
        <div className="relative w-full h-[300px] bg-gray-950 rounded border border-gray-800 overflow-hidden flex flex-col">
            {/* NOC Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-start pointer-events-none">
                <div>
                    <h3 className="text-sm font-black uppercase text-white font-mono flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-500" />
                        NOC Telemetry Stream
                    </h3>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Metabolic Velocity vs Immune Responses</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <span className="text-[8px] text-cyan-500 uppercase block font-bold">Current Velocity</span>
                        <span className="text-xs font-mono font-black text-white">{velocityData[velocityData.length - 1]?.value.toFixed(1)} Ops/s</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] text-red-500 uppercase block font-bold">Active Blocks</span>
                        <span className="text-xs font-mono font-black text-white">{immuneData[immuneData.length - 1]?.value.toFixed(0)}</span>
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div ref={chartContainerRef} className="flex-1 w-full pt-16" />
        </div>
    );
};
