'use client';

import React from 'react';
import { SovereignMap } from './SovereignMap';
import { useSovereignData } from '@promethea/identity';
import { WidgetConfig } from '@/lib/sovereign-layout';

interface WidgetRendererProps {
    config: WidgetConfig;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ config }) => {
    // Fetch data from the State Lake (3.2) if needed for the widget
    const { data: stateData } = useSovereignData('STATE', 'atlas', 'layers');

    switch (config.type) {
        case 'atlas-reality':
            return (
                <div className="h-[400px] w-full">
                    <SovereignMap layers={stateData || []} />
                </div>
            );
        case 'treasury-stats':
            return (
                <div className="p-4 bg-gray-900 border border-gray-800 rounded">
                    <h3 className="text-[10px] text-gray-500 uppercase font-black mb-2">{config.title}</h3>
                    <div className="text-2xl font-mono text-emerald-400">$20,054.52</div>
                </div>
            );
        default:
            return (
                <div className="p-4 border border-dashed border-gray-800 rounded opacity-40 text-center">
                    <span className="text-[8px] uppercase font-black">Unknown Widget: {config.type}</span>
                </div>
            );
    }
};
