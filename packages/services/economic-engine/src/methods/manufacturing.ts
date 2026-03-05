import { BaseMethod, ExecutionResult } from './base-method';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RealWorldAsset } from '../types';
import { db, COLLECTIONS } from '../db';
import { hardwareRelay } from '../services/hardware-relay';
import { metabolicArbitrator } from '../services/metabolic-arbitrator';
import { reserveManager } from '../treasury/reserve-manager';

/**
 * Method 5.2: Autonomous Manufacturing Agent
 * 
 * Uses Gemini to generate G-Code for physical objects.
 * Acts as a bridge between digital intent and physical production.
 */
export class ManufacturingMethod extends BaseMethod {
    private genAI: GoogleGenerativeAI;
    // Database simulation 
    private manufacturedAssets: RealWorldAsset[] = [];

    constructor(apiKey: string) {
        super('manufacturing', 'Autonomous Manufacturing Agent', {
            enabled: true,
            priority: 3,
            maxExecutionsPerDay: 5,
            estimatedRevenue: { min: 0, max: 0 },
            complexity: 7, // Specialized task
        });

        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async execute(targetObject: string = "Sovereign Coin"): Promise<ExecutionResult> {
        const logs: string[] = [];
        logs.push(`Initiating Manufacturing Sequence for: ${targetObject}...`);

        try {
            // Step 1: Generate G-Code Blueprint
            logs.push('Generating G-Code instructions (Marlin Firmware compat)...');

            const blueprint = await this.generateGCode(targetObject);
            const lines = blueprint.split('\n');
            logs.push(`Blueprint Generated: ${lines.length} lines of G-Code.`);
            logs.push(`Header: ${lines.slice(0, 3).join(' | ')}`);

            // Step 2: Mint Asset
            const asset: RealWorldAsset = {
                id: `mfg-${Date.now()}`,
                name: targetObject,
                description: `Autonomously manufactured ${targetObject}`,
                assetType: 'Manufacturing',
                location: 'Local Fab Node',
                price: 0,
                blueprint: blueprint,
                status: 'Active', // Ready to print
                createdAt: new Date().toISOString()
            };

            this.manufacturedAssets.push(asset);

            // Phase 5.5: Ephemeral Artifact Logic
            // If the object is a "Sovereign Token", it is marked as ephemeral
            const isEphemeral = targetObject.toLowerCase().includes('token') || targetObject.toLowerCase().includes('marker');

            // 3. Persist to Firestore
            await db.collection(COLLECTIONS.ASSETS).add({
                ...asset,
                blueprint: isEphemeral ? '--- EPHEMERAL: PURGED UPON RELAY ---' : blueprint,
                discoveryMethod: this.methodId,
                status: 'Proposed',
                isKineticToken: isEphemeral
            });
            logs.push(`Blueprint pushed to Sovereign Marketplace ${isEphemeral ? '(EPHEMERAL TOKEN)' : '(Proposed)'}`);

            // Phase 4.2 & 5.5: Direct Physical Relay with Purge
            await hardwareRelay.relayGCode({
                id: asset.id,
                targetNode: 'Primary Fab Node Alpha',
                nodeType: 'Sovereign',
                gcode: blueprint,
                status: 'Pending',
                isEphemeral: isEphemeral,
                timestamp: Date.now()
            });
            logs.push(`G-Code Relayed to Physical Hardware. ${isEphemeral ? 'Blueprint self-destructed.' : ''}`);

            return {
                success: true,
                revenue: 0,
                cost: 0.05, // API Cost
                profit: -0.05,
                timestamp: Date.now(),
                modelDID: 'did:prmth:model:gemini-2.0-flash',
                logs,
            };

        } catch (error) {
            return {
                success: false,
                revenue: 0,
                cost: 0,
                profit: 0,
                timestamp: Date.now(),
                logs,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    private async generateGCode(objectDescription: string): Promise<string> {
        const stats = reserveManager.getStats();
        const modelInfo = metabolicArbitrator.getBestModel(this.config.complexity, stats.reserveBalance);
        const model = this.genAI.getGenerativeModel({ model: modelInfo.modelName });

        const prompt = `Generate valid 3D Printer G-Code (Marlin Firmware) for a simple: "${objectDescription}".
        
        Requirements:
        - Assume a standard 0.4mm nozzle, PLA filament at 200C.
        - Include standard start G-Code (G28, G29 if needed, M104/M109).
        - Keep it simple and geometric to minimize output size (e.g. primitive shapes approximation).
        - If the object is complex, generate a simplified valid placeholder representation (e.g. a small cube or cylinder with a comment describing the intended object).
        - Ensure safe end G-Code (turn off heaters, motors).
        - OUTPUT ONLY THE RAW G-CODE. No markdown blocks, no explanations.`;

        const result = await model.generateContent(prompt);
        let text = result.response.text();

        // Cleanup Markdown if present
        text = text.replace(/```gcode/g, '').replace(/```/g, '').trim();

        return text;
    }
}
