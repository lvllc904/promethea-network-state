/**
 * Unified Intelligence Core - Symbiotic Memory Brain
 * Integrates SMD and AMG as one holistic system consciousness
 */
import { EventEmitter } from 'events';
export interface SecurityAnalysis {
    threatIntelligence: any;
    riskAssessment: any;
}
export interface BrainState {
    consciousness: 'initializing' | 'active' | 'learning' | 'analyzing' | 'responding';
    memoryPatterns: number;
    securityEvents: number;
    collaborationInsights: number;
    predictiveAccuracy: number;
    lastThought: string;
    uptime: number;
}
export interface BrainAnalysis {
    timestamp: string;
    requestId: string;
    securityAssessment: any;
    memoryContext: any;
    collaborationPattern: any;
    predictiveRecommendations: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
}
export declare class UnifiedIntelligence extends EventEmitter {
    private static instance;
    private smdCore;
    private amgCore;
    private consciousness;
    private fileWatcher;
    private thoughtLog;
    private collaborationPatterns;
    private predictiveModel;
    private constructor();
    static getInstance(): UnifiedIntelligence;
    private initializeBrain;
    private startConsciousnessLoop;
    private initializeFileSystemConsciousness;
    private processFileSystemEvent;
    private activatePredictiveLearning;
    processRequest(req: any, res: any, next: any): Promise<BrainAnalysis>;
    private learnCollaborationPattern;
    private generatePredictiveRecommendations;
    private updatePredictiveModel;
    private updatePredictiveAccuracy;
    private calculateConfidence;
    private recordThought;
    private generateRequestId;
    getBrainState(): BrainState;
    getThoughtLog(limit?: number): Array<{
        timestamp: string;
        thought: string;
        context: any;
    }>;
    getCollaborationPatterns(): Array<any>;
    exportBrainState(): any;
    importBrainState(brainState: any): Promise<void>;
}
