'use client';

import React from 'react';
import { useHUD } from '@/lib/hud-store';
import { OSWindow } from './OSWindow';
import { ProofOfWorkSubmission } from '../intel/ProofOfWorkSubmission';

// Import Pillar Trays
import { AtlasTray } from './AtlasTray';
import { EconomicsTray } from './EconomicsTray';
import { GovernanceTray } from './GovernanceTray';
import { NarrativeTray } from './NarrativeTray';
import { DiplomaticTray } from './DiplomaticTray';
import { PulseTray } from './PulseTray';
import { PrometheaPanel } from './PrometheaPanel';
import { SettingsTray } from './SettingsTray';

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
} from './RightFocusTray';

export const WindowManager = () => {
    const { osWindows, activateFocusPanel } = useHUD();

    return (
        <>
            {osWindows.map((win) => {
                if (win.isPoppedOut) return null; // Let the pop-out handle rendering

                return (
                    <OSWindow key={win.id} id={win.id} type={win.type} title={win.title}>
                        <div className="h-full w-full overflow-y-auto custom-scrollbar p-6">
                            {win.type === 'ATLAS' && <AtlasTray />}
                            {win.type === 'ECONOMICS' && <EconomicsTray />}
                            {win.type === 'GOVERNANCE' && <GovernanceTray />}
                            {win.type === 'NARRATIVE' && <NarrativeTray />}
                            {win.type === 'DIPLOMATIC' && <DiplomaticTray />}
                            {win.type === 'PULSE' && <PulseTray />}
                            {win.type === 'ASGI' && <PrometheaPanel />}
                            {win.type === 'SETTINGS' && <SettingsTray />}

                            {win.type === 'EXCHANGE' && <ExchangePanel />}
                            {win.type === 'SQL_EXPLORER' && <SqlExplorerPanel />}
                            {win.type === 'CLI_GUIDE' && <CliGuidePanel />}
                            {win.type === 'SWEAT_CLAIM' && <SweatClaimPanel />}
                            {win.type === 'FINANCIALS' && <FinancialsPanel />}
                            {win.type === 'PROMETHEA_ASGI' && <AsgiTelemetryPanel />}
                            {win.type === 'WALLET' && <WalletPanel />}
                            {win.type === 'OMNI_SCANNER' && <OmniScannerPanel />}
                            {win.type === 'ASSET_CANVAS' && <AssetCanvasPanel />}
                            {win.type === 'CONFERENCE' && <ConferencePanel />}
                            {win.type === 'BIOLOGICAL_POW' && (
                                <div className="flex items-center justify-center h-full">
                                    <ProofOfWorkSubmission 
                                        taskId="oracle-eval-task"
                                        syndicateId="primary-syndicate"
                                        onSuccess={() => activateFocusPanel(null)}
                                        onCancel={() => activateFocusPanel(null)}
                                    />
                                </div>
                            )}
                        </div>
                    </OSWindow>
                );
            })}
        </>
    );
};
