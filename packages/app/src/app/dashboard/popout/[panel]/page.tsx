'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { HUDProvider } from '@/lib/hud-store';
import { HUDStateSync } from '@/lib/useBroadcastChannel';
import { MeshProvider } from '@/components/providers/mesh-provider';
import { ThemeController } from '@/components/ui/ThemeController';

// Import Pillar Trays
import { AtlasTray } from '@/components/hud/AtlasTray';
import { EconomicsTray } from '@/components/hud/EconomicsTray';
import { GovernanceTray } from '@/components/hud/GovernanceTray';
import { NarrativeTray } from '@/components/hud/NarrativeTray';
import { DiplomaticTray } from '@/components/hud/DiplomaticTray';
import { PulseTray } from '@/components/hud/PulseTray';
import { PrometheaPanel } from '@/components/hud/PrometheaPanel';
import { SettingsTray } from '@/components/hud/SettingsTray';

// Import Sub-Panels
import { 
    ExchangePanel, 
    SqlExplorerPanel, 
    CliGuidePanel, 
    SweatClaimPanel, 
    FinancialsPanel, 
    AsgiTelemetryPanel, 
    WalletPanel, 
    OmniScannerPanel, 
    AssetCanvasPanel, 
    ConferencePanel 
} from '@/components/hud/RightFocusTray';

function PopoutContent() {
    const params = useParams();
    const panelType = typeof params.panel === 'string' ? params.panel.toUpperCase() : '';

    let content = <div className="text-white text-center mt-20">Unknown Panel</div>;

    switch(panelType) {
        case 'ATLAS': content = <AtlasTray />; break;
        case 'ECONOMICS': content = <EconomicsTray />; break;
        case 'GOVERNANCE': content = <GovernanceTray />; break;
        case 'NARRATIVE': content = <NarrativeTray />; break;
        case 'DIPLOMATIC': content = <DiplomaticTray />; break;
        case 'PULSE': content = <PulseTray />; break;
        case 'ASGI': content = <PrometheaPanel />; break;
        case 'SETTINGS': content = <SettingsTray />; break;

        case 'EXCHANGE': content = <ExchangePanel />; break;
        case 'SQL_EXPLORER': content = <SqlExplorerPanel />; break;
        case 'CLI_GUIDE': content = <CliGuidePanel />; break;
        case 'SWEAT_CLAIM': content = <SweatClaimPanel />; break;
        case 'FINANCIALS': content = <FinancialsPanel />; break;
        case 'PROMETHEA_ASGI': content = <AsgiTelemetryPanel />; break;
        case 'WALLET': content = <WalletPanel />; break;
        case 'OMNI_SCANNER': content = <OmniScannerPanel />; break;
        case 'ASSET_CANVAS': content = <AssetCanvasPanel />; break;
        case 'CONFERENCE': content = <ConferencePanel />; break;
    }

    return (
        <div className="w-full h-screen overflow-hidden bg-black text-white">
            <div className="h-full w-full overflow-y-auto custom-scrollbar p-6">
                {content}
            </div>
        </div>
    );
}

export default function PopoutPage() {
    return (
        <HUDProvider>
            <HUDStateSync />
            <MeshProvider>
                <ThemeController />
                <PopoutContent />
            </MeshProvider>
        </HUDProvider>
    );
}
