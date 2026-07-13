'use client';

import { useSovereignData } from '@promethea/sovereign-store';
import { useEffect, useState } from 'react';

export interface WidgetConfig {
    id: string;
    type: string;
    title: string;
    pillar: 'INTELLIGENCE' | 'REFINERY' | 'TREASURY' | 'ATLAS';
    position: { x: number; y: number; w: number; h: number };
    params?: Record<string, any>;
}

export interface SovereignLayout {
    id: string;
    widgets: WidgetConfig[];
}

export const useSovereignLayout = () => {
    // 3.1: Fetch private layout from User Store (Local Vault)
    const { data: layout, isLoading, error } = useSovereignData('USER', 'layouts', 'main_cockpit');
    const [activeLayout, setActiveLayout] = useState<SovereignLayout | null>(null);

    useEffect(() => {
        if (layout) {
            setActiveLayout(layout);
        } else {
            // Default layout if vault is empty
            const defaultLayout: SovereignLayout = {
                id: 'default',
                widgets: [
                    {
                        id: 'atlas-main',
                        type: 'atlas-reality',
                        title: 'Territorial Awareness',
                        pillar: 'ATLAS',
                        position: { x: 0, y: 0, w: 12, h: 6 }
                    }
                ]
            };
            setActiveLayout(defaultLayout);
        }
    }, [layout]);

    const saveLayout = (newLayout: SovereignLayout) => {
        localStorage.setItem('sovereign_vault_layouts_main_cockpit', JSON.stringify(newLayout));
        setActiveLayout(newLayout);
    };

    return { layout: activeLayout, isLoading, error, saveLayout };
};
