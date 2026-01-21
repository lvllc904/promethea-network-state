/**
 * Brain Middleware - Unified Intelligence Request Processing
 * Processes all requests through the Symbiotic Memory Brain system
 */
import { Request, Response, NextFunction } from 'express';
import { UnifiedIntelligence } from './unified-intelligence';
export interface BrainRequest extends Request {
    brainAnalysis?: any;
    securityContext?: any;
    memoryContext?: any;
}
export declare class BrainMiddleware {
    private brain;
    constructor();
    processRequest: (req: BrainRequest, res: Response, next: NextFunction) => Promise<void>;
    validateSecurityContext: (requiredLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL") => (req: BrainRequest, res: Response, next: NextFunction) => void;
    provideMemoryContext: (req: BrainRequest, res: Response, next: NextFunction) => void;
    learnFromResponse: (req: BrainRequest, res: Response, next: NextFunction) => void;
    private shouldSkipBrainProcessing;
    private shouldBlockRequest;
    private blockRequest;
    private addSecurityHeaders;
    getBrain(): UnifiedIntelligence;
}
