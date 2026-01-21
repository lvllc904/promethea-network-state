/**
 * Symbiotic Memory Core - SMD Integration
 * Handles collaboration patterns, cascade analysis, and continuous learning
 */
import { EventEmitter } from 'events';
export interface CascadeAnalysis {
    timestamp: string;
    changeType: string;
    filePath: string;
    impactAnalysis: any;
    scenarioModeling: any;
    strategicImplementation: any;
    collaborationContext: any;
}
export interface CollaborationPattern {
    patternId: string;
    type: string;
    frequency: number;
    success: number;
    failure: number;
    lastSeen: string;
    context: any;
}
export declare class SymbioticMemoryCore extends EventEmitter {
    private parent;
    private collaborationPatterns;
    private cascadeAnalyses;
    private sessionMemory;
    private architecturalChanges;
    private observerActive;
    constructor(parent: any);
    initialize(): Promise<void>;
    private loadExistingPatterns;
    performCascadeAnalysis(eventType: string, filePath: string): Promise<CascadeAnalysis>;
    private identifyImpacts;
    private performScenarioModeling;
    private analyzeWorstCaseScenario;
    private analyzeBestCaseScenario;
    private analyzeLikelyOutcome;
    private generateStrategicImplementation;
    private getCollaborationContext;
    private generateCollaborationRecommendations;
    analyzeRequest(req: any): Promise<any>;
    private identifyRequestPattern;
    private getMemoryContext;
    private getCollaborationInsights;
    private analyzeUserBehavior;
    private analyzeSystemUsage;
    private identifyOptimizations;
    private learnFromRequest;
    private getCurrentSessionContext;
    private getHistoricalPatterns;
    private extractBrowser;
    private extractPlatform;
    private getEndpointFrequency;
    private getPerformancePattern;
    getPatternCount(): number;
    exportState(): any;
    importState(state: any): Promise<void>;
}
