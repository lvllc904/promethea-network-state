import 'dotenv/config';
import { UnifiedIntelligence } from './unified-intelligence';
/**
 * The main export of the Guardian package.
 * This allows other services to create an instance of the system's core intelligence.
 */
export { UnifiedIntelligence };
/**
 * Export the middleware for use in Express applications.
 */
export { BrainMiddleware } from './brain-middleware';
// You can also export a singleton instance if desired, which is a common pattern.
const guardianSingleton = UnifiedIntelligence.getInstance();
export { guardianSingleton };
