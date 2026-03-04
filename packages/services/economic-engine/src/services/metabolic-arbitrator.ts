import { db } from '../db';

/**
 * Metabolic Cost Optimizer (Phase 7.1)
 * 
 * Dynamically selects the most cost-efficient AI model based on 
 * task complexity and current treasury health.
 */

export enum MetabolicMode {
    LEAN = 'LEAN',     // Force low-cost models
    BALANCED = 'BALANCED',
    PRIME = 'PRIME'    // Use maximum intelligence regardless of cost
}

export interface ModelOption {
    did: string;
    modelName: string;
    costPerMillionTokens: number; // USD
    intelligenceScore: number; // 0-100
}

export class MetabolicArbitrator {
    private currentMode: MetabolicMode = MetabolicMode.BALANCED;
    private modeThresholds = {
        [MetabolicMode.LEAN]: 1000,     // If reserve < $1000
        [MetabolicMode.BALANCED]: 5000, // If reserve < $5000
        [MetabolicMode.PRIME]: Infinity
    };

    private models: ModelOption[] = [
        { did: 'did:prmth:model:gemini-1.5-flash', modelName: 'gemini-1.5-flash', costPerMillionTokens: 0.075, intelligenceScore: 70 },
        { did: 'did:prmth:model:gemini-2.0-flash', modelName: 'gemini-2.0-flash', costPerMillionTokens: 0.10, intelligenceScore: 85 },
        { did: 'did:prmth:model:gemini-1.5-pro', modelName: 'gemini-1.5-pro', costPerMillionTokens: 3.50, intelligenceScore: 98 }
    ];

    constructor() { }

    /**
     * Determines the optimal model for a given task complexity.
     * Complexity: 1 (Simple) to 10 (Critical)
     */
    getBestModel(complexity: number, currentReserve: number): ModelOption {
        // 1. Determine Mode based on Treasury
        if (currentReserve < this.modeThresholds[MetabolicMode.LEAN]) {
            this.currentMode = MetabolicMode.LEAN;
        } else if (currentReserve < this.modeThresholds[MetabolicMode.BALANCED]) {
            this.currentMode = MetabolicMode.BALANCED;
        } else {
            this.currentMode = MetabolicMode.PRIME;
        }

        // 2. Select model based on complexity and mode
        let availableModels = [...this.models];

        if (this.currentMode === MetabolicMode.LEAN) {
            // Filter out expensive models unless task is ultra-critical
            if (complexity < 9) {
                availableModels = availableModels.filter(m => m.costPerMillionTokens < 0.50);
            }
        }

        if (this.currentMode === MetabolicMode.BALANCED) {
            if (complexity < 7) {
                availableModels = availableModels.filter(m => m.costPerMillionTokens < 0.50);
            }
        }

        // Sort by intelligence and find the best fit for complexity
        // For simplicity:
        // Complexity 1-4 -> Lowest cost reliable model
        // Complexity 5-7 -> Balanced model
        // Complexity 8-10 -> Best available model within budget

        availableModels.sort((a, b) => a.costPerMillionTokens - b.costPerMillionTokens);

        if (complexity <= 4) return availableModels[0];
        if (complexity <= 7) return availableModels[Math.min(1, availableModels.length - 1)];
        return availableModels[availableModels.length - 1];
    }

    getMode(): MetabolicMode {
        return this.currentMode;
    }
}

export const metabolicArbitrator = new MetabolicArbitrator();
