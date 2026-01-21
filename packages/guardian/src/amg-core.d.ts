/**
 * Apex Guardian Core - AMG Integration
 * Handles threat intelligence, security analysis, and automated responses
 */
import { EventEmitter } from 'events';
export interface SecurityEvent {
    eventId: string;
    timestamp: string;
    type: string;
    source: string;
    sessionId?: string;
    data: any;
    metadata: any;
}
export interface ThreatIntelligenceData {
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    threatTypes: string[];
    indicators: string[];
    recommendations: string[];
    confidence: number;
    source: string;
}
export interface SecurityAnalysis {
    analysisId: string;
    timestamp: string;
    requestData: any;
    threatIntelligence: ThreatIntelligenceData;
    riskAssessment: any;
    responseRecommendations: string[];
    autoActions: string[];
    manualActions: string[];
}
export declare class ApexGuardianCore extends EventEmitter {
    private parent;
    private securityEvents;
    private threatIntelligenceSources;
    private performanceMetrics;
    private tadsEnabled;
    private activeThreats;
    constructor(parent: any);
    initialize(): Promise<void>;
    private initializeThreatIntelligence;
    private registerDefaultThreatSources;
    private startSecurityMonitoring;
    private performSecurityHealthCheck;
    private cleanupExpiredThreats;
    analyzeRequest(req: any): Promise<SecurityAnalysis>;
    assessSecurityImpact(eventType: string, filePath: string): Promise<any>;
    private processThreatIntelligence;
    private analyzeThreatData;
    private generateThreatRecommendations;
    private performRiskAssessment;
    private generateResponseRecommendations;
    private determineActions;
    private executeAutomatedActions;
    private processTADSEvent;
    private mapEventTypeToSeverity;
    private mapThreatLevelToScore;
    private categorizeRisk;
    logSecurityEvent(event: SecurityEvent): void;
    private generateEventId;
    private generateDataHash;
    getEventCount(): number;
    getActiveThreats(): Array<any>;
    exportState(): any;
    importState(state: any): Promise<void>;
}
