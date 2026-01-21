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

export class BrainMiddleware {
  private brain: UnifiedIntelligence;

  constructor() {
    this.brain = UnifiedIntelligence.getInstance();
  }

  // Main middleware function that processes all requests through the brain
  public processRequest = async (req: BrainRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Skip brain processing for certain paths to avoid loops
      if (this.shouldSkipBrainProcessing(req.path)) {
        return next();
      }

      // Process request through unified intelligence
      const brainAnalysis = await this.brain.processRequest(req, res, next);
      
      // Attach brain analysis to request for use in route handlers
      req.brainAnalysis = brainAnalysis;
      req.securityContext = brainAnalysis.securityAssessment;
      req.memoryContext = brainAnalysis.memoryContext;

      // Check if request should be blocked based on security analysis
      if (this.shouldBlockRequest(brainAnalysis)) {
        return this.blockRequest(req, res, brainAnalysis);
      }

      // Add security headers based on analysis
      this.addSecurityHeaders(res, brainAnalysis);

      // Continue to route handler
      next();
    } catch (error) {
      console.error('🧠 Brain Middleware Error:', error);
      // Don't block request on brain errors - fail open for availability
      next();
    }
  };

  // Security validation middleware for sensitive operations
  public validateSecurityContext = (requiredLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM') => {
    return (req: BrainRequest, res: Response, next: NextFunction): void => {
      if (!req.brainAnalysis) {
        return res.status(500).json({
          error: 'Security context not available',
          message: 'Request was not processed through brain middleware'
        });
      }

      const riskLevel = req.brainAnalysis.riskLevel;
      const riskLevels = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };

      if (riskLevels[riskLevel] >= riskLevels[requiredLevel]) {
        return res.status(403).json({
          error: 'Security validation failed',
          message: `Request risk level (${riskLevel}) exceeds maximum allowed (${requiredLevel})`,
          securityRecommendations: req.brainAnalysis.predictiveRecommendations
        });
      }

      next();
    };
  };

  // Memory context provider for routes that need historical data
  public provideMemoryContext = (req: BrainRequest, res: Response, next: NextFunction): void => {
    if (req.memoryContext) {
      // Add memory context to response headers for debugging
      res.set('X-Memory-Context', 'available');
      res.set('X-Historical-Patterns', req.memoryContext.historicalPatterns?.length?.toString() || '0');
    }
    next();
  };

  // Collaboration learning middleware
  public learnFromResponse = (req: BrainRequest, res: Response, next: NextFunction): void => {
    // Store original res.json and res.send to capture response
    const originalJson = res.json;
    const originalSend = res.send;

    res.json = function(body: any): Response {
      // Learn from successful API response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Emit learning event to brain
        req.brainAnalysis && req.app?.emit('api_success', {
          request: {
            method: req.method,
            path: req.path,
            brainAnalysis: req.brainAnalysis
          },
          response: {
            statusCode: res.statusCode,
            contentType: res.getHeader('content-type')
          }
        });
      }
      return originalJson.call(this, body);
    };

    res.send = function(body: any): Response {
      // Learn from response patterns
      if (req.brainAnalysis) {
        req.app?.emit('response_pattern_learned', {
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseSize: body?.length || 0,
          brainAnalysis: req.brainAnalysis
        });
      }
      return originalSend.call(this, body);
    };

    next();
  };

  private shouldSkipBrainProcessing(path: string): boolean {
    const skipPaths = [
      '/favicon.ico',
      '/robots.txt',
      '/__vite',
      '/src/',
      '/node_modules/',
      '/public/'
    ];

    return skipPaths.some(skipPath => path.startsWith(skipPath));
  }

  private shouldBlockRequest(brainAnalysis: any): boolean {
    // Block requests with critical risk level
    if (brainAnalysis.riskLevel === 'CRITICAL') {
      return true;
    }

    // Block if confidence is high and risk is high
    if (brainAnalysis.riskLevel === 'HIGH' && brainAnalysis.confidence > 0.8) {
      return true;
    }

    return false;
  }

  private blockRequest(req: BrainRequest, res: Response, brainAnalysis: any): void {
    console.log(`🛡️ Brain Security: Blocking request ${req.method} ${req.path} - Risk: ${brainAnalysis.riskLevel}`);
    
    res.status(403).json({
      error: 'Request blocked by security analysis',
      riskLevel: brainAnalysis.riskLevel,
      threats: brainAnalysis.securityAssessment?.threatIntelligence?.threatTypes || [],
      recommendations: brainAnalysis.predictiveRecommendations,
      requestId: brainAnalysis.requestId,
      timestamp: brainAnalysis.timestamp
    });
  }

  private addSecurityHeaders(res: Response, brainAnalysis: any): void {
    // Add brain-generated security headers
    res.set('X-Brain-Analysis-Id', brainAnalysis.requestId);
    res.set('X-Security-Level', brainAnalysis.riskLevel);
    res.set('X-Brain-Confidence', brainAnalysis.confidence.toString());
    
    // Add security headers based on threat analysis
    if (brainAnalysis.securityAssessment?.threatIntelligence?.threatTypes?.includes('XSS_INJECTION')) {
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('X-Frame-Options', 'DENY');
      res.set('Content-Security-Policy', "default-src 'self'");
    }

    if (brainAnalysis.riskLevel === 'HIGH' || brainAnalysis.riskLevel === 'CRITICAL') {
      res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
  }

  // Method to get brain instance for direct access in routes
  public getBrain(): UnifiedIntelligence {
    return this.brain;
  }
}
