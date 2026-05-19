'use client';

import { useState, useEffect } from 'react';

/**
 * useHardwareHandshake
 * 
 * Part of the Cartographer SDK.
 * Probes the user's hardware substrate to calculate a "Metabolic Score" (0.0 to 1.0).
 * This score is used by the Sovereign UI to switch between Core, Nexus, and Apex rendering modes.
 */

export interface HardwareProfile {
    score: number; // 0.0 (Legacy) to 1.0 (Apex)
    gpu: string;
    memory: number;
    cores: number;
    connection: string;
    tier: 'CORE' | 'NEXUS' | 'APEX';
    isLowPowerMode: boolean;
}

export const useHardwareHandshake = () => {
    const [profile, setProfile] = useState<HardwareProfile | null>(null);

    useEffect(() => {
        const probeHardware = async () => {
            // 1: Probe CPU Cores
            const cores = navigator.hardwareConcurrency || 2;

            // 2: Probe Device Memory (approximate)
            const memory = (navigator as any).deviceMemory || 4;

            // 3: Probe GPU via WebGL
            let gpu = 'Unknown Substrate';
            let gpuTier = 1; // 1 to 3

            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (gl) {
                    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
                    if (debugInfo) {
                        gpu = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                        // Heuristic: Check for common high-end GPU strings
                        if (/NVIDIA|Radeon|Apple M/i.test(gpu)) {
                            gpuTier = 3;
                        } else if (/Intel|Iris/i.test(gpu)) {
                            gpuTier = 2;
                        }
                    }
                }
            } catch (e) {
                console.warn('GPU Probe Inhibited');
            }

            // 4: Probe Network
            const connection = (navigator as any).connection?.effectiveType || 'unknown';
            const isHighBandwidth = ['4g', 'wifi'].includes(connection);

            // 5: Calculate Metabolic Score
            // Formula: (Memory / 16) + (Cores / 16) + (GPUTier / 3) + (NetworkFactor)
            const memoryFactor = Math.min(memory / 16, 0.3);
            const coreFactor = Math.min(cores / 16, 0.3);
            const gpuFactor = (gpuTier / 3) * 0.3;
            const networkFactor = isHighBandwidth ? 0.1 : 0;

            const score = Math.min(memoryFactor + coreFactor + gpuFactor + networkFactor, 1.0);

            // 6: Assign Tier
            let tier: HardwareProfile['tier'] = 'CORE';
            if (score > 0.7) tier = 'APEX';
            else if (score > 0.3) tier = 'NEXUS';

            setProfile({
                score,
                gpu,
                memory,
                cores,
                connection,
                tier,
                isLowPowerMode: memory < 4 || cores < 4
            });
        };

        probeHardware();
    }, []);

    return { profile, isLoading: !profile };
};
